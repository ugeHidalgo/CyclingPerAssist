import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

async function fixture(name: string): Promise<Buffer> {
  return readFile(resolve(process.cwd(), "tests/fixtures", name));
}

async function selectFile(
  page: import("@playwright/test").Page,
  name: string,
  buffer: Buffer,
) {
  await page.getByLabel("Activity file").setInputFiles({
    name,
    mimeType: "application/octet-stream",
    buffer,
  });
}

test("keeps activity data out of network requests, persistent storage, and logs", async ({
  page,
}) => {
  const requests: Array<{
    method: string;
    url: string;
    headers: Record<string, string>;
    bodyBase64: string | null;
  }> = [];
  const consoleMessages: string[] = [];
  page.on("request", (request) => {
    requests.push({
      method: request.method(),
      url: request.url(),
      headers: request.headers(),
      bodyBase64: request.postDataBuffer()?.toString("base64") ?? null,
    });
  });
  page.on("console", (message) => consoleMessages.push(message.text()));

  await page.goto("/");
  const filename = "private-activity-marker.fit";
  const fixtureBytes = await fixture("recorded-zero.fit");
  await selectFile(page, filename, fixtureBytes);
  await expect(page.getByRole("heading", { level: 2, name: filename })).toBeVisible();
  await expect(page.locator("figure.speed-chart svg")).toBeVisible();

  expect(requests.every(({ method }) => method === "GET" || method === "HEAD")).toBe(
    true,
  );
  expect(
    requests.every(({ url }) => new URL(url).origin === new URL(page.url()).origin),
  ).toBe(true);
  expect(requests.every(({ bodyBase64 }) => bodyBase64 === null)).toBe(true);
  const requestText = JSON.stringify(requests);
  expect(requestText).not.toContain(filename);
  expect(requestText).not.toContain(fixtureBytes.toString("base64"));
  expect(requestText).not.toMatch(/speedMps|speedKmh|elapsedSeconds|5\.4/);

  const storage = await page.evaluate(async () => ({
    localStorage: window.localStorage.length,
    sessionStorage: window.sessionStorage.length,
    indexedDb: (await window.indexedDB.databases()).length,
    cacheStorage: (await window.caches.keys()).length,
  }));
  expect(storage).toEqual({
    localStorage: 0,
    sessionStorage: 0,
    indexedDb: 0,
    cacheStorage: 0,
  });
  expect(await page.context().cookies()).toHaveLength(0);

  const logText = consoleMessages.join("\n");
  expect(consoleMessages).toEqual([]);
  expect(logText).not.toContain(filename);
  expect(logText).not.toMatch(/speedMps|speedKmh|elapsedSeconds|5\.4/);

  await page.reload();
  await expect(page.getByText("No file selected")).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: filename }),
  ).toHaveCount(0);
  await expect(page.locator("figure.speed-chart")).toHaveCount(0);
});

test("reports recoverable read failures without losing a prior activity", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const originalArrayBuffer = File.prototype.arrayBuffer;
    File.prototype.arrayBuffer = function (this: File) {
      if (this.name === "read-failure.fit") {
        return Promise.reject(
          new DOMException("Simulated recoverable read failure", "NotReadableError"),
        );
      }

      return originalArrayBuffer.call(this);
    };
  });
  await page.goto("/");

  await selectFile(
    page,
    "read-failure.fit",
    await fixture("valid-activity.fit"),
  );
  await expect(page.getByRole("alert")).toHaveText(
    "The selected file could not be read. Please try again.",
  );
  await expect(page.locator("figure.speed-chart")).toHaveCount(0);

  await selectFile(
    page,
    "previous-activity.fit",
    await fixture("valid-activity.fit"),
  );
  await expect(
    page.getByRole("heading", { level: 2, name: "previous-activity.fit" }),
  ).toBeVisible();

  await selectFile(
    page,
    "read-failure.fit",
    await fixture("valid-activity.fit"),
  );
  await expect(page.getByRole("alert")).toHaveText(
    "The selected file could not be read. Please try again.",
  );
  await expect(
    page.getByRole("heading", { level: 2, name: "previous-activity.fit" }),
  ).toBeVisible();
  await expect(page.locator("figure.speed-chart svg")).toBeVisible();
});
