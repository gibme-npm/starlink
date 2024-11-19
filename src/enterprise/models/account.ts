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
import RouterConfig from './router_config';
import ServiceLine from './service_line';

export default class Account extends BaseAPI {
    constructor (
        client_id: string,
        client_secret: string,
        private account: Starlink.Management.Response.Account
    ) {
        super(client_id, client_secret);
    }

    /**
     * The name of the account
     */
    public get accountName (): string | undefined {
        return this.account.accountName || undefined;
    }

    /**
     * The Account Number. Example: ACC-511274-31364-54
     */
    public get accountNumber (): string {
        return this.account.accountNumber;
    }

    /**
     * Default router config on the account
     */
    public get defaultRouterConfigId (): string | undefined {
        return this.account.defaultRouterConfigId || undefined;
    }

    /**
     * The region code of the account. Example: US
     */
    public get regionCode (): string {
        return this.account.regionCode;
    }

    /**
     * Adds a user terminal to the account
     *
     * @param deviceId UTID, kit serial number, or dish serial number.
     */
    public async add_user_terminal (
        deviceId: string
    ): Promise<boolean> {
        try {
            await this.post(`/enterprise/v1/account/${this.accountNumber}/user-terminals/${deviceId}`);

            return true;
        } catch {
            return false;
        }
    }

    /**
     * Checks the available capacity for the given latitude and longitude
     *
     * @param latitude
     * @param longitude
     */
    public async check_capacity (
        latitude: number,
        longitude: number
    ): Promise<number> {
        const response = await this.post<Starlink.Common.Content<{
            availableCapacity: number
        }>>(`/enterprise/v1/account/${this.accountNumber}/addresses/check-capacity`,
            { latitude, longitude });

        return response.content.availableCapacity;
    }

    /**
     * Create an address within the account
     *
     * @param address
     */
    public async create_address (
        address: Starlink.Management.Request.CreateAddress
    ): Promise<Starlink.Management.Response.Address> {
        const response = await this.post<Starlink.Common.Content<Starlink.Management.APIResponse.Address>>(
            `/enterprise/v1/account/${this.accountNumber}/addresses`,
            address);

        return response.content;
    }

    /**
     * Creates a new router configuration on the account
     *
     * @param nickname
     * @param routerConfig
     */
    public async create_router_config (
        nickname: string,
        routerConfig: any
    ): Promise<RouterConfig> {
        const response = await this.post<Starlink.Common.Content<Starlink.Management.APIResponse.RouterConfig>>(
            `/enterprise/v1/account/${this.accountNumber}/routers/configs`,
            {
                nickname,
                routerConfigJson: JSON.stringify(routerConfig)
            });

        const {
            routerConfigJson,
            ...content
        } = response.content;
        const _routerConfig = JSON.parse(routerConfigJson);

        return new RouterConfig(
            this.client_id,
            this.client_secret,
            {
                ...content,
                routerConfig: _routerConfig
            }
        );
    }

    /**
     * Creates a new service line
     *
     * @param addressReferenceId Address Reference ID to associate with the service line.
     * @param productReferenceId Subscription Product ID to associate with the service line.
     */
    public async create_service_line (
        addressReferenceId: string,
        productReferenceId: string
    ): Promise<ServiceLine> {
        const response = await this.post<Starlink.Common.Content<Starlink.Management.APIResponse.ServiceLine>>(
            `/enterprise/v1/account/${this.accountNumber}/service-lines`,
            {
                addressReferenceId,
                productReferenceId
            });

        const record = response.content;

        return new ServiceLine(this.client_id, this.client_secret, {
            ...record,
            accountNumber: this.accountNumber,
            startDate: record.startDate !== null ? new Date(record.startDate) : null,
            endDate: record.endDate !== null ? new Date(record.endDate) : null
        });
    }

    /**
     * Fetches an address by its reference ID
     *
     * @param addressReferenceId
     */
    public async fetch_address (
        addressReferenceId: string
    ): Promise<Starlink.Management.Response.Address> {
        const response = await this.get<Starlink.Common.Content<Starlink.Management.APIResponse.Address>>(
            `/enterprise/v1/account/${this.accountNumber}/addresses/${addressReferenceId}`);

        return response.content;
    }

    /**
     * Fetches all the addresses listed on the account
     *
     * @param options
     */
    public async fetch_addresses (
        options: Partial<{
            /**
             * Filter by a specific set of Address Reference IDs
             */
            addressIds: string[];
            /**
             * Filter by metadata
             */
            metadata: string;
            /**
             * The number of addresses to return at a time
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
             * If set to true, fetches all pages automatically
             * Must set to false for `limit` and `page` to be honored
             *
             * @default true
             */
            all: boolean;
        }> = { limit: 50, page: 0, all: true }
    ): Promise<Starlink.Management.Response.Address[]> {
        options.limit ??= 50;
        options.page ??= 0;
        options.all ??= true;
        let response: Starlink.Common.PagedContent<Starlink.Management.APIResponse.Address[]>;

        if (!options.all) {
            response = await this.get(
                `/enterprise/v1/account/${this.accountNumber}/addresses`, options);

            return response.content.results;
        } else {
            const results: Starlink.Management.Response.Address[] = [];
            let page = 0;

            do {
                response = await this.get(
                    `/enterprise/v1/account/${this.accountNumber}/addresses`, {
                        ...options,
                        page: page++,
                        limit: 100
                    });

                results.push(...response.content.results);
            } while (!response.content.isLastPage);

            if (results.length !== response.content.totalCount) {
                throw new Error('Could not fetch all results');
            }

            return results;
        }
    }

    /**
     * Fetches realtime data tracking information for the service lines under this account
     *
     * @param options
     */
    public async fetch_realtime_data_tracking (
        options: Partial<{
            serviceLinesFilter: string[];
            previousBillingCycles: number;
            queryStartDateParam: string;
            /**
             * The number of accounts to return at a time
             *
             * @default 500
             */
            limit: number;
            /**
             * The index of the page, starting at 0
             *
             * @default 0
             */
            page: number;
            /**
             * If set to true, fetches all pages automatically
             * Must set to false for `limit` and `page` to be honored
             *
             * @default true
             */
            all: boolean;
        }> = { limit: 500, page: 0, all: true }
    ): Promise<Starlink.Management.Response.RealtimeDataTracking[]> {
        options.limit ??= 500;
        options.page ??= 0;
        options.all ??= true;
        let response:
            Starlink.Common.PagedContent<Starlink.Management.APIResponse.RealtimeDataTracking[]>;

        if (!options.all) {
            response = await this.post(
                `/enterprise/v1/accounts/${this.accountNumber}/billing-cycles/query`,
                {
                    ...options,
                    pageIndex: options.page,
                    pageLimit: options.limit
                });

            return response.content.results.map(record =>
                this.transformRealtimeDataTracking(record));
        } else {
            const results: Starlink.Management.Response.RealtimeDataTracking[] = [];
            let pageIndex = 0;

            do {
                response = await this.post(
                    `/enterprise/v1/accounts/${this.accountNumber}/billing-cycles/query`,
                    {
                        ...options,
                        pageIndex: pageIndex++,
                        pageLimit: 500
                    });

                results.push(...response.content.results.map(record =>
                    this.transformRealtimeDataTracking(record)));
            } while (!response.content.isLastPage);

            if (results.length !== response.content.totalCount) {
                throw new Error('Could not fetch all results');
            }

            return results;
        }
    }

    /**
     * Fetches a router
     *
     * @param routerId
     */
    public async fetch_router (routerId: string): Promise<Router> {
        const response = await this.get<Starlink.Common.Content<Starlink.Management.APIResponse.Router>>(
            `/enterprise/v1/account/${this.accountNumber}/routers/${routerId}`);

        return new Router(this.client_id, this.client_secret, response.content);
    }

    /**
     * Fetches the router configuration specified
     *
     * @param configId
     */
    public async fetch_router_config (configId: string): Promise<RouterConfig> {
        const response = await this.get<Starlink.Common.Content<Starlink.Management.APIResponse.RouterConfig>>(
            `/enterprise/v1/account/${this.accountNumber}/routers/configs/${configId}`);

        const {
            routerConfigJson,
            ...content
        } = response.content;
        const routerConfig = JSON.parse(routerConfigJson);

        return new RouterConfig(
            this.client_id,
            this.client_secret,
            {
                ...content,
                routerConfig
            }
        );
    }

    /**
     * Fetches all router configs on the account
     *
     * @param options
     */
    public async fetch_router_configs (
        options: Partial<{
            /**
             * The index of the page, starting at 0
             *
             * @default 0
             */
            page: number;
            /**
             * If set to true, fetches all pages automatically
             * Must set to false `page` to be honored
             *
             * @default true
             */
            all: boolean;
        }> = { page: 0, all: true }
    ): Promise<RouterConfig[]> {
        options.page ??= 0;
        options.all ??= true;
        let response: Starlink.Common.PagedContent<Starlink.Management.APIResponse.RouterConfig[]>;

        if (!options.all) {
            response = await this.get(
                `/enterprise/v1/account/${this.accountNumber}/routers/configs`, options);

            return response.content.results.map(record => {
                const {
                    routerConfigJson,
                    ...rest
                } = record;
                const routerConfig = JSON.parse(routerConfigJson);

                return new RouterConfig(
                    this.client_id,
                    this.client_secret,
                    {
                        ...rest,
                        routerConfig
                    }
                );
            });
        } else {
            const results: RouterConfig[] = [];
            let page = 0;

            do {
                response = await this.get(
                    `/enterprise/v1/account/${this.accountNumber}/routers/configs`, {
                        page: page++
                    });

                results.push(...response.content.results.map(record => {
                    const {
                        routerConfigJson,
                        ...rest
                    } = record;
                    const routerConfig = JSON.parse(routerConfigJson);

                    return new RouterConfig(
                        this.client_id,
                        this.client_secret,
                        {
                            ...rest,
                            routerConfig
                        }
                    );
                }));
            } while (!response.content.isLastPage);

            if (results.length !== response.content.totalCount) {
                throw new Error('Could not fetch all results');
            }

            return results;
        }
    }

    /**
     * Fetches a service line in the account
     *
     * @param serviceLineNumber The Service Line Number for the service line
     */
    public async fetch_service_line (serviceLineNumber: string): Promise<ServiceLine> {
        const response = await this.get<Starlink.Common.Content<Starlink.Management.APIResponse.ServiceLine>>(
            `/enterprise/v1/account/${this.accountNumber}/service-lines/${serviceLineNumber}`);

        const record = response.content;

        return new ServiceLine(this.client_id, this.client_secret, {
            ...record,
            accountNumber: this.accountNumber,
            startDate: record.startDate !== null ? new Date(record.startDate) : null,
            endDate: record.endDate !== null ? new Date(record.endDate) : null
        });
    }

    /**
     * Fetch the services lines in the account
     *
     * @param options
     */
    public async fetch_service_lines (
        options: Partial<{
            /**
             * Filter by an Address Reference ID
             */
            addressReferenceId: string;
            /**
             * Filter by partial match of UT ID, serial number, or kit serial number
             */
            searchString: string;
            /**
             * Sort the paginated results by created date
             */
            orderByCreatedDateDescending: boolean
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
             * If set to true, fetches all pages automatically
             * Must set to false for `limit` and `page` to be honored
             *
             * @default true
             */
            all: boolean;
        }> = { limit: 50, page: 0, all: true }
    ): Promise<ServiceLine[]> {
        options.limit ??= 50;
        options.page ??= 0;
        options.all ??= true;
        let response: Starlink.Common.PagedContent<Starlink.Management.APIResponse.ServiceLine[]>;

        if (!options.all) {
            response = await this.get(`/enterprise/v1/account/${this.accountNumber}/service-lines`, options);

            return response.content.results.map(record =>
                new ServiceLine(this.client_id, this.client_secret, {
                    ...record,
                    accountNumber: this.accountNumber,
                    startDate: record.startDate !== null ? new Date(record.startDate) : null,
                    endDate: record.endDate !== null ? new Date(record.endDate) : null
                }));
        } else {
            const results: ServiceLine[] = [];
            let page = 0;

            do {
                response = await this.get(
                    `/enterprise/v1/account/${this.accountNumber}/service-lines`, {
                        ...options,
                        page: page++,
                        limit: 100
                    });

                results.push(...response.content.results.map(record =>
                    new ServiceLine(this.client_id, this.client_secret, {
                        ...record,
                        accountNumber: this.accountNumber,
                        startDate: record.startDate !== null ? new Date(record.startDate) : null,
                        endDate: record.endDate !== null ? new Date(record.endDate) : null
                    })));
            } while (!response.content.isLastPage);

            if (results.length !== response.content.totalCount) {
                throw new Error('Could not fetch all results');
            }

            return results;
        }
    }

    /**
     * Fetch a subscription by reference ID
     *
     * @param subscriptionReferenceId
     */
    public async fetch_subscription (
        subscriptionReferenceId: string
    ): Promise<Starlink.Management.Response.Subscription> {
        const response = await this.get<Starlink.Common.Content<Starlink.Management.APIResponse.Subscription>>(
            `/enterprise/v1/account/${this.accountNumber}/subscriptions/${subscriptionReferenceId}`);

        return this.transformSubscription(response.content);
    }

    /**
     * Fetch the subscriptions for the account
     *
     * @param options
     */
    public async fetch_subscriptions (
        options: Partial<{
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
             * If set to true, fetches all pages automatically
             * Must set to false for `limit` and `page` to be honored
             *
             * @default true
             */
            all: boolean;
        }> = { limit: 50, page: 0, all: true }
    ): Promise<Starlink.Management.Response.Subscription[]> {
        options.limit ??= 50;
        options.page ??= 0;
        options.all ??= true;
        let response: Starlink.Common.PagedContent<Starlink.Management.APIResponse.Subscription[]>;

        if (!options.all) {
            response = await this.get(
                `/enterprise/v1/account/${this.accountNumber}/subscriptions`, options);

            return response.content.results.map(record =>
                this.transformSubscription(record));
        } else {
            const results: Starlink.Management.Response.Subscription[] = [];
            let page = 0;

            do {
                response = await this.get(
                    `/enterprise/v1/account/${this.accountNumber}/subscriptions`, {
                        page: page++,
                        limit: 50
                    });

                results.push(...response.content.results.map(record =>
                    this.transformSubscription(record)));
            } while (!response.content.isLastPage);

            if (results.length !== response.content.totalCount) {
                throw new Error('Could not fetch all results');
            }

            return results;
        }
    }

    /**
     * Fetch available subscription products
     *
     * @param options
     */
    public async fetch_subscription_products (
        options: Partial<{
            /**
             * Optional filter to return only the products from the matching line ID
             */
            lineId: string;
            /**
             * Optional filter to return only lines that are active (start date in the past,
             * end date null or in the future)
             */
            activeLines: boolean;
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
             * If set to true, fetches all pages automatically
             * Must set to false for `limit` and `page` to be honored
             *
             * @default true
             */
            all: boolean;
        }> = { limit: 50, page: 0, all: true }
    ): Promise<Starlink.Management.Response.SubscriptionProduct[]> {
        options.limit ??= 50;
        options.page ??= 0;
        options.all ??= true;
        let response: Starlink.Common.PagedContent<Starlink.Management.APIResponse.SubscriptionProduct[]>;

        if (!options.all) {
            response = await this.get(
                `/enterprise/v1/account/${this.accountNumber}/subscriptions/available-products`,
                options);

            return response.content.results;
        } else {
            const results: Starlink.Management.Response.SubscriptionProduct[] = [];
            let page = 0;

            do {
                response = await this.get(
                    `/enterprise/v1/account/${this.accountNumber}/subscriptions/available-products`,
                    {
                        ...options,
                        page: page++,
                        limit: 50
                    });

                results.push(...response.content.results);
            } while (!response.content.isLastPage);

            if (results.length !== response.content.totalCount) {
                throw new Error('Could not fetch all results');
            }

            return results;
        }
    }

    /**
     * Fetches the user terminals for an account
     *
     * @param options
     */
    public async fetch_user_terminals (
        options: Partial<{
            /**
             * Filter by a set of service line numbers
             */
            serviceLineNumbers: string[];
            /**
             * Filter by a set of user terminal IDs
             */
            userTerminalIds: string[];
            /**
             * Filter by user terminals with or without a services lines. Omitting this will return both sets
             */
            hasServiceLine: boolean;
            /**
             * Only return UTs that are active on this account
             */
            active: boolean;
            /**
             * Filter by partial match of UT ID, serial number, or kit serial number
             */
            searchString: string;
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
             * If set to true, fetches all pages automatically
             * Must set to false for `limit` and `page` to be honored
             *
             * @default true
             */
            all: boolean;
        }> = { limit: 50, page: 0, all: true }
    ): Promise<Starlink.Management.Response.UserTerminal[]> {
        options.limit ??= 50;
        options.page ??= 0;
        options.all ??= true;
        let response: Starlink.Common.PagedContent<Starlink.Management.APIResponse.UserTerminal[]>;

        if (!options.all) {
            response = await this.get(
                `/enterprise/v1/account/${this.accountNumber}/user-terminals`,
                options);

            return response.content.results.map(record => {
                return {
                    ...record,
                    accountNumber: this.accountNumber
                };
            });
        } else {
            const results: Starlink.Management.Response.UserTerminal[] = [];
            let page = 0;

            do {
                response = await this.get(
                    `/enterprise/v1/account/${this.accountNumber}/user-terminals`, {
                        ...options,
                        page: page++,
                        limit: 100
                    });

                results.push(...response.content.results.map(record => {
                    return {
                        ...record,
                        accountNumber: this.accountNumber
                    };
                }));
            } while (!response.content.isLastPage);

            if (results.length !== response.content.totalCount) {
                throw new Error('Could not fetch all results');
            }

            return results;
        }
    }

    /**
     * Remove a service line. This is equivalent to cancelling service for the address.
     *
     * @param serviceLineNumber
     * @param options
     */
    public async remove_service_line (
        serviceLineNumber: string,
        options: Partial<{
            /**
             * Optional reason for cancelling this service line
             */
            reasonForCancellation: string;
            /**
             * If service should end now, or on next bill day. Default is false
             */
            endNow: boolean;
        }> = {}
    ): Promise<boolean> {
        try {
            await this.delete(
                `/enterprise/v1/account/${this.accountNumber}/service-lines/${serviceLineNumber}`,
                options);

            return true;
        } catch {
            return false;
        }
    }

    /**
     * Removes a cold user terminal from the account
     *
     * @param deviceId UTID, kit serial number, or dish serial number.
     */
    public async remove_user_terminal (deviceId: string): Promise<boolean> {
        try {
            await this.delete(`/enterprise/v1/account/${this.accountNumber}/user-terminals/${deviceId}`);

            return true;
        } catch {
            return false;
        }
    }

    /**
     * The Telemetry API is designed for users that have their own data infrastructure to monitor
     * Starlink devices remotely.
     *
     * This feature enables the ability to perform analysis in near real-time to characterize Starlink device
     * performance relative to ongoing operations.
     *
     * The data in the stream has a time-based retention policy. This is configured to be a fraction of a day (8 hours).
     * The implication of this is that if your consuming process goes offline and does not resume for a period of time
     * longer than this retention policy then you will observe loss of data.
     *
     * Even though this is a JSON HTTP API, it behaves like a data stream. It is important to understand that a
     * consumer's position is tracked and advanced through each successful response transmission. If the consumer
     * process crashes in the middle of processing a response batch, unprocessed entries will not be present in the
     * subsequent request!
     *
     * Each service account advances through the data stream independently. Creating multiple service accounts is a
     * convenient way to consume the data multiple times if, for example, you have multiple environments
     * (e.g. development and production).
     *
     * @param batchSize The maximum number of entries to return in the response (default 100).
     * @param maxLingerMs The maximum number of milliseconds to collect entries for (default 100).
     */
    public async telemetry (
        batchSize: number = 100,
        maxLingerMs: number = 100
    ): Promise<Starlink.Telemetry.Response.Data> {
        const response = await this.post<Starlink.Telemetry.APIResponse.Data>(
            '/telemetry/stream/v1/telemetry',
            { batchSize, maxLingerMs, accountNumber: this.accountNumber });

        const results: Starlink.Telemetry.Response.Data = {
            Router: [],
            UserTerminal: [],
            UserTerminalDataUsage: []
        };

        for (const key of Object.keys(response.metadata.enums.DeviceType)) {
            const alertKeys = response.metadata.enums.AlertsByDeviceType[key] || {};
            const columnKeys = response.data.columnNamesByDeviceType[key] || [];
            const type = response.metadata.enums.DeviceType[key];

            results[type] = [];

            const values = response.data.values.filter(([value]) => value === key);

            for (const value of values) {
                const record: Record<string, Starlink.Telemetry.APIResponse.DataValue> = {};

                for (let i = 1; i < columnKeys.length; i++) {
                    const column = columnKeys[i];

                    record[column] = value[i];
                }

                if (record.ActiveAlerts && Array.isArray(record.ActiveAlerts)) {
                    if (record.ActiveAlerts.length !== 0) {
                        const alerts: string[] = [];

                        for (const alert of record.ActiveAlerts) {
                            alerts.push(alertKeys[alert.toString()] || alert.toString());
                        }

                        record.ActiveAlerts = alerts;
                    }
                }

                results[type].push(record);
            }
        }

        return results;
    }

    /**
     * Converts the instance to a string (JSON encoded)
     */
    public toString (): string {
        return JSON.stringify(this.account);
    }

    /**
     * Transforms the API response for a Realtime Data Tracking request into an actual response
     *
     * @param record
     * @private
     */
    private transformRealtimeDataTracking (
        record: Starlink.Management.APIResponse.RealtimeDataTracking
    ): Starlink.Management.Response.RealtimeDataTracking {
        return {
            ...record,
            ...record,
            startDate: new Date(record.startDate),
            endDate: new Date(record.endDate),
            billingCycles: record.billingCycles !== null
                ? record.billingCycles.map(cycle => {
                    return {
                        ...cycle,
                        startDate: new Date(cycle.startDate),
                        endDate: new Date(cycle.endDate),
                        dailyDataUsage: cycle.dailyDataUsage !== null
                            ? cycle.dailyDataUsage.map(usage => {
                                return {
                                    ...usage,
                                    date: new Date(usage.date)
                                };
                            })
                            : null
                    };
                })
                : null,
            servicePlan: {
                ...record.servicePlan,
                activeFrom: record.servicePlan.activeFrom !== null
                    ? new Date(record.servicePlan.activeFrom)
                    : null,
                subscriptionActiveFrom: record.servicePlan.subscriptionActiveFrom !== null
                    ? new Date(record.servicePlan.subscriptionActiveFrom)
                    : null,
                subscriptionEndDate: record.servicePlan.subscriptionEndDate !== null
                    ? new Date(record.servicePlan.subscriptionEndDate)
                    : null,
                overageLineDeactivatedDate: record.servicePlan.overageLineDeactivatedDate !== null
                    ? new Date(record.servicePlan.overageLineDeactivatedDate)
                    : null
            },
            lastUpdated: record.lastUpdated !== null ? new Date(record.lastUpdated) : null
        };
    }

    /**
     * Transforms the API response for a Subscription request into an actual response
     *
     * @param record
     * @private
     */
    private transformSubscription (
        record: Starlink.Management.APIResponse.Subscription
    ): Starlink.Management.Response.Subscription {
        return {
            ...record,
            startDate: record.startDate !== null ? new Date(record.startDate) : null,
            normalizedStartDate: record.normalizedStartDate !== null
                ? new Date(record.normalizedStartDate)
                : null,
            endDate: record.endDate !== null ? new Date(record.endDate) : null,
            serviceEndDate: record.serviceEndDate !== null ? new Date(record.serviceEndDate) : null
        };
    }

    /**
     * Updates an address within the account
     *
     * @param address
     */
    public async update_address (
        address: Starlink.Management.Request.UpdateAddress
    ): Promise<Starlink.Management.Response.Address> {
        const response = await this.put<Starlink.Common.Content<Starlink.Management.APIResponse.Address>>(
            `/enterprise/v1/account/${this.accountNumber}/addresses`,
            address);

        return response.content;
    }

    /**
     * Updates the account default router configuration to the ID specified
     *
     * @param configId
     */
    public async update_default_router_config (
        configId: string
    ): Promise<boolean> {
        const response = await this.put<
            Starlink.Common.PagedContent<Starlink.Management.APIResponse.Account[]>>(
                `/enterprise/v1/accounts/${this.accountNumber}/update-default-router-config`,
                { configId });

        const account = response.content.results.filter(elem =>
            elem.accountNumber === this.accountNumber)
            .shift();

        if (account) {
            this.account = account;

            return true;
        }

        return false;
    }
}

export { Account };
