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

import BaseAPI, { Starlink } from '../api/base_api';

export default class Router extends BaseAPI {
    constructor (
        client_id: string,
        client_secret: string,
        private router: Starlink.Management.Response.Router
    ) {
        super(
            client_id,
            client_secret
        );
    }

    /**
     * Assign a configuration to the router
     *
     * @param configId
     */
    public async assign_config (configId: string): Promise<boolean> {
        try {
            await this.put(
                `/enterprise/v1/account/${this.accountNumber}/routers/${this.routerId}/config`,
                configId
            );

            this.router.configId = configId;

            return true;
        } catch {
            return false;
        }
    }

    /**
     * Remove the configuration assignment of the router
     */
    public async remove_config (): Promise<boolean> {
        try {
            await this.delete(
                `/enterprise/v1/account/${this.accountNumber}/routers/${this.routerId}/config`
            );

            return true;
        } catch {
            return false;
        }
    }

    /**
     * Converts the instance to a string (JSON encoded)
     */
    public toString (): string {
        return JSON.stringify(this.router);
    }

    public get accountNumber (): string {
        return this.router.accountNumber;
    }

    public get configId (): string {
        return this.router.configId;
    }

    public get directLinkToDish (): boolean {
        return this.router.directLinkToDish;
    }

    public get hardwareVersion (): string {
        return this.router.hardwareVersion;
    }

    public get routerId (): string {
        return this.router.routerId;
    }

    public get userTerminalId (): string {
        return this.router.userTerminalId;
    }
}

export { Router };
