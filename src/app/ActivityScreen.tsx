import { useEffect, useReducer, useRef, useState } from "react";
import { parseFitActivity } from "../adapters/fitActivity.ts";
import { DataPanel } from "../components/DataPanel/DataPanel.tsx";
import { ImportError } from "../components/ImportError.tsx";
import { SpeedChart } from "../components/SpeedChart.tsx";
import type { ActivityWarning } from "../domain/activity.ts";
import { ActivityImportError } from "../domain/importError.ts";
import {
  initialImportState,
  transitionImportState,
} from "../domain/importState.ts";
import {
  createDefaultPanelSetup,
  type PanelSetup,
  type PanelSourceState,
} from "../domain/panelSetup.ts";

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
  const dataAreaRef = useRef<HTMLDivElement>(null);
  const [panelSetup, setPanelSetup] = useState<PanelSetup>(() =>
    createDefaultPanelSetup({ widthPx: 800, heightPx: 600 }),
  );
  const [panelSource, setPanelSource] = useState<PanelSourceState>({
    status: "none",
  });
  const [dismissedErrorRequestId, setDismissedErrorRequestId] = useState<
    number | null
  >(null);

  useEffect(() => {
    const dataArea = dataAreaRef.current;
    if (!dataArea) {
      return;
    }

    const updateDefaultSetup = () => {
      const bounds = dataArea.getBoundingClientRect();
      if (bounds.width > 0 && bounds.height > 0) {
        setPanelSetup((current) =>
          current.source.handleId === null && current.source.fileName === null
            ? createDefaultPanelSetup({
                widthPx: bounds.width,
                heightPx: bounds.height,
              })
            : current,
        );
      }
    };

    updateDefaultSetup();
    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(updateDefaultSetup);
      observer.observe(dataArea);
      return () => observer.disconnect();
    }
  }, []);

  function handleFileSelected(file: File) {
    const currentRequestId = requestId.current + 1;
    requestId.current = currentRequestId;
    const previousSource = panelSource;
    setPanelSource({
      status: "available",
      handleId: null,
      fileName: file.name,
    });
    setPanelSetup((current) => ({
      ...current,
      source: { handleId: null, fileName: file.name },
    }));
    dispatch({ type: "start", requestId: currentRequestId });

    void importFile(file, currentRequestId, previousSource);
  }

  async function importFile(
    file: File,
    currentRequestId: number,
    previousSource: PanelSourceState,
  ) {
    let data: ArrayBuffer;
    try {
      data = await file.arrayBuffer();
    } catch (error) {
      if (requestId.current === currentRequestId) {
        setPanelSource(previousSource);
        setPanelSetup((current) => ({
          ...current,
          source:
            previousSource.status === "none"
              ? { handleId: null, fileName: null }
              : {
                  handleId: previousSource.handleId,
                  fileName: previousSource.fileName,
                },
        }));
      }
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
      if (requestId.current === currentRequestId) {
        setPanelSource(previousSource);
        setPanelSetup((current) => ({
          ...current,
          source:
            previousSource.status === "none"
              ? { handleId: null, fileName: null }
              : {
                  handleId: previousSource.handleId,
                  fileName: previousSource.fileName,
                },
        }));
      }
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
  const selectedFileName =
    panelSource.status === "none" ? null : panelSource.fileName;

  return (
    <main className="activity-screen">
      <div inert={errorDialogVisible}>
        <h1>Cycling Performance Assistant</h1>
        <div className="data-area" ref={dataAreaRef}>
          <DataPanel
            setup={panelSetup}
            selectedFileName={selectedFileName}
            title={
              panelSetup.title ? (
                <h2 className="data-panel__title-text">{panelSetup.title}</h2>
              ) : null
            }
            chart={
              <>
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
                      <p
                        className="activity-warning"
                        role="status"
                        key={warning.type}
                      >
                        {describeWarning(warning)}
                      </p>
                    ))}
                  </>
                )}
              </>
            }
            onFileSelected={handleFileSelected}
            onEditTitle={() => undefined}
            onSave={() => undefined}
          />
        </div>
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
