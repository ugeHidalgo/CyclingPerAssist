# Research: FIT Activity Speed Chart

## FIT decoding

**Decision**: Use `fit-file-parser` as the initial MIT-licensed browser decoder, with strict
structural and checksum validation (`force: false`, `strict: true`) and local `ArrayBuffer` input.
Choose an exact compatible release in the dependency lock during implementation.

**Rationale**: Its documentation describes browser file input, bundled TypeScript declarations,
and the validation options. Its default `force: true` skips CRC validation, so it must be
overridden. Vite must resolve the package's browser `buffer` implementation; prove this in the
real-browser build rather than assuming it works. Strict single-file parsing must be verified
against representative exports; avoid silently accepting a partial record or trailing data.

**Alternatives considered**: Garmin's official FIT SDK offers integrity checking, but its custom
license needs distribution review before bundling; `fit-file-parser` is MIT-licensed. Writing a
custom FIT parser increases complexity and is unnecessary.

**Implementation checks**: With authorized, anonymized representative examples, verify which
decoded record speed fields (`speed` or `enhanced_speed`) are supplied, invalid/sentinel value
handling, session start and timer event shapes, and unit conversion. Do not interpret a missing
or invalid speed as zero. Decoder behavior that cannot meet the spec blocks implementation;
do not hide it with a partial chart.

Sources: [FIT parser README](https://github.com/jimmykane/fit-parser),
[browser and strict parsing](https://jimmykane.github.io/fit-parser/documents/Parse_FIT_files.html),
[Garmin SDK](https://github.com/garmin/fit-javascript-sdk).

## Charting

**Decision**: Use Recharts with React 19 for the elapsed-time/speed chart. Set gaps to remain
disconnected; use a numeric elapsed-time axis and display minutes and km/h.

**Rationale**: Recharts is MIT-licensed, supports React 19, and documents disconnected null
values. It supports the required single chart without a separate visualization framework.
Preserve zero values; no unmeasured downsampling or performance guarantee is assumed.

**Alternatives considered**: Chart.js and uPlot are viable alternatives. Revisit only if
representative measurements show Recharts cannot meet an agreed target without distorting
observations or pause/missing-data gaps.

Sources: [Recharts Line API](https://recharts.github.io/en-US/api/Line/),
[Recharts package metadata](https://registry.npmjs.org/recharts/latest).

## Browser and container boundary

**Decision**: Build the React/Vite application in a Docker build stage and serve the resulting
static files from a single runtime container through Docker Compose on the user's machine.
File selection, decoding, validation, conversion and charting all execute in the browser.

**Rationale**: Docker packages the app without turning it into an activity-processing backend.
The user accesses the root route directly; the selected file never enters a network request,
container volume, server log or persistent browser storage.

**Alternatives considered**: An ASP.NET API or database contradicts the selected client-only
scope and is unnecessary. A locally run development server without Docker does not satisfy the
requested delivery approach.

## Testing and performance

**Decision**: Use Vitest and Testing Library for test-first domain and UI checks, plus Playwright
against the running container for the file picker, browser-only decoding, errors and network
boundary. Measure representative sizes before proposing any load-time or memory target.

**Rationale**: A browser test validates real bundling and the privacy boundary that DOM mocks
cannot establish. No fixed size limit or unmeasured performance target is introduced.

**Alternatives considered**: Only mocked DOM tests would not confirm browser parser compatibility
or network behavior. Always downsampling would change display fidelity without a measured need.
