import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Wallet,
  CreditCard,
  Building2,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Edit,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { accountsService, transactionsService } from '@/lib/api-services';
import type {
  Account,
  Transaction,
  AccountCreate,
  AccountUpdate,
} from '@/lib/api-types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const accountTypeIcons = {
  checking: Building2,
  savings: Wallet,
  credit: CreditCard,
  cash: Wallet,
  investment: TrendingUp,
};

const accountTypeLabels = {
  checking: 'Расчётный',
  savings: 'Сберегательный',
  credit: 'Кредитный',
  cash: 'Наличные',
  investment: 'Инвестиционный',
};

const Accounts = () => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deleteAccount, setDeleteAccount] = useState<Account | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: accounts, isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountsService.getAll(),
  });

  const { data: recentTransactions } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: async () => {
      const transactions = await transactionsService.getAll();
      return transactions
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
    },
  });

  // Статистика
  const stats = useMemo(() => {
    if (!accounts) return { total: 0, active: 0, lastSync: null };

    const activeAccounts = accounts.filter((a) => a.is_active);
    const totalBalance = activeAccounts.reduce(
      (sum, acc) => sum + Number(acc.balance),
      0
    );
    const lastSync = activeAccounts
      .filter((a) => a.last_synced_at)
      .sort(
        (a, b) =>
          new Date(b.last_synced_at!).getTime() -
          new Date(a.last_synced_at!).getTime()
      )[0]?.last_synced_at;

    return {
      total: totalBalance,
      active: activeAccounts.length,
      lastSync,
    };
  }, [accounts]);

  const createMutation = useMutation({
    mutationFn: (data: AccountCreate) => accountsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setIsAddOpen(false);
      toast({
        title: 'Счёт создан',
        description: 'Счёт успешно добавлен',
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

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AccountUpdate }) =>
      accountsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setEditingAccount(null);
      toast({
        title: 'Счёт обновлён',
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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await accountsService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setDeleteAccount(null);
      toast({
        title: 'Счёт удалён',
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

  const AccountForm = ({
    account,
    onSubmit,
    onClose,
  }: {
    account?: Account;
    onSubmit: (data: AccountCreate | AccountUpdate) => void;
    onClose: () => void;
  }) => {
    const [formData, setFormData] = useState({
      name: account?.name || '',
      type: account?.type.toLowerCase() || 'checking',
      currency: account?.currency || 'RUB',
      balance: account?.balance || '0',
      bank_name: account?.bank_name || '',
      is_active: account?.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      if (!formData.name) {
        toast({
          variant: 'destructive',
          title: 'Ошибка',
          description: 'Укажите название счёта',
        });
        return;
      }

      const submitData: any = {
        name: formData.name,
        type: formData.type.toUpperCase() as
          | 'CHECKING'
          | 'SAVINGS'
          | 'CREDIT'
          | 'CASH'
          | 'INVESTMENT',
        currency: formData.currency,
        bank_name: formData.bank_name,
        is_active: formData.is_active,
      };
      if (!account) {
        submitData.balance = Number(formData.balance);
      }
      onSubmit(submitData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Название счёта *</Label>
          <Input
            id="name"
            placeholder="Например: T-Банк Расчётный счёт"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Тип счёта *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checking">Расчётный</SelectItem>
                <SelectItem value="savings">Сберегательный</SelectItem>
                <SelectItem value="credit">Кредитный</SelectItem>
                <SelectItem value="cash">Наличные</SelectItem>
                <SelectItem value="investment">Инвестиционный</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Валюта *</Label>
            <Select
              value={formData.currency}
              onValueChange={(value) =>
                setFormData({ ...formData, currency: value })
              }
            >
              <SelectTrigger id="currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RUB">RUB - Рубль</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {!account && (
          <div className="space-y-2">
            <Label htmlFor="balance">Начальный баланс</Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.balance}
              onChange={(e) =>
                setFormData({ ...formData, balance: e.target.value })
              }
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="bank_name">Банк</Label>
          <Input
            id="bank_name"
            placeholder="Например: Т-Банк"
            value={formData.bank_name}
            onChange={(e) =>
              setFormData({ ...formData, bank_name: e.target.value })
            }
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) =>
              setFormData({ ...formData, is_active: e.target.checked })
            }
            className="h-4 w-4"
          />
          <Label htmlFor="is_active" className="cursor-pointer">
            Активный счёт
          </Label>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {account ? 'Сохранить' : 'Создать'}
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
          <p className="text-muted-foreground">Загрузка счетов...</p>
        </div>
      </div>
    );
  }

  const activeAccounts = accounts?.filter((a) => a.is_active) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Счета</h1>
          <p className="text-muted-foreground">
            Всего: {accounts?.length || 0} счетов
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Добавить счёт
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Новый счёт</DialogTitle>
              <DialogDescription>
                Добавьте новый счёт для учёта финансов
              </DialogDescription>
            </DialogHeader>
            <AccountForm
              onSubmit={(data: any) => createMutation.mutate(data)}
              onClose={() => setIsAddOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gradient-primary">
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-primary-foreground/80">
                Общий баланс
              </p>
              <p className="text-3xl font-bold text-primary-foreground">
                ₽ {stats.total.toLocaleString()}
              </p>
              <p className="text-sm text-primary-foreground/90">
                на {activeAccounts.length} счетах
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Активных счетов
              </p>
              <p className="text-3xl font-bold text-foreground">
                {activeAccounts.length}
              </p>
              <p className="text-sm text-muted-foreground">
                из {accounts?.length || 0} всего
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Последняя синхронизация
              </p>
              {stats.lastSync ? (
                <>
                  <p className="text-3xl font-bold text-foreground">
                    {format(new Date(stats.lastSync), 'HH:mm')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(stats.lastSync), 'dd MMMM yyyy', {
                      locale: ru,
                    })}
                  </p>
                </>
              ) : (
                <p className="text-3xl font-bold text-foreground">—</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          {activeAccounts.length > 0 ? (
            activeAccounts.map((account) => {
              const typeKey =
                account.type.toLowerCase() as keyof typeof accountTypeIcons;
              const Icon = accountTypeIcons[typeKey];
              return (
                <Card
                  key={account.id}
                  className="transition-all hover:shadow-md"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="rounded-lg bg-primary/10 p-3 text-primary">
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-semibold text-foreground">
                            {account.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {accountTypeLabels[typeKey]}
                            </Badge>
                            {account.bank_name && (
                              <span className="text-xs text-muted-foreground">
                                {account.bank_name}
                              </span>
                            )}
                          </div>
                          {account.last_synced_at && (
                            <p className="text-xs text-muted-foreground">
                              Обновлено:{' '}
                              {format(
                                new Date(account.last_synced_at),
                                'dd MMM HH:mm',
                                { locale: ru }
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">
                          ₽ {Number(account.balance).toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {account.currency}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingAccount(account)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Редактировать
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteAccount(account)}
                      >
                        <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                        Удалить
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Нет счетов</h3>
                <p className="text-muted-foreground mb-4">
                  Создайте первый счёт для начала учёта финансов
                </p>
                <Button onClick={() => setIsAddOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Добавить счёт
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Последние операции</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions && recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-lg p-2 ${
                          transaction.type === 'income'
                            ? 'bg-success/10'
                            : 'bg-muted'
                        }`}
                      >
                        {transaction.type === 'income' ? (
                          <ArrowUpRight className="h-4 w-4 text-success" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {transaction.description ||
                            transaction.counterparty ||
                            'Без описания'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.account?.name} •{' '}
                          {format(new Date(transaction.date), 'dd MMM', {
                            locale: ru,
                          })}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`font-semibold ${
                        transaction.type === 'income'
                          ? 'text-success'
                          : 'text-foreground'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}₽
                      {Number(transaction.amount).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Нет недавних операций
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Диалог редактирования */}
      <Dialog
        open={!!editingAccount}
        onOpenChange={() => setEditingAccount(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Редактировать счёт</DialogTitle>
            <DialogDescription>Внесите изменения в счёт</DialogDescription>
          </DialogHeader>
          {editingAccount && (
            <AccountForm
              account={editingAccount}
              onSubmit={(data: any) =>
                updateMutation.mutate({ id: editingAccount.id, data })
              }
              onClose={() => setEditingAccount(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Диалог удаления */}
      <AlertDialog
        open={!!deleteAccount}
        onOpenChange={() => setDeleteAccount(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить счёт?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Все транзакции, связанные с этим
              счётом, также будут удалены.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(deleteAccount.id)}
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

export default Accounts;
