export type ActivityStartTimeSource = "activity" | "first-timestamped-record";

export interface SelectedActivity {
  readonly fileName: string;
  readonly startTime: Date;
  readonly startTimeSource: ActivityStartTimeSource;
  readonly observations: readonly SpeedObservation[];
  readonly pauseIntervals: readonly PauseInterval[];
  readonly warnings: readonly ActivityWarning[];
}

export interface SpeedObservation {
  readonly elapsedSeconds: number;
  /** `null` means speed is missing; `0` is a recorded zero. */
  readonly speedMps: number | null;
}

export interface PauseInterval {
  readonly startElapsedSeconds: number;
  readonly endElapsedSeconds: number;
}

export type ActivityWarning =
  | {
      readonly type: "omitted-timestamp-less-records";
      readonly count: number;
    }
  | {
      readonly type: "missing-speed";
      readonly count: number;
    };
