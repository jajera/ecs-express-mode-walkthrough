import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { getAllMdxFiles, extractCodeBlocks } from "./test-utils";

/**
 * Property 5: Code block language specification
 *
 * For any fenced code block in any Content_Page, the opening fence must specify
 * a language identifier (one of: hcl, python, bash, json, yaml, text).
 *
 * **Validates: Requirements 8.4**
 */
describe("Feature: ecs-express-mode-walkthrough, Property 5: Code block language specification", () => {
  const allFiles = getAllMdxFiles();
  const allowedLanguages = ["hcl", "python", "bash", "json", "yaml", "text"];

  // Collect all code blocks with their file context
  const allCodeBlocks = allFiles.flatMap((file) => {
    const blocks = extractCodeBlocks(file.body);
    return blocks.map((block) => ({
      file: file.relativePath,
      line: block.line,
      language: block.language,
      contentSnippet: block.content.slice(0, 80),
    }));
  });

  it("content pages contain at least one code block to validate", () => {
    expect(allCodeBlocks.length).toBeGreaterThan(0);
  });

  it("every fenced code block specifies a language identifier", () => {
    fc.assert(
      fc.property(fc.constantFrom(...allCodeBlocks), (block) => {
        expect(
          block.language,
          `Code block at ${block.file}:${block.line} is missing a language identifier`,
        ).not.toBeNull();
        expect(
          block.language!.length,
          `Code block at ${block.file}:${block.line} has an empty language identifier`,
        ).toBeGreaterThan(0);
      }),
      { numRuns: Math.max(100, allCodeBlocks.length) },
    );
  });

  it("every fenced code block uses an allowed language (hcl, python, bash, json, yaml, text)", () => {
    fc.assert(
      fc.property(fc.constantFrom(...allCodeBlocks), (block) => {
        expect(
          allowedLanguages,
          `Code block at ${block.file}:${block.line} uses language "${block.language}" which is not in the allowed set: ${allowedLanguages.join(", ")}`,
        ).toContain(block.language);
      }),
      { numRuns: Math.max(100, allCodeBlocks.length) },
    );
  });
});
