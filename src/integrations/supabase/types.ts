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
      chat_messages: {
        Row: {
          anonymous_name: string | null
          chat_room_id: string
          created_at: string | null
          id: string
          is_anonymous: boolean | null
          is_read: boolean | null
          message: string
          property_id: string | null
          sender_id: string | null
        }
        Insert: {
          anonymous_name?: string | null
          chat_room_id: string
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_read?: boolean | null
          message: string
          property_id?: string | null
          sender_id?: string | null
        }
        Update: {
          anonymous_name?: string | null
          chat_room_id?: string
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_read?: boolean | null
          message?: string
          property_id?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_chat_room_id_fkey"
            columns: ["chat_room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_participants: {
        Row: {
          anonymous_name: string | null
          chat_room_id: string
          created_at: string | null
          id: string
          is_anonymous: boolean | null
          last_seen_at: string | null
          property_id: string | null
          user_id: string | null
        }
        Insert: {
          anonymous_name?: string | null
          chat_room_id: string
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          last_seen_at?: string | null
          property_id?: string | null
          user_id?: string | null
        }
        Update: {
          anonymous_name?: string | null
          chat_room_id?: string
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          last_seen_at?: string | null
          property_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_participants_chat_room_id_fkey"
            columns: ["chat_room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_participants_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string | null
          id: string
          last_message_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ad_count: number | null
          cnpj: string | null
          completed_missions: string[] | null
          created_at: string | null
          creci_code: string | null
          display_badge: boolean | null
          email: string
          id: string
          is_agency: boolean | null
          is_realtor: boolean | null
          last_active_at: string | null
          level_id: number | null
          name: string | null
          phone: string | null
          photo_url: string | null
          positive_ratings: number | null
          property_count: number | null
          scheduling_link: string | null
          updated_at: string | null
          work_city: string | null
          work_state: string | null
        }
        Insert: {
          ad_count?: number | null
          cnpj?: string | null
          completed_missions?: string[] | null
          created_at?: string | null
          creci_code?: string | null
          display_badge?: boolean | null
          email: string
          id: string
          is_agency?: boolean | null
          is_realtor?: boolean | null
          last_active_at?: string | null
          level_id?: number | null
          name?: string | null
          phone?: string | null
          photo_url?: string | null
          positive_ratings?: number | null
          property_count?: number | null
          scheduling_link?: string | null
          updated_at?: string | null
          work_city?: string | null
          work_state?: string | null
        }
        Update: {
          ad_count?: number | null
          cnpj?: string | null
          completed_missions?: string[] | null
          created_at?: string | null
          creci_code?: string | null
          display_badge?: boolean | null
          email?: string
          id?: string
          is_agency?: boolean | null
          is_realtor?: boolean | null
          last_active_at?: string | null
          level_id?: number | null
          name?: string | null
          phone?: string | null
          photo_url?: string | null
          positive_ratings?: number | null
          property_count?: number | null
          scheduling_link?: string | null
          updated_at?: string | null
          work_city?: string | null
          work_state?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string | null
          area: number | null
          bathrooms: number | null
          bedrooms: number | null
          city: string
          contact_phone: string | null
          created_at: string | null
          description: string | null
          id: string
          is_featured: boolean | null
          is_featured_until: string | null
          is_for_rent: boolean
          owner_id: string
          price: number
          property_type: string
          state: string
          title: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          area?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city: string
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          is_featured_until?: string | null
          is_for_rent?: boolean
          owner_id: string
          price: number
          property_type: string
          state: string
          title: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          area?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          is_featured_until?: string | null
          is_for_rent?: boolean
          owner_id?: string
          price?: number
          property_type?: string
          state?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      property_images: {
        Row: {
          created_at: string | null
          id: string
          image_url: string
          is_main: boolean | null
          property_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url: string
          is_main?: boolean | null
          property_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string
          is_main?: boolean | null
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
