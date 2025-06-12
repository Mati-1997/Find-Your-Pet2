"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase/client-only"

interface UserDebugInfo {
  authUsers: any[]
  publicUsers: any[]
  mismatchedUsers: any[]
}

export default function DebugUsersPage() {
  const [debugInfo, setDebugInfo] = useState<UserDebugInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const checkUsers = async () => {
    setLoading(true)
    setError("")

    try {
      // Get current user
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      // Get public users
      const { data: publicUsers, error: publicError } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false })

      if (publicError) {
        throw new Error(`Error getting public users: ${publicError.message}`)
      }

      setDebugInfo({
        authUsers: currentUser ? [currentUser] : [],
        publicUsers: publicUsers || [],
        mismatchedUsers: [],
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createMissingProfile = async () => {
    setLoading(true)
    setError("")

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("No hay usuario autenticado")
      }

      const { data, error } = await supabase
        .from("users")
        .upsert({
          id: user.id,
          email: user.email || "",
          full_name: user.user_metadata?.full_name || user.email || "",
          phone: user.user_metadata?.phone || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()

      if (error) {
        throw error
      }

      alert("Perfil creado exitosamente")
      checkUsers()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkUsers()
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Debug de Usuarios</CardTitle>
          <CardDescription>Herramienta para diagnosticar problemas con los perfiles de usuario</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button onClick={checkUsers} disabled={loading}>
              {loading ? "Verificando..." : "Verificar Usuarios"}
            </Button>
            <Button onClick={createMissingProfile} disabled={loading} variant="outline">
              Crear Perfil Faltante
            </Button>
          </div>

          {debugInfo && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Usuario Autenticado Actual:</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(debugInfo.authUsers, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Usuarios en tabla pública ({debugInfo.publicUsers.length}):</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-60">
                  {JSON.stringify(debugInfo.publicUsers, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
