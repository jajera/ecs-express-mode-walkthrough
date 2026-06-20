# Glossary Maintenance

## Source of Truth

The single source of truth for glossary terms is:

```text
src/data/glossary.ts
```

This file exports a `Record<string, string>` mapping term keys to definitions.

## Key Format

Term keys use **PascalCase_With_Underscores**:

```typescript
export const glossary: Record<string, string> = {
  Express_Gateway_Service: "...",
  Task_Execution_Role: "...",
  Shared_ALB: "...",
};
```

## Adding a New Term

1. **Add to `src/data/glossary.ts`** — add the key and a concise definition (1–2 sentences max)
2. **Update `.vscode/cspell.json`** — split the key on `_`, lowercase each word, add to the `words` array
   - Example: `Express_Gateway_Service` → add `"express"`, `"gateway"`, `"service"` (skip if already present)
3. **Use in content** — wrap the first occurrence per h2 section in a Tooltip component

## Tooltip Usage Rules

- **Import**: `import Tooltip from '../../components/Tooltip.astro';`
  - Adjust relative path depth based on page location (e.g., `../../../` for nested pages)
- **Wrap first occurrence only** per h2 section — do not wrap every mention
- **Term prop** must exactly match a key in `glossary.ts`
- **Slot content** is the human-readable display text

### Example

```mdx
import Tooltip from "../../components/Tooltip.astro";

## Concepts

The <Tooltip term="Express_Gateway_Service">Express Gateway Service</Tooltip> provisions an ALB automatically.

Express Gateway Service handles scaling for you. <!-- no Tooltip here, already wrapped above -->

## Auto Scaling

The <Tooltip term="Express_Gateway_Service">Express Gateway Service</Tooltip> supports target tracking.

<!-- New h2 section, so wrap first occurrence again -->
```

## Current Terms

ECS Express Mode: `Express_Gateway_Service`, `Shared_ALB`, `RollbackAlarm`, `Application_URL`
IAM: `Infrastructure_Role`, `Task_Execution_Role`, `Task_Role`
Bedrock: `Bedrock`, `Foundation_Model`, `Inference_Profile`
Networking: `VPC`, `Internet_Gateway`, `Public_Subnet`, `Security_Group`, `CIDR_Block`
