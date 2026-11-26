import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { classifyFileContent } from "../../src/adapters/fileContent.ts";

async function loadFixture(name: string): Promise<ArrayBuffer> {
  const file = await readFile(resolve(process.cwd(), "tests/fixtures", name));
  const buffer = new ArrayBuffer(file.byteLength);
  new Uint8Array(buffer).set(file);
  return buffer;
}

async function classifyFixture(
  fileName: string,
  fixtureName: string,
): Promise<string> {
  const file = new File([await loadFixture(fixtureName)], fileName);
  return classifyFileContent(await file.arrayBuffer());
}

describe("file content classification", () => {
  it("recognizes GPX content", async () => {
    await expect(
      classifyFixture("ride.gpx", "unsupported.gpx"),
    ).resolves.toBe("gpx");
  });

  it("recognizes FIT content even when the file extension says GPX", async () => {
    await expect(
      classifyFixture("ride.gpx", "valid-activity.fit"),
    ).resolves.toBe("fit");
  });

  it("recognizes GPX content even when the file extension says FIT", async () => {
    await expect(
      classifyFixture("ride.fit", "unsupported.gpx"),
    ).resolves.toBe("gpx");
  });

  it("reports empty input separately from unsupported content", async () => {
    await expect(classifyFileContent(new ArrayBuffer(0))).toBe("empty");
    const unsupported = new TextEncoder().encode("not a supported activity");
    const data = unsupported.buffer.slice(
      unsupported.byteOffset,
      unsupported.byteOffset + unsupported.byteLength,
    );
    expect(classifyFileContent(data)).toBe("unsupported");
  });

  it("recognizes a valid FIT fixture", async () => {
    await expect(
      classifyFileContent(await loadFixture("valid-activity.fit")),
    ).toBe("fit");
  });
});
