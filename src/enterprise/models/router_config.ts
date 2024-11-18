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

export default class RouterConfig extends BaseAPI {
    constructor (
        client_id: string,
        client_secret: string,
        private routerConfig: Starlink.Management.Response.RouterConfig
    ) {
        super(client_id, client_secret);
    }

    public get accountNumber (): string {
        return this.routerConfig.accountNumber;
    }

    public get config (): any {
        return this.routerConfig.routerConfig;
    }

    public set config (value: any) {
        this.routerConfig.routerConfig = value;
    }

    public get configId (): string {
        return this.routerConfig.configId;
    }

    public get nickname (): string {
        return this.routerConfig.nickname;
    }

    public set nickname (value: string) {
        this.routerConfig.nickname = value;
    }

    /**
     * Update the router configuration
     *
     * Any router assigned to this configuration will immediately receive the updated if they are online.
     * If it is not online, the router will receive the update when it comes online.
     */
    public async save (): Promise<boolean> {
        try {
            const response = await this.put<Starlink.Common.Content<Starlink.Management.APIResponse.RouterConfig>>(
                `/enterprise/v1/account/${this.accountNumber}/routers/configs/${this.configId}`, {
                    nickname: this.nickname,
                    routerConfigJson: JSON.stringify(this.config)
                });

            const {
                routerConfigJson,
                ...content
            } = response.content;
            const routerConfig = JSON.parse(routerConfigJson);

            this.routerConfig = {
                ...content,
                routerConfig
            };

            return true;
        } catch {
            return false;
        }
    }

    /**
     * Converts the instance to a string (JSON encoded)
     */
    public toString (): string {
        return JSON.stringify(this.routerConfig);
    }
}

export { RouterConfig };
