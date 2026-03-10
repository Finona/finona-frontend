import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Edit,
  Trash2,
  Tag,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { categoriesService } from '@/lib/api-services';
import type { Category, CategoryCreate, CategoryUpdate } from '@/lib/api-types';

const Categories = () => {
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [deleteCategory, setDeleteCategory] = useState<any>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.getAll(),
  });

  const stats = useMemo(() => {
    if (!categories) return { totalIncome: 0, totalExpenses: 0 };

    const totalIncome = categories
      .filter((c) => c.type.toUpperCase() === 'INCOME')
      .reduce((sum, cat) => sum + Number(cat.total_amount || 0), 0);

    const totalExpenses = categories
      .filter((c) => c.type.toUpperCase() === 'EXPENSE')
      .reduce((sum, cat) => sum + Number(cat.total_amount || 0), 0);

    return { totalIncome, totalExpenses };
  }, [categories]);

  const createCategoryMutation = useMutation({
    mutationFn: (data: CategoryCreate) => categoriesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsAddCategoryOpen(false);
      toast({
        title: 'Категория создана',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error.message,
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryUpdate }) =>
      categoriesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setEditingCategory(null);
      toast({
        title: 'Категория обновлена',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error.message,
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => categoriesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setDeleteCategory(null);
      toast({
        title: 'Категория удалена',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error.message,
      });
    },
  });

  const CategoryForm = ({ category, onSubmit, onClose }: any) => {
    const categoryType = category?.type
      ? (category.type.toUpperCase() as 'EXPENSE' | 'INCOME')
      : 'EXPENSE';

    const [formData, setFormData] = useState({
      name: category?.name || '',
      type: categoryType,
      icon: category?.icon || '',
      color: category?.color || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      if (!formData.name.trim()) {
        toast({
          variant: 'destructive',
          title: 'Ошибка',
          description: 'Укажите название категории',
        });
        return;
      }

      onSubmit(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Название *</Label>
          <Input
            id="name"
            placeholder="Например: Продукты"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Тип *</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value })}
          >
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EXPENSE">Расход</SelectItem>
              <SelectItem value="INCOME">Доход</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="icon">Иконка</Label>
            <Input
              id="icon"
              placeholder="🏪"
              value={formData.icon}
              onChange={(e) =>
                setFormData({ ...formData, icon: e.target.value })
              }
              maxLength={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Цвет</Label>
            <Input
              id="color"
              type="text"
              placeholder="#3b82f6"
              value={formData.color}
              onChange={(e) =>
                setFormData({ ...formData, color: e.target.value })
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button
            type="submit"
            disabled={
              createCategoryMutation.isPending ||
              updateCategoryMutation.isPending
            }
          >
            {category ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogFooter>
      </form>
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка категорий...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Категории</h1>
          <p className="text-muted-foreground">
            Всего: {categories?.length || 0} категорий
          </p>
        </div>
        <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Создать категорию
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Новая категория</DialogTitle>
              <DialogDescription>
                Создайте категорию для классификации транзакций
              </DialogDescription>
            </DialogHeader>
            <CategoryForm
              onSubmit={(data: any) => createCategoryMutation.mutate(data)}
              onClose={() => setIsAddCategoryOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Всего категорий
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {categories?.length || 0}
                </p>
              </div>
              <div className="rounded-lg bg-primary/10 p-3">
                <Tag className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Доходы за месяц
                </p>
                <p className="text-3xl font-bold text-success">
                  ₽ {stats.totalIncome.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg bg-success/10 p-3">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Расходы за месяц
                </p>
                <p className="text-3xl font-bold text-foreground">
                  ₽ {stats.totalExpenses.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg bg-destructive/10 p-3">
                <TrendingDown className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Все категории</CardTitle>
            </CardHeader>
            <CardContent>
              {categories && categories.length > 0 ? (
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between rounded-lg border border-border p-4 transition-all hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-4">
                        {category.icon && (
                          <span className="text-2xl">{category.icon}</span>
                        )}
                        <div>
                          <p className="font-semibold text-foreground">
                            {category.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {category.transactions_count} транзакций
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge
                          variant={
                            category.type.toUpperCase() === 'INCOME'
                              ? 'default'
                              : 'secondary'
                          }
                          className={
                            category.type.toUpperCase() === 'INCOME'
                              ? 'bg-success'
                              : 'bg-destructive'
                          }
                        >
                          {category.type.toUpperCase() === 'INCOME'
                            ? 'Доход'
                            : 'Расход'}
                        </Badge>
                        <p className="text-lg font-bold text-foreground">
                          ₽ {Number(category.total_amount).toLocaleString()}
                        </p>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingCategory(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteCategory(category)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Tag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Нет категорий</h3>
                  <p className="text-muted-foreground mb-4">
                    Создайте первую категорию для классификации транзакций
                  </p>
                  <Button onClick={() => setIsAddCategoryOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Создать категорию
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Топ категорий</CardTitle>
            </CardHeader>
            <CardContent>
              {categories && categories.length > 0 ? (
                <div className="space-y-4">
                  {categories
                    .filter((cat) => cat.type.toUpperCase() === 'EXPENSE')
                    .sort(
                      (a, b) => Number(b.total_amount) - Number(a.total_amount)
                    )
                    .slice(0, 5)
                    .map((category) => (
                      <div key={category.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {category.icon && <span>{category.icon}</span>}
                            <span className="text-sm font-medium">
                              {category.name}
                            </span>
                          </div>
                          <span className="text-sm font-semibold">
                            ₽ {Number(category.total_amount).toLocaleString()}
                          </span>
                        </div>
                        <Progress
                          value={
                            stats.totalExpenses > 0
                              ? (Number(category.total_amount) /
                                  stats.totalExpenses) *
                                100
                              : 0
                          }
                          className="h-2"
                        />
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Нет данных
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Диалог редактирования категории */}
      <Dialog
        open={!!editingCategory}
        onOpenChange={() => setEditingCategory(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Редактировать категорию</DialogTitle>
            <DialogDescription>Внесите изменения в категорию</DialogDescription>
          </DialogHeader>
          {editingCategory && (
            <CategoryForm
              category={editingCategory}
              onSubmit={(data: any) =>
                updateCategoryMutation.mutate({ id: editingCategory.id, data })
              }
              onClose={() => setEditingCategory(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Диалог удаления категории */}
      <AlertDialog
        open={!!deleteCategory}
        onOpenChange={() => setDeleteCategory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить категорию?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Все транзакции, связанные с этой
              категорией, останутся без категории.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteCategoryMutation.mutate(deleteCategory.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Categories;
