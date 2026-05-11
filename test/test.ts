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
import { ClientError, Status } from 'nice-grpc';
import {
    after,
    before,
    describe,
    it
} from 'node:test';

import {
    Account,
    Dishy,
    gpsTimeToUTC,
    ServiceLine,
    StarlinkAPI,
    WiFiRouter
} from '../src';

config();

describe('Unit Tests', async () => {
    after(async () => {
        await StarlinkAPI.disconnect();
    });

    describe('Local gRPC client construction', async () => {
        it('constructs Dishy with TLS + custom headers and closes cleanly', () => {
            const dishy = new Dishy({
                host: '127.0.0.1',
                port: 1,
                timeout: 250,
                tls: true,
                headers: { 'x-api-key': 'smoke-test' }
            });

            try {
                assert.strictEqual(dishy.host, '127.0.0.1');
                assert.strictEqual(dishy.port, 1);
                assert.strictEqual(dishy.timeout, 250);
            } finally {
                dishy.close();
            }
        });

        it('constructs WiFiRouter with TLS object + rejectUnauthorized=false', () => {
            const router = new WiFiRouter({
                host: '127.0.0.1',
                port: 1,
                timeout: 250,
                tls: { rejectUnauthorized: false },
                headers: { 'x-api-key': 'smoke-test' }
            });

            try {
                assert.strictEqual(router.host, '127.0.0.1');
                assert.strictEqual(router.port, 1);
            } finally {
                router.close();
            }
        });

        it('preserves the plaintext default when tls is omitted', () => {
            const dishy = new Dishy();

            try {
                assert.strictEqual(dishy.host, '192.168.100.1');
                assert.strictEqual(dishy.port, 9200);
            } finally {
                dishy.close();
            }
        });
    });

    describe('Dishy API', async () => {
        const dishy = new Dishy({ timeout: 5000 });
        let unreachable = false;

        const classifySkip = (err: unknown): string => {
            if (err instanceof ClientError) {
                if (err.code === Status.UNIMPLEMENTED) return 'not implemented on this firmware';
                if (err.code === Status.PERMISSION_DENIED) return 'permission denied (needs signed wrapper)';
            }

            return 'dishy method unavailable';
        };

        after(() => {
            dishy.close();
        });

        it('fetch_diagnostics()', { skip: false }, async (t) => {
            await dishy.fetch_diagnostics()
                .then(data => {
                    assert.notEqual(data.id.length, 0, 'Returned ID length is 0');
                    assert.notEqual(data.hardwareVersion.length, 0, 'Returned HardwareVersion.length is 0');
                    assert.notEqual(data.softwareVersion.length, 0, 'Returned SoftwareVersion.length is 0');

                    if (data.location?.gpsTimeS) {
                        const timestamp = gpsTimeToUTC(data.location.gpsTimeS);

                        assert.notEqual(timestamp, 0);
                    }
                })
                .catch(() => {
                    unreachable = true;

                    return t.skip('Dishy unreachable');
                });
        });

        it('fetch_history()', { skip: false }, async (t) => {
            if (unreachable) return t.skip('Dishy unreachable');

            await dishy.fetch_history()
                .then(data => {
                    assert.notEqual(data.popPingDropRate.length, 0, 'Returned popPingDropRate.length is 0');
                    assert.notEqual(data.popPingLatencyMs.length, 0, 'Returned popPingLatencyMs.length is 0');
                })
                .catch(err => t.skip(classifySkip(err)));
        });

        it('fetch_location()', { skip: false }, async (t) => {
            if (unreachable) return t.skip('Dishy unreachable');

            // location information may not be available based upon dishy settings
            await dishy.fetch_location()
                .catch(err => t.skip(classifySkip(err)));
        });

        it('fetch_obstruction_map()', { skip: false }, async (t) => {
            if (unreachable) return t.skip('Dishy unreachable');

            // location information may not be available based upon dishy settings
            await dishy.fetch_obstruction_map()
                .then(data => {
                    assert.notEqual(data.snr.length, 0, 'Returned data snr.length is 0');
                })
                .catch(err => t.skip(classifySkip(err)));
        });

        it('fetch_status()', { skip: false }, async (t) => {
            if (unreachable) return t.skip('Dishy unreachable');

            // location information may not be available based upon dishy settings
            await dishy.fetch_status()
                .then(data => {
                    assert.ok(data.deviceInfo);
                })
                .catch(err => t.skip(classifySkip(err)));
        });

        it('fetch_config()', { skip: false }, async (t) => {
            if (unreachable) return t.skip('Dishy unreachable');

            await dishy.fetch_config()
                .then(data => {
                    assert.ok(data.dishConfig, 'No dishConfig returned');
                })
                .catch(err => t.skip(classifySkip(err)));
        });

        it('fetch_context()', { skip: false }, async (t) => {
            if (unreachable) return t.skip('Dishy unreachable');

            await dishy.fetch_context()
                .catch(err => t.skip(classifySkip(err)));
        });

        it('fetch_emc()', { skip: false }, async (t) => {
            if (unreachable) return t.skip('Dishy unreachable');

            await dishy.fetch_emc()
                .catch(err => t.skip(classifySkip(err)));
        });

        it('fetch_rssi_scan_result()', { skip: false }, async (t) => {
            if (unreachable) return t.skip('Dishy unreachable');

            await dishy.fetch_rssi_scan_result()
                .catch(err => t.skip(classifySkip(err)));
        });

        it('fetch_speedtest_status()', { skip: false }, async (t) => {
            if (unreachable) return t.skip('Dishy unreachable');

            await dishy.fetch_speedtest_status()
                .catch(err => t.skip(classifySkip(err)));
        });

        it('fetch_device_info()', { skip: false }, async (t) => {
            if (unreachable) return t.skip('Dishy unreachable');

            await dishy.fetch_device_info()
                .then(data => {
                    assert.ok(data.deviceInfo, 'No deviceInfo returned');
                })
                .catch(err => t.skip(classifySkip(err)));
        });

        it('fetch_time()', { skip: false }, async (t) => {
            if (unreachable) return t.skip('Dishy unreachable');

            await dishy.fetch_time()
                .then(data => {
                    assert.ok(data.unixNano && data.unixNano > 0, 'Returned unixNano is not positive');
                })
                .catch(err => t.skip(classifySkip(err)));
        });

        it('fetch_network_interfaces()', { skip: false }, async (t) => {
            if (unreachable) return t.skip('Dishy unreachable');

            await dishy.fetch_network_interfaces()
                .then(data => {
                    assert.ok(Array.isArray(data.networkInterfaces), 'networkInterfaces is not an array');
                })
                .catch(err => t.skip(classifySkip(err)));
        });

        it('fetch_connections()', { skip: false }, async (t) => {
            if (unreachable) return t.skip('Dishy unreachable');

            await dishy.fetch_connections()
                .then(data => {
                    assert.ok(Array.isArray(data.services), 'services is not an array');
                })
                .catch(err => t.skip(classifySkip(err)));
        });

        it('fetch_ping()', { skip: false }, async (t) => {
            if (unreachable) return t.skip('Dishy unreachable');

            await dishy.fetch_ping()
                .then(data => {
                    assert.ok(Array.isArray(data.results), 'ping results is not an array');
                })
                .catch(err => t.skip(classifySkip(err)));
        });

        it('fetch_radio_stats()', { skip: false }, async (t) => {
            if (unreachable) return t.skip('Dishy unreachable');

            await dishy.fetch_radio_stats()
                .then(data => {
                    assert.ok(Array.isArray(data.radioStats), 'radioStats is not an array');
                })
                .catch(err => t.skip(classifySkip(err)));
        });

        it('ping_host()', { skip: false }, async (t) => {
            if (unreachable) return t.skip('Dishy unreachable');

            await dishy.ping_host('1.1.1.1')
                .catch(err => t.skip(classifySkip(err)));
        });

        it('fetch_log()', { skip: false }, async (t) => {
            if (unreachable) return t.skip('Dishy unreachable');

            await dishy.fetch_log()
                .catch(err => t.skip(classifySkip(err)));
        });

        it('fetch_gnss_measurement()', { skip: false }, async (t) => {
            if (unreachable) return t.skip('Dishy unreachable');

            await dishy.fetch_gnss_measurement()
                .then(data => {
                    assert.ok(Array.isArray(data.measurements), 'measurements is not an array');
                })
                .catch(err => t.skip(classifySkip(err)));
        });

        it('fetch_transceiver_status()', { skip: false }, async (t) => {
            if (unreachable) return t.skip('Dishy unreachable');

            await dishy.fetch_transceiver_status()
                .catch(err => t.skip(classifySkip(err)));
        });

        it('fetch_transceiver_telemetry()', { skip: false }, async (t) => {
            if (unreachable) return t.skip('Dishy unreachable');

            await dishy.fetch_transceiver_telemetry()
                .catch(err => t.skip(classifySkip(err)));
        });

        it('reboot()', { skip: 'We do not perform this test in CI/CD' }, async () => {
        });

        it('stow()', { skip: 'We do not perform this test in CI/CD' }, async () => {
        });

        it('unstow()', { skip: 'We do not perform this test in CI/CD' }, async () => {
        });

        it('factory_reset()', { skip: 'We do not perform this test in CI/CD' }, async () => {
        });

        it('set_config()', { skip: 'We do not perform this test in CI/CD' }, async () => {
        });

        it('power_save()', { skip: 'We do not perform this test in CI/CD' }, async () => {
        });

        it('inhibit_gps()', { skip: 'We do not perform this test in CI/CD' }, async () => {
        });

        it('inhibit_rf()', { skip: 'We do not perform this test in CI/CD' }, async () => {
        });

        it('clear_obstruction_map()', { skip: 'We do not perform this test in CI/CD' }, async () => {
        });

        it('start_speedtest()', { skip: 'We do not perform this test in CI/CD' }, async () => {
        });

        it('run_transceiver_if_loopback_test()', { skip: 'We do not perform this test in CI/CD' }, async () => {
        });

        it('speed_test()', { skip: 'We do not perform this test in CI/CD' }, async () => {
        });

        it('run_iperf_server()', { skip: 'We do not perform this test in CI/CD' }, async () => {
        });

        it('tcp_connectivity_test()', { skip: 'We do not perform this test in CI/CD' }, async () => {
        });

        it('udp_connectivity_test()', { skip: 'We do not perform this test in CI/CD' }, async () => {
        });

        it('report_client_speedtest()', { skip: 'We do not perform this test in CI/CD' }, async () => {
        });

        it('activate_rssi_scan()', { skip: 'We do not perform this test in CI/CD' }, async () => {
        });

        it('press_reset_button()', { skip: 'We do not perform this test in CI/CD' }, async () => {
        });

        it('restart_control()', { skip: 'We do not perform this test in CI/CD' }, async () => {
        });

        it('update()', { skip: 'We do not perform this test in CI/CD' }, async () => {
        });
    });

    describe('WiFi Router API', async () => {
        const router = new WiFiRouter({ timeout: 5000 });
        let unreachable = false;

        after(() => {
            router.close();
        });

        it('fetch_diagnostics()', { skip: false }, async (t) => {
            await router.fetch_diagnostics()
                .then(data => {
                    assert.notEqual(data.id.length, 0, 'Returned ID length is 0');
                    assert.notEqual(data.hardwareVersion.length, 0, 'Returned HardwareVersion length is 0');
                    assert.notEqual(data.softwareVersion.length, 0, 'Returned SoftwareVersion length is 0');
                })
                .catch(() => {
                    unreachable = true;

                    return t.skip('Router unreachable');
                });
        });

        it('fetch_clients()', { skip: false }, async (t) => {
            if (unreachable) return t.skip('Router unreachable');

            await router.fetch_clients()
                .then(data => {
                    assert.ok(Array.isArray(data.clients), 'clients is not an array');
                })
                .catch(() => t.skip('Clients unavailable'));
        });

        it('fetch_config()', { skip: false }, async (t) => {
            if (unreachable) return t.skip('Router unreachable');

            await router.fetch_config()
                .then(data => {
                    assert.ok(data.wifiConfig, 'No wifiConfig returned');
                })
                .catch(() => t.skip('Config unavailable'));
        });

        it('fetch_ping_metrics()', { skip: false }, async (t) => {
            if (unreachable) return t.skip('Router unreachable');

            await router.fetch_ping_metrics()
                .catch(() => t.skip('Ping metrics unavailable'));
        });

        it('fetch_status()', { skip: false }, async (t) => {
            if (unreachable) return t.skip('Router unreachable');

            await router.fetch_status()
                .then(data => {
                    assert.ok(data.deviceInfo, 'No deviceInfo returned');
                })
                .catch(() => t.skip('Status unavailable'));
        });

        it('set_config()', { skip: 'We do not perform this test in CI/CD' }, async () => {
        });

        it('setup()', { skip: 'We do not perform this test in CI/CD' }, async () => {
        });
    });

    describe('Enterprise API', async () => {
        const api = new StarlinkAPI(
            process.env.CLIENT_ID || '',
            process.env.CLIENT_SECRET || ''
        );

        it('Fetch Accounts', { skip: false }, async (t) => {
            await api.fetch_accounts()
                .then(accounts => {
                    assert.notEqual(accounts.length, 0);
                })
                .catch(() => t.skip('Enterprise API unavailable'));
        });

        describe('Account', async () => {
            let account: Account | undefined;

            before(async () => {
                try {
                    account = (await api.fetch_accounts())[0];
                } catch {}
            });

            it('add_user_terminal()', { skip: 'Changes account data' }, async () => {
            });

            it('create_address()', { skip: 'Changes account data' }, async () => {
            });

            it('create_router_config()', { skip: 'Changes account data' }, async () => {
            });

            it('create_service_line()', { skip: 'Changes account data' }, async () => {
            });

            it('fetch_address()', { skip: false }, async (t) => {
                if (!account) return t.skip('No account available');

                const addresses = await account.fetch_addresses();

                assert.notEqual(addresses.length, 0);

                const address = addresses[0];

                const check = await account.fetch_address(address.addressReferenceId);

                assert.deepEqual(check, address);
            });

            it('fetch_addresses()', { skip: false }, async (t) => {
                if (!account) return t.skip('No account available');

                const data = await account.fetch_addresses();

                assert.notEqual(data.length, 0);
            });

            it('fetch_available_products()', { skip: false }, async (t) => {
                if (!account) return t.skip('No account available');

                const data = await account.fetch_available_products();

                assert.notEqual(data.length, 0);
            });

            it('fetch_realtime_data_tracking()', { skip: false }, async (t) => {
                if (!account) return t.skip('No account available');

                const data = await account.fetch_realtime_data_tracking();

                assert.notEqual(data.length, 0);
            });

            it('fetch_router()', { skip: 'We don\'t know a router to fetch' }, async () => {
            });

            it('fetch_router_config()', { skip: false }, async (t) => {
                if (!account) return t.skip('No account available');

                const configs = await account.fetch_router_configs();

                if (configs.length === 0) return t.skip('No router configs available');

                const config = configs[0];

                const check = await account.fetch_router_config(config.configId);

                assert.deepEqual(check, config);
            });

            it('fetch_router_configs()', { skip: false }, async (t) => {
                if (!account) return t.skip('No account available');

                const data = await account.fetch_router_configs();

                assert.notEqual(data.length, 0);
            });

            it('fetch_service_line()', { skip: false }, async (t) => {
                if (!account) return t.skip('No account available');

                const service_lines = await account.fetch_service_lines();

                assert.notEqual(service_lines.length, 0);

                const service_line = service_lines[0];

                const check = await account.fetch_service_line(service_line.serviceLineNumber);

                assert.deepEqual(check, service_line);
            });

            it('fetch_service_lines()', { skip: false }, async (t) => {
                if (!account) return t.skip('No account available');

                const data = await account.fetch_service_lines();

                assert.notEqual(data.length, 0);
            });

            it('fetch_user_terminals()', { skip: false }, async (t) => {
                if (!account) return t.skip('No account available');

                // there is no guarantee that we'll have any terminals
                await account.fetch_user_terminals()
                    .catch(() => assert.fail());
            });

            it('remove_service_line()', { skip: 'Changes account data' }, async () => {
            });

            it('remove_user_terminal()', { skip: 'Changes account data' }, async () => {
            });

            it('telemetry()', { skip: false }, async (t) => {
                if (!account) return t.skip('No account available');

                // There is no guarantee that we will have any telemetry data
                await account.telemetry()
                    .catch(() => assert.fail());
            });

            it('update_address()', { skip: 'Changes account data' }, async () => {
            });

            it('update_default_router_config()', { skip: 'Changes account data' }, async () => {
            });
        });

        describe('Routers', async () => {
            it('assign_config()', { skip: 'Changes account data' }, async () => {
            });

            it('remove_config()', { skip: 'Changes account data' }, async () => {
            });
        });

        describe('Router Config', async () => {
            it('save()', { skip: 'Changes account data' }, async () => {
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

            it('add_terminal()', { skip: 'Changes account data' }, async () => {
            });

            it('fetch_daily_usage()', { skip: false }, async (t) => {
                if (!serviceLine) return t.skip('No service line available');

                await serviceLine.fetch_daily_usage()
                    .catch(() => assert.fail());
            });

            it('fetch_partial_periods()', { skip: false }, async (t) => {
                if (!serviceLine) return t.skip('No service line available');

                await serviceLine.fetch_partial_periods()
                    .catch(() => assert.fail());
            });

            it('opt_in()', { skip: 'Changes account data' }, async () => {
            });

            it('opt_out()', { skip: 'Changes account data' }, async () => {
            });

            it('remove_terminal()', { skip: 'Changes account data' }, async () => {
            });

            it('save()', { skip: 'Changes account data' }, async () => {
            });
        });

        describe('User Terminal', async () => {
            it('add_to_service_line()', { skip: 'Changes account data' }, async () => {
            });

            it('remove_from_service_line()', { skip: 'Changes account data' }, async () => {
            });
        });
    });
});
