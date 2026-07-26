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
      contacts: {
        Row: {
          created_at: string
          email: string
          id: number
          message: string
          name: string
          phone: string | null
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: never
          message: string
          name: string
          phone?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: never
          message?: string
          name?: string
          phone?: string | null
          status?: string
        }
        Relationships: []
      }
      design_projects: {
        Row: {
          category: string
          client: string
          created_at: string | null
          description: string | null
          featured: boolean | null
          id: number
          images: string[]
          location: string | null
          number: number | null
          slug: string
          status: string
          updated_at: string
          works: string[]
          year: number | null
        }
        Insert: {
          category?: string
          client: string
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          id?: number
          images?: string[]
          location?: string | null
          number?: number | null
          slug: string
          status?: string
          updated_at?: string
          works?: string[]
          year?: number | null
        }
        Update: {
          category?: string
          client?: string
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          id?: number
          images?: string[]
          location?: string | null
          number?: number | null
          slug?: string
          status?: string
          updated_at?: string
          works?: string[]
          year?: number | null
        }
        Relationships: []
      }
      maintenance_projects: {
        Row: {
          client: string | null
          created_at: string | null
          description: string
          featured: boolean | null
          id: number
          image_url: string | null
          images: string[] | null
          location: string | null
          period: string | null
          slug: string
          status: string
          tags: string[] | null
          title: string
          updated_at: string
          work_type: string
        }
        Insert: {
          client?: string | null
          created_at?: string | null
          description: string
          featured?: boolean | null
          id?: number
          image_url?: string | null
          images?: string[] | null
          location?: string | null
          period?: string | null
          slug: string
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          work_type?: string
        }
        Update: {
          client?: string | null
          created_at?: string | null
          description?: string
          featured?: boolean | null
          id?: number
          image_url?: string | null
          images?: string[] | null
          location?: string | null
          period?: string | null
          slug?: string
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          work_type?: string
        }
        Relationships: []
      }
      partners: {
        Row: {
          created_at: string
          id: number
          logo_url: string
          name: string
          order_index: number
          published: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: never
          logo_url?: string
          name: string
          order_index?: number
          published?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: never
          logo_url?: string
          name?: string
          order_index?: number
          published?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          category: string
          coords_label: string | null
          created_at: string
          date_end: string | null
          date_start: string | null
          description: string
          featured: boolean
          id: number
          image_url: string | null
          images: string[] | null
          length: string | null
          location: string
          slug: string
          status: string
          tags: string[] | null
          title: string
          updated_at: string
          x_map: number | null
          y_map: number | null
          year: number
        }
        Insert: {
          category: string
          coords_label?: string | null
          created_at?: string
          date_end?: string | null
          date_start?: string | null
          description: string
          featured?: boolean
          id?: never
          image_url?: string | null
          images?: string[] | null
          length?: string | null
          location: string
          slug: string
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          x_map?: number | null
          y_map?: number | null
          year: number
        }
        Update: {
          category?: string
          coords_label?: string | null
          created_at?: string
          date_end?: string | null
          date_start?: string | null
          description?: string
          featured?: boolean
          id?: never
          image_url?: string | null
          images?: string[] | null
          length?: string | null
          location?: string
          slug?: string
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          x_map?: number | null
          y_map?: number | null
          year?: number
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          description: string
          direction: string
          icon: string
          id: number
          order_index: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          direction: string
          icon: string
          id?: never
          order_index?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          direction?: string
          icon?: string
          id?: never
          order_index?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          category: string
          client: string
          created_at: string
          date_label: string | null
          id: number
          order_index: number
          project: string
          published: boolean
          quote: string
          role: string
          signatory: string
          updated_at: string
        }
        Insert: {
          category?: string
          client: string
          created_at?: string
          date_label?: string | null
          id?: never
          order_index?: number
          project?: string
          published?: boolean
          quote: string
          role?: string
          signatory?: string
          updated_at?: string
        }
        Update: {
          category?: string
          client?: string
          created_at?: string
          date_label?: string | null
          id?: never
          order_index?: number
          project?: string
          published?: boolean
          quote?: string
          role?: string
          signatory?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
