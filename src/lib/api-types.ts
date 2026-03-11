export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: 'CHECKING' | 'SAVINGS' | 'CREDIT' | 'CASH' | 'INVESTMENT';
  currency: string;
  balance: number;
  bank_name: string | null;
  last_synced_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string | null;
  amount: number;
  type: 'EXPENSE' | 'INCOME' | 'TRANSFER';
  description: string | null;
  counterparty: string | null;
  date: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  tags: string[] | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  account?: { name: string };
  category?: { name: string; type: string };
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: 'EXPENSE' | 'INCOME';
  parent_id: string | null;
  icon: string | null;
  color: string | null;
  is_system: boolean;
  created_at: string;
  updated_at: string;
  transactions_count: number;
  total_amount: number;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string | null;
  name: string;
  amount: number;
  spent: number;
  period: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  start_date: string;
  end_date: string;
  alert_threshold: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: { name: string };
}

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  default_currency: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id?: string;
  profile_id?: string;
  email_notifications?: boolean;
  push_notifications?: boolean;
  budget_alerts?: boolean;
  transaction_alerts?: boolean;
  weekly_reports?: boolean;
  language?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserSettingsUpdate {
  email_notifications?: boolean;
  push_notifications?: boolean;
  budget_alerts?: boolean;
  transaction_alerts?: boolean;
  weekly_reports?: boolean;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface AccountCreate {
  name: string;
  type: 'CHECKING' | 'SAVINGS' | 'CREDIT' | 'CASH' | 'INVESTMENT';
  currency?: string;
  balance?: number;
  bank_name?: string;
  is_active?: boolean;
}

export interface AccountUpdate {
  name?: string;
  type?: 'CHECKING' | 'SAVINGS' | 'CREDIT' | 'CASH' | 'INVESTMENT';
  currency?: string;
  balance?: number;
  bank_name?: string;
  is_active?: boolean;
}

export interface TransactionCreate {
  account_id: string;
  category_id?: string;
  amount: number;
  type: 'EXPENSE' | 'INCOME' | 'TRANSFER';
  description?: string;
  counterparty?: string;
  date?: string;
  status?: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  tags?: string[];
  notes?: string;
}

export interface TransactionUpdate {
  account_id?: string;
  category_id?: string;
  amount?: number;
  type?: 'EXPENSE' | 'INCOME' | 'TRANSFER';
  description?: string;
  counterparty?: string;
  date?: string;
  status?: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  tags?: string[];
  notes?: string;
}

export interface CategoryCreate {
  name: string;
  type: 'EXPENSE' | 'INCOME';
  parent_id?: string;
  icon?: string;
  color?: string;
}

export interface CategoryUpdate {
  name?: string;
  type?: 'EXPENSE' | 'INCOME';
  parent_id?: string;
  icon?: string;
  color?: string;
}

export interface BudgetCreate {
  category_id?: string;
  name: string;
  amount: number;
  period: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  start_date: string;
  end_date: string;
  alert_threshold?: number;
  is_active?: boolean;
}

export interface BudgetUpdate {
  category_id?: string;
  name?: string;
  amount?: number;
  spent?: number;
  period?: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  start_date?: string;
  end_date?: string;
  alert_threshold?: number;
  is_active?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  birth_date: string;
  region: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  phone_number: string | null;
  first_name: string | null;
  last_name: string | null;
  birth_date: string;
  created_at: string;
  region: string;
  profile_photo: string | null;
  is_active: boolean;
}

export interface CashFlowItem {
  month: string;
  income: string;
  expense: string;
}

export interface ExpenseByCategoryItem {
  category_id: string;
  name: string;
  color: string;
  amount: string;
  percentage: number;
}

export interface DashboardSummary {
  total_balance: string;
  total_income: string;
  total_expenses: string;
  remaining: string;
  active_accounts_count: number;
  cash_flow: CashFlowItem[];
  expenses_by_category: ExpenseByCategoryItem[];
}

export interface AccountBrief {
  id: string;
  name: string;
  currency: string;
}

export interface CategoryBrief {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
}

export interface EnrichedTransaction {
  id: string;
  amount: string;
  type: 'EXPENSE' | 'INCOME' | 'TRANSFER';
  description: string | null;
  date: string;
  account: AccountBrief | null;
  category: CategoryBrief | null;
  counterparty: string | null;
  notes: string | null;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
}

export interface EnrichedTransactionsResponse {
  items: EnrichedTransaction[];
  total: number;
  page: number;
  per_page: number;
}

export interface RecentTransaction {
  id: string;
  amount: string;
  type: 'EXPENSE' | 'INCOME' | 'TRANSFER';
  description: string | null;
  date: string;
}

export interface AccountsStatsInfo {
  total_balance: string;
  active_count: number;
  last_sync: string | null;
}

export interface AccountsWithStatsResponse {
  accounts: Account[];
  stats: AccountsStatsInfo;
  recent_transactions: RecentTransaction[];
}

export interface CategoryWithStats {
  id: string;
  name: string;
  type: 'EXPENSE' | 'INCOME';
  color: string | null;
  total_amount: string;
  transaction_count: number;
}

export interface CategoriesSummary {
  total_income: string;
  total_expenses: string;
  income_categories_count: number;
  expense_categories_count: number;
}

export interface CategoriesWithStatsResponse {
  categories: CategoryWithStats[];
  summary: CategoriesSummary;
}

export interface EnrichedBudget {
  id: string;
  name: string;
  amount: string;
  spent: string;
  remaining: string;
  percentage: number;
  status: 'normal' | 'warning' | 'exceeded';
  period: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  category: CategoryBrief | null;
}

export interface BudgetsSummary {
  total_budget: string;
  total_spent: string;
  exceeded_count: number;
}

export interface EnrichedBudgetsResponse {
  budgets: EnrichedBudget[];
  summary: BudgetsSummary;
}

export interface ReportsPeriod {
  start: string;
  end: string;
}

export interface ReportsStats {
  income: string;
  expenses: string;
  balance: string;
  avg_transaction: string;
  income_change_percent: number;
  expenses_change_percent: number;
}

export interface MonthlyDataItem {
  month: string;
  income: string;
  expense: string;
}

export interface TopCounterpartyItem {
  name: string;
  amount: string;
  count: number;
}

export interface ReportsAnalyticsResponse {
  period: ReportsPeriod;
  stats: ReportsStats;
  monthly_data: MonthlyDataItem[];
  expenses_by_category: ExpenseByCategoryItem[];
  top_counterparties: TopCounterpartyItem[];
}

export interface ExportJsonResponse {
  exported_at: string;
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
}
