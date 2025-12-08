import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Filter, Plus, Download, ArrowUpRight, ArrowDownRight, Edit, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { transactionsService, accountsService, categoriesService } from "@/lib/api-services";
import type { Transaction, Account, Category } from "@/lib/api-types";

const Transactions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [deleteTransaction, setDeleteTransaction] = useState<any>(null);
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => transactionsService.getAll(),
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => accountsService.getAll(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesService.getAll(),
  });

  const transactionsWithData = useMemo(() => {
    return transactions.map((t) => ({
      ...t,
      account: accounts.find((a) => a.id === t.account_id),
      category: categories.find((c) => c.id === t.category_id),
    }));
  }, [transactions, accounts, categories]);

  const filteredTransactions = useMemo(() => {
    return transactionsWithData.filter((t) => {
      const matchesSearch =
        searchQuery === "" ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.counterparty?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category?.name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType =
        typeFilter === "all" || t.type.toLowerCase() === typeFilter;

      const matchesCategory =
        categoryFilter === "all" || t.category_id === categoryFilter;

      return matchesSearch && matchesType && matchesCategory;
    });
  }, [transactionsWithData, searchQuery, typeFilter, categoryFilter]);

  // Пагинация
  const paginatedTransactions = useMemo(() => {
    const start = page * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, page]);

  const createMutation = useMutation({
    mutationFn: (data: any) => transactionsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      setIsAddOpen(false);
      toast({
        title: "Транзакция создана",
        description: "Транзакция успешно добавлена",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => transactionsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setEditingTransaction(null);
      toast({
        title: "Транзакция обновлена",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => transactionsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      setDeleteTransaction(null);
      toast({
        title: "Транзакция удалена",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message,
      });
    },
  });

  // Экспорт в CSV
  const handleExport = () => {
    if (!filteredTransactions.length) {
      toast({
        variant: "destructive",
        title: "Нет данных",
        description: "Нет транзакций для экспорта",
      });
      return;
    }

    const csv = [
      ["Дата", "Описание", "Категория", "Счёт", "Тип", "Сумма"].join(","),
      ...filteredTransactions.map((t) =>
        [
          format(new Date(t.date), "dd.MM.yyyy"),
          t.description || t.counterparty || "-",
          t.category?.name || "-",
          t.account?.name || "-",
          t.type.toUpperCase() === "INCOME" ? "Доход" : "Расход",
          t.amount,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `транзакции_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();

    toast({
      title: "Экспорт завершён",
      description: `Экспортировано ${filteredTransactions.length} транзакций`,
    });
  };

  const TransactionForm = ({ transaction, onSubmit, onClose }: any) => {
    const [formData, setFormData] = useState({
      account_id: transaction?.account_id || "",
      category_id: transaction?.category_id || "",
      amount: transaction?.amount || "",
      type: transaction?.type?.toLowerCase() || "expense",
      description: transaction?.description || "",
      counterparty: transaction?.counterparty || "",
      date: transaction?.date ? format(new Date(transaction.date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
      notes: transaction?.notes || "",
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      if (!formData.account_id || !formData.amount) {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Заполните обязательные поля",
        });
        return;
      }

      onSubmit({
        ...formData,
        amount: Number(formData.amount),
        type: formData.type.toUpperCase(),
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="account">Счёт *</Label>
            <Select
              value={formData.account_id}
              onValueChange={(value) => setFormData({ ...formData, account_id: value })}
            >
              <SelectTrigger id="account">
                <SelectValue placeholder="Выберите счёт" />
              </SelectTrigger>
              <SelectContent>
                {accounts?.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                <SelectItem value="expense">Расход</SelectItem>
                <SelectItem value="income">Доход</SelectItem>
                <SelectItem value="transfer">Перевод</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Сумма *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Дата *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Категория</Label>
          <Select
            value={formData.category_id}
            onValueChange={(value) => setFormData({ ...formData, category_id: value })}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Выберите категорию" />
            </SelectTrigger>
            <SelectContent>
              {categories
                ?.filter((c) => c.type === formData.type)
                .map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Описание</Label>
          <Input
            id="description"
            placeholder="Например: Покупка в магазине"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="counterparty">Контрагент</Label>
          <Input
            id="counterparty"
            placeholder="Например: Перекрёсток"
            value={formData.counterparty}
            onChange={(e) => setFormData({ ...formData, counterparty: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Примечания</Label>
          <Textarea
            id="notes"
            placeholder="Дополнительные заметки"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {transaction ? "Сохранить" : "Создать"}
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
          <p className="text-muted-foreground">Загрузка транзакций...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Транзакции</h1>
          <p className="text-muted-foreground">
            Всего: {filteredTransactions.length} транзакций
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Экспорт
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Добавить
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Новая транзакция</DialogTitle>
                <DialogDescription>
                  Добавьте новую транзакцию в систему
                </DialogDescription>
              </DialogHeader>
              <TransactionForm
                onSubmit={(data: any) => createMutation.mutate(data)}
                onClose={() => setIsAddOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="p-6">
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск по описанию, контрагенту, категории..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={(value) => { setTypeFilter(value); setPage(0); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Тип" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все типы</SelectItem>
              <SelectItem value="income">Доходы</SelectItem>
              <SelectItem value="expense">Расходы</SelectItem>
              <SelectItem value="transfer">Переводы</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={(value) => { setCategoryFilter(value); setPage(0); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Категория" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все категории</SelectItem>
              {categories?.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(typeFilter !== "all" || categoryFilter !== "all" || searchQuery) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setTypeFilter("all");
                setCategoryFilter("all");
                setSearchQuery("");
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {paginatedTransactions.length > 0 ? (
          <>
            <div className="rounded-lg border border-border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Дата</TableHead>
                    <TableHead>Описание</TableHead>
                    <TableHead>Категория</TableHead>
                    <TableHead>Счёт</TableHead>
                    <TableHead className="text-right">Сумма</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {format(new Date(transaction.date), "dd MMM", { locale: ru })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className={`rounded-lg p-2 ${
                              transaction.type.toUpperCase() === "INCOME"
                                ? "bg-success/10"
                                : "bg-muted"
                            }`}
                          >
                            {transaction.type.toUpperCase() === "INCOME" ? (
                              <ArrowUpRight className="h-4 w-4 text-success" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {transaction.description || transaction.counterparty || "Без описания"}
                            </p>
                            {transaction.notes && (
                              <p className="text-xs text-muted-foreground">
                                {transaction.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {transaction.category?.name || "Без категории"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {transaction.account?.name || "-"}
                      </TableCell>
                      <TableCell
                        className={`text-right font-semibold whitespace-nowrap ${
                          transaction.type.toUpperCase() === "INCOME"
                            ? "text-success"
                            : "text-foreground"
                        }`}
                      >
                        {transaction.type.toUpperCase() === "INCOME" ? "+" : "-"}₽
                        {Number(transaction.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingTransaction(transaction)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTransaction(transaction)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <p>
                Показано {page * pageSize + 1}-
                {Math.min((page + 1) * pageSize, filteredTransactions.length)} из{" "}
                {filteredTransactions.length}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0}
                >
                  Назад
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={(page + 1) * pageSize >= filteredTransactions.length}
                >
                  Далее
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {transactions && transactions.length > 0
                ? "Нет транзакций по заданным фильтрам"
                : "У вас пока нет транзакций"}
            </p>
            <Button onClick={() => setIsAddOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Создать первую транзакцию
            </Button>
          </div>
        )}
      </Card>

      {/* Диалог редактирования */}
      <Dialog
        open={!!editingTransaction}
        onOpenChange={() => setEditingTransaction(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать транзакцию</DialogTitle>
            <DialogDescription>
              Внесите изменения в транзакцию
            </DialogDescription>
          </DialogHeader>
          {editingTransaction && (
            <TransactionForm
              transaction={editingTransaction}
              onSubmit={(data: any) =>
                updateMutation.mutate({ id: editingTransaction.id, data })
              }
              onClose={() => setEditingTransaction(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Диалог удаления */}
      <AlertDialog
        open={!!deleteTransaction}
        onOpenChange={() => setDeleteTransaction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить транзакцию?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Транзакция будет удалена навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(deleteTransaction.id)}
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

export default Transactions;