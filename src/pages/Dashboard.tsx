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
  dashboardService,
  enrichedBudgetsService,
  exportService,
} from '@/lib/api-services';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const CHART_COLORS = [
  'hsl(var(--accent))',
  'hsl(var(--primary))',
  'hsl(var(--warning))',
  'hsl(var(--destructive))',
  'hsl(var(--muted))',
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: summary, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => dashboardService.getSummary(),
  });

  const { data: budgetsData } = useQuery({
    queryKey: ['budgets-enriched', 'current_month'],
    queryFn: () => enrichedBudgetsService.get('current_month'),
  });

  const cashFlowData =
    summary?.cash_flow.map((item) => ({
      month: format(new Date(item.month + '-01'), 'MMM', { locale: ru }),
      income: Number(item.income),
      expenses: Number(item.expense),
    })) || [];

  const categoryData =
    summary?.expenses_by_category.map((item, index) => ({
      name: item.name,
      value: Number(item.amount),
      color: item.color || CHART_COLORS[index % CHART_COLORS.length],
    })) || [];

  const handleExport = async () => {
    try {
      const blob = await exportService.csv('transactions');
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `финансы_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      link.click();
      toast({
        title: 'Экспорт завершён',
        description: 'Данные успешно экспортированы',
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
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  const totalBalance = Number(summary?.total_balance || 0);
  const totalIncome = Number(summary?.total_income || 0);
  const totalExpenses = Number(summary?.total_expenses || 0);
  const remaining = Number(summary?.remaining || 0);
  const activeAccountsCount = summary?.active_accounts_count || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Дашборд</h1>
        <p className="text-muted-foreground">Обзор ваших финансов</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Общий баланс"
          value={`₽ ${totalBalance.toLocaleString()}`}
          change={`на ${activeAccountsCount} счетах`}
          changeType="neutral"
          icon={Wallet}
          iconColor="text-primary"
        />
        <StatsCard
          title="Доходы"
          value={`₽ ${totalIncome.toLocaleString()}`}
          change={`за период`}
          changeType="positive"
          icon={TrendingUp}
          iconColor="text-success"
        />
        <StatsCard
          title="Расходы"
          value={`₽ ${totalExpenses.toLocaleString()}`}
          change={`за период`}
          changeType="negative"
          icon={TrendingDown}
          iconColor="text-destructive"
        />
        <StatsCard
          title="Остаток"
          value={`₽ ${remaining.toLocaleString()}`}
          change={`${totalIncome > 0 ? ((remaining / totalIncome) * 100).toFixed(1) : 0}% от дохода`}
          changeType={remaining >= 0 ? 'positive' : 'negative'}
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
            {summary?.expenses_by_category &&
            summary.expenses_by_category.length > 0 ? (
              summary.expenses_by_category.slice(0, 4).map((cat, index) => (
                <div
                  key={cat.category_id || index}
                  className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg p-2 bg-destructive/10">
                      <ArrowDownRight className="h-4 w-4 text-destructive" />
                    </div>
                    <div>
                      <p className="font-medium">{cat.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {cat.percentage.toFixed(1)}% от расходов
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-destructive">
                    -₽{Number(cat.amount).toLocaleString()}
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
            {budgetsData?.budgets && budgetsData.budgets.length > 0 ? (
              budgetsData.budgets.slice(0, 3).map((budget) => {
                const isOverBudget = budget.status === 'exceeded';
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
                        style={{
                          width: `${Math.min(budget.percentage, 100)}%`,
                        }}
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
