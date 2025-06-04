import { NextResponse } from "next/server"
import type { Pokemon } from "@/lib/models/pokemon"

export async function GET(request: Request) {
  try {
    // Verificar si MongoDB está configurado
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({
        pokemon: [],
        pagination: { page: 1, limit: 50, total: 0, pages: 0 },
        error: "MongoDB no está configurado",
        setup_required: true,
      })
    }

    // Importar dinámicamente para evitar errores en build time
    const clientPromise = (await import("@/lib/mongodb")).default

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const name = searchParams.get("name")
    const legendary = searchParams.get("legendary")
    const generation = searchParams.get("generation")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    const client = await clientPromise
    const db = client.db("pokemon_db")

    // Build filter
    const filter: any = {}
    if (type && type !== "all") {
      filter.types = { $in: [type] }
    }
    if (name) {
      filter.name = { $regex: name, $options: "i" }
    }
    if (legendary === "legendary") {
      filter.is_legendary = true
    } else if (legendary === "mythical") {
      filter.is_mythical = true
    } else if (legendary === "normal") {
      filter.is_legendary = false
      filter.is_mythical = false
    }
    if (generation && generation !== "all") {
      filter.generation = Number.parseInt(generation)
    }

    const skip = (page - 1) * limit

    // Verificar si hay datos en la colección
    const count = await db.collection("pokemon").countDocuments()
    if (count === 0) {
      return NextResponse.json({
        pokemon: [],
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0,
        },
        message: "No hay datos de Pokémon en la base de datos",
      })
    }

    const pokemon = await db
      .collection<Pokemon>("pokemon")
      .find(filter)
      .sort({ id: 1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    const total = await db.collection("pokemon").countDocuments(filter)

    return NextResponse.json({
      pokemon,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching pokemon:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch pokemon",
        pokemon: [],
        pagination: { page: 1, limit: 50, total: 0, pages: 0 },
      },
      { status: 500 },
    )
  }
}
