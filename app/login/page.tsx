"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle2 } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Verificar si hay parámetros de error o éxito en la URL
    const errorParam = searchParams.get("error")
    const messageParam = searchParams.get("message")

    if (errorParam === "verification_failed") {
      setError("Error al verificar el email. Por favor, intenta de nuevo.")
    } else if (errorParam === "callback_error") {
      setError("Error en la verificación. Por favor, contacta soporte.")
    } else if (messageParam === "email_verified") {
      setSuccess("¡Email verificado exitosamente! Ahora puedes iniciar sesión.")
    }

    // Verificar si ya hay una sesión activa
    const checkSession = async () => {
      try {
        const supabase = getSupabaseClient()
        const { data, error } = await supabase.auth.getSession()

        if (data.session) {
          console.log("Sesión activa encontrada, redirigiendo...")
          router.push("/home")
        }
      } catch (error) {
        console.error("Error checking session:", error)
      }
    }

    checkSession()
  }, [router, searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const supabase = getSupabaseClient()

      console.log("Intentando iniciar sesión con email:", formData.email)

      // Iniciar sesión
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        console.error("Error de autenticación:", error)

        if (error.message.includes("Email not confirmed")) {
          throw new Error("Por favor, verifica tu email antes de iniciar sesión. Revisa tu bandeja de entrada.")
        } else if (error.message.includes("Invalid login credentials")) {
          throw new Error("Email o contraseña incorrectos.")
        } else {
          throw new Error(error.message)
        }
      }

      if (!data.user) {
        throw new Error("Error al iniciar sesión")
      }

      console.log("Sesión iniciada exitosamente:", data.user.id)

      // Redirigir al home
      router.push("/home")
    } catch (error: any) {
      console.error("Error de login:", error)
      setError(error.message || "Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Find Your Pet</CardTitle>
          <CardDescription>Inicia sesión en tu cuenta</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                <AlertTitle className="text-green-800 font-medium">¡Email verificado!</AlertTitle>
                <AlertDescription className="text-green-700">{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Iniciar Sesión
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <div className="text-sm text-gray-600">
              <Link href="/forgot-password" className="text-blue-600 hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="text-sm text-gray-600">
              ¿No tienes cuenta?{" "}
              <Link href="/register" className="text-blue-600 hover:underline">
                Regístrate
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
