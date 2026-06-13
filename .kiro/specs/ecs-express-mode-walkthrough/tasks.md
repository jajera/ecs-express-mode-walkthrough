# Implementation Plan: ECS Express Mode Walkthrough

## Overview

Build an Astro Starlight documentation site that teaches AWS ECS Express Mode by example, documenting the `terraform-aws-ecs-express-mode-demo` project. The implementation adapts scaffolding from the reference repo `github.com/jajera/s3-vectors-rag-workload` and adds ECS-specific content pages with placeholder screenshots. Testing uses Vitest with fast-check for property-based validation of content invariants.

## Tasks

- [x] 1. Set up project scaffolding adapted from reference repo
  - [x] 1.1 Initialize Astro project with package.json, tsconfig.json, .nvmrc (Node 22), .prettierrc, and .markdownlint.json adapted from reference repo
    - Create `package.json` with dependencies: astro, @astrojs/starlight, starlight-theme-vintage, unplugin-icons, @iconify-json/mdi, @iconify-json/simple-icons
    - Add devDependencies: vitest, fast-check, tsx, markdownlint-cli2, prettier
    - Add scripts: dev, build, preview, test
    - Create `tsconfig.json` extending Astro's strict preset
    - Create `.nvmrc` with content `22`
    - Create `.prettierrc` with standard formatting rules
    - Create `.markdownlint.json` with appropriate rules for MDX files
    - _Requirements: 1.1, 1.4, 1.5_

  - [x] 1.2 Create astro.config.mjs with Starlight, vintage theme, sidebar, and unplugin-icons
    - Configure `site: 'https://jajera.github.io'` and `base: '/ecs-express-mode-walkthrough'`
    - Set up Starlight integration with title, vintage theme plugin, and full sidebar structure
    - Configure unplugin-icons as Vite plugin with astro compiler
    - Sidebar sections: Introduction, Overview, Prerequisites, ECS Express Mode (4 pages), IAM Roles (4 pages), Networking (4 pages), Deployment (4 pages), Teardown, Troubleshooting, Reference (3 pages)
    - Only include Published_Pages in sidebar initially (Introduction, Overview, Prerequisites, ECS Express Mode section)
    - _Requirements: 1.1, 1.3, 1.4, 3.1, 3.2, 3.3, 3.4, 3.5, 9.4_

  - [x] 1.3 Create Tooltip component and glossary file
    - Create `src/components/Tooltip.astro` with term prop, aria-describedby, tabindex="0", CSS hover/focus transitions at 150ms
    - Create `src/data/glossary.ts` with all glossary terms: Express_Gateway_Service, Infrastructure_Role, Task_Execution_Role, Task_Role, Application_URL, RollbackAlarm, Shared_ALB, Bedrock, Foundation_Model, Inference_Profile, VPC, Internet_Gateway, Public_Subnet, Security_Group, CIDR_Block
    - _Requirements: 1.6, 1.7_

  - [x] 1.4 Create GitHub Actions workflows adapted from reference repo
    - Create `.github/workflows/deploy.yml` for GitHub Pages deployment on push to main (Node from .nvmrc, npm ci, npm run build, upload-pages-artifact, deploy-pages)
    - Create `.github/workflows/commitmsg-conform.yml` for Conventional Commits check on PRs (reusable workflow from actionsforge/actions)
    - Create `.github/workflows/markdown-lint.yml` for markdown linting on push and PRs
    - _Requirements: 1.2, 1.8, 2.2_

  - [x] 1.5 Create VSCode configuration files
    - Create `.vscode/settings.json` with Prettier default formatter, format-on-save, Astro formatter for .astro files
    - Create `.vscode/extensions.json` recommending astro-vscode, prettier, code-spell-checker
    - Create `.vscode/cspell.json` with project and glossary-related words
    - Create `.vscode/tasks.json` with dev (npm run dev, background) and build (npm run build, default build) tasks
    - _Requirements: 2.3, 2.4, 2.5, 2.6_

  - [x] 1.6 Create Kiro steering files adapted from reference repo
    - Create `.kiro/steering/project-conventions.md` for project structure, naming, commits
    - Create `.kiro/steering/docs-pattern.md` for MDX page template, frontmatter rules
    - Create `.kiro/steering/glossary.md` for glossary maintenance, Tooltip usage rules
    - Create `.kiro/steering/markdown-tables.md` for HTML table requirement with component imports
    - Create `.kiro/steering/astro-components.md` for available components, import paths, usage
    - All adapted for ECS Express Mode walkthrough context
    - _Requirements: 2.1_

- [x] 2. Checkpoint - Verify project scaffolding
  - Ensure all configuration files are valid and consistent, ask the user if questions arise.

- [x] 3. Create published content pages (Introduction, Overview, Prerequisites, ECS Express Mode)
  - [x] 3.1 Create Introduction (index.mdx) and Overview pages
    - Create `src/content/docs/index.mdx` — Introduction to the walkthrough, what the reader will learn, link to Source_Repo
    - Create `src/content/docs/overview.mdx` — High-level overview of ECS Express Mode and what the demo deploys
    - Both pages: no draft:true, title ≤80 chars, description ≤160 chars
    - Use Tooltip for first occurrence of glossary terms per h2 section
    - Use Aside components for callouts
    - _Requirements: 3.6, 8.2, 8.3, 8.5, 9.1_

  - [x] 3.2 Create Prerequisites page
    - Create `src/content/docs/prerequisites.mdx` — List Terraform ≥1.5, AWS CLI ≥2.0, required AWS permissions, Bedrock model access requirements (Marketplace agreement, regional availability)
    - No draft:true, proper frontmatter
    - Use Tooltip for glossary terms, Aside for important notes
    - _Requirements: 7.1, 9.1_

  - [x] 3.3 Create ECS Express Mode concepts page
    - Create `src/content/docs/ecs-express-mode/concepts.mdx`
    - Explain what Express Mode is, how it differs from standard ECS (no separate ALB/TG/listener resources)
    - Include comparison table (Express vs Classic ECS): inputs required, infrastructure wiring, typical user, subnet model, health checks, deployment strategy, scaling, protocol support — use HTML table
    - State supported workloads (REST/OpenAPI, stateless HTTPS) and unsupported (batch, gRPC, TCP/UDP, non-HTTP)
    - Explain single subnet list limitation
    - Include `![PLACEHOLDER: Express Mode create wizard in ECS console](placeholder)`
    - No draft:true
    - _Requirements: 4.1, 4.6, 4.7, 4.8, 9.1_

  - [x] 3.4 Create Express Gateway Service resource page
    - Create `src/content/docs/ecs-express-mode/express-gateway-service.mdx`
    - Show complete HCL for aws_ecs_express_gateway_service from Source_Repo
    - Separate subsections for primary_container, network_configuration, and scaling_target blocks
    - Code blocks with `title` attribute referencing source filename
    - No draft:true
    - _Requirements: 4.2, 4.5, 9.1_

  - [x] 3.5 Create Auto Scaling page
    - Create `src/content/docs/ecs-express-mode/auto-scaling.mdx`
    - Document scaling_target block: auto_scaling_metric, auto_scaling_target_value, min_task_count, max_task_count
    - HTML table with parameter, type, allowed values, Source_Repo value columns
    - Code blocks with title attribute
    - No draft:true
    - _Requirements: 4.3, 4.5, 9.1_

  - [x] 3.6 Create Health Checks page
    - Create `src/content/docs/ecs-express-mode/health-checks.mdx`
    - Explain ALB target group health checks via health_check_path
    - Aside (type: caution) noting no ECS container healthCheck support in Express Mode
    - Include `![PLACEHOLDER: EC2 Target Groups → Targets tab showing healthy status](placeholder)`
    - Include `![PLACEHOLDER: ECS Tasks tab showing Health status Unknown](placeholder)`
    - No draft:true
    - _Requirements: 4.4, 4.5, 9.1_

- [x] 4. Create draft content pages - IAM Roles section
  - [x] 4.1 Create IAM Roles overview page
    - Create `src/content/docs/iam-roles/overview.mdx` with draft:true
    - Explain three-role model with HTML table: role name, trusted principal, purpose
    - Use Tooltip for first occurrence of each role term per section
    - _Requirements: 5.1, 9.2_

  - [x] 4.2 Create Task Execution Role page
    - Create `src/content/docs/iam-roles/task-execution-role.mdx` with draft:true
    - Show HCL for role with AmazonECSTaskExecutionRolePolicy, ecs-tasks.amazonaws.com trust, aws:SourceAccount condition
    - Code block title referencing source filename
    - _Requirements: 5.2, 5.5, 9.2_

  - [x] 4.3 Create Infrastructure Role page
    - Create `src/content/docs/iam-roles/infrastructure-role.mdx` with draft:true
    - Show HCL for role with AmazonECSInfrastructureRoleforExpressGatewayServices, ecs.amazonaws.com trust, aws:SourceAccount condition
    - Code block title referencing source filename
    - _Requirements: 5.3, 5.5, 9.2_

  - [x] 4.4 Create Task Role (Bedrock) page
    - Create `src/content/docs/iam-roles/task-role-bedrock.mdx` with draft:true
    - Show Bedrock IAM policy with foundation-model/_ and inference-profile/_ ARN patterns
    - Explain why both ARN patterns are required
    - Code block title referencing source filename
    - _Requirements: 5.4, 5.5, 9.2_

- [x] 5. Create draft content pages - Networking section
  - [x] 5.1 Create VPC Layout page
    - Create `src/content/docs/networking/vpc-layout.mdx` with draft:true
    - Document VPC with DNS support/hostnames, IGW, two public subnets, route table with 0.0.0.0/0 route
    - Aside (type: caution) about single subnet list for ALB and tasks
    - HTML table showing subnet type behavior (public vs private subnet outcomes)
    - Include `![PLACEHOLDER: VPC console showing subnets and route table](placeholder)`
    - _Requirements: 6.1, 6.5, 6.6, 6.7, 6.8, 9.2_

  - [x] 5.2 Create Security Groups page
    - Create `src/content/docs/networking/security-groups.mdx` with draft:true
    - Explain web SG: full egress (0.0.0.0/0), ingress scoped to VPC CIDR on container port
    - HCL code blocks with title attribute
    - Explain why this config is required for Express Mode
    - _Requirements: 6.2, 6.5, 6.6, 9.2_

  - [x] 5.3 Create Public Subnets page
    - Create `src/content/docs/networking/public-subnets.mdx` with draft:true
    - Explain map_public_ip_on_launch and cidrsubnet allocation strategy
    - Include table showing subnet CIDR ranges
    - HCL code blocks with title attribute
    - _Requirements: 6.3, 6.5, 6.6, 9.2_

  - [x] 5.4 Create Ingress Configuration page
    - Create `src/content/docs/networking/ingress.mdx` with draft:true
    - Explain Express Mode public ALB provisioning
    - Document ingress_paths output: ALB DNS name, listener ARN, target group ARN
    - Include `![PLACEHOLDER: EC2 → Load Balancers showing Express-managed ALB](placeholder)`
    - _Requirements: 6.4, 6.5, 6.6, 9.2_

- [x] 6. Create draft content pages - Deployment and Teardown
  - [x] 6.1 Create Deployment Overview page
    - Create `src/content/docs/deployment/overview.mdx` with draft:true
    - High-level deployment flow overview
    - _Requirements: 9.2_

  - [x] 6.2 Create Terraform Apply page
    - Create `src/content/docs/deployment/terraform-apply.mdx` with draft:true
    - Show setting Terraform variables (region, naming prefix)
    - Steps: terraform init, terraform apply
    - Explain what Express Mode provisions during apply (ALB, target group, auto scaling, DNS)
    - _Requirements: 7.2, 9.2_

  - [x] 6.3 Create Verifying the Service page
    - Create `src/content/docs/deployment/verifying.mdx` with draft:true
    - Show terraform output to retrieve ALB endpoint, curl health endpoint for HTTP 200
    - Confirm tasks running via ECS console/CLI (desired count = running count)
    - Explain Application_URL vs raw ALB DNS name — instruct readers to use Application_URL
    - Note Health status "Unknown" is expected (no container healthCheck in Express API)
    - Include `![PLACEHOLDER: ECS service Resources tab with application URL, ALB, target groups](placeholder)`
    - Include `![PLACEHOLDER: EC2 Target Groups → Targets (healthy)](placeholder)`
    - _Requirements: 7.3, 7.6, 7.7, 9.2_

  - [x] 6.4 Create Web UI page
    - Create `src/content/docs/deployment/web-ui.mdx` with draft:true
    - Explain Swagger UI at /docs path
    - Describe Bedrock image analysis request/response flow and supported image input methods
    - Include `![PLACEHOLDER: Swagger UI at /docs endpoint](placeholder)`
    - _Requirements: 7.4, 9.2_

  - [x] 6.5 Create Teardown page
    - Create `src/content/docs/teardown.mdx` with draft:true
    - Document terraform destroy command
    - Verify resource removal: terraform state empty, no ECS services remain
    - _Requirements: 7.5, 9.2_

- [x] 7. Create draft content pages - Troubleshooting and Reference
  - [x] 7.1 Create Troubleshooting page
    - Create `src/content/docs/troubleshooting.mdx` with draft:true
    - Symptom-to-cause HTML table: spinning/rollback loops, 503 errors, private DNS, Health status Unknown, target group unhealthy, deployment rollback
    - Document deployment rollback flow (new tasks → ALB health fails → RollbackAlarm → rollback → repeats)
    - Debug order: (1) EC2 Target Groups health reason, (2) CloudWatch Logs, (3) ECS stopped task reason/exit code, (4) curl health endpoint
    - Common root causes: missing SG ingress, container exit on startup, wrong health_check_path, port mismatch
    - Explain Health status "Unknown" is normal/expected
    - Include `![PLACEHOLDER: ECS Timeline showing rollback events](placeholder)`
    - Include `![PLACEHOLDER: EC2 Target Groups → Targets (unhealthy) with reason](placeholder)`
    - Include `![PLACEHOLDER: CloudWatch Logs showing container startup error](placeholder)`
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 9.2_

  - [x] 7.2 Create "When to Use Express Mode" page
    - Create `src/content/docs/reference/when-to-use-express-mode.mdx` with draft:true
    - List supported scenarios (HTTPS web apps, APIs, rapid prototyping, developer self-service)
    - List unsupported scenarios (batch workers, gRPC, TCP/UDP, queue consumers, non-HTTP)
    - Protocol boundaries HTML table: REST/OpenAPI, WebSockets/SSE, gRPC, TCP/UDP, batch/workers, ARM/Graviton
    - _Requirements: 10.1, 10.6, 9.2_

  - [x] 7.3 Create Decision Checklist page
    - Create `src/content/docs/reference/decision-checklist.mdx` with draft:true
    - Comparison HTML table: Express vs Classic ECS across subnet model, custom domains, health checks, deployment strategy, container health, protocol support, ALB control
    - _Requirements: 10.2, 9.2_

  - [x] 7.4 Create Limitations page
    - Create `src/content/docs/reference/limitations.mdx` with draft:true
    - Document immutable-at-create fields (service_name, cluster, infrastructure_role_arn, deployment strategy, LB config)
    - Explain single subnet constraint with HTML table (public → internet-facing ALB, private → internal ALB, no split)
    - Document first Express service determines Shared_ALB type for VPC
    - Include `![PLACEHOLDER: ECS console Express Mode sidebar (create-only wizard)](placeholder)`
    - _Requirements: 10.3, 10.4, 10.5, 9.2_

- [x] 8. Checkpoint - Verify all content pages created
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Create validation script and test infrastructure
  - [x] 9.1 Set up Vitest configuration and test utilities
    - Create `vitest.config.ts` with TypeScript support and test directory paths
    - Create `tests/properties/` directory
    - Create test utilities for reading MDX files, parsing frontmatter, extracting code blocks
    - _Requirements: 1.1_

  - [x] 9.2 Create content validation script
    - Create `scripts/validate-content.ts` that checks: Tooltip terms exist in glossary, frontmatter length constraints, sidebar pages not draft, code blocks have language identifiers, pages with component imports don't use pipe tables
    - Wire into CI as a pre-build step
    - _Requirements: 1.7, 3.6, 8.1, 8.4, 9.4_

  - [x] 9.3 Write property test: Glossary completeness (Property 1)
    - **Property 1: Glossary completeness**
    - For any Tooltip usage across Published_Pages, the term prop must exist in glossary.ts with a non-empty definition
    - **Validates: Requirements 1.7**

  - [x] 9.4 Write property test: cspell coverage (Property 2)
    - **Property 2: cspell coverage of glossary terms**
    - For any term key in glossary.ts, derived words (split on underscores, lowercased) must appear in cspell.json words array
    - **Validates: Requirements 2.5**

  - [x] 9.5 Write property test: Frontmatter validity (Property 3)
    - **Property 3: Frontmatter validity**
    - For any MDX file in src/content/docs/, title ≤80 chars and description ≤160 chars, both non-empty
    - **Validates: Requirements 3.6**

  - [x] 9.6 Write property test: Code block source traceability (Property 4)
    - **Property 4: Code block source traceability**
    - For any code block representing content from a source file, must include title attribute referencing source filename
    - **Validates: Requirements 4.5, 5.5, 6.5**

  - [x] 9.7 Write property test: Code block language specification (Property 5)
    - **Property 5: Code block language specification**
    - For any fenced code block, opening fence must specify language (hcl, python, bash, json, yaml, text)
    - **Validates: Requirements 8.4**

  - [x] 9.8 Write property test: HTML tables with components (Property 6)
    - **Property 6: HTML tables when components are imported**
    - For any page importing custom components, all tables must use HTML table syntax (no pipe tables)
    - **Validates: Requirements 8.1**

  - [x] 9.9 Write property test: Tooltip first occurrence (Property 7)
    - **Property 7: Tooltip wrapping of first glossary term occurrence**
    - For any page and h2 section, first occurrence of each glossary term is wrapped in Tooltip
    - **Validates: Requirements 8.3**

  - [x] 9.10 Write property test: Blank line after tags (Property 8)
    - **Property 8: Blank line after component/HTML tags**
    - After every component/HTML closing tag, there must be at least one blank line before next content
    - **Validates: Requirements 8.5**

  - [x] 9.11 Write property test: Sidebar references published pages (Property 9)
    - **Property 9: Sidebar references only published pages**
    - For any slug in sidebar config, the corresponding MDX must not have draft:true
    - **Validates: Requirements 9.4**

- [x] 10. Final checkpoint - Verify build and all tests pass
  - Run `npm run build` to verify Astro builds successfully. Run `npm test` to confirm all property tests pass. Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Project scaffolding (tasks 1.1–1.6) should be adapted from reference repo `github.com/jajera/s3-vectors-rag-workload`, not built from scratch
- Content pages include `![PLACEHOLDER: description](placeholder)` for AWS console screenshots to be captured later
- HCL code examples are sourced from `terraform-aws-ecs-express-mode-demo` — code blocks must have `title` attributes referencing the source filename
- Published pages (no draft:true): index, overview, prerequisites, ecs-express-mode/\* — all others start as drafts
- Each task references specific requirements for traceability
- Property tests validate universal content invariants using Vitest + fast-check
- Checkpoints ensure incremental validation

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.4", "1.5", "1.6"] },
    { "id": 2, "tasks": ["3.1", "3.2", "3.3", "3.4", "3.5", "3.6"] },
    { "id": 3, "tasks": ["4.1", "4.2", "4.3", "4.4", "5.1", "5.2", "5.3", "5.4"] },
    { "id": 4, "tasks": ["6.1", "6.2", "6.3", "6.4", "6.5", "7.1", "7.2", "7.3", "7.4"] },
    { "id": 5, "tasks": ["9.1"] },
    { "id": 6, "tasks": ["9.2", "9.3", "9.4", "9.5", "9.6", "9.7", "9.8", "9.9", "9.10", "9.11"] }
  ]
}
```
