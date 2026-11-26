import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ActivityPicker } from "../../src/components/ActivityPicker.tsx";

afterEach(cleanup);

describe("ActivityPicker", () => {
  it("selects one file of any type and displays its name", async () => {
    const user = userEvent.setup();
    const onFileSelected = vi.fn();
    const file = new File(["unsupported content"], "ride.unknown", {
      type: "application/octet-stream",
    });

    render(<ActivityPicker onFileSelected={onFileSelected} />);

    const input = screen.getByLabelText("Activity file");
    expect(input).toHaveAttribute("type", "file");
    expect(input).not.toHaveAttribute("multiple");
    expect(input).not.toHaveAttribute("accept");

    await user.upload(input, file);

    expect(onFileSelected).toHaveBeenCalledTimes(1);
    expect(onFileSelected).toHaveBeenCalledWith(file);
    expect(screen.getByText("Selected file: ride.unknown")).toBeInTheDocument();
  });

  it("allows selecting the same file again", async () => {
    const user = userEvent.setup();
    const onFileSelected = vi.fn();
    const file = new File(["FIT content"], "ride.fit", {
      type: "application/octet-stream",
    });

    render(<ActivityPicker onFileSelected={onFileSelected} />);
    const input = screen.getByLabelText("Activity file");

    await user.upload(input, file);
    await user.upload(input, file);

    expect(onFileSelected).toHaveBeenCalledTimes(2);
  });
});
