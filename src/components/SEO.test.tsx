// Лаба 5 - Тесты компонента SEO
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import SEO from './SEO';

const helmetContext = {};

const renderSEO = (props = {}) =>
  render(
    <HelmetProvider context={helmetContext}>
      <SEO {...props} />
    </HelmetProvider>
  );

describe('SEO', () => {
  it('renders without crashing', () => {
    const { container } = renderSEO();
    expect(container).toBeTruthy();
  });

  it('renders with custom title', () => {
    const { container } = renderSEO({ title: 'Тест', path: '/test' });
    expect(container).toBeTruthy();
  });

  it('renders with all props', () => {
    const { container } = renderSEO({
      title: 'Страница',
      description: 'Описание страницы',
      path: '/page',
      type: 'article',
    });
    expect(container).toBeTruthy();
  });
});
