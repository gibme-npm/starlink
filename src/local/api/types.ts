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

import type {
    GetConnectionsResponse,
    GetDeviceInfoResponse,
    GetGnssMeasurementResponse,
    GetLocationResponse,
    GetLogResponse,
    GetNetworkInterfacesResponse,
    GetPingResponse,
    GetRadioStatsResponse,
    GetTimeResponse,
    PingHostResponse,
    RunIperfServerResponse,
    SpeedTestResponse,
    SpeedtestStatus
} from '../../protobuf/spacex/api/device/device';
import type {
    TransceiverGetStatusResponse,
    TransceiverGetTelemetryResponse,
    TransceiverIFLoopbackTestResponse
} from '../../protobuf/spacex/api/device/transceiver';
import type {
    DishGetConfigResponse,
    DishGetContextResponse,
    DishGetDiagnosticsResponse,
    DishGetDiagnosticsResponse_Alerts,
    DishGetDiagnosticsResponse_DisablementCode,
    DishGetDiagnosticsResponse_Location,
    DishGetDiagnosticsResponse_TestResult,
    DishGetEmcResponse,
    DishGetHistoryResponse,
    DishGetObstructionMapResponse,
    DishGetRssiScanResultResponse,
    DishGetStatusResponse
} from '../../protobuf/spacex/api/device/dish';
import type {
    WifiBackhaulStatsResponse,
    WifiGetClientHistoryResponse,
    WifiGetClientsResponse,
    WifiGetConfigResponse,
    WifiGetDiagnosticsResponse2,
    WifiGetDiagnosticsResponse2_Network,
    WifiGetFirewallResponse,
    WifiGetHistoryResponse,
    WifiGetPingMetricsResponse,
    WifiGetStatusResponse,
    WifiGuestInfoResponse,
    WifiSelfTestResponse
} from '../../protobuf/spacex/api/device/wifi';

export namespace StarlinkGRPC {
    export namespace Dishy {
        export type Alerts = DishGetDiagnosticsResponse_Alerts;

        export type Config = DishGetConfigResponse;

        export type Connections = GetConnectionsResponse;

        export type Context = DishGetContextResponse;

        export type DeviceInfo = GetDeviceInfoResponse;

        export type DiagLocation = DishGetDiagnosticsResponse_Location;

        export interface Diagnostics extends Omit<
            DishGetDiagnosticsResponse,
            'alerts' | 'disablementCode' | 'hardwareSelfTest' | 'location'
        > {
            alerts?: Alerts;
            disablementCode: DisablementCode;
            hardwareSelfTest: HardwareTestResult;
            location?: DiagLocation;
        }

        export type DisablementCode = DishGetDiagnosticsResponse_DisablementCode;

        export type EmcStatus = DishGetEmcResponse;

        export type GnssMeasurement = GetGnssMeasurementResponse;

        export type HardwareTestResult = DishGetDiagnosticsResponse_TestResult;

        export type History = DishGetHistoryResponse;

        export type IperfServer = RunIperfServerResponse;

        export type Logs = GetLogResponse;

        export type Location = GetLocationResponse;

        export type NetworkInterfaces = GetNetworkInterfacesResponse;

        export type ObstructionMap = DishGetObstructionMapResponse;

        export type Ping = GetPingResponse;

        export type PingHost = PingHostResponse;

        export type RadioStats = GetRadioStatsResponse;

        export type RssiScanResult = DishGetRssiScanResultResponse;

        export type SpeedTest = SpeedTestResponse;

        export type SpeedtestStatusInfo = SpeedtestStatus;

        export type Status = DishGetStatusResponse;

        export type Time = GetTimeResponse;

        export type TransceiverLoopback = TransceiverIFLoopbackTestResponse;

        export type TransceiverStatus = TransceiverGetStatusResponse;

        export type TransceiverTelemetry = TransceiverGetTelemetryResponse;
    }

    export namespace WifiRouter {
        export type BackhaulStats = WifiBackhaulStatsResponse;

        export type ClientHistory = WifiGetClientHistoryResponse;

        export type Clients = WifiGetClientsResponse;

        export type Config = WifiGetConfigResponse;

        export interface Diagnostics extends Omit<WifiGetDiagnosticsResponse2, 'networks'> {
            networks: Network[];
        }

        export type Firewall = WifiGetFirewallResponse;

        export type GuestInfo = WifiGuestInfoResponse;

        export type History = WifiGetHistoryResponse;

        export type Network = WifiGetDiagnosticsResponse2_Network;

        export type PingMetrics = WifiGetPingMetricsResponse;

        export type SelfTest = WifiSelfTestResponse;

        export type Status = WifiGetStatusResponse;
    }
}
