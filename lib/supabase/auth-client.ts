import { createClient } from "./client"
import { createServerClient } from "./server"
import type { Database } from "./types"

type User = Database["public"]["Tables"]["users"]["Row"]

export class AuthService {
  private supabase = createClient()

  async signUp(email: string, password: string, userData: { full_name?: string; phone?: string }) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    })

    if (error) throw error

    // Create user profile
    if (data.user) {
      await this.createUserProfile(data.user.id, {
        email,
        full_name: userData.full_name || null,
        phone: userData.phone || null,
      })
    }

    return data
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut()
    if (error) throw error
  }

  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser()
    if (error) throw error
    return user
  }

  async getUserProfile(userId: string): Promise<User | null> {
    const { data, error } = await this.supabase.from("users").select("*").eq("id", userId).single()

    if (error && error.code !== "PGRST116") throw error
    return data
  }

  async createUserProfile(userId: string, profile: Omit<User, "id" | "created_at" | "updated_at">) {
    const { data, error } = await this.supabase
      .from("users")
      .insert({
        id: userId,
        ...profile,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateUserProfile(userId: string, updates: Partial<Omit<User, "id" | "created_at">>) {
    const { data, error } = await this.supabase.from("users").update(updates).eq("id", userId).select().single()

    if (error) throw error
    return data
  }

  async resetPassword(email: string) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) throw error
  }
}

export const authService = new AuthService()

