# Data Panel Design

## Purpose

This document records the current direction for displaying activity charts in movable,
configurable panels. It is brainstorming input for a later feature specification, where
behavior and acceptance criteria will be defined in detail.

## Documentation Name

In project documentation, this component will be identified as a **Data Panel**. This name
refers to the panel type, not its user-editable title or unique ID.

The application background on which the Data Panel is placed will be called the **Data
Area**.

## Product Context

The current activity experience lets a cyclist load one local FIT activity and inspect its
recorded speed over elapsed time. The data panel will provide a contained space for a chart
and its data-source controls; see the [current feature specification](../../specs/001-fit-speed-chart/spec.md)
and the [product brainstorming document](./1%20-%20Brain%20Storming.md).

## Initial Scope

- Each chart is displayed inside a Data Panel.
- The initial version has one Data Panel only. Supporting multiple Data Panels, each with its own chart,
  may be considered in the future.
- The application’s available viewport is the **Data Area** where the Data Panel can be positioned.

## Panel Content and Controls

- The Data panel has a title of up to 200 characters, centered in a 50-pixel-high title area at
  the top of the panel. Will be called the **Title Panel**. The title is read-only initially,
  with a background matching the **Options Panel**, which is darker than the rest of the Data
  Area. Selecting the menu's second option makes it editable and changes its background to
  white. If the title does not fit the available width, truncate it and append three dots
  (`...`) so it fits.
- The chart is displayed inside the Data Panel and occupies the remaining panel area.
- The 50-pixel-high file-selection area at the bottom spans the full width of the panel. It will be called the **Options Panel**. It
  contains one options button with an options symbol; selecting it opens a menu. The menu's
  first option opens the file picker, its second option enables title editing, and its third
  option is **Save**. This is the only button in the area.
- The selected filename is displayed immediately to the right of the options button. When a
  file is selected from the menu, its data is loaded for the chart.
- Selecting **Save** opens a confirmation dialog before saving the current panel size,
  position, selected file's folder path and filename, and title. Confirming saves the setup;
  declining leaves the stored setup unchanged. Selecting **Save** also ends title editing
  and returns the title to read-only; if saving is declined, the title change remains
  unsaved in the current panel state.
- The setup saved for each Data Panel consists of its ID, title, height, width, position in
  the Data Area, data-file folder path, and data filename.
- Changes to the panel setup will remain in the current panel state
  until the user confirms **Save**.
- If the user tries to close the application while the setup has unsaved changes, show a
  confirmation dialog asking whether to exit without saving. Confirming exits and discards
  those changes; declining cancels the close and keeps the application open.
- The user may select a data-source file from any folder; the application does not require
  a fixed folder or move/copy the file. Its containing folder path and filename are kept in
  the Data Panel's screen model and saved with the setup when **Save** is confirmed.
- The title and file-selection areas each span the full width of the panel and remain
  50 pixels high when the panel is resized vertically.

## Panel Layout and Interaction

- The Data Area uses the full screen space available to the application when it is open.
- The user can move the panel by holding the mouse button on it, dragging it to a new
  position, and releasing the button. Keep it within the Data Area while the area can
  contain it. If the Data Area becomes smaller than the panel, clip the part outside it so
  only the portion overlapping the Data Area is visible.
- The user can resize the panel in both width and height. Its minimum size is 200 × 200
  pixels, and its maximum size is limited by the available Data Area. If the Data Area
  becomes smaller than the panel, the part outside the Data Area is hidden.
- Editing the title must not affect the chart.
- The chart must adapt to the available chart area as the Data Panel is resized.
- By default, the Data Panel's upper-left corner is positioned at the upper-left corner of
  the Data Area.
- When a panel setup is first created, its default width is the full width of the Data Area
  and its default height is half the height of the Data Area.

## Persistence

The panel setup must persist between application sessions. Each panel has a unique ID so its
setup can be identified independently when support for multiple panels is added. PostgreSQL
16 will store the ID, title, height, width, position in the Data Area, data-file folder path,
and data filename. The application will use Entity Framework Core with the Npgsql provider.
PostgreSQL must run independently of the application process but inside the same Docker
container, so the application and database can be moved together.
Panel setup data is stored on the PostgreSQL server and must remain available after the
server restarts and when the Docker container is moved.

All panel-setup data exchange must go through a C# ASP.NET Core Web API. This includes
creating the setup entry, retrieving the saved setup when the application opens, and saving
the Data Panel's setup model after the user confirms **Save**. Moving or resizing the panel
changes its current state but does not update the database until **Save** is confirmed. The
first confirmed save creates the setup entry; later confirmed saves update it. On startup,
the panel is displayed using its saved setup. If its configured data-source file does not
exist, display the panel blank with an empty title.

## Principles to Keep in View

- Keep the displayed chart and active data-source name consistent. If loading a replacement
  file fails, preserve the last successfully loaded chart and its source information.
- Keep file processing and privacy boundaries clear, and persist only the information
  needed to restore the panel setup.
- Keep the panel inside the Data Area during dragging and resizing when the area can contain
  it; otherwise, clip any part outside the Data Area.
- If no setup exists yet, use the default panel dimensions defined above.

## Open Questions


## Next Step

Use this document as input to the feature-specification process. Resolve the open questions
and define observable behavior and acceptance criteria before planning implementation.
