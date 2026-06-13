import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const CONTENT_DIR = join(process.cwd(), 'src/content/docs');

/**
 * Represents a parsed MDX file with frontmatter and content.
 */
export interface MdxFile {
  /** Absolute path to the file */
  path: string;
  /** Path relative to src/content/docs/ */
  relativePath: string;
  /** Raw file content */
  raw: string;
  /** Parsed frontmatter fields */
  frontmatter: Record<string, unknown>;
  /** Content body (everything after the frontmatter block) */
  body: string;
}

/**
 * Represents a fenced code block extracted from MDX content.
 */
export interface CodeBlock {
  /** Language identifier (e.g., 'hcl', 'bash', 'json') */
  language: string | null;
  /** Title attribute value if present */
  title: string | null;
  /** The code content inside the fences */
  content: string;
  /** Line number (1-indexed) where the opening fence appears */
  line: number;
}

/**
 * Represents an h2 section within an MDX file.
 */
export interface H2Section {
  /** The heading text */
  heading: string;
  /** The content of the section (from after heading to next h2 or EOF) */
  content: string;
  /** Line number (1-indexed) where the heading appears */
  line: number;
}

/**
 * Recursively reads all MDX files from src/content/docs/.
 */
export function getAllMdxFiles(): MdxFile[] {
  const files: MdxFile[] = [];

  function walk(dir: string): void {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name.endsWith('.mdx')) {
        const raw = readFileSync(fullPath, 'utf-8');
        const { frontmatter, body } = parseFrontmatter(raw);
        files.push({
          path: fullPath,
          relativePath: relative(CONTENT_DIR, fullPath),
          raw,
          frontmatter,
          body,
        });
      }
    }
  }

  walk(CONTENT_DIR);
  return files;
}

/**
 * Parses YAML frontmatter from an MDX file's raw content.
 * Returns the frontmatter as a key-value record and the body after the frontmatter.
 */
export function parseFrontmatter(raw: string): {
  frontmatter: Record<string, unknown>;
  body: string;
} {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, body: raw };
  }

  const [, yamlBlock, body] = match;
  const frontmatter: Record<string, unknown> = {};

  for (const line of yamlBlock.split('\n')) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    const key = line.slice(0, colonIndex).trim();
    let value: unknown = line.slice(colonIndex + 1).trim();

    // Strip surrounding quotes
    if (
      typeof value === 'string' &&
      ((value.startsWith("'") && value.endsWith("'")) ||
        (value.startsWith('"') && value.endsWith('"')))
    ) {
      value = value.slice(1, -1);
    }

    // Parse booleans
    if (value === 'true') value = true;
    if (value === 'false') value = false;

    frontmatter[key] = value;
  }

  return { frontmatter, body };
}

/**
 * Extracts all fenced code blocks from MDX content body.
 * Returns language, title attribute, content, and line number for each block.
 */
export function extractCodeBlocks(body: string): CodeBlock[] {
  const blocks: CodeBlock[] = [];
  const lines = body.split('\n');
  let i = 0;

  while (i < lines.length) {
    const openMatch = lines[i].match(/^```(\w*)?(?:\s+(.*))?$/);
    if (openMatch) {
      const language = openMatch[1] || null;
      const attrs = openMatch[2] || '';
      const title = extractTitleAttr(attrs);
      const lineNumber = i + 1;
      const contentLines: string[] = [];
      i++;

      while (i < lines.length && !lines[i].match(/^```\s*$/)) {
        contentLines.push(lines[i]);
        i++;
      }

      blocks.push({
        language,
        title,
        content: contentLines.join('\n'),
        line: lineNumber,
      });
    }
    i++;
  }

  return blocks;
}

/**
 * Extracts the title attribute value from a code fence's attribute string.
 * Supports: title="value", title='value', title=value
 */
function extractTitleAttr(attrs: string): string | null {
  const match = attrs.match(/title=["']([^"']+)["']|title=(\S+)/);
  if (match) {
    return match[1] || match[2] || null;
  }
  return null;
}

/**
 * Detects import statements in MDX content body.
 * Returns an array of import source paths/packages.
 */
export function detectImports(body: string): string[] {
  const imports: string[] = [];
  const importRegex = /^import\s+.*from\s+['"]([^'"]+)['"]/gm;
  let match: RegExpExecArray | null;

  while ((match = importRegex.exec(body)) !== null) {
    imports.push(match[1]);
  }

  // Also match: import { X } from 'y';
  const namedImportRegex = /^import\s*\{[^}]+\}\s*from\s*['"]([^'"]+)['"]/gm;
  while ((match = namedImportRegex.exec(body)) !== null) {
    if (!imports.includes(match[1])) {
      imports.push(match[1]);
    }
  }

  return imports;
}

/**
 * Checks if a page imports custom components (non-Starlight).
 * Custom components are any imports that are NOT from '@astrojs/starlight/components'.
 */
export function hasCustomComponentImports(body: string): boolean {
  const imports = detectImports(body);
  return imports.some((src) => !src.startsWith('@astrojs/starlight'));
}

/**
 * Extracts all Tooltip term prop values from MDX content.
 * Matches: <Tooltip term="TermName">...</Tooltip>
 */
export function extractTooltipTerms(content: string): string[] {
  const terms: string[] = [];
  const regex = /<Tooltip\s+term=["']([^"']+)["']/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    terms.push(match[1]);
  }

  return terms;
}

/**
 * Finds all markdown pipe tables in content.
 * A pipe table is detected by lines matching the pattern: | ... | ... |
 * with a separator line containing dashes (| --- | --- |).
 */
export function findPipeTables(content: string): { line: number; text: string }[] {
  const tables: { line: number; text: string }[] = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length - 1; i++) {
    // A pipe table separator line looks like: | --- | --- | or |---|---|
    if (lines[i].match(/^\s*\|[\s-:]+\|[\s-:]*/) && i > 0) {
      // Check if previous line is a header row
      if (lines[i - 1].match(/^\s*\|.+\|/)) {
        tables.push({ line: i, text: lines[i - 1] });
      }
    }
  }

  return tables;
}

/**
 * Splits MDX content body into h2-headed sections.
 * Returns sections with heading text, content, and line number.
 */
export function splitByH2Sections(body: string): H2Section[] {
  const sections: H2Section[] = [];
  const lines = body.split('\n');
  let currentHeading: string | null = null;
  let currentContent: string[] = [];
  let currentLine = 0;

  for (let i = 0; i < lines.length; i++) {
    const h2Match = lines[i].match(/^## (.+)$/);
    if (h2Match) {
      // Save previous section
      if (currentHeading !== null) {
        sections.push({
          heading: currentHeading,
          content: currentContent.join('\n'),
          line: currentLine,
        });
      }
      currentHeading = h2Match[1];
      currentContent = [];
      currentLine = i + 1;
    } else if (currentHeading !== null) {
      currentContent.push(lines[i]);
    }
  }

  // Save last section
  if (currentHeading !== null) {
    sections.push({
      heading: currentHeading,
      content: currentContent.join('\n'),
      line: currentLine,
    });
  }

  return sections;
}
