import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Download,
} from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
import {
  accountsService,
  transactionsService,
  budgetsService,
  categoriesService,
} from '@/lib/api-services';
import { useToast } from '@/hooks/use-toast';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  subMonths,
} from 'date-fns';
import { ru } from 'date-fns/locale';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      return accountsService.getAll();
    },
  });

  const chartDateRange = useMemo(() => {
    return {
      start: startOfMonth(subMonths(new Date(), 5)),
      end: new Date(),
    };
  }, []);

  const { data: transactions } = useQuery({
    queryKey: ['transactions', chartDateRange],
    queryFn: async () => {
      const endOfDay = new Date(chartDateRange.end);
      endOfDay.setHours(23, 59, 59, 999);
      return transactionsService.getAll({
        start_date: chartDateRange.start.toISOString(),
        end_date: endOfDay.toISOString(),
      });
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      return categoriesService.getAll();
    },
  });

  const { data: budgets } = useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      return budgetsService.getAll();
    },
  });

  const categoriesMap = useMemo(() => {
    if (!categories) return {};
    return Object.fromEntries(categories.map((cat) => [cat.id, cat]));
  }, [categories]);

  const activeAccounts = useMemo(() => {
    return accounts?.filter((acc) => acc.is_active) || [];
  }, [accounts]);

  const stats = useMemo(() => {
    const totalBalance = activeAccounts.reduce(
      (sum, acc) => sum + Number(acc.balance),
      0
    );
    const txns = transactions || [];

    const totalIncome = txns
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpenses = txns
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      totalBalance,
      totalIncome,
      totalExpenses,
      savings: totalIncome - totalExpenses,
    };
  }, [activeAccounts, transactions]);

  const cashFlowData = useMemo(() => {
    if (!transactions) return [];

    const months = eachMonthOfInterval({
      start: subMonths(new Date(), 5),
      end: new Date(),
    });

    return months.map((month) => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

      const monthTransactions = transactions.filter((t) => {
        const tDate = new Date(t.date);
        return tDate >= monthStart && tDate <= monthEnd;
      });

      const income = monthTransactions
        .filter((t) => t.type === 'INCOME')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const expenses = monthTransactions
        .filter((t) => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      return {
        month: format(month, 'MMM', { locale: ru }),
        income,
        expenses,
      };
    });
  }, [transactions]);

  const categoryData = useMemo(() => {
    if (!(transactions || []).length) return [];

    const expensesByCategory = (transactions || [])
      .filter((t) => t.type === 'EXPENSE' && t.category_id)
      .reduce(
        (acc, t) => {
          const category = categoriesMap[t.category_id || ''];
          const categoryName = category?.name || 'Без категории';
          acc[categoryName] = (acc[categoryName] || 0) + Number(t.amount);
          return acc;
        },
        {} as Record<string, number>
      );

    const colors = [
      'hsl(var(--accent))',
      'hsl(var(--primary))',
      'hsl(var(--warning))',
      'hsl(var(--destructive))',
      'hsl(var(--muted))',
    ];

    return Object.entries(expensesByCategory)
      .map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length],
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [transactions || [], categoriesMap]);

  const recentTransactions = useMemo(() => {
    if (!(transactions || []).length) return [];
    return (transactions || []).slice(0, 4);
  }, [transactions || []]);

  const handleExport = () => {
    if (!(transactions || []).length) return;

    const csv = [
      ['Дата', 'Описание', 'Категория', 'Тип', 'Сумма'].join(','),
      ...(transactions || []).map((t) => {
        const category = t.category_id ? categoriesMap[t.category_id] : null;
        const typeLabel =
          t.type === 'INCOME'
            ? 'Доход'
            : t.type === 'EXPENSE'
              ? 'Расход'
              : 'Перевод';
        return [
          format(new Date(t.date), 'dd.MM.yyyy'),
          t.description || '-',
          category?.name || '-',
          typeLabel,
          t.amount,
        ].join(',');
      }),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `финансы_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();

    toast({
      title: 'Экспорт завершён',
      description: 'Данные успешно экспортированы',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Дашборд</h1>
        <p className="text-muted-foreground">Обзор ваших финансов</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Общий баланс"
          value={`₽ ${stats.totalBalance.toLocaleString()}`}
          change={`на ${activeAccounts.length} счетах`}
          changeType="neutral"
          icon={Wallet}
          iconColor="text-primary"
        />
        <StatsCard
          title="Доходы"
          value={`₽ ${stats.totalIncome.toLocaleString()}`}
          change={`за период`}
          changeType="positive"
          icon={TrendingUp}
          iconColor="text-success"
        />
        <StatsCard
          title="Расходы"
          value={`₽ ${stats.totalExpenses.toLocaleString()}`}
          change={`за период`}
          changeType="negative"
          icon={TrendingDown}
          iconColor="text-destructive"
        />
        <StatsCard
          title="Остаток"
          value={`₽ ${stats.savings.toLocaleString()}`}
          change={`${stats.totalIncome > 0 ? ((stats.savings / stats.totalIncome) * 100).toFixed(1) : 0}% от дохода`}
          changeType={stats.savings >= 0 ? 'positive' : 'negative'}
          icon={DollarSign}
          iconColor="text-accent"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Кэш-флоу"
          action={
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Экспорт
            </Button>
          }
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={cashFlowData}>
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
                tickFormatter={(value) => `₽${value / 1000}k`}
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
                dataKey="income"
                stroke="hsl(var(--success))"
                strokeWidth={2}
                name="Доходы"
                dot={{ fill: 'hsl(var(--success))' }}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                name="Расходы"
                dot={{ fill: 'hsl(var(--destructive))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Расходы по категориям">
          <ResponsiveContainer width="100%" height={300}>
            {categoryData.length > 0 ? (
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => {
                    const shortName =
                      name.length > 10 ? name.slice(0, 10) + '…' : name;
                    return `${shortName} ${(percent * 100).toFixed(0)}%`;
                  }}
                  outerRadius={100}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
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
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Нет данных за выбранный период
              </div>
            )}
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Динамика баланса">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={cashFlowData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="month"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => `₽${value / 1000}k`}
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
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Последние транзакции</h3>
          <div className="space-y-4">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-lg p-2 ${
                        transaction.type === 'INCOME'
                          ? 'bg-success/10'
                          : 'bg-destructive/10'
                      }`}
                    >
                      {transaction.type === 'INCOME' ? (
                        <ArrowUpRight className="h-4 w-4 text-success" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {transaction.description ||
                          transaction.counterparty ||
                          'Без описания'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {categoriesMap[transaction.category_id || '']?.name ||
                          'Без категории'}{' '}
                        •{' '}
                        {format(new Date(transaction.date), 'dd MMM', {
                          locale: ru,
                        })}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`font-semibold ${
                      transaction.type === 'INCOME'
                        ? 'text-success'
                        : 'text-destructive'
                    }`}
                  >
                    {transaction.type === 'INCOME' ? '+' : '-'}₽
                    {Number(transaction.amount).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Нет транзакций за выбранный период
              </p>
            )}
          </div>
          <Button
            variant="outline"
            className="mt-4 w-full"
            onClick={() => navigate('/transactions')}
          >
            Показать все
          </Button>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Бюджеты</h3>
          <div className="space-y-4">
            {budgets && budgets.filter((b) => b.is_active).length > 0 ? (
              budgets
                .filter((b) => b.is_active)
                .slice(0, 3)
                .map((budget) => {
                  const percentage =
                    (Number(budget.spent) / Number(budget.amount)) * 100;
                  const isOverBudget = percentage > 100;

                  return (
                    <div key={budget.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{budget.name}</span>
                        <span className="text-sm text-muted-foreground">
                          ₽{Number(budget.spent).toLocaleString()} / ₽
                          {Number(budget.amount).toLocaleString()}
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className={`h-full rounded-full ${
                            isOverBudget ? 'bg-destructive' : 'bg-success'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
            ) : (
              <p className="text-center text-muted-foreground py-4">
                У вас пока нет бюджетов
              </p>
            )}
          </div>
          <Button
            variant="outline"
            className="mt-4 w-full"
            onClick={() => navigate('/budgets')}
          >
            Управление бюджетами
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
