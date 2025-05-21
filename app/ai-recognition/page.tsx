import Link from "next/link"
import { ArrowLeft, Camera, Upload, Search, Scan } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AIRecognitionPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="container flex items-center h-16 px-4">
          <Link href="/home" className="mr-4">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-semibold">Reconocimiento con IA</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container px-4 py-6">
        <div className="space-y-6">
          <Tabs defaultValue="camera">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="camera">Cámara</TabsTrigger>
              <TabsTrigger value="upload">Subir foto</TabsTrigger>
              <TabsTrigger value="nose">Huella nasal</TabsTrigger>
            </TabsList>

            <TabsContent value="camera" className="mt-4 space-y-4">
              <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-12 h-12 mx-auto mb-2 text-gray-500" />
                  <p className="text-gray-600">Cámara de reconocimiento</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="flex flex-col items-center justify-center py-4">
                  <Camera className="w-6 h-6 mb-2" />
                  <span>Tomar foto</span>
                </Button>
                <Button className="flex flex-col items-center justify-center py-4">
                  <Search className="w-6 h-6 mb-2" />
                  <span>Buscar coincidencias</span>
                </Button>
              </div>

              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">Cómo funciona</h3>
                  <p className="text-sm text-gray-600">
                    Nuestra tecnología de IA analiza las características faciales de la mascota y las compara con
                    nuestra base de datos de mascotas perdidas. Toma una foto clara del animal para obtener mejores
                    resultados.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="upload" className="mt-4 space-y-4">
              <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <Upload className="w-12 h-12 mx-auto mb-2 text-gray-500" />
                  <p className="text-gray-600">Arrastra y suelta una foto aquí</p>
                  <Button variant="outline" size="sm" className="mt-4">
                    Seleccionar archivo
                  </Button>
                </div>
              </div>

              <Button className="w-full">
                <Search className="w-5 h-5 mr-2" />
                Buscar coincidencias
              </Button>

              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">Consejos para mejores resultados</h3>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc pl-4">
                    <li>Usa fotos con buena iluminación</li>
                    <li>Asegúrate que la cara del animal sea visible</li>
                    <li>Evita imágenes borrosas o con filtros</li>
                    <li>Incluye fotos desde diferentes ángulos si es posible</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="nose" className="mt-4 space-y-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 text-blue-800">Identificación por huella nasal</h3>
                  <p className="text-sm text-blue-700">
                    La nariz de cada perro tiene un patrón único, similar a una huella digital humana. Esta tecnología
                    permite identificar a tu mascota con un 99% de precisión.
                  </p>
                </CardContent>
              </Card>

              <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                <div className="text-center">
                  <Scan className="w-12 h-12 mx-auto mb-2 text-gray-500" />
                  <p className="text-gray-600">Escáner de huella nasal</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="flex flex-col items-center justify-center py-4">
                  <Camera className="w-6 h-6 mb-2" />
                  <span>Escanear nariz</span>
                </Button>
                <Button className="flex flex-col items-center justify-center py-4">
                  <Search className="w-6 h-6 mb-2" />
                  <span>Buscar coincidencias</span>
                </Button>
              </div>

              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">Cómo escanear correctamente</h3>
                  <ol className="text-sm text-gray-600 space-y-1 list-decimal pl-4">
                    <li>Asegúrate que la nariz esté limpia</li>
                    <li>Mantén la cámara a 10-15 cm de distancia</li>
                    <li>Usa buena iluminación</li>
                    <li>Mantén la cámara estable durante el escaneo</li>
                  </ol>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Resultados recientes</h3>
            <div className="grid grid-cols-1 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-md mr-4"></div>
                    <div className="flex-1">
                      <h4 className="font-medium">Posible coincidencia</h4>
                      <p className="text-sm text-gray-500">Labrador, 3 años</p>
                      <p className="text-sm text-gray-500">Coincidencia: 87%</p>
                    </div>
                    <Button size="sm">Ver</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-md mr-4"></div>
                    <div className="flex-1">
                      <h4 className="font-medium">Posible coincidencia</h4>
                      <p className="text-sm text-gray-500">Labrador, 2 años</p>
                      <p className="text-sm text-gray-500">Coincidencia: 72%</p>
                    </div>
                    <Button size="sm">Ver</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
