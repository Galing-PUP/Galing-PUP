const session = new Supabase.ai.Session('gte-small')

Deno.serve(async (req) => {
  const { input } = await req.json()

  if (!input || typeof input !== 'string') {
    return new Response('Invalid input', { status: 400 })
  }

  const embedding = await session.run(input, {
    mean_pool: true,
    normalize: true,
  })

  return new Response(
    JSON.stringify({ embedding }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Connection': 'keep-alive',
      }
    }
  )
})

