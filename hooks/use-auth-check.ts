"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

export function useAuthCheck(redirectOnNoAuth = true) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

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
          redirectOnNoAuth,
        })

        if (error) {
          console.error("Session error:", error)
          if (redirectOnNoAuth) {
            router.push("/login")
          }
          setLoading(false)
          return
        }

        if (!session) {
          console.log("No session found")
          if (redirectOnNoAuth) {
            router.push("/login")
          }
          setLoading(false)
          return
        }

        setUser(session.user)
        setLoading(false)

        // Listen for auth changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log("Auth state changed:", event, !!session)

          if (event === "SIGNED_OUT" || !session) {
            setUser(null)
            if (redirectOnNoAuth) {
              router.push("/login")
            }
          } else if (session) {
            setUser(session.user)
          }
        })

        return () => subscription.unsubscribe()
      } catch (error) {
        console.error("Auth check error:", error)
        if (redirectOnNoAuth) {
          router.push("/login")
        }
        setLoading(false)
      }
    }

    checkAuth()
  }, [router, redirectOnNoAuth])

  return { user, loading }
}
