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
import Router from './router';

import type { ServiceLine } from './service_line';

export default class UserTerminal extends BaseAPI {
    constructor (
        client_id: string,
        client_secret: string,
        private userTerminal: Starlink.Management.Response.UserTerminal
    ) {
        super(
            client_id,
            client_secret
        );
    }

    /**
     * Adds the terminal to the service line specified
     *
     * @param serviceLineOrNumber
     */
    public async add_to_service_line (
        serviceLineOrNumber: ServiceLine | string
    ): Promise<boolean> {
        try {
            let url = `/enterprise/v1/account/${this.accountNumber}/user-terminals/${this.userTerminalId}/`;

            if (typeof serviceLineOrNumber === 'string') {
                url += serviceLineOrNumber;
            } else {
                url += serviceLineOrNumber.serviceLineNumber;
            }

            await this.post(url);

            this.userTerminal.serviceLineNumber = typeof serviceLineOrNumber === 'string'
                ? serviceLineOrNumber
                : serviceLineOrNumber.serviceLineNumber;

            return true;
        } catch {
            return false;
        }
    }

    /**
     * Removes the terminal from it's assigned service line
     */
    public async remove_from_service_line (): Promise<boolean> {
        try {
            await this.delete(
                `/enterprise/v1/account/${this.accountNumber}`
                + `/user-terminals/${this.userTerminalId}/${this.serviceLineNumber}`
            );

            this.userTerminal.serviceLineNumber = null;

            return true;
        } catch {
            return false;
        }
    }

    /**
     * Converts the instance to a string (JSON encoded)
     */
    public toString (): string {
        return JSON.stringify(this.userTerminal);
    }

    public get accountNumber (): string {
        return this.userTerminal.accountNumber;
    }

    public get active (): boolean {
        return this.userTerminal.active;
    }

    public get dishSerialNumber (): string {
        return this.userTerminal.dishSerialNumber;
    }

    public get kitSerialNumber (): string {
        return this.userTerminal.kitSerialNumber;
    }

    public get routers (): Router[] {
        return this.userTerminal.routers.map(router => new Router(
            this.client_id,
            this.client_secret,
            router
        ));
    }

    public get serviceLineNumber (): string | null {
        return this.userTerminal.serviceLineNumber;
    }

    public get userTerminalId (): string {
        return this.userTerminal.userTerminalId;
    }
}

export { UserTerminal };
