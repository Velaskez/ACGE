#!/usr/bin/env npx tsx

const APP_URL = 'https://acge-zeta.vercel.app'

async function login() {
  console.log('🔐 Login admin...')
  const res = await fetch(`${APP_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@acge.ga', password: 'admin123' })
  })
  if (!res.ok) {
    console.log('❌ Login failed', res.status)
    try { console.log(await res.text()) } catch {}
    return null
  }
  const setCookie = res.headers.get('set-cookie') || ''
  const match = setCookie.match(/auth-token=([^;]+)/)
  if (!match) { console.log('❌ No auth-token'); return null }
  const token = match[1]
  console.log('✅ Login OK')
  return token
}

async function upload(token: string) {
  console.log('\n⬆️ Upload test file...')
  const form = new FormData()
  const content = 'Hello from CLI upload test ' + new Date().toISOString()
  const blob = new Blob([content], { type: 'text/plain' })
  form.append('files', blob, 'test-cli.txt')
  form.append('metadata', JSON.stringify({ name: 'Test CLI', description: 'Upload depuis script' }))
  const res = await fetch(`${APP_URL}/api/upload`, {
    method: 'POST',
    headers: { Cookie: `auth-token=${token}` },
    body: form
  })
  const text = await res.text()
  if (!res.ok) { console.log('❌ Upload failed', res.status, text); return null }
  const data = JSON.parse(text)
  const file = data.files?.[0]
  if (!file) { console.log('❌ No file in response'); return null }
  console.log('✅ Upload OK:', file.id, file.version?.number, file.path)
  return { documentId: file.id, path: file.path }
}

async function download(token: string, documentId: string) {
  console.log('\n⬇️ Download uploaded file...')
  const res = await fetch(`${APP_URL}/api/documents/${documentId}/download`, {
    headers: { Cookie: `auth-token=${token}` }
  })
  if (!res.ok) { console.log('❌ Download failed', res.status); try { console.log(await res.text()) } catch {}; return false }
  const buf = Buffer.from(await res.arrayBuffer())
  console.log('✅ Download OK, size:', buf.length)
  return true
}

async function testApis(token: string) {
  console.log('\n📊 Test APIs...')
  const endpoints = [
    { name: 'Dashboard Stats', url: '/api/dashboard/stats' },
    { name: 'Dashboard Activity', url: '/api/dashboard/activity' },
    { name: 'Notifications', url: '/api/notifications' },
    { name: 'Documents', url: '/api/documents' }
  ]
  let ok = 0
  for (const e of endpoints) {
    const res = await fetch(`${APP_URL}${e.url}`, { headers: { Cookie: `auth-token=${token}` } })
    if (res.ok) { console.log('✅', e.name, 'OK'); ok++ } else { console.log('❌', e.name, res.status); try { console.log(await res.text()) } catch {} }
  }
  console.log('➡️ APIs OK:', ok, '/', endpoints.length)
}

async function main() {
  const token = await login()
  if (!token) return
  const up = await upload(token)
  if (up?.documentId) {
    await download(token, up.documentId)
  }
  await testApis(token)
}

main().catch(err => { console.error(err) })
