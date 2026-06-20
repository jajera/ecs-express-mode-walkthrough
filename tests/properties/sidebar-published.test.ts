import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getAllMdxFiles } from "./test-utils";

/**
 * Property 9: Sidebar references only published pages
 *
 * For any slug in sidebar config, the corresponding MDX must not have draft:true.
 *
 * **Validates: Requirements 9.4**
 */
describe("Feature: ecs-express-mode-walkthrough, Property 9: Sidebar references only published pages", () => {
  // Parse astro.config.mjs to extract all slug values from the sidebar configuration
  const configPath = join(process.cwd(), "astro.config.mjs");
  const configContent = readFileSync(configPath, "utf-8");
  const slugRegex = /slug:\s*['"]([^'"]+)['"]/g;
  const sidebarSlugs: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = slugRegex.exec(configContent)) !== null) {
    sidebarSlugs.push(match[1]);
  }

  // Get all MDX files for lookup
  const allFiles = getAllMdxFiles();

  it("sidebar contains at least one slug to validate", () => {
    expect(sidebarSlugs.length).toBeGreaterThan(0);
  });

  it("every sidebar slug references a page that is not draft", () => {
    fc.assert(
      fc.property(fc.constantFrom(...sidebarSlugs), (slug) => {
        // Map slug to corresponding MDX file path
        // slug "index" → "index.mdx", "ecs-express-mode/concepts" → "ecs-express-mode/concepts.mdx"
        const expectedRelativePath = `${slug}.mdx`;

        const mdxFile = allFiles.find(
          (f) => f.relativePath === expectedRelativePath,
        );

        // The file must exist
        expect(mdxFile).toBeDefined();

        // The file must NOT have draft:true in frontmatter
        expect(mdxFile!.frontmatter.draft).not.toBe(true);
      }),
      { numRuns: Math.max(100, sidebarSlugs.length) },
    );
  });
});
