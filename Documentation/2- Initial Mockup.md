# Initial Mockup

## Table of Contents

- [App Definition (Objective)](#app-definition-objective)
- [Target Users](#target-users)
- [Core User Flows](#core-user-flows)
- [Activity Files Type](#activity-files-type)
- [Example Data](#example-data)
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

## Example Data

The repository's [`Example Data`](../Example%20Data/) folder contains sample activity files downloaded from Garmin in both FIT and GPX formats:

- [FIT example](../Example%20Data/Castillo_de_ba%C3%B1os_y_vuelta.fit)
- [GPX example](../Example%20Data/Castillo_de_ba%C3%B1os_y_vuelta.gpx)

## MVP Scope

## Screens and Navigation

## Sample Data

## Design Principles

## Initial Technology Stack

## Assumptions and Open Questions

## Mockup Acceptance Criteria
