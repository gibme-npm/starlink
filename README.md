# Starlink API Tooling

This package is not affiliated with or acting on behalf of Starlink™️

## Requirements

* Node.js >= 22

## Installation

```bash
npm install @gibme/starlink
```

or

```bash
yarn add @gibme/starlink
```

## Features

### Local Device API (gRPC)

Communicate directly with Starlink hardware on your local network via gRPC.

* **Dishy** (Satellite Dish)
  * `fetch_diagnostics()` - Detailed diagnostics including alerts, tests, and location
  * `fetch_status()` - Current device status
  * `fetch_history()` - Connection history data
  * `fetch_location()` - GPS location (requires location enabled in dish settings)
  * `fetch_obstruction_map()` - Obstruction map data
  * `reboot()` - Issue a reboot command
  * `stow()` / `unstow()` - Stow or deploy the dish
* **WiFi Router**
  * `fetch_diagnostics()` - Router diagnostics and network information

### [Enterprise API](https://starlink-enterprise-guide.readme.io/docs/account-management-tools) (Enterprise API Access Required)

Full enterprise account management via the Starlink REST API.

* **Account Management** - Fetch and manage enterprise accounts
* **Address Management** - Create, fetch, update addresses; check service capacity at a location
* **Service Lines** - Create, fetch, and remove service lines; fetch daily usage and billing periods
* **User Terminals** - Add, fetch, and remove terminals; search by UT ID, serial, or kit serial
* **Router Configuration** - Create, fetch, update, and deploy router configs
* **Products & Billing** - Fetch available subscription products and real-time data usage tracking
* **Telemetry** - Stream real-time device telemetry including router telemetry, terminal telemetry, data usage, IP allocations, and active alerts

### Subpath Imports

The package provides focused entry points for tree-shaking or targeted imports:

| Import Path | Description |
|---|---|
| `@gibme/starlink` | Full API (enterprise + local devices + utilities) |
| `@gibme/starlink/enterprise` | Enterprise API only |
| `@gibme/starlink/dishy` | Local Dishy device API only |
| `@gibme/starlink/wifirouter` | Local WiFi Router device API only |

### Utility Functions

* `gpsTimeToUTC(gpsTimeS)` - Convert GPS time (seconds since 1980-01-06 UTC) to a UTC timestamp
* `gpsTimeToUTCDate(gpsTimeS)` - Convert GPS time to a `Date` object in UTC

## Special Notice

* The package build process generates TypeScript code from `*.proto` definitions into `./src/protobuf/spacex`
  * The `protoc` binary is required to build the TypeScript files
    * Ubuntu: `apt install protobuf-compiler`
    * Mac OSX: `brew install protobuf`
    * Windows: `choco install protoc`
  * If you are working on this package, or load this package from git, you will need to manually run `yarn build:protobuf` to generate the protobuf code

* The Device API calls listed above were tested as working against the following software versions; for all other versions, your mileage may vary:
  * Dishy
    * `186897dc-8910-40f9-bb84-c53a5e8404c9.uterm_manifest.release`

## Documentation

[https://gibme-npm.github.io/starlink/](https://gibme-npm.github.io/starlink/)

## Sample Code

### Dishy

```typescript
import { Dishy } from '@gibme/starlink/dishy';

const dishy = new Dishy();

const diagnostics = await dishy.fetch_diagnostics();

console.log(diagnostics);
```

### WiFi Router

```typescript
import { WiFiRouter } from '@gibme/starlink/wifirouter';

const router = new WiFiRouter();

const diagnostics = await router.fetch_diagnostics();

console.log(diagnostics);
```

### Enterprise API

```typescript
import { StarlinkAPI } from '@gibme/starlink/enterprise';

const api = new StarlinkAPI('<client_id>', '<client_secret>');

const accounts = await api.fetch_accounts();

const data = await accounts[0].fetch_realtime_data_tracking();

console.log(data);
```

### Telemetry Streaming

```typescript
import { StarlinkAPI } from '@gibme/starlink/enterprise';

const api = new StarlinkAPI('<client_id>', '<client_secret>');

const accounts = await api.fetch_accounts();

const telemetry = await accounts[0].telemetry();

console.log(telemetry);
```

## Thanks

Many thanks go to [starlink-rs](https://github.com/ewilken/starlink-rs) for the older version of the base Protocol Buffers definitions for the gRPC server.
