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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      areas_carreira: {
        Row: {
          created_at: string | null
          descricao: string | null
          id: number
          is_active: boolean | null
          nome: string
          ordem: number | null
          slug: string
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          id?: number
          is_active?: boolean | null
          nome: string
          ordem?: number | null
          slug: string
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          id?: number
          is_active?: boolean | null
          nome?: string
          ordem?: number | null
          slug?: string
        }
        Relationships: []
      }
      artigos: {
        Row: {
          capitulo: string | null
          created_at: string | null
          id: number
          is_muito_cobrado: boolean | null
          lei_id: number
          numero: string
          ordem: number
          palavras_chave: string[] | null
          peso_edital: number | null
          secao: string | null
          texto_completo: string
          texto_formatado: string | null
          titulo: string | null
          updated_at: string | null
        }
        Insert: {
          capitulo?: string | null
          created_at?: string | null
          id?: number
          is_muito_cobrado?: boolean | null
          lei_id: number
          numero: string
          ordem: number
          palavras_chave?: string[] | null
          peso_edital?: number | null
          secao?: string | null
          texto_completo: string
          texto_formatado?: string | null
          titulo?: string | null
          updated_at?: string | null
        }
        Update: {
          capitulo?: string | null
          created_at?: string | null
          id?: number
          is_muito_cobrado?: boolean | null
          lei_id?: number
          numero?: string
          ordem?: number
          palavras_chave?: string[] | null
          peso_edital?: number | null
          secao?: string | null
          texto_completo?: string
          texto_formatado?: string | null
          titulo?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artigos_lei_id_fkey"
            columns: ["lei_id"]
            isOneToOne: false
            referencedRelation: "leis"
            referencedColumns: ["id"]
          },
        ]
      }
      assuntos: {
        Row: {
          created_at: string | null
          disciplina_id: number
          id: number
          nivel: number | null
          nome: string
          ordem: number | null
          parent_id: number | null
        }
        Insert: {
          created_at?: string | null
          disciplina_id: number
          id?: number
          nivel?: number | null
          nome: string
          ordem?: number | null
          parent_id?: number | null
        }
        Update: {
          created_at?: string | null
          disciplina_id?: number
          id?: number
          nivel?: number | null
          nome?: string
          ordem?: number | null
          parent_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "assuntos_disciplina_id_fkey"
            columns: ["disciplina_id"]
            isOneToOne: false
            referencedRelation: "disciplinas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assuntos_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "assuntos"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          codigo: string
          condicao: Json
          cor: string | null
          created_at: string | null
          descricao: string
          icone: string | null
          id: number
          is_active: boolean | null
          nome: string
          pontos_bonus: number | null
          raridade: string | null
          tipo: string
        }
        Insert: {
          codigo: string
          condicao: Json
          cor?: string | null
          created_at?: string | null
          descricao: string
          icone?: string | null
          id?: number
          is_active?: boolean | null
          nome: string
          pontos_bonus?: number | null
          raridade?: string | null
          tipo: string
        }
        Update: {
          codigo?: string
          condicao?: Json
          cor?: string | null
          created_at?: string | null
          descricao?: string
          icone?: string | null
          id?: number
          is_active?: boolean | null
          nome?: string
          pontos_bonus?: number | null
          raridade?: string | null
          tipo?: string
        }
        Relationships: []
      }
      bancas: {
        Row: {
          created_at: string | null
          id: number
          is_active: boolean | null
          logo_url: string | null
          nome: string
          sigla: string
          website: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          logo_url?: string | null
          nome: string
          sigla: string
          website?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          logo_url?: string | null
          nome?: string
          sigla?: string
          website?: string | null
        }
        Relationships: []
      }
      cadernos: {
        Row: {
          ano_fim: number | null
          ano_inicio: number | null
          banca_id: number | null
          concluido_em: string | null
          created_at: string | null
          descricao: string | null
          dificuldade: string | null
          disciplina_id: number | null
          filtros: Json | null
          id: number
          is_ativo: boolean
          is_concluido: boolean | null
          limite_questoes: number | null
          nome: string
          orgao_id: number | null
          pasta: string | null
          pasta_id: number | null
          questoes_respondidas: number | null
          taxa_acerto: number | null
          tempo_total_segundos: number | null
          total_questoes: number | null
          ultima_sessao_em: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ano_fim?: number | null
          ano_inicio?: number | null
          banca_id?: number | null
          concluido_em?: string | null
          created_at?: string | null
          descricao?: string | null
          dificuldade?: string | null
          disciplina_id?: number | null
          filtros?: Json | null
          id?: number
          is_ativo?: boolean
          is_concluido?: boolean | null
          limite_questoes?: number | null
          nome: string
          orgao_id?: number | null
          pasta?: string | null
          pasta_id?: number | null
          questoes_respondidas?: number | null
          taxa_acerto?: number | null
          tempo_total_segundos?: number | null
          total_questoes?: number | null
          ultima_sessao_em?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ano_fim?: number | null
          ano_inicio?: number | null
          banca_id?: number | null
          concluido_em?: string | null
          created_at?: string | null
          descricao?: string | null
          dificuldade?: string | null
          disciplina_id?: number | null
          filtros?: Json | null
          id?: number
          is_ativo?: boolean
          is_concluido?: boolean | null
          limite_questoes?: number | null
          nome?: string
          orgao_id?: number | null
          pasta?: string | null
          pasta_id?: number | null
          questoes_respondidas?: number | null
          taxa_acerto?: number | null
          tempo_total_segundos?: number | null
          total_questoes?: number | null
          ultima_sessao_em?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cadernos_banca_id_fkey"
            columns: ["banca_id"]
            isOneToOne: false
            referencedRelation: "bancas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cadernos_disciplina_id_fkey"
            columns: ["disciplina_id"]
            isOneToOne: false
            referencedRelation: "disciplinas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cadernos_orgao_id_fkey"
            columns: ["orgao_id"]
            isOneToOne: false
            referencedRelation: "orgaos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cadernos_pasta_id_fkey"
            columns: ["pasta_id"]
            isOneToOne: false
            referencedRelation: "pastas_cadernos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cadernos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cadernos_questoes: {
        Row: {
          adicionada_em: string | null
          caderno_id: number
          ordem: number
          questao_id: number
        }
        Insert: {
          adicionada_em?: string | null
          caderno_id: number
          ordem: number
          questao_id: number
        }
        Update: {
          adicionada_em?: string | null
          caderno_id?: number
          ordem?: number
          questao_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "cadernos_questoes_caderno_id_fkey"
            columns: ["caderno_id"]
            isOneToOne: false
            referencedRelation: "cadernos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cadernos_questoes_questao_id_fkey"
            columns: ["questao_id"]
            isOneToOne: false
            referencedRelation: "questoes"
            referencedColumns: ["id"]
          },
        ]
      }
      comentarios_votos: {
        Row: {
          comentario_id: number
          created_at: string | null
          id: number
          tipo: string
          user_id: string
        }
        Insert: {
          comentario_id: number
          created_at?: string | null
          id?: number
          tipo: string
          user_id: string
        }
        Update: {
          comentario_id?: number
          created_at?: string | null
          id?: number
          tipo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comentarios_votos_comentario_id_fkey"
            columns: ["comentario_id"]
            isOneToOne: false
            referencedRelation: "questoes_comentarios"
            referencedColumns: ["id"]
          },
        ]
      }
      disciplinas: {
        Row: {
          cor_destaque: string | null
          created_at: string | null
          descricao: string | null
          icone: string | null
          id: number
          is_active: boolean | null
          nome: string
          ordem: number | null
          slug: string
        }
        Insert: {
          cor_destaque?: string | null
          created_at?: string | null
          descricao?: string | null
          icone?: string | null
          id?: number
          is_active?: boolean | null
          nome: string
          ordem?: number | null
          slug: string
        }
        Update: {
          cor_destaque?: string | null
          created_at?: string | null
          descricao?: string | null
          icone?: string | null
          id?: number
          is_active?: boolean | null
          nome?: string
          ordem?: number | null
          slug?: string
        }
        Relationships: []
      }
      flashcards: {
        Row: {
          artigo_id: number
          created_at: string | null
          facilidade: number | null
          id: number
          intervalo: number | null
          is_active: boolean | null
          mnemonico_id: number | null
          proxima_revisao: string
          repeticoes: number | null
          ultima_resposta: string | null
          ultima_revisao: string | null
          user_id: string
        }
        Insert: {
          artigo_id: number
          created_at?: string | null
          facilidade?: number | null
          id?: number
          intervalo?: number | null
          is_active?: boolean | null
          mnemonico_id?: number | null
          proxima_revisao?: string
          repeticoes?: number | null
          ultima_resposta?: string | null
          ultima_revisao?: string | null
          user_id: string
        }
        Update: {
          artigo_id?: number
          created_at?: string | null
          facilidade?: number | null
          id?: number
          intervalo?: number | null
          is_active?: boolean | null
          mnemonico_id?: number | null
          proxima_revisao?: string
          repeticoes?: number | null
          ultima_resposta?: string | null
          ultima_revisao?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_artigo_id_fkey"
            columns: ["artigo_id"]
            isOneToOne: false
            referencedRelation: "artigos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flashcards_mnemonico_id_fkey"
            columns: ["mnemonico_id"]
            isOneToOne: false
            referencedRelation: "mnemonicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flashcards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      formacoes: {
        Row: {
          area_conhecimento: string | null
          created_at: string | null
          id: number
          is_active: boolean | null
          nome: string
          ordem: number | null
          slug: string
        }
        Insert: {
          area_conhecimento?: string | null
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          nome: string
          ordem?: number | null
          slug: string
        }
        Update: {
          area_conhecimento?: string | null
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          nome?: string
          ordem?: number | null
          slug?: string
        }
        Relationships: []
      }
      leis: {
        Row: {
          created_at: string | null
          data_publicacao: string | null
          disciplina_id: number
          ementa: string | null
          id: number
          is_active: boolean | null
          is_mais_cobrada: boolean | null
          link_oficial: string | null
          nome: string
          nome_curto: string
          numero_lei: string | null
          ordem: number | null
          sigla: string | null
          total_artigos: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_publicacao?: string | null
          disciplina_id: number
          ementa?: string | null
          id?: number
          is_active?: boolean | null
          is_mais_cobrada?: boolean | null
          link_oficial?: string | null
          nome: string
          nome_curto: string
          numero_lei?: string | null
          ordem?: number | null
          sigla?: string | null
          total_artigos?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_publicacao?: string | null
          disciplina_id?: number
          ementa?: string | null
          id?: number
          is_active?: boolean | null
          is_mais_cobrada?: boolean | null
          link_oficial?: string | null
          nome?: string
          nome_curto?: string
          numero_lei?: string | null
          ordem?: number | null
          sigla?: string | null
          total_artigos?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leis_disciplina_id_fkey"
            columns: ["disciplina_id"]
            isOneToOne: false
            referencedRelation: "disciplinas"
            referencedColumns: ["id"]
          },
        ]
      }
      materiais_interacoes: {
        Row: {
          created_at: string | null
          id: number
          material_id: number
          progresso_percentual: number | null
          tempo_gasto_segundos: number | null
          tipo_interacao: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          material_id: number
          progresso_percentual?: number | null
          tempo_gasto_segundos?: number | null
          tipo_interacao: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          material_id?: number
          progresso_percentual?: number | null
          tempo_gasto_segundos?: number | null
          tipo_interacao?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "materiais_interacoes_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "questoes_materiais_extras"
            referencedColumns: ["id"]
          },
        ]
      }
      mnemonicos: {
        Row: {
          artigo_id: number
          autor_id: string
          created_at: string | null
          id: number
          is_active: boolean | null
          is_validado: boolean | null
          score: number | null
          texto: string
          updated_at: string | null
          validado_em: string | null
          validado_por: string | null
          votos_negativos: number | null
          votos_positivos: number | null
        }
        Insert: {
          artigo_id: number
          autor_id: string
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          is_validado?: boolean | null
          score?: number | null
          texto: string
          updated_at?: string | null
          validado_em?: string | null
          validado_por?: string | null
          votos_negativos?: number | null
          votos_positivos?: number | null
        }
        Update: {
          artigo_id?: number
          autor_id?: string
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          is_validado?: boolean | null
          score?: number | null
          texto?: string
          updated_at?: string | null
          validado_em?: string | null
          validado_por?: string | null
          votos_negativos?: number | null
          votos_positivos?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mnemonicos_artigo_id_fkey"
            columns: ["artigo_id"]
            isOneToOne: false
            referencedRelation: "artigos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mnemonicos_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mnemonicos_validado_por_fkey"
            columns: ["validado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orgaos: {
        Row: {
          area: string | null
          created_at: string | null
          esfera: string | null
          id: number
          is_active: boolean | null
          nome: string
          regiao: string | null
          sigla: string
          uf: string | null
        }
        Insert: {
          area?: string | null
          created_at?: string | null
          esfera?: string | null
          id?: number
          is_active?: boolean | null
          nome: string
          regiao?: string | null
          sigla: string
          uf?: string | null
        }
        Update: {
          area?: string | null
          created_at?: string | null
          esfera?: string | null
          id?: number
          is_active?: boolean | null
          nome?: string
          regiao?: string | null
          sigla?: string
          uf?: string | null
        }
        Relationships: []
      }
      pastas_cadernos: {
        Row: {
          cor: string | null
          created_at: string
          descricao: string | null
          icone: string | null
          id: number
          nome: string
          ordem: number
          parent_id: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cor?: string | null
          created_at?: string
          descricao?: string | null
          icone?: string | null
          id?: number
          nome: string
          ordem?: number
          parent_id?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cor?: string | null
          created_at?: string
          descricao?: string | null
          icone?: string | null
          id?: number
          nome?: string
          ordem?: number
          parent_id?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pastas_cadernos_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "pastas_cadernos"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          concurso_alvo: string | null
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          is_banned: boolean | null
          meta_questoes_dia: number | null
          nivel: number | null
          nome_completo: string | null
          nome_exibicao: string | null
          plano: string | null
          plano_expira_em: string | null
          pontos_totais: number | null
          role: string | null
          streak_dias: number | null
          stripe_current_period_end: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          stripe_subscription_status: string | null
          taxa_acerto_geral: number | null
          tema: string | null
          total_acertos: number | null
          total_questoes_respondidas: number | null
          ultimo_acesso: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          concurso_alvo?: string | null
          created_at?: string | null
          email: string
          id: string
          is_active?: boolean | null
          is_banned?: boolean | null
          meta_questoes_dia?: number | null
          nivel?: number | null
          nome_completo?: string | null
          nome_exibicao?: string | null
          plano?: string | null
          plano_expira_em?: string | null
          pontos_totais?: number | null
          role?: string | null
          streak_dias?: number | null
          stripe_current_period_end?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_subscription_status?: string | null
          taxa_acerto_geral?: number | null
          tema?: string | null
          total_acertos?: number | null
          total_questoes_respondidas?: number | null
          ultimo_acesso?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          concurso_alvo?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          is_banned?: boolean | null
          meta_questoes_dia?: number | null
          nivel?: number | null
          nome_completo?: string | null
          nome_exibicao?: string | null
          plano?: string | null
          plano_expira_em?: string | null
          pontos_totais?: number | null
          role?: string | null
          streak_dias?: number | null
          stripe_current_period_end?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_subscription_status?: string | null
          taxa_acerto_geral?: number | null
          tema?: string | null
          total_acertos?: number | null
          total_questoes_respondidas?: number | null
          ultimo_acesso?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      questoes: {
        Row: {
          alternativa_a: string
          alternativa_b: string
          alternativa_c: string
          alternativa_d: string
          alternativa_e: string
          ano: number
          area_carreira_id: number | null
          artigo_id: number | null
          banca_id: number
          cargo: string | null
          codigo_original: string | null
          created_at: string | null
          dificuldade: string | null
          disciplina_id: number
          enunciado: string
          escolaridade: string | null
          explicacao: string | null
          formacao_id: number | null
          gabarito: string
          id: number
          is_active: boolean | null
          is_anulada: boolean | null
          orgao_id: number | null
          taxa_acerto: number | null
          tipo_questao: string | null
          total_acertos: number | null
          total_respostas: number | null
          updated_at: string | null
        }
        Insert: {
          alternativa_a: string
          alternativa_b: string
          alternativa_c: string
          alternativa_d: string
          alternativa_e: string
          ano: number
          area_carreira_id?: number | null
          artigo_id?: number | null
          banca_id: number
          cargo?: string | null
          codigo_original?: string | null
          created_at?: string | null
          dificuldade?: string | null
          disciplina_id: number
          enunciado: string
          escolaridade?: string | null
          explicacao?: string | null
          formacao_id?: number | null
          gabarito: string
          id?: number
          is_active?: boolean | null
          is_anulada?: boolean | null
          orgao_id?: number | null
          taxa_acerto?: number | null
          tipo_questao?: string | null
          total_acertos?: number | null
          total_respostas?: number | null
          updated_at?: string | null
        }
        Update: {
          alternativa_a?: string
          alternativa_b?: string
          alternativa_c?: string
          alternativa_d?: string
          alternativa_e?: string
          ano?: number
          area_carreira_id?: number | null
          artigo_id?: number | null
          banca_id?: number
          cargo?: string | null
          codigo_original?: string | null
          created_at?: string | null
          dificuldade?: string | null
          disciplina_id?: number
          enunciado?: string
          escolaridade?: string | null
          explicacao?: string | null
          formacao_id?: number | null
          gabarito?: string
          id?: number
          is_active?: boolean | null
          is_anulada?: boolean | null
          orgao_id?: number | null
          taxa_acerto?: number | null
          tipo_questao?: string | null
          total_acertos?: number | null
          total_respostas?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questoes_area_carreira_id_fkey"
            columns: ["area_carreira_id"]
            isOneToOne: false
            referencedRelation: "areas_carreira"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questoes_artigo_id_fkey"
            columns: ["artigo_id"]
            isOneToOne: false
            referencedRelation: "artigos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questoes_banca_id_fkey"
            columns: ["banca_id"]
            isOneToOne: false
            referencedRelation: "bancas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questoes_disciplina_id_fkey"
            columns: ["disciplina_id"]
            isOneToOne: false
            referencedRelation: "disciplinas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questoes_formacao_id_fkey"
            columns: ["formacao_id"]
            isOneToOne: false
            referencedRelation: "formacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questoes_orgao_id_fkey"
            columns: ["orgao_id"]
            isOneToOne: false
            referencedRelation: "orgaos"
            referencedColumns: ["id"]
          },
        ]
      }
      questoes_assuntos: {
        Row: {
          assunto_id: number
          questao_id: number
        }
        Insert: {
          assunto_id: number
          questao_id: number
        }
        Update: {
          assunto_id?: number
          questao_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "questoes_assuntos_assunto_id_fkey"
            columns: ["assunto_id"]
            isOneToOne: false
            referencedRelation: "assuntos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questoes_assuntos_questao_id_fkey"
            columns: ["questao_id"]
            isOneToOne: false
            referencedRelation: "questoes"
            referencedColumns: ["id"]
          },
        ]
      }
      questoes_comentarios: {
        Row: {
          comentario: string
          created_at: string | null
          downvotes: number | null
          id: number
          is_active: boolean | null
          is_editado: boolean
          is_moderado: boolean | null
          is_professor: boolean
          questao_id: number
          tipo: string
          updated_at: string | null
          upvotes: number | null
          user_id: string
        }
        Insert: {
          comentario: string
          created_at?: string | null
          downvotes?: number | null
          id?: number
          is_active?: boolean | null
          is_editado?: boolean
          is_moderado?: boolean | null
          is_professor?: boolean
          questao_id: number
          tipo?: string
          updated_at?: string | null
          upvotes?: number | null
          user_id: string
        }
        Update: {
          comentario?: string
          created_at?: string | null
          downvotes?: number | null
          id?: number
          is_active?: boolean | null
          is_editado?: boolean
          is_moderado?: boolean | null
          is_professor?: boolean
          questao_id?: number
          tipo?: string
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "questoes_comentarios_questao_id_fkey"
            columns: ["questao_id"]
            isOneToOne: false
            referencedRelation: "questoes"
            referencedColumns: ["id"]
          },
        ]
      }
      questoes_favoritas: {
        Row: {
          favoritada_em: string | null
          questao_id: number
          user_id: string
        }
        Insert: {
          favoritada_em?: string | null
          questao_id: number
          user_id: string
        }
        Update: {
          favoritada_em?: string | null
          questao_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "questoes_favoritas_questao_id_fkey"
            columns: ["questao_id"]
            isOneToOne: false
            referencedRelation: "questoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questoes_favoritas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      questoes_materiais_extras: {
        Row: {
          created_at: string | null
          descricao: string | null
          duracao: number | null
          id: number
          is_active: boolean | null
          questao_id: number
          tamanho_mb: number | null
          tipo: string
          titulo: string
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          duracao?: number | null
          id?: number
          is_active?: boolean | null
          questao_id: number
          tamanho_mb?: number | null
          tipo: string
          titulo: string
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          duracao?: number | null
          id?: number
          is_active?: boolean | null
          questao_id?: number
          tamanho_mb?: number | null
          tipo?: string
          titulo?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "questoes_materiais_extras_questao_id_fkey"
            columns: ["questao_id"]
            isOneToOne: false
            referencedRelation: "questoes"
            referencedColumns: ["id"]
          },
        ]
      }
      ranking_semanal: {
        Row: {
          acertos: number | null
          created_at: string | null
          id: number
          pontos_ganhos: number | null
          posicao: number | null
          questoes_respondidas: number | null
          semana: string
          user_id: string
        }
        Insert: {
          acertos?: number | null
          created_at?: string | null
          id?: number
          pontos_ganhos?: number | null
          posicao?: number | null
          questoes_respondidas?: number | null
          semana: string
          user_id: string
        }
        Update: {
          acertos?: number | null
          created_at?: string | null
          id?: number
          pontos_ganhos?: number | null
          posicao?: number | null
          questoes_respondidas?: number | null
          semana?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ranking_semanal_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      respostas_usuarios: {
        Row: {
          caderno_id: number
          correta: boolean
          id: number
          modo: string | null
          questao_id: number
          respondida_em: string | null
          resposta_escolhida: string
          tempo_gasto_segundos: number | null
          tempo_resposta: number | null
          user_id: string
        }
        Insert: {
          caderno_id: number
          correta: boolean
          id?: number
          modo?: string | null
          questao_id: number
          respondida_em?: string | null
          resposta_escolhida: string
          tempo_gasto_segundos?: number | null
          tempo_resposta?: number | null
          user_id: string
        }
        Update: {
          caderno_id?: number
          correta?: boolean
          id?: number
          modo?: string | null
          questao_id?: number
          respondida_em?: string | null
          resposta_escolhida?: string
          tempo_gasto_segundos?: number | null
          tempo_resposta?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "respostas_usuarios_caderno_id_fkey"
            columns: ["caderno_id"]
            isOneToOne: false
            referencedRelation: "cadernos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "respostas_usuarios_questao_id_fkey"
            columns: ["questao_id"]
            isOneToOne: false
            referencedRelation: "questoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "respostas_usuarios_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios_badges: {
        Row: {
          badge_id: number
          conquistada_em: string | null
          user_id: string
        }
        Insert: {
          badge_id: number
          conquistada_em?: string | null
          user_id: string
        }
        Update: {
          badge_id?: number
          conquistada_em?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      votos_mnemonicos: {
        Row: {
          created_at: string | null
          mnemonico_id: number
          user_id: string
          voto: number
        }
        Insert: {
          created_at?: string | null
          mnemonico_id: number
          user_id: string
          voto: number
        }
        Update: {
          created_at?: string | null
          mnemonico_id?: number
          user_id?: string
          voto?: number
        }
        Relationships: [
          {
            foreignKeyName: "votos_mnemonicos_mnemonico_id_fkey"
            columns: ["mnemonico_id"]
            isOneToOne: false
            referencedRelation: "mnemonicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votos_mnemonicos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_caderno_estatisticas_detalhadas: {
        Args: { p_caderno_id: number; p_user_id: string }
        Returns: {
          acertos: number
          erros: number
          questoes_resolvidas: number
          taxa_acerto: number
          tempo_maximo_segundos: number
          tempo_medio_segundos: number
          tempo_minimo_segundos: number
          tempo_total_segundos: number
          total_questoes: number
          ultima_sessao_em: string
        }[]
      }
      get_caderno_questoes: {
        Args: { p_caderno_id: number; p_user_id: string }
        Returns: {
          alternativa_a: string
          alternativa_b: string
          alternativa_c: string
          alternativa_d: string
          alternativa_e: string
          ano: number
          banca_id: number
          bancas: Json
          cargo: string
          dificuldade: string
          disciplina_id: number
          disciplinas: Json
          enunciado: string
          explicacao: string
          gabarito: string
          id: number
          ja_respondida: boolean
          orgao_id: number
          orgaos: Json
        }[]
      }
      get_comentarios_completos: {
        Args: { p_questao_id: number; p_user_id: string }
        Returns: {
          autor_avatar: string
          autor_nome: string
          comentario: string
          created_at: string
          downvotes: number
          id: number
          is_editado: boolean
          is_professor: boolean
          questao_id: number
          tipo: string
          total_votos: number
          updated_at: string
          upvotes: number
          user_id: string
          user_votou: string
        }[]
      }
      get_pastas_tree: {
        Args: { p_user_id: string }
        Returns: {
          caminho: string[]
          cor: string
          descricao: string
          icone: string
          id: number
          nivel: number
          nome: string
          ordem: number
          parent_id: number
          total_cadernos: number
        }[]
      }
      get_random_question: {
        Args: { p_user_id: string }
        Returns: {
          alternativa_a: string
          alternativa_b: string
          alternativa_c: string
          alternativa_d: string
          alternativa_e: string
          ano: number
          banca_id: number
          bancas: Json
          cargo: string
          dificuldade: string
          disciplina_id: number
          disciplinas: Json
          enunciado: string
          explicacao: string
          gabarito: string
          id: number
          orgao_id: number
          orgaos: Json
        }[]
      }
      get_tempo_medio_caderno: {
        Args: { p_caderno_id: number }
        Returns: number
      }
      move_caderno_to_pasta: {
        Args: { p_caderno_id: number; p_pasta_id: number; p_user_id: string }
        Returns: boolean
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      update_caderno_progresso: {
        Args: { p_acertou: boolean; p_caderno_id: number }
        Returns: undefined
      }
    }
    Enums: {
      answer_option: "A" | "B" | "C" | "D" | "E"
      question_type:
        | "multipla_escolha"
        | "certo_errado"
        | "discursiva"
        | "dissertativa"
      response_context: "practice" | "simulado" | "review"
      simulado_status: "in_progress" | "completed" | "abandoned"
      simulado_type: "quick" | "standard" | "complete" | "custom"
      user_plan: "free" | "premium" | "unlimited"
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
      answer_option: ["A", "B", "C", "D", "E"],
      question_type: [
        "multipla_escolha",
        "certo_errado",
        "discursiva",
        "dissertativa",
      ],
      response_context: ["practice", "simulado", "review"],
      simulado_status: ["in_progress", "completed", "abandoned"],
      simulado_type: ["quick", "standard", "complete", "custom"],
      user_plan: ["free", "premium", "unlimited"],
    },
  },
} as const
