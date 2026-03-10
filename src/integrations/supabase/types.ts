export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '13.0.5';
  };
  public: {
    Tables: {
      accounts: {
        Row: {
          balance: number | null;
          bank_name: string | null;
          created_at: string | null;
          currency: string | null;
          id: string;
          is_active: boolean | null;
          last_synced_at: string | null;
          name: string;
          type: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          balance?: number | null;
          bank_name?: string | null;
          created_at?: string | null;
          currency?: string | null;
          id?: string;
          is_active?: boolean | null;
          last_synced_at?: string | null;
          name: string;
          type: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          balance?: number | null;
          bank_name?: string | null;
          created_at?: string | null;
          currency?: string | null;
          id?: string;
          is_active?: boolean | null;
          last_synced_at?: string | null;
          name?: string;
          type?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      budgets: {
        Row: {
          alert_threshold: number | null;
          amount: number;
          category_id: string | null;
          created_at: string | null;
          end_date: string;
          id: string;
          is_active: boolean | null;
          name: string;
          period: string;
          spent: number | null;
          start_date: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          alert_threshold?: number | null;
          amount: number;
          category_id?: string | null;
          created_at?: string | null;
          end_date: string;
          id?: string;
          is_active?: boolean | null;
          name: string;
          period: string;
          spent?: number | null;
          start_date: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          alert_threshold?: number | null;
          amount?: number;
          category_id?: string | null;
          created_at?: string | null;
          end_date?: string;
          id?: string;
          is_active?: boolean | null;
          name?: string;
          period?: string;
          spent?: number | null;
          start_date?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'budgets_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
        ];
      };
      categories: {
        Row: {
          color: string | null;
          created_at: string | null;
          icon: string | null;
          id: string;
          is_system: boolean | null;
          name: string;
          parent_id: string | null;
          type: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          color?: string | null;
          created_at?: string | null;
          icon?: string | null;
          id?: string;
          is_system?: boolean | null;
          name: string;
          parent_id?: string | null;
          type: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          color?: string | null;
          created_at?: string | null;
          icon?: string | null;
          id?: string;
          is_system?: boolean | null;
          name?: string;
          parent_id?: string | null;
          type?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'categories_parent_id_fkey';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
        ];
      };
      categorization_rules: {
        Row: {
          category_id: string;
          condition_type: string;
          condition_value: string;
          created_at: string | null;
          id: string;
          is_active: boolean | null;
          priority: number | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          category_id: string;
          condition_type: string;
          condition_value: string;
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          priority?: number | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          category_id?: string;
          condition_type?: string;
          condition_value?: string;
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          priority?: number | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'categorization_rules_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
        ];
      };
      financial_goals: {
        Row: {
          created_at: string | null;
          current_amount: number | null;
          deadline: string;
          icon: string | null;
          id: string;
          is_completed: boolean | null;
          name: string;
          target_amount: number;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          current_amount?: number | null;
          deadline: string;
          icon?: string | null;
          id?: string;
          is_completed?: boolean | null;
          name: string;
          target_amount: number;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          current_amount?: number | null;
          deadline?: string;
          icon?: string | null;
          id?: string;
          is_completed?: boolean | null;
          name?: string;
          target_amount?: number;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          created_at: string | null;
          id: string;
          is_read: boolean | null;
          message: string;
          title: string;
          type: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          is_read?: boolean | null;
          message: string;
          title: string;
          type?: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          is_read?: boolean | null;
          message?: string;
          title?: string;
          type?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string | null;
          default_currency: string | null;
          full_name: string | null;
          id: string;
          timezone: string | null;
          updated_at: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string | null;
          default_currency?: string | null;
          full_name?: string | null;
          id: string;
          timezone?: string | null;
          updated_at?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string | null;
          default_currency?: string | null;
          full_name?: string | null;
          id?: string;
          timezone?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          account_id: string;
          amount: number;
          category_id: string | null;
          counterparty: string | null;
          created_at: string | null;
          date: string;
          description: string | null;
          id: string;
          notes: string | null;
          status: string | null;
          tags: string[] | null;
          type: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          account_id: string;
          amount: number;
          category_id?: string | null;
          counterparty?: string | null;
          created_at?: string | null;
          date?: string;
          description?: string | null;
          id?: string;
          notes?: string | null;
          status?: string | null;
          tags?: string[] | null;
          type: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          account_id?: string;
          amount?: number;
          category_id?: string | null;
          counterparty?: string | null;
          created_at?: string | null;
          date?: string;
          description?: string | null;
          id?: string;
          notes?: string | null;
          status?: string | null;
          tags?: string[] | null;
          type?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'transactions_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
        ];
      };
      user_settings: {
        Row: {
          budget_alerts: boolean | null;
          created_at: string | null;
          email_notifications: boolean | null;
          id: string;
          language: string | null;
          push_notifications: boolean | null;
          transaction_alerts: boolean | null;
          updated_at: string | null;
          user_id: string;
          weekly_reports: boolean | null;
        };
        Insert: {
          budget_alerts?: boolean | null;
          created_at?: string | null;
          email_notifications?: boolean | null;
          id?: string;
          language?: string | null;
          push_notifications?: boolean | null;
          transaction_alerts?: boolean | null;
          updated_at?: string | null;
          user_id: string;
          weekly_reports?: boolean | null;
        };
        Update: {
          budget_alerts?: boolean | null;
          created_at?: string | null;
          email_notifications?: boolean | null;
          id?: string;
          language?: string | null;
          push_notifications?: boolean | null;
          transaction_alerts?: boolean | null;
          updated_at?: string | null;
          user_id?: string;
          weekly_reports?: boolean | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
