import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getAllMdxFiles, extractTooltipTerms } from './test-utils';
import { glossary } from '../../src/data/glossary';

/**
 * Property 1: Glossary completeness
 *
 * For any Tooltip usage across Published_Pages, the term prop must exist
 * in glossary.ts with a non-empty definition.
 *
 * **Validates: Requirements 1.7**
 */
describe('Feature: ecs-express-mode-walkthrough, Property 1: Glossary completeness', () => {
  // Collect all tooltip terms from published pages (pages without draft:true)
  const allFiles = getAllMdxFiles();
  const publishedPages = allFiles.filter((f) => f.frontmatter.draft !== true);
  const allTerms = publishedPages.flatMap((page) => extractTooltipTerms(page.body));
  const uniqueTerms = [...new Set(allTerms)];

  it('published pages contain at least one Tooltip term to validate', () => {
    expect(uniqueTerms.length).toBeGreaterThan(0);
  });

  it('every Tooltip term in published pages exists in glossary with a non-empty definition', () => {
    fc.assert(
      fc.property(fc.constantFrom(...uniqueTerms), (term) => {
        // The term must exist as a key in the glossary
        expect(term in glossary).toBe(true);
        // The definition must be a non-empty string
        expect(typeof glossary[term]).toBe('string');
        expect(glossary[term].length).toBeGreaterThan(0);
      }),
      { numRuns: Math.max(100, uniqueTerms.length) },
    );
  });
});
