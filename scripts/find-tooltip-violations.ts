import { getAllMdxFiles, splitByH2Sections, extractTooltipTerms } from '../tests/properties/test-utils';
import { glossary } from '../src/data/glossary';

const allFiles = getAllMdxFiles();
const glossaryKeys = Object.keys(glossary);

function getPlainProseText(sectionContent: string): string {
  let text = sectionContent;
  text = text.replace(/^import\s+.*$/gm, '');
  text = text.replace(/```[\s\S]*?```/g, '');
  text = text.replace(/<Aside[\s\S]*?<\/Aside>/g, '');
  text = text.replace(/<table[\s\S]*?<\/table>/g, '');
  text = text.replace(/<Tooltip\s+term=["'][^"']+["']>([\s\S]*?)<\/Tooltip>/g, '$1');
  text = text.replace(/<[^>]+>/g, '');
  return text;
}

for (const page of allFiles) {
  const pageTooltipTerms = new Set(extractTooltipTerms(page.body));
  const sections = splitByH2Sections(page.body);
  for (const section of sections) {
    const proseText = getPlainProseText(section.content);
    for (const term of glossaryKeys) {
      if (!pageTooltipTerms.has(term)) continue;
      const displayName = term.replace(/_/g, ' ');
      const escaped = displayName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      if (regex.test(proseText)) {
        const tooltipTermsInSection = extractTooltipTerms(section.content);
        if (!tooltipTermsInSection.includes(term)) {
          console.log(`${page.relativePath} | "${section.heading}" | ${term}`);
        }
      }
    }
  }
}
