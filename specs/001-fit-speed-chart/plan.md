# Implementation Plan: FIT Activity Speed Chart

**Branch**: `Spec-kit-adoption` | **Date**: 2026-11-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-fit-speed-chart/spec.md`

## Summary

Create a single-screen React application served from a Docker container. The browser reads one
user-selected activity locally, validates FIT content and integrity, maps recorded telemetry to
a format-independent in-memory model, and renders speed against elapsed time. The user can retry
after a clear error without losing the previous valid chart. No activity bytes are uploaded or
persisted. The specification includes the edge-case decisions confirmed during planning.

## Technical Context

**Language/Version**: TypeScript, React 19; use a Node.js release supported by the selected Vite
and parser versions for build tooling.

**Primary Dependencies**: Vite, React Router, `fit-file-parser` (MIT), Recharts (MIT), and
browser-compatible `buffer` resolution if needed. Use a package lock and choose compatible
versions during implementation; no dependency manifests currently exist.

**Storage**: Browser memory only; no local/session storage, IndexedDB, cache, database, uploaded
file, or server-side activity data.

**Testing**: Vitest and Testing Library with representative authorized, anonymized FIT samples;
real-browser Docker smoke tests using Playwright are justified to verify file selection, bundling,
and absence of activity uploads.

**Target Platform**: Modern browser on the user's own device; Docker and Docker Compose serve
static assets on the same device. No remote deployment is specified.

**Project Type**: Client-side single-page web application.

**Performance Goals**: No numeric goal is established. Measure load/render time and resource use
with representative files before proposing a target, as required by the constitution.

**Constraints**: Exactly one active activity; no fixed file-size cutoff; local-only processing;
strict FIT validation; missing data is not zero; exact recorded zero remains zero; no partial
chart from a rejected file. Known platform resource limits must surface as clear errors.

**Scale/Scope**: One activity screen, FIT import, speed/time chart, and static container service.
No GPX import, backend, database, accounts, API integration, or additional metrics.

## Constitution Check

*GATE: Pass before research and after Phase 1 design.*

| Principle | Design and validation |
| --- | --- |
| Local processing and privacy | Browser file reading and processing only; static Docker service never receives activity data; verify network requests and browser storage. |
| Data integrity and units | Never modify the source file; preserve recorded values and explicit units; convert m/s to km/h exactly once and test conversion. |
| Missing and corrupt telemetry | Document omissions and gaps; never infer zero for missing speed or pause events; reject structurally invalid input before publishing a chart. |
| Test-first parsing and calculations | Write failing tests first using representative authorized and anonymized FIT examples; cover validation, time, speed and error paths. |
| Format-independent domain model | FIT adapter maps to domain observations; chart depends solely on the domain model. No GPX adapter is needed for this feature. |
| Clear errors | Distinguish unsupported GPX, invalid/corrupt/empty FIT, missing usable speed and operational failure; keep a prior chart clearly identified on replacement errors. |
| Simplicity and measurable performance | One browser app and one static container; avoid unrelated services and features; measure rather than invent a performance threshold. |

**Pre-research result**: PASS. **Post-design result**: PASS; no exceptions requested.

## Project Structure

### Documentation (this feature)

```text
specs/001-fit-speed-chart/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── activity-screen.md
├── checklists/requirements.md
└── tasks.md              # Future /speckit-tasks output
```

### Source Code (repository root)

Proposed future paths; none are implemented by this planning phase:

```text
src/
├── app/                  # Router and main activity screen
├── components/           # File selection, feedback and speed chart
├── domain/               # Format-independent activity and speed observations
└── adapters/             # FIT validation and conversion to domain data
tests/
├── fixtures/             # Authorized, anonymized FIT/GPX examples
├── unit/                 # Adapter, time and speed calculations
└── integration/          # UI and browser/container scenarios
Dockerfile                # Build and static serving stages
compose.yaml              # Single static client service
package.json              # Runtime and test dependencies
```

**Structure Decision**: One root-level frontend project fits the current repository, which has
documentation and example files but no application or dependency manifests. Use a single root
route with React Router; the static server must serve that route and its assets. A multi-stage
container builds the application and serves only the generated static bundle. No activity data
is mounted into, requested by, or submitted to the container. Compose binds the static service
to `127.0.0.1:8080` on the user's device; use locally bundled assets, not remote CDN scripts.

### Screen and data flow

1. The root route opens directly to the activity screen, with a file picker, selected-file
   label and an initially empty chart area; there is no login.
2. On selection, show a loading/validation state. Check content, identify GPX without importing
   it, and reject malformed FIT, bad CRCs, incomplete data and FIT without usable speed.
3. Parse in the browser, convert the result via the FIT adapter, and publish the completed model
   atomically only after validation. On successful replacement, the chart and name update
   together; stale asynchronous selections must not replace a newer one.
4. Plot elapsed minutes against km/h with visible axis units, recorded zeroes, missing-value
   gaps and pause gaps. For missing timestamps, omit the affected records as specified.
5. On a failed replacement, retain and label the previous successful activity while showing a
   clear error for the failed selection. On initial failure, show the error and no chart.
6. Release activity state at session end. Never store activity bytes or extracted data in
   browser persistent storage, container volumes, logs, network requests or external services.

### Validation strategy

- Write tests before implementing parsing or calculations; use authorized, anonymized real FIT
  samples and deliberately damaged variants with known expected observations. The existing
  tracked examples may contain personal location data: do not copy, redistribute or expand
  them as fixtures unless their use is authorized and they are anonymized.
- Test FIT signature and CRC/structural failure, content-based GPX detection, misleading
  extensions, empty files, no speed field, missing per-record timestamps/speeds, pause gaps,
  exact zero, elapsed-time fallback, unit conversion and selection races.
- Test UI states, errors and retained prior chart with Testing Library; use a real browser
  against the container to verify loading, visible units, zero/gaps, refresh disposal and that
  no request carries activity bytes. Include simulated recoverable read/resource failures.
- Define non-watch `npm test` and `npm run test:e2e` scripts; the latter runs the browser tests
  against the running Compose service. A browser or OS process termination caused by memory
  exhaustion cannot be reliably caught by the application and remains a documented limitation.
- Capture empirical load/render times and memory for representative sizes as measurements,
  without adopting a numeric acceptance threshold until separately agreed.

## Complexity Tracking

No constitution violations or exceptions. React Router and Docker Compose are explicit project
choices; the container is a static asset server, not an application backend.
