export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      pets: {
        Row: {
          id: string
          user_id: string
          name: string
          breed: string | null
          age: number | null
          weight: number | null
          color: string | null
          description: string | null
          image_url: string | null
          microchip_id: string | null
          is_lost: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          breed?: string | null
          age?: number | null
          weight?: number | null
          color?: string | null
          description?: string | null
          image_url?: string | null
          microchip_id?: string | null
          is_lost?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          breed?: string | null
          age?: number | null
          weight?: number | null
          color?: string | null
          description?: string | null
          image_url?: string | null
          microchip_id?: string | null
          is_lost?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      tracking_devices: {
        Row: {
          id: string
          pet_id: string
          device_id: string
          device_type: string
          battery_level: number
          is_active: boolean
          last_ping: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pet_id: string
          device_id: string
          device_type?: string
          battery_level?: number
          is_active?: boolean
          last_ping?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pet_id?: string
          device_id?: string
          device_type?: string
          battery_level?: number
          is_active?: boolean
          last_ping?: string
          created_at?: string
          updated_at?: string
        }
      }
      locations: {
        Row: {
          id: string
          pet_id: string
          device_id: string | null
          latitude: number
          longitude: number
          altitude: number | null
          speed: number | null
          accuracy: number | null
          battery_level: number | null
          is_moving: boolean
          location_point: unknown | null
          timestamp: string
          created_at: string
        }
        Insert: {
          id?: string
          pet_id: string
          device_id?: string | null
          latitude: number
          longitude: number
          altitude?: number | null
          speed?: number | null
          accuracy?: number | null
          battery_level?: number | null
          is_moving?: boolean
          location_point?: unknown | null
          timestamp?: string
          created_at?: string
        }
        Update: {
          id?: string
          pet_id?: string
          device_id?: string | null
          latitude?: number
          longitude?: number
          altitude?: number | null
          speed?: number | null
          accuracy?: number | null
          battery_level?: number | null
          is_moving?: boolean
          location_point?: unknown | null
          timestamp?: string
          created_at?: string
        }
      }
      safe_zones: {
        Row: {
          id: string
          pet_id: string
          name: string
          center_latitude: number
          center_longitude: number
          radius: number
          is_active: boolean
          zone_polygon: unknown | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pet_id: string
          name: string
          center_latitude: number
          center_longitude: number
          radius: number
          is_active?: boolean
          zone_polygon?: unknown | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pet_id?: string
          name?: string
          center_latitude?: number
          center_longitude?: number
          radius?: number
          is_active?: boolean
          zone_polygon?: unknown | null
          created_at?: string
          updated_at?: string
        }
      }
      alert_settings: {
        Row: {
          id: string
          pet_id: string
          alert_type: string
          is_enabled: boolean
          threshold_value: number | null
          severity: string
          notify_push: boolean
          notify_email: boolean
          notify_sms: boolean
          time_window: number | null
          geofence_radius: number | null
          time_restrictions: Json | null
          days_active: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pet_id: string
          alert_type: string
          is_enabled?: boolean
          threshold_value?: number | null
          severity?: string
          notify_push?: boolean
          notify_email?: boolean
          notify_sms?: boolean
          time_window?: number | null
          geofence_radius?: number | null
          time_restrictions?: Json | null
          days_active?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pet_id?: string
          alert_type?: string
          is_enabled?: boolean
          threshold_value?: number | null
          severity?: string
          notify_push?: boolean
          notify_email?: boolean
          notify_sms?: boolean
          time_window?: number | null
          geofence_radius?: number | null
          time_restrictions?: Json | null
          days_active?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      alert_history: {
        Row: {
          id: string
          pet_id: string
          alert_type: string
          title: string
          description: string | null
          severity: string
          status: string
          trigger_value: number | null
          threshold_value: number | null
          location_latitude: number | null
          location_longitude: number | null
          related_data: Json | null
          created_at: string
          resolved_at: string | null
          resolved_by: string | null
        }
        Insert: {
          id?: string
          pet_id: string
          alert_type: string
          title: string
          description?: string | null
          severity: string
          status?: string
          trigger_value?: number | null
          threshold_value?: number | null
          location_latitude?: number | null
          location_longitude?: number | null
          related_data?: Json | null
          created_at?: string
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Update: {
          id?: string
          pet_id?: string
          alert_type?: string
          title?: string
          description?: string | null
          severity?: string
          status?: string
          trigger_value?: number | null
          threshold_value?: number | null
          location_latitude?: number | null
          location_longitude?: number | null
          related_data?: Json | null
          created_at?: string
          resolved_at?: string | null
          resolved_by?: string | null
        }
      }
      ai_recognitions: {
        Row: {
          id: string
          user_id: string
          image_url: string
          recognition_results: Json | null
          confidence_score: number | null
          matched_pet_id: string | null
          processing_status: string
          created_at: string
          processed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          image_url: string
          recognition_results?: Json | null
          confidence_score?: number | null
          matched_pet_id?: string | null
          processing_status?: string
          created_at?: string
          processed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          image_url?: string
          recognition_results?: Json | null
          confidence_score?: number | null
          matched_pet_id?: string | null
          processing_status?: string
          created_at?: string
          processed_at?: string | null
        }
      }
      lost_pet_reports: {
        Row: {
          id: string
          pet_id: string
          reporter_id: string
          report_type: string
          description: string | null
          last_seen_latitude: number | null
          last_seen_longitude: number | null
          last_seen_at: string | null
          contact_info: Json | null
          reward_amount: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pet_id: string
          reporter_id: string
          report_type: string
          description?: string | null
          last_seen_latitude?: number | null
          last_seen_longitude?: number | null
          last_seen_at?: string | null
          contact_info?: Json | null
          reward_amount?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pet_id?: string
          reporter_id?: string
          report_type?: string
          description?: string | null
          last_seen_latitude?: number | null
          last_seen_longitude?: number | null
          last_seen_at?: string | null
          contact_info?: Json | null
          reward_amount?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
