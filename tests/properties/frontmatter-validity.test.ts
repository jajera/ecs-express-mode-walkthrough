import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { getAllMdxFiles } from "./test-utils";

/**
 * Property 3: Frontmatter validity
 * For any MDX file in src/content/docs/, title ≤80 chars and description ≤160 chars, both non-empty
 *
 * **Validates: Requirements 3.6**
 */
describe("Feature: ecs-express-mode-walkthrough, Property 3: Frontmatter validity", () => {
  const mdxFiles = getAllMdxFiles();

  it("every MDX file has a non-empty title with length ≤80 characters", () => {
    fc.assert(
      fc.property(fc.constantFrom(...mdxFiles), (file) => {
        const title = file.frontmatter.title;
        expect(
          typeof title === "string" && title.length > 0,
          `File "${file.relativePath}" has missing or empty title`,
        ).toBe(true);
        expect(
          (title as string).length <= 80,
          `File "${file.relativePath}" has title exceeding 80 chars (got ${(title as string).length}): "${title}"`,
        ).toBe(true);
      }),
      { numRuns: mdxFiles.length },
    );
  });

  it("every MDX file has a non-empty description with length ≤160 characters", () => {
    fc.assert(
      fc.property(fc.constantFrom(...mdxFiles), (file) => {
        const description = file.frontmatter.description;
        expect(
          typeof description === "string" && description.length > 0,
          `File "${file.relativePath}" has missing or empty description`,
        ).toBe(true);
        expect(
          (description as string).length <= 160,
          `File "${file.relativePath}" has description exceeding 160 chars (got ${(description as string).length}): "${description}"`,
        ).toBe(true);
      }),
      { numRuns: mdxFiles.length },
    );
  });
});
