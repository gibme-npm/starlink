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
export { StarlinkGRPC };

export default class Dishy extends GRPCApi {
    constructor (
        host = '192.168.100.1',
        port = 9200,
        timeout?: number
    ) {
        super(host, port, timeout);
    }

    /**
     * Fetches diagnostic information from a dishy
     */
    public async fetch_diagnostics (): Promise<StarlinkGRPC.Dishy.Diagnostics> {
        const response = await this.handle({ getDiagnostics: {} });

        if (!response.dishGetDiagnostics) {
            throw new Error(`No diagnostics returned from ${this.host}:${this.port}`);
        }

        return response.dishGetDiagnostics;
    }

    /**
     * Fetches history information from a dishy
     */
    public async fetch_history (): Promise<StarlinkGRPC.Dishy.History> {
        const response = await this.handle({ getHistory: {} });

        if (!response.dishGetHistory) {
            throw new Error(`No history returned from ${this.host}:${this.port}`);
        }

        return response.dishGetHistory;
    }

    /**
     * Fetches location information from a dishy
     *
     * Note: Location information must be enabled in the dishy settings
     */
    public async fetch_location (): Promise<StarlinkGRPC.Dishy.Location> {
        const response = await this.handle({ getLocation: {} });

        if (!response.getLocation) {
            throw new Error(`No location returned from ${this.host}:${this.port}`);
        }

        return response.getLocation;
    }

    /**
     * Fetches obstruction map information from a dishy
     */
    public async fetch_obstruction_map (): Promise<StarlinkGRPC.Dishy.ObstructionMap> {
        const response = await this.handle({ dishGetObstructionMap: {} });

        if (!response.dishGetObstructionMap) {
            throw new Error(`No obstruction map returned from ${this.host}:${this.port}`);
        }

        return response.dishGetObstructionMap;
    }

    /**
     * Fetches status information from a dishy
     */
    public async fetch_status (): Promise<StarlinkGRPC.Dishy.Status> {
        const response = await this.handle({ getStatus: {} });

        if (!response.dishGetStatus) {
            throw new Error(`No status returned from ${this.host}:${this.port}`);
        }

        return response.dishGetStatus;
    }

    /**
     * Issues a reboot request to a dishy
     */
    public async reboot (): Promise<boolean> {
        try {
            await this.handle({ reboot: { } });

            return true;
        } catch {
            return false;
        }
    }

    /**
     * Issues a stow request to a dishy
     *
     * Note: The dishy must support stow/unstow operations
     */
    public async stow (): Promise<boolean> {
        try {
            await this.handle({ dishStow: { unstow: false } });

            return true;
        } catch {
            return false;
        }
    }

    /**
     * Issues an unstow request to a dishy
     *
     * Note: The dishy must support stow/unstow operations
     */
    public async unstow (): Promise<boolean> {
        try {
            await this.handle({ dishStow: { unstow: true } });

            return true;
        } catch {
            return false;
        }
    }
}

export { Dishy };
