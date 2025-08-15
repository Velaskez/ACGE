# 🔧 Solution - Erreur 405 lors de la Mise à Jour des Documents

## 🎯 **Problème Identifié**

Lors de la modification d'un document via la modal d'édition, une erreur `405 Method Not Allowed` se produisait.

**Symptômes :**
- Modal d'édition ouverte
- Dropdown des dossiers fonctionnel (correction précédente)
- Tentative de sauvegarde des modifications
- Erreur `405` dans la console
- Message "Erreur de connexion" affiché

**Logs d'erreur :**
```
api/documents/cmebu7e6w0001le04ylsvks77:1 Failed to load resource: the server responded with a status of 405 ()
```

## 🔍 **Diagnostic Effectué**

### **Analyse de l'API**
La route `/api/documents/[id]/route.ts` ne contenait que les méthodes :
- ✅ `GET` - Récupération d'un document
- ✅ `DELETE` - Suppression d'un document
- ❌ `PUT` - **MANQUANT** - Mise à jour d'un document

### **Test de l'API**
```bash
npx tsx scripts/test-document-update.ts
```

**Résultats :**
- ✅ Connexion base de données OK
- ✅ Document trouvé pour le test
- ✅ 2 dossiers disponibles
- ❌ Erreur 405 lors du test PUT (avant correction)

## 🛠️ **Solution Implémentée**

### **Problème Identifié**
La méthode `PUT` était manquante dans la route `/api/documents/[id]/route.ts`, ce qui causait l'erreur 405.

### **Correction Appliquée**
**Fichier :** `src/app/api/documents/[id]/route.ts`

```typescript
// PUT - Modifier un document
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('📝 Modification document - Début')
    
    const resolvedParams = await params
    const documentId = resolvedParams.id

    // Récupérer les données de la requête
    const raw = await request.text()
    let body: any = {}
    try {
      body = raw ? JSON.parse(raw) : {}
    } catch {
      return NextResponse.json({ error: 'Corps JSON invalide' }, { status: 400 })
    }

    const { title, description, isPublic, folderId } = body

    // Validation des données
    if (!title || title.trim().length === 0) {
      return NextResponse.json({ error: 'Le titre est requis' }, { status: 400 })
    }

    if (title.length > 200) {
      return NextResponse.json({ error: 'Le titre est trop long (max 200 caractères)' }, { status: 400 })
    }

    // Vérifier que le document existe
    const existingDocument = await prisma.document.findFirst({
      where: { id: documentId },
      include: {
        author: { select: { id: true, name: true } },
        folder: { select: { id: true, name: true } }
      }
    })

    if (!existingDocument) {
      return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 })
    }

    // Vérifier le dossier si spécifié
    if (folderId && folderId !== 'root') {
      const folder = await prisma.folder.findFirst({
        where: { id: folderId }
      })
      if (!folder) {
        return NextResponse.json({ error: 'Dossier spécifié non trouvé' }, { status: 400 })
      }
    }

    // Préparer les données de mise à jour
    const updateData: any = {
      title: title.trim(),
      description: description?.trim() || null,
      isPublic: Boolean(isPublic),
      updatedAt: new Date()
    }

    // Gérer le dossier
    if (folderId === 'root' || folderId === null || folderId === undefined) {
      updateData.folderId = null
    } else {
      updateData.folderId = folderId
    }

    // Mettre à jour le document
    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: updateData,
      include: {
        currentVersion: true,
        _count: { select: { versions: true } },
        author: { select: { id: true, name: true, email: true } },
        folder: { select: { id: true, name: true } }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Document modifié avec succès',
      document: updatedDocument
    })

  } catch (error) {
    console.error('❌ Erreur lors de la modification du document:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur interne du serveur',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}
```

### **Fonctionnalités Implémentées**
- ✅ **Validation des données** - Titre requis, longueur maximale
- ✅ **Vérification d'existence** - Document et dossier
- ✅ **Gestion des dossiers** - Déplacement vers dossier ou racine
- ✅ **Mise à jour complète** - Titre, description, statut public, dossier
- ✅ **Logs détaillés** - Pour le débogage
- ✅ **Gestion d'erreurs** - Réponses appropriées

## 🧪 **Tests de Validation**

### **Test API**
```bash
npx tsx scripts/test-document-update.ts
```

**Résultats après correction :**
```
📡 Status: 200
🎉 Mise à jour réussie!
📄 Nouveau titre: COBAC_Plan de travail 1-02 (modifié 14:29:14)
📁 Nouveau dossier: Test Dossier 1755243300323
🌐 Public: true
```

### **Test Interface**
1. Ouvrir un document existant
2. Cliquer sur "Modifier"
3. Changer le titre, la description, le dossier
4. Cliquer sur "Enregistrer"
5. Vérifier que les modifications sont sauvegardées

## 📋 **Scripts de Diagnostic**

### **Test de Mise à Jour**
```bash
npx tsx scripts/test-document-update.ts
```

### **Test Complet des APIs**
```
http://localhost:3000/test-all-apis.html
```

## ✅ **Résultat Attendu**

Après correction :
- ✅ **Modal d'édition fonctionnelle** - Plus d'erreur 405
- ✅ **Sauvegarde des modifications** - Titre, description, dossier
- ✅ **Déplacement de documents** - Entre dossiers et racine
- ✅ **Changement de statut** - Public/privé
- ✅ **Logs de débogage** - Pour diagnostiquer les problèmes

## 🚨 **Points d'Attention**

1. **Méthodes HTTP** : Vérifier que toutes les méthodes nécessaires sont implémentées
2. **Validation** : Toujours valider les données d'entrée
3. **Gestion d'erreurs** : Retourner des codes d'erreur appropriés
4. **Logs** : Ajouter des logs pour faciliter le débogage

## 🔄 **Prochaines Étapes**

1. **Tester la correction** en modifiant des documents via l'interface
2. **Vérifier le déplacement** de documents entre dossiers
3. **Valider la persistance** des modifications en base
4. **Tester les cas d'erreur** (données invalides, documents inexistants)

---

**Date de résolution :** 15/08/2025  
**Statut :** ✅ Résolu  
**Impact :** 🔴 Élevé (fonctionnalité critique de modification)
