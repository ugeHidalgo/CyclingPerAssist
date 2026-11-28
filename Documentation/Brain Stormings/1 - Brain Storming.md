# Cycling Performance Assistant — BrainStorming

## Document Purpose

This is a living brainstorming document for Cycling Performance Assistant. It captures initial ideas before they are organized, prioritized, and refined into requirements.

The features below are possibilities, not implementation commitments. Future sessions will add ideas, refine existing ones, and record decisions. All project artifacts will be written in English, even when discussions take place in Spanish.

## 1. Primary Objective: Learn Agentic Development

The primary goal is to learn Agentic Development while building a useful cycling performance analysis system.

The project should provide practical opportunities to explore how AI agents can support software development, including requirements refinement, planning, implementation, testing, documentation, and review.

Learning Agentic Development and building AI-powered product features are related but distinct goals: agents can help develop the system even before it includes an AI analysis assistant.

### Suggested Learning Opportunities

- Break features into small, verifiable development tasks.
- Define acceptance criteria before asking an agent to implement a feature.
- Practice providing agents with relevant context and clear boundaries.
- Review generated code and validate outcomes rather than accepting them automatically.
- Record useful workflows, mistakes, and lessons learned.

## 2. Product Vision

Create an AI-based system for studying cyclists' performance using data recorded during their rides.

A dashboard will display key session metrics and accumulated statistics. Analysis will help users explore performance patterns, compare rides over time, and investigate possible relationships with training or bicycle gear usage.

## 3. Initial Data Sources and Collection Ideas

- Ride data is usually recorded by GPS devices carried by cyclists on their bicycles.
- Connected sensors can capture additional measurements during each ride.
- Retrieve recorded activities from Garmin and/or Strava.
- Process imported data so it can be queried, visualized, and compared.
- Explore the complete path from recording a ride to reviewing its performance data.

**Open scope question:** Does recording mean using existing devices and importing their files or platform data, or should the project eventually include its own live recording capability?

Platform access, permissions, available fields, and integration limitations must be investigated before committing to an integration.

### Suggested Additional Import Option

Consider direct activity-file uploads, such as FIT, GPX, or TCX, as a possible starting point or complement to platform integrations. Available measurements will depend on the file format and recording device.

## 4. Initial Measurements

| Measurement    | Examples / Notes                                    |
| -------------- | --------------------------------------------------- |
| Distance       | Ride distance and accumulated distance              |
| Speed          | Recorded speed and average speed                    |
| Time           | Duration; distinguish elapsed time from moving time |
| Heart rate     | Recorded values and average heart rate              |
| Power          | Recorded watts and average power                    |
| Altitude       | Elevation profile and altitude measurements         |
| Elevation gain | Total ascent and accumulated climbing               |
| Temperature    | Recorded temperature when available                 |
| Bicycle gear   | Gear used over time, when recorded and accessible   |

Not every ride will contain every measurement. Missing measurements must remain distinguishable from zero values.

### Suggested Additional Measurements

- Cadence.
- GPS coordinates, route geometry, and gradients.
- Maximum values and time spent in heart-rate or power zones.
- Rider notes about perceived effort and ride conditions.

## 5. Data Processing and Storage

### Initial Ideas

- Obtain activity data from Garmin and/or Strava.
- Process session data for individual-ride and aggregate queries.
- Retain enough detail to support comparisons across dates.

### Suggested Refinements

- Store activity summaries separately from timestamped sensor samples.
- Normalize units and timestamps while preserving original source information.
- Detect duplicate activities, including rides imported from multiple sources.
- Identify missing samples, sensor dropouts, and implausible values.
- Define consistent calculations for moving time, average speed, average power, and elevation gain.
- Support incremental imports without repeatedly processing unchanged activities.
- Make import failures and data-quality limitations visible to the user.

## 6. Dashboard and Queries

### Initial Ideas

- Display the main parameters of individual cycling sessions.
- Query totals and averages for a selected period.
- Explore weekly distance, accumulated climbing, average power, average speed, and average heart rate.
- Inspect changes in these measurements over time.

### Suggested Views

- **Overview:** Selected-period totals, trends, and recent rides.
- **Activity detail:** Session metrics, route, elevation profile, and sensor time series.
- **Period comparison:** Compare weeks, months, or custom date ranges.
- **Ride comparison:** Compare selected sessions side by side.

Aggregation rules need refinement: a simple average of activity averages may differ from an average weighted by recorded duration. Similarly, weekly distance and total ascent should be sums, not averages.

## 7. Performance Patterns and Ride Comparisons

### Initial Ideas

- Compare the same cyclist riding the same route on different dates.
- Investigate performance improvements that may relate to training.
- Explore whether gear usage is associated with differences in performance.
- Identify patterns across repeated sessions.

### Suggested Analysis Questions

- Is the cyclist completing a comparable route faster?
- Is heart rate lower at a comparable power output?
- Is power higher at a comparable heart rate?
- Does performance change on repeated climbs or route sections?
- Are gear-selection patterns associated with changes in speed, power, or heart rate?
- Are apparent improvements consistent over several rides?

### Interpretation Boundaries

Comparisons should account for differences in route, stops, weather, bicycle setup, sensor availability, and data quality where possible.

Observed associations do not establish that training or gear selection caused an improvement. AI-generated explanations should distinguish measured facts, hypotheses, and insufficient evidence.

## 8. Suggested AI Assistant Capabilities

These extend the initial AI-based analysis idea and remain proposals.

- Ask natural-language questions about recorded rides, such as “How many kilometers did I ride this week?”
- Generate evidence-backed summaries of individual rides or selected periods.
- Explain differences between comparable sessions using the underlying measurements.
- Highlight trends and unusual values for further investigation.
- Suggest relevant comparisons without presenting uncertain conclusions as facts.

Numerical answers should come from reproducible calculations over stored data, not invented model outputs. Explanations should identify the activities, periods, and metrics they rely on.

## 9. Suggested Privacy and Access Considerations

- Define who can access each cyclist's activities.
- Obtain appropriate consent for importing and processing data.
- Protect platform credentials, sensor data, and precise location information.
- Consider hiding sensitive route endpoints when sharing activity views.
- Plan for disconnecting integrations and deleting imported data.
- Avoid treating performance analysis as medical advice.

## 10. Questions for Future Refinement

- Is the first version for one cyclist, multiple cyclists, or a coach managing a group?
- Which import source should come first: files, Garmin, or Strava?
- Is historical analysis sufficient initially, or is live data required?
- Which measurements are actually available in the intended devices and accounts?
- How should identical or sufficiently similar routes be recognized?
- How should averages, date boundaries, and elevation gain be calculated?
- What should be the first useful dashboard view?
- Which AI capabilities belong in the first version?
- What development workflow will best support learning Agentic Development?
- Where should the project and this document be maintained long term?

## 11. Candidate Starting Point — Not Yet Agreed

A small end-to-end slice could be:

1. Import a recorded activity from one supported source.
2. Store its summary and available sensor samples.
3. Display its main metrics in an activity-detail view.
4. Calculate weekly distance and total elevation gain.
5. Compare two rides on a known repeated route.
6. Add an AI-generated explanation backed by those calculations.

This is a discussion proposal, not an agreed roadmap or technology choice.

## 12. Future Document Evolution

Keep adding ideas here before converting them into a structured backlog. As ideas mature, clarify their purpose, expected behavior, required data, dependencies, acceptance criteria, and priority.

No technology stack, hosting approach, integration order, or final feature scope has been selected.
