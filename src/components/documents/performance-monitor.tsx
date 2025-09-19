'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Activity, 
  Clock, 
  HardDrive, 
  Zap, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  Trash2,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PerformanceMetrics {
  loadTime: number
  memoryUsage: number
  cacheHitRate: number
  cacheSize: number
  cacheEntries: number
  networkRequests: number
  errors: number
  lastUpdate: Date
}

interface PerformanceMonitorProps {
  isVisible: boolean
  onToggle: () => void
  onClearCache?: () => void
  onOptimize?: () => void
  className?: string
}

export function PerformanceMonitor({
  isVisible,
  onToggle,
  onClearCache,
  onOptimize,
  className
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    memoryUsage: 0,
    cacheHitRate: 0,
    cacheSize: 0,
    cacheEntries: 0,
    networkRequests: 0,
    errors: 0,
    lastUpdate: new Date()
  })

  const [isMonitoring, setIsMonitoring] = useState(false)
  const [alerts, setAlerts] = useState<string[]>([])

  // Surveillance des performances
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true)
    
    const interval = setInterval(() => {
      updateMetrics()
    }, 1000)

    return () => {
      clearInterval(interval)
      setIsMonitoring(false)
    }
  }, [])

  // Mise à jour des métriques
  const updateMetrics = useCallback(() => {
    // Mesure du temps de chargement (simulation)
    const loadTime = performance.now() - performance.timeOrigin

    // Utilisation mémoire (approximation)
    const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0
    const memoryLimit = (performance as any).memory?.totalJSHeapSize || 100000000

    // Métriques de cache (simulation)
    const cacheHitRate = Math.random() * 100
    const cacheSize = Math.random() * 50 * 1024 * 1024 // 0-50MB
    const cacheEntries = Math.floor(Math.random() * 100)

    // Requêtes réseau (simulation)
    const networkRequests = Math.floor(Math.random() * 20)

    // Erreurs (simulation)
    const errors = Math.floor(Math.random() * 5)

    const newMetrics: PerformanceMetrics = {
      loadTime,
      memoryUsage: (memoryUsage / memoryLimit) * 100,
      cacheHitRate,
      cacheSize,
      cacheEntries,
      networkRequests,
      errors,
      lastUpdate: new Date()
    }

    setMetrics(newMetrics)

    // Vérification des alertes
    checkAlerts(newMetrics)
  }, [])

  // Vérification des alertes
  const checkAlerts = useCallback((newMetrics: PerformanceMetrics) => {
    const newAlerts: string[] = []

    if (newMetrics.memoryUsage > 80) {
      newAlerts.push('Utilisation mémoire élevée')
    }

    if (newMetrics.cacheHitRate < 50) {
      newAlerts.push('Taux de succès du cache faible')
    }

    if (newMetrics.cacheSize > 40 * 1024 * 1024) { // 40MB
      newAlerts.push('Cache proche de la limite')
    }

    if (newMetrics.errors > 3) {
      newAlerts.push('Nombre d\'erreurs élevé')
    }

    if (newMetrics.loadTime > 5000) {
      newAlerts.push('Temps de chargement lent')
    }

    setAlerts(newAlerts)
  }, [])

  // Formatage des données
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  // Démarrage/arrêt du monitoring
  useEffect(() => {
    if (isVisible && isMonitoring) {
      const cleanup = startMonitoring()
      return cleanup
    }
  }, [isVisible, isMonitoring, startMonitoring])

  // Rendu des métriques
  const renderMetric = (label: string, value: any, unit: string, icon: React.ReactNode, color?: string) => (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
      <div className="flex items-center space-x-2">
        <div className={cn("p-2 rounded", color || "bg-primary/10")}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{unit}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-lg font-semibold">{value}</p>
      </div>
    </div>
  )

  if (!isVisible) return null

  return (
    <div className={cn("absolute bottom-4 right-4 w-80 z-50", className)}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Performances</span>
              {isMonitoring && (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              )}
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMonitoring(!isMonitoring)}
                className="h-6 w-6 p-0"
              >
                <RefreshCw className={cn("h-3 w-3", isMonitoring && "animate-spin")} />
              </Button>
              <Button variant="ghost" size="sm" onClick={onToggle} className="h-6 w-6 p-0">
                <Settings className="h-3 w-3" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Alertes */}
          {alerts.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Alertes</span>
              </div>
              <div className="space-y-1">
                {alerts.map((alert, index) => (
                  <div key={index} className="flex items-center space-x-2 text-xs text-orange-600">
                    <div className="w-1 h-1 bg-orange-500 rounded-full" />
                    <span>{alert}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Métriques principales */}
          <div className="space-y-3">
            {renderMetric(
              "Temps de chargement",
              formatTime(metrics.loadTime),
              "ms",
              <Clock className="h-4 w-4" />,
              metrics.loadTime > 3000 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
            )}

            {renderMetric(
              "Utilisation mémoire",
              `${metrics.memoryUsage.toFixed(1)}%`,
              "RAM",
              <HardDrive className="h-4 w-4" />,
              metrics.memoryUsage > 80 ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
            )}

            {renderMetric(
              "Taux de succès cache",
              `${metrics.cacheHitRate.toFixed(1)}%`,
              "hit rate",
              <Zap className="h-4 w-4" />,
              metrics.cacheHitRate > 70 ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"
            )}

            {renderMetric(
              "Taille du cache",
              formatBytes(metrics.cacheSize),
              "bytes",
              <HardDrive className="h-4 w-4" />,
              "bg-purple-100 text-purple-600"
            )}

            {renderMetric(
              "Entrées cache",
              metrics.cacheEntries,
              "items",
              <Activity className="h-4 w-4" />,
              "bg-indigo-100 text-indigo-600"
            )}

            {renderMetric(
              "Requêtes réseau",
              metrics.networkRequests,
              "requests",
              <RefreshCw className="h-4 w-4" />,
              "bg-cyan-100 text-cyan-600"
            )}

            {renderMetric(
              "Erreurs",
              metrics.errors,
              "count",
              <AlertTriangle className="h-4 w-4" />,
              metrics.errors > 0 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
            )}
          </div>

          {/* Barre de progression mémoire */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span>Mémoire utilisée</span>
              <span>{metrics.memoryUsage.toFixed(1)}%</span>
            </div>
            <Progress 
              value={metrics.memoryUsage} 
              className="h-2"
              // @ts-ignore
              style={{
                '--progress-background': metrics.memoryUsage > 80 ? '#ef4444' : '#3b82f6'
              }}
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClearCache}
              className="flex-1"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Vider cache
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onOptimize}
              className="flex-1"
            >
              <Zap className="h-3 w-3 mr-1" />
              Optimiser
            </Button>
          </div>

          {/* Dernière mise à jour */}
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            Dernière mise à jour: {metrics.lastUpdate.toLocaleTimeString()}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
