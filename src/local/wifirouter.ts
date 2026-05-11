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

import { GRPCApi } from './api/grpc_api';
import { StarlinkGRPC } from './api/types';
import { RouterRole } from '../protobuf/spacex/api/device/device';
import type { WifiConfig } from '../protobuf/spacex/api/device/wifi_config';
import type { ClientConfig, ClientName, MeshConfig } from '../protobuf/spacex/api/device/wifi';
export { GRPCApi, RouterRole, StarlinkGRPC };
export type { WifiConfig, ClientConfig, ClientName, MeshConfig };

// The device-level requests `getHistory` and `getStatus` are multiplexed across
// device types: the router responds with `wifiGetHistory` / `wifiGetStatus`
// response variants while a dish responds with `dishGetHistory` / `dishGetStatus`.
// That is why the request key and the response key here do not match.

export default class WiFiRouter extends GRPCApi {
    constructor ({ host = '192.168.1.1', port = 9000, ...rest }: GRPCApi.Options = {}) {
        super({ host, port, ...rest });
    }

    /**
     * Fetches WAN backhaul statistics
     */
    public async fetch_backhaul_stats (): Promise<StarlinkGRPC.WifiRouter.BackhaulStats> {
        return this.fetch_or_throw({ wifiBackhaulStats: {} }, 'wifiBackhaulStats', 'backhaul stats');
    }

    /**
     * Fetches per-client history for the requested MAC address
     */
    public async fetch_client_history (
        mac_address: string,
        client_id = 0
    ): Promise<StarlinkGRPC.WifiRouter.ClientHistory> {
        return this.fetch_or_throw(
            { wifiGetClientHistory: { macAddress: mac_address, clientId: client_id } },
            'wifiGetClientHistory',
            'client history'
        );
    }

    /**
     * Fetches the list of currently associated WiFi clients
     */
    public async fetch_clients (): Promise<StarlinkGRPC.WifiRouter.Clients> {
        return this.fetch_or_throw({ wifiGetClients: {} }, 'wifiGetClients', 'clients');
    }

    /**
     * Fetches the current WiFi router configuration
     */
    public async fetch_config (): Promise<StarlinkGRPC.WifiRouter.Config> {
        return this.fetch_or_throw({ wifiGetConfig: {} }, 'wifiGetConfig', 'config');
    }

    /**
     * Fetches diagnostics information from a local WiFi Router
     */
    public async fetch_diagnostics (): Promise<StarlinkGRPC.WifiRouter.Diagnostics> {
        return this.fetch_or_throw({ getDiagnostics: {} }, 'wifiGetDiagnostics2', 'diagnostics');
    }

    /**
     * Fetches the active firewall snapshot (iptables / iptables6 / ipset)
     */
    public async fetch_firewall (): Promise<StarlinkGRPC.WifiRouter.Firewall> {
        return this.fetch_or_throw({ wifiGetFirewall: {} }, 'wifiGetFirewall', 'firewall data');
    }

    /**
     * Fetches information about the configured guest network
     */
    public async fetch_guest_info (): Promise<StarlinkGRPC.WifiRouter.GuestInfo> {
        return this.fetch_or_throw({ wifiGuestInfo: {} }, 'wifiGuestInfo', 'guest info');
    }

    /**
     * Fetches the rolling history of WiFi throughput / link state
     */
    public async fetch_history (): Promise<StarlinkGRPC.WifiRouter.History> {
        return this.fetch_or_throw({ getHistory: {} }, 'wifiGetHistory', 'history');
    }

    /**
     * Fetches per-host ping metrics tracked by the router
     */
    public async fetch_ping_metrics (): Promise<StarlinkGRPC.WifiRouter.PingMetrics> {
        return this.fetch_or_throw({ wifiGetPingMetrics: {} }, 'wifiGetPingMetrics', 'ping metrics');
    }

    /**
     * Fetches the most recent self-test result
     */
    public async fetch_self_test (): Promise<StarlinkGRPC.WifiRouter.SelfTest> {
        return this.fetch_or_throw({ wifiSelfTest: {} }, 'wifiSelfTest', 'self test result');
    }

    /**
     * Fetches router status (device info, WAN addresses, hops from controller, alerts)
     *
     * @param role optional router role for the status request; the router picks its own default when omitted
     */
    public async fetch_status (
        role?: RouterRole
    ): Promise<StarlinkGRPC.WifiRouter.Status> {
        return this.fetch_or_throw({ getStatus: { routerRole: role } }, 'wifiGetStatus', 'status');
    }

    /**
     * Triggers a fresh self-test pass on the router
     */
    public async run_self_test (): Promise<boolean> {
        return this.try_handle({ wifiRunSelfTest: {} });
    }

    /**
     * Pushes a given-name entry for a client
     */
    public async set_client_given_name (
        client_name: ClientName,
        client_config?: ClientConfig
    ): Promise<boolean> {
        return this.try_handle({
            wifiSetClientGivenName: {
                clientName: client_name,
                clientConfig: client_config
            }
        });
    }

    /**
     * Pushes a new WiFi router configuration
     */
    public async set_config (config: WifiConfig): Promise<boolean> {
        return this.try_handle({ wifiSetConfig: { wifiConfig: config } });
    }

    /**
     * Pushes a new mesh configuration to the named device
     */
    public async set_mesh_config (
        mesh_config: MeshConfig,
        device_id?: string
    ): Promise<boolean> {
        return this.try_handle({ wifiSetMeshConfig: { meshConfig: mesh_config, deviceId: device_id } });
    }

    /**
     * Runs initial network setup on the router
     */
    public async setup (
        network_name: string,
        network_password: string
    ): Promise<boolean> {
        return this.try_handle({
            wifiSetup: {
                networkName: network_name,
                networkPassword: network_password
            }
        });
    }
}

export { WiFiRouter };
