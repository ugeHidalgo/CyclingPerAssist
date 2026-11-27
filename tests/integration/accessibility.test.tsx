import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ActivityScreen } from "../../src/app/ActivityScreen.tsx";
import { ActivityImportError } from "../../src/domain/importError.ts";
import { parseFitActivity } from "../../src/adapters/fitActivity.ts";
import type { SelectedActivity } from "../../src/domain/activity.ts";
import "../../src/styles/theme.css";

vi.mock("../../src/adapters/fitActivity.ts", () => ({
  parseFitActivity: vi.fn(),
}));

function contrastRatio(foreground: string, background: string): number {
  function luminance(color: string): number {
    const variable = color.match(/^var\((--[^)]+)\)$/)?.[1];
    const resolvedColor = variable
      ? getComputedStyle(document.documentElement)
          .getPropertyValue(variable)
          .trim()
      : color;
    const hex = resolvedColor.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)?.[1];
    const channels = hex
      ? (hex.length === 3
          ? [...hex].map((channel) => Number.parseInt(channel + channel, 16))
          : [0, 2, 4].map((index) =>
              Number.parseInt(hex.slice(index, index + 2), 16),
            ))
      : resolvedColor.match(/\d+(?:\.\d+)?/g)?.slice(0, 3).map(Number);
    if (!channels || channels.length !== 3) {
      throw new Error(`Unsupported computed color: ${color}`);
    }

    const [red, green, blue] = channels.map((channel) => {
      const value = channel / 255;
      return value <= 0.04045
        ? value / 12.92
        : ((value + 0.055) / 1.055) ** 2.4;
    });

    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  }

  const luminances = [
    luminance(foreground),
    luminance(background),
  ].sort((left, right) => right - left);

  return (luminances[0] + 0.05) / (luminances[1] + 0.05);
}

beforeEach(() => {
  vi.mocked(parseFitActivity).mockReset();
});

afterEach(cleanup);

describe("activity screen accessibility", () => {
  it("supports keyboard focus with a visible, high-contrast focus indicator", async () => {
    const user = userEvent.setup();
    render(<ActivityScreen />);

    await user.tab();

    const fileInput = screen.getByLabelText("Activity file");
    expect(fileInput).toHaveFocus();

    expect(
      contrastRatio(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--color-focus",
        ),
        getComputedStyle(document.documentElement).getPropertyValue(
          "--color-surface",
        ),
      ),
    ).toBeGreaterThanOrEqual(3);
  });

  it("announces loading and import errors with accessible text contrast", async () => {
    const user = userEvent.setup();
    const file = new File(["unsupported"], "unsupported.gpx");
    let rejectImport!: (error: Error) => void;
    const pendingImport = new Promise<SelectedActivity>((_resolve, reject) => {
      rejectImport = reject;
    });
    vi.mocked(parseFitActivity).mockReturnValue(pendingImport);

    render(<ActivityScreen />);

    const fileInput = screen.getByLabelText("Activity file");
    expect(fileInput).toHaveAttribute("type", "file");
    await user.upload(fileInput, file);

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(/validating/i);
    expect(
      contrastRatio(
        getComputedStyle(status).color,
        getComputedStyle(status).backgroundColor,
      ),
    ).toBeGreaterThanOrEqual(4.5);

    rejectImport(new ActivityImportError("gpx"));
    const dialog = await screen.findByRole("alertdialog", {
      name: "Activity import failed",
    });
    expect(dialog).toHaveAccessibleDescription(
      /only FIT files are supported/i,
    );
    expect(screen.getByRole("button", { name: "Dismiss" })).toHaveFocus();
    const errorMessage = screen.getByText(
      /only FIT files are supported/i,
    );
    expect(
      contrastRatio(
        getComputedStyle(errorMessage).color,
        getComputedStyle(errorMessage).backgroundColor,
      ),
    ).toBeGreaterThanOrEqual(4.5);
  });
});
