import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
// Лаба 4 - SEO
import SEO from '@/components/SEO'; // Лаба 4

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      '404 Error: User attempted to access non-existent route:',
      location.pathname
    );
  }, [location.pathname]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <SEO title="Страница не найдена" description="Запрошенная страница не существует" path="/404" />
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-gray-600">Страница не найдена</p>
        <a href="/" className="text-blue-500 underline hover:text-blue-700">
          Вернуться на главную
        </a>
      </div>
    </main>
  );
};

export default NotFound;
