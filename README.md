# Cycling Performance Assistant

A browser-based cycling activity viewer that locally validates FIT files and displays recorded
speed over elapsed time. The current implementation does not upload activity data or store it
in persistent browser storage.

## Prerequisites

- Node.js 22.12 or later and npm.
- Docker with Docker Compose.
- Chromium for Playwright browser tests (`npx playwright install chromium`).

## Fixture authorization and privacy

The committed files in [`tests/fixtures/`](./tests/fixtures/) are synthetic or authorized,
anonymized examples. Do not add a personal activity file unless its use is authorized and all
personal location, profile, device, and other identifying data have been removed. See the
[fixture provenance and expected observations](./tests/fixtures/README.md).

Activity files are read and processed in the browser. The static Docker service serves the app
only; it does not receive activity bytes or derived telemetry.

## Install and validate

From the repository root:

```sh
npm ci
npm test
npm run build
```

## Run the application and browser tests

Start the static app in Docker Compose and confirm it is available:

```sh
docker compose config -q
docker compose up --build -d
curl -f http://127.0.0.1:8080/
```

Install the Playwright browser once, then run the real-browser scenarios against the running
Compose service:

```sh
npx playwright install chromium
npm run test:e2e
```

Stop the service when validation is complete:

```sh
docker compose down
```

For the detailed scenarios and performance-measurement method, see the
[feature quickstart](./specs/001-fit-speed-chart/quickstart.md).
