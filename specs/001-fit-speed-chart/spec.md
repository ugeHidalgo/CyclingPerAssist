# Feature Specification: FIT Activity Speed Chart

**Feature Branch**: `Spec-kit-adoption`

**Created**: 2026-11-21

**Status**: Draft

**Input**: User description: "As a user, I want to load a FIT activity file exported from Strava or Garmin and see a speed-versus-time chart for the activity."

## Clarifications

### Session 2026-11-21

- Omit records without timestamps; show gaps for missing speed. Reject the activity if no valid time-and-speed observations remain.
- Show a gap for a recorded pause without zero-speed samples. Only recorded zero speeds appear as zero.
- Measure elapsed time from the activity start in the FIT; if absent, use the first timestamped record.
- If another file fails to load, retain the previous chart, clearly identify its activity, and show the new file's error.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Load a FIT Activity (Priority: P1)

As a cyclist, I want to load a valid FIT activity file with recorded speed data so that the activity is available for viewing.

**Why this priority**: Loading an activity is the essential first step for this feature.

**Independent Test**: Load a valid FIT example with recorded speed data and verify that it is accepted as the single active activity.

**Acceptance Scenarios**:

1. **Given** no activity is loaded, **When** the user selects a valid FIT file with recorded speed data, **Then** the file is accepted and becomes the single active activity.
2. **Given** a valid FIT file can be processed using available resources, **When** the user selects it, **Then** it is not rejected solely for exceeding a fixed file-size cutoff.
3. **Given** an activity has been loaded, **When** the active application session ends, **Then** the activity is not available in a later session.

---

### User Story 2 - Explain Unsupported or Invalid Files (Priority: P2)

As a cyclist, I want a clear explanation when a file cannot be used so that I know what to select or correct.

**Why this priority**: Clear rejection prevents unsupported or damaged data from being mistaken for a valid activity.

**Independent Test**: Try representative GPX, empty, invalid, and corrupt files and verify each produces an appropriate message without a partial chart.

**Acceptance Scenarios**:

1. **Given** a GPX file is selected, **When** its content is checked, **Then** the user is told that only FIT is supported and is advised to use a FIT file.
2. **Given** an empty, invalid, or corrupt file is selected, **When** its content is checked, **Then** the user sees a clear error and no partial chart is shown.
3. **Given** a file has a misleading extension, **When** it is selected, **Then** its content, rather than its extension alone, determines whether it is accepted.
4. **Given** a previous activity is displayed, **When** the user selects an invalid file, **Then** the previous chart remains clearly identified and the new file's error is shown; no partial chart for the rejected file is displayed.

---

### User Story 3 - View Speed Over Elapsed Time (Priority: P3)

As a cyclist, I want to view the loaded activity's speed over elapsed time so that I can understand how speed changed during the ride.

**Why this priority**: The chart provides the activity insight that motivates loading the file.

**Independent Test**: Load a valid FIT example with recorded speed data and verify the time and speed values, including stopped intervals, on the chart.

**Acceptance Scenarios**:

1. **Given** a valid FIT activity with recorded speed data is loaded, **When** the user views the activity, **Then** a chart shows elapsed time in minutes horizontally and speed in km/h vertically, with both units visible.
2. **Given** the activity contains a speed record of exactly zero, **When** the chart is displayed, **Then** that interval remains on the elapsed-time axis and its speed is shown as zero.
3. **Given** a FIT file does not contain a speed field, **When** the activity is processed, **Then** the file is rejected with a clear error.
4. **Given** some records have no timestamp or speed, **When** the remaining records contain a valid time-and-speed observation, **Then** records without time are omitted and missing speeds are shown as gaps.
5. **Given** a recorded pause has no zero-speed samples, **When** the chart is displayed, **Then** the pause is shown as a gap rather than an invented zero.
6. **Given** an activity start time is recorded, **When** elapsed time is displayed, **Then** it is measured from that start; otherwise it is measured from the first timestamped record.

### Edge Cases

- FIT records without timestamps, missing or corrupt measurements, pauses, and GPS jumps MUST be handled consistently with the project constitution; missing values MUST NOT silently become zero.
- Omit records lacking timestamps, retain missing speed as a chart gap, and reject the activity with a clear error if no valid time-and-speed observation remains. This does not permit structurally corrupt files to be displayed.
- A recorded pause without zero-speed samples is a gap; do not infer zero from pause events.
- A valid FIT file without a speed field is rejected with a clear error; speed is not derived from location and timestamps.
- A recorded speed of exactly zero is treated as stopped. Missing speed values are not interpreted as zero.
- No fixed maximum file-size cutoff is defined for the initial feature. A size limit may be established in a later specification if needed.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The user MUST be able to load one activity file at a time.
- **FR-002**: The system MUST determine the file format from its content and MUST NOT rely on the extension alone.
- **FR-003**: The system MUST accept valid FIT files with recorded speed data and MUST NOT support GPX file loading in this feature.
- **FR-004**: When a GPX file is selected, the system MUST explain that only FIT is supported and recommend using a FIT file.
- **FR-005**: When an empty, invalid, or corrupt file is selected, the system MUST show a clear error and MUST NOT display a partial chart.
- **FR-006**: For a successfully loaded FIT activity with usable speed data, the system MUST show elapsed time horizontally and speed vertically, with the axes labeled in minutes and km/h respectively.
- **FR-007**: Displayed speed values MUST use km/h.
- **FR-008**: Intervals with a recorded speed of exactly zero MUST remain represented on the elapsed-time axis with a speed of zero. Missing speed values MUST NOT be treated as zero.
- **FR-009**: If the FIT file does not contain a speed field, the system MUST reject it with a clear error and MUST NOT derive speed from location and timestamps.
- **FR-010**: Activity data MUST remain in memory only and MUST NOT be persisted.
- **FR-011**: The system MUST NOT impose a fixed file-size cutoff in this feature. A future limit requires an explicit specification update.
- **FR-012**: The system MUST omit records with no timestamp and represent missing speeds as gaps; if no valid time-and-speed observation remains, it MUST reject the activity with a clear error.
- **FR-013**: A recorded pause without zero-speed samples MUST be represented as a gap, not as zero.
- **FR-014**: Elapsed time MUST start at the activity start recorded in the FIT, or at the first timestamped record if the activity start is absent.
- **FR-015**: If a new selection fails, the system MUST retain and clearly identify any previously displayed activity, show the error, and MUST NOT show a partial chart for the failed selection.

### Key Entities *(include if feature involves data)*

- **Activity file**: A single user-selected FIT file containing one cycling activity.
- **Speed observation**: A speed value associated with a point in the activity's elapsed time.
- **Speed-time series**: The activity's ordered elapsed-time and speed observations shown to the user.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of valid FIT conformance examples with recorded speed data are accepted as one active activity, subject to available runtime resources.
- **SC-002**: 100% of GPX, empty, invalid, and corrupt conformance examples produce a clear appropriate message and no partial chart.
- **SC-003**: Every displayed chart labels elapsed time in minutes and speed in km/h; every recorded zero-speed interval appears at zero on the chart.
- **SC-004**: No activity data remains available after the active application session ends.
- **SC-005**: No fixed file-size cutoff is applied to otherwise valid FIT files.

## Assumptions

- The user selects a FIT file exported from Strava or Garmin; this feature does not connect to either service.
- GPX is recognized only to explain that it is unsupported; GPX activity data is not parsed or displayed.
- FIT files without a recorded speed field are rejected rather than having speed derived from location and timestamps.
- A recorded speed of exactly zero represents a stop; no minimum stop duration is required. Missing speed data remains distinct from zero.
- There is no fixed maximum file-size cutoff in the initial feature; a future limit requires a specification update.
- Elapsed time is labeled in minutes. This is a presentation convention; it does not change original activity data.
- The previous activity remains active when a replacement fails; only a successfully loaded activity replaces it.
- The application handles only one active activity at a time, and activity data is not retained after the active session.
- No numeric load-time target is set here because it must be established from representative files and measurements rather than guessed.
