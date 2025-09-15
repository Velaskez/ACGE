'use client'

import { ReactNode } from 'react'
import { Card } from '@/components/ui/card'

interface StatItem {
  label: string
  value: string | number | ReactNode
  icon: ReactNode
  className?: string
}

interface CompactStatsProps {
  stats: StatItem[]
  columns?: 2 | 3 | 4
  className?: string
}

export function CompactStats({ 
  stats, 
  columns = 3, 
  className = '' 
}: CompactStatsProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4'
  }

  return (
    <div className={`grid gap-3 ${gridCols[columns]} ${className}`}>
      {stats.map((stat, index) => (
        <Card key={index} className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <div className="text-lg font-bold">{stat.value}</div>
            </div>
            <div className={stat.className}>
              {stat.icon}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
