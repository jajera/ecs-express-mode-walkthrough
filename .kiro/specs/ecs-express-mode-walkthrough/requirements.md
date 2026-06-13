# Requirements Document

## Introduction

This document defines the requirements for an Astro Starlight documentation site that teaches AWS ECS Express Mode by example. ECS Express Mode is specifically designed for deploying stateless HTTP/HTTPS web applications and APIs — it automatically provisions an ALB with SSL/TLS, auto scaling, monitoring, networking, and a unique accessible URL. The site documents the terraform-aws-ecs-express-mode-demo project — a minimal ECS Express Gateway Service deployment that runs a Bedrock-powered container with auto scaling, managed ALB, and public HTTPS ingress. The walkthrough covers ECS Express Mode concepts, the Express Gateway Service resource, IAM roles, VPC networking, Bedrock integration, deployment, troubleshooting, Express Mode limitations, workload boundaries, and guidance on when to use classic ECS instead. Express Mode is not suitable for non-HTTP workloads such as batch jobs, worker services, or background processors.

The Astro Starlight project scaffolding (site config, theme, components, GitHub Actions, VSCode settings, Kiro steering files) is adapted from the reference repository github.com/jajera/s3-vectors-rag-workload. Only ECS-specific content, glossary terms, and console screenshots are new. Content pages include placeholder images for AWS console screenshots to be captured and replaced before publishing.

## Glossary

- **Starlight_Site**: The Astro Starlight documentation website deployed to GitHub Pages
- **Content_Page**: An MDX file in src/content/docs/ that becomes a page on the site
- **Published_Page**: A content page without draft:true that appears in production builds
- **Draft_Page**: A content page with draft:true that is visible in dev but excluded from builds
- **Tooltip_Component**: A custom Astro component that shows glossary definitions on hover
- **Glossary_File**: src/data/glossary.ts containing term definitions used by tooltips
- **Sidebar**: The navigation structure defined in astro.config.mjs
- **Source_Repo**: terraform-aws-ecs-express-mode-demo — the Terraform implementation this site documents
- **Express_Gateway_Service**: The aws_ecs_express_gateway_service Terraform resource that provisions an ECS service with managed ALB, auto scaling, and simplified configuration for HTTP/HTTPS web applications and APIs (not intended for non-HTTP workloads such as batch jobs or worker services)
- **Infrastructure_Role**: An IAM role assumed by ecs.amazonaws.com that grants ECS Express Mode permissions to provision ALB, networking, and auto scaling resources
- **Task_Execution_Role**: An IAM role assumed by ecs-tasks.amazonaws.com that grants ECS permissions to pull container images and write CloudWatch logs
- **Task_Role**: An IAM role assumed by ecs-tasks.amazonaws.com that grants the running container application-level permissions (Bedrock access in this project)
- **Application_URL**: The unique Express-provisioned HTTPS URL on `*.ecs.<region>.on.aws` used for all normal application traffic (not the raw ALB DNS name)
- **RollbackAlarm**: A CloudWatch metric alarm created by Express Mode that triggers automatic deployment rollback when new tasks fail ALB health checks
- **Shared_ALB**: The Application Load Balancer shared by up to 25 Express services in the same VPC using Host header routing rules

## Requirements

### Requirement 1: Site Infrastructure

**User Story:** As a developer, I want a working Astro Starlight site with GitHub Pages deployment, so that the ECS Express Mode documentation is publicly accessible.

#### Acceptance Criteria

1. THE Starlight_Site SHALL use Astro with @astrojs/starlight and starlight-theme-vintage
2. WHEN a push to the main branch occurs, THE Starlight_Site SHALL deploy to GitHub Pages via GitHub Actions
3. THE Starlight_Site SHALL use base path /ecs-express-mode-walkthrough and site `https://jajera.github.io`
4. THE Starlight_Site SHALL include unplugin-icons for mdi and simple-icons icon sets
5. THE Starlight_Site SHALL use Node 22 as specified in .nvmrc
6. WHEN a user hovers over a Tooltip_Component element, THE Starlight_Site SHALL display the corresponding term definition from the Glossary_File within 200 milliseconds
7. THE Starlight_Site SHALL include a Glossary_File containing definitions for terms from the following domains: ECS Express Mode resources, Bedrock services, IAM roles, and VPC networking, with a minimum of one definition per term referenced by Tooltip_Component across all Published_Pages
8. IF the GitHub Actions build fails, THEN THE Starlight_Site SHALL not update the deployed GitHub Pages content and the workflow SHALL report a failure status

### Requirement 2: Project Configuration

**User Story:** As a developer, I want consistent project tooling including Kiro steering, GitHub Actions, and VSCode settings, so that collaboration follows established patterns.

#### Acceptance Criteria

1. THE Starlight_Site SHALL include a .kiro/steering/ directory with project-conventions, docs-pattern, glossary, markdown-tables, and astro-components steering files
2. THE Starlight_Site SHALL include GitHub Actions workflows for Conventional Commits message conformance on pull requests (via commitmsg-conform), markdown linting on push and pull requests, and GitHub Pages deployment on push to main
3. THE Starlight_Site SHALL include .vscode/settings.json with Prettier as default formatter and format-on-save enabled
4. THE Starlight_Site SHALL include .vscode/extensions.json recommending astro-vscode, prettier, and code-spell-checker extensions
5. THE Starlight_Site SHALL include .vscode/cspell.json with a words list containing all terms defined in the Glossary_File and the project Glossary
6. THE Starlight_Site SHALL include .vscode/tasks.json with a dev task running the Astro dev server and a build task running the Astro production build

### Requirement 3: Content Structure

**User Story:** As a reader, I want a logical navigation structure that progresses from concepts to hands-on deployment, so that I can learn ECS Express Mode incrementally.

#### Acceptance Criteria

1. THE Sidebar SHALL organize pages into sections in the following order: Introduction, Overview, Prerequisites, ECS Express Mode, IAM Roles, Networking, Deployment, Teardown, Troubleshooting, Reference
2. THE ECS Express Mode section SHALL contain pages in the following order: concepts overview, Express Gateway Service resource, auto scaling, health checks
3. THE IAM Roles section SHALL contain pages in the following order: overview, Task Execution Role, Infrastructure Role, Task Role (Bedrock)
4. THE Networking section SHALL contain pages in the following order: VPC layout, security groups, public subnets, ingress configuration
5. THE Deployment section SHALL contain pages in the following order: overview, terraform apply, verifying the service, accessing the web UI
6. EACH Content_Page SHALL have frontmatter with a non-empty title (maximum 80 characters) and a non-empty description (maximum 160 characters)

### Requirement 4: ECS Express Mode Content

**User Story:** As a reader, I want comprehensive documentation of ECS Express Mode concepts and the Express Gateway Service resource, so that I understand what Express Mode provides and how to configure it.

#### Acceptance Criteria

1. THE ECS Express Mode concepts page SHALL explain what Express Mode is, how it differs from standard ECS services (no separate ALB, target group, or listener resources required), managed ALB provisioning, and simplified configuration
2. THE Express Gateway Service page SHALL show complete HCL for aws_ecs_express_gateway_service from the Source_Repo with explanations of primary_container, network_configuration, and scaling_target blocks, with each block documented in a separate subsection
3. THE auto scaling page SHALL document the scaling_target block including auto_scaling_metric, auto_scaling_target_value, min_task_count, and max_task_count parameters, with a table listing each parameter, its type, allowed values, and Source_Repo value
4. THE health checks page SHALL explain that Express Mode uses ALB target group health checks via health_check_path and does not support ECS container healthCheck, with an Aside component noting this limitation
5. ALL code examples SHALL be traceable to the Source_Repo by including a title attribute referencing the source filename
6. THE ECS Express Mode concepts page SHALL include a comparison table of Express Mode vs Classic ECS covering: inputs required, infrastructure wiring, typical user, subnet model, health checks, deployment strategy, scaling, and protocol support
7. THE ECS Express Mode concepts page SHALL clearly state supported workloads (REST/OpenAPI APIs, stateless HTTPS web apps) AND SHALL list unsupported workloads (batch/queue workers, gRPC, raw TCP/UDP, non-HTTP services) with guidance to use classic ECS for those
8. THE ECS Express Mode concepts page SHALL explain the single subnet list limitation: Express uses one subnet list for both ALB and tasks (no split of public ALB + private tasks like classic ECS supports)

### Requirement 5: IAM Roles Content

**User Story:** As a reader, I want detailed documentation of the three IAM roles required by ECS Express Mode, so that I understand least-privilege access patterns.

#### Acceptance Criteria

1. THE IAM overview page SHALL explain the three-role model: Task_Execution_Role, Infrastructure_Role, and Task_Role, with a table listing each role name, trusted principal, and purpose
2. THE Task Execution Role page SHALL show HCL for the role with AmazonECSTaskExecutionRolePolicy attachment and ecs-tasks.amazonaws.com trust with aws:SourceAccount condition, referencing the Source_Repo filename
3. THE Infrastructure Role page SHALL show HCL for the role with AmazonECSInfrastructureRoleforExpressGatewayServices attachment and ecs.amazonaws.com trust with aws:SourceAccount condition, referencing the Source_Repo filename
4. THE Task Role page SHALL show the Bedrock IAM policy supporting both foundation model ARNs (arn:aws:bedrock:*::foundation-model/*) and inference profile ARNs (arn:aws:bedrock:*:*:inference-profile/*) with an explanation of why both are required
5. ALL IAM documentation SHALL reference actual Terraform from the Source_Repo with code block title attributes set to the source filename

### Requirement 6: Networking Content

**User Story:** As a reader, I want to understand the VPC and security group configuration required for public Express Mode services, so that I can adapt the networking to my environment.

#### Acceptance Criteria

1. THE VPC layout page SHALL document the VPC with enable_dns_support, enable_dns_hostnames, internet gateway, two public subnets across availability zones, and route table with a 0.0.0.0/0 route to the internet gateway
2. THE security groups page SHALL explain the web security group with full egress (0.0.0.0/0) and ingress scoped to the VPC CIDR block on the container port as defined in the Source_Repo task definition
3. THE public subnets page SHALL explain map_public_ip_on_launch requirement and cidrsubnet allocation strategy with a diagram or table showing subnet CIDR ranges
4. THE ingress page SHALL explain how Express Mode provisions a public ALB endpoint and the ingress_paths output containing ALB DNS name, listener ARN, and target group ARN
5. ALL networking documentation SHALL include all HCL resources from the Source_Repo relevant to that page's topic, with code block title attributes referencing the source filename
6. EACH networking page SHALL explain why the configuration is required for Express Mode to function, enabling readers to adapt the networking to their environment
7. THE VPC layout page SHALL include an Aside (type: caution) explaining that Express Mode uses a single subnet list for ALB and tasks, and that the public-ALB + private-tasks pattern requires classic ECS instead
8. THE VPC layout page SHALL include a table showing subnet type behavior: public subnets (route to IGW) produce an internet-facing ALB with access_type PUBLIC reachable from the internet; private subnets (no IGW route) produce an internal ALB with access_type PRIVATE reachable only within the VPC

### Requirement 7: Deployment Content

**User Story:** As a reader, I want step-by-step deployment instructions, so that I can run the ECS Express Mode demo myself.

#### Acceptance Criteria

1. THE prerequisites page SHALL list required tools (Terraform >= 1.5, AWS CLI >= 2.0), AWS permissions sufficient to create ECS, VPC, IAM, and ALB resources, and Bedrock model access requirements: the user's account must have model access enabled (Anthropic first-time use / Marketplace agreement completed) AND the deployment region must be one where the chosen Bedrock model is available
2. THE terraform apply page SHALL show how to set required Terraform variables (AWS region, naming prefix), run terraform init, run terraform apply, and explain what Express Mode provisions during apply (ALB, target group, auto scaling, DNS)
3. THE verifying page SHALL show how to retrieve the ALB endpoint using terraform output, curl the health endpoint and expect an HTTP 200 response, and confirm tasks are running via the ECS console or AWS CLI describe-services showing desired count equals running count
4. THE web UI page SHALL explain accessing the Swagger UI at the ALB endpoint /docs path and describe the Bedrock image analysis request and response flow including supported image input methods
5. THE teardown page SHALL document running terraform destroy and verifying resource removal by confirming terraform state is empty and no ECS services remain in the cluster via AWS CLI or console
6. THE verifying page SHALL explain the difference between the Application_URL (`*.ecs.<region>.on.aws`) and the raw ALB DNS name, and SHALL instruct readers to use the Application_URL for all application access
7. THE verifying page SHALL note that ECS Tasks tab "Health status: Unknown" is EXPECTED for Express Mode services (no container healthCheck in Express API) and that operational health is determined by ALB target group state

### Requirement 8: MDX and Component Standards

**User Story:** As a maintainer, I want consistent page formatting and component usage, so that the site is maintainable.

#### Acceptance Criteria

1. IF a Content_Page imports custom components, THEN THE Content_Page SHALL use HTML tables instead of markdown pipe tables for all tabular data on that page
2. ALL Content_Pages SHALL use Aside components (type: note, tip, caution, or danger) for callout content rather than plain text or blockquotes
3. ALL Content_Pages SHALL wrap the first occurrence of each glossary term within each h2-headed section in a Tooltip_Component
4. ALL code blocks SHALL specify a language identifier (one of: hcl, python, bash, json, yaml, text) AND SHALL include a title attribute set to the source filename when the block represents content from a specific file
5. ALL Content_Pages SHALL leave one blank line after every component or HTML closing tag before the next content line
6. IF a code block does not represent a specific file, THEN THE code block SHALL omit the title attribute

### Requirement 9: Publishing Workflow

**User Story:** As a maintainer, I want a clear draft-to-publish workflow, so that incomplete pages do not appear in production.

#### Acceptance Criteria

1. THE Introduction, Overview, Prerequisites, and ECS Express Mode section pages SHALL be published (frontmatter SHALL NOT contain draft:true)
2. THE IAM Roles, Networking, Deployment, Teardown, Troubleshooting, and Reference section pages SHALL contain draft:true in frontmatter until all code examples are verified against the Source_Repo and all required Tooltip_Component references are present
3. WHEN a Draft_Page is ready to publish, THE maintainer SHALL remove draft:true from frontmatter AND add the page slug to the Sidebar in astro.config.mjs
4. THE Sidebar in astro.config.mjs SHALL only reference Published_Pages
5. IF a page slug is listed in the Sidebar but the corresponding Content_Page contains draft:true, THEN THE Starlight_Site production build SHALL exclude that page from rendered output

### Requirement 10: Workload Boundaries and Limitations Content

**User Story:** As a reader, I want to understand Express Mode's limitations and workload boundaries, so that I choose the right deployment model for my application.

#### Acceptance Criteria

1. THE walkthrough SHALL include a dedicated "When to use Express Mode" page that lists supported scenarios (HTTPS web apps, APIs, rapid prototyping, developer self-service) AND unsupported scenarios (batch workers, gRPC, TCP/UDP, queue consumers, non-HTTP services)
2. THE walkthrough SHALL include a decision checklist page with a comparison table: Express vs Classic ECS across dimensions including subnet model, custom domains, health checks, deployment strategy, container health, protocol support, and ALB control
3. THE limitations page SHALL document immutable-at-create fields (service_name, cluster, infrastructure_role_arn, deployment strategy, load balancer config) that require service replacement to change
4. THE limitations page SHALL explain the single subnet constraint with a table: public subnets result in an internet-facing ALB accessible from the public internet with tasks assigned public IPs; private subnets result in an internal ALB accessible only within the VPC (not reachable from the internet even though tasks may be running); there is no ALB-in-public plus tasks-in-private split
5. THE limitations page SHALL document that the first Express service in a VPC determines whether the Shared_ALB is internet-facing or internal, affecting all subsequent Express services in that VPC
6. THE walkthrough SHALL include a protocol boundaries table showing: REST/OpenAPI (primary fit), WebSockets/SSE (possible with caveats), gRPC (limited on ALB), TCP/UDP (not supported), batch/workers (wrong tool), and ARM/Graviton (defaults X86_64)

### Requirement 11: Troubleshooting Content

**User Story:** As a reader, I want troubleshooting guidance for common Express Mode failures, so that I can diagnose and fix deployment issues quickly.

#### Acceptance Criteria

1. THE troubleshooting page SHALL include a symptom-to-cause table covering: service spinning/rollback loops, 503 errors, private DNS resolution, Health status Unknown, target group unhealthy, and deployment rollback
2. THE troubleshooting page SHALL document the deployment rollback flow: new tasks start, ALB health checks fail, RollbackAlarm fires, Express rolls back, cycle repeats until root cause is fixed
3. THE troubleshooting page SHALL provide a debug order for failed deployments: (1) EC2 Target Groups health reason, (2) CloudWatch Logs for startup errors, (3) ECS stopped task reason/exit code, (4) curl the health endpoint
4. THE troubleshooting page SHALL list common root causes for health check failures: task SG missing ingress on container port, container exits on startup, wrong health_check_path, port mismatch between container_port and app listen port
5. THE troubleshooting page SHALL explain that Express Mode Health status "Unknown" on the Tasks tab is normal and expected because Express does not define container-level healthCheck in the task definition
