import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { glossary } from '../../src/data/glossary';

/**
 * Property 2: cspell coverage of glossary terms
 *
 * For any term key in glossary.ts, derived words (split on underscores, lowercased)
 * must appear in cspell.json words array.
 *
 * Validates: Requirements 2.5
 */
describe('Feature: ecs-express-mode-walkthrough, Property 2: cspell coverage of glossary terms', () => {
  const cspellPath = join(process.cwd(), '.vscode/cspell.json');
  const cspellContent = JSON.parse(readFileSync(cspellPath, 'utf-8'));
  const cspellWords: string[] = cspellContent.words.map((w: string) => w.toLowerCase());

  const glossaryKeys = Object.keys(glossary);

  it('for any glossary term key, all derived words appear in cspell.json words array', () => {
    fc.assert(
      fc.property(fc.constantFrom(...glossaryKeys), (termKey) => {
        const derivedWords = termKey.split('_').map((w) => w.toLowerCase());

        for (const word of derivedWords) {
          expect(
            cspellWords.includes(word),
            `Word "${word}" derived from glossary term "${termKey}" is missing from cspell.json words array`,
          ).toBe(true);
        }
      }),
      { numRuns: 100 },
    );
  });
});
