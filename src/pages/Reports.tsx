import { useState, useMemo } from 'react';
import {
  Download,
  TrendingUp,
  FileText,
  PieChart as PieChartIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { reportsService, exportService } from '@/lib/api-services';
import { useToast } from '@/hooks/use-toast';
import {
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
} from 'date-fns';
import { ru } from 'date-fns/locale';

const CHART_COLORS = [
  'hsl(var(--accent))',
  'hsl(var(--primary))',
  'hsl(var(--destructive))',
  'hsl(217, 91%, 60%)',
  'hsl(var(--success))',
  'hsl(var(--muted))',
  'hsl(280, 60%, 60%)',
  'hsl(30, 80%, 55%)',
];

const Reports = () => {
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('current-month');

  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    let start: Date, end: Date;

    switch (selectedPeriod) {
      case 'current-month':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'previous-month':
        start = startOfMonth(subMonths(now, 1));
        end = endOfMonth(subMonths(now, 1));
        break;
      case 'quarter':
        start = startOfQuarter(now);
        end = endOfQuarter(now);
        break;
      case 'year':
        start = startOfYear(now);
        end = endOfYear(now);
        break;
      default:
        start = startOfMonth(now);
        end = endOfMonth(now);
    }

    return { startDate: start, endDate: end };
  }, [selectedPeriod]);

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['reports-analytics', startDate, endDate],
    queryFn: () =>
      reportsService.getAnalytics({
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
      }),
  });

  const monthlyData = useMemo(() => {
    return (
      analytics?.monthly_data.map((item) => ({
        month: format(new Date(item.month + '-01'), 'MMM', { locale: ru }),
        income: Number(item.income),
        expenses: Number(item.expense),
        profit: Number(item.income) - Number(item.expense),
      })) || []
    );
  }, [analytics]);

  const categoryExpenses = useMemo(() => {
    return (
      analytics?.expenses_by_category.map((item, index) => ({
        name: item.name,
        value: Number(item.amount),
        color: item.color || CHART_COLORS[index % CHART_COLORS.length],
      })) || []
    );
  }, [analytics]);

  const handleExport = async (
    type: 'transactions' | 'accounts' | 'categories' | 'budgets'
  ) => {
    try {
      const blob = await exportService.csv(type);
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${type}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      link.click();

      toast({
        title: 'Экспорт завершён',
        description: `Файл ${type}.csv загружен`,
      });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось экспортировать данные',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка отчётов...</p>
        </div>
      </div>
    );
  }

  const income = Number(analytics?.stats.income || 0);
  const expenses = Number(analytics?.stats.expenses || 0);
  const balance = Number(analytics?.stats.balance || 0);
  const incomeChange = analytics?.stats.income_change_percent || 0;
  const expensesChange = analytics?.stats.expenses_change_percent || 0;
  const profitMargin = income > 0 ? (balance / income) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Отчёты</h1>
          <p className="text-muted-foreground">Аналитика и финансовые отчёты</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-month">Текущий месяц</SelectItem>
              <SelectItem value="previous-month">Прошлый месяц</SelectItem>
              <SelectItem value="quarter">Текущий квартал</SelectItem>
              <SelectItem value="year">Текущий год</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => handleExport('transactions')}>
            <Download className="mr-2 h-4 w-4" />
            Экспорт
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="cursor-pointer transition-all hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Доходы за период
                </p>
                <p className="text-2xl font-bold text-success">
                  ₽ {income.toLocaleString()}
                </p>
                <p
                  className={`text-xs ${incomeChange >= 0 ? 'text-success' : 'text-destructive'}`}
                >
                  {incomeChange >= 0 ? '+' : ''}
                  {incomeChange.toFixed(1)}% к пред. периоду
                </p>
              </div>
              <div className="rounded-lg bg-success/10 p-3">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-all hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Расходы за период
                </p>
                <p className="text-2xl font-bold text-foreground">
                  ₽ {expenses.toLocaleString()}
                </p>
                <p
                  className={`text-xs ${expensesChange <= 0 ? 'text-success' : 'text-destructive'}`}
                >
                  {expensesChange >= 0 ? '+' : ''}
                  {expensesChange.toFixed(1)}% к пред. периоду
                </p>
              </div>
              <div className="rounded-lg bg-destructive/10 p-3">
                <PieChartIcon className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-all hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Остаток
                </p>
                <p
                  className={`text-2xl font-bold ${balance >= 0 ? 'text-success' : 'text-destructive'}`}
                >
                  ₽ {balance.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {balance >= 0 ? 'Положительный баланс' : 'Отрицательный баланс'}
                </p>
              </div>
              <div className="rounded-lg bg-accent/10 p-3">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-all hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Рентабельность
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {profitMargin.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {profitMargin > 20
                    ? 'Отличный'
                    : profitMargin > 10
                      ? 'Хороший'
                      : 'Низкий'}{' '}
                  показатель
                </p>
              </div>
              <div className="rounded-lg bg-primary/10 p-3">
                <FileText className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Прибыли и убытки (P&L)</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.length === 0 ? (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                Нет данных за выбранный период
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => `₽${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                    }}
                    formatter={(value: number) => `₽${value.toLocaleString()}`}
                  />
                  <Legend />
                  <Bar
                    dataKey="income"
                    fill="hsl(var(--success))"
                    name="Доходы"
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar
                    dataKey="expenses"
                    fill="hsl(var(--destructive))"
                    name="Расходы"
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar
                    dataKey="profit"
                    fill="hsl(var(--primary))"
                    name="Остаток"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Структура расходов</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryExpenses.length === 0 ? (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                Нет расходов за выбранный период
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryExpenses}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                  >
                    {categoryExpenses.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `₽${value.toLocaleString()}`}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Динамика остатка</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyData.length === 0 ? (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              Нет данных за выбранный период
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="month"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => `₽${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                  formatter={(value: number) => `₽${value.toLocaleString()}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  name="Остаток"
                  dot={{ fill: 'hsl(var(--primary))', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Топ контрагентов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.top_counterparties &&
              analytics.top_counterparties.length > 0 ? (
                analytics.top_counterparties.map((counterparty, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div>
                      <p className="font-semibold text-foreground">
                        {counterparty.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {counterparty.count} операций
                      </p>
                    </div>
                    <p className="text-lg font-bold text-foreground">
                      ₽ {Number(counterparty.amount).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Нет данных о контрагентах
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Доступные отчёты</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  name: 'Отчёт о доходах и убытках',
                  icon: FileText,
                  type: 'transactions' as const,
                },
                {
                  name: 'Отчёт о движении денежных средств',
                  icon: TrendingUp,
                  type: 'transactions' as const,
                },
                {
                  name: 'Анализ расходов по категориям',
                  icon: PieChartIcon,
                  type: 'categories' as const,
                },
                {
                  name: 'Отчёт по счетам',
                  icon: FileText,
                  type: 'accounts' as const,
                },
                {
                  name: 'Полный экспорт транзакций',
                  icon: FileText,
                  type: 'transactions' as const,
                },
              ].map((report, i) => (
                <div
                  key={i}
                  className="flex cursor-pointer items-center justify-between rounded-lg border border-border p-4 transition-all hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <report.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium">{report.name}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport(report.type)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Скачать
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
