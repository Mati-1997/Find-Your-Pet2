"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { storageService } from "@/lib/supabase/storage"
import { useAuthCheck } from "@/hooks/use-auth-check"

export default function DebugStoragePage() {
  const { user, isAuthenticated } = useAuthCheck()
  const [storageStatus, setStorageStatus] = useState<any>(null)
  const [testResult, setTestResult] = useState<string>("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      checkStorage()
    }
  }, [isAuthenticated])

  const checkStorage = async () => {
    try {
      setLoading(true)
      const status = await storageService.checkStorageStatus()
      setStorageStatus(status)
    } catch (error: any) {
      setTestResult(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testUpload = async () => {
    try {
      setLoading(true)
      setTestResult("Iniciando test de subida...")

      // Crear un archivo de prueba
      const canvas = document.createElement("canvas")
      canvas.width = 100
      canvas.height = 100
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.fillStyle = "#ff0000"
        ctx.fillRect(0, 0, 100, 100)
        ctx.fillStyle = "#ffffff"
        ctx.font = "20px Arial"
        ctx.fillText("TEST", 25, 55)
      }

      canvas.toBlob(async (blob) => {
        if (blob && user) {
          const file = new File([blob], "test-image.png", { type: "image/png" })

          try {
            const url = await storageService.uploadUserAvatar(file, user.id)
            setTestResult(`✅ Upload exitoso! URL: ${url}`)
          } catch (error: any) {
            setTestResult(`❌ Error en upload: ${error.message}`)
          }
        }
      }, "image/png")
    } catch (error: any) {
      setTestResult(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-6">
            <p>Necesitas estar autenticado para usar esta página de debug.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Debug de Storage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={checkStorage} disabled={loading}>
              {loading ? "Verificando..." : "Verificar Storage"}
            </Button>
            <Button onClick={testUpload} disabled={loading}>
              {loading ? "Probando..." : "Test de Upload"}
            </Button>
          </div>

          {storageStatus && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Estado de Buckets:</h3>
              {storageStatus.buckets.map((bucket: any) => (
                <div key={bucket.bucket} className="p-3 border rounded">
                  <p>
                    <strong>Bucket:</strong> {bucket.bucket}
                  </p>
                  <p>
                    <strong>Puede listar:</strong> {bucket.canList ? "✅ Sí" : "❌ No"}
                  </p>
                  {bucket.error && (
                    <p>
                      <strong>Error:</strong> {bucket.error}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {testResult && (
            <div className="p-4 bg-gray-100 rounded">
              <h3 className="font-semibold">Resultado del Test:</h3>
              <pre className="whitespace-pre-wrap">{testResult}</pre>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Información del Usuario:</h3>
            <p>
              <strong>ID:</strong> {user?.id}
            </p>
            <p>
              <strong>Email:</strong> {user?.email}
            </p>
            <p>
              <strong>Rol:</strong> {user?.role || "authenticated"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
