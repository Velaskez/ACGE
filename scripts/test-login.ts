export {}
/* Test simple du login et de /api/auth/me en local */

async function main() {
  const baseUrl = 'http://localhost:3000'

  const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@acge.ga', password: 'admin123' }),
  })

  const loginText = await loginResponse.text()
  console.log('Login status:', loginResponse.status)
  console.log('Login body:', loginText)

  const setCookie = loginResponse.headers.get('set-cookie') || ''
  console.log('Set-Cookie:', setCookie)

  const cookiePair = setCookie.split(';')[0] || ''

  const meResponse = await fetch(`${baseUrl}/api/auth/me`, {
    headers: cookiePair ? { Cookie: cookiePair } : {},
  })

  const meText = await meResponse.text()
  console.log('Me status:', meResponse.status)
  console.log('Me body:', meText)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})


