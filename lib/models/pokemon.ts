export interface Pokemon {
  _id?: string
  id: number
  name: string
  types: string[]
  height: number
  weight: number
  base_experience: number
  is_legendary: boolean
  is_mythical: boolean
  generation: number
  sprite_url: string
  sprite_shiny?: string
  stats: {
    hp: number
    attack: number
    defense: number
    special_attack: number
    special_defense: number
    speed: number
  }
  abilities: string[]
  color: string
  habitat?: string
  shape?: string
}

export interface PokemonTypeCount {
  _id: string
  count: number
}

export interface LegendaryStats {
  legendary: number
  mythical: number
  normal: number
  total: number
}

export interface GenerationStats {
  _id: number
  count: number
}
