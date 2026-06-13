#!/usr/bin/env npx tsx
/**
 * Content validation script for CI pre-build checks.
 *
 * Validates:
 * 1. All Tooltip term props exist as keys in glossary.ts
 * 2. All MDX files have title ≤80 chars and description ≤160 chars (non-empty)
 * 3. All sidebar-referenced pages must not have draft:true
 * 4. All code blocks must have a language identifier
 * 5. Pages importing custom components must not use markdown pipe tables
 *
 * Usage: npx tsx scripts/validate-content.ts
 * Exit code 0 on success, non-zero on failure.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const CONTENT_DIR = join(ROOT, 'src/content/docs');
const GLOSSARY_PATH = join(ROOT, 'src/data/glossary.ts');
const ASTRO_CONFIG_PATH = join(ROOT, 'astro.config.mjs');

// ─── Utility functions ───────────────────────────────────────────────────────

interface MdxFile {
  path: string;
  relativePath: string;
  raw: string;
  frontmatter: Record<string, unknown>;
  body: string;
}

function parseFrontmatter(raw: string): { frontmatter: Record<string, unknown>; body: string } {
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

    if (
      typeof value === 'string' &&
      ((value.startsWith("'") && value.endsWith("'")) ||
        (value.startsWith('"') && value.endsWith('"')))
    ) {
      value = value.slice(1, -1);
    }

    if (value === 'true') value = true;
    if (value === 'false') value = false;

    frontmatter[key] = value;
  }

  return { frontmatter, body };
}

function getAllMdxFiles(): MdxFile[] {
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

function getGlossaryTerms(): string[] {
  const content = readFileSync(GLOSSARY_PATH, 'utf-8');
  const terms: string[] = [];
  const regex = /^\s*(\w+)\s*:/gm;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    const term = match[1];
    if (term !== 'export' && term !== 'const' && term !== 'glossary') {
      terms.push(term);
    }
  }

  return terms;
}

function extractTooltipTerms(content: string): { term: string; line: number }[] {
  const results: { term: string; line: number }[] = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const regex = /<Tooltip\s+term=["']([^"']+)["']/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(lines[i])) !== null) {
      results.push({ term: match[1], line: i + 1 });
    }
  }

  return results;
}

function extractCodeBlocks(body: string): { language: string | null; line: number }[] {
  const blocks: { language: string | null; line: number }[] = [];
  const lines = body.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const openMatch = lines[i].match(/^```(\w*)?/);
    if (openMatch && !lines[i].match(/^```\s*$/)) {
      // This is an opening fence (not a closing fence)
      const language = openMatch[1] || null;
      blocks.push({ language, line: i + 1 });
    }
  }

  return blocks;
}

function hasCustomComponentImports(body: string): boolean {
  const importRegex = /^import\s+.*from\s+['"]([^'"]+)['"]/gm;
  let match: RegExpExecArray | null;

  while ((match = importRegex.exec(body)) !== null) {
    if (!match[1].startsWith('@astrojs/starlight')) {
      return true;
    }
  }

  // Also check named imports
  const namedImportRegex = /^import\s*\{[^}]+\}\s*from\s*['"]([^'"]+)['"]/gm;
  while ((match = namedImportRegex.exec(body)) !== null) {
    if (!match[1].startsWith('@astrojs/starlight')) {
      return true;
    }
  }

  return false;
}

function findPipeTables(content: string): { line: number; text: string }[] {
  const tables: { line: number; text: string }[] = [];
  const lines = content.split('\n');

  for (let i = 1; i < lines.length; i++) {
    // A pipe table separator line looks like: | --- | --- | or |---|---|
    if (lines[i].match(/^\s*\|[\s\-:]+\|[\s\-:]*\|/) && i > 0) {
      // Check if previous line is a header row
      if (lines[i - 1].match(/^\s*\|.+\|/)) {
        tables.push({ line: i, text: lines[i - 1] });
      }
    }
  }

  return tables;
}

function getSidebarSlugs(): string[] {
  const content = readFileSync(ASTRO_CONFIG_PATH, 'utf-8');
  const slugs: string[] = [];
  const regex = /slug:\s*['"]([^'"]+)['"]/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    slugs.push(match[1]);
  }

  return slugs;
}

// ─── Validation checks ──────────────────────────────────────────────────────

interface ValidationError {
  file: string;
  line?: number;
  message: string;
}

function validateTooltipTerms(files: MdxFile[], glossaryTerms: string[]): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const file of files) {
    const tooltipTerms = extractTooltipTerms(file.raw);
    for (const { term, line } of tooltipTerms) {
      if (!glossaryTerms.includes(term)) {
        errors.push({
          file: file.relativePath,
          line,
          message: `Tooltip term "${term}" does not exist in glossary.ts`,
        });
      }
    }
  }

  return errors;
}

function validateFrontmatter(files: MdxFile[]): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const file of files) {
    const { title, description } = file.frontmatter;

    if (!title || typeof title !== 'string' || title.length === 0) {
      errors.push({
        file: file.relativePath,
        message: 'Frontmatter "title" is missing or empty',
      });
    } else if (title.length > 80) {
      errors.push({
        file: file.relativePath,
        message: `Frontmatter "title" exceeds 80 characters (${title.length} chars): "${title}"`,
      });
    }

    if (!description || typeof description !== 'string' || description.length === 0) {
      errors.push({
        file: file.relativePath,
        message: 'Frontmatter "description" is missing or empty',
      });
    } else if ((description as string).length > 160) {
      errors.push({
        file: file.relativePath,
        message: `Frontmatter "description" exceeds 160 characters (${(description as string).length} chars)`,
      });
    }
  }

  return errors;
}

function validateSidebarNotDraft(files: MdxFile[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const sidebarSlugs = getSidebarSlugs();

  for (const slug of sidebarSlugs) {
    // Convert slug to file path: "index" -> "index.mdx", "ecs-express-mode/concepts" -> "ecs-express-mode/concepts.mdx"
    const filePath = slug + '.mdx';
    const file = files.find((f) => f.relativePath === filePath);

    if (file && file.frontmatter.draft === true) {
      errors.push({
        file: file.relativePath,
        message: `Page is referenced in sidebar but has draft:true`,
      });
    }
  }

  return errors;
}

function validateCodeBlockLanguages(files: MdxFile[]): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const file of files) {
    const blocks = extractCodeBlocks(file.body);
    for (const block of blocks) {
      if (!block.language) {
        errors.push({
          file: file.relativePath,
          line: block.line,
          message: `Code block is missing a language identifier`,
        });
      }
    }
  }

  return errors;
}

function validateNoPipeTablesWithComponents(files: MdxFile[]): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const file of files) {
    if (hasCustomComponentImports(file.body)) {
      const pipeTables = findPipeTables(file.body);
      for (const table of pipeTables) {
        errors.push({
          file: file.relativePath,
          line: table.line,
          message: `Page imports custom components but uses a markdown pipe table (use HTML <table> instead)`,
        });
      }
    }
  }

  return errors;
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main(): void {
  console.log('Validating content...\n');

  const files = getAllMdxFiles();
  const glossaryTerms = getGlossaryTerms();

  const allErrors: ValidationError[] = [];

  // Check 1: Tooltip terms exist in glossary
  console.log('  ✓ Checking Tooltip terms exist in glossary...');
  allErrors.push(...validateTooltipTerms(files, glossaryTerms));

  // Check 2: Frontmatter length constraints
  console.log('  ✓ Checking frontmatter title/description constraints...');
  allErrors.push(...validateFrontmatter(files));

  // Check 3: Sidebar pages not draft
  console.log('  ✓ Checking sidebar-referenced pages are not draft...');
  allErrors.push(...validateSidebarNotDraft(files));

  // Check 4: Code blocks have language identifiers
  console.log('  ✓ Checking code blocks have language identifiers...');
  allErrors.push(...validateCodeBlockLanguages(files));

  // Check 5: Pages with component imports don't use pipe tables
  console.log('  ✓ Checking pages with component imports use HTML tables...');
  allErrors.push(...validateNoPipeTablesWithComponents(files));

  console.log('');

  if (allErrors.length === 0) {
    console.log('✅ All content validation checks passed!\n');
    process.exit(0);
  } else {
    console.log(`❌ Found ${allErrors.length} validation error(s):\n`);
    for (const error of allErrors) {
      const location = error.line ? `${error.file}:${error.line}` : error.file;
      console.log(`  ${location}: ${error.message}`);
    }
    console.log('');
    process.exit(1);
  }
}

main();
