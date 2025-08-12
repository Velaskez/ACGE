import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

export const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)

export const supabaseServer = hasSupabase
  ? createClient(SUPABASE_URL as string, SUPABASE_SERVICE_ROLE_KEY as string, {
      auth: { persistSession: false },
    })
  : null

export type StorageUploadResult = {
  bucket: string
  path: string
  fullPath: string
}

export async function uploadToStorage(options: {
  bucket: 'documents' | 'previews'
  path: string
  fileBuffer: Buffer
  contentType?: string
}): Promise<StorageUploadResult> {
  if (!supabaseServer) {
    throw new Error('Supabase non configuré (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants)')
  }
  const { bucket, path, fileBuffer, contentType } = options
  const { error } = await supabaseServer.storage
    .from(bucket)
    .upload(path, fileBuffer, { contentType, upsert: true })
  if (error) {
    throw error
  }
  return { bucket, path, fullPath: `${bucket}/${path}` }
}

export async function downloadFromStorage(options: {
  bucket: string
  path: string
}): Promise<{ buffer: Buffer; contentType?: string }> {
  if (!supabaseServer) {
    throw new Error('Supabase non configuré')
  }
  const { bucket, path } = options
  const { data, error } = await supabaseServer.storage.from(bucket).download(path)
  if (error) throw error
  const arrayBuffer = await data.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  // contentType is not returned reliably; caller should pass known type if needed
  return { buffer }
}


