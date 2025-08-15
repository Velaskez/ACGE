#!/bin/bash

# Script de démarrage pour le développement local
echo "🚀 Démarrage de l'application ACGE en mode développement..."

# Configuration de la base de données SQLite
export DATABASE_URL="file:./prisma/dev.db"
export NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
export NEXTAUTH_URL="http://localhost:3000"
export NODE_ENV="development"

echo "📊 Configuration:"
echo "  - Base de données: SQLite (./prisma/dev.db)"
echo "  - Mode: Développement"
echo "  - URL: http://localhost:3000"

# Vérifier que la base de données existe
if [ ! -f "./prisma/dev.db" ]; then
    echo "🗄️ Création de la base de données..."
    npx prisma db push
fi

# Démarrer le serveur de développement
echo "🌐 Démarrage du serveur..."
npm run dev
