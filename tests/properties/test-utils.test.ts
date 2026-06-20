import { describe, it, expect } from "vitest";
import {
  getAllMdxFiles,
  parseFrontmatter,
  extractCodeBlocks,
  detectImports,
  hasCustomComponentImports,
  extractTooltipTerms,
  findPipeTables,
  splitByH2Sections,
} from "./test-utils";

describe("test-utils", () => {
  describe("getAllMdxFiles", () => {
    it("returns all MDX files from src/content/docs/", () => {
      const files = getAllMdxFiles();
      expect(files.length).toBeGreaterThan(0);
      expect(files.every((f) => f.path.endsWith(".mdx"))).toBe(true);
      expect(files.every((f) => f.relativePath.length > 0)).toBe(true);
    });
  });

  describe("parseFrontmatter", () => {
    it("parses title and description from YAML frontmatter", () => {
      const raw = `---
title: 'My Page'
description: 'A description of the page'
draft: true
---

## Content here`;

      const { frontmatter, body } = parseFrontmatter(raw);
      expect(frontmatter.title).toBe("My Page");
      expect(frontmatter.description).toBe("A description of the page");
      expect(frontmatter.draft).toBe(true);
      expect(body).toContain("## Content here");
    });

    it("returns empty frontmatter when no fences found", () => {
      const { frontmatter, body } = parseFrontmatter("just some text");
      expect(frontmatter).toEqual({});
      expect(body).toBe("just some text");
    });
  });

  describe("extractCodeBlocks", () => {
    it("extracts code blocks with language and title", () => {
      const body = `Some text

\`\`\`hcl title="main.tf"
resource "aws_vpc" "this" {}
\`\`\`

More text

\`\`\`bash
terraform init
\`\`\`
`;

      const blocks = extractCodeBlocks(body);
      expect(blocks).toHaveLength(2);
      expect(blocks[0].language).toBe("hcl");
      expect(blocks[0].title).toBe("main.tf");
      expect(blocks[0].content).toContain("aws_vpc");
      expect(blocks[1].language).toBe("bash");
      expect(blocks[1].title).toBeNull();
    });

    it("detects code blocks without language", () => {
      const body = `\`\`\`
no language
\`\`\`
`;
      const blocks = extractCodeBlocks(body);
      expect(blocks).toHaveLength(1);
      expect(blocks[0].language).toBeNull();
    });
  });

  describe("detectImports", () => {
    it("detects named and default imports", () => {
      const body = `import { Aside } from '@astrojs/starlight/components';
import Tooltip from '../../components/Tooltip.astro';

## Heading
`;
      const imports = detectImports(body);
      expect(imports).toContain("@astrojs/starlight/components");
      expect(imports).toContain("../../components/Tooltip.astro");
    });
  });

  describe("hasCustomComponentImports", () => {
    it("returns true when custom components are imported", () => {
      const body = `import Tooltip from '../../components/Tooltip.astro';`;
      expect(hasCustomComponentImports(body)).toBe(true);
    });

    it("returns false when only Starlight components are imported", () => {
      const body = `import { Aside } from '@astrojs/starlight/components';`;
      expect(hasCustomComponentImports(body)).toBe(false);
    });
  });

  describe("extractTooltipTerms", () => {
    it("extracts term prop values from Tooltip components", () => {
      const content = `<Tooltip term="Express_Gateway_Service">EGS</Tooltip> and <Tooltip term="VPC">VPC</Tooltip>`;
      const terms = extractTooltipTerms(content);
      expect(terms).toEqual(["Express_Gateway_Service", "VPC"]);
    });
  });

  describe("findPipeTables", () => {
    it("detects markdown pipe tables", () => {
      const content = `| Col A | Col B |
| --- | --- |
| val1 | val2 |`;
      const tables = findPipeTables(content);
      expect(tables).toHaveLength(1);
    });

    it("returns empty for HTML tables", () => {
      const content = `<table><tr><td>data</td></tr></table>`;
      const tables = findPipeTables(content);
      expect(tables).toHaveLength(0);
    });
  });

  describe("splitByH2Sections", () => {
    it("splits content into h2-headed sections", () => {
      const body = `Some preamble

## First Section

Content of first section.

## Second Section

Content of second section.
`;
      const sections = splitByH2Sections(body);
      expect(sections).toHaveLength(2);
      expect(sections[0].heading).toBe("First Section");
      expect(sections[0].content).toContain("Content of first section.");
      expect(sections[1].heading).toBe("Second Section");
      expect(sections[1].content).toContain("Content of second section.");
    });
  });
});
