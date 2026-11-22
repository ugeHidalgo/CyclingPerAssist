# Contract: Activity Screen

## User interface

- **Entry**: The root route opens a single activity screen, without login.
- **Empty**: Present a file selector and an empty chart area.
- **Loading**: Show that the newly selected file is being validated. If an earlier activity is
  displayed, its name remains visible and distinguishes it from the new selection.
- **Success**: Show the selected activity's name and a speed chart with elapsed time labeled
  in minutes and speed labeled in km/h. A successful selection replaces the prior activity.
- **Error**: Explain invalid, empty, corrupt, missing-speed or unsupported content. For GPX,
  explicitly say only FIT is supported and recommend a FIT file. Never show a partial chart
  for the failed file. Keep any earlier successful chart clearly identified.

## Chart semantics

- Elapsed time starts at the recorded activity start, falling back to the first timestamped
  record when start is absent.
- Show recorded zero speeds as zero; keep timestamped missing-speed records as gaps. Omit
  timestamp-less records and disclose the omission. A recorded pause without zero samples
  is a gap, not an inferred zero.
- Reject an activity with no usable time/speed observation and display a clear error.

## Browser/container boundary

- A browser file picker reads a single file locally; its contents and derived telemetry are
  not sent over the network, stored persistently, or logged.
- Docker Compose starts one static frontend service. It serves the app and assets, but no
  activity-processing endpoint exists. The browser performs FIT parsing.
- Terminating the active session discards activity data. No fixed file-size cutoff is imposed;
  recoverable resource failures produce a clear error, not a partial chart. Browser or OS
  process termination may prevent the app from reporting an error.

## Error and replacement behavior

The newest selection wins: stale asynchronous results cannot overwrite it. Publish a new
activity only after all required validation succeeds. Failure retains the previous successful
chart, if any, identified by its own filename.
