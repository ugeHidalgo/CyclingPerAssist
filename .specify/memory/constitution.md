# Cycling Performance Assistant Constitution

## Core Principles

### I. Local Processing and Privacy
Activity files may be persisted locally, but MUST be processed on the user's device. They MUST NOT be sent to third parties without the user's explicit consent. This protects potentially personal location and activity data.

### II. Data Integrity and Explicit Units
Original activity data MUST NOT be silently modified. Units MUST be explicit wherever values are stored, calculated, or displayed, including speed and distance. Derived or transformed values MUST remain distinguishable from the original measurements.

### III. Missing and Corrupt Telemetry
Missing, corrupt, or anomalous telemetry MUST be handled consistently and documented. This includes points without timestamps, pauses, and GPS jumps. Missing values MUST NOT be treated as zero or silently interpolated.

### IV. Test-First Parsing and Calculations
Expected behavior MUST be covered by tests before implementation changes to GPX/FIT parsing or speed and cumulative-distance calculations. Tests MUST include representative activity examples. Personal activity files MUST NOT be committed unless they are anonymized and their use is authorized.

### V. Format-Independent Domain Model
GPX and FIT data MUST be converted through format-specific adapters into a common internal domain model. Visualization MUST depend on that model, not on the source file format.

### VI. Clear Errors
Invalid, empty, or unsupported activity files MUST produce a clear, actionable error. Parsing and processing failures MUST NOT be silent.

### VII. Simplicity and Measurable Performance
Implement only what the current feature specification requires. User accounts, a database, and Strava/Garmin integrations MUST NOT be added unless a feature specification requires them. Performance targets MUST be based on representative activity files and measured on the intended environment; they MUST NOT be guessed.

## Performance Constraints

The activity size and load/render-time target are not yet established. TODO(PERFORMANCE_TARGET): Measure representative activity files and agree on the maximum point count and acceptable load/render time before adopting numeric targets.

## Development Workflow

Feature specifications MUST define expected units, missing/corrupt-data behavior, and error outcomes when relevant. Plans and implementations MUST preserve local processing and the format-independent domain model. Changes to parsing and calculations MUST follow the test-first principle.

## Governance

Governance rules are intentionally undefined for now. The amendment procedure, versioning policy, and compliance review expectations will be established as the project evolves.

**Version**: 1.0.0 | **Ratified**: 2026-11-21 | **Last Amended**: 2026-11-21
