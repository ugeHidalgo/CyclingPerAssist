import FitParser, { type ParsedFit } from "fit-file-parser";
import type {
  ActivityWarning,
  SelectedActivity,
  SpeedObservation,
} from "../domain/activity.ts";

export type DecodedFitActivity = ParsedFit;
type ParsedRecord = NonNullable<
  NonNullable<ParsedFit["messages"]>["record"]
>[number];
type ParsedEvent = NonNullable<ParsedFit["activity"]["events"]>[number];

const TIMER_STOP_TYPES = new Set([
  "stop",
  "stop_all",
  "stop_disable",
  "stop_disable_all",
  "end_depreciated",
  "end_all_depreciated",
]);
const TIMER_START_TYPES = new Set(["start", "begin_depreciated"]);

export class FitActivityDecodeError extends Error {
  constructor(cause: unknown) {
    super(
      "The selected file is not a valid FIT activity or failed integrity validation.",
      { cause },
    );
    this.name = "FitActivityDecodeError";
  }
}

function isValidDate(value: Date | undefined): value is Date {
  return value instanceof Date && Number.isFinite(value.getTime());
}

function isValidSpeed(value: number | undefined): value is number {
  return value !== undefined && Number.isFinite(value) && value >= 0;
}

function getSpeed(record: ParsedRecord): number | null {
  if (isValidSpeed(record.enhanced_speed)) {
    return record.enhanced_speed;
  }
  if (isValidSpeed(record.speed)) {
    return record.speed;
  }
  return null;
}

function mapPauseIntervals(
  events: readonly ParsedEvent[],
  startTime: Date,
): SelectedActivity["pauseIntervals"] {
  const timerEvents = events
    .filter(
      (event): event is ParsedEvent & { timestamp: Date } =>
        event.event === "timer" && isValidDate(event.timestamp),
    )
    .sort((left, right) => left.timestamp.getTime() - right.timestamp.getTime());
  const pauses: SelectedActivity["pauseIntervals"][number][] = [];
  let pauseStart: Date | undefined;

  for (const event of timerEvents) {
    if (TIMER_STOP_TYPES.has(String(event.event_type))) {
      pauseStart ??= event.timestamp;
      continue;
    }

    if (
      pauseStart &&
      TIMER_START_TYPES.has(String(event.event_type)) &&
      event.timestamp.getTime() > pauseStart.getTime()
    ) {
      pauses.push({
        startElapsedSeconds: (pauseStart.getTime() - startTime.getTime()) / 1000,
        endElapsedSeconds: (event.timestamp.getTime() - startTime.getTime()) / 1000,
      });
      pauseStart = undefined;
    }
  }

  return pauses;
}

export async function decodeFitActivity(
  data: ArrayBuffer,
): Promise<DecodedFitActivity> {
  try {
    return await new FitParser({
      force: false,
      strict: true,
      mode: "cascade",
      speedUnit: "m/s",
    }).parseAsync(data);
  } catch (cause) {
    throw new FitActivityDecodeError(cause);
  }
}

export async function parseFitActivity(
  fileName: string,
  data: ArrayBuffer,
): Promise<SelectedActivity> {
  const decoded = await decodeFitActivity(data);
  const records = decoded.messages?.record ?? [];
  const firstRecordTimestamp = records.find((record) =>
    isValidDate(record.timestamp),
  )?.timestamp;
  const sessionStartTime = (
    decoded.activity.sessions ??
    decoded.messages?.session ??
    []
  ).find((session) => isValidDate(session.start_time))?.start_time;
  const startTime = sessionStartTime ?? firstRecordTimestamp;

  if (!startTime) {
    throw new Error(
      "The FIT activity has no usable timestamped speed observations.",
    );
  }

  const warnings: ActivityWarning[] = [];
  let omittedTimestampCount = 0;
  let missingSpeedCount = 0;
  const observations: SpeedObservation[] = [];

  for (const record of records) {
    if (!isValidDate(record.timestamp)) {
      omittedTimestampCount += 1;
      continue;
    }

    const speedMps = getSpeed(record);
    if (speedMps === null) {
      missingSpeedCount += 1;
    }

    observations.push({
      elapsedSeconds: (record.timestamp.getTime() - startTime.getTime()) / 1000,
      speedMps,
    });
  }

  if (!observations.some((observation) => observation.speedMps !== null)) {
    throw new Error(
      "The FIT activity has no usable timestamped speed observations.",
    );
  }

  if (omittedTimestampCount > 0) {
    warnings.push({
      type: "omitted-timestamp-less-records",
      count: omittedTimestampCount,
    });
  }
  if (missingSpeedCount > 0) {
    warnings.push({ type: "missing-speed", count: missingSpeedCount });
  }

  const events = decoded.activity.events ?? decoded.messages?.event ?? [];

  return {
    fileName,
    startTime,
    startTimeSource: sessionStartTime
      ? "activity"
      : "first-timestamped-record",
    observations,
    pauseIntervals: mapPauseIntervals(events, startTime),
    warnings,
  };
}
