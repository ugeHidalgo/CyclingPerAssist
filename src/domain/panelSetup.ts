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
