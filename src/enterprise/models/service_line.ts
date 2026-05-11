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
import Account from './account';

import type { UserTerminal } from './user_terminal';

export default class ServiceLine extends BaseAPI {
    private nickname_updated = false;

    private product_updated = false;

    private public_ip_updated = false;

    constructor (
        client_id: string,
        client_secret: string,
        private serviceLine: Starlink.Management.Response.ServiceLine
    ) {
        super(
            client_id,
            client_secret
        );
    }

    /**
     * Adds the specified terminal to this service line
     *
     * @param terminalOrId
     */
    public async add_terminal (
        terminalOrId: string | UserTerminal
    ): Promise<boolean> {
        try {
            const deviceId = typeof terminalOrId === 'string'
                ? terminalOrId
                : terminalOrId.userTerminalId;

            await this.post(
                `/v2/service-lines/${this.serviceLineNumber}/user-terminals`,
                { deviceId }
            );

            return true;
        } catch {
            return false;
        }
    }

    /**
     * Fetches data usage for this service line via the v2 data-usage query endpoint.
     *
     * v2 does not expose the per-day data-usage bin breakdown that v1 returned. The response
     * is the same shape used by `Account.fetch_realtime_data_tracking()`: billing cycles with
     * per-day GB totals.
     */
    public async fetch_daily_usage (): Promise<Starlink.Management.Response.RealtimeDataTracking> {
        const records = await this.paginate<Starlink.Management.APIResponse.RealtimeDataTracking>(
            'POST',
            '/v2/data-usage/query',
            { body: { serviceLineNumbers: [this.serviceLineNumber] } }
        );

        const record = records.find(r => r.serviceLineNumber === this.serviceLineNumber);

        if (!record) {
            throw new Error(`No data-usage record returned for service line ${this.serviceLineNumber}`);
        }

        return Account.transformRealtimeDataTracking(record);
    }

    /**
     * Fetches all historical partial subscription periods by asset for the last 1 month(s) plus the current cycle.
     * Does not include the incomplete period corresponding to the service line's current product
     */
    public async fetch_partial_periods (): Promise<{
        periodEnd: Date;
        periodStart: Date;
        productReferenceId: string;
    }[]> {
        const response = await this.get<Starlink.Common.Content<{
            periodEnd: string;
            periodStart: string;
            productReferenceId: string;
        }[]>>(
            `/v2/service-lines/${this.serviceLineNumber}/billing-cycles/partial-periods`
        );

        return response.content.map(record => {
            return {
                ...record,
                periodEnd: new Date(record.periodEnd),
                periodStart: new Date(record.periodStart)
            };
        });
    }

    /**
     * Opt into product for subscription
     */
    public async opt_in (): Promise<Starlink.Management.Response.OptInProduct> {
        const response = await this.post<Starlink.Common.Content<Starlink.Management.APIResponse.OptInProduct>>(
            `/v2/service-lines/${this.serviceLineNumber}/data/opt-in`
        );

        const record = response.content;

        return {
            ...record,
            activatedDate: new Date(record.activatedDate),
            deactivatedDate: record.deactivatedDate !== null ? new Date(record.deactivatedDate) : null
        };
    }

    /**
     * Opt out of product for subscription
     */
    public async opt_out (): Promise<Starlink.Management.Response.OptInProduct> {
        const response = await this.post<Starlink.Common.Content<Starlink.Management.APIResponse.OptInProduct>>(
            `/v2/service-lines/${this.serviceLineNumber}/data/opt-out`
        );

        const record = response.content;

        return {
            ...record,
            activatedDate: new Date(record.activatedDate),
            deactivatedDate: record.deactivatedDate !== null ? new Date(record.deactivatedDate) : null
        };
    }

    /**
     * Removes the specified terminal from this service line
     *
     * @param terminalOrId
     */
    public async remove_terminal (
        terminalOrId: string | UserTerminal
    ): Promise<boolean> {
        try {
            const deviceId = typeof terminalOrId === 'string'
                ? terminalOrId
                : terminalOrId.userTerminalId;

            await this.delete(
                `/v2/service-lines/${this.serviceLineNumber}/user-terminals/${deviceId}`
            );

            return true;
        } catch {
            return false;
        }
    }

    /**
     * Attempts to save any changes to the `nickname`, `productReferenceId`, or `publicIp`
     */
    public async save (): Promise<boolean> {
        let response: Starlink.Common.Content<Starlink.Management.APIResponse.ServiceLine> | undefined;

        if (this.nickname_updated) {
            try {
                response = await this.put<Starlink.Common.Content<Starlink.Management.APIResponse.ServiceLine>>(
                    `/v2/service-lines/${this.serviceLineNumber}/nickname`,
                    { nickname: this.nickname }
                );

                this.nickname_updated = false;
            } catch {
                return false;
            }
        }

        if (this.product_updated) {
            try {
                response = await this.put<Starlink.Common.Content<Starlink.Management.APIResponse.ServiceLine>>(
                    `/v2/service-lines/${this.serviceLineNumber}/product`,
                    { productReferenceId: this.productReferenceId }
                );

                this.product_updated = false;
            } catch {
                return false;
            }
        }

        if (this.public_ip_updated) {
            try {
                response = await this.put<Starlink.Common.Content<Starlink.Management.APIResponse.ServiceLine>>(
                    `/v2/service-lines/${this.serviceLineNumber}/public-ip`,
                    { publicIp: this.publicIp }
                );

                this.public_ip_updated = false;
            } catch {
                return false;
            }
        }

        if (response) {
            const record = response.content;

            this.serviceLine = {
                ...response.content,
                accountNumber: this.accountNumber,
                endDate: record.endDate !== null ? new Date(record.endDate) : null,
                startDate: record.startDate !== null ? new Date(record.startDate) : null
            };

            return true;
        }

        return false;
    }

    /**
     * Converts the instance to a string (JSON encoded)
     */
    public toString (): string {
        return JSON.stringify(this.serviceLine);
    }

    public get object (): Starlink.Management.Response.ServiceLine {
        return this.serviceLine;
    }

    public get accountNumber (): string {
        return this.serviceLine.accountNumber;
    }

    public get active (): boolean {
        return this.serviceLine.active;
    }

    public get addressReferenceId (): string {
        return this.serviceLine.addressReferenceId;
    }

    public get aviationMetadata (): Starlink.Management.Components.AviationMetadata | null {
        return this.serviceLine.aviationMetadata;
    }

    public get delayedProductId (): string | null {
        return this.serviceLine.delayedProductId;
    }

    public get endDate (): Date | null {
        return this.serviceLine.endDate;
    }

    public get nickname (): string | null {
        return this.serviceLine.nickname;
    }

    public set nickname (value: string) {
        if (value !== this.nickname) {
            this.nickname_updated = true;
        }

        this.serviceLine.nickname = value;
    }

    public get optInProductId (): string | null {
        return this.serviceLine.optInProductId;
    }

    public get productReferenceId (): string {
        return this.serviceLine.productReferenceId;
    }

    public set productReferenceId (value: string) {
        if (value !== this.productReferenceId) {
            this.product_updated = true;
        }

        this.serviceLine.productReferenceId = value;
    }

    public get publicIp (): boolean {
        return this.serviceLine.publicIp;
    }

    public set publicIp (value: boolean) {
        if (value !== this.publicIp) {
            this.public_ip_updated = true;
        }

        this.serviceLine.publicIp = value;
    }

    public get serviceLineNumber (): string {
        return this.serviceLine.serviceLineNumber;
    }

    public get startDate (): Date | null {
        return this.serviceLine.startDate;
    }
}

export { ServiceLine };
