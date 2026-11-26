import { describe, expect, it } from "vitest";
import type { SelectedActivity } from "../../src/domain/activity.ts";
import {
  initialImportState,
  transitionImportState,
} from "../../src/domain/importState.ts";

function createActivity(fileName: string): SelectedActivity {
  return {
    fileName,
    startTime: new Date("2026-01-01T00:00:00Z"),
    startTimeSource: "activity",
    observations: [{ elapsedSeconds: 0, speedMps: 0 }],
    pauseIntervals: [],
    warnings: [],
  };
}

function createReadyState(activity: SelectedActivity, requestId = 1) {
  const loading = transitionImportState(initialImportState, {
    type: "start",
    requestId,
  });

  return transitionImportState(loading, {
    type: "success",
    requestId,
    activity,
  });
}

describe("import state transitions", () => {
  it("transitions through empty, loading, ready, and error", () => {
    const activity = createActivity("ride.fit");
    const error = new Error("Import failed");
    const loading = transitionImportState(initialImportState, {
      type: "start",
      requestId: 1,
    });

    expect(initialImportState).toEqual({ status: "empty" });
    expect(loading).toMatchObject({ status: "loading", activity: null });
    expect(
      transitionImportState(loading, {
        type: "success",
        requestId: 1,
        activity,
      }),
    ).toMatchObject({ status: "ready", activity });
    expect(
      transitionImportState(loading, {
        type: "failure",
        requestId: 1,
        error,
      }),
    ).toMatchObject({ status: "error", activity: null, error });
  });

  it("retains the previous activity when a replacement fails", () => {
    const previousActivity = createActivity("previous.fit");
    const ready = createReadyState(previousActivity);
    const loading = transitionImportState(ready, {
      type: "start",
      requestId: 2,
    });
    const error = new Error("Replacement failed");
    const failed = transitionImportState(loading, {
      type: "failure",
      requestId: 2,
      error,
    });

    expect(loading).toMatchObject({
      status: "loading",
      activity: previousActivity,
    });
    expect(failed).toMatchObject({
      status: "error",
      activity: previousActivity,
      error,
    });
  });

  it("ignores an older selection after a newer selection succeeds", () => {
    const olderActivity = createActivity("older.fit");
    const newerActivity = createActivity("newer.fit");
    const firstLoading = transitionImportState(initialImportState, {
      type: "start",
      requestId: 1,
    });
    const latestLoading = transitionImportState(firstLoading, {
      type: "start",
      requestId: 2,
    });
    const latestReady = transitionImportState(latestLoading, {
      type: "success",
      requestId: 2,
      activity: newerActivity,
    });
    const staleResult = transitionImportState(latestReady, {
      type: "success",
      requestId: 1,
      activity: olderActivity,
    });

    expect(staleResult).toEqual(latestReady);
    expect(staleResult).toMatchObject({
      status: "ready",
      activity: newerActivity,
    });
  });

  it("discards activity on session disposal and ignores late results", () => {
    const activity = createActivity("ride.fit");
    const ready = createReadyState(activity);
    const disposed = transitionImportState(ready, { type: "dispose" });
    const lateResult = transitionImportState(disposed, {
      type: "success",
      requestId: 1,
      activity,
    });

    expect(disposed).toEqual({ status: "empty" });
    expect(lateResult).toEqual({ status: "empty" });
  });
});
