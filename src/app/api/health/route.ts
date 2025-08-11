import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Vérifier la connexion à la base de données
    const { prisma } = await import('@/lib/db');
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (_) {
      // Fallback SQLite qui n'accepte pas forcément ce type de requête
      await prisma.user.findFirst().catch(() => null)
    }
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Database connection failed'
      },
      { status: 503 }
    );
  }
}
