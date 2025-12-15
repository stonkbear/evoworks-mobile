'use client'

import { useEffect, useState } from 'react'

/**
 * Retro 8-bit Network Connection Animation
 * Shows agents connecting in network
 */
export function NetworkConnect() {
  const [connections, setConnections] = useState<number>(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setConnections((c) => (c + 1) % 7)
    }, 600)
    return () => clearInterval(interval)
  }, [])

  const agents = [
    { x: 40, y: 20, active: connections >= 0 },
    { x: 120, y: 20, active: connections >= 2 },
    { x: 200, y: 20, active: connections >= 4 },
    { x: 80, y: 60, active: connections >= 1 },
    { x: 160, y: 60, active: connections >= 3 },
  ]

  const lines = [
    { from: 0, to: 3, active: connections >= 1 },
    { from: 1, to: 3, active: connections >= 2 },
    { from: 1, to: 4, active: connections >= 3 },
    { from: 2, to: 4, active: connections >= 4 },
    { from: 3, to: 4, active: connections >= 5 },
  ]

  return (
    <div className="relative w-full h-32 bg-[#0a0a0a] rounded-lg p-4 border border-pink-500/20 overflow-hidden">
      {/* Title */}
      <div className="text-pink-400 text-xs font-mono mb-2 pixel-text">
        AGENT NETWORK: {connections}/6 CONNECTED
      </div>

      {/* Canvas for agents and connections */}
      <svg className="absolute inset-4 w-[calc(100%-2rem)] h-[calc(100%-3rem)]" viewBox="0 0 240 100">
        {/* Connection lines */}
        {lines.map((line, i) => {
          const from = agents[line.from]
          const to = agents[line.to]
          return (
            <line
              key={i}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={line.active ? '#f9a8d4' : '#f9a8d4'}
              strokeWidth="2"
              strokeDasharray={line.active ? '0' : '4 4'}
              opacity={line.active ? '0.8' : '0.2'}
              className="transition-all duration-300"
            />
          )
        })}

        {/* Agent nodes */}
        {agents.map((agent, i) => (
          <g key={i}>
            {/* Pulse ring when active */}
            {agent.active && (
              <circle
                cx={agent.x}
                cy={agent.y}
                r="12"
                fill="none"
                stroke="#f9a8d4"
                strokeWidth="2"
                opacity="0.4"
                className="animate-ping"
              />
            )}
            
            {/* Agent node */}
            <circle
              cx={agent.x}
              cy={agent.y}
              r="8"
              fill={agent.active ? '#f9a8d4' : '#1a1a1a'}
              stroke="#f9a8d4"
              strokeWidth="2"
              className="transition-all duration-300"
            />
            
            {/* Bat emoji in center */}
            <text
              x={agent.x}
              y={agent.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="10"
              opacity={agent.active ? '1' : '0.3'}
            >
              🦇
            </text>
          </g>
        ))}
      </svg>

      <style jsx>{`
        .pixel-text {
          letter-spacing: 2px;
          image-rendering: pixelated;
        }
      `}</style>
    </div>
  )
}

