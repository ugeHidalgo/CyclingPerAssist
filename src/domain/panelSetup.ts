export const MIN_PANEL_SIZE_PX = 200;

export interface DataAreaSize {
  readonly widthPx: number;
  readonly heightPx: number;
}

export interface PanelSource {
  readonly handleId: string | null;
  readonly fileName: string | null;
}

export type PanelSourceState =
  | { readonly status: "none" }
  | {
      readonly status: "available";
      readonly handleId: string | null;
      readonly fileName: string;
    }
  | {
      readonly status: "unavailable";
      readonly handleId: string | null;
      readonly fileName: string;
    };

export interface PanelSetup {
  readonly title: string;
  readonly xPx: number;
  readonly yPx: number;
  readonly widthPx: number;
  readonly heightPx: number;
  readonly source: PanelSource;
}

export function createDefaultPanelSetup(dataArea: DataAreaSize): PanelSetup {
  return {
    title: "",
    xPx: 0,
    yPx: 0,
    widthPx: Math.max(dataArea.widthPx, MIN_PANEL_SIZE_PX),
    heightPx: Math.max(dataArea.heightPx / 2, MIN_PANEL_SIZE_PX),
    source: { handleId: null, fileName: null },
  };
}

export type PanelResizeDirection =
  | "left"
  | "right"
  | "top"
  | "bottom"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

export function clampPanelPosition(
  setup: PanelSetup,
  dataArea: DataAreaSize,
): PanelSetup {
  if (
    dataArea.widthPx < setup.widthPx ||
    dataArea.heightPx < setup.heightPx
  ) {
    return { ...setup, xPx: 0, yPx: 0 };
  }

  return {
    ...setup,
    xPx: Math.max(0, Math.min(setup.xPx, dataArea.widthPx - setup.widthPx)),
    yPx: Math.max(0, Math.min(setup.yPx, dataArea.heightPx - setup.heightPx)),
  };
}

export function resizePanel(
  setup: PanelSetup,
  direction: PanelResizeDirection,
  deltaXPx: number,
  deltaYPx: number,
  dataArea: DataAreaSize,
): PanelSetup {
  if (
    dataArea.widthPx < setup.widthPx ||
    dataArea.heightPx < setup.heightPx
  ) {
    return setup;
  }

  let left = setup.xPx;
  let top = setup.yPx;
  let right = setup.xPx + setup.widthPx;
  let bottom = setup.yPx + setup.heightPx;

  if (direction.includes("left")) {
    left = Math.max(0, Math.min(right - MIN_PANEL_SIZE_PX, left + deltaXPx));
  }
  if (direction.includes("right")) {
    right = Math.max(left + MIN_PANEL_SIZE_PX, Math.min(dataArea.widthPx, right + deltaXPx));
  }
  if (direction.includes("top")) {
    top = Math.max(0, Math.min(bottom - MIN_PANEL_SIZE_PX, top + deltaYPx));
  }
  if (direction.includes("bottom")) {
    bottom = Math.max(top + MIN_PANEL_SIZE_PX, Math.min(dataArea.heightPx, bottom + deltaYPx));
  }

  return {
    ...setup,
    xPx: left,
    yPx: top,
    widthPx: right - left,
    heightPx: bottom - top,
  };
}

export function normalizePanelTitle(title: string): string {
  return title.slice(0, 200);
}

export function truncatePanelTitle(title: string, maximumCharacters: number): string {
  if (title.length <= maximumCharacters) {
    return title;
  }
  if (maximumCharacters <= 3) {
    return ".".repeat(maximumCharacters);
  }
  return `${title.slice(0, maximumCharacters - 3)}...`;
}
