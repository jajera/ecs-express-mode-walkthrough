import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  getAllMdxFiles,
  hasCustomComponentImports,
  findPipeTables,
} from "./test-utils";

/**
 * Property 6: HTML tables when components are imported
 *
 * For any Content_Page that imports custom components (Tooltip or other
 * non-Starlight components), all tabular data on that page must use HTML
 * `<table>` syntax and not markdown pipe table syntax.
 *
 * **Validates: Requirements 8.1**
 */
describe("Feature: ecs-express-mode-walkthrough, Property 6: HTML tables when components are imported", () => {
  const allFiles = getAllMdxFiles();
  const pagesWithComponents = allFiles.filter((f) =>
    hasCustomComponentImports(f.body),
  );

  it("at least one page imports custom components", () => {
    expect(pagesWithComponents.length).toBeGreaterThan(0);
  });

  it("pages with custom component imports contain no pipe tables", () => {
    fc.assert(
      fc.property(fc.constantFrom(...pagesWithComponents), (page) => {
        const pipeTables = findPipeTables(page.body);
        expect(pipeTables).toEqual([]);
      }),
      { numRuns: Math.max(100, pagesWithComponents.length) },
    );
  });
});
