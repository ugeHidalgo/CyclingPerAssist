import { useEffect, useRef, type KeyboardEvent } from "react";
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
  onDismiss: () => void;
}

export function ImportError({ error, onDismiss }: ImportErrorProps) {
  const dismissButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const kind =
    error instanceof ActivityImportError ? error.kind : "invalid";

  useEffect(() => {
    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    dismissButtonRef.current?.focus();

    return () => {
      if (previouslyFocusedRef.current?.isConnected) {
        previouslyFocusedRef.current.focus();
      }
    };
  }, []);

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onDismiss();
    } else if (event.key === "Tab") {
      event.preventDefault();
      dismissButtonRef.current?.focus();
    }
  }

  return (
    <div className="import-error-backdrop">
      <section
        aria-describedby="import-error-message"
        aria-labelledby="import-error-title"
        aria-modal="true"
        className="import-error-dialog"
        onKeyDown={handleKeyDown}
        role="alertdialog"
      >
        <h2 id="import-error-title">Activity import failed</h2>
        <p className="import-error" id="import-error-message">
          {errorMessages[kind]}
        </p>
        <button
          className="import-error-dialog__dismiss"
          onClick={onDismiss}
          ref={dismissButtonRef}
          type="button"
        >
          Dismiss
        </button>
      </section>
    </div>
  );
}
