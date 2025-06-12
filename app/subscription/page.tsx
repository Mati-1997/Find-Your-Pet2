"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, Crown, Star, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"

export default function SubscriptionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push("/login")
          return
        }

        setUser(session.user)
      } catch (error) {
        console.error("Error checking auth:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const plans = [
    {
      id: "free",
      name: "Gratuito",
      price: "$0",
      period: "/mes",
      description: "Perfecto para empezar",
      features: ["Reportar hasta 2 mascotas", "Búsqueda básica en mapa", "Alertas locales", "Soporte por email"],
      icon: <Star className="w-6 h-6" />,
      color: "border-gray-200",
      current: true,
    },
    {
      id: "premium",
      name: "Premium",
      price: "$9.99",
      period: "/mes",
      description: "Para dueños activos",
      features: [
        "Mascotas ilimitadas",
        "Reconocimiento IA avanzado",
        "Alertas en tiempo real",
        "Historial de ubicaciones",
        "Soporte prioritario",
        "Estadísticas detalladas",
      ],
      icon: <Crown className="w-6 h-6" />,
      color: "border-blue-500",
      popular: true,
    },
    {
      id: "professional",
      name: "Profesional",
      price: "$19.99",
      period: "/mes",
      description: "Para refugios y veterinarias",
      features: [
        "Todo lo de Premium",
        "Panel de administración",
        "API de integración",
        "Reportes personalizados",
        "Múltiples usuarios",
        "Soporte 24/7",
        "Entrenamiento personalizado",
      ],
      icon: <Zap className="w-6 h-6" />,
      color: "border-purple-500",
    },
  ]

  const handleSubscribe = (planId: string) => {
    setSelectedPlan(planId)

    // Simulación de proceso de pago
    toast({
      title: "Procesando suscripción",
      description: "Redirigiendo al procesador de pagos...",
    })

    setTimeout(() => {
      toast({
        title: "¡Suscripción exitosa!",
        description: `Te has suscrito al plan ${plans.find((p) => p.id === planId)?.name}`,
      })
      setSelectedPlan(null)
    }, 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="container flex items-center h-16 px-4">
          <Button variant="ghost" className="mr-4 p-0" onClick={() => router.push("/settings")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Planes de Suscripción</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-6">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Elige el plan perfecto para ti</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Accede a funciones avanzadas para encontrar a tu mascota más rápido y con mayor precisión
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative overflow-hidden ${plan.color} ${plan.popular ? "ring-2 ring-blue-500" : ""}`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-blue-500 text-white text-center py-2 text-sm font-medium">
                  Más Popular
                </div>
              )}
              {plan.current && (
                <div className="absolute top-0 left-0 right-0 bg-green-500 text-white text-center py-2 text-sm font-medium">
                  Plan Actual
                </div>
              )}

              <CardHeader className={`text-center ${plan.popular || plan.current ? "pt-12" : ""}`}>
                <div className="flex justify-center mb-4 text-blue-600">{plan.icon}</div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold">
                  {plan.price}
                  <span className="text-lg font-normal text-gray-500">{plan.period}</span>
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={plan.current ? "outline" : "default"}
                  disabled={plan.current || selectedPlan === plan.id}
                  onClick={() => handleSubscribe(plan.id)}
                >
                  {selectedPlan === plan.id ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Procesando...
                    </div>
                  ) : plan.current ? (
                    "Plan Actual"
                  ) : (
                    "Suscribirse"
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-12 max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8">Preguntas Frecuentes</h3>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold mb-2">¿Puedo cancelar mi suscripción en cualquier momento?</h4>
                <p className="text-gray-600">
                  Sí, puedes cancelar tu suscripción en cualquier momento desde la configuración de tu cuenta. No hay
                  penalizaciones por cancelación.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold mb-2">¿Qué métodos de pago aceptan?</h4>
                <p className="text-gray-600">
                  Aceptamos todas las tarjetas de crédito principales, PayPal y transferencias bancarias. Todos los
                  pagos son procesados de forma segura.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold mb-2">¿Hay descuentos para refugios?</h4>
                <p className="text-gray-600">
                  Sí, ofrecemos descuentos especiales para refugios de animales y organizaciones sin fines de lucro.
                  Contáctanos para más información.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-12 text-center">
          <h3 className="text-xl font-semibold mb-4">¿Necesitas ayuda para elegir?</h3>
          <p className="text-gray-600 mb-6">Nuestro equipo está aquí para ayudarte a encontrar el plan perfecto</p>
          <Button variant="outline">Contactar Soporte</Button>
        </div>
      </main>
    </div>
  )
}
