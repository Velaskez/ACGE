import { NextRequest, NextResponse } from 'next/server'
import { Database } from 'sqlite3'
import { promisify } from 'util'
import path from 'path'

// Configuration SQLite simple
const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')

function getDb() {
  const Database = require('sqlite3').Database
  return new Database(dbPath)
}

export async function POST(request: NextRequest) {
  try {
    console.log('📁 Création dossier simple - Début')
    
    const body = await request.json()
    const { name, description } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Le nom du dossier est requis' }, { status: 400 })
    }

    const db = getDb()
    const run = promisify(db.run.bind(db))
    const get = promisify(db.get.bind(db))

    // Vérifier si le dossier existe déjà
    const existing = await get('SELECT id FROM folders WHERE name = ?', [name.trim()])
    
    if (existing) {
      return NextResponse.json({ error: 'Un dossier portant ce nom existe déjà' }, { status: 409 })
    }

    // Créer le dossier
    const result = await run(
      'INSERT INTO folders (id, name, description, authorId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
      [
        'folder_' + Date.now(),
        name.trim(),
        description?.trim() || null,
        'admin_user',
        new Date().toISOString(),
        new Date().toISOString()
      ]
    )

    const newFolder = await get('SELECT * FROM folders WHERE id = ?', [result.lastID])

    db.close()

    console.log('✅ Dossier créé:', newFolder.name)
    
    return NextResponse.json({ folder: newFolder }, { status: 201 })

  } catch (error) {
    console.error('Erreur lors de la création du dossier:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📁 Récupération dossiers simples - Début')
    
    const db = getDb()
    const all = promisify(db.all.bind(db))

    const folders = await all('SELECT * FROM folders ORDER BY name ASC')
    
    db.close()

    console.log(`📁 ${folders.length} dossiers trouvés`)
    
    return NextResponse.json({ folders })

  } catch (error) {
    console.error('Erreur API dossiers:', error)
    return NextResponse.json({
      folders: [],
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}
