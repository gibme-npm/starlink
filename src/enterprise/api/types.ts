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
                 * The name of the account
                 */
                accountName: string | null;
                /**
                 * The Account Number. Example: ACC-511274-31364-54
                 */
                accountNumber: string;
                /**
                 * Default router config on the account
                 */
                defaultRouterConfigId: string | null;
                /**
                 * The region code of the account. Example: US
                 */
                regionCode: string;
            }

            export interface DataUsage<DateType extends Date | string = string> {
                date: DateType;
                nonBillableGB: number;
                optInPriorityGB: number;
                priorityGB: number;
                standardGB: number;
            }

            export interface OverageLine {
                consumedAmountGB: number;
                dataOverageType: number;
                overageAmountGB: number;
                overagePrice: number;
                pricePerGB: number;
                productId: string | null;
                restricted: number;
                unrestricted: number;
                usageLimitGB: number;
            }

            export interface BillingCycle<DateType extends Date | string = string> {
                dailyDataUsage: DataUsage<DateType>[] | null;
                endDate: DateType;
                overageLines: OverageLine[] | null;
                startDate: DateType;
                totalNonBillableGB: number;
                totalOptInPriorityGB: number;
                totalPriorityGB: number;
                totalStandardGB: number;
            }

            export interface DataBucket {
                dataBucket: number;
                totalGB: number;
            }

            export interface ServiceLineBillingCycle<DateType extends Date | string = string> {
                dailyDataUsages: {
                    dataUsageBins: DataBucket[] | null;
                    date: DateType;
                }[] | null;
                dataUsage: DataBucket[] | null;
                endDate: DateType;
                overageLines: OverageLine[] | null;
                startDate: DateType;
            }

            export interface DataCategoryMapping {
                [key: string]: any;
                nonBillableGB: number;
                priorityGB: number;
                standardGB: number;
            }

            export interface ServicePlan<DateType extends Date | string = string> {
                activeFrom: DateType | null;
                dataCategoryMapping: DataCategoryMapping | null;
                isMobilePlan: boolean;
                isoCurrencyCode: string | null;
                isOptedIntoOverage: boolean;
                overageDescription: string | null;
                overageLine: OverageLine;
                overageLineDeactivatedDate: DateType | null;
                overageName: string | null;
                productId: string | null;
                subscriptionActiveFrom: DateType | null;
                subscriptionEndDate: DateType | null;
                usageLimitGB: number;
            }

            export interface Address {
                addressLines: string[];
                administrativeArea?: string | null;
                administrativeAreaCode: string;
                formattedAddress: string;
                latitude: number;
                locality?: string | null;
                longitude: number;
                metadata?: string | null;
                postalCode?: string | null;
                region?: string | null;
                regionCode: string;
            }

            export interface AddressId extends Required<Address> {
                addressReferenceId: string;
            }

            export interface RealtimeDataTracking<DateType extends Date | string = string> {
                accountNumber: string | null;
                billingCycles: BillingCycle<DateType>[] | null;
                endDate: DateType;
                lastUpdated: DateType | null;
                serviceLineNumber: string | null;
                servicePlan: ServicePlan<DateType>;
                startDate: DateType;
            }

            export interface ServiceLineDataUsage<DateType extends Date | string = string>
                extends Omit<RealtimeDataTracking<DateType>, 'billingCycles' | 'serviceLineNumber'> {
                assetNumber: string | null;
                billingCycles: ServiceLineBillingCycle<DateType>[] | null;
            }

            export interface Router {
                /**
                 * Account Number this router is bonded to.
                 */
                accountNumber: string;
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
                routerId: string;
                /**
                 * User terminal Id this router is bonded to.
                 */
                userTerminalId: string;
            }

            export interface RouterConfig {
                accountNumber: string;
                configId: string;
                nickname: string;
            }

            export interface SubscriptionProduct {
                isoCurrencyCode: string;
                isSla: boolean;
                name: string;
                price: number;
                productReferenceId: string;
            }

            export interface Subscription<DateType extends Date | string = string> {
                /**
                 * Scheduled product change for the next bill date
                 */
                delayedProductId: string | null;
                /**
                 * Description of the subscription
                 */
                description: string;
                /**
                 * The service line deactivation date, which only appears if the service line is deactivated.
                 * This is in UTC
                 */
                endDate: DateType | null;
                /**
                 * The start date of the subscription rounded to the nearest day. This is in UTC
                 */
                normalizedStartDate: DateType | null;
                /**
                 * Opt-in product id, opted out if empty
                 */
                optInProductId: string | null;
                /**
                 * The unique product identifier
                 */
                productReferenceId: string;
                /**
                 * The subscription billing end date, which only appears if the service line is deactivated.
                 * The subscription will remain active until this date. This is in UTC
                 */
                serviceEndDate: DateType | null;
                /**
                 * Service Line Number associated with subscription. Example: AST-511274-31364-54
                 */
                serviceLineNumber: string | null;
                /**
                 * The start date of the subscription. This is in UTC
                 */
                startDate: DateType | null;
                /**
                 * Subscription Reference ID. Example: 55ec6574-10d8-bd9c-1951-d4184f4ae467
                 */
                subscriptionReferenceId: string;
            }

            export interface UserTerminal {
                active: boolean;
                dishSerialNumber: string;
                kitSerialNumber: string;
                routers: Router[];
                serviceLineNumber: string | null;
                userTerminalId: string;
            }

            export interface ServiceLine<DateType extends Date | string = string> {
                /**
                 * Indicates if service line is active
                 */
                active: boolean;
                /**
                 * Address Reference ID of the address associated with the service line.
                 * Example: 55ec6574-10d8-bd9c-1951-d4184f4ae467
                 */
                addressReferenceId: string;
                /**
                 * Scheduled product change for next bill date
                 */
                delayedProductId: string | null;
                /**
                 * The service line deactivation date, which only appears if the service line is deactivated.
                 * This is in UTC.
                 */
                endDate: DateType | null;
                /**
                 * A user-defined nickname for this service line
                 */
                nickname: string | null;
                /**
                 * Opt-in product id, opted out if empty
                 */
                optInProductId: string | null;
                /**
                 * The unique product identifier
                 */
                productReferenceId: string;
                /**
                 * Indicates if service line is public IP
                 */
                publicIp: boolean;
                /**
                 * The Service Line Number. Example: AST-511274-31364-54
                 */
                serviceLineNumber: string;
                /**
                 * The start date of the subscription. This is in UTC.
                 */
                startDate: DateType | null;
            }

            export interface OptInProduct<DateType extends Date | string = string> {
                activatedBySubjectId: string | null;
                activatedDate: DateType;
                deactivatedBySubjectId: string | null;
                deactivatedDate: DateType | null;
                productId: string | null;
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
            export type DataValue = Array<number | string> | boolean | number | string | null;

            export interface Data {
                data: {
                    columnNamesByDeviceType: Record<string, string[]>;
                    values: DataValue[][];
                };
                metadata: {
                    enums: {
                        AlertsByDeviceType: Record<string, Record<string, string>>;
                        DeviceType: Record<string, string>;
                    };
                };
            }
        }

        export namespace Components {
            export interface Id {
                DeviceId: string;
                UtcTimestampNs: number;
            }

            export interface Router extends Id {
                Clients: number;
                Clients2Ghz: number;
                Clients2GhzRxRateMbpsAvg: number | null;
                Clients2GhzRxRateMbpsMax: number | null;
                Clients2GhzRxRateMbpsMin: number | null;
                Clients2GhzSignalStrengthAvg: number | null;
                Clients2GhzSignalStrengthMax: number | null;
                Clients2GhzSignalStrengthMin: number | null;
                Clients2GhzTxRateMbpsAvg: number | null;
                Clients2GhzTxRateMbpsMax: number | null;
                Clients2GhzTxRateMbpsMin: number | null;
                Clients5Ghz: number;
                Clients5GhzRxRateMbpsAvg: number | null;
                Clients5GhzRxRateMbpsMax: number | null;
                Clients5GhzRxRateMbpsMin: number | null;
                Clients5GhzSignalStrengthAvg: number | null;
                Clients5GhzSignalStrengthMax: number | null;
                Clients5GhzSignalStrengthMin: number | null;
                Clients5GhzTxRateMbpsAvg: number | null;
                Clients5GhzTxRateMbpsMax: number | null;
                Clients5GhzTxRateMbpsMin: number | null;
                ClientsEth: number;
                DishId: string;
                DishPingDropRate: number;
                DishPingLatencyMs: number;
                InternetPingDropRate: number;
                InternetPingLatencyMs: number;
                WanRxBytes: number;
                WanTxBytes: number;
                WifiIsBypassed: boolean;
                WifiIsRepeater: boolean;
                WifiPopPingDropRate: number;
                WifiPopPingLatencyMs: number;
                WifiSoftwareVersion: string;
                WifiUptimeS: number;
            }

            export interface UserTerminal extends Id {
                ActiveAlerts: string [];
                DownlinkThroughput: number;
                H3CellId: number;
                ObstructionPercentTime: number;
                PingDropRateAvg: number;
                PingLatencyMsAvg: number;
                RunningSoftwareVersion: string;
                SecondsUntilSwupdateRebootPossible: number;
                SignalQuality: number;
                UplinkThroughput: number;
                Uptime: number;
            }
        }

        export namespace Response {
            export interface Data {
                [key: string]: any[];
                Router: Components.Router[];
                UserTerminal: Components.UserTerminal[];
                UserTerminalDataUsage: any[];
            }
        }
    }

    export namespace Common {
        export namespace Components {
            export interface Member {
                errorMessage: string;
                memberNames: string[];
            }

            export interface IPayload {
                errors: Member[];
                information: string[];
                isValid: boolean;
                warnings: Member[];
            }
        }

        export interface PagedContent<Type = any> extends Components.IPayload {
            content: {
                isLastPage: boolean;
                limit: number;
                pageIndex: number;
                results: Type;
                totalCount: number;
            };
        }

        export interface Content<Type = any> extends Components.IPayload {
            content: Type;
        }
    }

    export type Response = Common.Content | Common.PagedContent | Telemetry.APIResponse.Data;

    export interface Token {
        access_token: string;
        expires_in: number;
        scope: string;
        token_type: string;
    }
}
