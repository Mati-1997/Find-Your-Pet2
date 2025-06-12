"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

export function useAuthCheck(options = { redirectOnNoAuth: false }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()

        // Get initial session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        console.log("Auth check:", {
          hasSession: !!session,
          userId: session?.user?.id,
          error: error?.message,
        })

        if (session?.user) {
          setUser(session.user)
          setIsAuthenticated(true)
        } else {
          setUser(null)
          setIsAuthenticated(false)
        }

        // Listen for auth changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log("Auth state changed:", event, !!session)

          if (session?.user) {
            setUser(session.user)
            setIsAuthenticated(true)
          } else {
            setUser(null)
            setIsAuthenticated(false)
          }
        })

        setLoading(false)

        return () => subscription.unsubscribe()
      } catch (error) {
        console.error("Auth check error:", error)
        setLoading(false)
        setIsAuthenticated(false)
      }
    }

    checkAuth()
  }, [])

  return { user, loading, isAuthenticated }
}
