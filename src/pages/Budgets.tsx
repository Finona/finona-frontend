import { Plus, Target, AlertTriangle, CheckCircle2, TrendingUp, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from "date-fns";
import { ru } from "date-fns/locale";
import { budgetsService, categoriesService } from "@/lib/api-services";
import type { Budget, Category } from "@/lib/api-types";

interface BudgetFormData {
  name: string;
  category_id: string;
  amount: string;
  period: "MONTHLY" | "QUARTERLY" | "YEARLY";
  start_date: string;
  end_date: string;
  alert_threshold: string;
}

const BudgetForm = ({
  onSubmit,
  initialData,
  onClose
}: {
  onSubmit: (data: BudgetFormData) => void;
  initialData?: Partial<BudgetFormData>;
  onClose: () => void;
}) => {
  const [formData, setFormData] = useState<BudgetFormData>({
    name: initialData?.name || "",
    category_id: initialData?.category_id || "",
    amount: initialData?.amount || "",
    period: initialData?.period || "MONTHLY",
    start_date: initialData?.start_date || format(startOfMonth(new Date()), "yyyy-MM-dd"),
    end_date: initialData?.end_date || format(endOfMonth(new Date()), "yyyy-MM-dd"),
    alert_threshold: initialData?.alert_threshold || "80",
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const allCategories = await categoriesService.getAll();
      return allCategories.filter(cat => cat.type.toUpperCase() === "EXPENSE");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Название</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Категория</Label>
        <Select
          value={formData.category_id}
          onValueChange={(value) => setFormData({ ...formData, category_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите категорию" />
          </SelectTrigger>
          <SelectContent>
            {categories?.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Сумма бюджета</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="period">Период</Label>
        <Select
          value={formData.period}
          onValueChange={(value) => setFormData({ ...formData, period: value as "MONTHLY" | "QUARTERLY" | "YEARLY" })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MONTHLY">Ежемесячно</SelectItem>
            <SelectItem value="QUARTERLY">Ежеквартально</SelectItem>
            <SelectItem value="YEARLY">Ежегодно</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">Начало</Label>
          <Input
            id="start_date"
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_date">Конец</Label>
          <Input
            id="end_date"
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="alert_threshold">Порог предупреждения (%)</Label>
        <Input
          id="alert_threshold"
          type="number"
          min="0"
          max="100"
          value={formData.alert_threshold}
          onChange={(e) => setFormData({ ...formData, alert_threshold: e.target.value })}
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onClose}>
          Отмена
        </Button>
        <Button type="submit">
          {initialData ? "Обновить" : "Создать"}
        </Button>
      </div>
    </form>
  );
};

const Budgets = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPeriod, setSelectedPeriod] = useState(0);
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deletingBudget, setDeletingBudget] = useState<string | null>(null);

  const currentPeriodStart = useMemo(() => {
    const date = selectedPeriod >= 0
      ? subMonths(new Date(), selectedPeriod)
      : addMonths(new Date(), Math.abs(selectedPeriod));
    return startOfMonth(date);
  }, [selectedPeriod]);

  const currentPeriodEnd = useMemo(() => {
    const date = selectedPeriod >= 0
      ? subMonths(new Date(), selectedPeriod)
      : addMonths(new Date(), Math.abs(selectedPeriod));
    return endOfMonth(date);
  }, [selectedPeriod]);

  const { data: budgets = [], isLoading: budgetsLoading } = useQuery({
    queryKey: ["budgets", currentPeriodStart, currentPeriodEnd],
    queryFn: async () => {
      const allBudgets = await budgetsService.getAll();
      const periodStart = format(currentPeriodStart, "yyyy-MM-dd");
      const periodEnd = format(currentPeriodEnd, "yyyy-MM-dd");
      const filteredBudgets = allBudgets.filter(b =>
        b.is_active &&
        b.start_date <= periodEnd &&
        b.end_date >= periodStart
      );

      const categoryIds = [...new Set(filteredBudgets.map(b => b.category_id).filter(Boolean))];
      if (categoryIds.length > 0) {
        const categories = await Promise.all(
          categoryIds.map(id => categoriesService.getById(id as string))
        );
        const categoryMap = new Map(categories.map(cat => [cat.id, cat]));

        return filteredBudgets.map(b => ({
          ...b,
          category: b.category_id ? categoryMap.get(b.category_id) : undefined
        }));
      }

      return filteredBudgets;
    },
    enabled: !!user,
  });

  const budgetsWithStatus = useMemo(() => {
    return budgets.map(budget => ({
      ...budget,
      status: Number(budget.spent) > Number(budget.amount) ? "exceeded" : "good"
    }));
  }, [budgets]);

  const totalBudget = budgetsWithStatus.reduce((sum, b) => sum + Number(b.amount), 0);
  const totalSpent = budgetsWithStatus.reduce((sum, b) => sum + Number(b.spent), 0);
  const budgetsExceeded = budgetsWithStatus.filter((b) => b.status === "exceeded").length;

  const createBudgetMutation = useMutation({
    mutationFn: async (data: BudgetFormData) => {
      await budgetsService.create({
        name: data.name,
        category_id: data.category_id || undefined,
        amount: Number(data.amount),
        period: data.period,
        start_date: data.start_date,
        end_date: data.end_date,
        alert_threshold: Number(data.alert_threshold),
        is_active: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast({ title: "Бюджет создан" });
      setBudgetDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    },
  });

  const updateBudgetMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: BudgetFormData }) => {
      await budgetsService.update(id, {
        name: data.name,
        category_id: data.category_id || undefined,
        amount: Number(data.amount),
        period: data.period,
        start_date: data.start_date,
        end_date: data.end_date,
        alert_threshold: Number(data.alert_threshold),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast({ title: "Бюджет обновлен" });
      setEditingBudget(null);
    },
    onError: (error: any) => {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    },
  });

  const deleteBudgetMutation = useMutation({
    mutationFn: async (id: string) => {
      await budgetsService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast({ title: "Бюджет удален" });
      setDeletingBudget(null);
    },
    onError: (error: any) => {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    },
  });

  if (budgetsLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Бюджеты</h1>
          <p className="text-muted-foreground">Планирование и контроль расходов</p>
        </div>
        <div className="flex gap-2">
          <Select 
            value={selectedPeriod.toString()}
            onValueChange={(value) => setSelectedPeriod(Number(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 6 }, (_, i) => (
                <SelectItem key={`future-${6 - i}`} value={(-(6 - i)).toString()}>
                  {format(addMonths(new Date(), 6 - i), "LLLL yyyy", { locale: ru })}
                </SelectItem>
              ))}
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={`past-${i}`} value={i.toString()}>
                  {format(subMonths(new Date(), i), "LLLL yyyy", { locale: ru })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={budgetDialogOpen} onOpenChange={setBudgetDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Создать бюджет
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Новый бюджет</DialogTitle>
              </DialogHeader>
              <BudgetForm
                onSubmit={(data) => createBudgetMutation.mutate(data)}
                onClose={() => setBudgetDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Общий бюджет
                </p>
                <p className="text-2xl font-bold text-foreground">
                  ₽ {totalBudget.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg bg-primary/10 p-3">
                <Target className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Потрачено
                </p>
                <p className="text-2xl font-bold text-foreground">
                  ₽ {totalSpent.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Остаток
                </p>
                <p className="text-2xl font-bold text-success">
                  ₽ {(totalBudget - totalSpent).toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg bg-success/10 p-3">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Превышено
                </p>
                <p className="text-2xl font-bold text-destructive">
                  {budgetsExceeded}
                </p>
              </div>
              <div className="rounded-lg bg-destructive/10 p-3">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Бюджеты по категориям</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {budgetsWithStatus.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Нет бюджетов. Создайте свой первый бюджет!
                  </div>
                ) : (
                  budgetsWithStatus.map((budget) => {
                    const percentage = (budget.spent / Number(budget.amount)) * 100;
                    const isExceeded = budget.status === "exceeded";

                    return (
                      <div
                        key={budget.id}
                        className="space-y-3 rounded-lg border border-border p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">
                              {budget.category?.icon || "📊"}
                            </span>
                            <div>
                              <p className="font-semibold text-foreground">
                                {budget.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {budget.category?.name || "Без категории"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={isExceeded ? "destructive" : "secondary"}
                              className={isExceeded ? "" : "bg-success text-success-foreground"}
                            >
                              {isExceeded ? "Превышен" : "В пределах"}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingBudget(budget);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletingBudget(budget.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              ₽ {budget.spent.toLocaleString()} из ₽{" "}
                              {Number(budget.amount).toLocaleString()}
                            </span>
                            <span
                              className={`font-semibold ${
                                isExceeded ? "text-destructive" : "text-success"
                              }`}
                            >
                              {percentage.toFixed(0)}%
                            </span>
                          </div>
                          <Progress
                            value={Math.min(percentage, 100)}
                            className={`h-3 ${
                              isExceeded ? "[&>div]:bg-destructive" : "[&>div]:bg-success"
                            }`}
                          />
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              Осталось:{" "}
                              <span
                                className={`font-semibold ${
                                  isExceeded ? "text-destructive" : "text-success"
                                }`}
                              >
                                ₽{" "}
                                {isExceeded
                                  ? `-${Math.abs(Number(budget.amount) - budget.spent).toLocaleString()}`
                                  : (Number(budget.amount) - budget.spent).toLocaleString()}
                              </span>
                            </span>
                            <span className="text-muted-foreground">
                              {isExceeded ? "Перерасход" : `${(100 - percentage).toFixed(0)}%`}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Превышения</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {budgetsWithStatus.filter(b => b.status === "exceeded").map(budget => (
                  <div key={budget.id} className="rounded-lg bg-destructive/10 p-3">
                    <div className="flex gap-2">
                      <AlertTriangle className="h-5 w-5 flex-shrink-0 text-destructive" />
                      <div>
                        <p className="text-sm font-medium">
                          Превышение бюджета "{budget.name}"
                        </p>
                        <p className="text-xs text-muted-foreground">
                          -₽{Math.abs(Number(budget.amount) - budget.spent).toLocaleString()} за период
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {budgetsWithStatus.filter(b => b.status === "exceeded").length === 0 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    Нет рекомендаций
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Budget Dialog */}
      <Dialog open={!!editingBudget} onOpenChange={(open) => !open && setEditingBudget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать бюджет</DialogTitle>
          </DialogHeader>
          {editingBudget && (
            <BudgetForm
              initialData={{
                name: editingBudget.name,
                category_id: editingBudget.category_id,
                amount: editingBudget.amount.toString(),
                period: editingBudget.period,
                start_date: editingBudget.start_date,
                end_date: editingBudget.end_date,
                alert_threshold: editingBudget.alert_threshold.toString(),
              }}
              onSubmit={(data) => updateBudgetMutation.mutate({ id: editingBudget.id, data })}
              onClose={() => setEditingBudget(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Budget Dialog */}
      <AlertDialog open={!!deletingBudget} onOpenChange={(open) => !open && setDeletingBudget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить бюджет?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Бюджет будет удален навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingBudget && deleteBudgetMutation.mutate(deletingBudget)}
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default Budgets;
