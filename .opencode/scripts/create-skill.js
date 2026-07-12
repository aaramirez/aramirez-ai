#!/usr/bin/env node
import { parseArgs, writeFileNow, showHelp, println } from './create-base.js';

const opts = parseArgs(process.argv.slice(2));

if (opts.help) {
  showHelp(
    'create-skill',
    'node .opencode/scripts/create-skill.js --name <name> --description <desc> --content <body> --output <path>',
    'Generate a SKILL.md file with YAML frontmatter.',
    {
      '--name':       'Skill name (must match ^[a-z0-9]+(-[a-z0-9]+)*$) (required)',
      '--description':'Short description, 1-1024 chars (required)',
      '--license':    'License (default: MIT)',
      '--content':    'Markdown body (required)',
      '--output':     'Output file path (required)',
      '--dry-run':    'Print output instead of writing',
      '--help':       'Show this help',
    }
  );
  process.exit(0);
}

const { name, description, content, output, dryRun } = opts;
const license = opts.license || 'MIT';

if (!name || !description || !content || !output) {
  println('Error: --name, --description, --content, and --output are required');
  process.exit(1);
}

if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) {
  println('Error: --name must match ^[a-z0-9]+(-[a-z0-9]+)*$');
  process.exit(1);
}

if (description.length < 1 || description.length > 1024) {
  println('Error: --description must be 1-1024 characters');
  process.exit(1);
}

const md = `---
name: ${name}
description: ${description}
license: ${license}
---

${content}
`;

writeFileNow(output, md, dryRun);
