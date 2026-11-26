import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseFitActivity } from "../../src/adapters/fitActivity.ts";
import { buildTimeline } from "../../src/domain/timeline.ts";

async function loadActivity(name: string) {
  const file = await readFile(resolve(process.cwd(), "tests/fixtures", name));
  const data = new ArrayBuffer(file.byteLength);
  new Uint8Array(data).set(file);
  return parseFitActivity(name, data);
}

describe("activity timeline", () => {
  it("uses the first timestamped record as the fallback start and converts units", async () => {
    const activity = await loadActivity("recorded-zero.fit");

    expect(activity.startTimeSource).toBe("first-timestamped-record");
    expect(buildTimeline(activity)).toEqual([
      { elapsedMinutes: 0, speedKmh: 0 },
      { elapsedMinutes: 1 / 60, speedKmh: 5.4 },
      { elapsedMinutes: 2 / 60, speedKmh: 0 },
    ]);
  });

  it("omits timestamp-less records and keeps timestamped missing speeds as gaps", async () => {
    const activity = await loadActivity("incomplete-data.fit");

    expect(activity.warnings).toContainEqual({
      type: "omitted-timestamp-less-records",
      count: 1,
    });
    expect(buildTimeline(activity)).toEqual([
      { elapsedMinutes: 0, speedKmh: 5.4 },
      { elapsedMinutes: 1 / 60, speedKmh: null },
      { elapsedMinutes: 3 / 60, speedKmh: 0 },
    ]);
  });

  it("inserts a gap across a recorded pause without inventing a zero speed", async () => {
    const activity = await loadActivity("recorded-pause.fit");

    expect(buildTimeline(activity)).toEqual([
      { elapsedMinutes: 0, speedKmh: 7.2 },
      { elapsedMinutes: 10 / 60, speedKmh: null },
      { elapsedMinutes: 13 / 60, speedKmh: 10.8 },
    ]);
  });
});
