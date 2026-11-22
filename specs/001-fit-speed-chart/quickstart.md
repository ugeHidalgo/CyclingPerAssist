# Quickstart: FIT Activity Speed Chart

This is the validation guide for the **future implementation**. The application, package
manifest and container configuration do not exist yet; the commands below are planned
acceptance commands, not commands that can be run at the planning stage.

## Prerequisites

- Docker with Compose, and a modern browser running on the same device.
- A Node.js release compatible with the implemented Vite and parser dependencies for local tests.
- Authorized, anonymized representative FIT and GPX files, plus empty, damaged and
  no-speed test inputs. Do not upload personal activity data or commit unapproved fixtures.

## Build and run after implementation

From the repository root:

```sh
npm ci
npm test
npm run build
docker compose up --build -d
docker compose ps
curl -f http://127.0.0.1:8080/
npx playwright install chromium
npm run test:e2e
```

Open `http://127.0.0.1:8080/` in the browser. The browser test script targets the running
Compose service. To stop the service:

```sh
docker compose down
```

## End-to-end validation

1. Open the root route: no login appears; the file selector and empty chart area are visible.
2. Select a valid FIT with known time, speed, a recorded zero and a pause: its name and chart
   appear; horizontal minutes and vertical km/h are labeled. Confirm expected conversion,
   actual zero, and pause/missing-speed gaps against the known fixture.
3. Select GPX, an empty file, a structurally corrupt FIT, and a FIT without speed. Each produces
   the specified clear message. The previous valid chart stays labeled; no partial chart from
   a failed selection appears.
4. Select a valid FIT with timestamp-less and missing-speed records: confirm the omission
   warning and gaps. Verify elapsed time starts at the recorded activity start, falling back to
   the first timestamped record when needed.
5. In browser developer tools, inspect the network and storage while loading a FIT. No activity
   bytes or extracted telemetry may be transmitted or stored; static app requests are expected.
   Refresh/end the session and verify no activity is restored.
6. Record load/render timing and resource usage for representative authorized files, without
   treating an invented threshold as an acceptance criterion.

See [screen contract](./contracts/activity-screen.md) and [data model](./data-model.md).
