import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { pet_id, latitude, longitude, accuracy, battery_level, is_moving } = body

    // Verify pet belongs to user
    const { data: pet, error: petError } = await supabase
      .from("pets")
      .select("id")
      .eq("id", pet_id)
      .eq("user_id", user.id)
      .single()

    if (petError || !pet) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 })
    }

    // Insert location
    const { data: location, error: locationError } = await supabase
      .from("locations")
      .insert({
        pet_id,
        latitude,
        longitude,
        accuracy,
        battery_level,
        is_moving,
        timestamp: new Date().toISOString(),
      })
      .select()
      .single()

    if (locationError) {
      return NextResponse.json({ error: locationError.message }, { status: 500 })
    }

    return NextResponse.json({ data: location })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const petId = searchParams.get("pet_id")
    const limit = Number.parseInt(searchParams.get("limit") || "100")

    if (!petId) {
      return NextResponse.json({ error: "Pet ID required" }, { status: 400 })
    }

    // Verify pet belongs to user
    const { data: pet, error: petError } = await supabase
      .from("pets")
      .select("id")
      .eq("id", petId)
      .eq("user_id", user.id)
      .single()

    if (petError || !pet) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 })
    }

    // Get locations
    const { data: locations, error: locationsError } = await supabase
      .from("locations")
      .select("*")
      .eq("pet_id", petId)
      .order("timestamp", { ascending: false })
      .limit(limit)

    if (locationsError) {
      return NextResponse.json({ error: locationsError.message }, { status: 500 })
    }

    return NextResponse.json({ data: locations })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
