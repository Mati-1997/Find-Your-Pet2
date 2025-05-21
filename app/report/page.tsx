import Link from "next/link"
import { ArrowLeft, Camera, Upload, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"

export default function ReportPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="container flex items-center h-16 px-4">
          <Link href="/home" className="mr-4">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-semibold">Reportar mascota perdida</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container px-4 py-6">
        <div className="space-y-6">
          {/* Tipo de reporte */}
          <div className="space-y-2">
            <Label>Tipo de reporte</Label>
            <RadioGroup defaultValue="lost" className="grid grid-cols-2 gap-4">
              <Label
                htmlFor="lost"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
              >
                <RadioGroupItem value="lost" id="lost" className="sr-only" />
                <span className="text-sm font-medium">Mascota perdida</span>
              </Label>
              <Label
                htmlFor="found"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
              >
                <RadioGroupItem value="found" id="found" className="sr-only" />
                <span className="text-sm font-medium">Mascota encontrada</span>
              </Label>
            </RadioGroup>
          </div>

          {/* Fotos */}
          <div className="space-y-2">
            <Label>Fotos de la mascota</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" className="aspect-square flex flex-col items-center justify-center">
                <Camera className="w-6 h-6 mb-1" />
                <span className="text-xs">Cámara</span>
              </Button>
              <Button variant="outline" className="aspect-square flex flex-col items-center justify-center">
                <Upload className="w-6 h-6 mb-1" />
                <span className="text-xs">Galería</span>
              </Button>
              <div className="aspect-square bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
                +
              </div>
            </div>
          </div>

          {/* Información básica */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la mascota</Label>
              <Input id="name" placeholder="Nombre" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="species">Especie</Label>
              <RadioGroup defaultValue="dog" className="grid grid-cols-3 gap-2">
                <Label
                  htmlFor="dog"
                  className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                >
                  <RadioGroupItem value="dog" id="dog" className="sr-only" />
                  <span className="text-sm">Perro</span>
                </Label>
                <Label
                  htmlFor="cat"
                  className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                >
                  <RadioGroupItem value="cat" id="cat" className="sr-only" />
                  <span className="text-sm">Gato</span>
                </Label>
                <Label
                  htmlFor="other"
                  className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                >
                  <RadioGroupItem value="other" id="other" className="sr-only" />
                  <span className="text-sm">Otro</span>
                </Label>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" placeholder="Color, raza, características distintivas..." />
            </div>
          </div>

          {/* Métodos de localización */}
          <div className="space-y-2">
            <Label>Métodos de localización disponibles</Label>
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-3 text-xl">🛰️</div>
                    <div>
                      <h3 className="text-sm font-medium">Collar GPS</h3>
                      <p className="text-xs text-gray-500">Rastreo en tiempo real</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Configurar
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-3 text-xl">📱</div>
                    <div>
                      <h3 className="text-sm font-medium">Chip NFC</h3>
                      <p className="text-xs text-gray-500">Escaneo de identificación</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Configurar
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-3 text-xl">👃</div>
                    <div>
                      <h3 className="text-sm font-medium">Huella nasal</h3>
                      <p className="text-xs text-gray-500">Identificación única</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Escanear
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ubicación */}
          <div className="space-y-2">
            <Label>Última ubicación conocida</Label>
            <div className="bg-gray-200 rounded-lg h-40 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                <p className="text-gray-600">Seleccionar en el mapa</p>
              </div>
            </div>
          </div>

          {/* Botón de envío */}
          <Button className="w-full" size="lg">
            Publicar reporte
          </Button>
        </div>
      </main>
    </div>
  )
}
