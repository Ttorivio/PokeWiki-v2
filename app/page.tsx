"use client"

import { useState, useEffect } from "react"
import { TypeChart } from "@/components/charts/type-chart"
import { LegendaryChart } from "@/components/charts/legendary-chart"
import { GenerationChart } from "@/components/charts/generation-chart"
import { PokemonList } from "@/components/pokemon-list"
import { PokemonFilters } from "@/components/pokemon-filters"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Loader2, Database } from "lucide-react"
import type { Pokemon, PokemonTypeCount, LegendaryStats, GenerationStats } from "@/lib/models/pokemon"

export default function Home() {
  const [pokemon, setPokemon] = useState<Pokemon[]>([])
  const [typeStats, setTypeStats] = useState<PokemonTypeCount[]>([])
  const [legendaryStats, setLegendaryStats] = useState<LegendaryStats | null>(null)
  const [generationStats, setGenerationStats] = useState<GenerationStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [seeding, setSeeding] = useState(false)
  const [setupRequired, setSetupRequired] = useState(false)
  const [pokemonLimit, setPokemonLimit] = useState("151")
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 0 })
  const [filters, setFilters] = useState({
    name: "",
    type: "all",
    legendary: "all",
    generation: "all",
  })

  const pokemonLimits = [
    { value: "151", label: "Gen 1 - Kanto (151 Pokémon)" },
    { value: "251", label: "Gen 1-2 - Kanto + Johto (251 Pokémon)" },
    { value: "386", label: "Gen 1-3 - Hasta Hoenn (386 Pokémon)" },
    { value: "493", label: "Gen 1-4 - Hasta Sinnoh (493 Pokémon)" },
    { value: "649", label: "Gen 1-5 - Hasta Unova (649 Pokémon)" },
    { value: "721", label: "Gen 1-6 - Hasta Kalos (721 Pokémon)" },
    { value: "809", label: "Gen 1-7 - Hasta Alola (809 Pokémon)" },
    { value: "905", label: "Gen 1-8 - Hasta Galar (905 Pokémon)" },
    { value: "1010", label: "Todos los Pokémon (1010+ Pokémon)" },
  ]

  const fetchPokemon = async (page = 1) => {
    try {
      const params = new URLSearchParams()
      if (filters.name) params.append("name", filters.name)
      if (filters.type !== "all") params.append("type", filters.type)
      if (filters.legendary !== "all") params.append("legendary", filters.legendary)
      if (filters.generation !== "all") params.append("generation", filters.generation)
      params.append("page", page.toString())
      params.append("limit", "50")

      const response = await fetch(`/api/pokemon?${params}`)
      const data = await response.json()

      if (data.setup_required) {
        setSetupRequired(true)
        setError("MongoDB no está configurado. Necesitas configurar la variable MONGODB_URI.")
        return false
      }

      if ((!data.pokemon || data.pokemon.length === 0) && !data.error) {
        setError("No hay datos de Pokémon en la base de datos")
        return false
      }

      setPokemon(data.pokemon || [])
      setPagination(data.pagination || { page: 1, limit: 50, total: 0, pages: 0 })
      return true
    } catch (error) {
      console.error("Error fetching pokemon:", error)
      setError("Error al cargar los datos de Pokémon")
      return false
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/pokemon/stats")
      const data = await response.json()

      if (data.setup_required) {
        setSetupRequired(true)
        return false
      }

      setTypeStats(data.typeStats || [])
      setLegendaryStats(data.legendaryStats || { legendary: 0, mythical: 0, normal: 0, total: 0 })
      setGenerationStats(data.generationStats || [])
      return true
    } catch (error) {
      console.error("Error fetching stats:", error)
      setTypeStats([])
      setLegendaryStats({ legendary: 0, mythical: 0, normal: 0, total: 0 })
      setGenerationStats([])
      return false
    }
  }

  const seedDatabase = async () => {
    try {
      setSeeding(true)
      setError(null)

      const response = await fetch(`/api/admin/seed?apiKey=pokemon-dashboard-secret-2024&limit=${pokemonLimit}`)
      const data = await response.json()

      if (data.setup_required) {
        setSetupRequired(true)
        setError(
          "MongoDB no está configurado. Necesitas configurar la variable MONGODB_URI en las variables de entorno.",
        )
        return false
      }

      if (data.error) {
        setError(`Error al poblar la base de datos: ${data.error}`)
        return false
      }

      await Promise.all([fetchPokemon(1), fetchStats()])
      setError(null)
      return true
    } catch (error) {
      console.error("Error seeding database:", error)
      setError("Error al poblar la base de datos")
      return false
    } finally {
      setSeeding(false)
    }
  }

  const addMorePokemon = async () => {
    try {
      setSeeding(true)
      setError(null)

      // Usar force=true para agregar más Pokémon sin borrar los existentes
      const response = await fetch(
        `/api/admin/seed?apiKey=pokemon-dashboard-secret-2024&limit=${pokemonLimit}&force=true`,
      )
      const data = await response.json()

      if (data.error) {
        setError(`Error al agregar más Pokémon: ${data.error}`)
        return false
      }

      await Promise.all([fetchPokemon(1), fetchStats()])
      setError(null)
      return true
    } catch (error) {
      console.error("Error adding more pokemon:", error)
      setError("Error al agregar más Pokémon")
      return false
    } finally {
      setSeeding(false)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)

      const [pokemonSuccess, statsSuccess] = await Promise.all([fetchPokemon(1), fetchStats()])

      if (!pokemonSuccess && !statsSuccess && !setupRequired) {
        setError("No hay datos de Pokémon en la base de datos. Puedes cargar datos usando el botón de abajo.")
      } else if (!setupRequired) {
        setError(null)
      }

      setLoading(false)
    }
    loadData()
  }, [])

  useEffect(() => {
    if (!setupRequired) {
      fetchPokemon(1)
    }
  }, [filters])

  const handlePageChange = (newPage: number) => {
    fetchPokemon(newPage)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="text-lg">Cargando datos de Pokémon...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="bg-white rounded-[15px] border border-black p-6 shadow text-center space-y-2 w-fit mx-auto">
        <h1 className="text-4xl font-bold">Pokefan</h1>
        <p className="text-muted-foreground">Explora y analiza datos completos de tus pokemones favoritos</p>
      </div>

      {setupRequired && (
        <Alert>
          <Database className="h-4 w-4" />
          <AlertTitle>Configuración Requerida</AlertTitle>
          <AlertDescription>
            Para usar esta aplicación, necesitas configurar MongoDB. Agrega la variable de entorno MONGODB_URI con tu
            conexión a MongoDB Atlas o una instancia local.
          </AlertDescription>
        </Alert>
      )}

      {error && !setupRequired && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-4">
              <Select value={pokemonLimit} onValueChange={setPokemonLimit}>
                <SelectTrigger className="w-80">
                  <SelectValue placeholder="Selecciona cuántos Pokémon cargar" />
                </SelectTrigger>
                <SelectContent>
                  {pokemonLimits.map((limit) => (
                    <SelectItem key={limit.value} value={limit.value}>
                      {limit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={seedDatabase} disabled={seeding} className="flex items-center gap-2">
                {seeding && <Loader2 className="h-4 w-4 animate-spin" />}
                {seeding ? "Cargando datos..." : "Cargar datos de Pokémon"}
              </Button>
            </div>
          </div>
        </Alert>
      )}

      {!error && !setupRequired && (
        <>
          {/* Botón para agregar más Pokémon cuando ya hay datos */}
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Datos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Select value={pokemonLimit} onValueChange={setPokemonLimit}>
                  <SelectTrigger className="w-80">
                    <SelectValue placeholder="Selecciona cuántos Pokémon cargar" />
                  </SelectTrigger>
                  <SelectContent>
                    {pokemonLimits.map((limit) => (
                      <SelectItem key={limit.value} value={limit.value}>
                        {limit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={addMorePokemon} disabled={seeding} className="flex items-center gap-2">
                  {seeding && <Loader2 className="h-4 w-4 animate-spin" />}
                  {seeding ? "Agregando Pokémon..." : "Agregar más Pokémon"}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Actualmente tienes {legendaryStats?.total || 0} Pokémon en la base de datos
              </p>
            </CardContent>
          </Card>

          <Tabs defaultValue="dashboard" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 border border-black rounded-lg overflow-hidden">
              <TabsTrigger
                  value="dashboard"
                  className="data-[state=active]:bg-black data-[state=active]:text-white text-black"
              >
                Dashboard
              </TabsTrigger>
              <TabsTrigger
                  value="pokemon"
                  className="data-[state=active]:bg-black data-[state=active]:text-white text-black"
              >
                Pokémon
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {typeStats.length > 0 && <TypeChart data={typeStats} />}
                {legendaryStats && <LegendaryChart data={legendaryStats} />}
                {generationStats.length > 0 && <GenerationChart data={generationStats} />}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Estadísticas Generales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{legendaryStats?.total || 0}</div>
                      <div className="text-sm text-muted-foreground">Total Pokémon</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{legendaryStats?.legendary || 0}</div>
                      <div className="text-sm text-muted-foreground">Legendarios</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{legendaryStats?.mythical || 0}</div>
                      <div className="text-sm text-muted-foreground">Míticos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{typeStats.length}</div>
                      <div className="text-sm text-muted-foreground">Tipos Diferentes</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pokemon" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                  <PokemonFilters filters={filters} onFilterChange={setFilters} />
                </div>
                <div className="lg:col-span-3">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Pokémon Encontrados ({pagination.total})</CardTitle>
                        <div className="text-sm text-muted-foreground">
                          Página {pagination.page} de {pagination.pages}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {pokemon.length > 0 ? (
                        <PokemonList pokemon={pokemon} />
                      ) : (
                        <div className="text-center py-8">No se encontraron Pokémon con los filtros actuales</div>
                      )}

                      {pagination.pages > 1 && (
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="outline"
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page <= 1}
                          >
                            Anterior
                          </Button>
                          <span className="flex items-center px-4">
                            {pagination.page} / {pagination.pages}
                          </span>
                          <Button
                            variant="outline"
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page >= pagination.pages}
                          >
                            Siguiente
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
