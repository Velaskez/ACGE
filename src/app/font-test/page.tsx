export default function FontTestPage() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-3xl font-bold">Test des polices ACGE</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Test Outfit (police par défaut)</h2>
          <p className="text-lg">Ce texte utilise Outfit par défaut</p>
          <p className="text-lg font-bold">Ce texte utilise Outfit Bold</p>
          <p className="text-lg font-semibold">Ce texte utilise Outfit SemiBold</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Test FreeMono (monospace)</h2>
          <p className="text-lg font-mono">Ce texte utilise FreeMono</p>
          <p className="text-lg font-mono font-bold">Ce texte utilise FreeMono Bold</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Test des classes spécialisées</h2>
          <p className="text-lg">
            <span>Numéro: </span>
            <span className="text-number">123456</span>
          </p>
          <p className="text-lg">
            <span>Date: </span>
            <span className="text-date">15/01/2024</span>
          </p>
          <p className="text-lg">
            <span>Montant: </span>
            <span className="text-amount">2,500.00 €</span>
          </p>
        </div>

        <div className="mt-8 p-4 bg-gray-100 rounded">
          <h3 className="text-lg font-semibold mb-2">Instructions de test</h3>
          <p className="text-sm text-gray-600">
            Si vous voyez des polices différentes ci-dessus, les polices personnalisées se chargent correctement.
            Si tous les textes ont la même apparence, il y a un problème de chargement des polices.
          </p>
        </div>
      </div>
    </div>
  );
}
