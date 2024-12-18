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

import BaseAPI, { Starlink } from './api/base_api';
import Account from './models/account';

export { Starlink };
export { Account } from './models/account';
export { Router } from './models/router';
export { RouterConfig } from './models/router_config';
export { ServiceLine } from './models/service_line';
export { UserTerminal } from './models/user_terminal';

export default class StarlinkAPI extends BaseAPI {
    /**
     * Fetches accounts of the current authenticated user
     *
     * @param options
     */
    public async fetch_accounts (
        options: Partial<{
            /**
             * If set to true, fetches all pages automatically
             * Must set to false for `limit` and `page` to be honored
             *
             * @default true
             */
            all: boolean;
            /**
             * The number of accounts to return at a time
             *
             * @default 50
             */
            limit: number;
            /**
             * The index of the page, starting at 0
             *
             * @default 0
             */
            page: number;
            /**
             * The region code of the account
             */
            regionCode: string[];
        }> = {
            all: true,
            limit: 50,
            page: 0,
            regionCode: []
        }
    ): Promise<Account[]> {
        options.limit ??= 50;
        options.page ??= 0;
        options.all ??= true;
        let response: Starlink.Common.PagedContent<Starlink.Management.APIResponse.Account[]>;

        if (!options.all) {
            response = await this.get(
                '/enterprise/v1/accounts',
                options
            );

            return response.content.results.map(account => new Account(
                this.client_id,
                this.client_secret,
                account
            ));
        } else {
            const results: Account[] = [];
            let page = 0;

            do {
                response = await this.get(
                    '/enterprise/v1/accounts',
                    {
                        ...options,
                        limit: 100,
                        page: page++
                    }
                );

                results.push(...response.content.results.map(account => new Account(
                    this.client_id,
                    this.client_secret,
                    account
                )));
            } while (!response.content.isLastPage);

            if (results.length !== response.content.totalCount) {
                throw new Error('Could not fetch all results');
            }

            return results;
        }
    }
}

export { StarlinkAPI };
