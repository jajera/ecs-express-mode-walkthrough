# ecs-express-mode-walkthrough

[![Deploy to GitHub Pages](https://github.com/jajera/ecs-express-mode-walkthrough/actions/workflows/deploy.yml/badge.svg)](https://github.com/jajera/ecs-express-mode-walkthrough/actions/workflows/deploy.yml)
[![Documentation](https://img.shields.io/badge/docs-GitHub%20Pages-blue)](https://jajera.github.io/ecs-express-mode-walkthrough/)

ECS Express Mode by example

Documentation for [terraform-aws-ecs-express-mode-demo](https://github.com/jajera/terraform-aws-ecs-express-mode-demo) — learn AWS ECS Express Mode by example through a minimal Express Gateway Service deployment with Terraform, managed ALB, auto scaling, and Bedrock.

Project scaffolding (Astro Starlight setup, GitHub Actions, VSCode config, Kiro steering) is adapted from [s3-vectors-rag-workload](https://github.com/jajera/s3-vectors-rag-workload). ECS-specific content, glossary terms, and console screenshots are new.

## What this is

An [Astro Starlight](https://starlight.astro.build/) site with concept explanations and hands-on walkthroughs covering:

| Section          | Content                                                         |
| ---------------- | --------------------------------------------------------------- |
| Overview         | What ECS Express Mode is, what the demo deploys                 |
| Prerequisites    | Tools, AWS permissions, Bedrock model access                    |
| ECS Express Mode | Concepts, Express Gateway Service, auto scaling, health checks  |
| IAM Roles        | Infrastructure, task execution, and task roles (Bedrock access) |
| Networking       | VPC layout, public subnets, security groups, ingress            |
| Deployment       | terraform apply, verification, web UI                           |
| Teardown         | Destroy all resources                                           |
| Troubleshooting  | Common Express Mode and Bedrock issues                          |
| Reference        | Limitations, when to use Express Mode, decision checklist       |

## Quick start

Use Node 22 (see `.nvmrc`).

```bash
npm ci
npm run dev
```

Open http://localhost:4321/ecs-express-mode-walkthrough/

## Scripts

| Script             | Purpose                                            |
| ------------------ | -------------------------------------------------- |
| `npm run dev`      | Start local development server                     |
| `npm run build`    | Production build to `dist/`                        |
| `npm run preview`  | Serve the production build locally                 |
| `npm run validate` | Prettier check, markdownlint, and content rules    |
| `npm run format`   | Auto-format with Prettier                          |
| `npm run lint`     | Lint MDX files in `src/`                           |
| `npm run test`     | Property-based content tests (Vitest + fast-check) |

Run the full quality gate before committing:

```bash
npm run validate && npm run test && npm run build
```

## Deploy

GitHub Pages on push to main via .github/workflows/deploy.yml.

1. Repo Settings - Pages: Source = GitHub Actions
2. astro.config.mjs: site and base must match the Pages URL

## Content source

The walkthrough content is based on [terraform-aws-ecs-express-mode-demo](https://github.com/jajera/terraform-aws-ecs-express-mode-demo).

## License

[MIT](LICENSE)
