# Spec Kit Usage Guide

This document records how to install Spec Kit, integrate it into this existing project, and use its full workflow to develop a feature. Installation and integration are one-time setup steps; the full workflow is repeated for each feature, except that the project constitution is established once.

## Adding spek-kit to our project

### Step 1: Install the Spec Kit CLI

Spec Kit's `specify` CLI is used to set up Spec Kit for a project. The CLI requires `uv`.

On macOS, install `uv` if it is not already installed, then install the Spec Kit CLI:

```sh
brew install uv
uv tool install specify-cli
```

If `uv` is already installed, run only:

```sh
uv tool install specify-cli
```

Reference: [Spec Kit Quickstart](https://github.com/github/spec-kit/blob/main/docs/quickstart.md).

### Step 2: Integrate Spec Kit into the Project

From the repository root, initialize Spec Kit in the existing project with the GitHub Copilot integration:

```sh
specify init --here --force --integration copilot --non-interactive
```

- `--here` initializes the current repository instead of creating a new project directory.
- `--force` allows initialization in a non-empty repository and can overwrite files at conflicting Spec Kit-managed paths. Use it only from a clean, reviewable branch.
- `--integration copilot` installs the Copilot skills used by the Spec Kit workflow.
- `--non-interactive` uses documented defaults instead of prompting for choices.

This adds shared Spec Kit templates, scripts, and workflow files under `.specify/`, plus Copilot skills under `.github/skills/`. Review the generated files before committing. The initial constitution at `.specify/memory/constitution.md` is a template and must be completed separately with `/speckit-constitution`.

Reference: [Adopting Spec Kit in an Existing Project](https://github.com/github/spec-kit/blob/main/docs/how-to/existing-projects.md).

## Full Path: Develop a Feature

Invoke each `/speckit-*` skill separately in GitHub Copilot Chat and review its output before moving to the next step. These skills are not terminal commands.

### Workflow and Artifacts

See the [workflow and artifacts diagram](./spec-kit_artifacts_by_step.md) for the expected outputs of each step and the implementation/convergence loop.

### Step 1: `/speckit-constitution` - Establish Project Principles

Create or update `.specify/memory/constitution.md` with the principles that should guide all features. This step is run once for the project, before beginning the feature workflow.

For this project, potential principles to discuss include reproducible metric calculations, keeping missing telemetry distinct from zero, separating observations from causal claims, protecting credentials and activity data, and reviewing AI-generated changes.

| What belongs in the constitution | What doesn't (use another command) |
| --- | --- |
| Quality, testing, privacy, and simplicity principles | What the app does or a feature requirement such as displaying a speed chart (`/speckit-specify`) |
| Cross-cutting constraints, such as performance and accessibility | The specific technology stack and architecture (`/speckit-plan`) |
| Governance and amendment rules | The feature task list (`/speckit-tasks`) |

A common mistake is to put functional requirements such as "display a speed chart" in the constitution. That belongs in a feature specification, not in a project-wide principle.

For this project, `/speckit-constitution` completed and ratified [`.specify/memory/constitution.md`](../.specify/memory/constitution.md). It records the project-wide principles, performance constraints, development workflow, and governance metadata. The performance target and governance rules remain to be defined.

### Step 2: `/speckit-specify` - Define the Feature

Describe only what the selected feature must do and why it matters; do not specify the technology stack or architecture, which belong in `/speckit-plan`. A specification should contain:

- Prioritized user stories, each independently testable.
- Verifiable functional requirements (FR-001, FR-002, etc.).
- Measurable, technology-agnostic success criteria.
- Explicit edge cases and assumptions.
- `[NEEDS CLARIFICATION]` markers wherever information is missing, rather than letting the agent invent answers. Resolve these later with `/speckit-clarify`.

Keep the first feature small enough to implement and review independently.

For the cycling mockup, a possible first feature is loading an activity file and displaying its speed over time. Decide whether to begin with FIT only or include GPX, and whether authentication belongs in this feature or a later one.

Example prompt to refine before use:

```text
/speckit-specify Load a local cycling Activity file and display its speed over time in a chart. Define the supported file formats and expected behavior for missing time or speed data.
```

For the FIT activity feature, `/speckit-specify` created:

- [`spec.md`](../specs/001-fit-speed-chart/spec.md): prioritized user stories, acceptance scenarios, requirements, edge cases, and success criteria.
- [`checklists/requirements.md`](../specs/001-fit-speed-chart/checklists/requirements.md): the specification quality checklist used to review completeness and readiness.
- [`.specify/feature.json`](../.specify/feature.json): the local active-feature pointer used by subsequent commands. This file is ignored by Git.

### Step 3: `/speckit-clarify` - Resolve Ambiguities

Answer targeted questions about behavior that is missing or unclear. Spec Kit incorporates the decisions into the specification. For activity loading, clarify supported formats, units, missing measurements, invalid files, and whether the file is processed in memory or persisted.

Run this step before planning so the design is based on agreed requirements rather than assumptions.

`/speckit-clarify` records accepted answers in the active feature's `spec.md`, including a dated `Clarifications` section and updates to affected requirements or scenarios. It also revalidates the existing requirements checklist if present; it does not normally create a separate clarification file.

For the FIT activity feature, the initial questions were answered during `/speckit-specify`, so `/speckit-clarify` was not run separately. Additional questions arose during planning; their answers were recorded in the [specification](../specs/001-fit-speed-chart/spec.md) and its [requirements checklist](../specs/001-fit-speed-chart/checklists/requirements.md).

### Step 4: `/speckit-plan` - Design the Technical Approach

Generate the technical design artifacts from the clarified specification. This is where the proposed stack and architecture belong. For the FIT activity feature, the plan uses React, TypeScript, and a Docker-served client; FIT processing remains in the browser.

Check that the plan fits the selected feature and existing repository. Avoid adding infrastructure, such as database persistence, if the feature does not need it.

For the FIT activity feature, `/speckit-plan` produced these artifacts under [`specs/001-fit-speed-chart/`](../specs/001-fit-speed-chart/):

- [`plan.md`](../specs/001-fit-speed-chart/plan.md): the technical approach, project structure, constitution checks, and testing strategy.
- [`research.md`](../specs/001-fit-speed-chart/research.md): technology choices, rationale, and alternatives considered.
- [`data-model.md`](../specs/001-fit-speed-chart/data-model.md): the in-memory activity data, validation rules, and state transitions.
- [`contracts/activity-screen.md`](../specs/001-fit-speed-chart/contracts/activity-screen.md): expected screen behavior, chart semantics, and the browser/container boundary.
- [`quickstart.md`](../specs/001-fit-speed-chart/quickstart.md): planned setup commands and end-to-end validation scenarios for after implementation.

Planning also captured agreed clarifications in the feature specification. It did not implement the application or infrastructure; `/speckit-tasks` creates the implementation task list in a later step.

### Step 5: `/speckit-checklist` - Review Requirement Quality

Generate a checklist for reviewing whether the specification is complete, clear, and consistent. This is a quality review of the requirements, not an implementation task list. Checklist items are reviewer-owned; marking an item complete means its requirement-quality criterion has been reviewed, not that the feature has been implemented.

Choose a review focus when invoking the command, such as FIT import, data privacy, or chart behavior. Spec Kit uses the feature's specification and available planning artifacts to formulate questions about the requirements themselves: for example, whether error behavior and the treatment of missing speed are clearly defined. It may ask questions to narrow the checklist's scope.

The expected artifact is a focused Markdown file under the feature's `checklists/` directory, for example `checklists/fit-import.md`. The command creates the file or appends items if it already exists; new items remain unchecked until the reviewer evaluates them. This is separate from the existing [`checklists/requirements.md`](../specs/001-fit-speed-chart/checklists/requirements.md), which is maintained by `/speckit-specify` and `/speckit-clarify`.

This step does not implement the feature, run application tests, or create `tasks.md`. For the FIT activity feature, [`checklists/fit-speed.md`](../specs/001-fit-speed-chart/checklists/fit-speed.md) contains the custom review checklist.

### Step 6: `/speckit-tasks` - Break Down the Work

Generate an actionable, dependency-ordered `tasks.md` from the specification and design. Review that tasks are small, verifiable, and include appropriate tests. For example, an activity-chart feature may need tasks for file selection, parsing the chosen format, preparing time-speed values, rendering the chart, and testing with a sample file.

The command reads `spec.md` and `plan.md`, along with the constitution and any available design artifacts such as `data-model.md`, `research.md`, `contracts/`, and `quickstart.md`. It organizes work into setup, shared prerequisites, prioritized user stories, and cross-cutting work. The tasks identify dependencies, opportunities for parallel work, relevant file paths, and independent validation for each story. For this project, the task list must also respect the constitution's test-first rule for parsing and calculations.

The expected artifact is `specs/001-fit-speed-chart/tasks.md`: a checklist of numbered implementation tasks, with story labels and parallel markers where applicable. It also documents dependency order, examples of parallel execution, and an incremental implementation strategy. The command reports a task summary in chat; it does not implement the feature or mark the reviewer-owned checklist as complete. Review that checklist and the generated tasks before proceeding.

For the FIT activity feature, [`tasks.md`](../specs/001-fit-speed-chart/tasks.md) contains the generated implementation plan, organized by phase and user story.

### Step 7: `/speckit-analyze` - Check Artifact Consistency

Run a read-only analysis across `spec.md`, `plan.md`, and `tasks.md`. It reports conflicts, gaps, and ambiguities; it does not fix them automatically. Correct issues in the relevant source artifact and run the analysis again before implementation.

### Step 8: `/speckit-implement` - Execute the Tasks

Implement the tasks in dependency order. Review the generated code and documentation, run the relevant tests, and compare the results with the acceptance criteria. Before implementation, Spec Kit checks checklist state and may ask before continuing if checklist items remain unchecked; it does not mark custom checklists complete for the reviewer.

For a larger feature, implementation can be performed in phases, followed by review and testing of each phase.

### Step 9: `/speckit-converge` - Verify Completion

Compare the implementation with the specification, plan, and tasks. If work remains, Spec Kit appends tasks to `tasks.md`; implement those tasks and run converge again until it reports that the feature has converged.

After convergence, review the final changes and submit them through a pull request to `main`.

### Workflow Notes

- The active feature is tracked in `.specify/feature.json`; changing Git branches alone does not select a different Spec Kit feature.
- The project's constitution is shared across features. The specification, plan, checklists, and tasks belong to the feature being developed.
- Run and review one skill at a time. Do not assume generated artifacts or code are correct without checking them.
