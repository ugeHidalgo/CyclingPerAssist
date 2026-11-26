import type {
  SelectedActivity,
  SpeedObservation,
} from "./activity.ts";

export interface TimelinePoint {
  readonly elapsedMinutes: number;
  readonly speedKmh: number | null;
}

export function buildTimeline(activity: SelectedActivity): TimelinePoint[] {
  const observations: SpeedObservation[] = [...activity.observations];

  for (const pause of activity.pauseIntervals) {
    if (pause.endElapsedSeconds <= pause.startElapsedSeconds) {
      continue;
    }

    const hasRecordedZero = activity.observations.some(
      (observation) =>
        observation.speedMps === 0 &&
        observation.elapsedSeconds >= pause.startElapsedSeconds &&
        observation.elapsedSeconds < pause.endElapsedSeconds,
    );
    if (hasRecordedZero) {
      continue;
    }

    const hasGapAtPauseStart = observations.some(
      (observation) =>
        observation.elapsedSeconds === pause.startElapsedSeconds &&
        observation.speedMps === null,
    );
    if (!hasGapAtPauseStart) {
      observations.push({
        elapsedSeconds: pause.startElapsedSeconds,
        speedMps: null,
      });
    }
  }

  return observations
    .sort((left, right) => left.elapsedSeconds - right.elapsedSeconds)
    .map(({ elapsedSeconds, speedMps }) => ({
      elapsedMinutes: elapsedSeconds / 60,
      speedKmh: speedMps === null ? null : speedMps * 3.6,
    }));
}
