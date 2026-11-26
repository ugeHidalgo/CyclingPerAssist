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
    <figure>
      <figcaption>Speed over elapsed time</figcaption>
      <div>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart
            data={timeline}
            margin={{ top: 16, right: 24, bottom: 32, left: 16 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="elapsedMinutes"
              type="number"
              label={{
                value: "Elapsed time (minutes)",
                position: "insideBottom",
                offset: -16,
              }}
            />
            <YAxis
              dataKey="speedKmh"
              label={{
                value: "Speed (km/h)",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip />
            <Line
              dataKey="speedKmh"
              type="linear"
              connectNulls={false}
              dot={{ r: 2 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
