"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { PokemonTypeCount } from "@/lib/models/pokemon"

interface TypeChartProps {
  data: PokemonTypeCount[]
}

export function TypeChart({ data }: TypeChartProps) {
  const chartData = data.map((item) => ({
    type: item._id,
    count: item.count,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pokémon por Tipo</CardTitle>
        <CardDescription>Distribución de Pokémon según su tipo</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
