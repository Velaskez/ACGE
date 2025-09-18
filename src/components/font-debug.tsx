"use client";

export function FontDebug() {
  return (
    <div className="p-8 space-y-4 bg-white">
      <h1 className="text-3xl font-bold text-center mb-8">Debug des polices</h1>
      
      {/* Test avec style inline pour forcer la police */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Test Outfit avec style inline</h2>
          <p style={{ fontFamily: 'Outfit, sans-serif' }} className="text-lg">
            Ce texte utilise Outfit avec style inline
          </p>
          <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }} className="text-lg">
            Ce texte utilise Outfit Bold avec style inline
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Test FreeMono avec style inline</h2>
          <p style={{ fontFamily: 'FreeMono, monospace' }} className="text-lg">
            Ce texte utilise FreeMono avec style inline
          </p>
          <p style={{ fontFamily: 'FreeMono, monospace', fontWeight: 700 }} className="text-lg">
            Ce texte utilise FreeMono Bold avec style inline
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Test avec classes Tailwind</h2>
          <p className="font-outfit text-lg">Ce texte utilise la classe font-outfit</p>
          <p className="font-outfit-bold text-lg">Ce texte utilise la classe font-outfit-bold</p>
          <p className="font-mono text-lg">Ce texte utilise la classe font-mono</p>
          <p className="font-free-mono-bold text-lg">Ce texte utilise la classe font-free-mono-bold</p>
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

        {/* Test de détection de police */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Test de détection de police</h2>
          <div className="text-sm text-gray-600">
            <p>Si vous voyez des polices différentes ci-dessus, les polices personnalisées se chargent correctement.</p>
            <p>Si tous les textes ont la même apparence, il y a un problème de chargement des polices.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
