import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log('🔧 Force création admin...');

    // Supprimer tous les utilisateurs existants (cleanup)
    await prisma.user.deleteMany({});
    
    // Créer un nouvel admin
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const admin = await prisma.user.create({
      data: {
        name: 'Administrateur ACGE',
        email: 'admin@acge.ga',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });

    // Test de vérification
    const isPasswordValid = await bcrypt.compare('admin123', admin.password);

    return NextResponse.json({
      success: true,
      message: 'Admin créé avec force',
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        createdAt: admin.createdAt
      },
      passwordTest: isPasswordValid,
      instructions: {
        email: 'admin@acge.ga',
        password: 'admin123',
        loginUrl: '/login'
      },
      debug: {
        hasDatabase: true,
        canConnect: true,
        tablesExist: true
      }
    });

  } catch (error) {
    console.error('❌ Erreur force admin:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors de la création force admin',
        details: error.message,
        code: error.code
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
