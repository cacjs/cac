# Skills Generation Information

This document records how the CAC skill was generated and how to keep it synchronized with the repository examples.

## Generation Details

**Generated from repository content at:**

- **Commit SHA**: `be7d57e5f5da54dd201784cc31d1c7cce019a3fe`
- **Date**: 2026-04-07
- **Commit**: chore: upgrade deps

**Source material:**

- Public docs: `/README.md`
- Canonical examples: `/examples`
- Implementation details checked against `/src`

**Generation date**: 2026-05-17

## Structure

```text
skills/
├── GENERATION.md
└── cac/
    ├── SKILL.md
    └── references/
        ├── basic-usage.md
        ├── browser.md
        ├── command-examples.md
        ├── command-options.md
        ├── default-command-inverted.md
        ├── default-command.md
        ├── deno.md
        ├── dot-nested-options.md
        ├── help.md
        ├── ignore-default-value.md
        ├── negated-option.md
        ├── sub-command.md
        └── variadic-arguments.md
```

## Source-to-Reference Mapping

Reference files mirror the canonical examples so changes have an obvious destination:

| Example source | Skill reference |
| --- | --- |
| `examples/basic-usage.ts` | `skills/cac/references/basic-usage.md` |
| `examples/browser/` | `skills/cac/references/browser.md` |
| `examples/command-examples.ts` | `skills/cac/references/command-examples.md` |
| `examples/command-options.ts` | `skills/cac/references/command-options.md` |
| `examples/default-command-inverted.ts` | `skills/cac/references/default-command-inverted.md` |
| `examples/default-command.ts` | `skills/cac/references/default-command.md` |
| `examples/deno.ts` | `skills/cac/references/deno.md` |
| `examples/dot-nested-options.ts` | `skills/cac/references/dot-nested-options.md` |
| `examples/help.ts` | `skills/cac/references/help.md` |
| `examples/ignore-default-value.ts` | `skills/cac/references/ignore-default-value.md` |
| `examples/negated-option.ts` | `skills/cac/references/negated-option.md` |
| `examples/sub-command.ts` | `skills/cac/references/sub-command.md` |
| `examples/variadic-arguments.ts` | `skills/cac/references/variadic-arguments.md` |

## How to Update Skills

When examples or public behavior change:

### 1. Check changes since generation

```bash
git diff be7d57e5..HEAD -- examples/ README.md src/
git diff --name-only be7d57e5..HEAD -- examples/ README.md src/
git log --oneline be7d57e5..HEAD -- examples/ README.md src/
```

### 2. Update process

**When an existing example changes**

- Update the same-named reference file.
- Update `SKILL.md` if the change alters the scenario index, syntax table, or a core behavior rule.

**When a new example is added**

- Add a same-named reference file under `skills/cac/references/`.
- Add it to the `Scenario References` table in `SKILL.md`.
- Add it to the source-to-reference mapping in this file.

**When an example is removed or renamed**

- Remove or rename the matching reference file.
- Update the `Scenario References` table in `SKILL.md`.
- Update the mapping in this file.

**When public behavior changes without an example change**

- Re-check `README.md` and `/src`.
- Update `SKILL.md` first, then add or revise references only when a scenario example is affected.

### 3. Update checklist

- [ ] Read the diff for `examples/`, `README.md`, and `src/`
- [ ] Update same-named reference files for changed examples
- [ ] Add/remove references for added/removed examples
- [ ] Update the `Scenario References` table in `SKILL.md`
- [ ] Update this `GENERATION.md` with the new SHA, date, and mapping
- [ ] Re-run skill validation

## Style Guidelines

- Preserve CAC's own example taxonomy instead of inventing a second one.
- Keep `SKILL.md` focused on rules, selection, and invariants.
- Keep references scenario-specific: one example, its intended use, and only the notes needed to apply it correctly.
- Prefer source-aligned examples over synthetic variants unless a source example is misleading or outdated.

## Version History

| Date | SHA | Changes |
| --- | --- | --- |
| 2026-05-17 | `be7d57e5` | Initial CAC skill with one-to-one example references |

---

Last updated: 2026-05-17  
Current SHA: `be7d57e5`
