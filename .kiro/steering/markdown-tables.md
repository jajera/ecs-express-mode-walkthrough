# Markdown Tables — HTML Requirement

## Rule

When a page imports **any custom component** (such as `Tooltip`), ALL tables on that page **must** use HTML table syntax.

Do **NOT** use markdown pipe tables (`|`) on pages with component imports.

## Why

Astro/MDX can produce unexpected rendering when mixing markdown pipe tables with imported components on the same page. Using HTML tables ensures consistent behavior.

## HTML Table Pattern

```html
<table>
  <thead>
    <tr>
      <th>Column A</th>
      <th>Column B</th>
      <th>Column C</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Value 1</td>
      <td>Value 2</td>
      <td>Value 3</td>
    </tr>
    <tr>
      <td>Value 4</td>
      <td>Value 5</td>
      <td>Value 6</td>
    </tr>
  </tbody>
</table>
```

## Rules

1. Use `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` elements
2. Always include `<thead>` with header row
3. Leave **one blank line** after the closing `</table>` tag before the next content
4. You may use inline MDX inside table cells (e.g., `<code>`, `<Tooltip>`)
5. Pages that do NOT import custom components may use markdown pipe tables

## Quick Check

Before writing a table, check the page imports:

- Has `import Tooltip from ...` or any other custom component? → **HTML table**
- Only uses `import { Aside } from '@astrojs/starlight/components'`? → Aside is a Starlight built-in, but since it's still an import, use **HTML table** to be safe
- No imports at all? → markdown pipe table is fine
