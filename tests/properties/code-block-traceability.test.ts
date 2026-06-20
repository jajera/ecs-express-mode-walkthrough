import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { getAllMdxFiles, extractCodeBlocks } from "./test-utils";

/**
 * Property 4: Code block source traceability
 *
 * For any fenced code block in any Content_Page that represents content from
 * a specific source file, the code block must include a `title` attribute
 * referencing the source filename.
 *
 * HCL code blocks are considered to represent content from the Source_Repo
 * (terraform-aws-ecs-express-mode-demo) and therefore must have a title attribute
 * (e.g., title="main.tf" or title="outputs.tf").
 *
 * **Validates: Requirements 4.5, 5.5, 6.5**
 */
describe("Feature: ecs-express-mode-walkthrough, Property 4: Code block source traceability", () => {
  const allFiles = getAllMdxFiles();

  // Collect all HCL code blocks with their file context
  const hclBlocks = allFiles.flatMap((file) => {
    const blocks = extractCodeBlocks(file.body);
    return blocks
      .filter((block) => block.language === "hcl")
      .map((block) => ({
        file: file.relativePath,
        line: block.line,
        title: block.title,
        contentSnippet: block.content.slice(0, 80),
      }));
  });

  it("content pages contain at least one HCL code block to validate", () => {
    expect(hclBlocks.length).toBeGreaterThan(0);
  });

  it("every HCL code block has a title attribute referencing the source filename", () => {
    fc.assert(
      fc.property(fc.constantFrom(...hclBlocks), (block) => {
        // HCL blocks represent Terraform source files and must have a title
        expect(block.title).not.toBeNull();
        // Title should be a non-empty string (e.g., "main.tf", "outputs.tf")
        expect(typeof block.title).toBe("string");
        expect(block.title!.length).toBeGreaterThan(0);
      }),
      { numRuns: Math.max(100, hclBlocks.length) },
    );
  });
});
