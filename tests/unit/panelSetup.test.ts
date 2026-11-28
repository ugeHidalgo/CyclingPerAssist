import { describe, expect, it } from "vitest";
import { createDefaultPanelSetup } from "../../src/domain/panelSetup.ts";

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
});
