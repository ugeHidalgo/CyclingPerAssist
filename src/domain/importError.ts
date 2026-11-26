export type ActivityImportErrorKind =
  | "gpx"
  | "empty"
  | "unsupported"
  | "corrupt"
  | "missing-speed"
  | "invalid"
  | "read";

export class ActivityImportError extends Error {
  constructor(
    readonly kind: ActivityImportErrorKind,
    options?: ErrorOptions,
  ) {
    super(kind, options);
    this.name = "ActivityImportError";
  }
}
