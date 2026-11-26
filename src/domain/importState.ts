import type { SelectedActivity } from "./activity.ts";

export type ImportState =
  | { readonly status: "empty" }
  | {
      readonly status: "loading";
      readonly requestId: number;
      readonly activity: SelectedActivity | null;
    }
  | {
      readonly status: "ready";
      readonly requestId: number;
      readonly activity: SelectedActivity;
    }
  | {
      readonly status: "error";
      readonly requestId: number;
      readonly activity: SelectedActivity | null;
      readonly error: Error;
    };

export type ImportStateAction =
  | { readonly type: "start"; readonly requestId: number }
  | {
      readonly type: "success";
      readonly requestId: number;
      readonly activity: SelectedActivity;
    }
  | {
      readonly type: "failure";
      readonly requestId: number;
      readonly error: Error;
    }
  | { readonly type: "dispose" };

export const initialImportState: ImportState = { status: "empty" };

export function transitionImportState(
  state: ImportState,
  action: ImportStateAction,
): ImportState {
  switch (action.type) {
    case "start": {
      if (state.status !== "empty" && action.requestId <= state.requestId) {
        return state;
      }

      return {
        status: "loading",
        requestId: action.requestId,
        activity: state.status === "empty" ? null : state.activity,
      };
    }
    case "success":
      if (state.status !== "loading" || action.requestId !== state.requestId) {
        return state;
      }

      return {
        status: "ready",
        requestId: state.requestId,
        activity: action.activity,
      };
    case "failure":
      if (state.status !== "loading" || action.requestId !== state.requestId) {
        return state;
      }

      return {
        status: "error",
        requestId: state.requestId,
        activity: state.activity,
        error: action.error,
      };
    case "dispose":
      return initialImportState;
    default: {
      const exhaustiveCheck: never = action;
      return exhaustiveCheck;
    }
  }
}
