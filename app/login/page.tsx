"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { createClient } from "@supabase/supabase-js"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Verificar si hay parámetros de error o éxito en la URL
    const urlParams = new URLSearchParams(window.location.search)
    const errorParam = urlParams.get("error")
    const messageParam = urlParams.get("message")

    if (errorParam === "verification_failed") {
      setError("Error al verificar el email. Por favor, intenta de nuevo.")
    } else if (errorParam === "callback_error") {
      setError("Error en la verificación. Por favor, contacta soporte.")
    } else if (messageParam === "email_verified") {
      setSuccess("¡Email verificado exitosamente! Ahora puedes iniciar sesión.")
    }
  }, [])

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
    setSuccess("")

    try {
      // Verificar variables de entorno
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey) {
        throw new Error("Configuración de Supabase no encontrada. Verifica las variables de entorno.")
      }

      // Crear cliente de Supabase
      const supabase = createClient(supabaseUrl, supabaseKey)

      console.log("Intentando iniciar sesión con email:", formData.email)

      // Iniciar sesión
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (authError) {
        console.error("Error de autenticación:", authError)

        // Manejar diferentes tipos de errores
        if (authError.message.includes("Email not confirmed")) {
          throw new Error("Por favor, verifica tu email antes de iniciar sesión. Revisa tu bandeja de entrada.")
        } else if (authError.message.includes("Invalid login credentials")) {
          throw new Error("Email o contraseña incorrectos.")
        } else {
          throw new Error(authError.message)
        }
      }

      if (!authData.user) {
        throw new Error("Error al iniciar sesión")
      }

      console.log("Sesión iniciada exitosamente:", authData.user.id)
      console.log("Usuario verificado:", authData.user.email_confirmed_at ? "Sí" : "No")

      // Verificar si el email está confirmado
      if (!authData.user.email_confirmed_at) {
        throw new Error("Por favor, verifica tu email antes de iniciar sesión. Revisa tu bandeja de entrada.")
      }

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
                <AlertDescription className="text-green-800">{success}</AlertDescription>
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
