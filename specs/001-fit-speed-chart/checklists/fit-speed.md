# FIT Import and Speed Chart Requirements Quality Checklist

**Purpose**: Review the clarity, completeness, consistency, and verifiability of the FIT import and speed chart requirements.
**Created**: 2026-11-22
**Feature**: [FIT Activity Speed Chart](../spec.md)

**Review Ownership**: This is a reviewer-owned requirements-quality checklist. Mark an item `[x]` only when the reviewer determines that its requirements-quality criterion is satisfied.
**Marker Semantics**: A checked item does not mean that implementation or application testing is complete.

## File Validation and Messages

- [x] CHK001 Are the conditions that make an activity FIT file acceptable stated clearly and consistently, including recorded speed and usable timestamps? [Clarity, Consistency, Spec §FR-003, Spec §FR-009, Spec §FR-012]
- [x] CHK002 Are the requirements for distinguishing FIT, GPX, and other unsupported content independent of the file extension? [Completeness, Spec §FR-002, Spec §FR-003, Spec §FR-004]
- [x] CHK003 Are the requirements clear about the distinction between an invalid or corrupt file and a valid file containing incomplete measurements? [Clarity, Spec §FR-005, Spec §FR-012, Spec §Edge Cases]
- [x] CHK004 Are the required messages distinguishable and actionable for GPX, empty, invalid, corrupt, and missing-speed files? [Completeness, Clarity, Spec §FR-004, Spec §FR-005, Spec §FR-009]
- [x] CHK005 Are the requirements for identifying corrupt or incomplete FIT content sufficiently explicit to determine when the file must be rejected? [Measurability, Gap, Spec §FR-005, Plan §Screen and data flow]
- [x] CHK006 Are the expected outcomes for file-reading and recoverable resource failures defined without introducing a fixed file-size limit? [Coverage, Consistency, Gap, Spec §FR-011, Plan §Technical Context]

## Missing Speed, Stops, and Pauses

- [x] CHK007 Are missing speed values, invalid measurements, and recorded zero speeds distinguished explicitly in the requirements? [Clarity, Spec §FR-008, Spec §FR-012, Spec §Edge Cases]
- [x] CHK008 Is the rule for recognizing a stopped interval, including whether a minimum duration applies, defined consistently? [Consistency, Spec §FR-008, Spec §Assumptions]
- [x] CHK009 Are the requirements for displaying a pause without recorded zero-speed samples distinct from the requirements for recorded zero-speed samples? [Completeness, Spec §FR-008, Spec §FR-013]
- [x] CHK010 Are gap boundaries and the treatment of connections across missing-speed or pause intervals specified clearly enough to avoid implying unrecorded speeds? [Clarity, Gap, Spec §FR-012, Spec §FR-013, Data Model §Speed observation and gap]
- [x] CHK011 Are the criteria and user-facing outcome specified for an activity with no usable time-and-speed observation? [Completeness, Spec §FR-012]
- [x] CHK012 Are the handling and user communication of timestamp-less records, missing speed values, and anomalous telemetry specified consistently? [Coverage, Consistency, Gap, Spec §Edge Cases, Spec §FR-012, Data Model §Selected activity]

## Chart Units and Elapsed Time

- [x] CHK013 Are the quantity, axis placement, and visible unit specified for both axes? [Completeness, Spec §FR-006, Spec §FR-007]
- [x] CHK014 Are the origin of elapsed time and the fallback when the activity start is absent defined unambiguously? [Clarity, Spec §FR-014]
- [x] CHK015 Are the speed conversion requirements traceable to explicit source and display units, without changing original data? [Consistency, Measurability, Spec §FR-007, Plan §Constitution Check, Data Model §Speed observation and gap]
- [x] CHK016 Are requirements for invalid, duplicate, or out-of-order timestamps and their effect on elapsed time and chart ordering defined? [Edge Case, Gap, Spec §FR-014, Data Model §Speed observation and gap] — Reviewer decision: duplicate and out-of-order timestamps are out of scope for this feature.

## Privacy and Local Processing

- [x] CHK017 Are requirements for processing activity data locally and retaining it only in memory consistent across the specification and plan? [Consistency, Spec §FR-010, Plan §Summary, Plan §Technical Context]
- [x] CHK018 Are the boundaries for network transmission, third-party access, logs, and persistent storage of activity data explicitly stated? [Completeness, Spec §FR-010, Plan §Screen and data flow]
- [x] CHK019 Is the meaning of the active session and the required disposal of activity data at its end sufficiently clear to assess retention? [Clarity, Measurability, Spec §FR-010, Spec §SC-004]
- [x] CHK020 Are privacy requirements for representative activity files, including anonymization and authorization, documented consistently? [Consistency, Plan §Validation strategy, Constitution §IV]

## Replacement and Error Recovery

- [x] CHK021 Are the requirements for retaining and identifying the previous activity after a failed replacement consistent with the prohibition on partial charts? [Consistency, Spec §FR-005, Spec §FR-015]
- [x] CHK022 Are the expected states and messages specified for an initial failure when no previous activity exists? [Coverage, Spec §FR-005, Plan §Screen and data flow]
- [x] CHK023 Are the conditions for replacing the active activity after successful selection specified without ambiguity? [Clarity, Spec §FR-001, Spec §Assumptions]
- [x] CHK024 Are requirements for competing or rapidly successive file selections and stale results sufficiently defined to preserve the intended active activity? [Coverage, Gap, Spec §FR-001, Plan §Screen and data flow]
- [x] CHK025 Are the expected outcomes specified for a canceled selection or an interrupted read, including the status of any prior activity? [Edge Case, Recovery, Gap, Spec §FR-015]

## Notes

- Leave items unchecked until the reviewer has evaluated the corresponding requirements.
- Items marked `[Gap]` or referencing multiple artifacts are prompts for review, not assertions that a defect has been established.
- `/speckit-implement` reads checklist state as a gate and does not modify checklist markers.
- `checklists/requirements.md` is the separate built-in checklist maintained by `/speckit-specify` and `/speckit-clarify`.
