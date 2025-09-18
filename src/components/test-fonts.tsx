"use client";

export function TestFonts() {
  return (
    <div className="p-8 space-y-6 bg-white dark:bg-gray-900">
      <h1 className="text-3xl font-bold text-center mb-8">Test des polices ACGE</h1>
      
      {/* Test Outfit - Police par défaut */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-blue-600">Police Outfit (par défaut)</h2>
        <div className="space-y-2">
          <p className="font-outfit-light text-lg">Outfit Light (300) - Texte léger</p>
          <p className="font-outfit-regular text-lg">Outfit Regular (400) - Texte normal</p>
          <p className="font-outfit-medium text-lg">Outfit Medium (500) - Texte medium</p>
          <p className="font-outfit-semibold text-lg">Outfit SemiBold (600) - Texte semi-gras</p>
          <p className="font-outfit-bold text-lg">Outfit Bold (700) - Texte gras</p>
          <p className="font-outfit-extrabold text-lg">Outfit ExtraBold (800) - Texte extra-gras</p>
          <p className="font-outfit-black text-lg">Outfit Black (900) - Texte noir</p>
        </div>
      </section>

      {/* Test FreeMono - Police monospace */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-green-600">Police FreeMono (monospace)</h2>
        <div className="space-y-2">
          <p className="font-free-mono-regular text-lg">FreeMono Regular (400) - Code normal</p>
          <p className="font-free-mono-bold text-lg">FreeMono Bold (700) - Code gras</p>
          <p className="font-free-mono-italic text-lg">FreeMono Italic (400) - Code italique</p>
          <p className="font-free-mono-bold-italic text-lg">FreeMono Bold Italic (700) - Code gras italique</p>
        </div>
      </section>

      {/* Test classes spécialisées */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-purple-600">Classes spécialisées</h2>
        <div className="space-y-2">
          <p className="text-lg">
            <span className="font-outfit-medium">Numéro de dossier : </span>
            <span className="text-reference">DOS-2024-001</span>
          </p>
          <p className="text-lg">
            <span className="font-outfit-medium">Date de création : </span>
            <span className="text-date">15/01/2024</span>
          </p>
          <p className="text-lg">
            <span className="font-outfit-medium">Code de référence : </span>
            <span className="text-code">REF-ABC-123</span>
          </p>
          <p className="text-lg">
            <span className="font-outfit-medium">Montant : </span>
            <span className="text-amount">2,500.00 €</span>
          </p>
          <p className="text-lg">
            <span className="font-outfit-medium">Identifiant : </span>
            <span className="text-id">#ID-12345</span>
          </p>
        </div>
      </section>

      {/* Test comparaison */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-orange-600">Comparaison des polices</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded">
            <h3 className="font-outfit-semibold mb-2">Avec Outfit (par défaut)</h3>
            <p className="text-base">Ce texte utilise la police Outfit par défaut. Il est optimisé pour la lisibilité et l'interface utilisateur.</p>
          </div>
          <div className="p-4 border rounded">
            <h3 className="font-outfit-semibold mb-2">Avec FreeMono</h3>
            <p className="font-free-mono text-base">Ce texte utilise la police FreeMono. Il est idéal pour les codes, numéros et données techniques.</p>
          </div>
        </div>
      </section>

      {/* Test responsive */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-red-600">Test responsive</h2>
        <div className="space-y-2">
          <p className="text-sm font-outfit-regular">Texte petit (sm) - Outfit Regular</p>
          <p className="text-base font-outfit-medium">Texte normal (base) - Outfit Medium</p>
          <p className="text-lg font-outfit-semibold">Texte large (lg) - Outfit SemiBold</p>
          <p className="text-xl font-outfit-bold">Texte extra-large (xl) - Outfit Bold</p>
          <p className="text-2xl font-outfit-extrabold">Texte très large (2xl) - Outfit ExtraBold</p>
        </div>
      </section>
    </div>
  );
}
