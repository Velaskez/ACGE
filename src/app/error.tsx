'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('Global app error:', error)
  }, [error])

  return (
    <html lang="fr">
      <body>
        <div className="min-h-screen w-full flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Une erreur est survenue</CardTitle>
              <CardDescription>
                {error.message || 'Erreur inattendue'}
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                {error.digest && (
                  <div>Code: {error.digest}</div>
                )}
              </div>
              <div className="flex gap-2">
                <Button onClick={() => reset()} className="flex-1">Réessayer</Button>
                <Button variant="outline" onClick={() => (window.location.href = '/')} className="flex-1">
                  Retour à l’accueil
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  )
}


