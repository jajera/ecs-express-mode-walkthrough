import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { getAllMdxFiles } from "./test-utils";

/**
 * Property 8: Blank line after component/HTML tags
 *
 * After every block-level component/HTML closing tag (</Aside>, </table>),
 * there must be at least one blank line before the next content line.
 *
 * NOTE: Closing tags within tables (</tr>, </td>, </th>) are internal structure
 * and don't need blank lines. Inline Tooltip usage within paragraphs doesn't
 * need blank lines either.
 *
 * **Validates: Requirements 8.5**
 */
describe("Feature: ecs-express-mode-walkthrough, Property 8: Blank line after component/HTML tags", () => {
  const BLOCK_CLOSING_TAGS = ["</Aside>", "</table>"];

  interface ClosingTagOccurrence {
    file: string;
    lineNumber: number;
    line: string;
    tag: string;
  }

  // Collect all block-level closing tag occurrences from MDX files
  const allFiles = getAllMdxFiles();
  const occurrences: ClosingTagOccurrence[] = [];

  for (const file of allFiles) {
    const lines = file.body.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      for (const tag of BLOCK_CLOSING_TAGS) {
        if (trimmed.endsWith(tag)) {
          occurrences.push({
            file: file.relativePath,
            lineNumber: i + 1,
            line: lines[i],
            tag,
          });
        }
      }
    }
  }

  it("MDX files contain at least one block-level closing tag to validate", () => {
    expect(occurrences.length).toBeGreaterThan(0);
  });

  it("after every block-level closing tag, there is a blank line before next content", () => {
    fc.assert(
      fc.property(fc.constantFrom(...occurrences), (occurrence) => {
        const file = allFiles.find((f) => f.relativePath === occurrence.file)!;
        const lines = file.body.split("\n");
        const closingLineIndex = occurrence.lineNumber - 1;

        // Find the next non-empty line after the closing tag
        let nextNonEmptyIndex = -1;
        for (let i = closingLineIndex + 1; i < lines.length; i++) {
          if (lines[i].trim() !== "") {
            nextNonEmptyIndex = i;
            break;
          }
        }

        // If there is no next non-empty line (EOF), the property holds
        if (nextNonEmptyIndex === -1) {
          return;
        }

        // There must be at least one blank line between the closing tag and the next content
        const linesBetween = nextNonEmptyIndex - closingLineIndex - 1;
        expect(
          linesBetween,
          `In ${occurrence.file} at line ${occurrence.lineNumber}: ` +
            `"${occurrence.tag}" must be followed by a blank line before next content ` +
            `(line ${nextNonEmptyIndex + 1}: "${lines[nextNonEmptyIndex].trim()}")`,
        ).toBeGreaterThanOrEqual(1);
      }),
      { numRuns: Math.max(100, occurrences.length) },
    );
  });
});
