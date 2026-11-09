# Cycling Performance Assistant

The primary goal of this project is to learn how to use AI in software development through agentic workflows: agents, skills, MCP servers, hooks, guardrails, and related tools. Cycling Performance Assistant is the practical project used to explore these capabilities while building something useful: a system for reviewing ride data, understanding trends, and comparing activities.

## Project Goals

- Learn to design, configure, and evaluate AI-assisted development workflows using agents, skills, MCP servers, hooks, and guardrails.
- Practice applying these tools across the software development lifecycle, including discovery, specification, planning, implementation, testing, documentation, and review.
- Use a cycling performance analysis system as a real-world project for that learning.
- Explore activity summaries and, when available, detailed telemetry such as speed, heart rate, power, altitude, cadence, and GPS data.
- Make comparisons and patterns easier to investigate without presenting assumptions as proven causes.
- Keep numerical results traceable to the underlying activities and calculations.

## Ideas Under Consideration

Potential capabilities include importing activities from files or services such as Garmin and Strava, viewing activity details, summarizing metrics over a selected period, comparing rides, and exploring performance patterns. An AI assistant and real-time telemetry are also ideas for future investigation.

These are candidates, not an agreed roadmap. Missing measurements should remain distinct from zero, and analysis should account for differences in routes, conditions, sensors, and data quality where possible.

## Current Status

Product discovery is in progress. The initial audience, first-version scope, data source, feature priorities, technology stack, and hosting approach have not yet been selected. No application implementation is documented yet.

## Documentation

- [Product discovery and Spec Kit workflow](Documentation/1-%20Product%20Discovery%20Workflow.md): how to shape the product backlog and take selected features through specification and implementation.
- [Brainstorming](Documentation/2%20-%20Brain%20Storming.md): product vision, candidate capabilities, data considerations, and open questions.
- [Additional ideas](Documentation/ideas.md): an evolving list of possible data, workflows, and features.
- [Technical guide](Documentation/Technical-Guide.md): repository details and the current development workflow.
