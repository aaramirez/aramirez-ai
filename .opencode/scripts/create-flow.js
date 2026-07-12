#!/usr/bin/env node
import { parseArgs, writeFileNow, showHelp, println } from './create-base.js';

const USAGE = `node .opencode/scripts/create-flow.js --name <name> --stages <stages> --description <desc> --output <path>`;
const DESC = 'Creates workflow sequence descriptions for agent collaboration.';

const AGENT_MAP = {
  plan:     { agent: 'plan',     description: 'Create implementation plan' },
  review:   { agent: 'reviewer', description: 'Review deliverables' },
  'review-plan': { agent: 'plan', description: 'Review and refine the plan' },
  test:     { agent: 'tester',   description: 'Run tests and verify correctness' },
  build:    { agent: 'build',    description: 'Implement the solution' },
  implement: { agent: 'build',   description: 'Implement the solution' },
  deploy:   { agent: 'devops',   description: 'Deploy to target environment' },
  refactor: { agent: 'build',    description: 'Refactor code for quality' },
  diagnose: { agent: 'reviewer', description: 'Diagnose the issue' },
  fix:      { agent: 'build',    description: 'Apply the fix' },
  explore:  { agent: 'explore',  description: 'Explore and gather information' },
  analyze:  { agent: 'analyze',  description: 'Analyze findings' },
  synthesize: { agent: 'build',  description: 'Synthesize insights into output' },
  document: { agent: 'docs',     description: 'Document the findings' },
};

const TEMPLATES = {
  'plan-first':   ['plan', 'review-plan', 'build', 'test', 'review', 'deploy'],
  'tdd':          ['test', 'implement', 'refactor', 'review'],
  'hotfix':       ['diagnose', 'fix', 'review', 'deploy'],
  'research':     ['explore', 'analyze', 'synthesize', 'document'],
};

const OPTIONS = {
  '--name':         '(required) Workflow name',
  '--stages':       '(required) Comma-separated stage names',
  '--description':  'Workflow description (optional)',
  '--output':       '(required) Output file path',
  '--dry-run':      'Print file without writing',
  '--help':         'Show this help',
};

function buildStage(stageName) {
  const known = AGENT_MAP[stageName];
  if (known) {
    return { name: stageName, agent: known.agent, description: known.description };
  }
  return { name: stageName, agent: stageName, description: `Execute ${stageName} step` };
}

function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.help) {
    showHelp('create-flow.js', USAGE, DESC, OPTIONS);
    process.exit(0);
  }

  if (!opts.name) { println('  Error: --name is required'); process.exit(1); }
  if (!opts.stages) { println('  Error: --stages is required'); process.exit(1); }
  if (!opts.output) { println('  Error: --output is required'); process.exit(1); }

  let stageNames;
  if (TEMPLATES[opts.stages]) {
    stageNames = TEMPLATES[opts.stages];
    println(`  Using predefined template: ${opts.stages}`);
  } else {
    stageNames = opts.stages.split(',').map(s => s.trim());
  }

  if (stageNames.length === 0) {
    println('  Error: No stages provided');
    process.exit(1);
  }

  const stages = stageNames.map(buildStage);

  const workflow = {
    name: opts.name,
    description: opts.description || `${opts.name} workflow`,
    stages,
  };

  const content = JSON.stringify(workflow, null, 2) + '\n';
  writeFileNow(opts.output, content, opts.dryRun);

  println(`\n  Summary: Created workflow "${opts.name}" with ${stages.length} stages`);
  println(`  Stages: ${stages.map(s => `${s.name}→${s.agent}`).join(', ')}`);
}

main();
