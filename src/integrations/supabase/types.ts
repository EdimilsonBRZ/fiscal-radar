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
          destinatarios: string[]
          documento_id: string | null
          empresa_id: string | null
          enviado: boolean
          enviado_em: string | null
          escritorio_id: string
          id: string
          mensagem: string
          obrigacao_id: string | null
          resolvido: boolean
          resolvido_em: string | null
          tipo_alerta: string
        }
        Insert: {
          created_at?: string
          data_alerta: string
          destinatarios?: string[]
          documento_id?: string | null
          empresa_id?: string | null
          enviado?: boolean
          enviado_em?: string | null
          escritorio_id: string
          id?: string
          mensagem: string
          obrigacao_id?: string | null
          resolvido?: boolean
          resolvido_em?: string | null
          tipo_alerta: string
        }
        Update: {
          created_at?: string
          data_alerta?: string
          destinatarios?: string[]
          documento_id?: string | null
          empresa_id?: string | null
          enviado?: boolean
          enviado_em?: string | null
          escritorio_id?: string
          id?: string
          mensagem?: string
          obrigacao_id?: string | null
          resolvido?: boolean
          resolvido_em?: string | null
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
      calendario_fiscal: {
        Row: {
          atualizado_em: string
          competencia: string
          created_at: string
          data_vencimento: string
          editado_manualmente: boolean
          escritorio_id: string
          fonte: string | null
          id: string
          municipio: string | null
          nome_obrigacao: string
          observacoes: string | null
          regime_tributario: string | null
          tipo: string
          uf: string | null
          updated_at: string
        }
        Insert: {
          atualizado_em?: string
          competencia: string
          created_at?: string
          data_vencimento: string
          editado_manualmente?: boolean
          escritorio_id: string
          fonte?: string | null
          id?: string
          municipio?: string | null
          nome_obrigacao: string
          observacoes?: string | null
          regime_tributario?: string | null
          tipo: string
          uf?: string | null
          updated_at?: string
        }
        Update: {
          atualizado_em?: string
          competencia?: string
          created_at?: string
          data_vencimento?: string
          editado_manualmente?: boolean
          escritorio_id?: string
          fonte?: string | null
          id?: string
          municipio?: string | null
          nome_obrigacao?: string
          observacoes?: string | null
          regime_tributario?: string | null
          tipo?: string
          uf?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      certidoes: {
        Row: {
          arquivo_pdf_url: string | null
          codigo_validacao: string | null
          consulta_id: string | null
          created_at: string
          data_emissao: string | null
          data_validade: string | null
          empresa_id: string
          escritorio_id: string
          esfera: string
          id: string
          municipio: string | null
          numero_certidao: string | null
          observacoes: string | null
          origem_emissao: string | null
          status: string
          tipo_certidao: string
          uf: string | null
          updated_at: string
        }
        Insert: {
          arquivo_pdf_url?: string | null
          codigo_validacao?: string | null
          consulta_id?: string | null
          created_at?: string
          data_emissao?: string | null
          data_validade?: string | null
          empresa_id: string
          escritorio_id: string
          esfera: string
          id?: string
          municipio?: string | null
          numero_certidao?: string | null
          observacoes?: string | null
          origem_emissao?: string | null
          status?: string
          tipo_certidao: string
          uf?: string | null
          updated_at?: string
        }
        Update: {
          arquivo_pdf_url?: string | null
          codigo_validacao?: string | null
          consulta_id?: string | null
          created_at?: string
          data_emissao?: string | null
          data_validade?: string | null
          empresa_id?: string
          escritorio_id?: string
          esfera?: string
          id?: string
          municipio?: string | null
          numero_certidao?: string | null
          observacoes?: string | null
          origem_emissao?: string | null
          status?: string
          tipo_certidao?: string
          uf?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      certificados_digitais: {
        Row: {
          arquivo_url: string | null
          cpf_cnpj: string
          created_at: string
          empresa_id: string | null
          escritorio_id: string
          id: string
          observacoes: string | null
          status: string
          tipo: string
          titular: string
          updated_at: string
          validade: string
        }
        Insert: {
          arquivo_url?: string | null
          cpf_cnpj: string
          created_at?: string
          empresa_id?: string | null
          escritorio_id: string
          id?: string
          observacoes?: string | null
          status?: string
          tipo?: string
          titular: string
          updated_at?: string
          validade: string
        }
        Update: {
          arquivo_url?: string | null
          cpf_cnpj?: string
          created_at?: string
          empresa_id?: string | null
          escritorio_id?: string
          id?: string
          observacoes?: string | null
          status?: string
          tipo?: string
          titular?: string
          updated_at?: string
          validade?: string
        }
        Relationships: []
      }
      configuracoes_alerta: {
        Row: {
          alerta_15_dias: boolean
          alerta_30_dias: boolean
          alerta_7_dias: boolean
          alerta_no_vencimento: boolean
          alerta_pos_vencido: boolean
          assinatura_escritorio: string
          assunto_padrao: string
          corpo_padrao: string
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
          alerta_15_dias?: boolean
          alerta_30_dias?: boolean
          alerta_7_dias?: boolean
          alerta_no_vencimento?: boolean
          alerta_pos_vencido?: boolean
          assinatura_escritorio?: string
          assunto_padrao?: string
          corpo_padrao?: string
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
          alerta_15_dias?: boolean
          alerta_30_dias?: boolean
          alerta_7_dias?: boolean
          alerta_no_vencimento?: boolean
          alerta_pos_vencido?: boolean
          assinatura_escritorio?: string
          assunto_padrao?: string
          corpo_padrao?: string
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
      consultas_fiscais: {
        Row: {
          arquivo_pdf_url: string | null
          cnpj: string | null
          created_at: string
          dados_retorno: Json | null
          data_consulta: string
          empresa_id: string | null
          erro_tecnico: string | null
          escritorio_id: string
          id: string
          link_oficial: string | null
          mensagem: string | null
          origem: string | null
          status: string
          tipo_consulta: string
          usuario_id: string | null
        }
        Insert: {
          arquivo_pdf_url?: string | null
          cnpj?: string | null
          created_at?: string
          dados_retorno?: Json | null
          data_consulta?: string
          empresa_id?: string | null
          erro_tecnico?: string | null
          escritorio_id: string
          id?: string
          link_oficial?: string | null
          mensagem?: string | null
          origem?: string | null
          status?: string
          tipo_consulta: string
          usuario_id?: string | null
        }
        Update: {
          arquivo_pdf_url?: string | null
          cnpj?: string | null
          created_at?: string
          dados_retorno?: Json | null
          data_consulta?: string
          empresa_id?: string | null
          erro_tecnico?: string | null
          escritorio_id?: string
          id?: string
          link_oficial?: string | null
          mensagem?: string | null
          origem?: string | null
          status?: string
          tipo_consulta?: string
          usuario_id?: string | null
        }
        Relationships: []
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
          rotulo: string
        }
        Insert: {
          created_at?: string
          email: string
          empresa_id: string
          id?: string
          principal?: boolean
          rotulo?: string
        }
        Update: {
          created_at?: string
          email?: string
          empresa_id?: string
          id?: string
          principal?: boolean
          rotulo?: string
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
          cep: string | null
          cnpj: string
          created_at: string
          email_cliente: string | null
          endereco: string | null
          escritorio_id: string
          grupo_empresarial_id: string | null
          id: string
          inscricao_estadual: string | null
          inscricao_municipal: string | null
          matriz_id: string | null
          municipio: string
          natureza_juridica: string | null
          nome_fantasia: string | null
          observacao_geral: string | null
          razao_social: string
          regime_tributario: string
          responsavel_id: string | null
          responsavel_interno: string | null
          risco_score: number
          setor: string | null
          status: string
          telefone: string | null
          uf: string
        }
        Insert: {
          cep?: string | null
          cnpj: string
          created_at?: string
          email_cliente?: string | null
          endereco?: string | null
          escritorio_id: string
          grupo_empresarial_id?: string | null
          id?: string
          inscricao_estadual?: string | null
          inscricao_municipal?: string | null
          matriz_id?: string | null
          municipio: string
          natureza_juridica?: string | null
          nome_fantasia?: string | null
          observacao_geral?: string | null
          razao_social: string
          regime_tributario: string
          responsavel_id?: string | null
          responsavel_interno?: string | null
          risco_score?: number
          setor?: string | null
          status?: string
          telefone?: string | null
          uf: string
        }
        Update: {
          cep?: string | null
          cnpj?: string
          created_at?: string
          email_cliente?: string | null
          endereco?: string | null
          escritorio_id?: string
          grupo_empresarial_id?: string | null
          id?: string
          inscricao_estadual?: string | null
          inscricao_municipal?: string | null
          matriz_id?: string | null
          municipio?: string
          natureza_juridica?: string | null
          nome_fantasia?: string | null
          observacao_geral?: string | null
          razao_social?: string
          regime_tributario?: string
          responsavel_id?: string | null
          responsavel_interno?: string | null
          risco_score?: number
          setor?: string | null
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
      integracoes_fiscais: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          escritorio_id: string
          id: string
          municipio: string | null
          nome: string
          observacoes: string | null
          requer_certificado: boolean
          requer_govbr: boolean
          requer_procuracao: boolean
          tipo_integracao: string
          uf: string | null
          updated_at: string
          url_base: string | null
          usa_api: boolean
          usa_consulta_assistida: boolean
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          escritorio_id: string
          id?: string
          municipio?: string | null
          nome: string
          observacoes?: string | null
          requer_certificado?: boolean
          requer_govbr?: boolean
          requer_procuracao?: boolean
          tipo_integracao: string
          uf?: string | null
          updated_at?: string
          url_base?: string | null
          usa_api?: boolean
          usa_consulta_assistida?: boolean
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          escritorio_id?: string
          id?: string
          municipio?: string | null
          nome?: string
          observacoes?: string | null
          requer_certificado?: boolean
          requer_govbr?: boolean
          requer_procuracao?: boolean
          tipo_integracao?: string
          uf?: string | null
          updated_at?: string
          url_base?: string | null
          usa_api?: boolean
          usa_consulta_assistida?: boolean
        }
        Relationships: []
      }
      logs_integracao: {
        Row: {
          created_at: string
          empresa_id: string | null
          endpoint: string | null
          erro: string | null
          escritorio_id: string
          id: string
          payload_resumido: string | null
          resposta_resumida: string | null
          status: string
          tipo_integracao: string
        }
        Insert: {
          created_at?: string
          empresa_id?: string | null
          endpoint?: string | null
          erro?: string | null
          escritorio_id: string
          id?: string
          payload_resumido?: string | null
          resposta_resumida?: string | null
          status: string
          tipo_integracao: string
        }
        Update: {
          created_at?: string
          empresa_id?: string | null
          endpoint?: string | null
          erro?: string | null
          escritorio_id?: string
          id?: string
          payload_resumido?: string | null
          resposta_resumida?: string | null
          status?: string
          tipo_integracao?: string
        }
        Relationships: []
      }
      obrigacoes: {
        Row: {
          arquivo_comprovante_url: string | null
          calendario_fiscal_id: string | null
          competencia: string
          created_at: string
          data_entrega: string | null
          data_limite: string
          empresa_id: string
          escritorio_id: string
          id: string
          nao_se_aplica: boolean
          observacoes: string | null
          protocolo: string | null
          responsavel_id: string | null
          rotina_id: string | null
          status: string
          tipo_obrigacao: string
        }
        Insert: {
          arquivo_comprovante_url?: string | null
          calendario_fiscal_id?: string | null
          competencia: string
          created_at?: string
          data_entrega?: string | null
          data_limite: string
          empresa_id: string
          escritorio_id: string
          id?: string
          nao_se_aplica?: boolean
          observacoes?: string | null
          protocolo?: string | null
          responsavel_id?: string | null
          rotina_id?: string | null
          status?: string
          tipo_obrigacao: string
        }
        Update: {
          arquivo_comprovante_url?: string | null
          calendario_fiscal_id?: string | null
          competencia?: string
          created_at?: string
          data_entrega?: string | null
          data_limite?: string
          empresa_id?: string
          escritorio_id?: string
          id?: string
          nao_se_aplica?: boolean
          observacoes?: string | null
          protocolo?: string | null
          responsavel_id?: string | null
          rotina_id?: string | null
          status?: string
          tipo_obrigacao?: string
        }
        Relationships: [
          {
            foreignKeyName: "obrigacoes_calendario_fiscal_id_fkey"
            columns: ["calendario_fiscal_id"]
            isOneToOne: false
            referencedRelation: "calendario_fiscal"
            referencedColumns: ["id"]
          },
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
          {
            foreignKeyName: "obrigacoes_rotina_id_fkey"
            columns: ["rotina_id"]
            isOneToOne: false
            referencedRelation: "rotinas_fiscais"
            referencedColumns: ["id"]
          },
        ]
      }
      pendencias_fiscais: {
        Row: {
          arquivo_pdf_url: string | null
          consulta_id: string | null
          created_at: string
          descricao: string
          empresa_id: string
          escritorio_id: string
          grau_risco: string
          id: string
          link_oficial: string | null
          observacoes: string | null
          origem: string
          prazo_regularizacao: string | null
          regularizada_em: string | null
          responsavel_id: string | null
          status: string
          tipo_pendencia: string
          updated_at: string
        }
        Insert: {
          arquivo_pdf_url?: string | null
          consulta_id?: string | null
          created_at?: string
          descricao: string
          empresa_id: string
          escritorio_id: string
          grau_risco?: string
          id?: string
          link_oficial?: string | null
          observacoes?: string | null
          origem: string
          prazo_regularizacao?: string | null
          regularizada_em?: string | null
          responsavel_id?: string | null
          status?: string
          tipo_pendencia: string
          updated_at?: string
        }
        Update: {
          arquivo_pdf_url?: string | null
          consulta_id?: string | null
          created_at?: string
          descricao?: string
          empresa_id?: string
          escritorio_id?: string
          grau_risco?: string
          id?: string
          link_oficial?: string | null
          observacoes?: string | null
          origem?: string
          prazo_regularizacao?: string | null
          regularizada_em?: string | null
          responsavel_id?: string | null
          status?: string
          tipo_pendencia?: string
          updated_at?: string
        }
        Relationships: []
      }
      relatorios_gerados: {
        Row: {
          arquivo_url: string | null
          created_at: string
          escritorio_id: string
          filtros: Json
          id: string
          periodo_final: string | null
          periodo_inicial: string | null
          tipo_relatorio: string
          usuario_id: string | null
        }
        Insert: {
          arquivo_url?: string | null
          created_at?: string
          escritorio_id: string
          filtros?: Json
          id?: string
          periodo_final?: string | null
          periodo_inicial?: string | null
          tipo_relatorio: string
          usuario_id?: string | null
        }
        Update: {
          arquivo_url?: string | null
          created_at?: string
          escritorio_id?: string
          filtros?: Json
          id?: string
          periodo_final?: string | null
          periodo_inicial?: string | null
          tipo_relatorio?: string
          usuario_id?: string | null
        }
        Relationships: []
      }
      rotina_itens: {
        Row: {
          arquivo_url: string | null
          categoria: string
          concluido_em: string | null
          created_at: string
          data_limite: string | null
          descricao: string
          id: string
          observacoes: string | null
          responsavel_id: string | null
          rotina_id: string
          status: string
          updated_at: string
        }
        Insert: {
          arquivo_url?: string | null
          categoria: string
          concluido_em?: string | null
          created_at?: string
          data_limite?: string | null
          descricao: string
          id?: string
          observacoes?: string | null
          responsavel_id?: string | null
          rotina_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          arquivo_url?: string | null
          categoria?: string
          concluido_em?: string | null
          created_at?: string
          data_limite?: string | null
          descricao?: string
          id?: string
          observacoes?: string | null
          responsavel_id?: string | null
          rotina_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rotina_itens_rotina_id_fkey"
            columns: ["rotina_id"]
            isOneToOne: false
            referencedRelation: "rotinas_fiscais"
            referencedColumns: ["id"]
          },
        ]
      }
      rotinas_fiscais: {
        Row: {
          competencia: string
          created_at: string
          data_conclusao: string | null
          data_inicio: string | null
          data_limite: string
          empresa_id: string
          escritorio_id: string
          id: string
          observacoes: string | null
          responsavel_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          competencia: string
          created_at?: string
          data_conclusao?: string | null
          data_inicio?: string | null
          data_limite: string
          empresa_id: string
          escritorio_id: string
          id?: string
          observacoes?: string | null
          responsavel_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          competencia?: string
          created_at?: string
          data_conclusao?: string | null
          data_inicio?: string | null
          data_limite?: string
          empresa_id?: string
          escritorio_id?: string
          id?: string
          observacoes?: string | null
          responsavel_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
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
      criar_itens_padrao_rotina: {
        Args: { _rotina_id: string }
        Returns: number
      }
      current_user_escritorio_id: { Args: never; Returns: string }
      gerar_alertas_documentos: { Args: never; Returns: number }
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
