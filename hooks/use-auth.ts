"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { authService } from "@/lib/supabase/auth-client"
import type { User } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/supabase/types"
import { useRouter } from "next/navigation"

type UserProfile = Database["public"]["Tables"]["users"]["Row"]

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("Session error:", sessionError)
          if (sessionError.message.includes("jwt expired")) {
            // Intentar refrescar la sesión
            const { error: refreshError } = await supabase.auth.refreshSession()
            if (refreshError) {
              console.error("Refresh error:", refreshError)
              setError("Sesión expirada. Por favor, inicia sesión nuevamente.")
              await supabase.auth.signOut()
              router.push("/login")
              return
            }
          }
        }

        setUser(session?.user ?? null)

        if (session?.user) {
          const userProfile = await authService.getUserProfile(session.user.id)
          setProfile(userProfile)
        }

        setLoading(false)
      } catch (err: any) {
        console.error("Auth error:", err)
        setError(err.message)
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event)

      if (event === "TOKEN_REFRESHED") {
        console.log("Token refreshed successfully")
        setError(null)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setProfile(null)
        setError(null)
      } else if (event === "SIGNED_IN") {
        setUser(session?.user ?? null)
        if (session?.user) {
          const userProfile = await authService.getUserProfile(session.user.id)
          setProfile(userProfile)
        }
        setError(null)
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth, router])

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      return await authService.signIn(email, password)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const signUp = async (email: string, password: string, userData: { full_name?: string; phone?: string }) => {
    try {
      setError(null)
      return await authService.signUp(email, password, userData)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      return await authService.signOut()
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const updateProfile = async (updates: Partial<Omit<UserProfile, "id" | "created_at">>) => {
    if (!user) throw new Error("No user logged in")

    try {
      setError(null)
      const updatedProfile = await authService.updateUserProfile(user.id, updates)
      setProfile(updatedProfile)
      return updatedProfile
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  return {
    user,
    profile,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
  }
}
