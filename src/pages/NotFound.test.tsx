// Лаба 5 - Тесты страницы 404
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import NotFound from './NotFound';

const renderNotFound = () =>
  render(
    <HelmetProvider context={{}}>
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    </HelmetProvider>
  );

describe('NotFound', () => {
  it('renders 404 text', () => {
    renderNotFound();
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('renders link to home', () => {
    renderNotFound();
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/');
  });
});
