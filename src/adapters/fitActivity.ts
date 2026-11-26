import FitParser, { type ParsedFit } from "fit-file-parser";

export type DecodedFitActivity = ParsedFit;

export class FitActivityDecodeError extends Error {
  constructor(cause: unknown) {
    super(
      "The selected file is not a valid FIT activity or failed integrity validation.",
      { cause },
    );
    this.name = "FitActivityDecodeError";
  }
}

export async function decodeFitActivity(
  data: ArrayBuffer,
): Promise<DecodedFitActivity> {
  try {
    return await new FitParser({
      force: false,
      strict: true,
      mode: "cascade",
      speedUnit: "m/s",
    }).parseAsync(data);
  } catch (cause) {
    throw new FitActivityDecodeError(cause);
  }
}
