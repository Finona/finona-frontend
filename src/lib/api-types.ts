export interface Account {
	id: string;
	user_id: string;
	name: string;
	type: "CHECKING" | "SAVINGS" | "CREDIT" | "CASH" | "INVESTMENT";
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
	type: "EXPENSE" | "INCOME" | "TRANSFER";
	description: string | null;
	counterparty: string | null;
	date: string;
	status: "PENDING" | "COMPLETED" | "CANCELLED";
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
	type: "EXPENSE" | "INCOME";
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
	period: "MONTHLY" | "QUARTERLY" | "YEARLY";
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
	type: "INFO" | "WARNING" | "ERROR" | "SUCCESS";
	is_read: boolean;
	created_at: string;
	updated_at: string;
}

export interface AccountCreate {
	name: string;
	type: "CHECKING" | "SAVINGS" | "CREDIT" | "CASH" | "INVESTMENT";
	currency?: string;
	balance?: number;
	bank_name?: string;
	is_active?: boolean;
}

export interface AccountUpdate {
	name?: string;
	type?: "CHECKING" | "SAVINGS" | "CREDIT" | "CASH" | "INVESTMENT";
	currency?: string;
	balance?: number;
	bank_name?: string;
	is_active?: boolean;
}

export interface TransactionCreate {
	account_id: string;
	category_id?: string;
	amount: number;
	type: "EXPENSE" | "INCOME" | "TRANSFER";
	description?: string;
	counterparty?: string;
	date?: string;
	status?: "PENDING" | "COMPLETED" | "CANCELLED";
	tags?: string[];
	notes?: string;
}

export interface TransactionUpdate {
	account_id?: string;
	category_id?: string;
	amount?: number;
	type?: "EXPENSE" | "INCOME" | "TRANSFER";
	description?: string;
	counterparty?: string;
	date?: string;
	status?: "PENDING" | "COMPLETED" | "CANCELLED";
	tags?: string[];
	notes?: string;
}

export interface CategoryCreate {
	name: string;
	type: "EXPENSE" | "INCOME";
	parent_id?: string;
	icon?: string;
	color?: string;
}

export interface CategoryUpdate {
	name?: string;
	type?: "EXPENSE" | "INCOME";
	parent_id?: string;
	icon?: string;
	color?: string;
}

export interface BudgetCreate {
	category_id?: string;
	name: string;
	amount: number;
	period: "MONTHLY" | "QUARTERLY" | "YEARLY";
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
	period?: "MONTHLY" | "QUARTERLY" | "YEARLY";
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
