"use client"

import React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface Props {
  muscleMassKg?: number | null
  bodyFatKg?: number | null
  boneMassKg?: number | null
  residualMassKg?: number | null
  weight: number
}

const COLORS = {
  muscle: "#ef4444", // red-500
  fat: "#eab308", // yellow-500
  bone: "#9ca3af", // gray-400
  residual: "#3b82f6", // blue-500
}

const CustomTooltip = ({ active, payload, weight }: { active?: boolean, payload?: { payload: { name: string, value: number, color: string } }[], weight: number }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const percentage = ((data.value / weight) * 100).toFixed(1)
    return (
      <div className="bg-background border border-border shadow-xl rounded-xl p-4 backdrop-blur-md">
        <p className="font-semibold text-sm mb-2 flex items-center gap-2 text-foreground">
          <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: data.color }} />
          {data.name}
        </p>
        <div className="flex items-baseline gap-1">
          <p className="text-3xl font-bold tracking-tight text-foreground">
            {data.value.toFixed(1)}
          </p>
          <p className="text-sm font-medium text-muted-foreground">kg</p>
        </div>
        <p className="text-sm text-muted-foreground font-medium mt-1 bg-muted/50 inline-block px-2 py-0.5 rounded-md">
          {percentage}% del peso total
        </p>
      </div>
    )
  }
  return null
}

export function BodyCompositionChart({ muscleMassKg, bodyFatKg, boneMassKg, residualMassKg, weight }: Props) {
  // Guard clause if data is incomplete
  if (!muscleMassKg || !bodyFatKg || !boneMassKg || !residualMassKg) {
    return (
      <div className="flex flex-col items-center justify-center h-80 bg-muted/10 rounded-2xl border border-dashed border-muted-foreground/30 p-6 text-center">
        <div className="bg-muted p-3 rounded-full mb-4">
          <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
        </div>
        <h3 className="font-semibold text-lg text-foreground mb-1">Modelo de 4 Componentes</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Faltan datos requeridos (marcados con *) en la evaluación para generar el desglose anatómico completo.
        </p>
      </div>
    )
  }

  const data = [
    { name: "Masa Muscular", value: muscleMassKg, color: COLORS.muscle },
    { name: "Masa Adiposa", value: bodyFatKg, color: COLORS.fat },
    { name: "Masa Ósea", value: boneMassKg, color: COLORS.bone },
    { name: "Masa Residual", value: residualMassKg, color: COLORS.residual },
  ]

  return (
    <div className="w-full min-h-[350px] flex flex-col items-center justify-center relative bg-card rounded-2xl border p-4 shadow-sm">
      <h3 className="absolute top-4 left-6 font-semibold text-lg text-foreground tracking-tight">Composición Corporal</h3>
      <div className="w-full h-[300px] mt-8">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground font-bold text-3xl tracking-tighter">
              {weight.toFixed(1)}
            </text>
            <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-xs font-medium uppercase tracking-wider">
              kg Total
            </text>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={85}
              outerRadius={115}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
              cornerRadius={4}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity cursor-pointer focus:outline-none drop-shadow-sm" />
              ))}
            </Pie>
            <Tooltip 
              content={<CustomTooltip weight={weight} />} 
              cursor={false} 
              wrapperStyle={{ outline: 'none', zIndex: 100 }} 
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              formatter={(value) => <span className="text-sm font-medium text-foreground ml-1">{value}</span>}
              wrapperStyle={{ paddingTop: "20px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
