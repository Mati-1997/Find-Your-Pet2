"use client"

import { Home } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/client"

export default function SearchPage() {
  const router = useRouter()
  const [pets, setPets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPets = async () => {
      try {
        const supabase = createClient()
        const { data: petsData, error } = await supabase
          .from("pets")
          .select("*")
          .eq("is_lost", true)
          .order("created_at", { ascending: false })

        if (error) throw error
        setPets(petsData || [])
      } catch (error) {
        console.error("Error loading pets:", error)
      } finally {
        setLoading(false)
      }
    }

    loadPets()
  }, [])

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Buscar Mascotas</h1>
        <Button onClick={() => router.push("/dashboard")} variant="ghost" className="text-white hover:bg-white/20">
          <Home className="w-5 h-5 mr-2" />
          Inicio
        </Button>
      </div>

      {loading ? (
        <p className="text-white">Cargando...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          {pets.map((pet) => (
            <Card key={pet.id} className="bg-zinc-900 text-white">
              <CardHeader>
                <CardTitle>{pet.name}</CardTitle>
                <CardDescription>{pet.breed}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Edad: {pet.age}</p>
                <p>Género: {pet.gender}</p>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => router.push(`/pet/${pet.id}`)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Ver detalles
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
