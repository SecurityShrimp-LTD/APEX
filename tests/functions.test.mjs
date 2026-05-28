import { describe, expect, test } from 'vitest';
import { loadScript } from './helpers.mjs';

const { escapeRegExp } = loadScript('functions.js');

describe('escapeRegExp', () => {
  test('escapes regex metacharacters', () => {
    expect(escapeRegExp('foo.bar')).toBe('foo\\.bar');
    expect(escapeRegExp('a+b*c?')).toBe('a\\+b\\*c\\?');
    expect(escapeRegExp('(hi)')).toBe('\\(hi\\)');
    expect(escapeRegExp('[a-z]')).toBe('\\[a-z\\]');
    expect(escapeRegExp('{1,2}')).toBe('\\{1,2\\}');
    expect(escapeRegExp('^$|\\')).toBe('\\^\\$\\|\\\\');
  });

  test('leaves regular text untouched', () => {
    expect(escapeRegExp('hello world')).toBe('hello world');
    expect(escapeRegExp('')).toBe('');
  });
});
