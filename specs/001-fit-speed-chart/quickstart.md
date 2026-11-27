# Quickstart: FIT Activity Speed Chart

This guide validates the implemented browser application and its privacy boundary.

## Prerequisites

- Node.js 22.12 or later and npm.
- Docker with Compose.
- Chromium for Playwright (`npx playwright install chromium`).
- Use only authorized, anonymized FIT/GPX examples. The committed fixtures' provenance and
  expected observations are documented in [`tests/fixtures/README.md`](../../tests/fixtures/README.md).
  Do not upload personal activity data or commit unapproved fixtures.

## Build and run after implementation

From the repository root:

```sh
npm ci
npm test
npm run build
docker compose config -q
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
2. Load `valid-activity.fit`: its name, chart, axis units, and missing-speed gap warning appear.
3. Load `incomplete-data.fit` and `recorded-pause.fit`: omitted-record warnings appear and the
   SVG line has disconnected segments across missing-speed and pause gaps.
4. Load GPX, a FIT without speed, and a checksum-corrupt FIT: each produces its specific error.
   A failed replacement retains the previous successful chart and filename.
5. Select two files rapidly with a delayed first read: the newest selection remains active.
6. Load an activity and inspect requests, browser storage, and console output. No activity bytes,
   derived telemetry, or activity details may be transmitted, persisted, or logged. Refresh and
   confirm no activity is restored.
7. Simulate a recoverable file-read failure both before the first successful load and while a
   prior chart is active. The app shows an actionable error and retains any prior chart.

## Sample performance measurement

Measurements were taken against the Compose-served app in Playwright Chromium 159.0.8154.6.
For each fixture, five fresh browser contexts were used. Load/render time is measured from the
file-input selection to the chart SVG becoming visible. Resource use is the difference in
Chromium CDP `JSHeapUsedSize` immediately before selection and after the chart is visible; this
is retained JavaScript heap growth, not peak heap or total process memory. The table reports
medians and observed ranges from this local run.

| Authorized fixture | File bytes | Records | Runs | Median load/render | Range | Median retained heap growth | Range |
|---|---:|---:|---:|---:|---:|---:|---:|
| `recorded-zero.fit` | 84 | 3 | 5 | 32 ms | 31–43 ms | 2.50 MiB | 2.48–2.79 MiB |
| `valid-activity.fit` | 22,351 | 3,172 | 5 | 110 ms | 108–114 ms | 10.87 MiB | 9.76–10.92 MiB |

These are environment-specific observations, not acceptance thresholds. No numeric performance
target or fixed file-size limit is established by this sample.

See [screen contract](./contracts/activity-screen.md) and [data model](./data-model.md).
