# Astro Components Reference

## Available Components

### Tooltip

**Import path**: relative to the page location

```mdx
<!-- From src/content/docs/*.mdx (top-level pages) -->

import Tooltip from "../../components/Tooltip.astro";

<!-- From src/content/docs/section/*.mdx (one level nested) -->

import Tooltip from "../../../components/Tooltip.astro";
```

**Props**:

- `term` (string, required) — must match a key in `src/data/glossary.ts`

**Slot**: the visible display text (wraps inline content)

**Usage**:

```mdx
<Tooltip term="Express_Gateway_Service">Express Gateway Service</Tooltip>
```

**Behavior**: shows glossary definition on hover/focus, accessible via keyboard (tabindex="0", aria-describedby).

---

### Aside (Starlight built-in)

**Import path**: always the same regardless of page depth

```mdx
import { Aside } from "@astrojs/starlight/components";
```

**Props**:

- `type` (string, required) — one of: `note`, `tip`, `caution`, `danger`

**Slot**: the callout content (supports markdown inside)

**Usage**:

```mdx
<Aside type="note">This is important information the reader should know.</Aside>

<Aside type="tip">A helpful suggestion for the reader.</Aside>

<Aside type="caution">Something the reader should be careful about.</Aside>

<Aside type="danger">
  A critical warning — incorrect action may cause problems.
</Aside>
```

---

## Import Path Patterns

The Tooltip component path is relative. Determine depth from the page location:

| Page location                        | Tooltip import path                    |
| ------------------------------------ | -------------------------------------- |
| `src/content/docs/*.mdx`             | `../../components/Tooltip.astro`       |
| `src/content/docs/section/*.mdx`     | `../../../components/Tooltip.astro`    |
| `src/content/docs/section/sub/*.mdx` | `../../../../components/Tooltip.astro` |

Aside always uses the package import (`@astrojs/starlight/components`) — no relative path needed.

## Spacing Rules

Always leave **one blank line** after a component's closing tag before the next content:

```mdx
<Aside type="note">Content here.</Aside>

Next paragraph starts here.
```

```mdx
<Tooltip term="VPC">VPC</Tooltip> is inline — no blank line needed after inline
components.
```

The blank-line rule applies to **block-level** component usage (Aside, HTML tables) — not inline Tooltip usage within a paragraph.
