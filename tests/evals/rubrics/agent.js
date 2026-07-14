/**
 * Rubric for scoring agent .md output quality.
 *
 * Criteria:
 *   - hasFrontmatter: has YAML frontmatter block
 *   - hasDescription: description is present and meaningful
 *   - hasMode: mode is primary or subagent
 *   - hasModel: model is specified
 *   - hasPermission: permission block exists
 *   - bodyLength: body is substantive (>100 chars)
 */
export default {
  criteria: {
    hasFrontmatter: 0.2,
    hasDescription: 0.2,
    hasMode: 0.15,
    hasModel: 0.15,
    hasPermission: 0.15,
    bodyLength: 0.15,
  },

  evaluate(criterion, output) {
    const text = output.stdout || '';

    switch (criterion) {
      case 'hasFrontmatter':
        return text.startsWith('---') && text.includes('---', 3) ? 1 : 0;

      case 'hasDescription': {
        const match = text.match(/description:\s*(.+)/i);
        return match && match[1].trim().length > 5 ? 1 : 0;
      }

      case 'hasMode': {
        const match = text.match(/mode:\s*(primary|subagent)/i);
        return match ? 1 : 0;
      }

      case 'hasModel': {
        const match = text.match(/model:\s*\S+/i);
        return match ? 1 : 0;
      }

      case 'hasPermission':
        return text.includes('permission:') ? 1 : 0;

      case 'bodyLength': {
        const bodyStart = text.indexOf('---', 3);
        const body = bodyStart > 0 ? text.slice(bodyStart + 3).trim() : text;
        return body.length > 100 ? 1 : body.length > 30 ? 0.5 : 0;
      }

      default:
        return 0;
    }
  },
};
