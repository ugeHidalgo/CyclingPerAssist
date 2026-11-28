# Research: Data Panel Experience

**Date**: 2026-11-27

## Decisions

### Local file restoration in a browser

**Decision**: Keep the React browser application. In browsers supporting the File System Access
API, store the selected `FileSystemFileHandle` in IndexedDB under an opaque UUID. Persist only
that UUID and the filename in the API setup. On startup, reopen the source only when the handle
can be retrieved and its read permission is already granted. If it is missing, denied, expired,
or unsupported, use the unavailable-source state; do not request permission on page load because
permission requests require user activation.

**Rationale**: Browser security intentionally prevents web applications from discovering an
arbitrary file's absolute path. Handles can be persisted client-side, but browser permissions
remain revocable and may require a user gesture. The chosen design keeps file bytes and paths out
of the API and preserves the existing local-processing privacy boundary. Browser handles are
bound to the browser profile and origin, so moving a Docker image and database volume does not
move the local file authorization.

**Alternatives considered**:

- A native Electron/Tauri wrapper could obtain filesystem paths, but would add a desktop shell
  and change the current browser/Docker application architecture. The user chose the browser
  approach.
- A standard `<input type="file">` works as a fallback but returns no persistent handle; it
  cannot guarantee restoration after a restart.
- Copying source files into IndexedDB or the origin-private file system would create a separate
  copy rather than reopening the original file, so it is rejected.

**Platform notes**: The File System Access API is supported by most Chromium browsers and is
not available in Firefox or Safari. The picker requires a secure context and a user gesture;
`localhost` is a secure context. Chrome can offer persistent permission ("Allow on every visit")
or automatically persist access for installed apps, but users can revoke it. The implementation
must feature-detect the API and preserve the specified unavailable-source fallback.

### .NET and PostgreSQL version alignment

**Decision**: Target .NET 10 LTS (`net10.0`), ASP.NET Core 10, EF Core 10, and Npgsql EF Core
provider 10.x with PostgreSQL 16. Use the latest servicing patch in each compatible major line
and configure the provider for PostgreSQL 16.

**Rationale**: As of the plan date, .NET 10 is the active LTS release and EF Core 10 requires
the .NET 10 SDK/runtime. The Npgsql provider has a 10.x release line for EF Core 10. PostgreSQL
16 is explicitly specified by the feature input and remains supported through 2028-11-09.
PostgreSQL 16 reaches end of support before .NET 10, so plan a supported PostgreSQL major
upgrade or dump/restore before that date.

**Alternatives considered**: .NET 11 is STS and has the same listed end-of-support date as
.NET 10, so it provides no lifecycle advantage for this plan. A newer PostgreSQL major would
extend support but contradicts the specified PostgreSQL 16 requirement.

### API and persistence boundary

**Decision**: Expose `GET` and `PUT /api/v1/panel-setup` on the same origin. The unauthenticated
v1 service assigns the fixed owner key `default`; the client cannot supply an owner identity.
`PUT` atomically creates the first setup with a server-generated UUID or updates the existing
setup for that owner. A unique database constraint on owner and a PostgreSQL upsert make the
last committed successful save authoritative; no conflict prompt or optimistic-concurrency
token is used.

**Rationale**: The spec requires one default user now and isolation if users are introduced
later. A single upsert avoids duplicate setup rows during concurrent first saves and implements
last-write-wins behavior. The API handles setup metadata only; the browser reads and parses
activity files through the existing adapter.

**Alternatives considered**: Client-provided owner identifiers would allow one user to overwrite
another user's setup once authentication is added. A multi-table user/auth model is outside v1.
Separate endpoints for create and update add no value for the single setup resource.

### Single-container runtime and durable data

**Decision**: Keep the requested one-container package: ASP.NET Core serves the SPA and API;
PostgreSQL 16 runs as a second process under a small supervisor. Store `PGDATA` in a named
Docker volume, keep PostgreSQL off the published host ports, and expose only the loopback-bound
web/API port. The supervisor must order startup, check database readiness, propagate process
failure, and provide graceful shutdown.

**Rationale**: Docker recommends one service per container, but explicitly permits multiple
processes when lifecycle management is handled. The single-container arrangement is specified
in the design input. A Docker image does not contain its mounted volume, and a volume is not a
backup; moving the application requires moving/restoring both the image and database data.
Use PostgreSQL's portable custom dump (`pg_dump -Fc` / `pg_restore`) as the documented move
path. A stopped volume archive is an optional same-major-version alternative, not a live copy.

**Alternatives considered**: Separate API and database Compose services are more idiomatic and
allow independent health, restart, and upgrade policies, but violate the requested same-container
packaging. Keeping Nginx would introduce a third managed process; Kestrel static-file hosting
keeps the single-container process set smaller.

## Sources

- [Chrome: File System Access API](https://developer.chrome.com/docs/capabilities/web-apis/file-system-access) — browser support, secure-context/user-gesture constraints, local file handles, and reading files.
- [Chrome: Persistent permissions for the File System Access API](https://developer.chrome.com/blog/persistent-permissions-for-the-file-system-access-api) — storing handles in IndexedDB, permission restoration, revocation, and persistent permission choices.
- [WICG: File System Access API](https://wicg.github.io/file-system-access/) — permission requests require transient user activation.
- [Microsoft: .NET support policy](https://dotnet.microsoft.com/en-us/platform/support/policy/dotnet-core) — .NET 10 LTS status and support dates as of 2026-11-27.
- [Microsoft: What's new in EF Core 10](https://learn.microsoft.com/en-us/ef/core/what-is-new/ef-core-10.0/whatsnew) — EF Core 10 requires .NET 10.
- [Npgsql EF Core provider](https://www.npgsql.org/efcore/index.html) and [10.0 release notes](https://www.npgsql.org/efcore/release-notes/10.0.html) — provider configuration and EF Core 10 support.
- [PostgreSQL versioning policy](https://www.postgresql.org/support/versioning/) — PostgreSQL 16 support period and major-upgrade requirements.
- [Docker: Run multiple processes in a container](https://docs.docker.com/engine/containers/multi-service_container/) — one-service-per-container guidance and process-supervision options.
- [Docker: Volumes](https://docs.docker.com/engine/storage/volumes/) — volumes persist outside a container's writable-layer lifecycle and can be backed up or migrated.
- [PostgreSQL 16: Backup and Restore](https://www.postgresql.org/docs/16/backup.html) and [`pg_dump`](https://www.postgresql.org/docs/16/app-pgdump.html) — portable logical backup and restore options.
- [Docker: Stop a container](https://docs.docker.com/reference/cli/docker/container/stop/) — signal and grace-period behavior for graceful shutdown.
