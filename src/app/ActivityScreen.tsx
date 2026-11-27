import { useReducer, useRef, useState } from "react";
import { parseFitActivity } from "../adapters/fitActivity.ts";
import { ActivityPicker } from "../components/ActivityPicker.tsx";
import { ImportError } from "../components/ImportError.tsx";
import { SpeedChart } from "../components/SpeedChart.tsx";
import type { ActivityWarning } from "../domain/activity.ts";
import { ActivityImportError } from "../domain/importError.ts";
import {
  initialImportState,
  transitionImportState,
} from "../domain/importState.ts";

function toImportError(error: unknown): ActivityImportError {
  if (error instanceof ActivityImportError) {
    return error;
  }

  return new ActivityImportError("invalid", { cause: error });
}

function describeWarning(warning: ActivityWarning): string {
  const recordLabel = warning.count === 1 ? "record" : "records";

  if (warning.type === "omitted-timestamp-less-records") {
    return `Omitted ${warning.count} ${recordLabel} without timestamps.`;
  }

  return `Speed is missing from ${warning.count} ${recordLabel}; the chart shows a gap.`;
}

export function ActivityScreen() {
  const [state, dispatch] = useReducer(
    transitionImportState,
    initialImportState,
  );
  const requestId = useRef(0);
  const [dismissedErrorRequestId, setDismissedErrorRequestId] = useState<
    number | null
  >(null);

  function handleFileSelected(file: File) {
    const currentRequestId = requestId.current + 1;
    requestId.current = currentRequestId;
    dispatch({ type: "start", requestId: currentRequestId });

    void importFile(file, currentRequestId);
  }

  async function importFile(file: File, currentRequestId: number) {
    let data: ArrayBuffer;
    try {
      data = await file.arrayBuffer();
    } catch (error) {
      dispatch({
        type: "failure",
        requestId: currentRequestId,
        error: new ActivityImportError("read", { cause: error }),
      });
      return;
    }

    try {
      const activity = await parseFitActivity(file.name, data);
      dispatch({ type: "success", requestId: currentRequestId, activity });
    } catch (error) {
      dispatch({
        type: "failure",
        requestId: currentRequestId,
        error: toImportError(error),
      });
    }
  }

  const activity = state.status === "empty" ? null : state.activity;
  const errorDialogVisible =
    state.status === "error" &&
    state.requestId !== dismissedErrorRequestId;

  return (
    <main className="activity-screen">
      <div inert={errorDialogVisible}>
        <h1>Cycling Performance Assistant</h1>
        <ActivityPicker onFileSelected={handleFileSelected} />
        {state.status === "loading" && (
          <p className="activity-loading" role="status">
            Validating activity file...
          </p>
        )}
        {activity && (
          <>
            <h2 className="activity-name">{activity.fileName}</h2>
            <SpeedChart activity={activity} />
            {activity.warnings.map((warning) => (
              <p className="activity-warning" role="status" key={warning.type}>
                {describeWarning(warning)}
              </p>
            ))}
          </>
        )}
      </div>
      {state.status === "error" && errorDialogVisible && (
        <ImportError
          error={state.error}
          onDismiss={() => setDismissedErrorRequestId(state.requestId)}
        />
      )}
    </main>
  );
}
