import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ActivityScreen } from "../../src/app/ActivityScreen.tsx";

afterEach(cleanup);

async function loadFixture(name: string): Promise<File> {
  const bytes = await readFile(resolve(process.cwd(), "tests/fixtures", name));
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return new File([buffer], name, { type: "application/octet-stream" });
}

function createFile(name: string, bytes: ArrayBuffer): File {
  return new File([bytes], name, { type: "application/octet-stream" });
}

async function expectFileError(file: File, message: RegExp) {
  const user = userEvent.setup();
  render(<ActivityScreen />);

  await user.upload(screen.getByLabelText("Activity file"), file);

  const dialog = await screen.findByRole("alertdialog", {
    name: "Activity import failed",
  });
  expect(within(dialog).getByText(message)).toBeInTheDocument();
  expect(dialog).toHaveAttribute("aria-modal", "true");
  expect(screen.queryByRole("heading", { level: 2, name: file.name })).not.toBeInTheDocument();

  await user.click(within(dialog).getByRole("button", { name: "Dismiss" }));
  expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  expect(screen.getByLabelText("Activity file")).toHaveFocus();
}

describe("activity import errors", () => {
  it("explains that GPX is unsupported and recommends FIT", async () => {
    await expectFileError(
      await loadFixture("unsupported.gpx"),
      /only FIT files are supported.*choose a FIT file/i,
    );
  });

  it("explains empty content without publishing an activity", async () => {
    await expectFileError(
      createFile("empty.fit", new ArrayBuffer(0)),
      /empty/i,
    );
  });

  it("explains invalid content without publishing an activity", async () => {
    const invalid = new TextEncoder().encode("not a supported activity");
    const bytes = invalid.buffer.slice(
      invalid.byteOffset,
      invalid.byteOffset + invalid.byteLength,
    );

    await expectFileError(
      createFile("invalid.fit", bytes),
      /invalid|not a valid|unsupported/i,
    );
  });

  it("explains a corrupt FIT checksum without publishing an activity", async () => {
    const valid = await loadFixture("valid-activity.fit");
    const bytes = await valid.arrayBuffer();
    const corrupted = bytes.slice(0);
    const view = new DataView(corrupted);
    const checksumByte = corrupted.byteLength - 1;
    view.setUint8(checksumByte, view.getUint8(checksumByte) ^ 0xff);

    await expectFileError(
      createFile("corrupt.fit", corrupted),
      /corrupt|integrity/i,
    );
  });

  it("explains missing usable speed without publishing an activity", async () => {
    await expectFileError(
      await loadFixture("no-speed.fit"),
      /speed/i,
    );
  });

  it("explains recoverable file read failures", async () => {
    const file = createFile("unreadable.fit", new ArrayBuffer(16));
    Object.defineProperty(file, "arrayBuffer", {
      value: vi.fn().mockRejectedValue(new Error("Operating system read error")),
    });

    await expectFileError(file, /could not be read.*try again/i);
  });

  it("retains and identifies the previous activity after a GPX replacement fails", async () => {
    const user = userEvent.setup();
    const valid = await loadFixture("valid-activity.fit");
    const gpx = await loadFixture("unsupported.gpx");

    render(<ActivityScreen />);

    await user.upload(screen.getByLabelText("Activity file"), valid);
    expect(
      await screen.findByRole("heading", { level: 2, name: valid.name }),
    ).toBeInTheDocument();

    await user.upload(screen.getByLabelText("Activity file"), gpx);

    const dialog = await screen.findByRole("alertdialog", {
      name: "Activity import failed",
    });
    expect(
      within(dialog).getByText(/only FIT files are supported.*choose a FIT file/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: valid.name }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Speed over elapsed time"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { level: 2, name: gpx.name }),
    ).not.toBeInTheDocument();

    await user.keyboard("{Tab}");
    expect(
      within(dialog).getByRole("button", { name: "Dismiss" }),
    ).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Activity file")).toHaveFocus();
    expect(
      screen.getByText("Speed over elapsed time"),
    ).toBeInTheDocument();
  });
});
