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

import assert from 'assert';
import { config } from 'dotenv';
import {
    describe,
    it
} from 'mocha';

import {
    Account,
    Dishy,
    ServiceLine,
    StarlinkAPI,
    WiFiRouter
} from '../src';

config();

/* eslint-disable @stylistic/function-call-argument-newline */
describe('Unit Tests', async () => {
    describe('Dishy API', async () => {
        const dishy = new Dishy(undefined, undefined, 5000);
        let unreachable = false;

        it('fetch_diagnostics()', async function () {
            await dishy.fetch_diagnostics()
                .then(data => {
                    assert.notEqual(data.id.length, 0, 'Returned ID length is 0');
                    assert.notEqual(data.hardwareVersion.length, 0, 'Returned HardwareVersion.length is 0');
                    assert.notEqual(data.softwareVersion.length, 0, 'Returned SoftwareVersion.length is 0');
                })
                .catch(() => {
                    unreachable = true;

                    return this.skip();
                });
        });

        it('fetch_history()', async function () {
            if (unreachable) return this.skip();

            await dishy.fetch_history()
                .then(data => {
                    assert.notEqual(data.popPingDropRate.length, 0, 'Returned popPingDropRate.length is 0');
                    assert.notEqual(data.popPingLatencyMs.length, 0, 'Returned popPingLatencyMs.length is 0');
                })
                .catch(() => this.skip());
        });

        it('fetch_location()', async function () {
            if (unreachable) return this.skip();

            // location information may not be available based upon dishy settings
            await dishy.fetch_location()
                .catch(() => this.skip());
        });

        it('fetch_obstruction_map()', async function () {
            if (unreachable) return this.skip();

            // location information may not be available based upon dishy settings
            await dishy.fetch_obstruction_map()
                .then(data => {
                    assert.notEqual(data.snr.length, 0, 'Returned data snr.length is 0');
                })
                .catch(() => this.skip());
        });

        it('fetch_status()', async function () {
            if (unreachable) return this.skip();

            // location information may not be available based upon dishy settings
            await dishy.fetch_status()
                .then(data => {
                    assert.ok(data.deviceInfo);
                })
                .catch(() => this.skip());
        });

        it('reboot()', async function () {
            // We do not perform this test in CI/CD
            this.skip();
        });

        it('stow()', async function () {
            // We do not perform this test in CI/CD
            this.skip();
        });

        it('unstow()', async function () {
            // We do not perform this test in CI/CD
            this.skip();
        });
    });

    describe('WiFi Router API', async () => {
        const router = new WiFiRouter(undefined, undefined, 5000);

        it('fetch_diagnostics()', async function () {
            await router.fetch_diagnostics()
                .then(data => {
                    console.log(data);
                    assert.notEqual(data.id.length, 0, 'Returned ID length is 0');
                    assert.notEqual(data.hardwareVersion.length, 0, 'Returned HardwareVersion length is 0');
                    assert.notEqual(data.softwareVersion.length, 0, 'Returned SoftwareVersion length is 0');
                })
                .catch(() => this.skip());
        });
    });

    describe('Enterprise API', async () => {
        const api = new StarlinkAPI(
            process.env.CLIENT_ID || '',
            process.env.CLIENT_SECRET || ''
        );

        it('Fetch Accounts', async function () {
            await api.fetch_accounts()
                .then(accounts => {
                    assert.notEqual(accounts.length, 0);
                })
                .catch(() => this.skip());
        });

        describe('Account', async () => {
            let account: Account | undefined;

            before(async () => {
                try {
                    account = (await api.fetch_accounts())[0];
                } catch {}
            });

            it('add_user_terminal()', async function () {
                // We do not perform this test as it changes account data
                this.skip();
            });

            it('check_capacity()', async function () {
                if (!account) return this.skip();

                // we can't really verify the result, as Starlink capacity changes
                await account.check_capacity(39.8097343, -98.5556199)
                    .catch(() => assert.fail());
            });

            it('create_address()', async function () {
                // We do not perform this test as it changes account data
                this.skip();
            });

            it('create_router_config()', async function () {
                // We do not perform this test as it changes account data
                this.skip();
            });

            it('create_service_line()', async function () {
                // We do not perform this test as it changes account data
                this.skip();
            });

            it('fetch_address()', async function () {
                if (!account) return this.skip();

                const addresses = await account.fetch_addresses();

                assert.notEqual(addresses.length, 0);

                const address = addresses[0];

                const check = await account.fetch_address(address.addressReferenceId);

                assert.deepEqual(check, address);
            });

            it('fetch_addresses()', async function () {
                if (!account) return this.skip();

                const data = await account.fetch_addresses();

                assert.notEqual(data.length, 0);
            });

            it('fetch_realtime_data_tracking()', async function () {
                if (!account) return this.skip();

                const data = await account.fetch_realtime_data_tracking();

                assert.notEqual(data.length, 0);
            });

            it('fetch_router()', async function () {
                // we don't know a router to fetch
                this.skip();
            });

            it('fetch_router_config()', async function () {
                if (!account) return this.skip();

                const configs = await account.fetch_router_configs();

                if (configs.length === 0) return this.skip();

                const config = configs[0];

                const check = await account.fetch_router_config(config.configId);

                assert.deepEqual(check, config);
            });

            it('fetch_router_configs()', async function () {
                if (!account) return this.skip();

                const data = await account.fetch_router_configs();

                assert.notEqual(data.length, 0);
            });

            it('fetch_service_line()', async function () {
                if (!account) return this.skip();

                const service_lines = await account.fetch_service_lines();

                assert.notEqual(service_lines.length, 0);

                const service_line = service_lines[0];

                const check = await account.fetch_service_line(service_line.serviceLineNumber);

                assert.deepEqual(check, service_line);
            });

            it('fetch_service_lines()', async function () {
                if (!account) return this.skip();

                const data = await account.fetch_service_lines();

                assert.notEqual(data.length, 0);
            });

            it('fetch_subscription()', async function () {
                if (!account) return this.skip();

                const subscriptions = await account.fetch_subscriptions();

                assert.notEqual(subscriptions.length, 0);

                const subscription = subscriptions[0];

                const check = await account.fetch_subscription(subscription.subscriptionReferenceId);

                assert.deepEqual(check, subscription);
            });

            it('fetch_subscriptions()', async function () {
                if (!account) return this.skip();

                const data = await account.fetch_subscriptions();

                assert.notEqual(data.length, 0);
            });

            it('fetch_subscription_products()', async function () {
                if (!account) return this.skip();

                const data = await account.fetch_subscription_products();

                assert.notEqual(data.length, 0);
            });

            it('fetch_user_terminals()', async function () {
                if (!account) return this.skip();

                // there is no guarantee that we'll have any terminals
                await account.fetch_user_terminals()
                    .catch(() => assert.fail());
            });

            it('remove_service_line()', async function () {
                // We do not perform this test as it changes account data
                this.skip();
            });

            it('remove_user_terminal()', async function () {
                // We do not perform this test as it changes account data
                this.skip();
            });

            it('telemetry()', async function () {
                if (!account) return this.skip();

                // There is no guarantee that we will have any telemetry data
                await account.telemetry()
                    .catch(() => assert.fail());
            });

            it('update_address()', async function () {
                // We do not perform this test as it changes account data
                this.skip();
            });

            it('update_default_router_config()', async function () {
                // We do not perform this test as it changes account data
                this.skip();
            });
        });

        describe('Routers', async () => {
            it('assign_config()', async function () {
                // We do not perform this test as it changes account data
                this.skip();
            });

            it('remove_config()', async function () {
                // We do not perform this test as it changes account data
                this.skip();
            });
        });

        describe('Router Config', async () => {
            it('save()', async function () {
                // We do not perform this test as it changes account data
                this.skip();
            });
        });

        describe('Service Line', async () => {
            let serviceLine: ServiceLine | undefined;

            before(async () => {
                try {
                    const account = (await api.fetch_accounts())[0];

                    serviceLine = (await account.fetch_service_lines())[0];
                } catch {}
            });

            it('add_terminal()', async function () {
                // We do not perform this test as it changes account data
                this.skip();
            });

            it('fetch_daily_usage()', async function () {
                if (!serviceLine) return this.skip();

                await serviceLine.fetch_daily_usage()
                    .catch(() => assert.fail());
            });

            it('fetch_partial_periods()', async function () {
                if (!serviceLine) return this.skip();

                await serviceLine.fetch_partial_periods()
                    .catch(() => assert.fail());
            });

            it('opt_in()', async function () {
                // We do not perform this test as it changes account data
                this.skip();
            });

            it('opt_out()', async function () {
                // We do not perform this test as it changes account data
                this.skip();
            });

            it('remove_terminal()', async function () {
                // We do not perform this test as it changes account data
                this.skip();
            });

            it('save()', async function () {
                // We do not perform this test as it changes account data
                this.skip();
            });
        });

        describe('User Terminal', async () => {
            it('add_to_service_line()', async function () {
                // We do not perform this test as it changes account data
                this.skip();
            });

            it('remove_from_service_line()', async function () {
                // We do not perform this test as it changes account data
                this.skip();
            });
        });
    });
});
/* eslint-enable @stylistic/function-call-argument-newline */
