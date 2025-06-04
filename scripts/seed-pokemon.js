import { MongoClient } from "mongodb"

// Datos de ejemplo de Pokémon
const pokemonData = [
  {
    id: 1,
    name: "bulbasaur",
    types: ["grass", "poison"],
    height: 7,
    weight: 69,
    base_experience: 64,
    is_legendary: false,
    generation: 1,
    sprite_url: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
    stats: { hp: 45, attack: 49, defense: 49, special_attack: 65, special_defense: 65, speed: 45 },
  },
  {
    id: 4,
    name: "charmander",
    types: ["fire"],
    height: 6,
    weight: 85,
    base_experience: 62,
    is_legendary: false,
    generation: 1,
    sprite_url: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png",
    stats: { hp: 39, attack: 52, defense: 43, special_attack: 60, special_defense: 50, speed: 65 },
  },
  {
    id: 7,
    name: "squirtle",
    types: ["water"],
    height: 5,
    weight: 90,
    base_experience: 63,
    is_legendary: false,
    generation: 1,
    sprite_url: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png",
    stats: { hp: 44, attack: 48, defense: 65, special_attack: 50, special_defense: 64, speed: 43 },
  },
  {
    id: 25,
    name: "pikachu",
    types: ["electric"],
    height: 4,
    weight: 60,
    base_experience: 112,
    is_legendary: false,
    generation: 1,
    sprite_url: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
    stats: { hp: 35, attack: 55, defense: 40, special_attack: 50, special_defense: 50, speed: 90 },
  },
  {
    id: 150,
    name: "mewtwo",
    types: ["psychic"],
    height: 20,
    weight: 1220,
    base_experience: 340,
    is_legendary: true,
    generation: 1,
    sprite_url: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png",
    stats: { hp: 106, attack: 110, defense: 90, special_attack: 154, special_defense: 90, speed: 130 },
  },
  {
    id: 144,
    name: "articuno",
    types: ["ice", "flying"],
    height: 17,
    weight: 554,
    base_experience: 290,
    is_legendary: true,
    generation: 1,
    sprite_url: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/144.png",
    stats: { hp: 90, attack: 85, defense: 100, special_attack: 95, special_defense: 125, speed: 85 },
  },
  {
    id: 145,
    name: "zapdos",
    types: ["electric", "flying"],
    height: 16,
    weight: 526,
    base_experience: 290,
    is_legendary: true,
    generation: 1,
    sprite_url: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/145.png",
    stats: { hp: 90, attack: 90, defense: 85, special_attack: 125, special_defense: 90, speed: 100 },
  },
  {
    id: 146,
    name: "moltres",
    types: ["fire", "flying"],
    height: 20,
    weight: 600,
    base_experience: 290,
    is_legendary: true,
    generation: 1,
    sprite_url: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/146.png",
    stats: { hp: 90, attack: 100, defense: 90, special_attack: 125, special_defense: 85, speed: 90 },
  },
  {
    id: 39,
    name: "jigglypuff",
    types: ["normal", "fairy"],
    height: 5,
    weight: 55,
    base_experience: 95,
    is_legendary: false,
    generation: 1,
    sprite_url: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/39.png",
    stats: { hp: 115, attack: 45, defense: 20, special_attack: 45, special_defense: 25, speed: 20 },
  },
  {
    id: 94,
    name: "gengar",
    types: ["ghost", "poison"],
    height: 15,
    weight: 405,
    base_experience: 250,
    is_legendary: false,
    generation: 1,
    sprite_url: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png",
    stats: { hp: 60, attack: 65, defense: 60, special_attack: 130, special_defense: 75, speed: 110 },
  },
  {
    id: 131,
    name: "lapras",
    types: ["water", "ice"],
    height: 25,
    weight: 2200,
    base_experience: 187,
    is_legendary: false,
    generation: 1,
    sprite_url: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/131.png",
    stats: { hp: 130, attack: 85, defense: 80, special_attack: 85, special_defense: 95, speed: 60 },
  },
  {
    id: 149,
    name: "dragonite",
    types: ["dragon", "flying"],
    height: 22,
    weight: 2100,
    base_experience: 300,
    is_legendary: false,
    generation: 1,
    sprite_url: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/149.png",
    stats: { hp: 91, attack: 134, defense: 95, special_attack: 100, special_defense: 100, speed: 80 },
  },
]

async function seedDatabase() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017"
  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log("Conectado a MongoDB")

    const db = client.db("pokemon_db")
    const collection = db.collection("pokemon")

    // Limpiar colección existente
    await collection.deleteMany({})
    console.log("Colección limpiada")

    // Insertar datos de Pokémon
    const result = await collection.insertMany(pokemonData)
    console.log(`${result.insertedCount} Pokémon insertados`)

    // Crear índices
    await collection.createIndex({ name: 1 })
    await collection.createIndex({ types: 1 })
    await collection.createIndex({ is_legendary: 1 })
    console.log("Índices creados")

    console.log("Base de datos poblada exitosamente!")
  } catch (error) {
    console.error("Error poblando la base de datos:", error)
  } finally {
    await client.close()
  }
}

seedDatabase()
