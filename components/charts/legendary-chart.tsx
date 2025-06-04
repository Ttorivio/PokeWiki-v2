"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { LegendaryStats } from "@/lib/models/pokemon"

interface LegendaryChartProps {
  data: LegendaryStats
}

const COLORS = ["#fbbf24", "#ef4444", "#3b82f6"]

export function LegendaryChart({ data }: LegendaryChartProps) {
  const chartData = [
    { name: "Legendarios", value: data.legendary, color: COLORS[0] },
    { name: "Míticos", value: data.mythical, color: COLORS[1] },
    { name: "Normales", value: data.normal, color: COLORS[2] },
  ].filter((item) => item.value > 0) // Solo mostrar categorías con datos

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribución de Pokémon Especiales</CardTitle>
        <CardDescription>Proporción de Pokémon legendarios, míticos y normales</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
