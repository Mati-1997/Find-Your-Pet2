import { createClient } from "@/lib/supabase/client"

export interface ActivityData {
  user_id: string
  type: "pet_registered" | "pet_lost" | "pet_found" | "report_created" | "help_provided" | "profile_updated"
  description: string
  points?: number
  metadata?: Record<string, any>
}

export class ActivityService {
  private supabase = createClient()

  async createActivity(activityData: ActivityData) {
    try {
      console.log("Creando actividad:", activityData)

      const { data, error } = await this.supabase.from("user_activities").insert([
        {
          user_id: activityData.user_id,
          activity_type: activityData.type,
          description: activityData.description,
          points_earned: activityData.points || 0,
          metadata: activityData.metadata || {},
          created_at: new Date().toISOString(),
        },
      ])

      if (error) {
        console.error("Error creating activity:", error)
        return { success: false, error }
      }

      // También actualizar los puntos del usuario
      if (activityData.points && activityData.points > 0) {
        await this.updateUserPoints(activityData.user_id, activityData.points)
      }

      return { success: true, data }
    } catch (error) {
      console.error("Error in createActivity:", error)
      return { success: false, error }
    }
  }

  async updateUserPoints(userId: string, points: number) {
    try {
      // Primero obtener los puntos actuales
      const { data: currentUser, error: fetchError } = await this.supabase
        .from("user_profiles")
        .select("points")
        .eq("user_id", userId)
        .single()

      if (fetchError) {
        // Si no existe el perfil, crearlo
        const { error: insertError } = await this.supabase.from("user_profiles").insert([
          {
            user_id: userId,
            points: points,
            created_at: new Date().toISOString(),
          },
        ])

        if (insertError) {
          console.error("Error creating user profile:", insertError)
        }
        return
      }

      // Actualizar los puntos
      const newPoints = (currentUser?.points || 0) + points
      const { error: updateError } = await this.supabase
        .from("user_profiles")
        .update({ points: newPoints })
        .eq("user_id", userId)

      if (updateError) {
        console.error("Error updating user points:", updateError)
      }
    } catch (error) {
      console.error("Error in updateUserPoints:", error)
    }
  }

  async getUserActivities(userId: string, limit = 10) {
    try {
      const { data, error } = await this.supabase
        .from("user_activities")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) {
        console.error("Error fetching user activities:", error)
        return { success: false, error, data: [] }
      }

      return { success: true, data: data || [] }
    } catch (error) {
      console.error("Error in getUserActivities:", error)
      return { success: false, error, data: [] }
    }
  }

  async getUserPoints(userId: string) {
    try {
      const { data, error } = await this.supabase.from("user_profiles").select("points").eq("user_id", userId).single()

      if (error) {
        console.error("Error fetching user points:", error)
        return 0
      }

      return data?.points || 0
    } catch (error) {
      console.error("Error in getUserPoints:", error)
      return 0
    }
  }
}

export const activityService = new ActivityService()
