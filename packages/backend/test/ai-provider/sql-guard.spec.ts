import { describe, expect, it } from 'vitest';

import { isReadOnlySql, normalizeSql } from '../../src/modules/ai-provider/utils/sql-guard';

describe('sql-guard', () => {
  it('accepts single select statement', () => {
    expect(isReadOnlySql('SELECT * FROM customers')).toBe(true);
  });

  it('rejects empty payloads', () => {
    expect(isReadOnlySql('')).toBe(false);
    expect(isReadOnlySql('   ')).toBe(false);
  });

  it('rejects multi-statement input', () => {
    expect(isReadOnlySql('SELECT * FROM customers; SELECT * FROM orders;')).toBe(false);
  });

  it('rejects statements with disallowed keywords', () => {
    expect(isReadOnlySql('SELECT * FROM users; DROP TABLE users;')).toBe(false);
    expect(isReadOnlySql('DELETE FROM orders')).toBe(false);
  });

  it('strips comments before validation', () => {
    const sql = `
      -- comment
      SELECT * FROM customers /* multi */
    `;
    expect(normalizeSql(sql)).toBe('SELECT * FROM customers');
    expect(isReadOnlySql(sql)).toBe(true);
  });
});
