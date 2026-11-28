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

async function expectImportError(
  page: import("@playwright/test").Page,
  message: string | RegExp,
) {
  const dialog = page.getByRole("alertdialog", {
    name: "Activity import failed",
  });
  await expect(dialog).toHaveAttribute("aria-modal", "true");
  await expect(dialog.locator(".import-error")).toHaveText(message);
}

async function dismissImportError(page: import("@playwright/test").Page) {
  await page.getByRole("button", { name: "Dismiss" }).click();
  await expect(page.getByRole("alertdialog")).toHaveCount(0);
}

test("starts blank and keeps an authorized local FIT selection local", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByText("No file selected")).toBeVisible();
  await expect(page.locator("figure.speed-chart")).toHaveCount(0);

  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));

  await selectFile(
    page,
    "valid-activity.fit",
    await fixture("valid-activity.fit"),
  );

  await expect(
    page.getByRole("heading", { level: 2, name: "valid-activity.fit" }),
  ).toBeVisible();
  await expect(page.locator("figure.speed-chart svg")).toBeVisible();
  expect(requests).toEqual([]);
  await expect(page.getByText("Selected file: valid-activity.fit")).toBeVisible();
});

test("loads a FIT activity and renders the labeled speed chart", async ({
  page,
}) => {
  await page.goto("/");
  await selectFile(page, "valid-activity.fit", await fixture("valid-activity.fit"));

  await expect(
    page.getByRole("heading", { level: 2, name: "valid-activity.fit" }),
  ).toBeVisible();
  await expect(page.locator("figure.speed-chart")).toBeVisible();
  await expect(page.getByText("Speed over elapsed time")).toBeVisible();
  await expect(page.getByText("Elapsed time (minutes)")).toBeVisible();
  await expect(page.getByText("Speed (km/h)")).toBeVisible();
  await expect(page.locator(".speed-chart svg")).toBeVisible();
});

test("renders missing-speed and recorded-pause gaps in the chart", async ({
  page,
}) => {
  await page.goto("/");
  await selectFile(
    page,
    "incomplete-data.fit",
    await fixture("incomplete-data.fit"),
  );

  await expect(
    page.getByText("Omitted 1 record without timestamps."),
  ).toBeVisible();
  await expect(
    page.getByText("Speed is missing from 1 record; the chart shows a gap."),
  ).toBeVisible();
  const missingSpeedPath = await page
    .locator("path.recharts-line-curve")
    .first()
    .getAttribute("d");
  expect((missingSpeedPath?.match(/M/g) ?? []).length).toBeGreaterThan(1);

  await selectFile(page, "recorded-pause.fit", await fixture("recorded-pause.fit"));
  await expect(
    page.getByRole("heading", { level: 2, name: "recorded-pause.fit" }),
  ).toBeVisible();
  const pausePath = await page
    .locator("path.recharts-line-curve")
    .first()
    .getAttribute("d");
  expect((pausePath?.match(/M/g) ?? []).length).toBeGreaterThan(1);
});

test("explains unsupported GPX, missing-speed, and corrupt FIT files", async ({
  page,
}) => {
  await page.goto("/");

  await selectFile(page, "unsupported.gpx", await fixture("unsupported.gpx"));
  await expectImportError(page,
    "Only FIT files are supported. Please choose a FIT file.",
  );
  await dismissImportError(page);

  await selectFile(page, "no-speed.fit", await fixture("no-speed.fit"));
  await expectImportError(page,
    "The FIT activity contains no usable recorded speed data.",
  );
  await dismissImportError(page);

  const corrupt = Buffer.from(await fixture("valid-activity.fit"));
  const checksumIndex = corrupt.length - 1;
  corrupt.writeUInt8(corrupt.readUInt8(checksumIndex) ^ 0xff, checksumIndex);
  await selectFile(page, "corrupt.fit", corrupt);
  await expectImportError(page,
    "The FIT file is corrupt, incomplete, or failed integrity validation.",
  );
  await expect(
    page.getByRole("heading", { level: 2, name: "corrupt.fit" }),
  ).toHaveCount(0);
  await dismissImportError(page);
});

test("retains the previous chart when a replacement FIT file is corrupt", async ({
  page,
}) => {
  await page.goto("/");
  await selectFile(page, "valid-activity.fit", await fixture("valid-activity.fit"));
  await expect(
    page.getByRole("heading", { level: 2, name: "valid-activity.fit" }),
  ).toBeVisible();

  const corrupt = Buffer.from(await fixture("valid-activity.fit"));
  const checksumIndex = corrupt.length - 1;
  corrupt.writeUInt8(corrupt.readUInt8(checksumIndex) ^ 0xff, checksumIndex);
  await selectFile(page, "corrupt-replacement.fit", corrupt);

  await expectImportError(page, /corrupt|integrity/i);
  await expect(
    page.getByRole("heading", { level: 2, name: "valid-activity.fit" }),
  ).toBeVisible();
  await expect(page.locator("figure.speed-chart svg")).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "corrupt-replacement.fit" }),
  ).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("alertdialog")).toHaveCount(0);
  await expect(page.locator("figure.speed-chart svg")).toBeVisible();
});

test("a newer rapid file selection wins over a delayed older read", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const originalArrayBuffer = File.prototype.arrayBuffer;
    File.prototype.arrayBuffer = function (this: File) {
      if (this.name !== "slow-valid.fit") {
        return originalArrayBuffer.call(this);
      }

      return new Promise<ArrayBuffer>((resolve, reject) => {
        window.setTimeout(() => {
          originalArrayBuffer.call(this).then(resolve, reject);
        }, 500);
      });
    };
  });
  await page.goto("/");

  await selectFile(page, "slow-valid.fit", await fixture("valid-activity.fit"));
  await expect(page.getByRole("status")).toContainText(
    "Validating activity file...",
  );
  await selectFile(page, "newest-zero.fit", await fixture("recorded-zero.fit"));

  await expect(
    page.getByRole("heading", { level: 2, name: "newest-zero.fit" }),
  ).toBeVisible();
  await page.waitForTimeout(600);
  await expect(
    page.getByRole("heading", { level: 2, name: "newest-zero.fit" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "slow-valid.fit" }),
  ).toHaveCount(0);
});
