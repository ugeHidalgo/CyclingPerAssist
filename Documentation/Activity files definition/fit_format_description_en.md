# FIT Format: Description of Activity Data

The **FIT (Flexible and Interoperable Data Transfer)** format is a binary file format originally developed by Garmin to store sports activity data. It is one of the most comprehensive formats for storing workouts recorded by Strava, Garmin, Wahoo, GPS devices, and bike computers.

Unlike GPX, which mainly focuses on GPS tracks, FIT can store a much wider range of data recorded during an activity.

## 1. Information a FIT file can contain

Data is organized into different types of messages.

### A. General activity information (Session)

This message contains a summary of the activity:

| Field              | Description                                  |
| ------------------ | -------------------------------------------- |
| Sport              | Sport type: cycling, running, swimming, etc. |
| Sub Sport          | Specific sport discipline                    |
| Start Time         | Activity start date and time                 |
| Total Elapsed Time | Total elapsed time                           |
| Total Timer Time   | Actual timer-running time                    |
| Total Distance     | Distance covered                             |
| Total Ascent       | Total elevation gain                         |
| Total Descent      | Total elevation loss                         |
| Avg Speed          | Average speed                                |
| Max Speed          | Maximum speed                                |
| Avg Heart Rate     | Average heart rate                           |
| Max Heart Rate     | Maximum heart rate                           |
| Avg Cadence        | Average cadence                              |
| Avg Power          | Average power                                |
| Max Power          | Maximum power                                |
| Calories           | Estimated calories burned                    |

### B. Individual records (Record)

It contains samples recorded during the activity, usually every second or at a configurable recording interval.

| Field          | Description             |
| -------------- | ----------------------- |
| Timestamp      | Timestamp of the sample |
| Position Lat   | GPS latitude            |
| Position Long  | GPS longitude           |
| Altitude       | Altitude                |
| Distance       | Cumulative distance     |
| Speed          | Instantaneous speed     |
| Heart Rate     | Heart rate              |
| Cadence        | Cadence                 |
| Power          | Instantaneous power     |
| Temperature    | Temperature             |
| Grade          | Gradient                |
| Vertical Speed | Vertical speed          |

For example, a cycling activity may contain 10,000 or more individual records.

### C. Laps (Lap)

This message allows an activity to be divided into different sections:

- Lap duration.
- Distance.
- Average and maximum speed.
- Average and maximum heart rate.
- Average and maximum power.
- Elevation gain.
- Average cadence.

### D. Events (Event)

This message records events that occur during an activity:

- Activity start and end.
- Timer start and stop.
- Auto-pause events.
- State changes.
- Lap-related events.

### E. Device information (Device Info)

This may include:

- Manufacturer.
- Device model.
- Serial number.
- Firmware version.
- Sensor type.

### F. Additional data

Depending on the device and how the FIT file was generated, it may also contain:

- Normalized Power (NP).
- Intensity Factor (IF).
- Training Stress Score (TSS).
- Left/right power balance.
- Pedaling efficiency.
- Running dynamics data.
- Ambient temperature.
- Advanced GPS data.

Not all these fields are present in every file.

## 2. Conceptual example of a FIT activity structure

A file may contain the following message types:

```text
cycling_activity.fit
│
├── File / Activity
│   └── General file and activity information
│
├── Session
│   └── Session summary
│
├── Lap
│   └── Laps or activity sections
│
├── Record
│   └── Individual records containing GPS data and metrics
│
├── Event
│   └── Activity events
│
└── Device Info
    └── Device and sensor information
```

## 3. Important considerations when downloading FIT files from Strava

One important point to keep in mind: **a FIT file downloaded from Strava does not necessarily contain all the original data recorded by the device**.

Strava may retain, process, or discard certain fields when importing and exporting an activity.

For example:

- Power and heart rate data may be available.
- Advanced power-meter data may not be included.
- Some original GPS data may not be available.
- Some metrics calculated by Strava are not necessarily stored in the FIT file.

Therefore, the actual contents depend on the source device, the sensors used, and how Strava has processed the file.

## 4. Processing FIT files with C#/.NET

There are libraries available for reading FIT files without having to implement the binary protocol yourself.

Recommendations:

- **Garmin FIT SDK**: the official SDK, supporting FIT file reading and writing.
- **FitSharp**: a .NET implementation for working with FIT files.

Official documentation: https://developer.garmin.com/fit/overview/
