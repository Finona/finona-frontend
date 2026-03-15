import { apiClient } from './api-client';
import type {
  Account,
  AccountCreate,
  AccountUpdate,
  Transaction,
  TransactionCreate,
  TransactionUpdate,
  Category,
  CategoryCreate,
  CategoryUpdate,
  Budget,
  BudgetCreate,
  BudgetUpdate,
  Profile,
  UserSettings,
  UserSettingsUpdate,
  Notification,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  AdminUser,
  AdminUserListResponse,
  DashboardSummary,
  EnrichedTransactionsResponse,
  AccountsWithStatsResponse,
  CategoriesWithStatsResponse,
  EnrichedBudgetsResponse,
  ReportsAnalyticsResponse,
} from './api-types';

export const authService = {
  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>('/auth/login', data),

  register: (data: RegisterRequest) =>
    apiClient.post<AuthResponse>('/auth/register', data),

  logout: () => apiClient.post('/auth/logout'),

  me: () => apiClient.get<User>('/auth/me'),
};

export const accountsService = {
  getAll: () => apiClient.get<Account[]>('/accounts'),

  getById: (id: string) => apiClient.get<Account>(`/accounts/${id}`),

  create: (data: AccountCreate) => apiClient.post<Account>('/accounts', data),

  update: (id: string, data: AccountUpdate) =>
    apiClient.patch<Account>(`/accounts/${id}`, data),

  delete: (id: string) => apiClient.delete<void>(`/accounts/${id}`),
};

export const transactionsService = {
  getAll: (params?: { start_date?: string; end_date?: string }) => {
    const query = new URLSearchParams();
    if (params?.start_date) query.set('start_date', params.start_date);
    if (params?.end_date) query.set('end_date', params.end_date);
    const queryString = query.toString();
    return apiClient.get<Transaction[]>(
      `/transactions${queryString ? `?${queryString}` : ''}`
    );
  },

  getById: (id: string) => apiClient.get<Transaction>(`/transactions/${id}`),

  create: (data: TransactionCreate) =>
    apiClient.post<Transaction>('/transactions', data),

  update: (id: string, data: TransactionUpdate) =>
    apiClient.patch<Transaction>(`/transactions/${id}`, data),

  delete: (id: string) => apiClient.delete<void>(`/transactions/${id}`),
};

export const categoriesService = {
  getAll: () => apiClient.get<Category[]>('/categories'),

  getById: (id: string) => apiClient.get<Category>(`/categories/${id}`),

  create: (data: CategoryCreate) =>
    apiClient.post<Category>('/categories', data),

  update: (id: string, data: CategoryUpdate) =>
    apiClient.patch<Category>(`/categories/${id}`, data),

  delete: (id: string) => apiClient.delete<void>(`/categories/${id}`),
};

export const budgetsService = {
  getAll: () => apiClient.get<Budget[]>('/budgets'),

  getById: (id: string) => apiClient.get<Budget>(`/budgets/${id}`),

  create: (data: BudgetCreate) => apiClient.post<Budget>('/budgets', data),

  update: (id: string, data: BudgetUpdate) =>
    apiClient.patch<Budget>(`/budgets/${id}`, data),

  delete: (id: string) => apiClient.delete<void>(`/budgets/${id}`),
};

export const profilesService = {
  get: () => apiClient.get<Profile>('/profiles/me'),

  update: (data: Partial<Profile>) =>
    apiClient.patch<Profile>('/profiles/me', data),

  getSettings: () => apiClient.get<UserSettings>('/profiles/settings'),

  updateSettings: (data: UserSettingsUpdate) =>
    apiClient.patch<UserSettings>('/profiles/settings', data),
};

export const notificationsService = {
  getAll: () => apiClient.get<Notification[]>('/notifications'),

  markAsRead: (id: string) =>
    apiClient.patch<Notification>(`/notifications/${id}`, { is_read: true }),

  delete: (id: string) => apiClient.delete<void>(`/notifications/${id}`),
};

export const dashboardService = {
  getSummary: () => apiClient.get<DashboardSummary>('/dashboard/summary'),
};

export const enrichedTransactionsService = {
  getAll: (params?: {
    search?: string;
    type?: 'expense' | 'income' | 'transfer';
    category_id?: string;
    page?: number;
    per_page?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.type) query.set('type', params.type);
    if (params?.category_id) query.set('category_id', params.category_id);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.per_page) query.set('per_page', params.per_page.toString());
    const queryString = query.toString();
    return apiClient.get<EnrichedTransactionsResponse>(
      `/transactions/enriched${queryString ? `?${queryString}` : ''}`
    );
  },
};

export const accountsWithStatsService = {
  get: () => apiClient.get<AccountsWithStatsResponse>('/accounts/with-stats'),
};

export const categoriesWithStatsService = {
  get: () =>
    apiClient.get<CategoriesWithStatsResponse>('/categories/with-stats'),
};

export const enrichedBudgetsService = {
  get: (period?: string) => {
    const query = period ? `?period=${period}` : '';
    return apiClient.get<EnrichedBudgetsResponse>(`/budgets/enriched${query}`);
  },
};

export const reportsService = {
  getAnalytics: (params?: { start_date?: string; end_date?: string }) => {
    const query = new URLSearchParams();
    if (params?.start_date) query.set('start_date', params.start_date);
    if (params?.end_date) query.set('end_date', params.end_date);
    const queryString = query.toString();
    return apiClient.get<ReportsAnalyticsResponse>(
      `/reports/analytics${queryString ? `?${queryString}` : ''}`
    );
  },
};

export const adminService = {
  getUsers: () => apiClient.get<AdminUserListResponse>('/admin/users'),

  deactivateUser: (userId: number) =>
    apiClient.patch<AdminUser>(`/admin/users/${userId}/deactivate`, {}),

  activateUser: (userId: number) =>
    apiClient.patch<AdminUser>(`/admin/users/${userId}/activate`, {}),
};

export const exportService = {
  csv: (type: 'transactions' | 'accounts' | 'categories' | 'budgets') =>
    apiClient.get<Blob>(`/export/csv?type=${type}`, {
      responseType: 'blob',
    } as any),

  json: () => apiClient.get<Blob>('/export/json', { responseType: 'blob' } as any),
};
