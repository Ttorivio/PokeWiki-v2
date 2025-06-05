"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PokemonFiltersProps {
  onFilterChange: (filters: {
    name: string
    type: string
    legendary: string
    generation: string
  }) => void
  filters: {
    name: string
    type: string
    legendary: string
    generation: string
  }
}

const POKEMON_TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
]

const GENERATIONS = [
  { value: "1", label: "Gen I (Kanto)" },
  { value: "2", label: "Gen II (Johto)" },
  { value: "3", label: "Gen III (Hoenn)" },
  { value: "4", label: "Gen IV (Sinnoh)" },
  { value: "5", label: "Gen V (Unova)" },
  { value: "6", label: "Gen VI (Kalos)" },
  { value: "7", label: "Gen VII (Alola)" },
  { value: "8", label: "Gen VIII (Galar)" },
  { value: "9", label: "Gen IX (Paldea)" },
]

export function PokemonFilters({ onFilterChange, filters }: PokemonFiltersProps) {
  const handleFilterChange = (key: string, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value,
    })
  }

  const clearFilters = () => {
    onFilterChange({
      name: "",
      type: "all",
      legendary: "all",
      generation: "all",
    })
  }

  return (
    <Card className="sticky top-4 h-fit">
      <CardHeader>
        <CardTitle>Filtros</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Nombre</label>
          <Input
            placeholder="Buscar por nombre..."
            value={filters.name}
            onChange={(e) => handleFilterChange("name", e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Tipo</label>
          <Select value={filters.type} onValueChange={(value) => handleFilterChange("type", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {POKEMON_TYPES.map((type) => (
                <SelectItem key={type} value={type} className="capitalize">
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Rareza</label>
          <Select value={filters.legendary} onValueChange={(value) => handleFilterChange("legendary", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por rareza" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="normal">Normales</SelectItem>
              <SelectItem value="legendary">Legendarios</SelectItem>
              <SelectItem value="mythical">Míticos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Generación</label>
          <Select value={filters.generation} onValueChange={(value) => handleFilterChange("generation", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar generación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las generaciones</SelectItem>
              {GENERATIONS.map((gen) => (
                <SelectItem key={gen.value} value={gen.value}>
                  {gen.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={clearFilters} variant="outline" className="w-full">
          Limpiar filtros
        </Button>
      </CardContent>
    </Card>
  )
}
