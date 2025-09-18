"use client";

export function SimpleFontTest() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Test des polices ACGE</h1>
      
      {/* Test de base avec Outfit */}
      <div className="space-y-2">
        <p className="text-lg">Texte normal avec Outfit (par défaut)</p>
        <p className="text-lg font-bold">Texte gras avec Outfit</p>
        <p className="text-lg font-outfit-medium">Texte medium avec Outfit</p>
      </div>

      {/* Test avec FreeMono */}
      <div className="space-y-2">
        <p className="text-lg font-mono">Texte avec FreeMono (monospace)</p>
        <p className="text-lg font-free-mono-bold">Texte gras avec FreeMono</p>
        <p className="text-lg text-number">Numéro: 123456</p>
        <p className="text-lg text-date">Date: 15/01/2024</p>
      </div>

      {/* Test de comparaison */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="p-4 border rounded">
          <h3 className="font-semibold mb-2">Outfit (sans-serif)</h3>
          <p className="text-sm">Interface utilisateur</p>
        </div>
        <div className="p-4 border rounded">
          <h3 className="font-semibold mb-2">FreeMono (monospace)</h3>
          <p className="text-sm font-mono">Données techniques</p>
        </div>
      </div>
    </div>
  );
}
