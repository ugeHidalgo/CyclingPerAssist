# Additional Ideas

- Retrieve user data from Strava or Garmin through a Telemetry Host (TH), using an MCP server to connect to the TH.
- Define the data to use as telemetry, including:
  - Activity distance.
  - Activity duration.
  - Speed, average speed, and maximum speed.
  - Average and maximum heart rate.
  - Power (decide which power measurements to store).
  - Temperature and altitude.
  - Elevation gain and loss.
  - Gear ratio.
- Define a **session** as an activity performed by an athlete at a specific date and time, with associated data such as route, power, heart rate, speed, distance, and average speed.
- Connect to the TH, view available sessions, select one, and inspect its telemetry.
- Compare two sessions.
- Identify patterns in session data.
- Explore a Suffer Score or a similar metric that uses session data to produce a score.
- Explore real-time telemetry. One option is for a Garmin device to send data to the cloud so it can be viewed during a ride and used to assess questions such as whether the current pace is too intense for the remaining route.
