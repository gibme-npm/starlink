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
     * Fetches the account associated with the authenticated v2 service account.
     *
     * v2 service accounts are scoped to a single Starlink account, so this returns an
     * array of one. The array shape is preserved so existing consumer code continues
     * to work.
     */
    public async fetch_accounts (): Promise<Account[]> {
        const response = await this.get<Starlink.Common.Content<Starlink.Management.APIResponse.Account>>(
            '/v2/account'
        );

        return [new Account(
            this.client_id,
            this.client_secret,
            response.content
        )];
    }
}

export { StarlinkAPI };
