export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      accounts: {
        Row: {
          balance: number | null
          color: string | null
          created_at: string | null
          id: string
          name: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          balance?: number | null
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          balance?: number | null
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_view"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          created_at: string | null
          freelancer_id: string
          id: string
          job_id: string
          message: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          freelancer_id: string
          id?: string
          job_id: string
          message?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          freelancer_id?: string
          id?: string
          job_id?: string
          message?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_freelancer_id_fkey"
            columns: ["freelancer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string
          created_at: string | null
          icon: string | null
          id: string
          is_default: boolean | null
          name: string
          user_id: string | null
        }
        Insert: {
          color: string
          created_at?: string | null
          icon?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          user_id?: string | null
        }
        Update: {
          color?: string
          created_at?: string | null
          icon?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_view"
            referencedColumns: ["id"]
          },
        ]
      }
      check_ins: {
        Row: {
          check_in_time: string | null
          created_at: string | null
          group_id: string | null
          id: string
          status: string
          user_id: string | null
        }
        Insert: {
          check_in_time?: string | null
          created_at?: string | null
          group_id?: string | null
          id?: string
          status?: string
          user_id?: string | null
        }
        Update: {
          check_in_time?: string | null
          created_at?: string | null
          group_id?: string | null
          id?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "check_ins_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "check_ins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          contact: string
          created_at: string
          id: string
          name: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          contact: string
          created_at?: string
          id?: string
          name: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          contact?: string
          created_at?: string
          id?: string
          name?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_view"
            referencedColumns: ["id"]
          },
        ]
      }
      company_profiles: {
        Row: {
          address: string | null
          cnpj: string | null
          company_name: string
          company_size: string | null
          created_at: string | null
          id: string
          industry: string | null
          latitude: number | null
          longitude: number | null
          rating: number | null
          total_jobs_posted: number | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          cnpj?: string | null
          company_name: string
          company_size?: string | null
          created_at?: string | null
          id: string
          industry?: string | null
          latitude?: number | null
          longitude?: number | null
          rating?: number | null
          total_jobs_posted?: number | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          cnpj?: string | null
          company_name?: string
          company_size?: string | null
          created_at?: string | null
          id?: string
          industry?: string | null
          latitude?: number | null
          longitude?: number | null
          rating?: number | null
          total_jobs_posted?: number | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboards: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          imageurl: string
          isfavorite: boolean | null
          lastupdated: string | null
          title: string
          url: string | null
          views: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          imageurl: string
          isfavorite?: boolean | null
          lastupdated?: string | null
          title: string
          url?: string | null
          views?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          imageurl?: string
          isfavorite?: boolean | null
          lastupdated?: string | null
          title?: string
          url?: string | null
          views?: number | null
        }
        Relationships: []
      }
      freelancer_profiles: {
        Row: {
          availability: string | null
          created_at: string | null
          experience: string | null
          hourly_rate: number | null
          id: string
          latitude: number | null
          location: string | null
          longitude: number | null
          rating: number | null
          skills: string[] | null
          total_jobs_completed: number | null
          updated_at: string | null
        }
        Insert: {
          availability?: string | null
          created_at?: string | null
          experience?: string | null
          hourly_rate?: number | null
          id: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          rating?: number | null
          skills?: string[] | null
          total_jobs_completed?: number | null
          updated_at?: string | null
        }
        Update: {
          availability?: string | null
          created_at?: string | null
          experience?: string | null
          hourly_rate?: number | null
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          rating?: number | null
          skills?: string[] | null
          total_jobs_completed?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "freelancer_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          group_id: string
          joined_at: string | null
          role: string
          user_id: string
        }
        Insert: {
          group_id: string
          joined_at?: string | null
          role?: string
          user_id: string
        }
        Update: {
          group_id?: string
          joined_at?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string | null
          creator_id: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          creator_id: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          creator_id?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      installments: {
        Row: {
          amount: number
          created_at: string
          due_date: string
          id: string
          loan_id: string
          payment_date: string | null
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          due_date: string
          id?: string
          loan_id: string
          payment_date?: string | null
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string
          id?: string
          loan_id?: string
          payment_date?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "installments_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
        ]
      }
      job_categories: {
        Row: {
          created_at: string | null
          icon: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          icon: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          icon?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          address: string
          category: string
          company_id: string
          created_at: string | null
          date: string
          description: string
          duration: string
          end_time: string
          featured: boolean | null
          id: string
          latitude: number | null
          location: string
          longitude: number | null
          salary: number
          skills_required: string[] | null
          start_time: string
          status: string | null
          title: string
          updated_at: string | null
          urgent: boolean | null
        }
        Insert: {
          address: string
          category: string
          company_id: string
          created_at?: string | null
          date: string
          description: string
          duration: string
          end_time: string
          featured?: boolean | null
          id?: string
          latitude?: number | null
          location: string
          longitude?: number | null
          salary: number
          skills_required?: string[] | null
          start_time: string
          status?: string | null
          title: string
          updated_at?: string | null
          urgent?: boolean | null
        }
        Update: {
          address?: string
          category?: string
          company_id?: string
          created_at?: string | null
          date?: string
          description?: string
          duration?: string
          end_time?: string
          featured?: boolean | null
          id?: string
          latitude?: number | null
          location?: string
          longitude?: number | null
          salary?: number
          skills_required?: string[] | null
          start_time?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          urgent?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      loans: {
        Row: {
          amount: number
          client_id: string
          created_at: string
          id: string
          interest_rate: number
          status: string
          term: number
          updated_at: string
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string
          id?: string
          interest_rate: number
          status?: string
          term: number
          updated_at?: string
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string
          id?: string
          interest_rate?: number
          status?: string
          term?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loans_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          id: string
          installment_id: string
          payment_date: string
          payment_method: string
          transaction_id: string | null
        }
        Insert: {
          amount: number
          id?: string
          installment_id: string
          payment_date?: string
          payment_method: string
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          id?: string
          installment_id?: string
          payment_date?: string
          payment_method?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_installment_id_fkey"
            columns: ["installment_id"]
            isOneToOne: false
            referencedRelation: "installments"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos_logistica: {
        Row: {
          cidade_entrega: string | null
          cidade_origem: string | null
          codigo_base_entrega: string | null
          codigo_base_remetente: string | null
          codigo_regional_entrega: string | null
          codigo_regional_remetente: string | null
          codigo_sc_destino: string | null
          codigo_sc_origem: string | null
          data: string | null
          data_hora_coleta: string | null
          data_hora_expedicao_sc_destino: string | null
          estado_entrega: string | null
          estado_remetente: string | null
          horario_entrega: string | null
          horario_expedicao: string | null
          horario_expedicao_sc_origem: string | null
          horario_recebimento_base: string | null
          horario_recebimento_sc_destino: string | null
          horario_recebimento_sc_origem: string | null
          horario_saida_entrega: string | null
          id: number
          nome_base_remetente: string | null
          nome_cliente: string | null
          numero_pedido: string | null
          origem_pedido: string | null
          pdd_entrega: number | null
          pedidos: number | null
          regional_entrega: string | null
          regional_remetente: string | null
          sc_destino: string | null
          sc_origem: string | null
          shipping_time_total: unknown | null
          status_final: boolean | null
          tempo_coleta: unknown | null
          tempo_internalizacao_sc_origem: unknown | null
          tempo_processamento_base_entrega: unknown | null
          tempo_processamento_sc_destino: unknown | null
          tempo_processamento_sc_origem: unknown | null
          tempo_saida_entrega: unknown | null
          tempo_transito_sc_destino_base: unknown | null
          tempo_transito_sc_origem_destino: unknown | null
          tipo_produto: string | null
        }
        Insert: {
          cidade_entrega?: string | null
          cidade_origem?: string | null
          codigo_base_entrega?: string | null
          codigo_base_remetente?: string | null
          codigo_regional_entrega?: string | null
          codigo_regional_remetente?: string | null
          codigo_sc_destino?: string | null
          codigo_sc_origem?: string | null
          data?: string | null
          data_hora_coleta?: string | null
          data_hora_expedicao_sc_destino?: string | null
          estado_entrega?: string | null
          estado_remetente?: string | null
          horario_entrega?: string | null
          horario_expedicao?: string | null
          horario_expedicao_sc_origem?: string | null
          horario_recebimento_base?: string | null
          horario_recebimento_sc_destino?: string | null
          horario_recebimento_sc_origem?: string | null
          horario_saida_entrega?: string | null
          id?: number
          nome_base_remetente?: string | null
          nome_cliente?: string | null
          numero_pedido?: string | null
          origem_pedido?: string | null
          pdd_entrega?: number | null
          pedidos?: number | null
          regional_entrega?: string | null
          regional_remetente?: string | null
          sc_destino?: string | null
          sc_origem?: string | null
          shipping_time_total?: unknown | null
          status_final?: boolean | null
          tempo_coleta?: unknown | null
          tempo_internalizacao_sc_origem?: unknown | null
          tempo_processamento_base_entrega?: unknown | null
          tempo_processamento_sc_destino?: unknown | null
          tempo_processamento_sc_origem?: unknown | null
          tempo_saida_entrega?: unknown | null
          tempo_transito_sc_destino_base?: unknown | null
          tempo_transito_sc_origem_destino?: unknown | null
          tipo_produto?: string | null
        }
        Update: {
          cidade_entrega?: string | null
          cidade_origem?: string | null
          codigo_base_entrega?: string | null
          codigo_base_remetente?: string | null
          codigo_regional_entrega?: string | null
          codigo_regional_remetente?: string | null
          codigo_sc_destino?: string | null
          codigo_sc_origem?: string | null
          data?: string | null
          data_hora_coleta?: string | null
          data_hora_expedicao_sc_destino?: string | null
          estado_entrega?: string | null
          estado_remetente?: string | null
          horario_entrega?: string | null
          horario_expedicao?: string | null
          horario_expedicao_sc_origem?: string | null
          horario_recebimento_base?: string | null
          horario_recebimento_sc_destino?: string | null
          horario_recebimento_sc_origem?: string | null
          horario_saida_entrega?: string | null
          id?: number
          nome_base_remetente?: string | null
          nome_cliente?: string | null
          numero_pedido?: string | null
          origem_pedido?: string | null
          pdd_entrega?: number | null
          pedidos?: number | null
          regional_entrega?: string | null
          regional_remetente?: string | null
          sc_destino?: string | null
          sc_origem?: string | null
          shipping_time_total?: unknown | null
          status_final?: boolean | null
          tempo_coleta?: unknown | null
          tempo_internalizacao_sc_origem?: unknown | null
          tempo_processamento_base_entrega?: unknown | null
          tempo_processamento_sc_destino?: unknown | null
          tempo_processamento_sc_origem?: unknown | null
          tempo_saida_entrega?: unknown | null
          tempo_transito_sc_destino_base?: unknown | null
          tempo_transito_sc_origem_destino?: unknown | null
          tipo_produto?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          current_streak: number | null
          id: string
          longest_streak: number | null
          name: string
          role: string | null
          total_check_ins: number | null
          updated_at: string | null
          user_type: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          current_streak?: number | null
          id: string
          longest_streak?: number | null
          name: string
          role?: string | null
          total_check_ins?: number | null
          updated_at?: string | null
          user_type?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          current_streak?: number | null
          id?: string
          longest_streak?: number | null
          name?: string
          role?: string | null
          total_check_ins?: number | null
          updated_at?: string | null
          user_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users_view"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          admin_id: string
          created_at: string
          description: string
          id: string
          payment_link: string
          status: string
          title: string
          user_id: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          description: string
          id?: string
          payment_link: string
          status?: string
          title: string
          user_id: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          description?: string
          id?: string
          payment_link?: string
          status?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposals_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "users_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_view"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_transactions: {
        Row: {
          account_id: string
          amount: number
          category: string
          created_at: string | null
          current_installment: number | null
          description: string
          end_date: string | null
          frequency: string
          id: string
          next_due_date: string
          payment_status: string | null
          start_date: string
          status: string | null
          total_installments: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_id: string
          amount: number
          category: string
          created_at?: string | null
          current_installment?: number | null
          description: string
          end_date?: string | null
          frequency: string
          id?: string
          next_due_date: string
          payment_status?: string | null
          start_date: string
          status?: string | null
          total_installments?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_id?: string
          amount?: number
          category?: string
          created_at?: string | null
          current_installment?: number | null
          description?: string
          end_date?: string | null
          frequency?: string
          id?: string
          next_due_date?: string
          payment_status?: string | null
          start_date?: string
          status?: string | null
          total_installments?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_view"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          job_id: string
          rating: number
          recipient_id: string
          reviewer_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          job_id: string
          rating: number
          recipient_id: string
          reviewer_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          job_id?: string
          rating?: number
          recipient_id?: string
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          category: string | null
          created_at: string | null
          date: string
          description: string
          id: string
          installment_current: number | null
          installment_total: number | null
          is_recurring: boolean | null
          recurring_period: string | null
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string | null
          date?: string
          description: string
          id?: string
          installment_current?: number | null
          installment_total?: number | null
          is_recurring?: boolean | null
          recurring_period?: string | null
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string | null
          date?: string
          description?: string
          id?: string
          installment_current?: number | null
          installment_total?: number | null
          is_recurring?: boolean | null
          recurring_period?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_view"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      users_view: {
        Row: {
          email: string | null
          id: string | null
        }
        Insert: {
          email?: string | null
          id?: string | null
        }
        Update: {
          email?: string | null
          id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      nearby_jobs: {
        Args: {
          lat: number
          lng: number
          distance_km?: number
        }
        Returns: {
          address: string
          category: string
          company_id: string
          created_at: string | null
          date: string
          description: string
          duration: string
          end_time: string
          featured: boolean | null
          id: string
          latitude: number | null
          location: string
          longitude: number | null
          salary: number
          skills_required: string[] | null
          start_time: string
          status: string | null
          title: string
          updated_at: string | null
          urgent: boolean | null
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
