# Initial Mockup

## Table of Contents

- [App Definition (Objective)](#app-definition-objective)
- [Target Users](#target-users)
- [Core User Flows](#core-user-flows)
- [Activity Files Type](#activity-files-type)
- [MVP Scope](#mvp-scope)
- [Screens and Navigation](#screens-and-navigation)
- [Sample Data](#sample-data)
- [Design Principles](#design-principles)
- [Initial Technology Stack](#initial-technology-stack)
- [Assumptions and Open Questions](#assumptions-and-open-questions)
- [Mockup Acceptance Criteria](#mockup-acceptance-criteria)

## App Definition (Objective)

The initial app will let a user sign in with a username and password, load a cycling Activity recorded with a Garmin device, and view its speed data over time in a dashboard chart.

After signing in, the user will be able to select a data file from their computer. The selected file will be loaded into memory and used to display the Activity's telemetry. Each loaded cycling session will be called an **Activity**.

The dashboard will initially show a chart with time on the horizontal axis and speed on the vertical axis. The chart will be drawn from the data in the loaded Activity and refreshed whenever another Activity is loaded.

## Target Users

The app is for people interested in evaluating the performance of a sports Activity. Its initial target users are:

- Cyclists.
- Coaches.

## Core User Flows

### Load and Review an Activity

1. The user opens the app and signs in with a username and password.
2. The app opens the dashboard.
3. The user chooses the option to add an Activity.
4. A file selector opens, and the user selects a Garmin activity file from their computer.
5. The app loads the file into memory as an Activity.
6. The dashboard displays a chart of that Activity's speed over time, with time on the horizontal axis and speed on the vertical axis.
7. When the user loads another Activity, the chart refreshes to show the newly loaded Activity.

## Activity Files Type

The app will support two activity file types for loading recorded activities:

### FIT

FIT is a binary activity format developed by Garmin. It can contain an activity summary and timestamped records with measurements such as speed, heart rate, and power. The available data depends on the device and the contents of the file. See the [FIT format description](Activity%20files%20definition/fit_format_description_en.md).

### GPX

GPX is an XML-based format primarily used to store GPS routes and tracks. A track can contain location points and may include timestamps and elevation. Unlike FIT, GPX does not guarantee detailed sensor measurements such as heart rate or power. Speed may need to be calculated from location and time data when it is not included. See the [GPX format description](Activity%20files%20definition/gpx_format_description_en.md).

## MVP Scope

The initial scope is to test loading an activity file in FIT or GPX format, extract the available data, and display it in a chart.

## Screens and Navigation

### Login Dialog

When the app opens, it displays a dialog asking the user for a username and password. After successful sign-in, the dialog closes and the user enters the main screen.

### Main Screen

The app has a single main screen containing:

- A field showing the selected activity file and a button that opens a file-selection dialog.
- A chart area in a box centered on the screen, displaying the graph for the loaded file.

## Sample Data

The repository's [`Example Data`](../Example%20Data/) folder contains sample activity files downloaded from Garmin in both FIT and GPX formats:

- [FIT example](../Example%20Data/Castillo_de_ba%C3%B1os_y_vuelta.fit)
- [GPX example](../Example%20Data/Castillo_de_ba%C3%B1os_y_vuelta.gpx)

## Design Principles

- Keep the interface focused on loading and reviewing an Activity.
- Clearly identify the selected file and the data shown in the chart.

## Initial Technology Stack

The following stack is the current proposal:

| Area                | Proposed technology                                              |
| ------------------- | ---------------------------------------------------------------- |
| Frontend            | React 19, TypeScript, Vite, and React Router                     |
| Backend             | C# with ASP.NET Core Web API on .NET 10 LTS                      |
| Database            | PostgreSQL 16 with Entity Framework Core and the Npgsql provider |
| Authentication      | JWT-based authentication and BCrypt password hashing             |
| Containers          | Docker Compose to run the frontend, API, and database            |
| Frontend testing    | Vitest and Testing Library                                       |
| Backend testing     | xUnit                                                            |
| Integration testing | Playwright                                                       |

**.NET version note:** .NET 10 is an active LTS release, supported through November 14, 2028. See the [Microsoft .NET support policy](https://dotnet.microsoft.com/en-us/platform/support/policy/dotnet-core).

## Assumptions and Open Questions

### Assumptions

- The initial mockup focuses on cycling Activities imported from local FIT or GPX files.
- Only data available in an Activity file will be displayed; missing values will not be treated as zero.
- Loading a new Activity updates the chart to show that Activity.

### Open Questions

- Should Activities remain in memory only, or should they also be stored in PostgreSQL?
- If a GPX file has timestamps and GPS points but no speed values, should the app calculate speed?
- Which units should be used for speed and distance?
- What should happen when a selected file is invalid or does not contain the data required for the chart?
- How will the username and password be created or provided in the initial version?

## Mockup Acceptance Criteria

- The app presents the login dialog before the user enters the main screen.
- After successful authentication, the user can access the main screen.
- The main screen provides a file-selection control for choosing a local FIT or GPX file.
- After a file is selected, its name is visible in the selected-file field.
- The selected file is loaded as the current Activity in memory.
- When the Activity contains usable time and speed data, the chart plots time on the horizontal axis and speed on the vertical axis.
- The chart represents the currently loaded Activity and updates when a different Activity is loaded.
- Missing measurements are not presented as zero values.
