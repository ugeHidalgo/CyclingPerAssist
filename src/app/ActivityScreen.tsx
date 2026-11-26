import { useReducer, useRef } from "react";
import { parseFitActivity } from "../adapters/fitActivity.ts";
import { ActivityPicker } from "../components/ActivityPicker.tsx";
import { ImportError } from "../components/ImportError.tsx";
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

export function ActivityScreen() {
  const [state, dispatch] = useReducer(
    transitionImportState,
    initialImportState,
  );
  const requestId = useRef(0);

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

  return (
    <main>
      <h1>Cycling Performance Assistant</h1>
      <ActivityPicker onFileSelected={handleFileSelected} />
      {state.status === "loading" && (
        <p role="status">Validating activity file...</p>
      )}
      {activity && <h2>{activity.fileName}</h2>}
      {state.status === "error" && <ImportError error={state.error} />}
    </main>
  );
}
