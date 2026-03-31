// Tipos generados desde Supabase
// Para actualizar: npx supabase gen types typescript --project-id fsnolvozwcnbyuradiru > src/lib/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          owner_id: string | null
          openai_api_key: string | null
          facebook_page_id: string | null
          whatsapp_phone_number: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          owner_id?: string | null
          openai_api_key?: string | null
          facebook_page_id?: string | null
          whatsapp_phone_number?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          owner_id?: string | null
          openai_api_key?: string | null
          facebook_page_id?: string | null
          whatsapp_phone_number?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      whatsapp_integrations: {
        Row: {
          id: string
          organization_id: string
          phone_number: string
          phone_number_id: string | null
          access_token: string | null
          business_account_id: string | null
          app_id: string | null
          app_secret: string | null
          webhook_verify_token: string | null
          status: 'pending' | 'connected' | 'disconnected' | 'error'
          verified_at: string | null
          last_sync_at: string | null
          error_message: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          phone_number: string
          phone_number_id?: string | null
          access_token?: string | null
          business_account_id?: string | null
          app_id?: string | null
          app_secret?: string | null
          webhook_verify_token?: string | null
          status?: 'pending' | 'connected' | 'disconnected' | 'error'
          verified_at?: string | null
          last_sync_at?: string | null
          error_message?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          phone_number?: string
          phone_number_id?: string | null
          access_token?: string | null
          business_account_id?: string | null
          app_id?: string | null
          app_secret?: string | null
          webhook_verify_token?: string | null
          status?: 'pending' | 'connected' | 'disconnected' | 'error'
          verified_at?: string | null
          last_sync_at?: string | null
          error_message?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          organization_id: string
          name: string
          description: string | null
          price: number
          category: string
          image_url: string | null
          stock: number | null
          shopify_product_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          description?: string | null
          price: number
          category: string
          image_url?: string | null
          stock?: number | null
          shopify_product_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          category?: string
          image_url?: string | null
          stock?: number | null
          shopify_product_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      chats: {
        Row: {
          id: string
          organization_id: string
          customer_name: string
          customer_email: string | null
          customer_phone: string | null
          customer_avatar: string | null
          platform: 'facebook' | 'whatsapp' | 'web'
          platform_conversation_id: string | null
          status: 'active' | 'waiting' | 'resolved'
          bot_active: boolean
          last_message_at: string | null
          unread_count: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          customer_name: string
          customer_email?: string | null
          customer_phone?: string | null
          customer_avatar?: string | null
          platform: 'facebook' | 'whatsapp' | 'web'
          platform_conversation_id?: string | null
          status?: 'active' | 'waiting' | 'resolved'
          bot_active?: boolean
          last_message_at?: string | null
          unread_count?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          customer_name?: string
          customer_email?: string | null
          customer_phone?: string | null
          customer_avatar?: string | null
          platform?: 'facebook' | 'whatsapp' | 'web'
          platform_conversation_id?: string | null
          status?: 'active' | 'waiting' | 'resolved'
          bot_active?: boolean
          last_message_at?: string | null
          unread_count?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          chat_id: string
          sender: 'user' | 'agent' | 'bot'
          text: string
          image_url: string | null
          is_payment_receipt: boolean
          platform_message_id: string | null
          status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          chat_id: string
          sender: 'user' | 'agent' | 'bot'
          text: string
          image_url?: string | null
          is_payment_receipt?: boolean
          platform_message_id?: string | null
          status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          chat_id?: string
          sender?: 'user' | 'agent' | 'bot'
          text?: string
          image_url?: string | null
          is_payment_receipt?: boolean
          platform_message_id?: string | null
          status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          organization_id: string
          chat_id: string | null
          customer_name: string
          customer_email: string | null
          customer_phone: string | null
          total: number
          status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          chat_id?: string | null
          customer_name: string
          customer_email?: string | null
          customer_phone?: string | null
          total: number
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          chat_id?: string | null
          customer_name?: string
          customer_email?: string | null
          customer_phone?: string | null
          total?: number
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          name: string
          quantity: number
          price: number
          created_at: string | null
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          name: string
          quantity: number
          price: number
          created_at?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          name?: string
          quantity?: number
          price?: number
          created_at?: string | null
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          id: string
          organization_id: string
          type: 'yape' | 'plin' | 'bcp'
          enabled: boolean
          account_name: string | null
          account_number: string | null
          account_type: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          type: 'yape' | 'plin' | 'bcp'
          enabled: boolean
          account_name?: string | null
          account_number?: string | null
          account_type?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          type?: 'yape' | 'plin' | 'bcp'
          enabled?: boolean
          account_name?: string | null
          account_number?: string | null
          account_type?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      bot_trainings: {
        Row: {
          id: string
          organization_id: string
          type: 'web' | 'pdf'
          source: string
          content: string | null
          status: 'pending' | 'processing' | 'completed' | 'error'
          error_message: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          type: 'web' | 'pdf'
          source: string
          content?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'error'
          error_message?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          type?: 'web' | 'pdf'
          source?: string
          content?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'error'
          error_message?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          id: string
          organization_id: string
          name: string
          color: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          color?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          color?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      chat_tags: {
        Row: {
          id: string
          chat_id: string
          tag_id: string
          created_at: string | null
        }
        Insert: {
          id?: string
          chat_id: string
          tag_id: string
          created_at?: string | null
        }
        Update: {
          id?: string
          chat_id?: string
          tag_id?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
