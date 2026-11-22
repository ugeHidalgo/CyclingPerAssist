# Data Model: FIT Activity Speed Chart

All entities are transient, live in browser memory, and are not tied to FIT decoder types in the
UI. The source file is read without modification and is not retained after the session.

## Selected activity

- `fileName`: user-visible source name used to identify the currently successful activity.
- `startTime`: the FIT activity start timestamp when present, otherwise the first timestamped
  record. Preserve the choice as provenance.
- `observations`: ordered speed observations and explicit gaps, as described below.
- `pauseIntervals`: recorded pause boundaries when present, used to prevent interpolating
  across a pause without recorded zero-speed samples.
- `warnings`: non-sensitive descriptions/counts of omitted timestamp-less records and missing
  values, so data treatment is not silent.

The model represents one active activity. A successful replacement publishes a new complete
activity; a failed replacement leaves the old one active and identified.

## Speed observation and gap

- `elapsedSeconds`: timestamp minus `startTime`; keep original time resolution. Convert seconds
  to minutes for the chart axis.
- `speedMps`: finite nonnegative recorded speed in m/s, or an explicit missing marker; zero is
  a real recorded zero. Convert a known m/s speed to km/h by multiplying by 3.6 exactly once.
- A record without a timestamp cannot be placed on the time axis and is omitted with a warning.
- A timestamped record with missing speed becomes a gap. If no valid time-and-speed observation
  remains, reject the activity with a clear error.
- A recorded pause without zero-speed samples remains a gap. Keep actual zero samples and do
  not invent zeroes from pause events. The chart must not connect across missing intervals.

## Import state

States: `empty`, `loading`, `ready`, and `error`. Loading/error may coexist with a previously
ready activity, whose name and chart remain identifiable. A successful current selection
atomically replaces the previous activity; a failed one retains it. Ignore stale asynchronous
results if the selection changes. Session termination discards all activity data.

## Validation and integrity

- Classify FIT and GPX by content, not filename; GPX receives a FIT-only recommendation.
- Reject empty, invalid, corrupt, incomplete or unsupported files without exposing partial
  results. Verify FIT checksums and structure.
- A file lacking a speed field or any usable time/speed pair is rejected. Missing individual
  speeds are gaps, not zeros. The file's original bytes are never altered.
- No fixed file-size cutoff applies. If browser resources are insufficient, report the failure
  clearly without publishing incomplete data.
