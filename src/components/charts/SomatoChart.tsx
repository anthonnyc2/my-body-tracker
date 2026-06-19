import React from 'react'

interface SomatoChartProps {
  currentEndo: number
  currentMeso: number
  currentEcto: number
  previousEndo?: number | null
  previousMeso?: number | null
  previousEcto?: number | null
}

export function SomatoChart({ 
  currentEndo, 
  currentMeso, 
  currentEcto, 
  previousEndo, 
  previousMeso, 
  previousEcto 
}: SomatoChartProps) {
  const cx = 200
  const cy = 180
  const SCALE = 12
  const SQRT3 = Math.sqrt(3)

  const getCoordinates = (endo: number, meso: number, ecto: number) => {
    const x = ecto - endo
    const y = 2 * meso - (endo + ecto)
    const px = cx + x * SQRT3 * SCALE
    const py = cy - y * SCALE
    return { px, py }
  }

  const current = getCoordinates(currentEndo, currentMeso, currentEcto)
  let previous = null
  if (previousEndo != null && previousMeso != null && previousEcto != null) {
    previous = getCoordinates(previousEndo, previousMeso, previousEcto)
  }

  // Reuleaux triangle vertices for the grid
  const vMeso = { px: cx, py: cy - 12 * SCALE }
  const vEndo = { px: cx - 6 * SQRT3 * SCALE, py: cy - (-6) * SCALE }
  const vEcto = { px: cx + 6 * SQRT3 * SCALE, py: cy - (-6) * SCALE }
  
  // Radius of the arcs is the side length of the equilateral triangle
  const r = 12 * SQRT3 * SCALE

  return (
    <div className="w-full flex justify-center items-center py-4">
      <svg width="400" height="320" viewBox="0 0 400 320" className="max-w-full h-auto drop-shadow-sm">
        {/* Draw Reuleaux Triangle Background */}
        <path 
          d={`M ${vEndo.px} ${vEndo.py} 
              A ${r} ${r} 0 0 0 ${vEcto.px} ${vEcto.py}
              A ${r} ${r} 0 0 0 ${vMeso.px} ${vMeso.py}
              A ${r} ${r} 0 0 0 ${vEndo.px} ${vEndo.py}`}
          className="fill-muted/30 stroke-border"
          strokeWidth="2"
        />

        {/* Axes */}
        <line x1={cx} y1={cy - 13*SCALE} x2={cx} y2={cy + 8*SCALE} className="stroke-border" strokeWidth="1" strokeDasharray="4 4" />
        <line x1={cx - 10*SQRT3*SCALE} y1={cy} x2={cx + 10*SQRT3*SCALE} y2={cy} className="stroke-border" strokeWidth="1" strokeDasharray="4 4" />

        {/* Center point (4,4,4) */}
        <circle cx={cx} cy={cy} r="2" className="fill-border" />

        {/* Labels */}
        <text x={vMeso.px} y={vMeso.py - 12} textAnchor="middle" fontSize="13" fontWeight="bold" className="fill-foreground">Mesomorfia</text>
        <text x={vEndo.px - 10} y={vEndo.py + 18} textAnchor="end" fontSize="13" fontWeight="bold" className="fill-foreground">Endomorfia</text>
        <text x={vEcto.px + 10} y={vEcto.py + 18} textAnchor="start" fontSize="13" fontWeight="bold" className="fill-foreground">Ectomorfia</text>

        {/* Previous Point & Arrow */}
        {previous && (
          <>
            <circle cx={previous.px} cy={previous.py} r="4" className="fill-muted-foreground" />
            
            <defs>
              <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" className="fill-primary opacity-80" />
              </marker>
            </defs>
            <line 
              x1={previous.px} 
              y1={previous.py} 
              x2={current.px} 
              y2={current.py} 
              className="stroke-primary opacity-80" 
              strokeWidth="2.5"
              strokeDasharray="4 3"
              markerEnd="url(#arrowhead)"
            />
          </>
        )}

        {/* Current Point */}
        <circle cx={current.px} cy={current.py} r="6" className="fill-primary drop-shadow-md" />
        <circle cx={current.px} cy={current.py} r="12" className="fill-primary opacity-20 animate-pulse" />
      </svg>
    </div>
  )
}
