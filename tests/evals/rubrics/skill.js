/**
 * Rubric for scoring SKILL.md output quality.
 *
 * Criteria:
 *   - hasFrontmatter: has YAML frontmatter block
 *   - hasName: name matches expected skill name
 *   - hasDescription: description is present and meaningful
 *   - hasLicense: license field exists
 *   - hasContent: body has substantive content (>200 chars)
 *   - hasScriptRef: references a script or explains no-script approach
 */
export default {
  criteria: {
    hasFrontmatter: 0.15,
    hasName: 0.15,
    hasDescription: 0.2,
    hasLicense: 0.1,
    hasContent: 0.25,
    hasScriptRef: 0.15,
  },

  evaluate(criterion, output) {
    const text = output.stdout || '';

    switch (criterion) {
      case 'hasFrontmatter':
        return text.startsWith('---') && text.includes('---', 3) ? 1 : 0;

      case 'hasName': {
        const match = text.match(/name:\s*(\S+)/i);
        return match ? 1 : 0;
      }

      case 'hasDescription': {
        const match = text.match(/description:\s*(.+)/i);
        return match && match[1].trim().length > 10 ? 1 : 0;
      }

      case 'hasLicense':
        return text.includes('license:') ? 1 : 0;

      case 'hasContent': {
        const bodyStart = text.indexOf('---', 3);
        const body = bodyStart > 0 ? text.slice(bodyStart + 3).trim() : text;
        return body.length > 200 ? 1 : body.length > 50 ? 0.5 : 0;
      }

      case 'hasScriptRef':
        return text.includes('scripts/') || text.includes('script') ? 1 : 0.5;

      default:
        return 0;
    }
  },
};
