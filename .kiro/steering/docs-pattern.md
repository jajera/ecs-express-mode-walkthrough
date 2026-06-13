# MDX Page Template and Documentation Pattern

## Frontmatter Rules

Every MDX page in `src/content/docs/` must have:

```yaml
---
title: "Page Title"          # Required, max 80 characters
description: "Description"   # Required, max 160 characters
draft: true                  # Optional — remove when ready to publish
---
```

- `title`: concise, max **80 characters**
- `description`: for SEO/metadata, max **160 characters**
- `draft: true`: excludes from production build; remove to publish

## Page Template

```mdx
---
title: "Express Gateway Service"
description: "Complete HCL reference for the aws_ecs_express_gateway_service resource with block-by-block explanations."
---

import { Aside } from '@astrojs/starlight/components';
import Tooltip from '../../components/Tooltip.astro';

## Section Heading

Introductory text with <Tooltip term="Express_Gateway_Service">Express Gateway Service</Tooltip> on first occurrence.

<Aside type="note">
Important information or context for the reader.
</Aside>

```hcl title="main.tf"
resource "aws_ecs_express_gateway_service" "this" {
  # ...
}
```

## Structure Rules

1. **Imports** go immediately after frontmatter (before any content)
2. **Section headings** use `##` (h2) — these define Tooltip reset boundaries
3. **First occurrence** of each glossary term in each h2 section gets a Tooltip wrapper
4. **Code blocks** always specify a language identifier (`hcl`, `bash`, `json`, `yaml`, `python`, `text`)
5. **Code blocks** from source files include a `title` attribute: ````hcl title="main.tf"```
6. **Code blocks** that are not from a specific file omit the `title` attribute
7. **One blank line** after every component closing tag or HTML closing tag
8. **Aside components** for all callouts (never use `>` blockquotes)
9. **HTML tables** (not markdown pipe tables) when the page imports custom components

## Console Screenshot Placeholders

Use this format for screenshots to be captured later:

```mdx
![PLACEHOLDER: description of screenshot needed](placeholder)
```

These are replaced with actual PNG captures before publishing.
