---

description: "Implementation tasks for the Data Panel Experience feature"

---

# Tasks: Data Panel Experience

**Input**: Design documents from `specs/002-data-panel/`

**Prerequisites**: `plan.md` and `spec.md`; supporting decisions and interface constraints in `research.md`, `data-model.md`, `contracts/`, and `quickstart.md`.

**Tests**: Test tasks are included to fulfill the explicit validation strategy in `plan.md`, including focused UI, browser, API, PostgreSQL, and privacy coverage. Add tests before the related behavior changes.

**Organization**: Tasks are grouped by user story so each feature increment can be implemented and validated separately.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: The task can run in parallel with other marked tasks because it changes separate files and has no unfinished prerequisite.
- **[Story]**: The user story served by the task: `[US1]`, `[US2]`, or `[US3]`.
- Every task names the file or path to create or update.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the .NET API project and development integration required by the planned full-stack application.

- [X] T001 Create `backend/CyclingPerformanceAssistant.sln`, the .NET 10 API project at `backend/src/CyclingPerformanceAssistant.Api/CyclingPerformanceAssistant.Api.csproj`, and the xUnit project at `backend/tests/CyclingPerformanceAssistant.Api.Tests/CyclingPerformanceAssistant.Api.Tests.csproj`; add both projects to the solution and configure the API launch profile in `backend/src/CyclingPerformanceAssistant.Api/Properties/launchSettings.json` to listen on `http://localhost:5000`.
- [X] T002 Add EF Core 10, Npgsql EF Core 10.x, and EF migration tooling references to `backend/src/CyclingPerformanceAssistant.Api/CyclingPerformanceAssistant.Api.csproj`; add xUnit and ASP.NET Core integration-test references to `backend/tests/CyclingPerformanceAssistant.Api.Tests/CyclingPerformanceAssistant.Api.Tests.csproj`.
- [X] T003 [P] Configure the Vite development server in `vite.config.ts` to proxy same-origin `/api` requests to `http://localhost:5000`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the shared client model and application runtime used by all user stories.

- [X] T004 Define shared Data Area and Data Panel setup types, client source state, and default panel values in `src/domain/panelSetup.ts`; initialize at the Data Area's upper-left with its width and half its height, subject to the 200-by-200-pixel minimum, an empty title, and no selected source.
- [X] T005 Configure the single-container runtime in `Dockerfile`, `compose.yaml`, `backend/src/CyclingPerformanceAssistant.Api/Runtime/entrypoint.sh`, and `backend/src/CyclingPerformanceAssistant.Api/Runtime/supervisord.conf`: build the SPA and API, name the Compose service `frontend` and the supervised ASP.NET Core process `backend`, run PostgreSQL 16 and Kestrel under supervision, mount a named `PGDATA` volume, publish only the loopback web port, order startup by database readiness, and shut both processes down gracefully.

**Checkpoint**: Shared client types and the planned local application runtime are available before story implementation.

---

## Phase 3: User Story 1 - View an Activity in a Data Panel (Priority: P1) 🎯 MVP

**Goal**: Show exactly one panel with the existing activity chart and controls; load supported activity files locally and preserve a valid chart when a replacement fails.

**Independent Test**: With no saved setup, open the application and verify one blank Data Panel at the specified default position and dimensions. Select a supported FIT file and verify its filename and chart appear while the source stays local. Select an invalid replacement and verify the prior chart and filename remain with a clear error.

### Tests for User Story 1

- [X] T006 [P] [US1] Add reducer tests in `tests/unit/importState.test.ts` that prove a failed replacement retains the last successfully loaded activity and that stale import results cannot replace a newer selection.
- [X] T007 [P] [US1] Add integration coverage in `tests/integration/activityLoading.test.tsx` for the blank default panel, successful FIT selection, filename and chart display, and failed-replacement behavior.
- [X] T008 [P] [US1] Add browser scenarios in `tests/e2e/activity.spec.ts` for selecting an authorized local FIT file, displaying its filename and chart, and preserving local-only file access.

### Implementation for User Story 1

- [X] T009 [US1] Create the initial Data Panel structure and render exactly one panel with title, chart, and options regions at the specified default geometry in `src/components/DataPanel/DataPanel.tsx`, `src/components/DataPanel/OptionsPanel.tsx`, `src/app/ActivityScreen.tsx`, and `src/styles/theme.css`.
- [X] T010 [US1] Adapt the existing file picker and import flow to open from the panel's options area, parse through the existing FIT adapter without moving or copying the source file, display the selected filename immediately beside the options button and existing warnings, and retain the prior chart on failure in `src/components/ActivityPicker.tsx` and `src/app/ActivityScreen.tsx`.
- [X] T011 [US1] Make the existing chart fill the Data Panel's remaining center area and respond to panel-size changes without changing activity measurements in `src/components/SpeedChart.tsx` and `src/styles/theme.css`.
- [X] T012 [US1] Implement browser-local storage and retrieval of `FileSystemFileHandle` objects under client-generated opaque UUIDs, with feature detection and explicit storage errors, in `src/storage/activityFileHandles.ts`; never store file bytes.
- [X] T013 [US1] Connect file selection to the in-memory panel source state and local handle store in `src/app/ActivityScreen.tsx`, `src/components/ActivityPicker.tsx`, `src/domain/panelSetup.ts`, and `src/storage/activityFileHandles.ts`; retain the session-only file-picker fallback when persistent handles are unsupported.

**Checkpoint**: A user can view the existing chart in a default panel, select a local activity, and recover from a failed replacement without losing the last valid chart.

---

## Phase 4: User Story 2 - Arrange and Identify the Data Panel (Priority: P2)

**Goal**: Let the user move and resize the panel, identify it with a title, and operate the specified controls with a keyboard.

**Independent Test**: Starting from the local panel, move it, resize from each side and a corner, and edit its title without saving. Verify dimension limits, clipping, title truncation, chart continuity, menu order, and keyboard operation.

### Tests for User Story 2

- [X] T014 [P] [US2] Add geometry and title-boundary tests in `tests/unit/panelSetup.test.ts` for CSS-pixel movement, 200-pixel minimum dimensions, available-area limits, and the 200-character title limit.
- [ ] T015 [P] [US2] Extend `tests/integration/accessibility.test.tsx` to cover the required options order, keyboard access to the menu and title editor, and keyboard operation of the available dialogs.
- [ ] T016 [P] [US2] Add pointer interaction scenarios in `tests/e2e/activity.spec.ts` for the visible 3-CSS-pixel black border, dragging each side and corner when resizing is enabled, unchanged panel dimensions when the Data Area clips the panel, chart adaptation, and clipping when the viewport is smaller than the panel.

### Implementation for User Story 2

- [ ] T017 [US2] Implement panel geometry helpers in `src/domain/panelSetup.ts` for dragging, side/corner resizing, 200-by-200 minimum dimensions, and clamping to the Data Area when it can contain the panel.
- [ ] T018 [US2] Create the centered title region in `src/components/DataPanel/TitlePanel.tsx` and `src/styles/theme.css`, using the Options Panel's darker surface when read-only and white when editing; preserve the chart during editing, retain the first 200 characters, and display overflow with three dots without changing the saved value.
- [ ] T019 [US2] Implement the keyboard-operable options menu in `src/components/DataPanel/OptionsPanel.tsx` and connect it through `src/components/DataPanel/DataPanel.tsx` with exactly the specified order: file picker, edit title, Save.
- [ ] T020 [US2] Implement panel movement from the non-chart title surface in `src/components/DataPanel/DataPanel.tsx` and `src/styles/theme.css`; give title editing priority over dragging and clip out-of-bounds portions when the Data Area is smaller than the panel.
- [ ] T021 [US2] Implement a continuous, solid black (`#000000`), 3-CSS-pixel resize border with side and corner targets in `src/components/DataPanel/DataPanel.tsx` and `src/styles/theme.css`; left/right drags change width, top/bottom drags change height, corner drags change both, all resizing respects minimum and available-area limits while the chart adapts, and resizing is disabled while the Data Area is smaller than the panel in either dimension.

**Checkpoint**: The panel can be arranged and identified without saving, and its menu and title interactions meet the specified keyboard requirements.

---

## Phase 5: User Story 3 - Save and Restore a Panel Setup (Priority: P2)

**Goal**: Persist only panel setup metadata for the default owner, restore it across application restarts when the browser-local source handle remains available, and preserve unsaved state on cancellation or failure.

**Independent Test**: Change the title, geometry, and source; confirm Save; restart the application and verify the setup and activity restore when the handle is authorized. Also cover first save, declined save, failed save and retry, missing/revoked handles, close-with-unsaved-changes, and concurrent saves.

### Tests for User Story 3

- [ ] T022 [P] [US3] Add API integration tests in `backend/tests/CyclingPerformanceAssistant.Api.Tests/PanelSetupApiTests.cs` for no-setup `GET` returning 404, successful first-save and update responses, contract validation errors, server-assigned owner and ID, and database-unavailable error responses.
- [ ] T023 [P] [US3] Add PostgreSQL 16 integration tests in `backend/tests/CyclingPerformanceAssistant.Api.Tests/PanelSetupPostgresTests.cs` for applying migrations to an empty database, first-save creation, update, persisted constraints, and concurrent last-committed-write-wins upserts.
- [ ] T024 [P] [US3] Add client and UI tests in `tests/unit/panelSetupApi.test.ts` and `tests/integration/panelSetupPersistence.test.tsx` for metadata-only requests, saved-field dirty-state comparison, restore states, decline behavior, and failed-save retry behavior.
- [ ] T025 [P] [US3] Extend `tests/e2e/privacy.spec.ts` to allow only same-origin setup metadata requests and browser-local handle storage while rejecting file bytes, telemetry, browser handle objects, absolute paths, third-party requests, and sensitive log output.

### Implementation for User Story 3

- [ ] T026 [US3] Implement the persisted entity, EF configuration, and initial migration in `backend/src/CyclingPerformanceAssistant.Api/Data/PanelSetup.cs`, `backend/src/CyclingPerformanceAssistant.Api/Data/AppDbContext.cs`, and `backend/src/CyclingPerformanceAssistant.Api/Migrations/`, applying the canonical constraints in `specs/002-data-panel/data-model.md` to each field: `PanelSetup.id` (UUID primary key), `PanelSetup.owner_id` (required, unique, and `default` in v1), `PanelSetup.title` (required, empty allowed, maximum 200 characters), `PanelSetup.x_px` and `PanelSetup.y_px` (required and non-negative), `PanelSetup.width_px` and `PanelSetup.height_px` (required and minimum 200), `PanelSetup.source_handle_id` (nullable UUID), and `PanelSetup.source_file_name` (nullable only when no source is selected and required whenever a handle ID is present).
- [ ] T027 [US3] Configure PostgreSQL connection settings, migration startup, and liveness/readiness endpoints in `backend/src/CyclingPerformanceAssistant.Api/Program.cs` and `backend/src/CyclingPerformanceAssistant.Api/appsettings.json`; readiness must fail when PostgreSQL is unavailable.
- [ ] T028 [US3] Implement the setup store in `backend/src/CyclingPerformanceAssistant.Api/Data/PanelSetupStore.cs` with a server-controlled `default` owner, atomic create-or-update behavior, and last-successful-commit-wins handling without a conflict prompt.
- [ ] T029 [US3] Define request/response contracts in `backend/src/CyclingPerformanceAssistant.Api/Contracts/PanelSetupContracts.cs` and implement `GET`/`PUT /api/v1/panel-setup` in `backend/src/CyclingPerformanceAssistant.Api/Program.cs` according to `specs/002-data-panel/contracts/panel-setup-api.yaml`; validate fields, omit client-supplied owner/ID, and return the specified 404, 400, 503, and committed 200 responses.
- [ ] T030 [P] [US3] Implement the same-origin setup client in `src/services/panelSetupApi.ts` to send and receive only contract-approved setup metadata and surface API and ProblemDetails failures explicitly.
- [ ] T031 [US3] Restore setup on application startup in `src/app/ActivityScreen.tsx` using `src/services/panelSetupApi.ts` and `src/storage/activityFileHandles.ts`; reopen a local file only when its handle exists and read permission is already granted, and otherwise preserve saved metadata while showing the unavailable filename, warning, empty title, and blank chart without prompting on page load. Surface setup-load failures explicitly.
- [ ] T032 [US3] Implement confirmed and declined Save behavior in `src/components/DataPanel/OptionsPanel.tsx`, `src/app/ActivityScreen.tsx`, and `src/domain/panelSetup.ts`; confirm before persisting, save the current panel fields, keep declined changes in memory as unsaved, and end title editing for either choice.
- [ ] T033 [US3] Handle API and local-handle persistence failures in `src/app/ActivityScreen.tsx`, `src/services/panelSetupApi.ts`, and `src/components/ImportError.tsx`; retain current values as unsaved, leave the prior persisted setup unchanged, show an actionable error, and allow retry.
- [ ] T034 [US3] Track dirty state against the last confirmed persisted fields and implement the native `beforeunload` confirm/cancel flow in `src/domain/panelSetup.ts` and `src/app/ActivityScreen.tsx`; restoring every field to its saved value must clear the dirty state.

**Checkpoint**: The user can save and restore the setup, retain unsaved work after cancellation or failure, and receive the specified privacy, recovery, and close-confirmation behavior.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Complete operational guidance and validate the full feature against the design documents.

- [ ] T035 Update `specs/002-data-panel/quickstart.md` with the final build and test commands, PostgreSQL-backed setup scenarios, and runnable `pg_dump -Fc` / `pg_restore` steps that explain browser-local handles do not move with database data.
- [ ] T036 Run the full frontend unit/integration suite, TypeScript production build, .NET test suite, Chromium end-to-end suite, `docker compose config -q`, and container readiness checks against PostgreSQL 16; record reproducible commands and outcomes in `specs/002-data-panel/quickstart.md`.
- [ ] T037 Measure chart layout and rendering with representative authorized FIT fixtures from `tests/fixtures/README.md` at default and resized panel dimensions, and document observations in `specs/002-data-panel/quickstart.md` without inventing a performance threshold.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 and T003 can begin immediately; T002 depends on T001.
- **Foundational (Phase 2)**: Depends on the API project setup; complete T004 and T005 before the user-story implementation phases.
- **User Story 1 (Phase 3)**: Depends on the shared panel model and runtime foundation.
- **User Story 2 (Phase 4)**: Builds on the panel and local activity flow from User Story 1.
- **User Story 3 (Phase 5)**: The API/database tests and backend implementation can be prepared after setup; full UI restore/save integration depends on the panel and title/geometry controls from User Stories 1 and 2.
- **Polish (Phase 6)**: Depends on all three user stories being implemented.

### User Story Dependencies

- **US1 (P1)**: Depends on Phase 2 only; independently delivers local activity viewing in a panel.
- **US2 (P2)**: Depends on US1's panel layout and chart integration; it adds movement, resizing, title editing, and menu interactions.
- **US3 (P2)**: Its backend contract, entity, and store work can proceed in parallel with US1/US2 after setup. End-to-end restore/save behavior depends on US1's source selection and US2's title and geometry controls.

### Within Each User Story

- Tests are written before the behavior they cover, following the plan's validation strategy.
- Shared state and persistence models precede their consumers.
- The API entity and store precede the endpoints; the API client precedes browser save/restore integration.
- Keep activity parsing in the existing adapter and preserve the existing format-independent domain model.

### Parallel Opportunities

- **Setup**: T003 can run alongside T001; T002 follows T001.
- **User Story 1**: T006, T007, and T008 can be prepared in parallel because they use separate test files.
- **User Story 2**: T014, T015, and T016 can be prepared in parallel because they use separate test files.
- **User Story 3**: T022, T023, T024, and T025 can be prepared in parallel because they use separate test files. The frontend client T030 can be implemented independently of the backend entity/store once the API contract is fixed.

## Parallel Examples

### User Story 1

```text
Task: T006 Add import-state regression tests in tests/unit/importState.test.ts
Task: T007 Add panel/activity integration tests in tests/integration/activityLoading.test.tsx
Task: T008 Add local file-selection browser scenarios in tests/e2e/activity.spec.ts
```

### User Story 2

```text
Task: T014 Add geometry/title tests in tests/unit/panelSetup.test.ts
Task: T015 Add keyboard-accessibility tests in tests/integration/accessibility.test.tsx
Task: T016 Add pointer-resize browser scenarios in tests/e2e/activity.spec.ts
```

### User Story 3

```text
Task: T022 Add API contract integration tests in backend/tests/CyclingPerformanceAssistant.Api.Tests/PanelSetupApiTests.cs
Task: T023 Add PostgreSQL persistence tests in backend/tests/CyclingPerformanceAssistant.Api.Tests/PanelSetupPostgresTests.cs
Task: T024 Add frontend persistence tests in tests/unit/panelSetupApi.test.ts and tests/integration/panelSetupPersistence.test.tsx
Task: T025 Extend privacy browser tests in tests/e2e/privacy.spec.ts
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3: User Story 1.
3. Validate the first-use panel, local FIT selection, chart rendering, and failed-replacement retention independently.
4. Stop for review/demo; persistence, movement, resizing, and title editing remain later increments.

### Incremental Delivery

1. Complete setup and foundational runtime.
2. Deliver US1 for local activity viewing.
3. Add US2 for panel layout, title, and keyboard-operable controls.
4. Add US3 for confirmed save/restore and failure recovery.
5. Complete container, privacy, backup/restore, and representative-fixture validation.

### Parallel Team Strategy

After setup, backend persistence design/tests for US3 can proceed while frontend work delivers US1 and US2. Within each story, run the marked test tasks in parallel; keep implementation tasks that edit the same panel, app, or API host files sequential.

## Notes

- `[P]` means separate-file work with no unfinished prerequisite; it does not mark a task as optional.
- Story labels map tasks to requirements and acceptance scenarios in `specs/002-data-panel/spec.md`.
- `specs/002-data-panel/data-model.md` is canonical for persisted field constraints; T026 cites every constrained `PanelSetup.field` explicitly.
- Keep file bytes, browser handle objects, absolute paths, and activity telemetry out of API requests and PostgreSQL.
- Use only authorized, anonymized activity fixtures; do not add personal activity files.
- Do not add a numeric performance target without representative measurements on the intended environment.
