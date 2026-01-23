import { serve } from 'https://deno.land/x/sift/mod.ts'

const session = new Supabase.ai.Session('gte-small')

serve(
  async (req) => {
    const { input } = await req.json()

    if (!input || typeof input !== 'string') {
      return new Response('Invalid input', { status: 400 })
    }

    const cleanInput = input.slice(0, 2000)

    const embedding = await session.run(cleanInput, {
      mean_pool: true,
      normalize: true,
    })

    return new Response(JSON.stringify({ embedding }), {
      headers: { 'Content-Type': 'application/json', Connection: 'keep-alive' },
    })
  },
  { verifyJwt: false }, // this disables JWT checks
)
