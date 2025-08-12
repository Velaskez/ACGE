export {}
async function main() {
  const baseUrl = 'http://localhost:3000'
  const login = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@acge.ga', password: 'admin123' })
  })
  const cookie = (login.headers.get('set-cookie') || '').split(';')[0]
  console.log('Login:', login.status, cookie)

  const res = await fetch(`${baseUrl}/api/folders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ name: `Dossier ${Date.now()}`, description: 'Test' })
  })
  const text = await res.text()
  console.log('Create folder:', res.status, text)

  const foldersRes = await fetch(`${baseUrl}/api/sidebar/folders`, { headers: { Cookie: cookie } })
  console.log('Sidebar folders:', foldersRes.status, await foldersRes.text())
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})


