"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
<<<<<<< HEAD
import type { User } from "@supabase/supabase-js"

export function useAuthCheck(redirectOnNoAuth = true) {
=======
import type { User } from "@supabase/auth-helpers-nextjs"

export function useAuthCheck() {
>>>>>>> fe0100055883c098177152f8554a28522e852ad3
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
<<<<<<< HEAD

        // Get initial session
=======
>>>>>>> fe0100055883c098177152f8554a28522e852ad3
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        console.log("Auth check:", {
          hasSession: !!session,
          userId: session?.user?.id,
          error: error?.message,
<<<<<<< HEAD
          redirectOnNoAuth,
=======
>>>>>>> fe0100055883c098177152f8554a28522e852ad3
        })

        if (error) {
          console.error("Session error:", error)
<<<<<<< HEAD
          if (redirectOnNoAuth) {
            router.push("/login")
          }
=======
          // Don't redirect on error, let the page handle it
>>>>>>> fe0100055883c098177152f8554a28522e852ad3
          setLoading(false)
          return
        }

        if (!session) {
<<<<<<< HEAD
          console.log("No session found")
          if (redirectOnNoAuth) {
            router.push("/login")
          }
          setLoading(false)
=======
          console.log("No session found, redirecting to login")
          router.push("/login")
>>>>>>> fe0100055883c098177152f8554a28522e852ad3
          return
        }

        setUser(session.user)
<<<<<<< HEAD
        setLoading(false)
=======
>>>>>>> fe0100055883c098177152f8554a28522e852ad3

        // Listen for auth changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log("Auth state changed:", event, !!session)

          if (event === "SIGNED_OUT" || !session) {
            setUser(null)
<<<<<<< HEAD
            if (redirectOnNoAuth) {
              router.push("/login")
            }
=======
            router.push("/login")
>>>>>>> fe0100055883c098177152f8554a28522e852ad3
          } else if (session) {
            setUser(session.user)
          }
        })

<<<<<<< HEAD
        return () => subscription.unsubscribe()
      } catch (error) {
        console.error("Auth check error:", error)
        if (redirectOnNoAuth) {
          router.push("/login")
        }
=======
        setLoading(false)

        return () => subscription.unsubscribe()
      } catch (error) {
        console.error("Auth check error:", error)
>>>>>>> fe0100055883c098177152f8554a28522e852ad3
        setLoading(false)
      }
    }

    checkAuth()
<<<<<<< HEAD
  }, [router, redirectOnNoAuth])
=======
  }, [router])
>>>>>>> fe0100055883c098177152f8554a28522e852ad3

  return { user, loading }
}
