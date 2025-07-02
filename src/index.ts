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

export * from './enterprise';
export * from './local';

/**
 * Converts a `gpsTimeS` (the number of seconds since the GPS epoch (1980-01-06 00:00:00 UTC) to a Javascript
 * Date object in UTC
 * @param gpsTimeS
 */
export const gpsTimeToUTCDate = (gpsTimeS: number): Date => {
    const gpsEpoch = new Date(Date.UTC(
        1980,
        0,
        6,
        0,
        0,
        0
    ));

    const gpsUtcOffset = 19; // as of 2025, GPS time is 19 seconds ahead of UTC

    const utcMillis = gpsEpoch.getTime() + (gpsTimeS * 1000) - (gpsUtcOffset * 1000);

    return new Date(utcMillis);
};

/**
 * Converts a `gpsTimeS` (the number of seconds since the GPS epoch (1980-01-06 00:00:00 UTC) to
 * a UTC timestamp
 * @param gpsTimeS
 */
export const gpsTimeToUTC = (gpsTimeS: number): number => gpsTimeToUTCDate(gpsTimeS)
    .getTime();
