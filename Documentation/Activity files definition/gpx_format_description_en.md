# GPX Format: Description of Activity Data

**GPX (GPS Exchange Format)** is an XML-based file format used to store and exchange GPS data between devices, applications, and mapping services. It is widely supported by GPS watches, bike computers, navigation apps, route-planning tools, and platforms such as Strava.

Unlike FIT, which can store detailed sensor and workout data, GPX is primarily designed to describe geographic locations and routes. It is particularly useful for viewing, sharing, editing, and navigating tracks.

## 1. Information a GPX file can contain

A GPX file is an XML document. Its information is organized into elements such as waypoints, routes, and tracks.

### A. Waypoints (`wpt`)

Waypoints represent individual geographic locations that are not necessarily part of a track.

| Field | Description |
|---|---|
| Latitude (`lat`) | Geographic latitude |
| Longitude (`lon`) | Geographic longitude |
| Elevation (`ele`) | Elevation above sea level, if available |
| Time (`time`) | Date and time associated with the waypoint |
| Name (`name`) | Waypoint name |
| Comment (`cmt`) | Short comment |
| Description (`desc`) | Longer description |
| Symbol (`sym`) | Symbol used to represent the waypoint |
| Type (`type`) | Waypoint category |

Examples include a mountain pass, a point of interest, a water stop, or a meeting location.

### B. Routes (`rte`)

A route is an ordered collection of route points. It generally describes a planned path from one location to another.

A route can contain:

- Route name and description.
- Ordered geographic points.
- Latitude and longitude for each point.
- Elevation, if available.
- Optional point names and comments.

Routes are commonly used for navigation and route planning. They do not necessarily represent the exact path actually travelled.

### C. Tracks (`trk`)

A track represents the path recorded by a GPS device during an activity. It is usually the most relevant part of a GPX file exported from a recorded Strava activity.

A track can contain:

- Track name and description.
- One or more track segments.
- A sequence of geographic points.
- Optional elevation and timestamp data for each point.

A track may be split into multiple segments (`trkseg`), for example when GPS recording is interrupted or the device is paused.

### D. Track points (`trkpt`)

Each track segment contains a sequence of track points. Every point represents a recorded geographic position.

| Field | Description |
|---|---|
| Latitude (`lat`) | GPS latitude |
| Longitude (`lon`) | GPS longitude |
| Elevation (`ele`) | Elevation at that point, if available |
| Time (`time`) | Timestamp of the recorded point |
| Course (`course`) | Direction of travel, if provided |
| Speed (`speed`) | Speed, if included as an extension |
| Heart Rate (`hr`) | Heart rate, if included as an extension |
| Cadence (`cad`) | Cadence, if included as an extension |

**Important:** Speed, heart rate, cadence, and other sensor measurements are not part of the core GPX 1.1 track-point definition. They may appear through extensions added by particular applications or devices, but support is not universal.

### E. Extensions (`extensions`)

GPX allows additional data to be stored in extension elements. These are commonly used to include information that is not defined by the core GPX specification.

Depending on the application or device, extensions may contain:

- Heart rate.
- Cadence.
- Power.
- Temperature.
- Speed.
- Other device-specific metrics.

Extension names and structures can vary between manufacturers and software platforms. An application processing GPX files should therefore treat these fields as optional and account for different extension schemas.

## 2. Conceptual example of a GPX file structure

A GPX file may contain the following elements:

```xml
<gpx version="1.1">
  <metadata>
    <name>Morning Cycling Activity</name>
    <time>2026-06-15T08:00:00Z</time>
  </metadata>

  <wpt lat="36.75" lon="-3.52">
    <ele>120</ele>
    <name>Starting Point</name>
  </wpt>

  <trk>
    <name>Morning Ride</name>
    <trkseg>
      <trkpt lat="36.75" lon="-3.52">
        <ele>120</ele>
        <time>2026-06-15T08:00:00Z</time>
      </trkpt>
      <trkpt lat="36.751" lon="-3.521">
        <ele>124</ele>
        <time>2026-06-15T08:00:05Z</time>
      </trkpt>
    </trkseg>
  </trk>
</gpx>
```

This is a simplified example. Real GPX files can contain many more track points, metadata fields, segments, and extensions.

## 3. Important considerations when downloading GPX files from Strava

A GPX export from Strava is generally focused on the activity's geographic track. It should not be assumed to contain every metric originally recorded by the device.

For example:

- GPS coordinates are normally the main content.
- Elevation and timestamps may be included.
- Heart rate and cadence may be present as extensions, depending on the export and source data.
- Power and other advanced sensor metrics may be absent.
- Some metrics calculated by Strava are not necessarily included.

The actual contents depend on the original recording, the data available to Strava, and the export process.

## 4. Processing GPX files with C#/.NET

Because GPX is XML-based, it can be processed using standard .NET XML APIs, such as `System.Xml.Linq` (`XDocument` and `XElement`).

There are also third-party libraries that provide higher-level GPX models and parsing functionality.

A basic .NET approach is:

1. Load the GPX document with `XDocument`.
2. Read the GPX namespace.
3. Extract track segments (`trkseg`) and track points (`trkpt`).
4. Parse latitude, longitude, elevation, and timestamps.
5. Read extension elements separately, accounting for namespace and schema differences.

Reference: https://www.topografix.com/gpx.asp

## 5. Potential applications

GPX is particularly suitable for applications that need to:

- Display an activity on a map.
- Reconstruct and visualize a GPS track.
- Calculate distances between recorded positions.
- Analyze elevation profiles.
- Compare routes.
- Detect route segments, climbs, and descents.
- Export routes to GPS devices or navigation applications.

For a C# application that analyzes Strava activities, GPX is a useful format for geographic analysis. However, if the goal is to analyze performance metrics such as power, heart rate, cadence, and detailed sensor data, FIT is generally a better source when those fields are available.

**Note:** GPX is a flexible exchange format, not a guarantee that every activity metric will be present. Always check the actual file contents and any extensions before relying on a particular field.
