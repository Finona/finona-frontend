import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/lib/api-services';
import { Shield, UserX, UserCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';

const Admin = () => {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminService.getUsers(),
    enabled: user?.role === 'ADMIN',
  });

  const deactivate = useMutation({
    mutationFn: (userId: number) => adminService.deactivateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('Пользователь деактивирован');
    },
    onError: () => toast.error('Ошибка деактивации'),
  });

  const activate = useMutation({
    mutationFn: (userId: number) => adminService.activateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('Пользователь активирован');
    },
    onError: () => toast.error('Ошибка активации'),
  });

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  const users = data?.users ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Админ-панель</h1>
          <p className="text-muted-foreground">
            Управление пользователями ({data?.total ?? 0})
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left text-sm text-muted-foreground">
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Имя</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Роль</th>
              <th className="px-4 py-3 font-medium">Статус</th>
              <th className="px-4 py-3 font-medium">Регистрация</th>
              <th className="px-4 py-3 font-medium text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-sm">{u.id}</td>
                <td className="px-4 py-3 text-sm font-medium">
                  {u.first_name || u.username}
                  {u.last_name ? ` ${u.last_name}` : ''}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {u.email}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      u.role === 'ADMIN'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      u.is_active
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}
                  >
                    {u.is_active ? 'Активен' : 'Заблокирован'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {new Date(u.created_at).toLocaleDateString('ru-RU')}
                </td>
                <td className="px-4 py-3 text-right">
                  {u.id !== user?.id && (
                    <>
                      {u.is_active ? (
                        <button
                          onClick={() => deactivate.mutate(u.id)}
                          disabled={deactivate.isPending}
                          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <UserX className="h-3.5 w-3.5" />
                          Заблокировать
                        </button>
                      ) : (
                        <button
                          onClick={() => activate.mutate(u.id)}
                          disabled={activate.isPending}
                          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                          Разблокировать
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Admin;
