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

Initialize Spec Kit in this existing repository and configure its GitHub Copilot integration. This will add the Spec Kit project files and agent skills needed for the workflow. The exact initialization options and commands will be confirmed before this step is carried out.

Reference: [Adopting Spec Kit in an Existing Project](https://github.com/github/spec-kit/blob/main/docs/how-to/existing-projects.md).
