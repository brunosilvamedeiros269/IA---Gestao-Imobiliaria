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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      agencies: {
        Row: {
          address: string | null
          cnpj: string | null
          created_at: string
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          slug: string
        }
        Insert: {
          address?: string | null
          cnpj?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          slug: string
        }
        Update: {
          address?: string | null
          cnpj?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          slug?: string
        }
        Relationships: []
      }
      lead_notes: {
        Row: {
          agency_id: string
          broker_id: string
          content: string
          created_at: string
          id: string
          lead_id: string
        }
        Insert: {
          agency_id: string
          broker_id: string
          content: string
          created_at?: string
          id?: string
          lead_id: string
        }
        Update: {
          agency_id?: string
          broker_id?: string
          content?: string
          created_at?: string
          id?: string
          lead_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_notes_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_notes_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "users_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_notes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          agency_id: string
          budget_max: number | null
          budget_min: number | null
          created_at: string
          email: string | null
          funnel_status: Database["public"]["Enums"]["funnel_status"]
          id: string
          name: string
          phone: string | null
          property_id: string | null
          source: string | null
          urgency_score: number | null
        }
        Insert: {
          agency_id: string
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          email?: string | null
          funnel_status?: Database["public"]["Enums"]["funnel_status"]
          id?: string
          name: string
          phone?: string | null
          property_id?: string | null
          source?: string | null
          urgency_score?: number | null
        }
        Update: {
          agency_id?: string
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          email?: string | null
          funnel_status?: Database["public"]["Enums"]["funnel_status"]
          id?: string
          name?: string
          phone?: string | null
          property_id?: string | null
          source?: string | null
          urgency_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          accepts_financing: boolean | null
          address_city: string | null
          address_neighborhood: string | null
          address_number: string | null
          address_state: string | null
          address_street: string | null
          address_summary: string | null
          address_zipcode: string | null
          agency_id: string
          amenities: string[] | null
          bathrooms: number | null
          bedrooms: number | null
          broker_id: string | null
          commission_percentage: number | null
          condominio_fee: number | null
          created_at: string
          description: string | null
          floor_number: number | null
          id: string
          internal_notes: string | null
          iptu: number | null
          is_exclusive: boolean | null
          is_furnished: boolean | null
          listing_type: Database["public"]["Enums"]["listing_type"]
          owner_name: string | null
          owner_phone: string | null
          parking_spots: number | null
          pets_allowed: boolean | null
          photos: string[] | null
          price: number
          property_type: string
          show_full_address: boolean | null
          status: Database["public"]["Enums"]["property_status"]
          suites_count: number | null
          title: string
          useful_area: number | null
        }
        Insert: {
          accepts_financing?: boolean | null
          address_city?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_summary?: string | null
          address_zipcode?: string | null
          agency_id: string
          amenities?: string[] | null
          bathrooms?: number | null
          bedrooms?: number | null
          broker_id?: string | null
          commission_percentage?: number | null
          condominio_fee?: number | null
          created_at?: string
          description?: string | null
          floor_number?: number | null
          id?: string
          internal_notes?: string | null
          iptu?: number | null
          is_exclusive?: boolean | null
          is_furnished?: boolean | null
          listing_type: Database["public"]["Enums"]["listing_type"]
          owner_name?: string | null
          owner_phone?: string | null
          parking_spots?: number | null
          pets_allowed?: boolean | null
          photos?: string[] | null
          price: number
          property_type?: string
          show_full_address?: boolean | null
          status?: Database["public"]["Enums"]["property_status"]
          suites_count?: number | null
          title: string
          useful_area?: number | null
        }
        Update: {
          accepts_financing?: boolean | null
          address_city?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_summary?: string | null
          address_zipcode?: string | null
          agency_id?: string
          amenities?: string[] | null
          bathrooms?: number | null
          bedrooms?: number | null
          broker_id?: string | null
          commission_percentage?: number | null
          condominio_fee?: number | null
          created_at?: string
          description?: string | null
          floor_number?: number | null
          id?: string
          internal_notes?: string | null
          iptu?: number | null
          is_exclusive?: boolean | null
          is_furnished?: boolean | null
          listing_type?: Database["public"]["Enums"]["listing_type"]
          owner_name?: string | null
          owner_phone?: string | null
          parking_spots?: number | null
          pets_allowed?: boolean | null
          photos?: string[] | null
          price?: number
          property_type?: string
          show_full_address?: boolean | null
          status?: Database["public"]["Enums"]["property_status"]
          suites_count?: number | null
          title?: string
          useful_area?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "users_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      users_profile: {
        Row: {
          agency_id: string | null
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          agency_id?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          agency_id?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "users_profile_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_agency_id: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      funnel_status: "new" | "in_progress" | "visit" | "won" | "lost"
      listing_type: "sale" | "rent"
      property_status: "active" | "inactive" | "sold" | "rented" | "suspended"
      user_role: "admin" | "broker"
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
      funnel_status: ["new", "in_progress", "visit", "won", "lost"],
      listing_type: ["sale", "rent"],
      property_status: ["active", "inactive", "sold", "rented", "suspended"],
      user_role: ["admin", "broker"],
    },
  },
} as const
