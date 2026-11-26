import {
  ActivityImportError,
  type ActivityImportErrorKind,
} from "../domain/importError.ts";

const errorMessages: Record<ActivityImportErrorKind, string> = {
  gpx: "Only FIT files are supported. Please choose a FIT file.",
  empty: "The selected file is empty.",
  unsupported: "The selected file is not a valid supported activity file.",
  corrupt: "The FIT file is corrupt, incomplete, or failed integrity validation.",
  "missing-speed": "The FIT activity contains no usable recorded speed data.",
  invalid: "The selected file is not a valid activity file.",
  read: "The selected file could not be read. Please try again.",
};

interface ImportErrorProps {
  error: Error;
}

export function ImportError({ error }: ImportErrorProps) {
  const kind =
    error instanceof ActivityImportError ? error.kind : "invalid";

  return <p role="alert">{errorMessages[kind]}</p>;
}
