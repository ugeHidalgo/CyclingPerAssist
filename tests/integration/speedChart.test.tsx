import { createElement, type ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SelectedActivity } from "../../src/domain/activity.ts";
import { SpeedChart } from "../../src/components/SpeedChart.tsx";

vi.mock("recharts", async () => {
  type AxisLabel = string | { value: string };
  type AxisProps = {
    label?: AxisLabel;
    type?: string;
  };
  type ChartPoint = {
    elapsedMinutes: number;
    speedKmh: number | null;
  };

  const labelText = (label?: AxisLabel) =>
    typeof label === "string" ? label : label?.value;

  return {
    ResponsiveContainer: ({ children }: { children?: ReactNode }) =>
      createElement("div", null, children),
    LineChart: ({
      children,
      data,
    }: {
      children?: ReactNode;
      data: ChartPoint[];
    }) =>
      createElement(
        "div",
        { "data-testid": "chart-data", "data-points": JSON.stringify(data) },
        children,
      ),
    XAxis: ({ label, type }: AxisProps) =>
      createElement(
        "span",
        { "data-testid": "elapsed-axis", "data-type": type },
        labelText(label),
      ),
    YAxis: ({ label }: AxisProps) =>
      createElement("span", { "data-testid": "speed-axis" }, labelText(label)),
    Line: ({
      connectNulls,
      dataKey,
    }: {
      connectNulls?: boolean;
      dataKey: string;
    }) =>
      createElement("span", {
        "data-testid": "speed-line",
        "data-connect-nulls": String(connectNulls),
        "data-key": dataKey,
      }),
    CartesianGrid: () => createElement("span"),
    Tooltip: () => createElement("span"),
  };
});

afterEach(cleanup);

const activity: SelectedActivity = {
  fileName: "known-domain-fixture.fit",
  startTime: new Date("2024-01-01T00:00:00.000Z"),
  startTimeSource: "activity",
  observations: [
    { elapsedSeconds: 0, speedMps: 0 },
    { elapsedSeconds: 60, speedMps: 3 },
    { elapsedSeconds: 120, speedMps: null },
    { elapsedSeconds: 240, speedMps: 4 },
    { elapsedSeconds: 420, speedMps: 6 },
  ],
  pauseIntervals: [{ startElapsedSeconds: 300, endElapsedSeconds: 360 }],
  warnings: [{ type: "missing-speed", count: 1 }],
};

describe("speed chart contract", () => {
  it("uses a numeric elapsed-time axis, visible units, recorded zeros, and disconnected gaps", () => {
    render(<SpeedChart activity={activity} />);

    expect(screen.getByTestId("elapsed-axis")).toHaveAttribute(
      "data-type",
      "number",
    );
    expect(screen.getByText("Elapsed time (minutes)")).toBeVisible();
    expect(screen.getByText("Speed (km/h)")).toBeVisible();
    expect(screen.getByTestId("speed-line")).toHaveAttribute(
      "data-connect-nulls",
      "false",
    );
    expect(screen.getByTestId("speed-line")).toHaveAttribute(
      "data-key",
      "speedKmh",
    );
    const chartPoints = screen
      .getByTestId("chart-data")
      .getAttribute("data-points");
    expect(chartPoints).not.toBeNull();
    expect(JSON.parse(chartPoints ?? "null")).toEqual([
      { elapsedMinutes: 0, speedKmh: 0 },
      { elapsedMinutes: 1, speedKmh: 10.8 },
      { elapsedMinutes: 2, speedKmh: null },
      { elapsedMinutes: 4, speedKmh: 14.4 },
      { elapsedMinutes: 5, speedKmh: null },
      { elapsedMinutes: 7, speedKmh: 21.6 },
    ]);
  });
});
