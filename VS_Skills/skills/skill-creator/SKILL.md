---
name: SkillCreator
description: The definitive guide to creating, structuring, and packaging Antigravity Agent Skills.
---

# 🧬 Skill Creator: Building the Builder

Skills are modular, self-contained packages that extend Antigravity's capabilities. They transform a general-purpose agent into a specialized expert.

## 1. 📂 Anatomy of a Skill

A skill consists of a `SKILL.md` file and optional resources.

```text
skills/
└── my-skill/
    ├── SKILL.md          <-- The brain (Required)
    ├── scripts/          <-- Python/Bash scripts (Optional)
    ├── references/       <-- Markdown docs/schemas (Optional)
    └── assets/           <-- Templates/Images (Optional)
```

### The `SKILL.md` File
This is the entry point. It **must** start with YAML frontmatter:

```yaml
---
name: my-skill
description: A clear description of WHAT this skill does and WHEN to use it.
---
```

## 2. 🧠 Principles of Good Skills

1.  **Concise is Key**: The context window is precious. Keep instructions high-level.
2.  **Progressive Disclosure**:
    -   **Level 1**: Metadata (Always loaded).
    -   **Level 2**: `SKILL.md` Body (Loaded on trigger).
    -   **Level 3**: References/Scripts (Loaded ONLY when needed).
3.  **Determinisim**: Use scripts (`scripts/`) for fragile tasks (e.g., PDF manipulation) rather than asking the LLM to "figure it out."

## 3. ✍️ Creating a Skill (Step-by-Step)

### Step 1: Initialize
Use the generator script to create the boilerplate:
```bash
scripts/init_skill.py my-new-skill
```

### Step 2: Define the Logic
-   **If it's a workflow**: Write clear, numbered steps in `SKILL.md`.
-   **If it's knowledge**: Put large docs in `references/` (e.g., `references/api-docs.md`) and link to them.
-   **If it's a tool**: Write a Python script in `scripts/`.

### Step 3: Package & Distribute
Validate your skill structure:
```bash
scripts/package_skill.py skills/my-new-skill
```

## 4. 📚 Best Practices

-   **System Prompts**: You can add "System Prompt" style advice in the `SKILL.md`.
    -   *Example*: "When writing SQL, ALWAYS use Common Table Expressions (CTEs)."
-   **Examples**: Provide concrete examples of inputs and outputs.
-   **Avoid Fluff**: No `README.md` or `CHANGELOG.md` inside the skill folder. Only what the agent needs.
