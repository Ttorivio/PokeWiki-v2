import { NextResponse } from "next/server"

// Función para obtener datos de un Pokémon específico
async function fetchPokemonData(id: number) {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const pokemon = await response.json()

    // Obtener datos de la especie para información adicional
    const speciesResponse = await fetch(pokemon.species.url)
    const speciesData = await speciesResponse.json()

    return {
      id: pokemon.id,
      name: pokemon.name,
      types: pokemon.types.map((type: any) => type.type.name),
      height: pokemon.height,
      weight: pokemon.weight,
      base_experience: pokemon.base_experience || 0,
      is_legendary: speciesData.is_legendary,
      is_mythical: speciesData.is_mythical,
      generation: Number.parseInt(speciesData.generation.url.split("/").slice(-2, -1)[0]),
      sprite_url: pokemon.sprites.front_default,
      sprite_shiny: pokemon.sprites.front_shiny,
      stats: {
        hp: pokemon.stats.find((stat: any) => stat.stat.name === "hp")?.base_stat || 0,
        attack: pokemon.stats.find((stat: any) => stat.stat.name === "attack")?.base_stat || 0,
        defense: pokemon.stats.find((stat: any) => stat.stat.name === "defense")?.base_stat || 0,
        special_attack: pokemon.stats.find((stat: any) => stat.stat.name === "special-attack")?.base_stat || 0,
        special_defense: pokemon.stats.find((stat: any) => stat.stat.name === "special-defense")?.base_stat || 0,
        speed: pokemon.stats.find((stat: any) => stat.stat.name === "speed")?.base_stat || 0,
      },
      abilities: pokemon.abilities.map((ability: any) => ability.ability.name),
      color: speciesData.color.name,
      habitat: speciesData.habitat?.name || null,
      shape: speciesData.shape?.name || null,
    }
  } catch (error) {
    console.error(`Error fetching Pokemon ${id}:`, error)
    return null
  }
}

export async function GET(request: Request) {
  try {
    // Verificar si MongoDB está configurado
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        {
          error:
            "MongoDB no está configurado. Por favor configura la variable MONGODB_URI en las variables de entorno.",
          setup_required: true,
        },
        { status: 503 },
      )
    }

    // Importar dinámicamente para evitar errores en build time
    const clientPromise = (await import("@/lib/mongodb")).default

    // Verificar clave de API para proteger este endpoint
    const { searchParams } = new URL(request.url)
    const apiKey = searchParams.get("apiKey")
    const limit = Number.parseInt(searchParams.get("limit") || "151")
    const force = searchParams.get("force") === "true"

    // Verificar la clave API
    if (apiKey !== process.env.ADMIN_API_KEY && apiKey !== "pokemon-dashboard-secret-2024") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("pokemon_db")
    const collection = db.collection("pokemon")

    // Verificar si ya existen datos
    const existingCount = await collection.countDocuments()
    if (existingCount > 0 && !force) {
      return NextResponse.json({
        message: `Ya existen ${existingCount} Pokémon en la base de datos`,
        action: "Agrega ?force=true para reemplazar los datos existentes",
        existing_count: existingCount,
      })
    }

    // Si force=true, obtener el ID más alto existente para continuar desde ahí
    let startId = 1
    if (force && existingCount > 0) {
      const lastPokemon = await collection.findOne({}, { sort: { id: -1 } })
      startId = lastPokemon ? lastPokemon.id + 1 : 1
    }

    // Si no es force, limpiar la colección
    if (!force) {
      await collection.deleteMany({})
    }

    // Limitar a un máximo razonable
    const maxLimit = Math.min(limit, 1010)
    const endId = force ? Math.min(startId + maxLimit - 1, 1010) : Math.min(maxLimit, 1010)

    console.log(`Iniciando carga de Pokémon ${startId} al ${endId}...`)

    const allPokemon = []
    const batchSize = 10 // Procesar en lotes pequeños

    for (let i = startId; i <= endId; i += batchSize) {
      const endIndex = Math.min(i + batchSize - 1, endId)
      console.log(`Procesando lote: Pokémon ${i}-${endIndex}`)

      const promises = []
      for (let j = i; j <= endIndex; j++) {
        // Verificar si el Pokémon ya existe (solo si force=true)
        if (force) {
          const existing = await collection.findOne({ id: j })
          if (existing) {
            console.log(`Pokémon ${j} ya existe, saltando...`)
            continue
          }
        }

        promises.push(fetchPokemonData(j))
        // Pequeña pausa para no sobrecargar la API
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      const batchResults = await Promise.all(promises)
      const validPokemon = batchResults.filter((pokemon) => pokemon !== null)
      allPokemon.push(...validPokemon)

      // Pausa entre lotes
      if (endIndex < endId) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    if (allPokemon.length === 0) {
      return NextResponse.json({
        message: force ? "No se encontraron nuevos Pokémon para agregar" : "No se pudieron obtener datos de Pokémon",
        existing_count: existingCount,
      })
    }

    // Insertar en la base de datos
    const result = await collection.insertMany(allPokemon)

    // Crear índices
    await collection.createIndex({ name: 1 })
    await collection.createIndex({ types: 1 })
    await collection.createIndex({ is_legendary: 1 })
    await collection.createIndex({ is_mythical: 1 })
    await collection.createIndex({ generation: 1 })
    await collection.createIndex({ id: 1 }, { unique: true })

    const finalCount = await collection.countDocuments()

    return NextResponse.json({
      success: true,
      message: `${result.insertedCount} Pokémon ${force ? "agregados" : "insertados"} exitosamente`,
      count: result.insertedCount,
      total_count: finalCount,
      action: force ? "added" : "created",
    })
  } catch (error) {
    console.error("Error en seed:", error)
    return NextResponse.json(
      {
        error: "Error al poblar la base de datos",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
