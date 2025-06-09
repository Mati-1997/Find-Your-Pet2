"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { authService } from "@/lib/supabase/auth"
import type { User } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/supabase/types"

type UserProfile = Database["public"]["Tables"]["users"]["Row"]

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user ?? null)

      if (session?.user) {
        const userProfile = await authService.getUserProfile(session.user.id)
        setProfile(userProfile)
      }

      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)

      if (session?.user) {
        const userProfile = await authService.getUserProfile(session.user.id)
        setProfile(userProfile)
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signIn = async (email: string, password: string) => {
    return authService.signIn(email, password)
  }

  const signUp = async (email: string, password: string, userData: { full_name?: string; phone?: string }) => {
    return authService.signUp(email, password, userData)
  }

  const signOut = async () => {
    return authService.signOut()
  }

  const updateProfile = async (updates: Partial<Omit<UserProfile, "id" | "created_at">>) => {
    if (!user) throw new Error("No user logged in")

    const updatedProfile = await authService.updateUserProfile(user.id, updates)
    setProfile(updatedProfile)
    return updatedProfile
  }

  return {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  }
}
