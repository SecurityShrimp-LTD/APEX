import { describe, expect, test } from 'vitest';
import { loadScript } from './helpers.mjs';

const { DomainRanking } = loadScript('background/domain_ranking.js', {}, ['DomainRanking']);

describe('DomainRanking', () => {
  const ranking = new DomainRanking(['google.com', 'facebook.com', 'paypal.com', 'github.com']);

  test('getDomainRank returns 1-based index for known domains', () => {
    expect(ranking.getDomainRank('google.com')).toBe(1);
    expect(ranking.getDomainRank('github.com')).toBe(4);
  });

  test('getDomainRank returns null for unknown domains', () => {
    expect(ranking.getDomainRank('not-a-real-domain.example')).toBeNull();
  });

  test('getSimilarTopDomain finds homoglyph variants', () => {
    // 'paypa1.com' canonicalizes to 'paypal.com' via the 1->l rule.
    expect(ranking.getSimilarTopDomain('paypa1.com')).toBe('paypal.com');
    // 'goog1e.com' canonicalizes the same way.
    expect(ranking.getSimilarTopDomain('goog1e.com')).toBe('google.com');
  });

  test('getSimilarTopDomain returns null for distinct domains', () => {
    expect(ranking.getSimilarTopDomain('totallydifferent.com')).toBeNull();
  });

  test('punycode domains are not canonicalized', () => {
    const r = new DomainRanking(['xn--example.com']);
    expect(r.getSimilarTopDomain('xn--example.com')).toBe('xn--example.com');
  });

  test('rn -> m homoglyph rule', () => {
    const r = new DomainRanking(['amazon.com']);
    expect(r.getSimilarTopDomain('arnazon.com')).toBe('amazon.com');
  });

  test('vv -> w homoglyph rule', () => {
    const r = new DomainRanking(['twitter.com']);
    expect(r.getSimilarTopDomain('tvvitter.com')).toBe('twitter.com');
  });
});
