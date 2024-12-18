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

export default abstract class GRPCApi {
    protected client: DeviceClient;

    protected constructor (
        public readonly host: string,
        public readonly port: number,
        public readonly timeout?: number
    ) {
        const channel = createChannel(`${host}:${port}`);

        this.client = createClient(
            DeviceDefinition,
            channel
        );
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
}

export {
    DeviceClient,
    DeviceDefinition,
    GRPCApi
};
