import { createClient } from "./client"
import type { Database } from "./types"

type AlertHistory = Database["public"]["Tables"]["alert_history"]["Row"]
type AlertSettings = Database["public"]["Tables"]["alert_settings"]["Row"]
type AlertHistoryInsert = Database["public"]["Tables"]["alert_history"]["Insert"]
type AlertSettingsInsert = Database["public"]["Tables"]["alert_settings"]["Insert"]
type AlertSettingsUpdate = Database["public"]["Tables"]["alert_settings"]["Update"]

export class AlertService {
  private supabase = createClient()

  // Alert History Methods
  async getPetAlerts(petId: string, status?: string): Promise<AlertHistory[]> {
    let query = this.supabase.from("alert_history").select("*").eq("pet_id", petId)

    if (status) {
      query = query.eq("status", status)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  }

  async createAlert(alert: AlertHistoryInsert): Promise<AlertHistory> {
    const { data, error } = await this.supabase.from("alert_history").insert(alert).select().single()

    if (error) throw error
    return data
  }

  async updateAlertStatus(
    alertId: string,
    status: "active" | "resolved" | "ignored",
    resolvedBy?: string,
  ): Promise<AlertHistory> {
    const updates: any = { status }

    if (status === "resolved") {
      updates.resolved_at = new Date().toISOString()
      if (resolvedBy) updates.resolved_by = resolvedBy
    }

    const { data, error } = await this.supabase
      .from("alert_history")
      .update(updates)
      .eq("id", alertId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Alert Settings Methods
  async getPetAlertSettings(petId: string): Promise<AlertSettings[]> {
    const { data, error } = await this.supabase.from("alert_settings").select("*").eq("pet_id", petId)

    if (error) throw error
    return data || []
  }

  async createAlertSetting(setting: AlertSettingsInsert): Promise<AlertSettings> {
    const { data, error } = await this.supabase.from("alert_settings").insert(setting).select().single()

    if (error) throw error
    return data
  }

  async updateAlertSetting(settingId: string, updates: AlertSettingsUpdate): Promise<AlertSettings> {
    const { data, error } = await this.supabase
      .from("alert_settings")
      .update(updates)
      .eq("id", settingId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deleteAlertSetting(settingId: string): Promise<void> {
    const { error } = await this.supabase.from("alert_settings").delete().eq("id", settingId)

    if (error) throw error
  }

  async getActiveAlerts(petId?: string): Promise<AlertHistory[]> {
    let query = this.supabase.from("alert_history").select("*").eq("status", "active")

    if (petId) {
      query = query.eq("pet_id", petId)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  }
}

export const alertService = new AlertService()
