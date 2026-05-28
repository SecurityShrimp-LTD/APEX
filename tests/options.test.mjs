import { describe, expect, test } from 'vitest';
import { loadScript } from './helpers.mjs';

// options.js calls startOptions() at top level, which touches document.*
// Stub the DOM bits enough that the script loads, then exercise the pure
// excludedWebsitesToRegex helper.
const documentStub = {
  getElementById: () => ({
    value: '',
    addEventListener: () => {},
    checked: false
  })
};

// functions.js defines escapeRegExp as a top-level function — load it into
// the same sandbox so options.js can resolve the reference.
const fnCtx = loadScript('functions.js');
const { excludedWebsitesToRegex } = loadScript('options/options.js', {
  document: documentStub,
  escapeRegExp: fnCtx.escapeRegExp
});

describe('excludedWebsitesToRegex', () => {
  test('exact domain matches anchor', () => {
    const re = new RegExp(excludedWebsitesToRegex('paypal.com'), 'i');
    expect(re.test('paypal.com')).toBe(true);
    expect(re.test('evilpaypal.com')).toBe(false);
    expect(re.test('paypal.com.evil')).toBe(false);
  });

  test('leading *. matches any subdomain or the apex', () => {
    const re = new RegExp(excludedWebsitesToRegex('*.google.com'), 'i');
    expect(re.test('google.com')).toBe(true);
    expect(re.test('mail.google.com')).toBe(true);
    expect(re.test('a.b.google.com')).toBe(true);
    expect(re.test('notgoogle.com')).toBe(false);
  });

  test('multiple entries separated by whitespace', () => {
    const re = new RegExp(excludedWebsitesToRegex('paypal.com  *.google.com'), 'i');
    expect(re.test('paypal.com')).toBe(true);
    expect(re.test('mail.google.com')).toBe(true);
    expect(re.test('amazon.com')).toBe(false);
  });

  test('mid-string wildcard becomes greedy', () => {
    const re = new RegExp(excludedWebsitesToRegex('foo.*.com'), 'i');
    expect(re.test('foo.bar.com')).toBe(true);
    expect(re.test('foo.bar.baz.com')).toBe(true);
  });
});
