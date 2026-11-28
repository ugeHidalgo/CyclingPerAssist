# Implementation Plan: Data Panel Experience

**Branch**: `Defining-specs-for-data-panel-desgin` | **Date**: 2026-11-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-data-panel/spec.md`

## Summary

Wrap the existing FIT activity chart in one movable and resizable Data Panel. Keep activity
file access and parsing in the React client, persist only panel setup metadata through a local
ASP.NET Core API, and store that setup in PostgreSQL 16. The API and database run as separate
processes in the same Docker container, with PostgreSQL data on a named volume.

The browser cannot expose an absolute filesystem path. The specification now uses an opaque
source-handle identifier and filename in the API setup, with the actual browser file handle in
IndexedDB. Automatic source restoration is conditional on the handle and browser permission
remaining available.

## Technical Context

**Language/Version**: Existing frontend: TypeScript, React 19, Node.js 24 build image. Backend:
C# / .NET 10 LTS (`net10.0`), ASP.NET Core 10.

**Primary Dependencies**: Existing Vite, React Router, FIT parser, and Recharts. Backend:
Entity Framework Core 10 and Npgsql EF Core provider 10.x. Browser file restoration uses the
File System Access API and IndexedDB where supported.

**Storage**: PostgreSQL 16 stores one panel setup per owner. A Docker named volume holds
`PGDATA`. The browser stores only the `FileSystemFileHandle` in IndexedDB; the API stores its
opaque UUID and the filename, never file contents, telemetry, or an absolute path.

**Testing**: Existing Vitest, Testing Library, and Playwright Chromium suites; xUnit tests for
the .NET API; PostgreSQL 16 integration tests against a real database container; migration
validation against an empty database; browser tests for file-handle persistence, permissions,
layout, save/retry, and privacy.

**Target Platform**: Local application served on `http://localhost:8080` by Docker Compose.
Persistent file restoration requires a browser implementing the File System Access API
(Chromium-based desktop browsers); ordinary file selection remains available as a session-only
fallback elsewhere. The API is same-origin and bound to loopback; PostgreSQL is not published
to the host.

**Project Type**: Local full-stack web application: React single-page application, C# Web API,
and PostgreSQL packaged in one application container.

**Performance Goals**: No numeric performance target is specified. Reuse the current chart and
measure layout/rendering with representative FIT fixtures; do not introduce a guessed threshold.

**Constraints**: Exactly one panel and one default owner in v1; no login. The browser reads and
parses activity bytes locally. Only setup metadata crosses the API boundary. Persist geometry
in CSS pixels with 200-by-200 minimum dimensions. A missing or unauthorized local handle must
show the specified unavailable state. The API and PostgreSQL must share one container as
specified in the design input; persist database files outside the container writable layer.

**Scale/Scope**: One saved setup per owner, one default owner in v1, one chart using the existing
activity domain model. No additional panel types, chart types, activity formats, or account
system.

## Constitution Check

*GATE: Pass before research and after Phase 1 design.*

| Principle | Design and validation |
| --- | --- |
| Local processing and privacy | Read and parse through the existing browser FIT adapter. Store handles only in browser IndexedDB; send only setup fields and an opaque handle UUID to the same-origin API. Bind the service to loopback and verify that neither file bytes nor telemetry appear in requests, database rows, or logs. |
| Data integrity and explicit units | Reuse the existing activity model and chart without changing measurements or unit conversions. Persist only panel geometry and source identity metadata. |
| Missing and corrupt telemetry | Keep the current FIT parsing and validation rules. A failed replacement retains the last valid chart; a missing or unauthorized startup handle shows the specified warning and blank chart. |
| Test-first parsing and calculations | No new parsing or calculation behavior is planned. Add focused tests before changing import-state behavior or chart sizing; keep existing parser and calculation suites green. |
| Format-independent domain model | The panel consumes the existing format-independent activity model; it does not depend on FIT parser output directly. |
| Clear errors | Surface API, database, IndexedDB, file-permission, and save failures explicitly. Failed saves retain the unsaved UI state and do not replace the previously committed setup. |
| Simplicity and measurable performance | One panel, one default owner, one setup row, and no new account or integration flows. The database is explicitly required by this feature. No performance threshold is invented. |

**Pre-research result**: PASS. **Post-design result**: PASS. The single-container multi-process
layout is non-idiomatic Docker packaging but is an explicit design requirement; mitigate it with
a supervisor, readiness checks, graceful shutdown, and an external named volume.

## Project Structure

### Documentation (this feature)

```text
specs/002-data-panel/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── panel-setup-api.yaml
├── checklists/
│   └── requirements.md
└── tasks.md              # Future /speckit-tasks output
```

### Source Code (repository root)

Proposed future paths; the planning workflow does not implement these files.

```text
src/
├── app/
│   └── ActivityScreen.tsx
├── components/
│   ├── DataPanel/
│   ├── SpeedChart.tsx
│   └── ImportError.tsx
├── domain/
│   ├── activity.ts
│   ├── importState.ts
│   └── panelSetup.ts
├── services/
│   └── panelSetupApi.ts
└── storage/
    └── activityFileHandles.ts

backend/
├── CyclingPerformanceAssistant.sln
├── src/
│   └── CyclingPerformanceAssistant.Api/
│       ├── Contracts/
│       ├── Data/
│       ├── Migrations/
│       └── Program.cs
└── tests/
    └── CyclingPerformanceAssistant.Api.Tests/

tests/
├── unit/
├── integration/
└── e2e/

Dockerfile
compose.yaml
```

**Structure Decision**: Keep the existing root-level React/Vite project and its established
`src/` and `tests/` locations. Add a single ASP.NET Core API project rather than splitting this
small persistence feature into multiple backend libraries or adding a repository abstraction.
The API serves the built SPA and `/api` endpoints from the same origin, replacing the current
Nginx-only final image and avoiding a third long-running process. Reuse `ActivityScreen`,
`SpeedChart`, the current parser, and their domain types; add only panel, setup API, and local
handle-storage modules. The development Vite server proxies `/api` to the local API; production
uses same-origin requests and does not require CORS.

Build the SPA and API in multi-stage build stages. The runtime image contains PostgreSQL 16,
the ASP.NET Core runtime, and a lightweight process supervisor. The Compose file defines one
application service named `frontend` and one named volume mounted at PostgreSQL's data directory.
Supervisor runs the PostgreSQL process and the ASP.NET Core process named `backend`; the latter
serves both the API and the built SPA. Supervisor starts PostgreSQL, waits for `pg_isready`,
applies the EF migration, and starts Kestrel; its readiness check covers both backend and
database. On shutdown it stops Kestrel and PostgreSQL gracefully. Publish only the API port on
`127.0.0.1:8080`; do not expose the database port.

## Validation Strategy

- Keep the existing FIT parser, activity domain model, and import error behavior as regression
  boundaries. Add focused panel and file-handle-store tests before changing import state.
- Test title limits, geometry clamping/clipping, the 3-CSS-pixel black border and side/corner resize targets, including disabled resizing while the panel is clipped,
  chart resizing, menu order, keyboard flows, dirty-state comparison, cancelled/failed saves,
  unavailable sources, and prior-chart retention with Vitest and Testing Library.
- Exercise the API and EF migrations against real PostgreSQL 16, including an empty database,
  first-save creation, update, validation errors, database failure, and concurrent upserts.
- Extend the current Playwright privacy tests: permit same-origin setup `GET`/`PUT` containing
  only layout/title/filename/opaque handle metadata; permit the browser-local handle record in
  IndexedDB; continue to reject file bytes, telemetry, browser handle objects, absolute paths,
  third-party requests, and sensitive log output.
- Use Chromium browser scenarios to check file selection, stored-handle restoration when
  permission is already valid, the unavailable fallback when permission is absent, and the
  standard picker fallback where persistent handles are unsupported.
- Make the current fixed-height chart fill the Data Panel's remaining chart area. Validate
  resize behavior at the minimum panel dimensions and at a viewport smaller than the panel.
- Use the browser's native `beforeunload` confirmation for close attempts with unsaved changes;
  verify confirm and cancel behavior without depending on custom browser dialog text.
- Validate persistence across container recreation without deleting the named volume, and
  validate portability with a `pg_dump -Fc` / `pg_restore` round trip. A moved database does not
  transfer the browser profile's local file handle.

**Complexity Tracking**: No constitution violations. The API and database are explicit feature
requirements. Co-locating PostgreSQL and the API is an intentional exception to Docker's
one-service-per-container guidance; a process supervisor, health checks, a named volume, and a
documented `pg_dump`/`pg_restore` move procedure address its lifecycle and portability risks.
The container image alone does not include the named volume's data.
