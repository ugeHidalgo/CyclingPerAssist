# Product Discovery and Spec Kit Workflow

## Purpose

This document describes how to move from the initial ideas for *Cycling Performance Assistant* to a product backlog and, later, use Spec Kit to define and implement each prioritized feature.

The main idea is to separate the work into two levels:

1. **Define the product and prepare the backlog.**
2. **Use Spec Kit to specify, plan, and implement concrete features.**

## Level 1: Define the product and prepare the backlog

Before implementation, turn the brainstorming into a general description of the product. This stage is primarily about product discovery and organization; it does not require Spec Kit.

The initial definition should clarify:

- **Vision and initial user:** who the product is for and what problem it aims to solve.
- **Goals and boundaries of the first version:** what it should achieve initially and what is out of scope.
- **Open questions and assumptions:** which decisions have not yet been made and what needs further investigation.
- **Candidate backlog:** possible features that still need to be validated, prioritized, and turned into development work.

The initial [brainstorming document](./2%20-%20Brain%20Storming.md) is useful source material: it brings together the product vision, ideas for analysis and visualizations, possible data sources, and open questions. Its ideas should not all be treated as implementation commitments.

For example, the initial backlog could include these candidates:

- Import cycling activities.
- View the details of a ride.
- View metrics aggregated over a period.
- Compare routes or activities.
- Explore performance patterns.
- Add AI-generated explanations based on verifiable calculations.

These are ideas to evaluate, not an agreed roadmap. Before prioritizing them, consider questions such as:

- Will the first version be for one cyclist or for a group?
- Where will activities initially come from: files, Garmin, or Strava?
- What is the first useful thing someone should be able to do with their data?
- Is historical analysis sufficient, or is live activity recording needed?

The backlog can be maintained in whatever format is most convenient: a document, GitHub Issues, or a board. The important thing is to keep ideas easy to review and prioritize.

## Level 2: Use Spec Kit for each selected feature

Spec Kit is mainly used once a backlog feature is defined well enough to work on. A workflow can be applied to each feature:

1. **Specify** what it should do and what problem it solves.
2. **Clarify** ambiguities, assumptions, and edge cases.
3. **Plan** a technical solution.
4. **Break down** the work into small, verifiable tasks.
5. **Implement** and review the changes, validating them with tests and acceptance criteria.

A possible first exercise would be **viewing the details of an imported activity**. Before specifying it, decide at least how that activity will be obtained. The brainstorming document lists files, Garmin, and Strava as possibilities, but does not select a source.

Spec Kit's *constitution* can help capture lasting project principles that should guide work across different features. For example:

- A missing measurement must not be interpreted as zero.
- Numerical calculations should be reproducible.
- Conclusions should distinguish measured facts from hypotheses.
- Personal data and location information require careful handling.

The *constitution* does not replace the product vision or generate the backlog on its own. It provides principles to guide subsequent work.

## Recommended workflow

1. Review and organize the brainstorming document.
2. Write down the vision, initial user, boundaries, and open questions.
3. Create a backlog of candidate features.
4. Prioritize a feature that provides value and can be handled in a focused way.
5. Apply Spec Kit to that feature: specification, clarification, plan, tasks, and implementation.
6. Review the generated artifacts and validate the results; do not assume the code is correct just because the agent has finished.
7. Learn from the cycle and repeat with the next prioritized feature.

In short: **first, define the vision and backlog; then use Spec Kit to specify and implement the prioritized features.**

## Official resources

- [Official Spec Kit quickstart guide](https://github.com/github/spec-kit/blob/main/docs/quickstart.md)
- [Spec Kit repository](https://github.com/github/spec-kit)
