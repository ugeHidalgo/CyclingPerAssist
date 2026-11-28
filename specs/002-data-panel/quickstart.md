# Quickstart: Data Panel Experience

This guide validates the Data Panel, local file-access boundary, setup API, PostgreSQL persistence,
and single-container packaging after implementation.

## Prerequisites

- Node.js 22.12 or later and npm.
- .NET 10 SDK.
- Docker with Docker Compose.
- A Chromium-based desktop browser with File System Access API support for persistent file
  restoration. Other browsers can use the regular file picker for the current session.
- Use only authorized, anonymized FIT fixtures documented in
  [`tests/fixtures/README.md`](../../tests/fixtures/README.md).

## Build, test, and run

From the repository root:

```sh
npm ci
npm test
npm run build
dotnet test backend/CyclingPerformanceAssistant.sln
docker compose config -q
docker compose up --build -d
docker compose ps
curl -f http://127.0.0.1:8080/health/ready
curl -f http://127.0.0.1:8080/
```

The Compose stack contains one application container. The API serves the built frontend, and
PostgreSQL 16 runs as a supervised process in that same container. PostgreSQL's data directory
is mounted on a named volume; the database port is not published to the host. To stop the app
without deleting its setup:

```sh
docker compose down
```

Do not use `docker compose down -v` when validating persistence; that removes the named volume.

## Acceptance scenarios

1. **First use**: Open `http://127.0.0.1:8080/`. With no database row, verify one Data Panel at
   the default position and dimensions. Verify the API returns 404 for the unsaved setup and
   that opening the app does not create a row.
2. **Select and render**: Use the options menu and select an authorized FIT fixture. Verify the
   filename appears, the existing chart renders in the panel, and the source file stays in place.
   In a supported browser, verify the browser handle—not file contents—is stored in IndexedDB.
3. **Privacy boundary**: Inspect browser requests and API logs while loading an activity. Only
   panel setup fields, including filename and optional opaque handle UUID, may reach the API.
   Confirm that file bytes, telemetry, browser handle objects, and absolute paths are absent from
   requests, PostgreSQL rows, and application logs.
4. **Panel interactions**: Verify the thin, visible border is distinguishable from the Data
   Area and that side edges and corners are resize targets. Test menu ordering, keyboard-operable
   file selection/title editing/confirmation, title truncation and 200-character limit, pointer
   movement, 200-by-200 minimum dimensions, clipping, and chart resizing.
5. **Confirmed and declined save**: Change geometry, title, and source. Decline Save and verify
   the database row is unchanged while the panel remains dirty and title editing ends. Confirm a
   later Save and verify the row and response match the saved values.
6. **Restart and restore**: Close all application tabs, restart the container with
   `docker compose restart`, then reopen the app. Verify setup fields survive. With a valid,
   previously granted browser permission, the handle restores the activity. Revoke permission,
   remove the local handle, or use a browser without persistent handles and verify the saved
   filename, unavailable warning, blank title, and blank chart.
7. **Save failure and retry**: Use an API test double or database-failure test to make the setup
   write fail. Verify the previous database row is unchanged, current values remain visible and
   dirty, an actionable error is shown, and retry succeeds after the failure is removed.
8. **Concurrent saves**: In two browser contexts using the default owner, confirm saves with
   different values. Verify the last successfully committed write is returned on the next GET;
   no conflict prompt blocks it.
9. **Move with persistent data**: Create a PostgreSQL custom-format backup (`pg_dump -Fc`),
   restore it into a fresh application container with `pg_restore`, and verify the panel setup is
   available. The browser-local handle does not travel with the Docker volume; on a new browser
   profile or host, verify the saved filename is shown as unavailable until a source is selected
   again.
10. **Existing chart behavior**: Verify failed replacement imports preserve the prior valid chart
    and filename, using the existing fixture-based regression tests.

Run the browser suite against the running service with:

```sh
npx playwright install chromium
npm run test:e2e
```

See the [API contract](./contracts/panel-setup-api.yaml) and
[data model](./data-model.md) for request, response, persistence, and validation details.
