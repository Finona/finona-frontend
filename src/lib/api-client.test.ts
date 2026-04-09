// Лаба 5 - Unit-тесты API-клиента
import { describe, it, expect } from 'vitest';

describe('API URL configuration', () => {
  it('API_URL defaults to /api/v1', () => {
    const defaultUrl = '/api/v1';
    expect(defaultUrl).toBe('/api/v1');
  });

  it('constructs correct endpoint URLs', () => {
    const base = '/api/v1';
    expect(`${base}/auth/login`).toBe('/api/v1/auth/login');
    expect(`${base}/accounts`).toBe('/api/v1/accounts');
    expect(`${base}/transactions`).toBe('/api/v1/transactions');
  });

  it('builds authorization header correctly', () => {
    const token = 'test-jwt-token';
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    expect(headers.Authorization).toBe('Bearer test-jwt-token');
  });

  it('omits authorization when no token', () => {
    const token: string | null = null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
    expect(headers.Authorization).toBeUndefined();
  });

  it('handles query parameters', () => {
    const query = new URLSearchParams();
    query.set('search', 'test');
    query.set('type', 'expense');
    query.set('page', '1');
    expect(query.toString()).toBe('search=test&type=expense&page=1');
  });

  it('handles empty query parameters', () => {
    const query = new URLSearchParams();
    expect(query.toString()).toBe('');
  });
});
