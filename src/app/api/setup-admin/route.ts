import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Sécurité : vérifier qu'on est en développement ou avec une clé secrète
    const { searchParams } = new URL(request.url);
    const setupKey = searchParams.get('key');
    
    if (process.env.NODE_ENV === 'production' && setupKey !== process.env.SETUP_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    console.log('🔧 Configuration Admin via API...');

    // Vérifier la connexion à la base de données
    await prisma.$connect();
    console.log('✅ Connexion à la base de données réussie');

    // Appliquer les migrations si nécessaire
    try {
      await prisma.$executeRaw`SELECT 1`;
      console.log('✅ Base de données accessible');
    } catch (error) {
      console.log('❌ Erreur base de données:', error);
      return NextResponse.json(
        { error: 'Erreur de connexion à la base de données', details: error instanceof Error ? error.message : 'Erreur inconnue' },
        { status: 500 }
      );
    }

    // Chercher l'admin existant
    const existingAdmin = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'admin@acge.ga' },
          { role: 'ADMIN' }
        ]
      }
    });

    let admin;
    let action;

    if (existingAdmin) {
      console.log('✅ Admin trouvé, mise à jour du mot de passe...');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      admin = await prisma.user.update({
        where: { id: existingAdmin.id },
        data: { 
          password: hashedPassword,
          email: 'admin@acge.ga',
          name: 'Administrateur ACGE',
          role: 'ADMIN'
        }
      });
      action = 'updated';
    } else {
      console.log('❌ Aucun admin trouvé, création...');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      admin = await prisma.user.create({
        data: {
          name: 'Administrateur ACGE',
          email: 'admin@acge.ga',
          password: hashedPassword,
          role: 'ADMIN'
        }
      });
      action = 'created';
    }

    // Test de connexion
    const isPasswordValid = await bcrypt.compare('admin123', admin.password);

    return NextResponse.json({
      success: true,
      action,
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        createdAt: admin.createdAt
      },
      passwordTest: isPasswordValid,
      credentials: {
        email: 'admin@acge.ga',
        password: 'admin123'
      }
    });

  } catch (error) {
    console.error('❌ Erreur setup admin:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la configuration',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
        code: (error as any).code || 'UNKNOWN_ERROR'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
