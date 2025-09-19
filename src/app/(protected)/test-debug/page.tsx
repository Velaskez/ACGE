'use client'

import { DebugViewer } from '@/components/documents/debug-viewer'
import { RejectTest } from '@/components/debug/reject-test'
import { ValidationChecker } from '@/components/debug/validation-checker'

export default function TestDebugPage() {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold mb-4">Page de Test et Debug</h1>
        <p className="text-gray-600 mb-6">
          Outils de test et de débogage pour l'application ACGE
        </p>
      </div>
      
      <RejectTest />
      
      <ValidationChecker />
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Debug Viewer</h2>
        <DebugViewer />
      </div>
    </div>
  )
}
