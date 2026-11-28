import { useState, type ChangeEvent } from "react";

interface ActivityPickerProps {
  onFileSelected: (file: File) => void;
  selectedFileName?: string | null;
  onFileNameSelected?: (fileName: string) => void;
}

export function ActivityPicker({
  onFileSelected,
  selectedFileName: selectedFileNameProp,
  onFileNameSelected,
}: ActivityPickerProps) {
  const [selectedFileName, setSelectedFileName] = useState(selectedFileNameProp ?? "");

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) {
      return;
    }

    setSelectedFileName(file.name);
    onFileNameSelected?.(file.name);
    event.currentTarget.value = "";
    onFileSelected(file);
  }

  return (
    <section className="activity-picker">
      <label htmlFor="activity-file">Activity file</label>
      <input id="activity-file" type="file" onChange={handleChange} />
      {selectedFileNameProp === undefined && (
        <p className="activity-picker__selection" aria-live="polite">
          {selectedFileName
            ? `Selected file: ${selectedFileName}`
            : "No file selected"}
        </p>
      )}
    </section>
  );
}
