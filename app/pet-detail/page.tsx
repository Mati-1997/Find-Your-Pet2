import Link from "next/link"
import { ArrowLeft, MapPin, Share2, Bell, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import StaticMap from "@/components/static-map"
import { getPetLocationHistory } from "@/lib/location-service"

export default function PetDetailPage() {
  const petLocations = getPetLocationHistory("1")

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="container flex items-center h-16 px-4">
          <Link href="/home" className="mr-4">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-semibold">Detalles de mascota</h1>
          <div className="ml-auto flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Share2 className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container px-4 py-6">
        <div className="space-y-6">
          {/* Pet Image and Status */}
          <div className="relative">
            <div className="bg-gray-300 h-64 rounded-lg"></div>
            <Badge className="absolute top-4 right-4 bg-red-500">Perdido</Badge>
          </div>

          {/* Pet Info */}
          <div>
            <h2 className="text-2xl font-bold">Max</h2>
            <div className="flex items-center text-gray-500 mt-1">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="text-sm">Visto por última vez: Parque Central, hace 2 horas</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Button className="bg-blue-500 hover:bg-blue-600">
              <MapPin className="w-4 h-4 mr-2" />
              Ver en mapa
            </Button>
            <Button variant="outline">
              <MessageCircle className="w-4 h-4 mr-2" />
              Contactar dueño
            </Button>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="info">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Información</TabsTrigger>
              <TabsTrigger value="tracking">Rastreo</TabsTrigger>
              <TabsTrigger value="updates">Actualizaciones</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-4 space-y-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">Detalles</h3>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <div className="text-gray-500">Especie:</div>
                    <div>Perro</div>
                    <div className="text-gray-500">Raza:</div>
                    <div>Labrador</div>
                    <div className="text-gray-500">Color:</div>
                    <div>Dorado</div>
                    <div className="text-gray-500">Edad:</div>
                    <div>3 años</div>
                    <div className="text-gray-500">Sexo:</div>
                    <div>Macho</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">Descripción</h3>
                  <p className="text-sm">
                    Max es un labrador muy amigable. Tiene un collar azul con una placa de identificación. Es muy
                    juguetón y le gusta acercarse a las personas. Responde a su nombre y a silbidos.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tracking" className="mt-4 space-y-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">Métodos de localización</h3>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">🛰️</div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">Collar GPS</h4>
                        <p className="text-xs text-gray-500">Última actualización: hace 2 horas</p>
                      </div>
                      <Badge className="bg-green-500">Activo</Badge>
                    </div>

                    <div className="flex items-center">
                      <div className="text-2xl mr-3">🤖</div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">Reconocimiento facial IA</h4>
                        <p className="text-xs text-gray-500">Escaneando cámaras cercanas</p>
                      </div>
                      <Badge className="bg-green-500">Activo</Badge>
                    </div>

                    <div className="flex items-center">
                      <div className="text-2xl mr-3">👃</div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">Huella nasal</h4>
                        <p className="text-xs text-gray-500">Identificación registrada</p>
                      </div>
                      <Badge className="bg-green-500">Activo</Badge>
                    </div>

                    <div className="flex items-center">
                      <div className="text-2xl mr-3">📱</div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">Chip NFC</h4>
                        <p className="text-xs text-gray-500">ID: #12345678</p>
                      </div>
                      <Badge className="bg-green-500">Activo</Badge>
                    </div>

                    <div className="flex items-center">
                      <div className="text-2xl mr-3">📶</div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">Bluetooth</h4>
                        <p className="text-xs text-gray-500">Buscando señal cercana</p>
                      </div>
                      <Badge className="bg-green-500">Activo</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="rounded-lg h-64 overflow-hidden">
                <StaticMap petLocations={petLocations} height="100%" width="100%" />
              </div>

              <div className="mt-2 text-center">
                <Link href="/location-history">
                  <Button variant="outline" size="sm">
                    Ver historial completo
                  </Button>
                </Link>
              </div>
            </TabsContent>

            <TabsContent value="updates" className="mt-4 space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mr-3">
                      <MapPin className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h4 className="font-medium text-sm">Ubicación GPS actualizada</h4>
                        <span className="text-xs text-gray-500 ml-2">hace 2h</span>
                      </div>
                      <p className="text-sm text-gray-600">Parque Central, cerca de la fuente principal</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mr-3">
                      <MessageCircle className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h4 className="font-medium text-sm">Avistamiento reportado</h4>
                        <span className="text-xs text-gray-500 ml-2">hace 3h</span>
                      </div>
                      <p className="text-sm text-gray-600">Un usuario reportó haber visto a Max cerca del parque</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mr-3">
                      <Bell className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h4 className="font-medium text-sm">Alerta creada</h4>
                        <span className="text-xs text-gray-500 ml-2">hace 5h</span>
                      </div>
                      <p className="text-sm text-gray-600">Se ha creado una alerta para Max en un radio de 5km</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
