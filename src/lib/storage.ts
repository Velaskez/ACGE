import { existsSync } from 'fs'
import { mkdir, writeFile, readFile } from 'fs/promises'
import { join } from 'path'

function getProvider(): 'local' | 's3' {
  const p = (process.env.STORAGE_PROVIDER || 'local').toLowerCase()
  return p === 's3' ? 's3' : 'local'
}

function randomSuffix() {
  return Math.random().toString(36).substring(2, 8)
}

export async function saveUploadedFile(userId: string, file: File): Promise<{ filePath: string, mimeType: string, size: number }>
{
  const provider = getProvider()
  if (provider === 's3') {
    const bucket = process.env.AWS_S3_BUCKET
    if (!bucket || !process.env.AWS_REGION) {
      // Sécurité: fallback local si config S3 incomplète
      return saveUploadedFileLocal(userId, file)
    }
    // Lazy import pour éviter l'installation obligatoire côté dev
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
    const s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      } : undefined,
    })
    const storedName = `${Date.now()}-${randomSuffix()}-${file.name}`
    const key = `${userId}/${storedName}`
    const bytes = await file.arrayBuffer()
    await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: Buffer.from(bytes),
      ContentType: file.type || 'application/octet-stream',
    }))
    return { filePath: `s3://${bucket}/${key}`, mimeType: file.type, size: file.size }
  }
  return saveUploadedFileLocal(userId, file)
}

async function saveUploadedFileLocal(userId: string, file: File) {
  const baseDir = join(process.cwd(), 'uploads')
  const storedName = `${Date.now()}-${randomSuffix()}-${file.name}`
  const userDir = join(baseDir, userId)
  if (!existsSync(userDir)) {
    await mkdir(userDir, { recursive: true })
  }
  const fullPath = join(userDir, storedName)
  const bytes = await file.arrayBuffer()
  await writeFile(fullPath, Buffer.from(bytes))
  return { filePath: `/uploads/${userId}/${storedName}`, mimeType: file.type, size: file.size }
}

export async function readStoredFile(userId: string, filePath: string): Promise<{ body: any, contentType: string, contentLength?: number }>
{
  if (filePath.startsWith('s3://')) {
    const match = filePath.match(/^s3:\/\/([^\/]+)\/(.+)$/)
    if (!match) {
      throw new Error('Chemin S3 invalide')
    }
    const [, bucket, key] = match
    // Lazy import
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3')
    const s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      } : undefined,
    })
    const res = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }))
    return { body: res.Body, contentType: res.ContentType || 'application/octet-stream', contentLength: Number(res.ContentLength || 0) }
  }
  // Local
  // filePath format: /uploads/<userId>/<filename>
  const parts = filePath.split('/').filter(Boolean)
  // parts = ['uploads', userId, filename]
  const filename = parts.slice(2).join('/')
  const baseDir = join(process.cwd(), 'uploads')
  const fullPath = join(baseDir, userId, filename)
  const buffer = await readFile(fullPath)
  return { body: buffer, contentType: 'application/octet-stream', contentLength: buffer.length }
}


