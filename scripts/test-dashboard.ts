export {}
/* Test des endpoints dashboard et sidebar avec cookie d'auth */

async function main() {
  const baseUrl = 'http://localhost:3000'

  const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@acge.ga', password: 'admin123' }),
  })

  const setCookie = loginResponse.headers.get('set-cookie') || ''
  const cookiePair = setCookie.split(';')[0] || ''
  console.log('Login status:', loginResponse.status, 'Cookie:', cookiePair)

  const endpoints = ['/api/dashboard/stats', '/api/dashboard/activity', '/api/sidebar/folders']

  for (const ep of endpoints) {
    const res = await fetch(`${baseUrl}${ep}`, {
      headers: cookiePair ? { Cookie: cookiePair } : {},
    })
    const text = await res.text()
    console.log(ep, '->', res.status, text.substring(0, 200))
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})


