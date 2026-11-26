# Activity Test Fixtures

These fixtures cover FIT validation and GPX content detection without retaining the source
activities or their personal location data.

## Provenance and privacy

The repository maintainer authorized use of the already-anonymized examples in `Example Data`.
`valid-activity.fit` is re-encoded from the authorized FIT sample, retaining only speed
observations and a minimal session summary. All timestamps are shifted to a fixed synthetic
baseline. Coordinates, user profile, device identifiers, and other telemetry are omitted; the
FIT file ID uses neutral values.

The edge-case FIT files are synthetic. `unsupported.gpx` is regenerated using only the
authorized GPX sample's trackpoint count: all coordinates are placeholders, timestamps are
synthetic, and source metadata and route details are removed. No original `Example Data` file is
copied into this directory.

## Expected observations

All FIT fixtures parse with `fit-file-parser` using `force: false`, `strict: true`,
`mode: "cascade"`, and `speedUnit: "m/s"`.

| Fixture | Expected observations |
|---|---|
| `valid-activity.fit` | 3,172 timestamped records; 3,124 have recorded speed, 48 have no speed, and 50 record exactly zero m/s; one session. |
| `no-speed.fit` | Structurally valid activity with two timestamped records and no speed field. |
| `incomplete-data.fit` | Four records: three timestamped, three with speed, one timestamped record without speed, one speed record without a timestamp, and one recorded zero. |
| `recorded-zero.fit` | Three timestamped records at 0, 1.5, and 0 m/s; both zeroes are recorded values. |
| `recorded-pause.fit` | Two timestamped speed records at 2 and 3 m/s, with `timer:stop` and `timer:start` events three seconds apart; no zero-speed sample during the pause. |
| `unsupported.gpx` | GPX content with 3,172 trackpoints, placeholder coordinates, synthetic timestamps, and no speed elements; use for unsupported-format detection only. |
