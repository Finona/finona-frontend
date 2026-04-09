// Лаба 5 - Тесты виджета курсов валют
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ExchangeRates from './ExchangeRates';

vi.mock('@/lib/api-services', () => ({
  exchangeRatesService: {
    getAll: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('ExchangeRates', () => {
  it('renders loading state initially', () => {
    render(<ExchangeRates />, { wrapper: createWrapper() });
    expect(screen.getByText('Курсы валют ЦБ РФ')).toBeInTheDocument();
  });
});
