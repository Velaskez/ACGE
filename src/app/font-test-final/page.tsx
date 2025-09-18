export default function FontTestFinalPage() {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Test final des polices ACGE</h1>
      
      <div className="space-y-6">
        {/* Test des dates */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-blue-600">Test des dates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <h3 className="font-medium mb-2">Date normale</h3>
              <p className="text-date">15/01/2024</p>
            </div>
            <div className="p-4 border rounded">
              <h3 className="font-medium mb-2">Date avec heure</h3>
              <p className="text-date">15 janvier 2024 à 14:30</p>
            </div>
          </div>
        </section>

        {/* Test des numéros et codes */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-green-600">Test des numéros et codes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <h3 className="font-medium mb-2">Numéro de dossier</h3>
              <p className="text-reference">DOS-2024-001</p>
            </div>
            <div className="p-4 border rounded">
              <h3 className="font-medium mb-2">Code de poste</h3>
              <p className="text-code">PC-12345</p>
            </div>
            <div className="p-4 border rounded">
              <h3 className="font-medium mb-2">Taille de fichier</h3>
              <p className="text-number">2.5 MB</p>
            </div>
            <div className="p-4 border rounded">
              <h3 className="font-medium mb-2">Identifiant</h3>
              <p className="text-id">#ID-12345</p>
            </div>
          </div>
        </section>

        {/* Test des montants */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-purple-600">Test des montants</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded">
              <h3 className="font-medium mb-2">Montant simple</h3>
              <p className="text-amount">1,250.00 €</p>
            </div>
            <div className="p-4 border rounded">
              <h3 className="font-medium mb-2">Montant élevé</h3>
              <p className="text-amount">125,000.50 €</p>
            </div>
            <div className="p-4 border rounded">
              <h3 className="font-medium mb-2">Montant avec décimales</h3>
              <p className="text-amount">99.99 €</p>
            </div>
          </div>
        </section>

        {/* Test de comparaison */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-orange-600">Test de comparaison</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <h3 className="font-medium mb-2">Avec Outfit (par défaut)</h3>
              <p className="text-base">Ce texte utilise la police Outfit par défaut pour l'interface utilisateur.</p>
            </div>
            <div className="p-4 border rounded">
              <h3 className="font-medium mb-2">Avec FreeMono</h3>
              <p className="font-mono text-base">Ce texte utilise la police FreeMono pour les données techniques.</p>
            </div>
          </div>
        </section>

        {/* Instructions */}
        <section className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-blue-800">Instructions de test</h3>
          <div className="text-sm text-blue-700 space-y-2">
            <p>✅ <strong>Dates</strong> : Doivent utiliser FreeMono (police monospace)</p>
            <p>✅ <strong>Numéros de dossier</strong> : Doivent utiliser FreeMono</p>
            <p>✅ <strong>Codes et références</strong> : Doivent utiliser FreeMono</p>
            <p>✅ <strong>Montants</strong> : Doivent utiliser FreeMono</p>
            <p>✅ <strong>Tailles de fichier</strong> : Doivent utiliser FreeMono</p>
            <p>✅ <strong>Texte normal</strong> : Doit utiliser Outfit (police par défaut)</p>
          </div>
        </section>
      </div>
    </div>
  );
}
