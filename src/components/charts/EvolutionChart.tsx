"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export interface MetricConfig {
  dataKey: string
  name: string
  color: string
}

interface EvolutionChartProps {
  data: Record<string, unknown>[]
  metrics: MetricConfig[]
}

export function EvolutionChart({ data, metrics }: EvolutionChartProps) {
  const formattedData = data.map(d => {
    const dt = new Date(d.date as string | Date)
    const localDate = new Date(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate())
    return {
      ...d,
      dateLabel: format(localDate, "dd MMM", { locale: es }),
    }
  })

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="dateLabel" 
            tickLine={false} 
            axisLine={false}
            tick={{ fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            tickLine={false} 
            axisLine={false} 
            tick={{ fontSize: 12 }}
            domain={['auto', 'auto']}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          {metrics.map((metric) => (
            <Line 
              key={metric.dataKey}
              type="monotone" 
              dataKey={metric.dataKey} 
              stroke={metric.color} 
              strokeWidth={3} 
              dot={{ r: 4 }} 
              activeDot={{ r: 6 }} 
              name={metric.name}
              connectNulls={true}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
