import { describe, expect, it } from 'vitest';
import { formatMeta, truncate } from './format';

describe('formatMeta', () => {
  it('joins present parts with a separator', () => {
    expect(formatMeta('Chicken', 'Japanese')).toBe('Chicken · Japanese');
  });

  it('skips empty and whitespace-only parts', () => {
    expect(formatMeta('Beef', '', undefined, '  ')).toBe('Beef');
  });
});

describe('truncate', () => {
  it('leaves short values untouched', () => {
    expect(truncate('Pasta', 10)).toBe('Pasta');
  });

  it('adds an ellipsis when the value is too long', () => {
    expect(truncate('Teriyaki Chicken Casserole', 12)).toBe('Teriyaki Ch…');
  });
});
