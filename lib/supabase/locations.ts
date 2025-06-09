import { createClient } from "./client"
import type { Database } from "./types"

type Location = Database["public"]["Tables"]["locations"]["Row"]
type LocationInsert = Database["public"]["Tables"]["locations"]["Insert"]

export class LocationService {
  private supabase = createClient()

  async getPetLocations(petId: string, limit = 100): Promise<Location[]> {
    const { data, error } = await this.supabase
      .from("locations")
      .select("*")
      .eq("pet_id", petId)
      .order("timestamp", { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }

  async getLatestPetLocation(petId: string): Promise<Location | null> {
    const { data, error } = await this.supabase
      .from("locations")
      .select("*")
      .eq("pet_id", petId)
      .order("timestamp", { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== "PGRST116") throw error
    return data
  }

  async addLocation(location: LocationInsert): Promise<Location> {
    const { data, error } = await this.supabase.from("locations").insert(location).select().single()

    if (error) throw error
    return data
  }

  async getLocationsByDateRange(petId: string, startDate: string, endDate: string): Promise<Location[]> {
    const { data, error } = await this.supabase
      .from("locations")
      .select("*")
      .eq("pet_id", petId)
      .gte("timestamp", startDate)
      .lte("timestamp", endDate)
      .order("timestamp", { ascending: true })

    if (error) throw error
    return data || []
  }

  async getLocationsNearPoint(latitude: number, longitude: number, radiusKm = 1): Promise<Location[]> {
    // Using PostGIS functions for geospatial queries
    const { data, error } = await this.supabase.rpc("get_locations_within_radius", {
      center_lat: latitude,
      center_lng: longitude,
      radius_km: radiusKm,
    })

    if (error) throw error
    return data || []
  }
}

export const locationService = new LocationService()
