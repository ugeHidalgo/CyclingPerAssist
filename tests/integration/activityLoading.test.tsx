import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SelectedActivity } from "../../src/domain/activity.ts";
import { ActivityImportError } from "../../src/domain/importError.ts";
import { parseFitActivity } from "../../src/adapters/fitActivity.ts";
import { ActivityScreen } from "../../src/app/ActivityScreen.tsx";

vi.mock("../../src/adapters/fitActivity.ts", () => ({
  parseFitActivity: vi.fn(),
}));

async function loadActivityFile(name: string): Promise<File> {
  const bytes = await readFile(resolve(process.cwd(), "tests/fixtures", name));
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return new File([buffer], name, { type: "application/octet-stream" });
}

function createActivity(fileName: string): SelectedActivity {
  return {
    fileName,
    startTime: new Date("2024-01-01T00:00:00.000Z"),
    startTimeSource: "activity",
    observations: [{ elapsedSeconds: 0, speedMps: 1.5 }],
    pauseIntervals: [],
    warnings: [],
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });

  return { promise, resolve };
}

beforeEach(() => {
  vi.mocked(parseFitActivity).mockReset();
  localStorage.clear();
  sessionStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("activity loading screen", () => {
  it("accepts one file, shows validation, then identifies the loaded activity", async () => {
    const user = userEvent.setup();
    const file = await loadActivityFile("valid-activity.fit");
    const result = deferred<SelectedActivity>();
    vi.mocked(parseFitActivity).mockReturnValue(result.promise);

    render(<ActivityScreen />);

    const picker = screen.getByLabelText("Activity file");
    expect(picker).toHaveAttribute("type", "file");
    expect(picker).not.toHaveAttribute("multiple");

    await user.upload(picker, file);

    expect(screen.getByRole("status")).toHaveTextContent(/validat/i);
    expect(parseFitActivity).toHaveBeenCalledTimes(1);
    expect(parseFitActivity).toHaveBeenCalledWith(
      file.name,
      expect.any(ArrayBuffer),
    );

    result.resolve(createActivity(file.name));
    expect(await screen.findByText(file.name)).toBeInTheDocument();
  });

  it("keeps activity data local and does not persist it", async () => {
    const user = userEvent.setup();
    const file = await loadActivityFile("valid-activity.fit");
    const fetchMock = vi.fn();
    const xhrSend = vi.spyOn(XMLHttpRequest.prototype, "send");
    const storageWrite = vi.spyOn(Storage.prototype, "setItem");
    vi.stubGlobal("fetch", fetchMock);
    vi.mocked(parseFitActivity).mockResolvedValue(createActivity(file.name));

    render(<ActivityScreen />);
    await user.upload(screen.getByLabelText("Activity file"), file);
    expect(await screen.findByText(file.name)).toBeInTheDocument();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(xhrSend).not.toHaveBeenCalled();
    expect(storageWrite).not.toHaveBeenCalled();
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
  });

  it("retains the previous activity when a replacement fails", async () => {
    const user = userEvent.setup();
    const previousFile = await loadActivityFile("valid-activity.fit");
    const replacementFile = await loadActivityFile("no-speed.fit");
    vi.mocked(parseFitActivity)
      .mockResolvedValueOnce(createActivity(previousFile.name))
      .mockRejectedValueOnce(new ActivityImportError("missing-speed"));

    render(<ActivityScreen />);
    await user.upload(
      screen.getByLabelText("Activity file"),
      previousFile,
    );
    expect(await screen.findByText(previousFile.name)).toBeInTheDocument();

    await user.upload(
      screen.getByLabelText("Activity file"),
      replacementFile,
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(/speed/i);
    expect(screen.getByText(previousFile.name)).toBeInTheDocument();
    expect(screen.queryByText(replacementFile.name)).not.toBeInTheDocument();
  });

  it("ignores an older result after a newer file is selected", async () => {
    const user = userEvent.setup();
    const olderFile = await loadActivityFile("valid-activity.fit");
    const newerFile = await loadActivityFile("recorded-zero.fit");
    const olderResult = deferred<SelectedActivity>();
    const newerResult = deferred<SelectedActivity>();
    vi.mocked(parseFitActivity).mockImplementation((fileName) =>
      fileName === olderFile.name ? olderResult.promise : newerResult.promise,
    );

    render(<ActivityScreen />);
    const picker = screen.getByLabelText("Activity file");
    await user.upload(picker, olderFile);
    await user.upload(picker, newerFile);

    newerResult.resolve(createActivity(newerFile.name));
    expect(await screen.findByText(newerFile.name)).toBeInTheDocument();

    olderResult.resolve(createActivity(olderFile.name));
    expect(screen.queryByText(olderFile.name)).not.toBeInTheDocument();
    expect(screen.getByText(newerFile.name)).toBeInTheDocument();
  });

  it("discards the selected activity when the screen session ends", async () => {
    const user = userEvent.setup();
    const file = await loadActivityFile("valid-activity.fit");
    vi.mocked(parseFitActivity).mockResolvedValue(createActivity(file.name));

    const { unmount } = render(<ActivityScreen />);
    await user.upload(screen.getByLabelText("Activity file"), file);
    expect(await screen.findByText(file.name)).toBeInTheDocument();

    unmount();
    render(<ActivityScreen />);

    expect(screen.queryByText(file.name)).not.toBeInTheDocument();
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
  });
});
