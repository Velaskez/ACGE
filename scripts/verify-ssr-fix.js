#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification de la correction SSR...\n');

// Vérifier que l'ancien fichier n'existe plus
const oldFile = path.join(process.cwd(), 'src/components/documents/document-viewer.tsx');
if (fs.existsSync(oldFile)) {
  console.log('❌ L\'ancien fichier document-viewer.tsx existe encore');
  process.exit(1);
} else {
  console.log('✅ L\'ancien fichier document-viewer.tsx supprimé');
}

// Vérifier que le fichier sécurisé existe
const safeFile = path.join(process.cwd(), 'src/components/documents/document-viewer-safe.tsx');
if (fs.existsSync(safeFile)) {
  console.log('✅ Le fichier document-viewer-safe.tsx existe');
} else {
  console.log('❌ Le fichier document-viewer-safe.tsx manquant');
  process.exit(1);
}

// Vérifier l'export dans index.ts
const indexFile = path.join(process.cwd(), 'src/components/documents/index.ts');
const indexContent = fs.readFileSync(indexFile, 'utf8');

if (indexContent.includes('DocumentViewerSafe as DocumentViewer')) {
  console.log('✅ Export DocumentViewerSafe as DocumentViewer trouvé');
} else {
  console.log('❌ Export DocumentViewerSafe as DocumentViewer manquant');
  process.exit(1);
}

if (indexContent.includes("from './document-viewer'")) {
  console.log('❌ Import de l\'ancien document-viewer trouvé');
  process.exit(1);
} else {
  console.log('✅ Aucun import de l\'ancien document-viewer');
}

// Vérifier les imports dans les autres fichiers
const filesToCheck = [
  'src/components/documents/advanced-document-viewer.tsx',
  'src/components/documents/ultimate-document-viewer.tsx',
  'src/components/documents/document-preview-modal-migrated.tsx',
  'src/components/documents/unified-document-viewer.tsx'
];

let allGood = true;
filesToCheck.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    if (content.includes("from './document-viewer'")) {
      console.log(`❌ ${filePath} importe encore l'ancien document-viewer`);
      allGood = false;
    } else if (content.includes("from './index'")) {
      console.log(`✅ ${filePath} utilise l'import centralisé`);
    }
  }
});

if (allGood) {
  console.log('\n🎉 Toutes les vérifications sont passées !');
  console.log('✅ La correction SSR est en place');
  console.log('✅ Tous les imports utilisent la version sécurisée');
  console.log('✅ L\'ancien fichier problématique est supprimé');
} else {
  console.log('\n❌ Certaines vérifications ont échoué');
  process.exit(1);
}
