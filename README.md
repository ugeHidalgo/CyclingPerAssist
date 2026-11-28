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

Activity files are read and processed in the browser. Docker Compose names the single application
service `frontend`; inside that container, Supervisor runs PostgreSQL and the ASP.NET Core
`backend` process. The backend serves the app and API but does not receive activity bytes or
derived telemetry.

## Install and validate

From the repository root:

```sh
npm ci
npm test
npm run build
```

## Run the full application with Docker Compose

From the repository root, build and start the complete application:

```sh
docker compose config -q
docker compose up --build -d
docker compose ps
curl -f http://127.0.0.1:8080/
docker compose exec frontend pg_isready -h /var/run/postgresql -U postgres -d postgres
```

The Compose service is named `frontend`. It builds the frontend assets and the ASP.NET Core
backend into one application container. Supervisor starts the `backend` process and PostgreSQL 16
inside that container; PostgreSQL data is kept in the named `postgres-data` volume. The web port
is available only on the local machine at `127.0.0.1:8080`, and PostgreSQL is not published to
the host.

To follow application and database logs:

```sh
docker compose logs -f frontend
```

Open [http://127.0.0.1:8080](http://127.0.0.1:8080) to use the app. Install the Playwright browser
once, then run the real-browser scenarios against the running Compose service:

```sh
npx playwright install chromium
npm run test:e2e
```

Stop the application when validation is complete. This keeps the database volume and its setup:

```sh
docker compose down
```

Do not add `-v` to this command unless you intend to delete the database volume.

For the detailed scenarios and performance-measurement method, see the
[feature quickstart](./specs/001-fit-speed-chart/quickstart.md).
