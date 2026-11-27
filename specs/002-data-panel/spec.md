# Feature Specification: Data Panel Experience

**Feature Branch**: `Defining-specs-for-data-panel-desgin`

**Created**: 2026-11-27

**Status**: Draft

**Input**: User description: "vamos a realizar las especificaciones de la siguieten feature. Deben ir en una carpeta llamada 002-data-panel dentro de la carpeta existente specs. Para hacer las especificaciones usa toda la información recabada durante el brain storming en el fichero #attachment:2- Data Panel Design.md"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View an Activity in a Data Panel (Priority: P1)

As a cyclist, I want the activity chart and its source controls grouped in one Data Panel so that I can view and manage the activity in a defined area of the application.

**Why this priority**: A visible panel containing the existing activity experience is the foundation for every later panel interaction.

**Independent Test**: Open the application with no saved panel setup and verify that one Data Panel appears in the Data Area with the defined default placement and dimensions. Select a supported activity file and verify that its source name and chart appear in the panel.

**Acceptance Scenarios**:

1. **Given** no saved panel setup exists, **When** the application opens, **Then** exactly one Data Panel appears with its upper-left corner at the Data Area's upper-left corner, a width equal to the Data Area, and a height equal to half of the Data Area, subject to the 200-by-200-pixel minimum.
2. **Given** the Data Panel has no selected activity, **When** it is displayed, **Then** its chart area is blank and the title is empty.
3. **Given** a supported activity file is selected from any user-accessible folder through the panel's options menu, **When** it loads successfully, **Then** the selected filename appears in the Options Panel, the activity chart appears in the chart area, and the source file remains in its original location.
4. **Given** an activity is already displayed, **When** a replacement file fails to load, **Then** the previous chart and source filename remain visible and an error for the failed selection is shown.
5. **Given** the user saves the panel setup, **When** persistence completes, **Then** the setup contains only the fields needed to restore the panel and does not contain source file contents or derived activity telemetry.

---

### User Story 2 - Arrange and Identify the Data Panel (Priority: P2)

As a cyclist, I want to move and resize the Data Panel and give it a title so that its layout and identity suit my workspace.

**Why this priority**: Panel arrangement and a user-defined title make the chart workspace adaptable while keeping chart interaction separate from panel controls.

**Independent Test**: Move and resize the panel, edit its title, and verify the resulting placement, dimensions, title display, and chart behavior without saving.

**Acceptance Scenarios**:

1. **Given** the options button is selected, **When** its menu opens, **Then** the options appear in this order: open file picker, edit title, Save.
2. **Given** the panel is within the Data Area, **When** the user drags it to a new position, **Then** it moves and remains within the Data Area while the area can contain it.
3. **Given** the Data Panel is resized horizontally or vertically, **When** its size changes, **Then** its chart adapts to the remaining chart area, the panel respects its minimum size, and the title and Options Panels remain 50 pixels high.
4. **Given** the Data Area becomes smaller than the panel, **When** the layout is displayed, **Then** the panel is clipped at the Data Area boundary and the overlapping portion remains visible.
5. **Given** the title is read-only, **When** the user chooses the title-editing option, **Then** the title becomes editable and its background changes to white without changing the chart.
6. **Given** the user enters more than 200 characters for a title, **When** editing ends, **Then** the title value contains no more than the first 200 characters.
7. **Given** a title contains more text than fits the title area, **When** it is displayed, **Then** it is truncated with three dots while the saved title value remains unchanged.
8. **Given** the user operates the application by keyboard, **When** they use the options menu, file picker, title editor, and confirmation dialogs, **Then** each can be operated without a mouse; moving and resizing the panel may require a mouse.

---

### User Story 3 - Save and Restore a Panel Setup (Priority: P2)

As a cyclist, I want to save my Data Panel setup and restore it in a later session so that I do not have to recreate its layout and data-source selection.

**Why this priority**: Persistence makes panel configuration useful across application sessions and protects the user's setup from service restarts.

**Independent Test**: Change the panel title, position, dimensions, and selected source; confirm Save; restart the application; and verify that the saved setup is restored. Repeat with a cancelled save and with an unavailable source file.

**Acceptance Scenarios**:

1. **Given** the panel setup has changed, **When** the user chooses Save and confirms the confirmation dialog, **Then** the current panel ID, title, size, position, selected file's local reference, and filename are saved. The reference itself remains in browser-managed local storage.
2. **Given** no setup has previously been saved, **When** the user confirms Save for the first time, **Then** a setup is created with a unique ID; later confirmed saves update that setup.
3. **Given** the user declines the Save confirmation, **When** the dialog closes, **Then** the previously saved setup remains unchanged, the current panel keeps its unsaved changes, and title editing ends with the title returned to read-only.
4. **Given** a confirmed setup exists, **When** the application is restarted and the configured source file is available, **Then** the saved panel setup and activity are restored.
5. **Given** a confirmed setup exists but its configured source file is missing or its saved access authorization is unavailable, **When** the application opens, **Then** the panel uses its saved geometry, keeps the saved filename visible with an unavailable warning, and has an empty title and blank chart.
6. **Given** the current setup differs from the last confirmed setup, **When** the user attempts to close the application, **Then** a confirmation asks whether to exit without saving; confirming exits and discards the unsaved changes, while cancelling keeps the application open.
7. **Given** the current setup has unsaved changes, **When** the user restores every setup field to its last confirmed value, **Then** the system no longer treats the panel as having unsaved changes and closing it does not prompt to discard changes.
8. **Given** a confirmed setup exists, **When** the application service is restarted or the application and its persistent data are moved together, **Then** the saved setup remains available.
9. **Given** the initial release has one default user, **When** that user confirms Save, **Then** the setup is associated with that user and later saves update only that user's setup.
10. **Given** a confirmed Save cannot be persisted, **When** the save fails, **Then** the current panel values remain available and marked unsaved, the user sees an error and can retry, and the previous saved setup remains unchanged.
11. **Given** two sessions have edited the same user's setup, **When** both sessions successfully confirm Save, **Then** the setup from the last confirmed Save replaces the previously saved setup.

---

### Edge Cases

- The Data Area may be smaller than the Data Panel or smaller than the panel's minimum dimensions; the panel remains at least 200 by 200 pixels and is clipped to the visible Data Area.
- A saved source file may be missing or inaccessible when the application starts; the saved panel geometry and filename remain visible, the panel has an empty title and blank chart, and the user is told the file is unavailable.
- A replacement activity may fail to load; the last successfully loaded chart and its source filename remain visible, and the new selection's error is shown.
- A confirmed setup save may fail; the current panel state remains unsaved, the previous saved setup remains unchanged, and the user can retry after seeing an error.
- Multiple sessions may update the same user's setup; the last successfully confirmed save replaces the saved values from earlier sessions.
- A title may exceed the available width or the 200-character limit; the title value is limited to the first 200 characters, and overflowing displayed text is truncated with three dots.
- Declining a Save confirmation does not undo current in-memory changes. Those changes remain unsaved and are still subject to the close-with-unsaved-changes confirmation.
- If the user restores all current values to match the last confirmed setup, the panel is treated as having no unsaved changes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The application MUST provide a Data Area using the available application viewport and MUST display exactly one Data Panel in this feature.
- **FR-002**: When no saved setup exists, the Data Panel MUST start at the upper-left corner of the Data Area, with a width equal to the Data Area and a height equal to half of the Data Area, subject to a minimum panel size of 200 by 200 pixels.
- **FR-003**: The Data Panel MUST contain a 50-pixel-high Title Panel at the top, a chart area in the remaining center area, and a 50-pixel-high Options Panel at the bottom.
- **FR-004**: The title MUST be centered and MUST contain no more than 200 characters; if the user enters more than 200 characters, only the first 200 characters MUST be retained. The displayed title MUST be truncated with three dots when it does not fit the available display width, without altering the retained title value.
- **FR-005**: The title MUST be read-only by default and use the Options Panel's darker surface color. When title editing is enabled, the title area MUST have a white background.
- **FR-006**: The Options Panel MUST contain one options button and display the selected activity filename immediately to its right.
- **FR-007**: Selecting the options button MUST open a menu with exactly these options in order: open the file picker, edit the panel title, and Save.
- **FR-008**: The file picker MUST allow selection from any user-accessible folder. Where the browser supports persistent local file references, the application MUST associate the selected file with an opaque local reference and filename in the current panel setup. The application MUST NOT expose or persist an absolute filesystem path, and MUST NOT move or copy the source file. In browsers without persistent local file references, the selected file remains usable for the current session but cannot be guaranteed to reopen after restart.
- **FR-009**: The chart MUST occupy the space remaining between the Title Panel and Options Panel and MUST adapt when the Data Panel is resized.
- **FR-010**: The user MUST be able to move the Data Panel by dragging it. The panel MUST remain within the Data Area while the Data Area can contain it; if the Data Area becomes smaller than the panel, the out-of-bounds portion MUST be clipped.
- **FR-011**: The user MUST be able to resize the Data Panel in both dimensions. Its minimum size MUST be 200 by 200 pixels, and its maximum resize dimensions MUST be limited by the available Data Area when that area is at least the minimum size.
- **FR-012**: Enabling title editing MUST NOT change, interrupt, or remove the chart. Selecting Save MUST end title editing and return the title to read-only, whether the Save confirmation is accepted or declined.
- **FR-013**: Selecting Save MUST show a confirmation before any setup is persisted. Confirming MUST save the panel ID, owner identity, title, height, width, position, and selected filename; when a persistent local file reference is available, its opaque identifier MUST also be saved. The first confirmed save MUST create a setup with a unique ID for the current user; later confirmed saves MUST update only that user's setup.
- **FR-014**: Changes to the current panel setup MUST remain in the current session until a Save confirmation is accepted. Declining the Save confirmation MUST leave the previously saved setup unchanged while retaining current changes in the panel.
- **FR-015**: On application startup, the system MUST restore the saved panel position, dimensions, title, and selected source when available. If the local file reference exists, the source file still exists, and the user's previously granted access remains valid, the system MUST reopen the file through that reference and show the configured activity.
- **FR-016**: If the configured source file does not exist or cannot be accessed at startup, the system MUST show the panel with its saved geometry, keep the saved filename visible with a clear unavailable warning, and leave the title empty and chart blank.
- **FR-017**: A saved panel setup MUST remain available after the application or its saved-data store is restarted and when the application is moved together with its associated persistent data.
- **FR-018**: Each saved panel setup MUST be associated with its owner. The initial release MUST use one default user without requiring login; when multiple users are introduced, each user's setup MUST be isolated from other users' setups.
- **FR-019**: Only the panel setup fields needed to restore the panel, including the selected filename, its owner's identity, and (when available) the file's opaque local-reference identifier, MUST be persisted. The local file reference itself MUST remain in browser-managed storage. An absolute filesystem path, source file contents, and derived activity telemetry MUST NOT be sent with or included in the saved setup.
- **FR-020**: If a replacement activity fails to load, the system MUST retain and identify the last successfully loaded activity and chart while showing a clear error for the failed selection.
- **FR-021**: The system MUST consider the setup to have unsaved changes when any saved setup field differs from its last confirmed value. Restoring all fields to their saved values MUST clear the unsaved-changes state.
- **FR-022**: When the user attempts to close the application with unsaved panel changes, the system MUST ask whether to exit without saving. Confirming MUST discard the changes and close the application; cancelling MUST keep the application open and its current panel state.
- **FR-023**: If a confirmed setup save fails, the system MUST keep the current panel values in the active session, keep them marked as unsaved, show a clear error, allow the user to retry, and leave the previously saved setup unchanged.
- **FR-024**: When multiple sessions save the same user's setup, the most recently confirmed successful save MUST replace the previously saved setup; the system MUST NOT block it with a conflict or locking prompt.
- **FR-025**: The options menu, file picker, title editor, and Save and close confirmation dialogs MUST be operable by keyboard. Moving and resizing the Data Panel MAY require a mouse.

### Key Entities *(include if feature involves data)*

- **Data Area**: The available application viewport that contains the Data Panel.
- **Data Panel**: The single chart container shown in this feature, with a unique ID, title, position, width, height, selected source, and current session state.
- **Panel setup**: The confirmed values needed to restore a Data Panel: ID, owner identity, title, position, dimensions, selected file's opaque local-reference identifier, and filename. The local file reference is stored separately in browser-managed storage.
- **Data source**: A user-selected activity file, identified by a browser-local reference and filename; the file contents and derived telemetry are separate from the persisted panel setup.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In 100% of first-use scenarios, exactly one panel appears at the Data Area's upper-left corner with the specified default dimensions, subject to the minimum size.
- **SC-002**: After each tested resize, the chart fits the remaining panel area and the title and options areas remain 50 pixels high.
- **SC-003**: In 100% of confirmed-save scenarios, the saved setup is restored after an application restart; cancelling Save leaves the previously saved values unchanged.
- **SC-004**: In 100% of close attempts made with unsaved changes, the application asks whether to discard them and follows the user's choice.
- **SC-005**: In 100% of missing-source startup scenarios, the saved panel geometry and filename are displayed with an unavailable warning, an empty title, and a blank chart.
- **SC-006**: In 100% of failed replacement scenarios, the previous activity filename and chart remain visible and the failed selection is not displayed as active.
- **SC-007**: No saved setup contains source file contents or derived activity telemetry.
- **SC-008**: Every saved setup is associated with exactly one owner; the initial release uses one default user, and future users' setups are isolated from one another.
- **SC-009**: In 100% of simulated save-failure scenarios, the prior saved setup remains unchanged, the current panel remains marked unsaved, and the user is offered a retry after receiving an error.
- **SC-010**: In 100% of concurrent-save scenarios, the final persisted setup matches the data from the most recently confirmed successful save.
- **SC-011**: All menu, file selection, title editing, and confirmation-dialog workflows can be completed using a keyboard without using a mouse; moving and resizing remain pointer-operated actions.

## Assumptions

- The Data Panel displays the existing activity chart; adding chart types or supporting multiple panels is outside this feature.
- A newly created panel has an empty title until the user edits it.
- When the Data Area is smaller than 200 pixels in either dimension, the panel retains its 200-by-200-pixel minimum and is clipped to the Data Area.
- The title area is the non-chart drag surface. Editing the title takes priority over dragging, and chart interactions do not move the panel.
- If a title longer than 200 characters is entered, the first 200 characters are retained.
- Selecting or changing an activity source is an unsaved panel-setup change. If a replacement fails, the last successful source remains active.
- A missing or inaccessible source at startup does not overwrite the saved setup automatically; the blank-title behavior applies to the displayed panel until the user makes and confirms a new save.
- The data source continues to use the activity formats supported by the existing application; this feature does not add a new file format.
- The user expects a previously granted authorization to permit reopening a source file after application restart. The application automatically reloads the file only while the local reference, file, and authorization remain available. Permissions may be revoked or require renewed user interaction. Browsers without persistent local file references cannot guarantee source restoration; if the reference, file, or access is unavailable, the blank-panel behavior in FR-016 applies.
- Local file references belong to the browser profile and origin; moving the Docker image and database volume to another machine does not move those references. The saved panel setup is restored there, but its source may be unavailable until the user selects it again.
- The initial release has one default user and does not require login. If login is added later, each user has an isolated panel setup.
- No performance threshold is introduced without measurements on representative files, consistent with the project constitution.

## Clarifications

- **2026-11-27 — Local file restoration**: The user chose persistent, previously authorized access. The application automatically reloads the file after restart only while that file remains available and the authorization remains valid; the implementation mechanism belongs in `/speckit-plan`.
- **2026-11-27 — Browser file access**: The user chose to keep the browser application and use a browser-managed local file reference, associated with an opaque identifier and filename in the saved setup. Absolute filesystem paths are not available to browser applications and are not persisted; the source file remains client-side.

### Session 2026-11-27

- Q: ¿El setup del Data Panel debe ser único para cada instalación de la aplicación o estar separado por usuario? → A: Cada usuario tendrá su setup aislado; en la versión inicial habrá un único usuario predeterminado sin login, y futuros usuarios tendrán setups separados.
- Q: Si el archivo guardado no está disponible al abrir la aplicación, ¿qué debe mostrar el Options Panel junto al botón de opciones? → A: Mantener visible el nombre guardado y mostrar un aviso de archivo no disponible, dejando el título vacío y el gráfico en blanco.
- Q: Si la persona confirma Save pero el setup no puede guardarse, ¿qué debe ocurrir con los cambios actuales? → A: Conservar los cambios como no guardados, informar del fallo y permitir reintentar; el setup persistido anterior no cambia.
- Q: Si dos sesiones del mismo usuario modifican el mismo setup y una guarda antes que la otra, ¿qué debe ocurrir al intentar guardar desde la sesión más antigua? → A: El último Save confirmado sobrescribe el setup anterior; el último guardado exitoso es el vigente.
- Q: ¿Qué operaciones del Data Panel deben poder realizarse con teclado además del ratón? → A: El menú, la selección de archivo, la edición del título y los diálogos deben ser operables con teclado; mover y redimensionar pueden requerir ratón.
