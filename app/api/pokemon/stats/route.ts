import { NextResponse } from "next/server"
import type { PokemonTypeCount, LegendaryStats, GenerationStats } from "@/lib/models/pokemon"

export async function GET() {
  try {
    // Verificar si MongoDB está configurado
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({
        typeStats: [],
        legendaryStats: { legendary: 0, mythical: 0, normal: 0, total: 0 },
        generationStats: [],
        error: "MongoDB no está configurado",
        setup_required: true,
      })
    }

    // Importar dinámicamente para evitar errores en build time
    const clientPromise = (await import("@/lib/mongodb")).default

    const client = await clientPromise
    const db = client.db("pokemon_db")

    // Verificar si hay datos en la colección
    const count = await db.collection("pokemon").countDocuments()
    if (count === 0) {
      return NextResponse.json({
        typeStats: [],
        legendaryStats: { legendary: 0, mythical: 0, normal: 0, total: 0 },
        generationStats: [],
        message: "No hay datos de Pokémon en la base de datos",
      })
    }

    // Get type counts
    const typeStats = (await db
      .collection("pokemon")
      .aggregate([{ $unwind: "$types" }, { $group: { _id: "$types", count: { $sum: 1 } } }, { $sort: { count: -1 } }])
      .toArray()) as PokemonTypeCount[]

    // Get legendary/mythical stats
    const legendaryStats = await db
      .collection("pokemon")
      .aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            legendary: { $sum: { $cond: ["$is_legendary", 1, 0] } },
            mythical: { $sum: { $cond: ["$is_mythical", 1, 0] } },
          },
        },
      ])
      .toArray()

    // Get generation stats
    const generationStats = (await db
      .collection("pokemon")
      .aggregate([{ $group: { _id: "$generation", count: { $sum: 1 } } }, { $sort: { _id: 1 } }])
      .toArray()) as GenerationStats[]

    // Handle case when no data exists
    const legendary = legendaryStats.length > 0 ? legendaryStats[0] : { total: 0, legendary: 0, mythical: 0 }
    const legendaryData: LegendaryStats = {
      legendary: legendary.legendary,
      mythical: legendary.mythical,
      normal: legendary.total - legendary.legendary - legendary.mythical,
      total: legendary.total,
    }

    return NextResponse.json({
      typeStats,
      legendaryStats: legendaryData,
      generationStats,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch stats",
        typeStats: [],
        legendaryStats: { legendary: 0, mythical: 0, normal: 0, total: 0 },
        generationStats: [],
      },
      { status: 500 },
    )
  }
}
