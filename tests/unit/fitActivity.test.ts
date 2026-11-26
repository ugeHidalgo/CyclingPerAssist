import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { FitEncoder } from "fit-file-parser/encoder";
import { parseFitActivity } from "../../src/adapters/fitActivity.ts";

async function loadFixture(name: string): Promise<ArrayBuffer> {
  const file = await readFile(resolve(process.cwd(), "tests/fixtures", name));
  const buffer = new ArrayBuffer(file.byteLength);
  new Uint8Array(buffer).set(file);
  return buffer;
}

describe("FIT activity adapter", () => {
  it("accepts a valid activity and preserves known elapsed-time and m/s values", async () => {
    const activity = await parseFitActivity(
      "valid-activity.fit",
      await loadFixture("valid-activity.fit"),
    );

    expect(activity.fileName).toBe("valid-activity.fit");
    expect(activity.startTime).toEqual(new Date("2024-01-01T00:00:00.000Z"));
    expect(activity.startTimeSource).toBe("activity");
    expect(activity.observations.slice(0, 5)).toEqual([
      { elapsedSeconds: 0, speedMps: 4.423 },
      { elapsedSeconds: 1, speedMps: 5.244 },
      { elapsedSeconds: 4, speedMps: 5.542 },
      { elapsedSeconds: 11, speedMps: 5.841 },
      { elapsedSeconds: 16, speedMps: 6 },
    ]);
    expect(activity.warnings).toContainEqual({
      type: "missing-speed",
      count: 48,
    });
  });

  it("rejects a FIT file with a corrupted checksum", async () => {
    const original = await loadFixture("valid-activity.fit");
    const corrupted = original.slice(0);
    const lastByte = corrupted.byteLength - 1;
    const view = new DataView(corrupted);
    view.setUint8(lastByte, view.getUint8(lastByte) ^ 0xff);

    await expect(
      parseFitActivity("corrupt-crc.fit", corrupted),
    ).rejects.toThrow();
  });

  it("rejects malformed structure even when the file CRC is valid", async () => {
    const malformed = await loadFixture("valid-activity.fit");
    const view = new DataView(malformed);
    const headerSize = view.getUint8(0);
    view.setUint8(headerSize + 5, 255);
    const checksum = FitEncoder.calculateCRC(
      new Uint8Array(malformed, 0, malformed.byteLength - 2),
    );
    view.setUint16(malformed.byteLength - 2, checksum, true);

    await expect(
      parseFitActivity("malformed-structure.fit", malformed),
    ).rejects.toThrow();
  });

  it("rejects a valid FIT activity that has no recorded speed field", async () => {
    await expect(
      parseFitActivity("no-speed.fit", await loadFixture("no-speed.fit")),
    ).rejects.toThrow(/speed/i);
  });

  it("omits timestamp-less records and preserves timestamped missing speed as a gap", async () => {
    const activity = await parseFitActivity(
      "incomplete-data.fit",
      await loadFixture("incomplete-data.fit"),
    );

    expect(activity.observations).toEqual([
      { elapsedSeconds: 0, speedMps: 1.5 },
      { elapsedSeconds: 1, speedMps: null },
      { elapsedSeconds: 3, speedMps: 0 },
    ]);
    expect(activity.warnings).toEqual(
      expect.arrayContaining([
        { type: "omitted-timestamp-less-records", count: 1 },
        { type: "missing-speed", count: 1 },
      ]),
    );
  });

  it("preserves recorded zero speeds and falls back to the first timestamp", async () => {
    const activity = await parseFitActivity(
      "recorded-zero.fit",
      await loadFixture("recorded-zero.fit"),
    );

    expect(activity.startTime).toEqual(new Date("2024-01-01T00:00:00.000Z"));
    expect(activity.startTimeSource).toBe("first-timestamped-record");
    expect(activity.observations).toEqual([
      { elapsedSeconds: 0, speedMps: 0 },
      { elapsedSeconds: 1, speedMps: 1.5 },
      { elapsedSeconds: 2, speedMps: 0 },
    ]);
  });

  it("represents a timer pause as an interval without inventing a zero speed", async () => {
    const activity = await parseFitActivity(
      "recorded-pause.fit",
      await loadFixture("recorded-pause.fit"),
    );

    expect(activity.observations).toEqual([
      { elapsedSeconds: 0, speedMps: 2 },
      { elapsedSeconds: 13, speedMps: 3 },
    ]);
    expect(activity.pauseIntervals).toEqual([
      { startElapsedSeconds: 10, endElapsedSeconds: 13 },
    ]);
    expect(activity.observations).not.toContainEqual(
      expect.objectContaining({ speedMps: 0 }),
    );
  });
});
