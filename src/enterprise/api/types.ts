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

export namespace Starlink {
    export namespace Management {
        export namespace Components {
            export interface Account {
                /**
                 * The Account Number. Example: ACC-511274-31364-54
                 */
                accountNumber: string;
                /**
                 * The region code of the account. Example: US
                 */
                regionCode: string;
                /**
                 * The name of the account
                 */
                accountName: string | null;
                /**
                 * Default router config on the account
                 */
                defaultRouterConfigId: string | null;
            }

            export interface DataUsage<DateType extends string | Date = string> {
                date: DateType;
                priorityGB: number;
                optInPriorityGB: number;
                standardGB: number;
                nonBillableGB: number;
            }

            export interface OverageLine {
                restricted: number;
                unrestricted: number;
                pricePerGB: number;
                usageLimitGB: number;
                overageAmountGB: number;
                overagePrice: number;
                productId: string | null;
            }

            export interface BillingCycle<DateType extends string | Date = string> {
                startDate: DateType;
                endDate: DateType;
                dailyDataUsage: DataUsage<DateType>[] | null;
                overageLines: OverageLine[] | null;
                totalPriorityGB: number;
                totalStandardGB: number;
                totalOptInPriorityGB: number;
                totalNonBillableGB: number
            }

            export interface DataBucket {
                dataBucket: number;
                totalGB: number;
            }

            export interface ServiceLineBillingCycle<DateType extends string | Date = string> {
                startDate: DateType;
                endDate: DateType;
                dataUsage: DataBucket[] | null;
                dailyDataUsages: {
                    date: DateType;
                    dataUsageBins: DataBucket[] | null;
                }[] | null;
                overageLines: OverageLine[] | null;
            }

            export interface ServicePlan<DateType extends string | Date = string> {
                isoCurrencyCode: string | null;
                isMobilePlan: boolean;
                activeFrom: DateType | null;
                subscriptionActiveFrom: DateType | null;
                subscriptionEndDate: DateType | null;
                overageName: string | null;
                overageDescription: string | null;
                isOptedIntoOverage: boolean;
                overageLineDeactivatedDate: DateType | null;
                overageLine: OverageLine;
                productId: string | null;
                usageLimitGB: number;
            }

            export interface Address {
                addressLines: string[];
                locality?: string | null;
                administrativeArea?: string | null;
                administrativeAreaCode: string;
                region?: string | null;
                regionCode: string;
                postalCode?: string | null;
                metadata?: string | null;
                formattedAddress: string;
                latitude: number;
                longitude: number;
            }

            export interface AddressId extends Required<Address> {
                addressReferenceId: string;
            }

            export interface RealtimeDataTracking<DateType extends string | Date = string> {
                accountNumber: string | null;
                serviceLineNumber: string | null;
                startDate: DateType;
                endDate: DateType;
                billingCycles: BillingCycle<DateType>[] | null;
                servicePlan: ServicePlan<DateType>;
                lastUpdated: DateType | null;
            }

            export interface ServiceLineDataUsage<DateType extends string | Date = string>
                extends Omit<RealtimeDataTracking<DateType>, 'serviceLineNumber' | 'billingCycles'> {
                assetNumber: string | null;
                billingCycles: ServiceLineBillingCycle<DateType>[] | null;
            }

            export interface Router {
                routerId: string;
                /**
                 * Account Number this router is bonded to.
                 */
                accountNumber: string;
                /**
                 * User terminal Id this router is bonded to.
                 */
                userTerminalId: string;
                /**
                 * Router config this router is assigned to, or empty if no config assigned.
                 */
                configId: string;
                /**
                 * True if this router is known to be directly connected to a user terminal.
                 */
                directLinkToDish: boolean;
                /**
                 * Hardware version of the router: 'v1', 'v2', or 'v3'.
                 */
                hardwareVersion: string;
            }

            export interface RouterConfig {
                accountNumber: string;
                configId: string;
                nickname: string;
            }

            export interface SubscriptionProduct {
                productReferenceId: string;
                name: string;
                price: number;
                isoCurrencyCode: string;
                isSla: boolean;
            }

            export interface Subscription<DateType extends string | Date = string> {
                /**
                 * Subscription Reference ID. Example: 55ec6574-10d8-bd9c-1951-d4184f4ae467
                 */
                subscriptionReferenceId: string;
                /**
                 * Service Line Number associated with subscription. Example: AST-511274-31364-54
                 */
                serviceLineNumber: string | null;
                /**
                 * Description of the subscription
                 */
                description: string;
                /**
                 * The unique product identifier
                 */
                productReferenceId: string;
                /**
                 * The start date of the subscription. This is in UTC
                 */
                startDate: DateType | null;
                /**
                 * The start date of the subscription rounded to the nearest day. This is in UTC
                 */
                normalizedStartDate: DateType | null;
                /**
                 * The service line deactivation date, which only appears if the service line is deactivated.
                 * This is in UTC
                 */
                endDate: DateType | null;
                /**
                 * The subscription billing end date, which only appears if the service line is deactivated.
                 * The subscription will remain active until this date. This is in UTC
                 */
                serviceEndDate: DateType | null;
                /**
                 * Scheduled product change for the next bill date
                 */
                delayedProductId: string | null;
                /**
                 * Opt-in product id, opted out if empty
                 */
                optInProductId: string | null;
            }

            export interface UserTerminal {
                userTerminalId: string;
                kitSerialNumber: string;
                dishSerialNumber: string;
                serviceLineNumber: string | null;
                active: boolean;
                routers: Router[];
            }

            export interface ServiceLine<DateType extends string | Date = string> {
                /**
                 * Address Reference ID of the address associated with the service line.
                 * Example: 55ec6574-10d8-bd9c-1951-d4184f4ae467
                 */
                addressReferenceId: string;
                /**
                 * The Service Line Number. Example: AST-511274-31364-54
                 */
                serviceLineNumber: string;
                /**
                 * A user-defined nickname for this service line
                 */
                nickname: string | null;
                /**
                 * The unique product identifier
                 */
                productReferenceId: string;
                /**
                 * Scheduled product change for next bill date
                 */
                delayedProductId: string | null;
                /**
                 * Opt-in product id, opted out if empty
                 */
                optInProductId: string | null;
                /**
                 * The start date of the subscription. This is in UTC.
                 */
                startDate: DateType | null;
                /**
                 * The service line deactivation date, which only appears if the service line is deactivated.
                 * This is in UTC.
                 */
                endDate: DateType | null;
                /**
                 * Indicates if service line is public IP
                 */
                publicIp: boolean;
                /**
                 * Indicates if service line is active
                 */
                active: boolean;
            }

            export interface OptInProduct<DateType extends string | Date = string> {
                productId: string | null;
                activatedBySubjectId: string | null;
                activatedDate: DateType;
                deactivatedBySubjectId: string | null;
                deactivatedDate: DateType | null;
            }
        }

        export namespace Request {
            export type CreateAddress = Components.Address;

            export interface UpdateAddress extends CreateAddress {
                addressReferenceId: string;
            }
        }

        export namespace APIResponse {
            export type Account = Components.Account;

            export type Address = Components.AddressId;

            export type RealtimeDataTracking = Components.RealtimeDataTracking;

            export type Router = Components.Router;

            export interface RouterConfig extends Components.RouterConfig {
                routerConfigJson: string;
            }

            export type Subscription = Components.Subscription;

            export type SubscriptionProduct = Components.SubscriptionProduct;

            export type UserTerminal = Components.UserTerminal;

            export type ServiceLine = Components.ServiceLine;

            export type ServiceLineDataUsage = Components.ServiceLineDataUsage;

            export type OptInProduct = Components.OptInProduct;
        }

        export namespace Response {
            export type Account = Components.Account;

            export type Address = Components.AddressId;

            export type RealtimeDataTracking = Components.RealtimeDataTracking<Date>;

            export type Router = Components.Router;

            export interface RouterConfig extends Components.RouterConfig {
                routerConfig: any;
            }

            export type Subscription = Components.Subscription<Date>;

            export type SubscriptionProduct = Components.SubscriptionProduct;

            export interface UserTerminal extends Components.UserTerminal {
                accountNumber: string;
            }

            export interface ServiceLine extends Components.ServiceLine<Date> {
                accountNumber: string;
            }

            export type ServiceLineDataUsage = Components.ServiceLineDataUsage<Date>;

            export type OptInProduct = Components.OptInProduct<Date>;
        }
    }

    export namespace Telemetry {
        export namespace APIResponse {
            export type DataValue = Array<number | string> | boolean | number | null | string;

            export interface Data {
                data: {
                    values: DataValue[][];
                    columnNamesByDeviceType: { [key: string]: string[] };
                };
                metadata: {
                    enums: {
                        DeviceType: { [key: string]: string };
                        AlertsByDeviceType: { [key: string]: { [key: string]: string } };
                    };
                };
            }
        }

        export namespace Components {
            export interface Id {
                UtcTimestampNs: number;
                DeviceId: string;
            }

            export interface Router extends Id {
                WifiUptimeS: number;
                WifiSoftwareVersion: string;
                WifiIsRepeater: boolean;
                WifiIsBypassed: boolean;
                InternetPingDropRate: number;
                InternetPingLatencyMs: number;
                WifiPopPingDropRate: number;
                WifiPopPingLatencyMs: number;
                DishPingDropRate: number;
                DishPingLatencyMs: number;
                Clients: number;
                Clients2Ghz: number;
                Clients5Ghz: number;
                ClientsEth: number;
                WanRxBytes: number;
                WanTxBytes: number;
                Clients2GhzRxRateMbpsMin: number | null;
                Clients2GhzRxRateMbpsMax: number | null;
                Clients2GhzRxRateMbpsAvg: number | null;
                Clients2GhzTxRateMbpsMin: number | null;
                Clients2GhzTxRateMbpsMax: number | null;
                Clients2GhzTxRateMbpsAvg: number | null;
                Clients5GhzRxRateMbpsMin: number | null;
                Clients5GhzRxRateMbpsMax: number | null;
                Clients5GhzRxRateMbpsAvg: number | null;
                Clients5GhzTxRateMbpsMin: number | null;
                Clients5GhzTxRateMbpsMax: number | null;
                Clients5GhzTxRateMbpsAvg: number | null;
                Clients2GhzSignalStrengthMin: number | null;
                Clients2GhzSignalStrengthMax: number | null;
                Clients2GhzSignalStrengthAvg: number | null;
                Clients5GhzSignalStrengthMin: number | null;
                Clients5GhzSignalStrengthMax: number | null;
                Clients5GhzSignalStrengthAvg: number | null;
                DishId: string;
            }

            export interface UserTerminal extends Id {
                DownlinkThroughput: number,
                UplinkThroughput: number,
                PingDropRateAvg: number,
                PingLatencyMsAvg: number,
                ObstructionPercentTime: number,
                Uptime: number,
                SignalQuality: number,
                H3CellId: number,
                SecondsUntilSwupdateRebootPossible: number,
                ActiveAlerts: string []
            }
        }

        export namespace Response {
            export interface Data {
                Router: Components.Router[];
                UserTerminal: Components.UserTerminal[];
                UserTerminalDataUsage: any[];

                [key: string]: any[];
            }
        }
    }

    export namespace Common {
        export namespace Components {
            export interface Member {
                memberNames: string[];
                errorMessage: string;
            }

            export interface IPayload {
                errors: Member[];
                warnings: Member[];
                information: string[];
                isValid: boolean;
            }
        }

        export interface PagedContent<Type = any> extends Components.IPayload {
            content: {
                totalCount: number;
                pageIndex: number;
                limit: number;
                isLastPage: boolean;
                results: Type;
            }
        }

        export interface Content<Type = any> extends Components.IPayload {
            content: Type;
        }
    }

    export type Response = Common.PagedContent | Common.Content | Telemetry.APIResponse.Data;

    export interface Token {
        access_token: string;
        expires_in: number;
        token_type: string;
        scope: string;
    }
}
