# Lab 2 – Git Workflow Log

| Item | Detail |
|------|--------|
| **Branch** | `feat/data-validator` |
| **Base** | `main` |
| **Commit hash** | `10600ac` |
| **Commit message** | `feat(validator): add validateSchema helper for required string fields` |
| **Files changed** | `workshop-apps/lab-2-git-demo/src/utils/validator.js` (+32 lines) |
| **Push result** | ✅ Success – `* [new branch] feat/data-validator -> feat/data-validator` |
| **PR creation method** | Browser (gh CLI not installed; manual via GitHub pull/new URL) |
| **PR URL** | https://github.com/Vitalij83/Test_ibmBob_2026.11.09/pull/new/feat/data-validator |

## Issues Encountered & Resolutions

| Issue | Resolution |
|-------|------------|
| `gh` CLI not installed | Switched to browser-based PR creation (Option 3 from lab guide) |
| `Lab 1 Calculator.exe` (180 MB) exceeded GitHub's 100 MB file size limit | Removed `release/` and `dist/` from all commits via `git filter-branch`; added ignore rules to `.gitignore` |
| Remote `main` already had commits (template on GitHub) | Resolved with `git pull origin main --rebase` before pushing |

## Notes

- `task-history/` was never staged (covered by `.gitignore` rule `task-history/*`).
- `.bob/` was never staged or committed.
- Only explicit paths were used for staging at all times (`git add workshop-apps/lab-2-git-demo/`).
- PR description is in `workshop-git/lab-2-pr/pr-description.md`.
