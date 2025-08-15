import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Page non trouvée
        </h2>
        <p className="text-muted-foreground mb-4">
          La page que vous recherchez n'existe pas
        </p>
        <Link
          href="/"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  )
}
