'use client'

/**
 * Simple Chart Components
 * Uses CSS for lightweight charts without external dependencies
 */

import { useMemo } from 'react'

interface DataPoint {
  date: string
  value: number
  label?: string
}

interface LineChartProps {
  data: DataPoint[]
  color?: string
  height?: number
  showLabels?: boolean
  formatValue?: (value: number) => string
}

export function LineChart({
  data,
  color = '#ff6b35',
  height = 200,
  showLabels = false,
  formatValue = (v) => v.toLocaleString(),
}: LineChartProps) {
  const { points, maxValue, minValue } = useMemo(() => {
    if (!data.length) return { points: '', maxValue: 0, minValue: 0 }

    const values = data.map(d => d.value)
    const max = Math.max(...values, 1)
    const min = Math.min(...values, 0)
    const range = max - min || 1

    const width = 100
    const xStep = width / (data.length - 1 || 1)

    const pts = data.map((d, i) => {
      const x = i * xStep
      const y = 100 - ((d.value - min) / range) * 100
      return `${x},${y}`
    }).join(' ')

    return { points: pts, maxValue: max, minValue: min }
  }, [data])

  if (!data.length) {
    return (
      <div className="flex items-center justify-center text-[#525252]" style={{ height }}>
        No data available
      </div>
    )
  }

  return (
    <div className="relative" style={{ height }}>
      {/* Y-axis labels */}
      {showLabels && (
        <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-[#525252] pr-2">
          <span>{formatValue(maxValue)}</span>
          <span>{formatValue(minValue)}</span>
        </div>
      )}

      {/* Chart area */}
      <div className={`h-full ${showLabels ? 'ml-12' : ''}`}>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {/* Grid lines */}
          <line x1="0" y1="25" x2="100" y2="25" stroke="#1f1f1f" strokeWidth="0.5" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="#1f1f1f" strokeWidth="0.5" />
          <line x1="0" y1="75" x2="100" y2="75" stroke="#1f1f1f" strokeWidth="0.5" />

          {/* Area fill */}
          <polygon
            points={`0,100 ${points} 100,100`}
            fill={`${color}15`}
          />

          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      {/* X-axis labels */}
      {showLabels && data.length <= 7 && (
        <div className="flex justify-between text-xs text-[#525252] mt-2">
          {data.map((d, i) => (
            <span key={i}>{d.date.slice(5)}</span>
          ))}
        </div>
      )}
    </div>
  )
}

interface BarChartProps {
  data: Array<{ label: string; value: number; color?: string }>
  height?: number
  formatValue?: (value: number) => string
  horizontal?: boolean
}

export function BarChart({
  data,
  height = 200,
  formatValue = (v) => v.toLocaleString(),
  horizontal = false,
}: BarChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1)

  if (!data.length) {
    return (
      <div className="flex items-center justify-center text-[#525252]" style={{ height }}>
        No data available
      </div>
    )
  }

  if (horizontal) {
    return (
      <div className="space-y-3">
        {data.map((item, i) => (
          <div key={i}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[#a3a3a3]">{item.label}</span>
              <span className="text-white font-medium">{formatValue(item.value)}</span>
            </div>
            <div className="h-2 bg-[#1f1f1f] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: item.color || '#ff6b35',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-end justify-between gap-2" style={{ height }}>
      {data.map((item, i) => (
        <div key={i} className="flex-1 flex flex-col items-center">
          <div
            className="w-full rounded-t transition-all duration-500"
            style={{
              height: `${(item.value / maxValue) * 100}%`,
              backgroundColor: item.color || '#ff6b35',
              minHeight: item.value > 0 ? '4px' : '0',
            }}
          />
          <span className="text-xs text-[#525252] mt-2 truncate max-w-full">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  )
}

interface SparklineProps {
  data: number[]
  color?: string
  height?: number
  width?: number
}

export function Sparkline({
  data,
  color = '#ff6b35',
  height = 32,
  width = 100,
}: SparklineProps) {
  const points = useMemo(() => {
    if (!data.length) return ''

    const max = Math.max(...data, 1)
    const min = Math.min(...data, 0)
    const range = max - min || 1
    const xStep = width / (data.length - 1 || 1)

    return data.map((value, i) => {
      const x = i * xStep
      const y = height - ((value - min) / range) * height
      return `${x},${y}`
    }).join(' ')
  }, [data, height, width])

  if (!data.length) return null

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

interface DonutChartProps {
  data: Array<{ label: string; value: number; color: string }>
  size?: number
  strokeWidth?: number
}

export function DonutChart({
  data,
  size = 150,
  strokeWidth = 20,
}: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  let currentOffset = 0

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {data.map((item, i) => {
          const percentage = total > 0 ? item.value / total : 0
          const strokeDasharray = `${circumference * percentage} ${circumference}`
          const strokeDashoffset = -currentOffset * circumference
          currentOffset += percentage

          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500"
            />
          )
        })}
      </svg>
      
      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {total.toLocaleString()}
          </div>
          <div className="text-xs text-[#525252]">Total</div>
        </div>
      </div>
    </div>
  )
}

