import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  getAllMdxFiles,
  splitByH2Sections,
  extractTooltipTerms,
} from "../tests/properties/test-utils";
import { glossary } from "../src/data/glossary";

const CONTENT_DIR = join(process.cwd(), "src/content/docs");
const allFiles = getAllMdxFiles();
const glossaryKeys = Object.keys(glossary);

function getPlainProseText(sectionContent: string): string {
  let text = sectionContent;
  text = text.replace(/^import\s+.*$/gm, "");
  text = text.replace(/```[\s\S]*?```/g, "");
  text = text.replace(/<Aside[\s\S]*?<\/Aside>/g, "");
  text = text.replace(/<table[\s\S]*?<\/table>/g, "");
  text = text.replace(
    /<Tooltip\s+term=["'][^"']+["']>([\s\S]*?)<\/Tooltip>/g,
    "$1",
  );
  text = text.replace(/<[^>]+>/g, "");
  return text;
}

interface Violation {
  file: string;
  path: string;
  heading: string;
  term: string;
  displayName: string;
}

// Find all violations
const violations: Violation[] = [];
for (const page of allFiles) {
  const pageTooltipTerms = new Set(extractTooltipTerms(page.body));
  const sections = splitByH2Sections(page.body);
  for (const section of sections) {
    const proseText = getPlainProseText(section.content);
    for (const term of glossaryKeys) {
      if (!pageTooltipTerms.has(term)) continue;
      const displayName = term.replace(/_/g, " ");
      const escaped = displayName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\b${escaped}\\b`, "i");
      if (regex.test(proseText)) {
        const tooltipTermsInSection = extractTooltipTerms(section.content);
        if (!tooltipTermsInSection.includes(term)) {
          violations.push({
            file: page.relativePath,
            path: page.path,
            heading: section.heading,
            term,
            displayName,
          });
        }
      }
    }
  }
}

// Group by file
const byFile = new Map<string, Violation[]>();
for (const v of violations) {
  const existing = byFile.get(v.path) || [];
  existing.push(v);
  byFile.set(v.path, existing);
}

// Fix each file
for (const [filePath, fileViolations] of byFile) {
  let content = readFileSync(filePath, "utf-8");

  for (const v of fileViolations) {
    // Find the section in the file and replace first plain occurrence of the term
    const sectionRegex = new RegExp(
      `(## ${v.heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?)(?=\\n## |$)`,
    );
    const sectionMatch = content.match(sectionRegex);
    if (!sectionMatch) continue;

    const section = sectionMatch[1];
    const displayName = v.displayName;

    // Find first plain-text occurrence (not already in a Tooltip, not in code block, not in HTML tag)
    // Simple approach: find the term as a word boundary, not preceded by term=" or >
    const termRegex = new RegExp(
      `(?<!term=["'])(?<!>)\\b(${displayName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})\\b(?!'s<\\/Tooltip)`,
      "i",
    );

    // Find it in lines that are not inside code blocks or HTML tags
    const lines = section.split("\n");
    let inCodeBlock = false;
    let fixed = false;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("```")) {
        inCodeBlock = !inCodeBlock;
        continue;
      }
      if (inCodeBlock) continue;
      // Skip lines that are inside Aside or table blocks (rough heuristic)
      if (lines[i].match(/^\s*<(Aside|table|thead|tbody|tr|td|th|\/)/))
        continue;
      // Skip lines with existing Tooltip for this term
      if (lines[i].includes(`term="${v.term}"`)) continue;

      const match = lines[i].match(termRegex);
      if (match) {
        lines[i] = lines[i].replace(
          termRegex,
          `<Tooltip term="${v.term}">${match[1]}</Tooltip>`,
        );
        fixed = true;
        break;
      }
    }

    if (fixed) {
      const newSection = lines.join("\n");
      content = content.replace(section, newSection);
    }
  }

  writeFileSync(filePath, content);
}

console.log(
  `Fixed ${violations.length} violations across ${byFile.size} files`,
);
