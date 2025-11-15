import * as axe from 'axe-core';
import type { Result } from 'axe-core';

/**
 * Helper function to run axe accessibility tests on a container
 *
 * @param container - The DOM element to test
 * @param options - Axe configuration options
 * @returns Promise with accessibility violations
 *
 * @example
 * ```typescript
 * const { container } = render(<MyComponent />);
 * const results = await runAxe(container);
 * expect(results).toHaveNoViolations();
 * ```
 */
export async function runAxe(
  container: Element,
  options = {}
): Promise<{ violations: Result[] }> {
  const results = await axe.run(container, {
    rules: {
      // Configure axe rules if needed
      'color-contrast': { enabled: true },
      'label': { enabled: true },
      'button-name': { enabled: true },
      'link-name': { enabled: true },
    },
    ...options,
  });

  return {
    violations: results.violations,
  };
}

/**
 * Custom matcher for axe violations
 * Provides better error messages for accessibility test failures
 */
export function toHaveNoViolations(results: { violations: Result[] }) {
  const { violations } = results;

  if (violations.length === 0) {
    return {
      pass: true,
      message: () => 'No accessibility violations found',
    };
  }

  const violationMessages = violations.map((violation) => {
    const nodeMessages = violation.nodes
      .map((node) => `  - ${node.html}\n    ${node.failureSummary}`)
      .join('\n');

    return `
${violation.impact?.toUpperCase()}: ${violation.help}
  ${violation.description}
  Help: ${violation.helpUrl}

  Affected elements:
${nodeMessages}
`;
  }).join('\n');

  return {
    pass: false,
    message: () => `
Expected no accessibility violations but found ${violations.length}:
${violationMessages}
`,
  };
}

// Extend expect with custom matcher
if (typeof expect !== 'undefined') {
  expect.extend({
    toHaveNoViolations,
  });
}

// TypeScript declaration for custom matcher
declare global {
  namespace Vi {
    interface Matchers<R = any> {
      toHaveNoViolations(): R;
    }
  }
}
