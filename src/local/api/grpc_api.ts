// Copyright (c) 2024, Brandon Lehmann <brandonlehmann@gmail.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import AbortController from 'abort-controller';
import {
    Channel,
    ChannelCredentials,
    Metadata,
    createChannel,
    createClient
} from 'nice-grpc';

import {
    DeepPartial,
    DeviceClient,
    DeviceDefinition
} from '../../protobuf/spacex/api/device/service';

import type {
    Request,
    Response
} from '../../protobuf/spacex/api/device/device';

export namespace GRPCApi {
    /**
     * Fine-grained TLS controls. Use when a custom CA bundle is required
     * (private CA / self-signed) or when certificate verification must be
     * disabled entirely (e.g., a development proxy with an unverifiable cert).
     */
    export type TlsOptions = {
        /** PEM-encoded root certificate bundle. Defaults to the system trust store. */
        rootCerts?: Buffer;
        /** When false, both rejectUnauthorized and hostname verification are bypassed. Defaults to true. */
        rejectUnauthorized?: boolean;
    };

    /**
     * Construction options for the local gRPC clients (Dishy, WiFiRouter).
     */
    export type Options = {
        /** Target host. Subclasses provide a sensible LAN default. */
        host?: string;
        /** Target port. Subclasses provide a sensible LAN default. */
        port?: number;
        /** Per-call timeout in milliseconds. */
        timeout?: number;
        /**
         * Enable TLS to reach the device through a reverse proxy.
         * `true` uses the system trust store with strict hostname verification.
         * An object enables TLS and lets the caller supply a custom CA bundle
         * and/or disable verification.
         */
        tls?: boolean | TlsOptions;
        /**
         * Additional headers attached to every gRPC call. Useful when the
         * device is reached through a reverse proxy that requires an API key.
         */
        headers?: Record<string, string>;
    };
}

const resolveCredentials = (tls: GRPCApi.Options['tls']): ChannelCredentials => {
    if (!tls) {
        return ChannelCredentials.createInsecure();
    }

    if (tls === true) {
        return ChannelCredentials.createSsl();
    }

    const verifyOptions = tls.rejectUnauthorized === false
        ? {
            rejectUnauthorized: false,
            // Hostname verification has to be explicitly bypassed; rejectUnauthorized alone
            // does not suppress the SAN/CN check on every code path.
            checkServerIdentity: () => undefined
        }
        : undefined;

    return ChannelCredentials.createSsl(
        tls.rootCerts ?? null,
        null,
        null,
        verifyOptions
    );
};

export abstract class GRPCApi {
    public readonly host: string;
    public readonly port: number;
    public readonly timeout?: number;

    protected client: DeviceClient;
    private readonly channel: Channel;

    protected constructor (options: GRPCApi.Options & { host: string; port: number }) {
        this.host = options.host;
        this.port = options.port;
        this.timeout = options.timeout;

        const credentials = resolveCredentials(options.tls);
        const scheme = options.tls ? 'https' : 'http';
        const address = `${scheme}://${options.host}:${options.port}`;

        this.channel = createChannel(address, credentials);

        const defaultMetadata = (options.headers && Object.keys(options.headers).length > 0)
            ? Metadata(options.headers)
            : undefined;

        this.client = createClient(
            DeviceDefinition,
            this.channel,
            defaultMetadata ? { '*': { metadata: defaultMetadata } } : undefined
        );
    }

    /**
     * Closes the underlying gRPC channel and releases resources
     */
    public close (): void {
        this.channel.close();
    }

    /**
     * Performs a handle request against the GRPC server
     *
     * @param request
     * @param timeout
     * @protected
     */
    protected async handle (
        request: DeepPartial<Request>,
        timeout = this.timeout
    ): Promise<Response> {
        const controller = new AbortController();
        let _timeout: NodeJS.Timeout | undefined;

        if (timeout) {
            _timeout = setTimeout(
                () => controller.abort(),
                timeout
            );
        }

        const response = await this.client.handle(
            request,
            { signal: controller.signal as AbortSignal }
        );

        if (_timeout) {
            clearTimeout(_timeout);
        }

        return response;
    }

    /**
     * Sends `request` and returns `response[field]`, throwing if the named response
     * variant is absent. `noun` is interpolated into the error message
     */
    protected async fetch_or_throw<K extends keyof Response> (
        request: DeepPartial<Request>,
        field: K,
        noun: string
    ): Promise<NonNullable<Response[K]>> {
        const response = await this.handle(request);

        if (!response[field]) {
            throw new Error(`No ${noun} returned from ${this.host}:${this.port}`);
        }

        return response[field] as NonNullable<Response[K]>;
    }

    /**
     * Sends `request` and returns true on success, false on any thrown error
     */
    protected async try_handle (request: DeepPartial<Request>): Promise<boolean> {
        try {
            await this.handle(request);

            return true;
        } catch {
            return false;
        }
    }
}

export default GRPCApi;
export {
    DeviceClient,
    DeviceDefinition
};
