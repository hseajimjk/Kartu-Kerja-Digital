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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      akun_kontraktor: {
        Row: {
          created_at: string
          email: string
          id: string
          kontraktor_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          kontraktor_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          kontraktor_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "akun_kontraktor_kontraktor_id_fkey"
            columns: ["kontraktor_id"]
            isOneToOne: false
            referencedRelation: "kontraktors"
            referencedColumns: ["id"]
          },
        ]
      }
      area_kerja: {
        Row: {
          created_at: string
          department: string
          factory_id: string
          id: string
          section: string
        }
        Insert: {
          created_at?: string
          department: string
          factory_id: string
          id?: string
          section: string
        }
        Update: {
          created_at?: string
          department?: string
          factory_id?: string
          id?: string
          section?: string
        }
        Relationships: [
          {
            foreignKeyName: "area_kerja_factory_id_fkey"
            columns: ["factory_id"]
            isOneToOne: false
            referencedRelation: "factories"
            referencedColumns: ["id"]
          },
        ]
      }
      factories: {
        Row: {
          created_at: string
          factory: string
          id: string
          no: number
        }
        Insert: {
          created_at?: string
          factory: string
          id?: string
          no?: number
        }
        Update: {
          created_at?: string
          factory?: string
          id?: string
          no?: number
        }
        Relationships: []
      }
      jenis_pekerjaan: {
        Row: {
          created_at: string
          id: string
          jenis_pekerjaan: string
          no: number
        }
        Insert: {
          created_at?: string
          id?: string
          jenis_pekerjaan: string
          no?: number
        }
        Update: {
          created_at?: string
          id?: string
          jenis_pekerjaan?: string
          no?: number
        }
        Relationships: []
      }
      kartu_kerja: {
        Row: {
          area_kerja_id: string
          created_at: string
          deskripsi_pekerjaan: string
          id: string
          id_kartu_kerja: string
          jam_mulai: string
          jam_selesai: string | null
          jenis_pekerjaan_id: string
          kontraktor_id: string
          no_urut: number
          pic_em_id: string
          tanggal_input: string
          tanggal_pekerjaan: string
          type_kk_id: string
          user_id: string
        }
        Insert: {
          area_kerja_id: string
          created_at?: string
          deskripsi_pekerjaan: string
          id?: string
          id_kartu_kerja: string
          jam_mulai: string
          jam_selesai?: string | null
          jenis_pekerjaan_id: string
          kontraktor_id: string
          no_urut?: number
          pic_em_id: string
          tanggal_input?: string
          tanggal_pekerjaan: string
          type_kk_id: string
          user_id: string
        }
        Update: {
          area_kerja_id?: string
          created_at?: string
          deskripsi_pekerjaan?: string
          id?: string
          id_kartu_kerja?: string
          jam_mulai?: string
          jam_selesai?: string | null
          jenis_pekerjaan_id?: string
          kontraktor_id?: string
          no_urut?: number
          pic_em_id?: string
          tanggal_input?: string
          tanggal_pekerjaan?: string
          type_kk_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kartu_kerja_area_kerja_id_fkey"
            columns: ["area_kerja_id"]
            isOneToOne: false
            referencedRelation: "area_kerja"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kartu_kerja_jenis_pekerjaan_id_fkey"
            columns: ["jenis_pekerjaan_id"]
            isOneToOne: false
            referencedRelation: "jenis_pekerjaan"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kartu_kerja_kontraktor_id_fkey"
            columns: ["kontraktor_id"]
            isOneToOne: false
            referencedRelation: "kontraktors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kartu_kerja_pic_em_id_fkey"
            columns: ["pic_em_id"]
            isOneToOne: false
            referencedRelation: "pic_em"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kartu_kerja_type_kk_id_fkey"
            columns: ["type_kk_id"]
            isOneToOne: false
            referencedRelation: "type_kartu_kerja"
            referencedColumns: ["id"]
          },
        ]
      }
      kontraktors: {
        Row: {
          created_at: string
          id: string
          id_kont: string
          nama_kontraktor: string
          no: number
        }
        Insert: {
          created_at?: string
          id?: string
          id_kont: string
          nama_kontraktor: string
          no?: number
        }
        Update: {
          created_at?: string
          id?: string
          id_kont?: string
          nama_kontraktor?: string
          no?: number
        }
        Relationships: []
      }
      pic_em: {
        Row: {
          created_at: string
          id: string
          nama_pic_em: string
        }
        Insert: {
          created_at?: string
          id?: string
          nama_pic_em: string
        }
        Update: {
          created_at?: string
          id?: string
          nama_pic_em?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      type_kartu_kerja: {
        Row: {
          created_at: string
          id: string
          no: number
          type_kk: string
        }
        Insert: {
          created_at?: string
          id?: string
          no?: number
          type_kk: string
        }
        Update: {
          created_at?: string
          id?: string
          no?: number
          type_kk?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "contractor"
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
      app_role: ["admin", "contractor"],
    },
  },
} as const
