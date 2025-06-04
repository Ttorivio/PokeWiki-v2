import { MongoClient } from "mongodb"

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (!process.env.MONGODB_URI) {
  // En lugar de lanzar un error, creamos un cliente mock para el build
  console.warn("MONGODB_URI not found. MongoDB features will be disabled.")

  // Crear un cliente mock que falle graciosamente
  clientPromise = Promise.reject(new Error("MongoDB URI not configured"))
} else {
  const uri = process.env.MONGODB_URI
  const options = {}

  if (process.env.NODE_ENV === "development") {
    if (!(global as any)._mongoClientPromise) {
      client = new MongoClient(uri, options)
      ;(global as any)._mongoClientPromise = client.connect()
    }
    clientPromise = (global as any)._mongoClientPromise
  } else {
    client = new MongoClient(uri, options)
    clientPromise = client.connect()
  }
}

export default clientPromise
