import { describe, expect, it } from '@jest/globals';

import { buildDefinitionAutoScrollScript } from './buildDefinitionAutoScrollScript';

describe('buildDefinitionAutoScrollScript', () => {
  it('targets the verified Oxford dictionary entry container', () => {
    const script = buildDefinitionAutoScrollScript();

    expect(script).toContain(
      "document.querySelector('#entryContent')",
    );
  });

  it('uses the target current position instead of a fixed pixel offset', () => {
    const script = buildDefinitionAutoScrollScript();

    expect(script).toContain(
      'target.getBoundingClientRect().top + window.scrollY',
    );
    expect(script).toContain('window.scrollTo(0, targetTop)');
    expect(script).not.toMatch(/scrollTo\(0,\s*(370|504|601|735)\)/);
  });

  it('does not scroll when the entry container is absent', () => {
    const script = buildDefinitionAutoScrollScript();

    expect(script).toContain('if (!target)');
    expect(script).toContain('return;');
  });

  it('ends with the WebView-compatible truthy expression', () => {
    expect(buildDefinitionAutoScrollScript()).toMatch(/true;\s*$/);
  });
});
