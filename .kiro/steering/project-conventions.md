# Project Conventions

## Project Overview

This is an Astro Starlight documentation site for the **ECS Express Mode Walkthrough**. It documents the `terraform-aws-ecs-express-mode-demo` project — a minimal ECS Express Gateway Service deployment with Bedrock, auto scaling, managed ALB, and public HTTPS ingress.

Deployed to GitHub Pages at `https://jajera.github.io/ecs-express-mode-walkthrough`.

## Project Structure

```text
ecs-express-mode-walkthrough/
├── .github/workflows/     # CI/CD (deploy, commitmsg-conform, markdown-lint)
├── .kiro/steering/        # AI guidance files
├── .vscode/               # Editor settings, extensions, cspell, tasks
├── src/
│   ├── assets/screenshots/  # Console screenshots (replace placeholders)
│   ├── components/          # Astro components (Tooltip.astro)
│   ├── content/docs/        # MDX content pages
│   └── data/                # glossary.ts
├── scripts/               # Validation scripts
├── tests/properties/      # Property-based tests (Vitest + fast-check)
├── astro.config.mjs       # Starlight config, sidebar, plugins
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## File Naming Conventions

- Content pages: **kebab-case** (e.g., `express-gateway-service.mdx`, `task-execution-role.mdx`)
- Components: **PascalCase** (e.g., `Tooltip.astro`)
- Data files: **kebab-case** (e.g., `glossary.ts`)
- Config files: standard names (`astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`)

## Commit Message Format

Use **Conventional Commits**:

```text
<type>(<scope>): <description>

[optional body]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`

Examples:

- `feat(content): add ECS Express Mode concepts page`
- `docs(glossary): add Shared_ALB term definition`
- `fix(tooltip): correct aria-describedby reference`
- `ci(deploy): update Node version in workflow`

## Branch Strategy

- `main` — production branch, deploys to GitHub Pages on push
- Feature branches: `feat/<short-description>` or `docs/<short-description>`
- All PRs target `main` and must pass commit message conformance + markdown-lint checks

## Tech Stack

- **Framework**: Astro with @astrojs/starlight
- **Theme**: starlight-theme-vintage
- **Icons**: unplugin-icons (mdi, simple-icons)
- **Node**: 22 (pinned in .nvmrc)
- **Package manager**: npm
- **Testing**: Vitest + fast-check
- **Linting**: markdownlint-cli2, Prettier
