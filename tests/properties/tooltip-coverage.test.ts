import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  getAllMdxFiles,
  splitByH2Sections,
  extractTooltipTerms,
} from "./test-utils";
import { glossary } from "../../src/data/glossary";

/**
 * Property 7: Tooltip wrapping of first glossary term occurrence
 *
 * For any Content_Page and any h2-headed section within it, if a glossary term
 * has a Tooltip somewhere on the page AND the term's display name appears in
 * that section's prose text, then the section must contain at least one Tooltip
 * with that term.
 *
 * This is the relaxed form: we only validate terms that the page already uses
 * as Tooltips. If a page never tooltips a term, we don't flag sections that
 * mention it in plain text.
 *
 * **Validates: Requirements 8.3**
 */
describe("Feature: ecs-express-mode-walkthrough, Property 7: Tooltip wrapping of first glossary term occurrence", () => {
  const allFiles = getAllMdxFiles();
  const publishedPages = allFiles.filter((f) => f.frontmatter.draft !== true);

  const glossaryKeys = Object.keys(glossary);

  /**
   * Strips component/HTML tag content to get plain prose text for term detection.
   * Removes content inside <Aside>...</Aside>, <table>...</table> blocks,
   * code fences, import lines, and Tooltip wrapper markup (keeping slot text).
   */
  function getPlainProseText(sectionContent: string): string {
    let text = sectionContent;

    // Remove import lines
    text = text.replace(/^import\s+.*$/gm, "");

    // Remove fenced code blocks
    text = text.replace(/```[\s\S]*?```/g, "");

    // Remove Aside blocks (multiline)
    text = text.replace(/<Aside[\s\S]*?<\/Aside>/g, "");

    // Remove table blocks (multiline)
    text = text.replace(/<table[\s\S]*?<\/table>/g, "");

    // Remove Tooltip wrappers but keep the slot text
    // e.g. <Tooltip term="X">display text</Tooltip> -> display text
    text = text.replace(
      /<Tooltip\s+term=["'][^"']+["']>([\s\S]*?)<\/Tooltip>/g,
      "$1",
    );

    // Remove any remaining HTML/component tags
    text = text.replace(/<[^>]+>/g, "");

    return text;
  }

  /**
   * Checks if a glossary term's display name appears as a standalone term
   * (word boundaries) in the given text.
   */
  function termAppearsStandalone(text: string, displayName: string): boolean {
    const escaped = displayName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    return regex.test(text);
  }

  // Build page+section combinations where:
  // 1. The page uses a Tooltip for the term somewhere (on the whole page body)
  // 2. The term's display name appears in the section's prose text
  // => The section should have a Tooltip for that term
  interface PageSectionTerm {
    relativePath: string;
    heading: string;
    term: string;
    displayName: string;
  }

  const pageSectionTerms: PageSectionTerm[] = [];

  for (const page of publishedPages) {
    // Get all tooltip terms used anywhere on this page
    const pageTooltipTerms = new Set(extractTooltipTerms(page.body));

    const sections = splitByH2Sections(page.body);
    for (const section of sections) {
      const proseText = getPlainProseText(section.content);

      // Only check terms that are already tooltipped somewhere on the page
      for (const term of glossaryKeys) {
        if (!pageTooltipTerms.has(term)) continue;

        const displayName = term.replace(/_/g, " ");

        if (termAppearsStandalone(proseText, displayName)) {
          pageSectionTerms.push({
            relativePath: page.relativePath,
            heading: section.heading,
            term,
            displayName,
          });
        }
      }
    }
  }

  it("there are page+section+term combinations to validate", () => {
    expect(pageSectionTerms.length).toBeGreaterThan(0);
  });

  it("if a Tooltip term is used on a page and its display name appears in an h2 section, a Tooltip exists in that section", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...pageSectionTerms),
        ({ relativePath, heading, term, displayName }) => {
          const page = publishedPages.find(
            (p) => p.relativePath === relativePath,
          )!;
          const sections = splitByH2Sections(page.body);
          const section = sections.find((s) => s.heading === heading)!;

          const tooltipTermsInSection = extractTooltipTerms(section.content);

          expect(
            tooltipTermsInSection.includes(term),
            `Expected Tooltip with term="${term}" (display: "${displayName}") in section "${heading}" of ${relativePath}`,
          ).toBe(true);
        },
      ),
      { numRuns: Math.max(100, pageSectionTerms.length) },
    );
  });
});
