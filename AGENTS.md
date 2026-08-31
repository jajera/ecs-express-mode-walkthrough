# Agent notes

## Repos

| Repo                                         | Role                                              |
| -------------------------------------------- | ------------------------------------------------- |
| `jajera/ecs-express-mode-walkthrough`        | This docs site (GitHub Pages)                     |
| `jajera/terraform-aws-ecs-express-mode-demo` | Demo Terraform project this walkthrough documents |

Do not invent AWS account IDs, cluster names, or custom domains for the lab. Use placeholder values and default AWS endpoints only.

## Docs source of truth

Walkthrough steps live in `src/content/docs/**/*.mdx`. Keep sidebar slugs in `astro.config.mjs` aligned with those files.

## Site URL

Production docs: `https://ecs-express-mode-walkthrough.johna.kiwi` (Pages + Route 53 CNAME via johna-kiwi-infra `sites.yaml`).
