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

import GRPCApi from './api/grpc_api';
import { StarlinkGRPC } from './api/types';
import {
    PositionSource,
    UdpConnectivityTestRequest_UDPProbeDataType
} from '../protobuf/spacex/api/device/device';
import type { SpeedTestStats } from '../protobuf/spacex/api/device/device';
import type { DishConfig, DishActivateRssiScan } from '../protobuf/spacex/api/device/dish';
export {
    PositionSource,
    UdpConnectivityTestRequest_UDPProbeDataType as UDPProbeDataType,
    StarlinkGRPC
};
export type { SpeedTestStats, DishConfig, DishActivateRssiScan };

export default class Dishy extends GRPCApi {
    constructor (
        host = '192.168.100.1',
        port = 9200,
        timeout?: number
    ) {
        super(
            host,
            port,
            timeout
        );
    }

    /**
     * Fetches the active dish configuration
     */
    public async fetch_config (): Promise<StarlinkGRPC.Dishy.Config> {
        return this.fetch_or_throw({ dishGetConfig: {} }, 'dishGetConfig', 'config');
    }

    /**
     * Fetches the service-side connection state from the dish
     */
    public async fetch_connections (): Promise<StarlinkGRPC.Dishy.Connections> {
        return this.fetch_or_throw({ getConnections: {} }, 'getConnections', 'connections');
    }

    /**
     * Fetches dish context information
     */
    public async fetch_context (): Promise<StarlinkGRPC.Dishy.Context> {
        return this.fetch_or_throw({ dishGetContext: {} }, 'dishGetContext', 'context');
    }

    /**
     * Fetches device-level identification information
     */
    public async fetch_device_info (): Promise<StarlinkGRPC.Dishy.DeviceInfo> {
        return this.fetch_or_throw({ getDeviceInfo: {} }, 'getDeviceInfo', 'device info');
    }

    /**
     * Fetches diagnostic information from a dishy
     */
    public async fetch_diagnostics (): Promise<StarlinkGRPC.Dishy.Diagnostics> {
        return this.fetch_or_throw({ getDiagnostics: {} }, 'dishGetDiagnostics', 'diagnostics');
    }

    /**
     * Fetches dish EMC/RF status
     */
    public async fetch_emc (): Promise<StarlinkGRPC.Dishy.EmcStatus> {
        return this.fetch_or_throw({ dishGetEmc: {} }, 'dishGetEmc', 'emc status');
    }

    /**
     * Fetches GNSS measurements observed by the dish (satellite system, PRN,
     * pseudorange, ephemeris) along with the dish device id
     */
    public async fetch_gnss_measurement (): Promise<StarlinkGRPC.Dishy.GnssMeasurement> {
        return this.fetch_or_throw({ getGnssMeasurement: {} }, 'getGnssMeasurement', 'gnss measurement');
    }

    /**
     * Fetches history information from a dishy
     */
    public async fetch_history (): Promise<StarlinkGRPC.Dishy.History> {
        return this.fetch_or_throw({ getHistory: {} }, 'dishGetHistory', 'history');
    }

    /**
     * Fetches the current and saved log bundles from the dish
     * (syslog, dmesg, kernel panic, netsys debug, etc.)
     */
    public async fetch_log (): Promise<StarlinkGRPC.Dishy.Logs> {
        return this.fetch_or_throw({ getLog: {} }, 'getLog', 'log');
    }

    /**
     * Fetches location information from a dishy
     *
     * Note: Location information must be enabled in the dishy settings
     *
     * @param source optional position-source preference; the dish picks its own default when omitted
     */
    public async fetch_location (
        source?: PositionSource
    ): Promise<StarlinkGRPC.Dishy.Location> {
        return this.fetch_or_throw({ getLocation: { source } }, 'getLocation', 'location');
    }

    /**
     * Fetches the configured network interfaces
     */
    public async fetch_network_interfaces (): Promise<StarlinkGRPC.Dishy.NetworkInterfaces> {
        return this.fetch_or_throw({ getNetworkInterfaces: {} }, 'getNetworkInterfaces', 'network interfaces');
    }

    /**
     * Fetches obstruction map information from a dishy
     */
    public async fetch_obstruction_map (): Promise<StarlinkGRPC.Dishy.ObstructionMap> {
        return this.fetch_or_throw({ dishGetObstructionMap: {} }, 'dishGetObstructionMap', 'obstruction map');
    }

    /**
     * Fetches accumulated ping results recorded by the dish
     */
    public async fetch_ping (): Promise<StarlinkGRPC.Dishy.Ping> {
        return this.fetch_or_throw({ getPing: {} }, 'getPing', 'ping data');
    }

    /**
     * Fetches radio statistics
     */
    public async fetch_radio_stats (): Promise<StarlinkGRPC.Dishy.RadioStats> {
        return this.fetch_or_throw({ getRadioStats: {} }, 'getRadioStats', 'radio stats');
    }

    /**
     * Fetches the most recently completed RSSI scan result
     */
    public async fetch_rssi_scan_result (): Promise<StarlinkGRPC.Dishy.RssiScanResult> {
        return this.fetch_or_throw({ dishGetRssiScanResult: {} }, 'dishGetRssiScanResult', 'rssi scan result');
    }

    /**
     * Fetches status of the most recently started async speedtest
     */
    public async fetch_speedtest_status (): Promise<StarlinkGRPC.Dishy.SpeedtestStatusInfo> {
        const wrapper = await this.fetch_or_throw(
            { getSpeedtestStatus: {} },
            'getSpeedtestStatus',
            'speedtest status'
        );

        if (!wrapper.status) {
            throw new Error(`No speedtest status returned from ${this.host}:${this.port}`);
        }

        return wrapper.status;
    }

    /**
     * Fetches status information from a dishy
     */
    public async fetch_status (): Promise<StarlinkGRPC.Dishy.Status> {
        return this.fetch_or_throw({ getStatus: {} }, 'dishGetStatus', 'status');
    }

    /**
     * Fetches the dish's view of wall-clock time (nanoseconds since the Unix epoch)
     */
    public async fetch_time (): Promise<StarlinkGRPC.Dishy.Time> {
        return this.fetch_or_throw({ time: {} }, 'time', 'time');
    }

    /**
     * Fetches transceiver-level status (modulator/demodulator state, tx/rx state,
     * faults, transmit-blanking state, modem and IF temperatures)
     */
    public async fetch_transceiver_status (): Promise<StarlinkGRPC.Dishy.TransceiverStatus> {
        return this.fetch_or_throw({ transceiverGetStatus: {} }, 'transceiverGetStatus', 'transceiver status');
    }

    /**
     * Fetches transceiver-level telemetry (antenna pointing, beam parameters,
     * cell/slot/satellite state, SNR samples)
     */
    public async fetch_transceiver_telemetry (): Promise<StarlinkGRPC.Dishy.TransceiverTelemetry> {
        return this.fetch_or_throw({ transceiverGetTelemetry: {} }, 'transceiverGetTelemetry', 'transceiver telemetry');
    }

    /**
     * Runs an IF-loopback test on the transceiver and returns BER, SNR, RSSI,
     * and PLL-lock measurements. Destructive: alters the IF path while running.
     *
     * @param enable whether the loopback path should be enabled during the test
     */
    public async run_transceiver_if_loopback_test (
        enable: boolean
    ): Promise<StarlinkGRPC.Dishy.TransceiverLoopback> {
        return this.fetch_or_throw(
            { transceiverIfLoopbackTest: { enableIfLoopback: enable } },
            'transceiverIfLoopbackTest',
            'transceiver loopback test result'
        );
    }

    /**
     * Issues a ping from the dish to the supplied host
     *
     * @param address target host (IP or DNS name)
     * @param size optional payload size in bytes
     */
    public async ping_host (
        address: string,
        size?: number
    ): Promise<StarlinkGRPC.Dishy.PingHost> {
        return this.fetch_or_throw({ pingHost: { address, size } }, 'pingHost', 'ping host result');
    }

    /**
     * Performs a synchronous speedtest from the dish
     */
    public async speed_test (): Promise<StarlinkGRPC.Dishy.SpeedTest> {
        return this.fetch_or_throw({ speedTest: {} }, 'speedTest', 'speedtest result');
    }

    /**
     * Starts a short-lived iperf3 server on the dish
     *
     * @param duration_s how long the server should listen for connections
     */
    public async run_iperf_server (duration_s: number): Promise<StarlinkGRPC.Dishy.IperfServer> {
        return this.fetch_or_throw({ runIperfServer: { durationS: duration_s } }, 'runIperfServer', 'iperf server');
    }

    /**
     * Probes TCP connectivity to a host:port from the dish
     */
    public async tcp_connectivity_test (target: string, port: number): Promise<boolean> {
        return this.try_handle({ tcpConnectivityTest: { target, port } });
    }

    /**
     * Probes UDP connectivity to a host:port from the dish
     */
    public async udp_connectivity_test (
        target: string,
        port: number,
        probe_data: UdpConnectivityTestRequest_UDPProbeDataType = UdpConnectivityTestRequest_UDPProbeDataType.EMPTY
    ): Promise<boolean> {
        return this.try_handle({ udpConnectivityTest: { target, port, probeData: probe_data } });
    }

    /**
     * Starts an asynchronous speedtest. Use fetch_speedtest_status to poll for results.
     */
    public async start_speedtest (
        duration_s: number,
        send_telemetry = false
    ): Promise<boolean> {
        return this.try_handle({ startSpeedtest: { durationS: duration_s, sendTelemetry: send_telemetry } });
    }

    /**
     * Reports a client-measured speedtest back to the dish
     */
    public async report_client_speedtest (
        id: number,
        client_speedtest?: SpeedTestStats,
        wifi_speedtest?: SpeedTestStats,
        client_rssi = 0
    ): Promise<boolean> {
        return this.try_handle({
            reportClientSpeedtest: {
                id,
                clientSpeedtest: client_speedtest,
                wifiSpeedtest: wifi_speedtest,
                clientRssi: client_rssi
            }
        });
    }

    /**
     * Activates an RSSI scan on the dish
     */
    public async activate_rssi_scan (scan?: DishActivateRssiScan): Promise<boolean> {
        const response = await this.fetch_or_throw(
            { dishActivateRssiScan: { scanQuery: scan ?? {} } },
            'dishActivateRssiScan',
            'rssi scan activation'
        );

        return response.success ?? false;
    }

    /**
     * Clears the accumulated obstruction map
     */
    public async clear_obstruction_map (): Promise<boolean> {
        return this.try_handle({ dishClearObstructionMap: {} });
    }

    /**
     * Issues a dish-level factory reset
     */
    public async factory_reset (app_reset = false): Promise<boolean> {
        return this.try_handle({ dishFactoryReset: { appReset: app_reset } });
    }

    /**
     * Inhibits GPS reception on the dish (or releases the inhibit when false)
     */
    public async inhibit_gps (inhibit: boolean): Promise<boolean> {
        return this.try_handle({ dishInhibitGps: { inhibitGps: inhibit } });
    }

    /**
     * Inhibits RF transmission on the dish (or releases the inhibit when false)
     */
    public async inhibit_rf (inhibit: boolean): Promise<boolean> {
        return this.try_handle({ dishInhibitRf: { inhibitRf: inhibit } });
    }

    /**
     * Configures dish power-save schedule
     */
    public async power_save (
        start_minutes: number,
        duration_minutes: number,
        enable = true
    ): Promise<boolean> {
        return this.try_handle({
            dishPowerSave: {
                powerSaveStartMinutes: start_minutes,
                powerSaveDurationMinutes: duration_minutes,
                enablePowerSave: enable
            }
        });
    }

    /**
     * Triggers the dish's hardware reset button via the API
     */
    public async press_reset_button (pressed: boolean): Promise<boolean> {
        return this.try_handle({ resetButton: { pressed } });
    }

    /**
     * Issues a reboot request to a dishy
     */
    public async reboot (): Promise<boolean> {
        return this.try_handle({ reboot: {} });
    }

    /**
     * Restarts the dish control plane without rebooting the dish
     */
    public async restart_control (): Promise<boolean> {
        return this.try_handle({ restartControl: {} });
    }

    /**
     * Pushes a new dish configuration
     */
    public async set_config (config: DishConfig): Promise<boolean> {
        return this.try_handle({ dishSetConfig: { dishConfig: config } });
    }

    /**
     * Issues a stow request to a dishy
     *
     * Note: The dishy must support stow/unstow operations
     */
    public async stow (): Promise<boolean> {
        return this.try_handle({ dishStow: { unstow: false } });
    }

    /**
     * Issues an unstow request to a dishy
     *
     * Note: The dishy must support stow/unstow operations
     */
    public async unstow (): Promise<boolean> {
        return this.try_handle({ dishStow: { unstow: true } });
    }

    /**
     * Schedules a firmware update on the dish
     */
    public async update (): Promise<boolean> {
        return this.try_handle({ update: {} });
    }
}

export { Dishy };
