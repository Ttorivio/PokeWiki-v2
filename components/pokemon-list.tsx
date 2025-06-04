"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { Pokemon } from "@/lib/models/pokemon"
import Image from "next/image"

interface PokemonListProps {
  pokemon: Pokemon[]
}

export function PokemonList({ pokemon }: PokemonListProps) {
  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      normal: "bg-gray-400",
      fire: "bg-red-500",
      water: "bg-blue-500",
      electric: "bg-yellow-400",
      grass: "bg-green-500",
      ice: "bg-blue-200",
      fighting: "bg-red-700",
      poison: "bg-purple-500",
      ground: "bg-yellow-600",
      flying: "bg-indigo-400",
      psychic: "bg-pink-500",
      bug: "bg-green-400",
      rock: "bg-yellow-800",
      ghost: "bg-purple-700",
      dragon: "bg-indigo-700",
      dark: "bg-gray-800",
      steel: "bg-gray-500",
      fairy: "bg-pink-300",
    }
    return colors[type] || "bg-gray-400"
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {pokemon.map((p) => (
        <Card key={p.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg capitalize">{p.name}</CardTitle>
              <span className="text-sm text-muted-foreground">#{p.id.toString().padStart(3, "0")}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-3">
              <div className="relative">
                <Image
                  src={p.sprite_url || "/placeholder.svg?height=96&width=96"}
                  alt={p.name}
                  width={96}
                  height={96}
                  className="pixelated"
                />
                {p.sprite_shiny && (
                  <div className="absolute -top-1 -right-1">
                    <span className="text-xs">✨</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-1 justify-center">
                {p.types.map((type) => (
                  <Badge key={type} className={`text-xs text-white ${getTypeColor(type)}`}>
                    {type}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2">
                {p.is_legendary && (
                  <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600 text-xs">
                    👑 Legendario
                  </Badge>
                )}
                {p.is_mythical && (
                  <Badge variant="default" className="bg-purple-500 hover:bg-purple-600 text-xs">
                    🌟 Mítico
                  </Badge>
                )}
              </div>

              <div className="w-full space-y-1">
                <div className="flex justify-between text-xs">
                  <span>HP</span>
                  <span>{p.stats.hp}</span>
                </div>
                <Progress value={(p.stats.hp / 255) * 100} className="h-1" />

                <div className="flex justify-between text-xs">
                  <span>ATK</span>
                  <span>{p.stats.attack}</span>
                </div>
                <Progress value={(p.stats.attack / 255) * 100} className="h-1" />

                <div className="flex justify-between text-xs">
                  <span>DEF</span>
                  <span>{p.stats.defense}</span>
                </div>
                <Progress value={(p.stats.defense / 255) * 100} className="h-1" />
              </div>

              <div className="text-xs text-muted-foreground text-center space-y-1">
                <div>
                  Altura: {p.height / 10}m | Peso: {p.weight / 10}kg
                </div>
                <div>Generación: {p.generation}</div>
                {p.habitat && <div>Hábitat: {p.habitat}</div>}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
