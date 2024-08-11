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
    DishGetDiagnosticsResponse,
    DishGetDiagnosticsResponse_Alerts,
    DishGetDiagnosticsResponse_Location,
    DishGetDiagnosticsResponse_DisablementCode,
    DishGetDiagnosticsResponse_TestResult,
    DishGetHistoryResponse, DishGetStatusResponse, DishGetObstructionMapResponse
} from '../../protobuf/spacex/api/device/dish';
import type { GetLocationResponse } from '../../protobuf/spacex/api/device/device';
import type {
    WifiGetDiagnosticsResponse2,
    WifiGetDiagnosticsResponse2_Network
} from '../../protobuf/spacex/api/device/wifi';

export namespace StarlinkGRPC {
    export namespace Dishy {
        export type Alerts = DishGetDiagnosticsResponse_Alerts;

        export type DiagLocation = DishGetDiagnosticsResponse_Location;

        export type DisablementCode = DishGetDiagnosticsResponse_DisablementCode;

        export type HardwareTestResult = DishGetDiagnosticsResponse_TestResult;

        export interface Diagnostics extends Omit<DishGetDiagnosticsResponse,
            'alerts' | 'disablementCode' | 'location' | 'hardwareSelfTest'> {
            alerts?: Alerts;
            disablementCode: DisablementCode;
            location?: DiagLocation;
            hardwareSelfTest: HardwareTestResult;
        }

        export type History = DishGetHistoryResponse;

        export type Location = GetLocationResponse;

        export type ObstructionMap = DishGetObstructionMapResponse;

        export type Status = DishGetStatusResponse;
    }

    export namespace WifiRouter {
        export type Network = WifiGetDiagnosticsResponse2_Network;

        export interface Diagnostics extends Omit<WifiGetDiagnosticsResponse2, 'networks'> {
            networks: Network[];
        }
    }
}
