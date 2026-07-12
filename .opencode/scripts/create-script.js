#!/usr/bin/env node
import { parseArgs, writeFileNow, showHelp, println } from './create-base.js';

const USAGE = `node .opencode/scripts/create-script.js --name <name> --lang <js|py|sh> --description <desc> --output <path>`;
const DESC = 'Generates a boilerplate reusable script.';

const OPTIONS = {
  '--name':         '(required) Script name',
  '--lang':         'js|py|sh (default: js)',
  '--description':  '(required) Script description',
  '--output':       '(required) Output file path',
  '--dry-run':      'Print file without writing',
  '--help':         'Show this help',
};

function generateJS(name, description) {
  return `#!/usr/bin/env node
import { parseArgs, writeFileNow, showHelp, println } from './create-base.js';

const USAGE = \`node shared/scripts/${name}.js\`;
const DESC = '${description}';

const OPTIONS = {
  '--help':  'Show this help',
};

function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.help) {
    showHelp('${name}.js', USAGE, DESC, OPTIONS);
    process.exit(0);
  }

  println('${name}: ${description}');
}

main();
`;
}

function generatePY(name, description) {
  return `#!/usr/bin/env python3
import argparse

def main():
    parser = argparse.ArgumentParser(description='${description}')
    parser.add_argument('--dry-run', action='store_true', help='Print without executing')
    args = parser.parse_args()

    print('${name}: ${description}')

if __name__ == '__main__':
    main()
`;
}

function generateSH(name, description) {
  return `#!/usr/bin/env bash
set -euo pipefail

NAME="${name}"
DESCRIPTION="${description}"
DRY_RUN=false

usage() {
    cat <<EOF

  ${name}

  ${description}

  Usage:
    ${name} [options]

  Options:
    --help          Show this help
    --dry-run       Print without executing

EOF
    exit 0
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        --help) usage ;;
        --dry-run) DRY_RUN=true; shift ;;
        *) echo "Unknown option: $1"; usage ;;
    esac
done

echo "${name}: ${description}"
`;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.help) {
    showHelp('create-script.js', USAGE, DESC, OPTIONS);
    process.exit(0);
  }

  if (!opts.name) { println('  Error: --name is required'); process.exit(1); }
  if (!opts.description) { println('  Error: --description is required'); process.exit(1); }
  if (!opts.output) { println('  Error: --output is required'); process.exit(1); }

  const lang = opts.lang || 'js';
  const validLangs = ['js', 'py', 'sh'];
  if (!validLangs.includes(lang)) {
    println(`  Error: --lang must be one of: ${validLangs.join(', ')}`);
    process.exit(1);
  }

  let content;
  switch (lang) {
    case 'js':  content = generateJS(opts.name, opts.description); break;
    case 'py':  content = generatePY(opts.name, opts.description); break;
    case 'sh':  content = generateSH(opts.name, opts.description); break;
  }

  writeFileNow(opts.output, content, opts.dryRun);
  println(`  Language: ${lang}`);
  println(`  Script: ${opts.output}`);
}

main();
