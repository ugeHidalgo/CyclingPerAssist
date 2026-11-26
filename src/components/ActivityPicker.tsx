import { useState, type ChangeEvent } from "react";

interface ActivityPickerProps {
  onFileSelected: (file: File) => void;
}

export function ActivityPicker({ onFileSelected }: ActivityPickerProps) {
  const [selectedFileName, setSelectedFileName] = useState("");

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) {
      return;
    }

    setSelectedFileName(file.name);
    event.currentTarget.value = "";
    onFileSelected(file);
  }

  return (
    <section>
      <label htmlFor="activity-file">Activity file</label>
      <input id="activity-file" type="file" onChange={handleChange} />
      <p aria-live="polite">
        {selectedFileName
          ? `Selected file: ${selectedFileName}`
          : "No file selected"}
      </p>
    </section>
  );
}
