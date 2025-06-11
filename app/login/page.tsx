"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const verified = searchParams.get("verified") === "true"
  const errorParam = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")

  useEffect(() => {
    if (errorParam && errorDescription) {
      setError(`${errorDescription}`)
    }

    // Verificar si el usuario ya está autenticado
    const checkSession = async () => {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        console.log("Usuario ya autenticado, redirigiendo...")
        router.push("/home")
      }
    }

    checkSession()
  }, [errorParam, errorDescription, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.log("Intentando iniciar sesión con email:", email)
      const supabase = createClient()

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Error de login:", error.message)
        throw error
      }

      console.log("Sesión iniciada exitosamente:", data.session?.user.id)
      setSuccess("Inicio de sesión exitoso")

      // Redirigir al usuario después de un inicio de sesión exitoso
      setTimeout(() => {
        router.push("/home")
      }, 1000)
    } catch (error: any) {
      console.error("Error en login:", error)
      setError(error.message || "Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Find Your Pet</h1>
          <p className="text-gray-600 mt-2">Inicia sesión en tu cuenta</p>
        </div>

        {verified && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700">
              ¡Tu correo ha sido verificado correctamente! Ahora puedes iniciar sesión.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium">
              Contraseña
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" className="w-full bg-black hover:bg-gray-800" disabled={loading}>
            {loading ? "Iniciando Sesión..." : "Iniciar Sesión"}
          </Button>
        </form>

        <div className="text-center text-sm">
          <Link href="/forgot-password" className="text-blue-600 hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <div className="text-center text-sm">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            Regístrate
          </Link>
        </div>
      </div>
    </div>
  )
}
