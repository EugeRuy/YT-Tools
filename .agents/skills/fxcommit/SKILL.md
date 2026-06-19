---

name: fxcommit

description: Create clean conventional commits for personal software projects.

---

# FX Commit

When asked to create a commit:

1. Analyze the modified files and understand the purpose of the changes.

2. Determine the most appropriate Conventional Commit type:

   * feat: new feature
   * fix: bug fix
   * refactor: code restructuring
   * docs: documentation updates
   * style: formatting only
   * test: tests added or modified
   * chore: maintenance or configuration changes
   * perf: performance improvements

3. Generate a short commit message using:

   <type>: short description

Examples:

* feat: add whisper segment export
* fix: prevent temporary audio files from remaining on disk
* refactor: simplify transcript generation workflow
* docs: update installation instructions

4. Keep the message under 72 characters.

5. Focus on the intent of the change rather than listing modified files.

6. Do not use:

   * Co-Authored-By
   * amend commits
   * overly long commit messages

7. If multiple unrelated changes are detected, suggest creating separate commits.

8. Show the commit message before executing any git command.



