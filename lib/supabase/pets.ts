import { createClient } from "./client"
import type { Database } from "./types"

type Pet = Database["public"]["Tables"]["pets"]["Row"]
type PetInsert = Database["public"]["Tables"]["pets"]["Insert"]
type PetUpdate = Database["public"]["Tables"]["pets"]["Update"]

export class PetService {
  private supabase = createClient()

  async getUserPets(userId: string): Promise<Pet[]> {
    const { data, error } = await this.supabase
      .from("pets")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  }

  async getPetById(petId: string): Promise<Pet | null> {
    const { data, error } = await this.supabase.from("pets").select("*").eq("id", petId).single()

    if (error) throw error
    return data
  }

  async createPet(pet: PetInsert): Promise<Pet> {
    const { data, error } = await this.supabase.from("pets").insert(pet).select().single()

    if (error) throw error
    return data
  }

  async updatePet(petId: string, updates: PetUpdate): Promise<Pet> {
    const { data, error } = await this.supabase.from("pets").update(updates).eq("id", petId).select().single()

    if (error) throw error
    return data
  }

  async deletePet(petId: string): Promise<void> {
    const { error } = await this.supabase.from("pets").delete().eq("id", petId)

    if (error) throw error
  }

  async getLostPets(): Promise<Pet[]> {
    const { data, error } = await this.supabase
      .from("pets")
      .select("*")
      .eq("is_lost", true)
      .order("updated_at", { ascending: false })

    if (error) throw error
    return data || []
  }

  async markPetAsLost(petId: string): Promise<Pet> {
    return this.updatePet(petId, { is_lost: true })
  }

  async markPetAsFound(petId: string): Promise<Pet> {
    return this.updatePet(petId, { is_lost: false })
  }
}

export const petService = new PetService()
