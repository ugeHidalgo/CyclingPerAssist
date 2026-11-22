# Tasks: FIT Activity Speed Chart

**Input**: [spec.md](./spec.md), [plan.md](./plan.md), [research.md](./research.md),
[data-model.md](./data-model.md), [activity-screen contract](./contracts/activity-screen.md),
[quickstart.md](./quickstart.md), and the project constitution.

**Tests**: Test-first is required for FIT parsing and calculations. Write each relevant test,
confirm it fails for the intended missing behavior, then implement that behavior. Use real,
representative FIT examples only with authorization and anonymization; do not copy the existing
activity examples into fixtures without both.

**Format**: `[ID] [P?] [Story?] Description with file paths`. `[P]` marks work that can run
in parallel with other marked work in the same phase after its stated prerequisites are met.

## Phase 1: Setup

**Enablement outcome**: Provide a reproducible frontend, local container, test-runner, and
authorized-fixture foundation for every user story. This is a technical enabler, not a
user-facing story.

**Independent exit criteria**: A clean dependency install succeeds with `npm ci`; the declared
test, build, and browser-test scripts and their configuration are present; `docker compose
config -q` accepts the Compose configuration; and fixture provenance and authorization
requirements are documented. No feature behavior is expected from this phase.

- [ ] T001 Create `package.json` and `package-lock.json` for React 19, TypeScript, Vite, React Router, `fit-file-parser`, Recharts, Vitest, Testing Library, and Playwright; define non-watch `test`, `build`, and `test:e2e` scripts using compatible versions.
- [ ] T002 [P] Configure the TypeScript and Vite browser build in `tsconfig.json`, `vite.config.ts`, and `index.html`, including browser `buffer` resolution if needed.
- [ ] T003 [P] Configure Vitest and Testing Library setup in `vitest.config.ts` and `tests/setup.ts`.
- [ ] T004 [P] Define a multi-stage static frontend build in `Dockerfile`, static-server routing in `nginx.conf`, a localhost-only `127.0.0.1:8080` service in `compose.yaml`, and build exclusions in `.dockerignore`.
- [ ] T005 [P] Configure Playwright to run against the Compose service and write browser-test configuration in `playwright.config.ts`.
- [ ] T006 [P] Prepare authorized, anonymized representative FIT and GPX examples and documented expected observations in `tests/fixtures/README.md` and `tests/fixtures/`; include valid, no-speed, incomplete-data, zero-speed, and pause cases. If suitable files cannot be obtained, stop and request them rather than use personal data without authorization and anonymization.

**Checkpoint**: T001 precedes T002–T005. The remaining setup tasks can proceed independently;
fixtures are available before tests that depend on them. Phase 1 is complete when its exit
criteria pass, before foundational application code begins.

## Phase 2: Foundational

**Enablement outcome**: Establish the format-independent activity model, safe activity-selection
lifecycle, and application entry point required by all user stories. This is a technical
enabler, not a user-facing story.

**Independent exit criteria**: The import-state tests pass for empty/loading/ready/error states,
failed replacement retention, newest-selection wins, and session disposal; the production build
accepts the shared domain types and root route; and activity state remains in memory only.

- [ ] T007 Define the format-independent activity and observation types in `src/domain/activity.ts`, citing [data-model.md §Selected activity](./data-model.md#selected-activity): `Selected activity.fileName`, `Selected activity.startTime`, `Selected activity.observations`, `Selected activity.pauseIntervals`, and `Selected activity.warnings`; and [data-model.md §Speed observation and gap](./data-model.md#speed-observation-and-gap): `Speed observation and gap.elapsedSeconds` and `Speed observation and gap.speedMps`.
- [ ] T008 Write failing state-transition tests in `tests/unit/importState.test.ts` for empty/loading/ready/error, failed replacement retaining the prior activity, newest-selection wins, and session disposal.
- [ ] T009 Implement the state transitions in `src/domain/importState.ts` after T008, consistent with [data-model.md §Import state](./data-model.md#import-state); keep all activity state in memory.
- [ ] T010 Create the single root route and application entry in `src/app/router.tsx` and `src/main.tsx`, with no authentication or backend.

**Checkpoint**: T007–T010 and their setup prerequisites are complete and the independent exit
criteria pass before story integration begins.

## Phase 3: User Story 1 - Load a FIT Activity (Priority: P1)

**Goal**: Accept one valid, local FIT activity and identify it as the active activity.

**Independent Test**: Select a valid authorized FIT fixture, observe the accepted filename and
single active activity, then end the session and confirm it is not restored.

### Tests for User Story 1

- [ ] T011 [P] [US1] Write failing FIT adapter tests in `tests/unit/fitActivity.test.ts` using `tests/fixtures/` for valid input, CRC/structural corruption, missing speed/timestamps, recorded zeros and pauses, source units, start-time fallback, and known time/speed observations; verify parser behavior for `speed` and `enhanced_speed` where fixtures support them.
- [ ] T012 [P] [US1] Write failing activity-selection UI tests in `tests/integration/activityLoading.test.tsx` for one selected file, loading and success states, filename, local-only state, and session disposal.

### Implementation for User Story 1

- [ ] T013 [US1] Implement local FIT decoding and full integrity validation in `src/adapters/fitActivity.ts` after T011; use `fit-file-parser` with checksum and strict structural validation, handle parse failures explicitly, and publish no partial result.
- [ ] T014 [US1] Map validated FIT data to `src/domain/activity.ts` in `src/adapters/fitActivity.ts`, implementing `Selected activity.fileName`, `Selected activity.startTime`, `Selected activity.observations`, `Selected activity.pauseIntervals`, and `Selected activity.warnings` per [data-model.md §Selected activity](./data-model.md#selected-activity) and `Speed observation and gap.elapsedSeconds` and `Speed observation and gap.speedMps` per [data-model.md §Speed observation and gap](./data-model.md#speed-observation-and-gap).
- [ ] T015 [US1] Implement the single-file picker and selected-file label in `src/components/ActivityPicker.tsx`, with a way to select unsupported files so their content can be classified.
- [ ] T016 [US1] Integrate the picker, local `File` reading, import state, successful activity name, and session-only lifecycle in `src/app/ActivityScreen.tsx`; wire it into `src/app/router.tsx` and make T012 pass without sending activity data over the network.

**Checkpoint**: T011 and T012 precede the relevant implementation. P1 provides an independently
testable import increment; the speed chart itself belongs to P3.

## Phase 4: User Story 2 - Explain Unsupported or Invalid Files (Priority: P2)

**Goal**: Explain unsupported or invalid files without exposing partial data.

**Independent Test**: Exercise the classifier and error UI with GPX, empty, malformed, corrupt,
and misleading-extension fixtures; use an already-ready activity as a test fixture to check
retention independently of chart rendering.

### Tests for User Story 2

- [ ] T017 [P] [US2] Write failing content-classification and rejection tests in `tests/unit/fileContent.test.ts` for GPX, unsupported content, misleading extensions, empty input, and valid FIT content; keep FIT integrity regression coverage from T011.
- [ ] T018 [P] [US2] Write failing error and recovery tests in `tests/integration/activityErrors.test.tsx` for GPX advice, invalid/corrupt/no-speed errors, no partial result, and a clearly identified retained prior activity.

### Implementation for User Story 2

- [ ] T019 [US2] Implement content-based FIT/GPX classification and unsupported-file rejection in `src/adapters/fileContent.ts`; integrate it with `src/adapters/fitActivity.ts` after T017 without implementing GPX import.
- [ ] T020 [US2] Implement clear messages for GPX, empty, corrupt, unsupported, missing-speed, and recoverable read failures in `src/components/ImportError.tsx`.
- [ ] T021 [US2] Connect classification and error presentation in `src/app/ActivityScreen.tsx`, retaining and identifying the previous successful activity while rejecting incomplete results; make T018 pass.

**Checkpoint**: T017 precedes T019; T018 precedes T020–T021. T019–T021 integrate with P1
components rather than assuming P2 can be deployed without an import flow.

## Phase 5: User Story 3 - View Speed Over Elapsed Time (Priority: P3)

**Goal**: Show the activity's recorded speed against elapsed time with explicit gaps and units.

**Independent Test**: Supply a known activity model and fixture with recorded zeros, missing
speed, pause events, and start-time fallback; verify chart labels, values, and gaps independently
of file selection.

### Tests for User Story 3

- [ ] T022 [P] [US3] Write failing timeline and conversion tests in `tests/unit/timeline.test.ts` for minutes, m/s to km/h, start-time fallback, exact zero, timestamp-less records, missing speed, and pause gaps using known authorized fixture observations.
- [ ] T023 [P] [US3] Write failing chart contract tests in `tests/integration/speedChart.test.tsx` for the numeric elapsed-time axis, visible minutes/km/h units, recorded zeros, and disconnected missing-speed/pause gaps using a domain-model fixture.

### Implementation for User Story 3

- [ ] T024 [US3] Implement timeline and unit conversion in `src/domain/timeline.ts` after T022, using `Speed observation and gap.elapsedSeconds` and `Speed observation and gap.speedMps` from [data-model.md §Speed observation and gap](./data-model.md#speed-observation-and-gap), and `Selected activity.startTime` and `Selected activity.pauseIntervals` from [data-model.md §Selected activity](./data-model.md#selected-activity).
- [ ] T025 [US3] Implement the format-independent Recharts visualization in `src/components/SpeedChart.tsx` after T023–T024; preserve recorded zero values and render gaps without connecting across missing or paused intervals.
- [ ] T026 [US3] Integrate the chart and omitted-data warnings in `src/app/ActivityScreen.tsx` using `Selected activity.observations` and `Selected activity.warnings` from [data-model.md §Selected activity](./data-model.md#selected-activity); retain the prior named chart after failed replacement.

**Checkpoint**: T022 and T023 precede their implementations. P3 consumes P1's activity model;
retained-chart error integration also depends on P2.

## Phase 6: Cross-Cutting Validation and Documentation

**Purpose**: Validate the full browser/container workflow, privacy boundary, and documentation.

- [ ] T027 [P] Add real-browser FIT, GPX, corrupt-file, chart, gaps, error-recovery, and rapid-selection scenarios against the Docker service in `tests/e2e/activity.spec.ts`, using `tests/fixtures/`.
- [ ] T028 [P] Add real-browser network and storage privacy checks, session disposal, and recoverable read-failure scenarios in `tests/e2e/privacy.spec.ts`; ensure activity bytes and derived telemetry are not sent, persisted, or logged.
- [ ] T029 [P] Document local prerequisites, fixture authorization, `npm ci`, test/build commands, Docker Compose startup and shutdown, and browser validation in `README.md`, consistent with `specs/001-fit-speed-chart/quickstart.md`.
- [ ] T030 Run the unit/integration suite, production build, Compose startup, and Playwright scenarios documented in `specs/001-fit-speed-chart/quickstart.md`; fix any failures in the relevant implementation files before completing the task.
- [ ] T031 Measure load/render time and resource use for authorized representative files and record the methodology and aggregate observations in `specs/001-fit-speed-chart/quickstart.md` without personal activity data; do not invent a numeric performance threshold or add a fixed file-size limit.

**Checkpoint**: T027–T029 follow completion of the relevant stories; T030 follows T027–T029;
T031 follows a working application and can use the same local setup.

## Dependencies & Execution Order

### Phase Dependencies

```text
Phase 1 Setup -> Phase 2 Foundational -> US1 (P1) -> US2 (P2) -> US3 (P3)
                                         \-------------------------> US3 core
US1 + US2 + US3 -> Phase 6 cross-cutting validation
```

- US2's classification and recovery can be tested independently with a ready-state fixture,
  but its integrated picker and state depend on US1.
- US3's timeline and chart can be tested with a domain-model fixture after T007. Its integrated
  screen depends on US1; the failed-replacement chart scenario also depends on US2.
- UI integration tasks T016, T021, and T026 edit `src/app/ActivityScreen.tsx` and must run
  sequentially. Adapter changes T013, T014, and T019 also run sequentially.
- Within each story, finish the relevant failing tests before implementing the tested behavior.
- The custom requirements checklist remains reviewer-owned and currently unchecked. Review it
  before implementation; `/speckit-implement` checks its status and does not mark it complete.

### Parallel Opportunities

- After T001, T002–T006 can run concurrently in their separate files.
- After setup and the foundation, T011 and T012 can be written in parallel.
- After the foundation, T017/T018 and T022/T023 can be authored against fixtures independently
  of one another; story integrations still follow the dependency order above.
- After all story integrations, T027, T028, and T029 can run in parallel in separate files.

## Parallel Examples

### User Story 1

Write `tests/unit/fitActivity.test.ts` (T011) and
`tests/integration/activityLoading.test.tsx` (T012) in parallel after the foundation and
fixtures are ready.

### User Story 2

Write `tests/unit/fileContent.test.ts` (T017) and
`tests/integration/activityErrors.test.tsx` (T018) in parallel using the classifier and
ready-state contracts; integrate only after US1.

### User Story 3

Write `tests/unit/timeline.test.ts` (T022) and
`tests/integration/speedChart.test.tsx` (T023) in parallel using domain-model fixtures; wire
the finished chart into the screen after US1 and US2.

## Implementation Strategy

1. Complete setup and foundational work, including authorized test fixtures.
2. Deliver and validate US1 as the smallest import-only increment; it does not yet satisfy the
   full user goal of viewing a chart.
3. Add US2's understandable failures and recovery, then US3's chart and telemetry semantics.
4. Run the full browser/container, privacy, and performance-measurement checks.
5. Review the final implementation against the specification and run `/speckit-converge` after
   `/speckit-implement`; do not treat unchecked reviewer-owned checklist items as approved.
