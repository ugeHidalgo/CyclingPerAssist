# Technical Guide

## Purpose

This document describes the technical setup and development workflow for Cycling Performance Assistant. It will evolve as the project's architecture, technology stack, and infrastructure are selected.

## Repository

| Setting | Value |
| --- | --- |
| Project | Cycling Performance Assistant |
| Repository | `ugeHidalgo/CyclingPerAssist` |
| GitHub URL | <https://github.com/ugeHidalgo/CyclingPerAssist> |
| Clone URL | `https://github.com/ugeHidalgo/CyclingPerAssist.git` |
| Main branch | `main` |
| Documentation directory | `Documentation/` |

## Current technical scope

No application technology stack, architecture, hosting approach, or integration order has been selected yet. These decisions will be documented here as they are agreed.

For product context, see:

- [Product Discovery and Spec Kit Workflow](./1-%20Product%20Discovery%20Workflow.md)
- [Initial brainstorming](./2%20-%20Brain%20Storming.md)
- [Additional ideas](./ideas.md)

## GitHub Copilot and repository access

The project can be hosted in this repository while using GitHub Copilot with the account connected in VS Code. Copilot access and repository permissions are separate:

- The account used for Copilot must have access to the service and comply with any applicable organization policies.
- The account used by Git to push changes must have write access to the repository.

## Main branch protection

The following settings are configured for `main`:

- Changes must be incorporated through a pull request from another branch.
- Direct pushes are blocked, including for administrators.
- Force pushes and deletion of `main` are blocked.
- No formal approving review is required. The pull request author can review the changes and merge their own pull request.
- GitHub automatically deletes the source branch in the repository after a pull request is merged, provided the branch is eligible for deletion.

GitHub does not allow authors to approve their own pull requests. Requiring one approving review would therefore require another person with the appropriate permissions.

Branch protection requires a pull request, but does not guarantee that its source branch was originally created from `main`. Creating branches from an updated `main` is part of the development procedure below.

## How to incorporate changes

Follow these four steps for each change. The branch name below is an example; use a descriptive name for the work being done.

The commands use `git switch`, which requires Git 2.23 or later. On older versions, including Git 2.15 currently installed in this development environment, use `git checkout main` instead of `git switch main`, and `git checkout -b <branch-name>` instead of `git switch -c <branch-name>`.

### 1. Update main and create a working branch

Start with a clean working tree. Commit or stash any existing work before changing branches.

```bash
git switch main
git pull --ff-only
git switch -c docs/update-product-vision
```

### 2. Make changes, commit them, and push the branch

Review the changes and run any relevant validation before committing. Stage only the files intended for this change; the example stages documentation.

```bash
git add Documentation/
git commit -m "Update product vision"
git push -u origin docs/update-product-vision
```

### 3. Open, review, and merge a pull request

On GitHub:

1. Open a pull request from the working branch into `main`.
2. Describe the changes and the validation performed.
3. Review the diff and resolve any problems before merging.
4. Merge the pull request.

For the current individual workflow, the author can perform this review and merge without a separate approving review.

### 4. Clean up after the merge

GitHub automatically deletes the remote source branch. Update local `main`, delete the local working branch, and remove stale remote-tracking references:

```bash
git switch main
git pull --ff-only
git branch -d docs/update-product-vision
git fetch --prune
```

After a squash or rebase merge, `git branch -d` may refuse deletion because the original commits are not ancestors of `main`. If that happens, verify that the pull request was merged and that the branch has no work that must be retained before explicitly force-deleting that local branch with `git branch -D docs/update-product-vision`.
