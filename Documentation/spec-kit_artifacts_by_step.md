# Spec Kit Artifacts by Step

The diagram shows the expected workflow; it does not imply that every step has already been run. The constitution is established once for the project; the remaining steps repeat for each feature. Light-gray boxes identify the steps, and thick red arrows show the sequence. Dotted arrows show which step creates or updates each artifact, or produces a report; they do not show read-only inputs. Each artifact appears only once.

```mermaid
flowchart TD
    S1["1. /speckit-constitution"] --> S2["2. /speckit-specify"]
    S2 --> S3["3. /speckit-clarify"]
    S3 --> S4["4. /speckit-plan"]
    S4 --> S5["5. /speckit-checklist"]
    S5 --> S6["6. /speckit-tasks"]
    S6 --> S7["7. /speckit-analyze"]
    S7 --> S8["8. /speckit-implement"]
    S8 --> S9["9. /speckit-converge"]
    S9 -->|"Remaining work"| S8
    S9 -->|"Next feature after convergence"| S2

    S1 -.->|"creates or updates"| CONSTITUTION[".specify/memory/constitution.md"]
    S2 -.->|"creates"| SPEC["spec.md"]
    S3 -.->|"updates"| SPEC
    S2 -.->|"creates"| REQUIREMENTS["checklists/requirements.md"]
    S3 -.->|"revalidates; updates if needed"| REQUIREMENTS
    S2 -.->|"sets"| FEATURE[".specify/feature.json"]
    S4 -.->|"creates"| PLAN["plan.md"]
    S4 -.->|"creates"| RESEARCH["research.md"]
    S4 -.->|"creates"| MODEL["data-model.md"]
    S4 -.->|"creates if applicable"| CONTRACTS["contracts/"]
    S4 -.->|"creates"| QUICKSTART["quickstart.md"]
    S5 -.->|"creates or appends"| CHECKLISTS["checklists/&lt;custom&gt;.md"]
    S6 -.->|"creates"| TASKS["tasks.md"]
    S8 -.->|"updates task status"| TASKS
    S9 -.->|"appends if work remains"| TASKS
    S7 -.->|"reports in chat"| REPORT["Analysis and convergence reports<br/>(no report file)"]
    S9 -.->|"reports in chat"| REPORT
    S8 -.->|"creates or updates"| CODE["Application code, tests<br/>and documentation"]

    classDef featureStep fill:#eeeeee,stroke:#555555,color:#111111
    class S1,S2,S3,S4,S5,S6,S7,S8,S9 featureStep
    linkStyle 0,1,2,3,4,5,6,7,8,9 stroke:#d00000,stroke-width:3px,color:#d00000
```

Except for the shared constitution and local active-feature pointer, these artifacts belong to the feature directory. `checklists/requirements.md` is maintained by `/speckit-specify` and `/speckit-clarify`; custom checklists from `/speckit-checklist` are reviewed by the user. For the FIT feature, clarification questions were answered during `specify` and `plan`, without a separate `clarify` invocation.

See the [Spec Kit usage guide](./spec-kit_use-guide.md) for details about each step.
