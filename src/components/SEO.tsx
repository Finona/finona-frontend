// Лаба 4 - SEO: динамические мета-теги, canonical, Open Graph
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  path?: string;
  type?: string;
}

const BASE_URL = 'https://finona.ru';
const DEFAULT_TITLE = 'Finona — Учёт личных финансов';
const DEFAULT_DESCRIPTION =
  'Профессиональное веб-приложение для учёта личных финансов с аналитикой, бюджетами и отчётами';

const SEO = ({ title, description, path = '/', type = 'website' }: SEOProps) => {
  const fullTitle = title ? `${title} | Finona` : DEFAULT_TITLE;
  const desc = description || DEFAULT_DESCRIPTION;
  const canonicalUrl = `${BASE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Finona" />
      <meta property="og:locale" content="ru_RU" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
    </Helmet>
  );
};

export default SEO;
