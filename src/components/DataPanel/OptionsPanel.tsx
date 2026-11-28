import { useState } from "react";
import { ActivityPicker } from "../ActivityPicker.tsx";

interface OptionsPanelProps {
  selectedFileName: string | null;
  onFileSelected: (file: File) => void;
  onEditTitle: () => void;
  onSave: () => void;
}

export function OptionsPanel({
  selectedFileName,
  onFileSelected,
  onEditTitle,
  onSave,
}: OptionsPanelProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [immediateFileName, setImmediateFileName] = useState<string | null>(null);
  const displayedFileName = immediateFileName ?? selectedFileName;

  return (
    <section className="options-panel" aria-label="Panel options">
      <ActivityPicker
        onFileSelected={(file) => {
          setMenuOpen(false);
          onFileSelected(file);
        }}
        selectedFileName={selectedFileName}
        onFileNameSelected={setImmediateFileName}
      />
      <div className="options-panel__controls">
        <button
          type="button"
          className="options-panel__button"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          Options
        </button>
        {menuOpen && (
          <div className="options-panel__menu" role="menu">
            <button
              type="button"
              role="menuitem"
              className="options-panel__menu-item"
              onClick={() => {
                setMenuOpen(false);
                document.getElementById("activity-file")?.click();
              }}
            >
              Open file picker
            </button>
            <button
              type="button"
              role="menuitem"
              className="options-panel__menu-item"
              onClick={() => {
                setMenuOpen(false);
                onEditTitle();
              }}
            >
              Edit title
            </button>
            <button
              type="button"
              role="menuitem"
              className="options-panel__menu-item"
              onClick={() => {
                setMenuOpen(false);
                onSave();
              }}
            >
              Save
            </button>
          </div>
        )}
      </div>
      <span className="options-panel__filename" aria-live="polite">
        {displayedFileName
          ? `Selected file: ${displayedFileName}`
          : "No file selected"}
      </span>
    </section>
  );
}
