import { describe, expect, it } from "vitest";
import {
  clampPanelPosition,
  createDefaultPanelSetup,
  normalizePanelTitle,
  resizePanel,
  truncatePanelTitle,
} from "../../src/domain/panelSetup.ts";

describe("createDefaultPanelSetup", () => {
  it("uses the Data Area width and half its height at the upper-left corner", () => {
    expect(createDefaultPanelSetup({ widthPx: 900, heightPx: 600 })).toEqual({
      title: "",
      xPx: 0,
      yPx: 0,
      widthPx: 900,
      heightPx: 300,
      source: { handleId: null, fileName: null },
    });
  });

  it("keeps both panel dimensions at least 200 pixels", () => {
    expect(createDefaultPanelSetup({ widthPx: 120, heightPx: 300 })).toEqual({
      title: "",
      xPx: 0,
      yPx: 0,
      widthPx: 200,
      heightPx: 200,
      source: { handleId: null, fileName: null },
    });
  });

  it("uses the Data Area upper-left and applies minimum dimensions independently", () => {
    expect(createDefaultPanelSetup({ widthPx: 150, heightPx: 500 })).toEqual({
      title: "",
      xPx: 0,
      yPx: 0,
      widthPx: 200,
      heightPx: 250,
      source: { handleId: null, fileName: null },
    });
  });
});

describe("panel geometry", () => {
  it("clamps CSS-pixel movement to the available Data Area", () => {
    const setup = createDefaultPanelSetup({ widthPx: 800, heightPx: 600 });
    expect(
      clampPanelPosition({ ...setup, xPx: 700, yPx: 550 }, { widthPx: 800, heightPx: 600 }),
    ).toMatchObject({ xPx: 0, yPx: 300 });
  });

  it("keeps side and corner resizing at 200 pixels and available-area limits", () => {
    const setup = createDefaultPanelSetup({ widthPx: 500, heightPx: 400 });
    expect(
      resizePanel(setup, "right", -300, 0, { widthPx: 500, heightPx: 400 }),
    ).toMatchObject({ xPx: 0, widthPx: 200 });
    expect(
      resizePanel(setup, "bottom-right", 300, 300, { widthPx: 500, heightPx: 400 }),
    ).toMatchObject({ widthPx: 500, heightPx: 400 });
  });

  it("does not resize when the Data Area is smaller than the panel", () => {
    const setup = createDefaultPanelSetup({ widthPx: 500, heightPx: 600 });
    expect(
      resizePanel(setup, "bottom-right", 100, 100, { widthPx: 480, heightPx: 580 }),
    ).toEqual(setup);
  });
});

describe("panel titles", () => {
  it("retains only the first 200 characters", () => {
    expect(normalizePanelTitle("a".repeat(220))).toHaveLength(200);
  });

  it("displays overflow with three dots without changing the saved value", () => {
    expect(truncatePanelTitle("A very long title", 8)).toBe("A ver...");
  });
});
