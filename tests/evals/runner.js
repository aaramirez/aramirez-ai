/**
 * Evals runner for agent/skill/script output quality.
 *
 * Usage:
 *   node tests/evals/runner.js                    # run all evals
 *   node tests/evals/runner.js --scenario agent    # run agent evals only
 *   node tests/evals/runner.js --threshold 0.8     # fail if score < 0.8
 *
 * Environment:
 *   TEST_AI=true      enable AI-gated evals (require LLM call)
 *   EVAL_VERBOSE=1    print detailed scoring
 */
import { readdirSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');

// --- CLI args ---
const args = process.argv.slice(2);
const scenarioFilter = args.includes('--scenario')
  ? args[args.indexOf('--scenario') + 1]
  : null;
const threshold = args.includes('--threshold')
  ? parseFloat(args[args.indexOf('--threshold') + 1])
  : 0.7;
const verbose = process.env.EVAL_VERBOSE === '1';

// --- Rubric loader ---
async function loadRubric(name) {
  const rubricPath = join(__dirname, 'rubrics', `${name}.js`);
  if (!existsSync(rubricPath)) return null;
  const mod = await import(rubricPath);
  return mod.default || mod;
}

// --- Scenario loader ---
function loadScenarios(category) {
  const dir = join(__dirname, 'scenarios', category);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => ({
      ...JSON.parse(readFileSync(join(dir, f), 'utf8')),
      _file: f,
    }));
}

// --- Baseline loader ---
function loadBaseline(category, name) {
  const path = join(__dirname, 'baselines', category, `${name}.json`);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf8'));
}

// --- Scoring ---
function scoreOutput(output, rubric) {
  const results = {};
  let total = 0;
  let earned = 0;

  for (const [criterion, weight] of Object.entries(rubric.criteria)) {
    const score = rubric.evaluate(criterion, output);
    results[criterion] = { score, weight };
    total += weight;
    earned += score * weight;
  }

  return {
    score: total > 0 ? earned / total : 0,
    criteria: results,
    passed: total > 0 ? (earned / total) >= threshold : true,
  };
}

// --- Script runner ---
function runScript(scriptPath, args = []) {
  const result = spawnSync('node', [scriptPath, ...args, '--dry-run'], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    stdio: 'pipe',
    timeout: 15000,
  });
  return {
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    exitCode: result.status ?? 1,
  };
}

// --- Main ---
async function runEvals() {
  const categories = scenarioFilter ? [scenarioFilter] : ['agent', 'skill', 'script'];
  const allResults = [];

  for (const category of categories) {
    const scenarios = loadScenarios(category);
    if (scenarios.length === 0) {
      if (verbose) console.log(`  No scenarios for ${category}`);
      continue;
    }

    const rubric = await loadRubric(category);
    if (!rubric) {
      console.log(`  No rubric for ${category} — scoring with defaults`);
    }

    console.log(`\n--- ${category} evals (${scenarios.length} scenarios) ---`);

    for (const scenario of scenarios) {
      let output;

      if (scenario.type === 'script') {
        output = runScript(scenario.script, scenario.args || []);
      } else if (scenario.type === 'command') {
        output = runScript(join(REPO_ROOT, scenario.script), scenario.args || []);
      } else {
        output = { stdout: '', stderr: 'unknown scenario type', exitCode: 1 };
      }

      const baseline = loadBaseline(category, scenario.name);
      const scoring = rubric ? scoreOutput(output, rubric) : { score: 0, criteria: {}, passed: false };

      const result = {
        scenario: scenario.name,
        category,
        exitCode: output.exitCode,
        score: scoring.score,
        passed: scoring.passed && output.exitCode === 0,
        criteria: scoring.criteria,
      };

      allResults.push(result);

      const icon = result.passed ? '\u2705' : '\u274c';
      console.log(`  ${icon} ${scenario.name}: score=${(scoring.score * 100).toFixed(0)}% exit=${output.exitCode}`);

      if (verbose && !result.passed) {
        console.log(`     criteria: ${JSON.stringify(scoring.criteria)}`);
        if (output.stderr) console.log(`     stderr: ${output.stderr.slice(0, 200)}`);
      }
    }
  }

  // Summary
  const passed = allResults.filter(r => r.passed).length;
  const failed = allResults.filter(r => !r.passed).length;
  const avgScore = allResults.length > 0
    ? allResults.reduce((s, r) => s + r.score, 0) / allResults.length
    : 0;

  console.log(`\n=== Eval Summary ===`);
  console.log(`  Total: ${allResults.length}  Passed: ${passed}  Failed: ${failed}`);
  console.log(`  Avg score: ${(avgScore * 100).toFixed(1)}%  Threshold: ${(threshold * 100).toFixed(0)}%`);

  if (failed > 0) {
    console.log(`\nFailed scenarios:`);
    allResults.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.scenario} (score=${(r.score * 100).toFixed(0)}%, exit=${r.exitCode})`);
    });
  }

  process.exit(failed > 0 ? 1 : 0);
}

runEvals().catch(err => {
  console.error('Eval runner failed:', err);
  process.exit(1);
});
