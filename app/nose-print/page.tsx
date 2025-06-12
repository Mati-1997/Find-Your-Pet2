"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Camera, Upload, Scan, CheckCircle, AlertCircle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { useAuthCheck } from "@/hooks/use-auth-check"

export default function NosePrintPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, loading } = useAuthCheck()
  const [step, setStep] = useState<"instructions" | "capture" | "processing" | "result">("instructions")
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleTakePhoto = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          // En una implementación real, aquí abriríamos la cámara
          toast({
            title: "Cámara activada",
            description: "Función de cámara en desarrollo - usando imagen de ejemplo",
          })

          // Simular captura de imagen
          setCapturedImage("/placeholder.svg?height=300&width=300")
          setStep("processing")
          simulateProcessing()

          // Detener el stream
          stream.getTracks().forEach((track) => track.stop())
        })
        .catch((error) => {
          toast({
            title: "Error de cámara",
            description: "No se pudo acceder a la cámara",
            variant: "destructive",
          })
        })
    } else {
      toast({
        title: "Cámara no disponible",
        description: "Tu dispositivo no soporta acceso a cámara",
        variant: "destructive",
      })
    }
  }

  const handleUploadImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string)
        setStep("processing")
        simulateProcessing()
      }
      reader.readAsDataURL(file)
    }
  }

  const simulateProcessing = () => {
    setProcessingProgress(0)
    const interval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setStep("result")
          setAnalysisResult({
            confidence: 94.5,
            uniquePoints: 127,
            matchFound: false,
            petId: null,
            recommendations: [
              "La imagen tiene buena calidad para análisis",
              "Se detectaron 127 puntos únicos en la huella nasal",
              "No se encontraron coincidencias en la base de datos",
              "La huella ha sido registrada para futuras comparaciones",
            ],
          })
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 200)
  }

  const handleStartOver = () => {
    setStep("instructions")
    setCapturedImage(null)
    setProcessingProgress(0)
    setAnalysisResult(null)
  }

  const handleSaveNosePrint = () => {
    toast({
      title: "Huella nasal guardada",
      description: "La huella nasal ha sido registrada en la base de datos",
    })
    router.push("/dashboard")
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
          <Button variant="ghost" className="mr-4 p-0" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Huella Nasal</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-6 space-y-6">
        {step === "instructions" && (
          <>
            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="w-5 h-5 mr-2" />
                  ¿Qué es la huella nasal?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  La huella nasal de cada mascota es única, como las huellas dactilares humanas. Podemos usar esta
                  característica para identificar mascotas perdidas de manera precisa.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Beneficios:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Identificación 100% precisa</li>
                    <li>• No se puede falsificar</li>
                    <li>• Permanece igual toda la vida</li>
                    <li>• Funciona incluso si la mascota cambia de apariencia</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Instructions for capture */}
            <Card>
              <CardHeader>
                <CardTitle>Instrucciones para capturar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Para obtener mejores resultados, asegúrate de que la nariz esté limpia y seca.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-green-600">✓ Hacer:</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Usar buena iluminación</li>
                        <li>• Mantener la cámara estable</li>
                        <li>• Capturar de frente</li>
                        <li>• Asegurar que la nariz esté enfocada</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-red-600">✗ Evitar:</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Imágenes borrosas</li>
                        <li>• Poca iluminación</li>
                        <li>• Ángulos laterales</li>
                        <li>• Nariz húmeda o sucia</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Capture buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={handleTakePhoto} className="h-24">
                <div className="text-center">
                  <Camera className="w-8 h-8 mx-auto mb-2" />
                  <span>Tomar foto</span>
                </div>
              </Button>
              <Button variant="outline" onClick={handleUploadImage} className="h-24">
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2" />
                  <span>Subir imagen</span>
                </div>
              </Button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </>
        )}

        {step === "processing" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Scan className="w-5 h-5 mr-2 animate-pulse" />
                Analizando huella nasal...
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {capturedImage && (
                <div className="flex justify-center">
                  <img
                    src={capturedImage || "/placeholder.svg"}
                    alt="Huella nasal capturada"
                    className="w-64 h-64 object-cover rounded-lg border"
                  />
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progreso del análisis</span>
                  <span>{Math.round(processingProgress)}%</span>
                </div>
                <Progress value={processingProgress} className="w-full" />
              </div>

              <div className="text-center text-gray-600">
                <p>Procesando patrones únicos de la huella nasal...</p>
                <p className="text-sm mt-1">Esto puede tomar unos segundos</p>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "result" && analysisResult && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  Análisis completado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{analysisResult.confidence}%</div>
                    <p className="text-sm text-blue-800">Confianza</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{analysisResult.uniquePoints}</div>
                    <p className="text-sm text-green-800">Puntos únicos</p>
                  </div>
                </div>

                {analysisResult.matchFound ? (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      ¡Coincidencia encontrada! Esta huella nasal coincide con una mascota en nuestra base de datos.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      No se encontraron coincidencias. Esta huella nasal es única y será registrada.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <h4 className="font-medium">Recomendaciones:</h4>
                  <ul className="space-y-1">
                    {analysisResult.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="text-green-600 mr-2">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <div className="flex space-x-4">
              <Button onClick={handleSaveNosePrint} className="flex-1">
                Guardar huella nasal
              </Button>
              <Button variant="outline" onClick={handleStartOver}>
                Analizar otra
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
