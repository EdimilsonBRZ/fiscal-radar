export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      alertas: {
        Row: {
          created_at: string
          data_alerta: string
          documento_id: string | null
          empresa_id: string | null
          enviado: boolean
          escritorio_id: string
          id: string
          mensagem: string
          obrigacao_id: string | null
          tipo_alerta: string
        }
        Insert: {
          created_at?: string
          data_alerta: string
          documento_id?: string | null
          empresa_id?: string | null
          enviado?: boolean
          escritorio_id: string
          id?: string
          mensagem: string
          obrigacao_id?: string | null
          tipo_alerta: string
        }
        Update: {
          created_at?: string
          data_alerta?: string
          documento_id?: string | null
          empresa_id?: string | null
          enviado?: boolean
          escritorio_id?: string
          id?: string
          mensagem?: string
          obrigacao_id?: string | null
          tipo_alerta?: string
        }
        Relationships: [
          {
            foreignKeyName: "alertas_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "documentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alertas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alertas_escritorio_id_fkey"
            columns: ["escritorio_id"]
            isOneToOne: false
            referencedRelation: "escritorios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alertas_obrigacao_id_fkey"
            columns: ["obrigacao_id"]
            isOneToOne: false
            referencedRelation: "obrigacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes_alerta: {
        Row: {
          created_at: string
          dias_antes: number[]
          escritorio_id: string
          id: string
          modelos_email: Json
          repetir_vencido_dias: number
          tipos_documentos: string[]
          tipos_obrigacoes: string[]
        }
        Insert: {
          created_at?: string
          dias_antes?: number[]
          escritorio_id: string
          id?: string
          modelos_email?: Json
          repetir_vencido_dias?: number
          tipos_documentos?: string[]
          tipos_obrigacoes?: string[]
        }
        Update: {
          created_at?: string
          dias_antes?: number[]
          escritorio_id?: string
          id?: string
          modelos_email?: Json
          repetir_vencido_dias?: number
          tipos_documentos?: string[]
          tipos_obrigacoes?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "configuracoes_alerta_escritorio_id_fkey"
            columns: ["escritorio_id"]
            isOneToOne: true
            referencedRelation: "escritorios"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos: {
        Row: {
          arquivo_url: string | null
          created_at: string
          data_emissao: string | null
          data_vencimento: string
          empresa_id: string
          escritorio_id: string
          id: string
          numero_documento: string | null
          observacoes: string | null
          status: string
          tipo_documento: string
        }
        Insert: {
          arquivo_url?: string | null
          created_at?: string
          data_emissao?: string | null
          data_vencimento: string
          empresa_id: string
          escritorio_id: string
          id?: string
          numero_documento?: string | null
          observacoes?: string | null
          status?: string
          tipo_documento: string
        }
        Update: {
          arquivo_url?: string | null
          created_at?: string
          data_emissao?: string | null
          data_vencimento?: string
          empresa_id?: string
          escritorio_id?: string
          id?: string
          numero_documento?: string | null
          observacoes?: string | null
          status?: string
          tipo_documento?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_escritorio_id_fkey"
            columns: ["escritorio_id"]
            isOneToOne: false
            referencedRelation: "escritorios"
            referencedColumns: ["id"]
          },
        ]
      }
      emails_alerta: {
        Row: {
          created_at: string
          email: string
          empresa_id: string
          id: string
          principal: boolean
        }
        Insert: {
          created_at?: string
          email: string
          empresa_id: string
          id?: string
          principal?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          empresa_id?: string
          id?: string
          principal?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "emails_alerta_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      empresa_usuarios: {
        Row: {
          created_at: string
          empresa_id: string
          id: string
          usuario_id: string
        }
        Insert: {
          created_at?: string
          empresa_id: string
          id?: string
          usuario_id: string
        }
        Update: {
          created_at?: string
          empresa_id?: string
          id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "empresa_usuarios_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "empresa_usuarios_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          cnpj: string
          created_at: string
          email_cliente: string | null
          escritorio_id: string
          grupo_empresarial_id: string | null
          id: string
          inscricao_estadual: string | null
          inscricao_municipal: string | null
          matriz_id: string | null
          municipio: string
          nome_fantasia: string | null
          razao_social: string
          regime_tributario: string
          responsavel_id: string | null
          risco_score: number
          status: string
          telefone: string | null
          uf: string
        }
        Insert: {
          cnpj: string
          created_at?: string
          email_cliente?: string | null
          escritorio_id: string
          grupo_empresarial_id?: string | null
          id?: string
          inscricao_estadual?: string | null
          inscricao_municipal?: string | null
          matriz_id?: string | null
          municipio: string
          nome_fantasia?: string | null
          razao_social: string
          regime_tributario: string
          responsavel_id?: string | null
          risco_score?: number
          status?: string
          telefone?: string | null
          uf: string
        }
        Update: {
          cnpj?: string
          created_at?: string
          email_cliente?: string | null
          escritorio_id?: string
          grupo_empresarial_id?: string | null
          id?: string
          inscricao_estadual?: string | null
          inscricao_municipal?: string | null
          matriz_id?: string | null
          municipio?: string
          nome_fantasia?: string | null
          razao_social?: string
          regime_tributario?: string
          responsavel_id?: string | null
          risco_score?: number
          status?: string
          telefone?: string | null
          uf?: string
        }
        Relationships: [
          {
            foreignKeyName: "empresas_escritorio_id_fkey"
            columns: ["escritorio_id"]
            isOneToOne: false
            referencedRelation: "escritorios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "empresas_grupo_empresarial_id_fkey"
            columns: ["grupo_empresarial_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "empresas_matriz_id_fkey"
            columns: ["matriz_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "empresas_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      escritorios: {
        Row: {
          cnpj: string
          created_at: string
          email: string | null
          id: string
          nome: string
          plano: string
          telefone: string | null
        }
        Insert: {
          cnpj: string
          created_at?: string
          email?: string | null
          id?: string
          nome: string
          plano?: string
          telefone?: string | null
        }
        Update: {
          cnpj?: string
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          plano?: string
          telefone?: string | null
        }
        Relationships: []
      }
      historico_acoes: {
        Row: {
          acao: string
          created_at: string
          detalhes: string | null
          empresa_id: string | null
          escritorio_id: string
          id: string
          usuario_id: string | null
        }
        Insert: {
          acao: string
          created_at?: string
          detalhes?: string | null
          empresa_id?: string | null
          escritorio_id: string
          id?: string
          usuario_id?: string | null
        }
        Update: {
          acao?: string
          created_at?: string
          detalhes?: string | null
          empresa_id?: string | null
          escritorio_id?: string
          id?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "historico_acoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_acoes_escritorio_id_fkey"
            columns: ["escritorio_id"]
            isOneToOne: false
            referencedRelation: "escritorios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_acoes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      obrigacoes: {
        Row: {
          arquivo_comprovante_url: string | null
          competencia: string
          created_at: string
          data_limite: string
          empresa_id: string
          escritorio_id: string
          id: string
          observacoes: string | null
          protocolo: string | null
          responsavel_id: string | null
          status: string
          tipo_obrigacao: string
        }
        Insert: {
          arquivo_comprovante_url?: string | null
          competencia: string
          created_at?: string
          data_limite: string
          empresa_id: string
          escritorio_id: string
          id?: string
          observacoes?: string | null
          protocolo?: string | null
          responsavel_id?: string | null
          status?: string
          tipo_obrigacao: string
        }
        Update: {
          arquivo_comprovante_url?: string | null
          competencia?: string
          created_at?: string
          data_limite?: string
          empresa_id?: string
          escritorio_id?: string
          id?: string
          observacoes?: string | null
          protocolo?: string | null
          responsavel_id?: string | null
          status?: string
          tipo_obrigacao?: string
        }
        Relationships: [
          {
            foreignKeyName: "obrigacoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "obrigacoes_escritorio_id_fkey"
            columns: ["escritorio_id"]
            isOneToOne: false
            referencedRelation: "escritorios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "obrigacoes_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      tarefa_comentarios: {
        Row: {
          comentario: string
          created_at: string
          id: string
          tarefa_id: string
          usuario_id: string | null
        }
        Insert: {
          comentario: string
          created_at?: string
          id?: string
          tarefa_id: string
          usuario_id?: string | null
        }
        Update: {
          comentario?: string
          created_at?: string
          id?: string
          tarefa_id?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tarefa_comentarios_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "tarefas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefa_comentarios_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      tarefas: {
        Row: {
          concluida_em: string | null
          created_at: string
          data_limite: string | null
          descricao: string | null
          empresa_id: string | null
          escritorio_id: string
          id: string
          prioridade: string
          responsavel_id: string | null
          status: string
          tipo: string | null
          titulo: string
        }
        Insert: {
          concluida_em?: string | null
          created_at?: string
          data_limite?: string | null
          descricao?: string | null
          empresa_id?: string | null
          escritorio_id: string
          id?: string
          prioridade?: string
          responsavel_id?: string | null
          status?: string
          tipo?: string | null
          titulo: string
        }
        Update: {
          concluida_em?: string | null
          created_at?: string
          data_limite?: string | null
          descricao?: string | null
          empresa_id?: string | null
          escritorio_id?: string
          id?: string
          prioridade?: string
          responsavel_id?: string | null
          status?: string
          tipo?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "tarefas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_escritorio_id_fkey"
            columns: ["escritorio_id"]
            isOneToOne: false
            referencedRelation: "escritorios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          ativo: boolean
          created_at: string
          email: string
          escritorio_id: string
          id: string
          nome: string
          telefone: string | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          email: string
          escritorio_id: string
          id: string
          nome: string
          telefone?: string | null
        }
        Update: {
          ativo?: boolean
          created_at?: string
          email?: string
          escritorio_id?: string
          id?: string
          nome?: string
          telefone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_escritorio_id_fkey"
            columns: ["escritorio_id"]
            isOneToOne: false
            referencedRelation: "escritorios"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_empresa: { Args: { _empresa_id: string }; Returns: boolean }
      current_user_escritorio_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      recalcular_risco_empresa: {
        Args: { _empresa_id: string }
        Returns: number
      }
      user_belongs_to_office: { Args: { _office_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "administrador" | "gestor" | "operador" | "cliente"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["administrador", "gestor", "operador", "cliente"],
    },
  },
} as const
