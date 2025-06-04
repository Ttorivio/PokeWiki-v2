"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { GenerationStats } from "@/lib/models/pokemon"

interface GenerationChartProps {
  data: GenerationStats[]
}

export function GenerationChart({ data }: GenerationChartProps) {
  const chartData = data.map((item) => ({
    generation: `Gen ${item._id}`,
    count: item.count,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pokémon por Generación</CardTitle>
        <CardDescription>Distribución de Pokémon según su generación</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="generation" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
