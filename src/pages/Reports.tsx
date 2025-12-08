import { Download, Calendar, FileText, TrendingUp, PieChart as PieChartIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { transactionsService, categoriesService } from "@/lib/api-services";
import { useAuth } from "@/hooks/useAuth";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { format, startOfMonth, endOfMonth, subMonths, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from "date-fns";
import { ru } from "date-fns/locale";

const CHART_COLORS = [
  "hsl(var(--accent))",
  "hsl(var(--primary))",
  "hsl(var(--destructive))",
  "hsl(217, 91%, 60%)",
  "hsl(var(--success))",
  "hsl(var(--muted))",
  "hsl(280, 60%, 60%)",
  "hsl(30, 80%, 55%)",
];

const Reports = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState<string>("current-month");

  const { startDate, endDate, previousStartDate, previousEndDate } = useMemo(() => {
    const now = new Date();
    let start: Date, end: Date, prevStart: Date, prevEnd: Date;

    switch (selectedPeriod) {
      case "current-month":
        start = startOfMonth(now);
        end = endOfMonth(now);
        prevStart = startOfMonth(subMonths(now, 1));
        prevEnd = endOfMonth(subMonths(now, 1));
        break;
      case "previous-month":
        start = startOfMonth(subMonths(now, 1));
        end = endOfMonth(subMonths(now, 1));
        prevStart = startOfMonth(subMonths(now, 2));
        prevEnd = endOfMonth(subMonths(now, 2));
        break;
      case "quarter":
        start = startOfQuarter(now);
        end = endOfQuarter(now);
        prevStart = startOfQuarter(subMonths(now, 3));
        prevEnd = endOfQuarter(subMonths(now, 3));
        break;
      case "year":
        start = startOfYear(now);
        end = endOfYear(now);
        prevStart = startOfYear(subMonths(now, 12));
        prevEnd = endOfYear(subMonths(now, 12));
        break;
      default:
        start = startOfMonth(now);
        end = endOfMonth(now);
        prevStart = startOfMonth(subMonths(now, 1));
        prevEnd = endOfMonth(subMonths(now, 1));
    }

    return {
      startDate: start,
      endDate: end,
      previousStartDate: prevStart,
      previousEndDate: prevEnd,
    };
  }, [selectedPeriod]);

  const { data: allCategories = [] } = useQuery({
    queryKey: ["categories-report"],
    queryFn: () => categoriesService.getAll(),
    enabled: !!user,
  });

  const categoryMap = useMemo(() => {
    return Object.fromEntries(
      allCategories.map((cat) => [cat.id, cat])
    );
  }, [allCategories]);

  const { data: currentTransactions = [], isLoading } = useQuery({
    queryKey: ["transactions-report", startDate, endDate],
    queryFn: () => transactionsService.getAll({
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
    }),
    enabled: !!user,
  });

  const { data: previousTransactions = [] } = useQuery({
    queryKey: ["transactions-report-previous", previousStartDate, previousEndDate],
    queryFn: () => transactionsService.getAll({
      start_date: previousStartDate.toISOString(),
      end_date: previousEndDate.toISOString(),
    }),
    enabled: !!user,
  });

  const { data: last6MonthsTransactions = [] } = useQuery({
    queryKey: ["transactions-last-6-months"],
    queryFn: () => {
      const sixMonthsAgo = subMonths(new Date(), 6);
      return transactionsService.getAll({
        start_date: startOfMonth(sixMonthsAgo).toISOString(),
      });
    },
    enabled: !!user,
  });

  const stats = useMemo(() => {
    const income = currentTransactions
      .filter((t) => t.type.toUpperCase() === "INCOME")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenses = currentTransactions
      .filter((t) => t.type.toUpperCase() === "EXPENSE")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const profit = income - expenses;
    const profitMargin = income > 0 ? (profit / income) * 100 : 0;

    const prevIncome = previousTransactions
      .filter((t) => t.type.toUpperCase() === "INCOME")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const prevExpenses = previousTransactions
      .filter((t) => t.type.toUpperCase() === "EXPENSE")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const prevProfit = prevIncome - prevExpenses;

    const incomeChange = prevIncome > 0 ? ((income - prevIncome) / prevIncome) * 100 : 0;
    const expensesChange = prevExpenses > 0 ? ((expenses - prevExpenses) / prevExpenses) * 100 : 0;
    const profitChange = prevProfit !== 0 ? ((profit - prevProfit) / Math.abs(prevProfit)) * 100 : 0;

    return {
      income,
      expenses,
      profit,
      profitMargin,
      incomeChange,
      expensesChange,
      profitChange,
    };
  }, [currentTransactions, previousTransactions]);

  const monthlyData = useMemo(() => {
    const monthsMap = new Map<string, { income: number; expenses: number }>();

    last6MonthsTransactions.forEach((transaction) => {
      const monthKey = format(new Date(transaction.date), "MMM", { locale: ru });
      const current = monthsMap.get(monthKey) || { income: 0, expenses: 0 };

      if (transaction.type.toUpperCase() === "INCOME") {
        current.income += Number(transaction.amount);
      } else if (transaction.type.toUpperCase() === "EXPENSE") {
        current.expenses += Number(transaction.amount);
      }

      monthsMap.set(monthKey, current);
    });

    return Array.from(monthsMap.entries()).map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses,
      profit: data.income - data.expenses,
    }));
  }, [last6MonthsTransactions]);

  const categoryExpenses = useMemo(() => {
    const categoriesMap = new Map<string, { name: string; value: number; icon?: string }>();

    currentTransactions
      .filter((t) => t.type.toUpperCase() === "EXPENSE")
      .forEach((transaction) => {
        const category = transaction.category_id ? categoryMap[transaction.category_id] : null;
        const categoryName = category?.name || "Без категории";
        const current = categoriesMap.get(categoryName) || {
          name: categoryName,
          value: 0,
          icon: category?.icon
        };
        current.value += Number(transaction.amount);
        categoriesMap.set(categoryName, current);
      });

    return Array.from(categoriesMap.values())
      .sort((a, b) => b.value - a.value)
      .map((item, index) => ({
        ...item,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }));
  }, [currentTransactions, categoryMap]);

  const topCounterparties = useMemo(() => {
    const counterpartiesMap = new Map<string, { amount: number; transactions: number }>();

    currentTransactions.forEach((transaction) => {
      if (transaction.counterparty) {
        const current = counterpartiesMap.get(transaction.counterparty) || {
          amount: 0,
          transactions: 0,
        };
        current.amount += Number(transaction.amount);
        current.transactions += 1;
        counterpartiesMap.set(transaction.counterparty, current);
      }
    });

    return Array.from(counterpartiesMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [currentTransactions]);

  const handleExport = (reportType: string) => {
    let csvContent = "";
    let filename = "";

    switch (reportType) {
      case "pl":
        csvContent = "Месяц,Доходы,Расходы,Остаток\n";
        monthlyData.forEach((row) => {
          csvContent += `${row.month},${row.income},${row.expenses},${row.profit}\n`;
        });
        filename = "profit-loss-report.csv";
        break;
      
      case "categories":
        csvContent = "Категория,Сумма\n";
        categoryExpenses.forEach((cat) => {
          csvContent += `${cat.name},${cat.value}\n`;
        });
        filename = "category-expenses-report.csv";
        break;
      
      case "counterparties":
        csvContent = "Контрагент,Сумма,Количество операций\n";
        topCounterparties.forEach((cp) => {
          csvContent += `${cp.name},${cp.amount},${cp.transactions}\n`;
        });
        filename = "counterparties-report.csv";
        break;
      
      case "transactions":
        csvContent = "Дата,Тип,Сумма,Категория,Контрагент,Описание\n";
        currentTransactions.forEach((t) => {
          const category = t.category_id ? categoryMap[t.category_id] : null;
          const typeLabel = t.type.toUpperCase() === "INCOME" ? "Доход" : "Расход";
          csvContent += `${format(new Date(t.date), "dd.MM.yyyy")},${typeLabel},${t.amount},${category?.name || ""},${t.counterparty || ""},${t.description || ""}\n`;
        });
        filename = "transactions-report.csv";
        break;
      
      default:
        toast({ title: "Отчёт недоступен", variant: "destructive" });
        return;
    }

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();

    toast({ title: "Отчёт экспортирован", description: `Файл ${filename} загружен` });
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
          <Button onClick={() => handleExport("transactions")}>
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
                  ₽ {stats.income.toLocaleString()}
                </p>
                <p className={`text-xs ${stats.incomeChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {stats.incomeChange >= 0 ? '+' : ''}{stats.incomeChange.toFixed(1)}% к пред. периоду
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
                  ₽ {stats.expenses.toLocaleString()}
                </p>
                <p className={`text-xs ${stats.expensesChange <= 0 ? 'text-success' : 'text-destructive'}`}>
                  {stats.expensesChange >= 0 ? '+' : ''}{stats.expensesChange.toFixed(1)}% к пред. периоду
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
                <p className={`text-2xl font-bold ${stats.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                  ₽ {stats.profit.toLocaleString()}
                </p>
                <p className={`text-xs ${stats.profitChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {stats.profitChange >= 0 ? '+' : ''}{stats.profitChange.toFixed(1)}% к пред. периоду
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
                  {stats.profitMargin.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {stats.profitMargin > 20 ? 'Отличный' : stats.profitMargin > 10 ? 'Хороший' : 'Низкий'} показатель
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
                Нет данных за последние 6 месяцев
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
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
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
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
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
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
              Нет данных за последние 6 месяцев
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
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
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
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
                  dot={{ fill: "hsl(var(--primary))", r: 5 }}
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
              {topCounterparties.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Нет данных о контрагентах
                </div>
              ) : (
                topCounterparties.map((counterparty, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div>
                      <p className="font-semibold text-foreground">
                        {counterparty.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {counterparty.transactions} операций
                      </p>
                    </div>
                    <p className="text-lg font-bold text-foreground">
                      ₽ {counterparty.amount.toLocaleString()}
                    </p>
                  </div>
                ))
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
                { name: "Отчёт о доходах и убытках", icon: FileText, type: "pl" },
                { name: "Отчёт о движении денежных средств", icon: TrendingUp, type: "transactions" },
                { name: "Анализ расходов по категориям", icon: PieChartIcon, type: "categories" },
                { name: "Отчёт по контрагентам", icon: FileText, type: "counterparties" },
                { name: "Полный экспорт транзакций", icon: FileText, type: "transactions" },
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
