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
          updated_at?: string | null
        }
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
          status?: 'active' | 'waiting' | 'resolved'
          bot_active?: boolean
          last_message_at?: string | null
          unread_count?: number
          updated_at?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          chat_id: string
          sender_type: 'user' | 'agent' | 'bot'
          sender_id: string | null
          text: string | null
          image_url: string | null
          is_payment_receipt: boolean
          platform_message_id: string | null
          read: boolean
          created_at: string | null
        }
        Insert: {
          id?: string
          chat_id: string
          sender_type: 'user' | 'agent' | 'bot'
          sender_id?: string | null
          text?: string | null
          image_url?: string | null
          is_payment_receipt?: boolean
          platform_message_id?: string | null
          read?: boolean
          created_at?: string | null
        }
        Update: {
          id?: string
          chat_id?: string
          sender_type?: 'user' | 'agent' | 'bot'
          sender_id?: string | null
          text?: string | null
          image_url?: string | null
          is_payment_receipt?: boolean
          read?: boolean
        }
      }
      orders: {
        Row: {
          id: string
          organization_id: string
          chat_id: string | null
          customer_name: string
          customer_email: string | null
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
          total?: number
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          updated_at?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          price: number
          created_at: string | null
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          quantity: number
          price: number
          created_at?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          price?: number
        }
      }
      payments: {
        Row: {
          id: string
          organization_id: string
          chat_id: string | null
          customer_name: string
          customer_email: string | null
          amount: number
          method: 'yape' | 'plin' | 'bcp' | 'otro'
          receipt_image_url: string | null
          status: 'pending' | 'verified' | 'rejected'
          notes: string | null
          verified_by: string | null
          verified_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          chat_id?: string | null
          customer_name: string
          customer_email?: string | null
          amount: number
          method: 'yape' | 'plin' | 'bcp' | 'otro'
          receipt_image_url?: string | null
          status?: 'pending' | 'verified' | 'rejected'
          notes?: string | null
          verified_by?: string | null
          verified_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          chat_id?: string | null
          customer_name?: string
          customer_email?: string | null
          amount?: number
          method?: 'yape' | 'plin' | 'bcp' | 'otro'
          receipt_image_url?: string | null
          status?: 'pending' | 'verified' | 'rejected'
          notes?: string | null
          verified_by?: string | null
          verified_at?: string | null
        }
      }
      payment_methods_config: {
        Row: {
          id: string
          organization_id: string
          method: 'yape' | 'plin' | 'bcp'
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
          method: 'yape' | 'plin' | 'bcp'
          enabled?: boolean
          account_name?: string | null
          account_number?: string | null
          account_type?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          method?: 'yape' | 'plin' | 'bcp'
          enabled?: boolean
          account_name?: string | null
          account_number?: string | null
          account_type?: string | null
          updated_at?: string | null
        }
      }
      bot_training_data: {
        Row: {
          id: string
          organization_id: string
          type: 'web' | 'pdf'
          source: string
          content: string | null
          file_url: string | null
          status: 'pending' | 'processing' | 'completed' | 'error'
          error_message: string | null
          extracted_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          type: 'web' | 'pdf'
          source: string
          content?: string | null
          file_url?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'error'
          error_message?: string | null
          extracted_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          type?: 'web' | 'pdf'
          source?: string
          content?: string | null
          file_url?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'error'
          error_message?: string | null
          extracted_at?: string | null
        }
      }
      bot_context: {
        Row: {
          id: string
          organization_id: string
          context_text: string
          source_type: 'training' | 'manual' | 'product' | null
          source_id: string | null
          priority: number
          created_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          context_text: string
          source_type?: 'training' | 'manual' | 'product' | null
          source_id?: string | null
          priority?: number
          created_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          context_text?: string
          source_type?: 'training' | 'manual' | 'product' | null
          source_id?: string | null
          priority?: number
        }
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
  }
}



