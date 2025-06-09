"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react"

interface ConnectionTest {
  name: string
  status: "loading" | "success" | "error"
  message: string
  details?: any
}

export default function TestConnectionPage() {
  const [tests, setTests] = useState<ConnectionTest[]>([
    { name: "Conexión a Supabase", status: "loading", message: "Verificando..." },
    { name: "Autenticación", status: "loading", message: "Verificando..." },
    { name: "Base de datos", status: "loading", message: "Verificando..." },
    { name: "Almacenamiento", status: "loading", message: "Verificando..." },
  ])

  const supabase = createClient()

  const runTests = async () => {
    // Reset tests
    setTests((prev) => prev.map((test) => ({ ...test, status: "loading", message: "Verificando..." })))

    // Test 1: Basic connection
    try {
      const { data, error } = await supabase.from("users").select("count", { count: "exact", head: true })

      if (error) throw error

      setTests((prev) =>
        prev.map((test) =>
          test.name === "Conexión a Supabase" ? { ...test, status: "success", message: "Conexión exitosa" } : test,
        ),
      )
    } catch (error: any) {
      setTests((prev) =>
        prev.map((test) =>
          test.name === "Conexión a Supabase" ? { ...test, status: "error", message: `Error: ${error.message}` } : test,
        ),
      )
    }

    // Test 2: Authentication
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      setTests((prev) =>
        prev.map((test) =>
          test.name === "Autenticación"
            ? {
                ...test,
                status: "success",
                message: session ? `Usuario: ${session.user.email}` : "Sin sesión activa",
                details: session?.user,
              }
            : test,
        ),
      )
    } catch (error: any) {
      setTests((prev) =>
        prev.map((test) =>
          test.name === "Autenticación" ? { ...test, status: "error", message: `Error: ${error.message}` } : test,
        ),
      )
    }

    // Test 3: Database tables
    try {
      const tables = ["users", "pets", "locations", "alert_history"]
      const results = await Promise.all(
        tables.map(async (table) => {
          const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true })

          if (error) throw new Error(`${table}: ${error.message}`)
          return `${table}: ${count} registros`
        }),
      )

      setTests((prev) =>
        prev.map((test) =>
          test.name === "Base de datos"
            ? {
                ...test,
                status: "success",
                message: "Todas las tablas accesibles",
                details: results,
              }
            : test,
        ),
      )
    } catch (error: any) {
      setTests((prev) =>
        prev.map((test) =>
          test.name === "Base de datos" ? { ...test, status: "error", message: `Error: ${error.message}` } : test,
        ),
      )
    }

    // Test 4: Storage
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets()

      if (error) throw error

      setTests((prev) =>
        prev.map((test) =>
          test.name === "Almacenamiento"
            ? {
                ...test,
                status: "success",
                message: `${buckets.length} buckets disponibles`,
                details: buckets.map((b) => b.name),
              }
            : test,
        ),
      )
    } catch (error: any) {
      setTests((prev) =>
        prev.map((test) =>
          test.name === "Almacenamiento" ? { ...test, status: "error", message: `Error: ${error.message}` } : test,
        ),
      )
    }
  }

  useEffect(() => {
    runTests()
  }, [])

  const getStatusIcon = (status: ConnectionTest["status"]) => {
    switch (status) {
      case "loading":
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
    }
  }

  const getStatusBadge = (status: ConnectionTest["status"]) => {
    switch (status) {
      case "loading":
        return <Badge variant="secondary">Verificando</Badge>
      case "success":
        return (
          <Badge variant="default" className="bg-green-500">
            Exitoso
          </Badge>
        )
      case "error":
        return <Badge variant="destructive">Error</Badge>
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Test de Conexión a Supabase</h1>
        <p className="text-gray-600">Verificando la conectividad y configuración de la base de datos</p>
      </div>

      <div className="mb-6">
        <Button onClick={runTests} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Ejecutar Tests Nuevamente
        </Button>
      </div>

      <div className="grid gap-4">
        {tests.map((test, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-3">
                  {getStatusIcon(test.status)}
                  {test.name}
                </CardTitle>
                {getStatusBadge(test.status)}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-2">{test.message}</p>
              {test.details && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm font-medium mb-2">Detalles:</p>
                  <pre className="text-xs text-gray-700 overflow-x-auto">
                    {typeof test.details === "string" ? test.details : JSON.stringify(test.details, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Instrucciones:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Si ves errores, verifica tus variables de entorno en .env.local</li>
          <li>• Asegúrate de haber ejecutado los scripts SQL en Supabase</li>
          <li>• Las claves API deben tener los permisos correctos</li>
          <li>• Reinicia el servidor después de cambiar variables de entorno</li>
        </ul>
      </div>
    </div>
  )
}
