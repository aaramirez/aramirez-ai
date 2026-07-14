/**
 * Rubric for scoring creator script --dry-run output quality.
 *
 * Criteria:
 *   - exitSuccess: script exits with code 0
 *   - hasOutput: produces non-empty stdout
 *   - validJson: output is valid JSON or structured text
 *   - hasRequiredFields: output contains expected fields
 *   - noStderr: no error output on stderr
 */
export default {
  criteria: {
    exitSuccess: 0.3,
    hasOutput: 0.2,
    validJson: 0.2,
    hasRequiredFields: 0.15,
    noStderr: 0.15,
  },

  evaluate(criterion, output) {
    switch (criterion) {
      case 'exitSuccess':
        return output.exitCode === 0 ? 1 : 0;

      case 'hasOutput':
        return (output.stdout || '').length > 10 ? 1 : 0;

      case 'validJson': {
        const text = output.stdout || '';
        try {
          JSON.parse(text);
          return 1;
        } catch {
          // Check if it's valid markdown/text output
          return text.length > 0 ? 0.5 : 0;
        }
      }

      case 'hasRequiredFields': {
        const text = output.stdout || '';
        // Look for common fields in generated output
        const hasName = text.includes('name') || text.includes('description');
        return hasName ? 1 : 0.5;
      }

      case 'noStderr':
        return (output.stderr || '').length === 0 ? 1 : 0.5;

      default:
        return 0;
    }
  },
};
