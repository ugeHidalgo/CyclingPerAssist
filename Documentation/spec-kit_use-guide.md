# Spec Kit Usage Guide

This document records the steps for using Spec Kit in this project. The CLI installation is Step 1, followed by integrating Spec Kit into this existing project.

## Step 1: Install the Spec Kit CLI

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

## Step 2: Integrate Spec Kit into the Project

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
