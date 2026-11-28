import type { ReactNode } from "react";
import type { PanelSetup } from "../../domain/panelSetup.ts";
import { OptionsPanel } from "./OptionsPanel.tsx";

interface DataPanelProps {
  setup: PanelSetup;
  selectedFileName: string | null;
  title: ReactNode;
  chart: ReactNode;
  onFileSelected: (file: File) => void;
  onEditTitle: () => void;
  onSave: () => void;
}

export function DataPanel({
  setup,
  selectedFileName,
  title,
  chart,
  onFileSelected,
  onEditTitle,
  onSave,
}: DataPanelProps) {
  return (
    <section
      className="data-panel"
      aria-label="Data Panel"
      style={{
        left: setup.xPx,
        top: setup.yPx,
        width: setup.widthPx,
        height: setup.heightPx,
      }}
    >
      <header className="data-panel__title">{title}</header>
      <div className="data-panel__chart">{chart}</div>
      <OptionsPanel
        selectedFileName={selectedFileName}
        onFileSelected={onFileSelected}
        onEditTitle={onEditTitle}
        onSave={onSave}
      />
    </section>
  );
}
