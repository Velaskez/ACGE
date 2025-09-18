export default function FontTestSimplePage() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-3xl font-bold">Test simple des polices</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Test avec style inline</h2>
          <p style={{ fontFamily: 'Outfit, Arial, sans-serif' }} className="text-lg">
            Ce texte utilise Outfit avec fallback Arial
          </p>
          <p style={{ fontFamily: 'Outfit, Arial, sans-serif', fontWeight: 'bold' }} className="text-lg">
            Ce texte utilise Outfit Bold avec fallback Arial
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Test avec classes Tailwind</h2>
          <p className="font-outfit text-lg">Ce texte utilise la classe font-outfit</p>
          <p className="font-outfit-bold text-lg">Ce texte utilise la classe font-outfit-bold</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Test FreeMono</h2>
          <p style={{ fontFamily: 'FreeMono, monospace' }} className="text-lg">
            Ce texte utilise FreeMono avec fallback monospace
          </p>
          <p className="font-mono text-lg">Ce texte utilise la classe font-mono</p>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded">
          <h3 className="text-lg font-semibold mb-2">Résultat attendu</h3>
          <p className="text-sm text-blue-700">
            Si les polices se chargent correctement, vous devriez voir des différences visuelles entre les textes ci-dessus.
            Si tous les textes ont la même apparence, les polices ne se chargent pas.
          </p>
        </div>
      </div>
    </div>
  );
}
