const { MongoClient } = require("mongodb")

// Función para obtener datos de un Pokémon específico
async function fetchPokemonData(id) {
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
      types: pokemon.types.map((type) => type.type.name),
      height: pokemon.height,
      weight: pokemon.weight,
      base_experience: pokemon.base_experience || 0,
      is_legendary: speciesData.is_legendary,
      is_mythical: speciesData.is_mythical,
      generation: Number.parseInt(speciesData.generation.url.split("/").slice(-2, -1)[0]),
      sprite_url: pokemon.sprites.front_default,
      sprite_shiny: pokemon.sprites.front_shiny,
      stats: {
        hp: pokemon.stats.find((stat) => stat.stat.name === "hp")?.base_stat || 0,
        attack: pokemon.stats.find((stat) => stat.stat.name === "attack")?.base_stat || 0,
        defense: pokemon.stats.find((stat) => stat.stat.name === "defense")?.base_stat || 0,
        special_attack: pokemon.stats.find((stat) => stat.stat.name === "special-attack")?.base_stat || 0,
        special_defense: pokemon.stats.find((stat) => stat.stat.name === "special-defense")?.base_stat || 0,
        speed: pokemon.stats.find((stat) => stat.stat.name === "speed")?.base_stat || 0,
      },
      abilities: pokemon.abilities.map((ability) => ability.ability.name),
      color: speciesData.color.name,
      habitat: speciesData.habitat?.name || null,
      shape: speciesData.shape?.name || null,
    }
  } catch (error) {
    console.error(`Error fetching Pokemon ${id}:`, error.message)
    return null
  }
}

// Función para obtener el número total de Pokémon
async function getTotalPokemonCount() {
  try {
    const response = await fetch("https://pokeapi.co/api/v2/pokemon-species/?limit=1")
    const data = await response.json()
    return data.count
  } catch (error) {
    console.error("Error getting total Pokemon count:", error)
    return 1010 // Fallback a un número conocido
  }
}

// Función principal para poblar la base de datos
async function populateFromPokeAPI() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017"
  const client = new MongoClient(uri)

  try {
    console.log("🔌 Conectando a MongoDB...")
    await client.connect()
    console.log("✅ Conectado a MongoDB exitosamente")

    const db = client.db("pokemon_db")
    const collection = db.collection("pokemon")

    // Verificar si ya existen datos
    const existingCount = await collection.countDocuments()
    if (existingCount > 0) {
      console.log(`⚠️  Ya existen ${existingCount} Pokémon en la base de datos`)
      const readline = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout,
      })

      const answer = await new Promise((resolve) => {
        readline.question("¿Quieres reemplazar todos los datos? (y/N): ", resolve)
      })
      readline.close()

      if (answer.toLowerCase() !== "y" && answer.toLowerCase() !== "yes") {
        console.log("❌ Operación cancelada")
        return
      }

      console.log("🗑️  Limpiando datos existentes...")
      await collection.deleteMany({})
    }

    console.log("🌐 Obteniendo información total de Pokémon...")
    const totalPokemon = await getTotalPokemonCount()
    console.log(`📊 Total de Pokémon disponibles: ${totalPokemon}`)

    // Preguntar cuántos Pokémon quiere cargar el usuario
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    const limit = await new Promise((resolve) => {
      readline.question(`¿Cuántos Pokémon quieres cargar? (1-${totalPokemon}, recomendado: 151 para Gen 1): `, resolve)
    })
    readline.close()

    const pokemonLimit = Math.min(Number.parseInt(limit) || 151, totalPokemon)
    console.log(`📥 Cargando los primeros ${pokemonLimit} Pokémon...`)

    const batchSize = 20 // Procesar en lotes para no sobrecargar la API
    const allPokemon = []

    for (let i = 1; i <= pokemonLimit; i += batchSize) {
      const endIndex = Math.min(i + batchSize - 1, pokemonLimit)
      console.log(`📦 Procesando lote ${Math.ceil(i / batchSize)}: Pokémon ${i}-${endIndex}`)

      const promises = []
      for (let j = i; j <= endIndex; j++) {
        promises.push(fetchPokemonData(j))
        // Pequeña pausa para no sobrecargar la API
        await new Promise((resolve) => setTimeout(resolve, 50))
      }

      const batchResults = await Promise.all(promises)
      const validPokemon = batchResults.filter((pokemon) => pokemon !== null)
      allPokemon.push(...validPokemon)

      console.log(`✅ Lote completado: ${validPokemon.length}/${batchSize} Pokémon obtenidos`)

      // Pausa entre lotes
      if (endIndex < pokemonLimit) {
        console.log("⏳ Esperando 2 segundos antes del siguiente lote...")
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    }

    if (allPokemon.length === 0) {
      console.log("❌ No se pudieron obtener datos de Pokémon")
      return
    }

    console.log(`📝 Insertando ${allPokemon.length} Pokémon en la base de datos...`)
    const result = await collection.insertMany(allPokemon)
    console.log(`✅ ${result.insertedCount} Pokémon insertados exitosamente`)

    // Crear índices
    console.log("🔍 Creando índices...")
    await collection.createIndex({ name: 1 })
    await collection.createIndex({ types: 1 })
    await collection.createIndex({ is_legendary: 1 })
    await collection.createIndex({ is_mythical: 1 })
    await collection.createIndex({ generation: 1 })
    await collection.createIndex({ id: 1 }, { unique: true })
    console.log("✅ Índices creados")

    // Mostrar estadísticas finales
    const stats = await collection
      .aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            legendary: { $sum: { $cond: ["$is_legendary", 1, 0] } },
            mythical: { $sum: { $cond: ["$is_mythical", 1, 0] } },
            generations: { $addToSet: "$generation" },
          },
        },
      ])
      .toArray()

    const typeStats = await collection
      .aggregate([{ $unwind: "$types" }, { $group: { _id: "$types", count: { $sum: 1 } } }, { $sort: { count: -1 } }])
      .toArray()

    console.log("\n📊 Estadísticas de la base de datos:")
    console.log(`   Total de Pokémon: ${stats[0].total}`)
    console.log(`   Pokémon legendarios: ${stats[0].legendary}`)
    console.log(`   Pokémon míticos: ${stats[0].mythical}`)
    console.log(`   Pokémon normales: ${stats[0].total - stats[0].legendary - stats[0].mythical}`)
    console.log(`   Generaciones: ${stats[0].generations.sort().join(", ")}`)
    console.log(`   Tipos únicos: ${typeStats.length}`)
    console.log(`   Tipo más común: ${typeStats[0]._id} (${typeStats[0].count} Pokémon)`)

    console.log("\n🎉 ¡Base de datos poblada exitosamente con datos de PokéAPI!")
    console.log("🚀 Ahora puedes ejecutar 'npm run dev' para iniciar la aplicación")
  } catch (error) {
    console.error("❌ Error poblando la base de datos:", error)
    process.exit(1)
  } finally {
    await client.close()
    console.log("🔌 Conexión a MongoDB cerrada")
  }
}

// Ejecutar el script
console.log("🚀 Iniciando carga de datos desde PokéAPI...")
console.log("⚠️  Este proceso puede tomar varios minutos dependiendo de cuántos Pokémon cargues")
populateFromPokeAPI()
