#!/usr/bin/env npx tsx

const APP_URL = process.env.APP_URL || 'http://localhost:3002'

async function login() {
  console.log('🔐 Login admin (local)...')
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
  console.log('✅ Login OK')
  return match[1]
}

async function call(name: string, path: string, cookie: string) {
  const res = await fetch(`${APP_URL}${path}`, { headers: { Cookie: `auth-token=${cookie}` } })
  if (res.ok) {
    console.log(`✅ ${name}: 200`)
  } else {
    console.log(`❌ ${name}: ${res.status}`)
    try { console.log(await res.text()) } catch {}
  }
}

async function main() {
  const token = await login()
  if (!token) return
  await call('Stats', '/api/dashboard/stats', token)
  await call('Sidebar Folders', '/api/sidebar/folders', token)
  await call('Notifications', '/api/notifications?unreadOnly=true&limit=1', token)
  await call('Documents', '/api/documents?sortBy=updatedAt&sortOrder=desc&page=1&limit=20', token)
}

main().catch(console.error)
