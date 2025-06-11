"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/auth-helpers-nextjs"

export function useAuthCheck() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        console.log("Auth check:", {
          hasSession: !!session,
          userId: session?.user?.id,
          error: error?.message,
        })

        if (error) {
          console.error("Session error:", error)
          // Don't redirect on error, let the page handle it
          setLoading(false)
          return
        }

        if (!session) {
          console.log("No session found, redirecting to login")
          router.push("/login")
          return
        }

        setUser(session.user)

        // Listen for auth changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log("Auth state changed:", event, !!session)

          if (event === "SIGNED_OUT" || !session) {
            setUser(null)
            router.push("/login")
          } else if (session) {
            setUser(session.user)
          }
        })

        setLoading(false)

        return () => subscription.unsubscribe()
      } catch (error) {
        console.error("Auth check error:", error)
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  return { user, loading }
}
