export type FileContentKind = "fit" | "gpx" | "empty" | "unsupported";

const FIT_SIGNATURE = [0x2e, 0x46, 0x49, 0x54] as const;
const GPX_HEADER_SCAN_BYTES = 8192;

function hasFitSignature(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 12 &&
    FIT_SIGNATURE.every((byte, index) => bytes[8 + index] === byte)
  );
}

function hasGpxRoot(bytes: Uint8Array): boolean {
  const header = new TextDecoder().decode(
    bytes.subarray(0, GPX_HEADER_SCAN_BYTES),
  );
  const normalized = header.replace(/^\uFEFF/, "").trimStart();
  const root = normalized.match(
    /^(?:<\?xml\b[\s\S]*?\?>\s*)?(?:<!--[\s\S]*?-->\s*)*<([\w.-]+:)?gpx(?=[\s/>])/i,
  );

  return root !== null;
}

export function classifyFileContent(data: ArrayBuffer): FileContentKind {
  if (data.byteLength === 0) {
    return "empty";
  }

  const bytes = new Uint8Array(data);
  if (hasFitSignature(bytes)) {
    return "fit";
  }

  if (hasGpxRoot(bytes)) {
    return "gpx";
  }

  return "unsupported";
}
