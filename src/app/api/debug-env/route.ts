import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const dbUrl = process.env.DATABASE_URL
    
    return NextResponse.json({
      hasDbUrl: !!dbUrl,
      dbUrlPrefix: dbUrl ? dbUrl.substring(0, 20) + '...' : 'undefined',
      dbUrlType: dbUrl?.startsWith('postgres') ? 'PostgreSQL' : 
                 dbUrl?.startsWith('file:') ? 'SQLite' : 
                 'Unknown',
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      allEnvKeys: Object.keys(process.env).filter(key => 
        key.includes('DATABASE') || 
        key.includes('POSTGRES') || 
        key.includes('DB')
      )
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
