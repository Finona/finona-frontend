// Лаба 4 - Интеграция стороннего API: виджет курсов валют ЦБ РФ
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { TrendingUp, RefreshCw, AlertCircle } from 'lucide-react';
import { exchangeRatesService } from '@/lib/api-services';

const DISPLAY_CURRENCIES = ['USD', 'EUR', 'CNY', 'GBP'];

const ExchangeRates = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['exchange-rates'],
    queryFn: exchangeRatesService.getAll,
    staleTime: 1000 * 60 * 30,
    retry: 2,
  });

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-muted-foreground">Курсы валют ЦБ РФ</h3>
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-6 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <h3 className="text-sm font-medium text-muted-foreground">Курсы валют</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-2">
          Не удалось загрузить курсы валют
        </p>
        <button
          onClick={() => refetch()}
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          <RefreshCw className="h-3 w-3" />
          Повторить
        </button>
      </Card>
    );
  }

  const filtered = data.currencies.filter((c: { char_code: string }) =>
    DISPLAY_CURRENCIES.includes(c.char_code)
  );

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-muted-foreground">Курсы ЦБ РФ</h3>
        </div>
        <span className="text-xs text-muted-foreground">{data.date}</span>
      </div>
      <div className="space-y-2">
        {filtered.map((c: { char_code: string; rate: number; name: string }) => (
          <div key={c.char_code} className="flex items-center justify-between">
            <span className="text-sm font-medium">{c.char_code}</span>
            <span className="text-sm tabular-nums">
              {c.rate.toFixed(2)} ₽
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ExchangeRates;
