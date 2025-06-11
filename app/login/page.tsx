"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Mail, Lock, Heart, Shield, Zap, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else if (data.user) {
        router.push("/dashboard")
      }
    } catch (err) {
      setError("Error de conexión. Por favor intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = () => {
    setEmail("demo@findyourpet.com")
    setPassword("demo123")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Panel izquierdo - Información */}
        <div className="hidden lg:block space-y-8">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl shadow-lg">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ml-3">
                FindYourPet
              </h1>
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Encuentra a tu mejor amigo</h2>
            <p className="text-xl text-gray-600 mb-8">
              La plataforma más confiable para reunir mascotas perdidas con sus familias
            </p>
          </div>

          {/* Características */}
          <div className="space-y-6">
            <div className="flex items-center space-x-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Seguridad Garantizada</h3>
                <p className="text-gray-600 text-sm">Protección de datos y verificación de usuarios</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Respuesta Rápida</h3>
                <p className="text-gray-600 text-sm">Alertas instantáneas y notificaciones en tiempo real</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Comunidad Activa</h3>
                <p className="text-gray-600 text-sm">Miles de usuarios ayudando a encontrar mascotas</p>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-3 gap-4 pt-8">
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                2,847
              </div>
              <div className="text-sm text-gray-600">Mascotas encontradas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                15,432
              </div>
              <div className="text-sm text-gray-600">Usuarios activos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                98.5%
              </div>
              <div className="text-sm text-gray-600">Tasa de éxito</div>
            </div>
          </div>
        </div>

        {/* Panel derecho - Formulario de login */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-8">
              <div className="flex justify-center mb-4 lg:hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl shadow-lg">
                  <Heart className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Iniciar Sesión
              </CardTitle>
              <CardDescription className="text-gray-600">
                Accede a tu cuenta para encontrar a tu mascota
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Correo electrónico
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-medium">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Tu contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Iniciando sesión...
                    </div>
                  ) : (
                    "Iniciar Sesión"
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">o</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleDemoLogin}
                className="w-full h-12 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300"
              >
                <Zap className="w-5 h-5 mr-2 text-blue-500" />
                Probar con cuenta demo
              </Button>

              <div className="text-center space-y-4">
                <Link
                  href="/forgot-password"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>

                <div className="text-gray-600 text-sm">
                  ¿No tienes cuenta?{" "}
                  <Link
                    href="/register"
                    className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                  >
                    Regístrate aquí
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información adicional para móvil */}
          <div className="lg:hidden mt-8 text-center space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-2xl font-bold text-blue-600">2,847</div>
                <div className="text-xs text-gray-600">Encontradas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">15,432</div>
                <div className="text-xs text-gray-600">Usuarios</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">98.5%</div>
                <div className="text-xs text-gray-600">Éxito</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
