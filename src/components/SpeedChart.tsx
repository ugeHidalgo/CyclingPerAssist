import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SelectedActivity } from "../domain/activity.ts";
import { buildTimeline } from "../domain/timeline.ts";

interface SpeedChartProps {
  activity: SelectedActivity;
}

export function SpeedChart({ activity }: SpeedChartProps) {
  const timeline = buildTimeline(activity);

  return (
    <figure className="speed-chart">
      <figcaption className="speed-chart__title">
        Speed over elapsed time
      </figcaption>
      <div className="speed-chart__plot">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart
            data={timeline}
            margin={{ top: 16, right: 24, bottom: 32, left: 16 }}
          >
            <CartesianGrid
              stroke="var(--color-border-subtle)"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="elapsedMinutes"
              type="number"
              axisLine={{ stroke: "var(--color-border)" }}
              tickLine={{ stroke: "var(--color-border)" }}
              tick={{ fill: "var(--color-text-muted)" }}
              label={{
                value: "Elapsed time (minutes)",
                position: "insideBottom",
                offset: -16,
                fill: "var(--color-text)",
              }}
            />
            <YAxis
              dataKey="speedKmh"
              axisLine={{ stroke: "var(--color-border)" }}
              tickLine={{ stroke: "var(--color-border)" }}
              tick={{ fill: "var(--color-text-muted)" }}
              label={{
                value: "Speed (km/h)",
                angle: -90,
                position: "insideLeft",
                fill: "var(--color-text)",
              }}
            />
            <Tooltip
              contentStyle={{
                border: "1px solid var(--color-border)",
                color: "var(--color-text)",
                backgroundColor: "var(--color-surface)",
              }}
            />
            <Line
              dataKey="speedKmh"
              type="linear"
              connectNulls={false}
              dot={{ r: 2 }}
              isAnimationActive={false}
              stroke="var(--color-accent)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
