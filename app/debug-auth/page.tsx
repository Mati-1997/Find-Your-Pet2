"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugAuthPage() {
  const [authInfo, setAuthInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        setAuthInfo({
          hasSession: !!session,
          userId: session?.user?.id,
          userEmail: session?.user?.email,
          error: error?.message,
          cookies: document.cookie,
          timestamp: new Date().toISOString(),
        })
      } catch (error) {
        setAuthInfo({
          error: error.message,
          timestamp: new Date().toISOString(),
        })
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const refreshAuth = async () => {
    setLoading(true)
    const supabase = createClient()
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    setAuthInfo({
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      error: error?.message,
      cookies: document.cookie,
      timestamp: new Date().toISOString(),
    })
    setLoading(false)
  }

  if (loading) {
    return <div className="p-4">Cargando información de autenticación...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Debug de Autenticación</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">{JSON.stringify(authInfo, null, 2)}</pre>
          <Button onClick={refreshAuth} className="mt-4">
            Refrescar
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
