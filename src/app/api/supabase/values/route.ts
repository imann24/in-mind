import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { getSession, type Session } from '@auth0/nextjs-auth0'
import { CoreValues } from '@/types'

export const dynamic = 'force-dynamic'

let supabase: SupabaseClient
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE) {
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE)
} else {
  console.warn('supabase-api', 'SUPABASE_URL or SUPABASE_SERVICE_ROLE not set. skipping initialization.')
}

async function checkSession(req: Request): Promise<{
  errorResponse: Response | null,
  session: Session | null,
}> {
  if (!supabase) {
    return {
      errorResponse: Response.json({ error: 'Supabase not initialized' }, { status: 500 }),
      session: null,
    }
  }
  const session = await getSession()
  if (!session) {
    return {
      errorResponse: Response.json({ error: 'Unauthorized' }, { status: 401 }),
      session: null,
    }
  }
  return {
    errorResponse: null,
    session,
  }
}

export async function GET(req: Request) {
  const { errorResponse, session } = await checkSession(req)
  if (errorResponse) {
    return errorResponse
  }

  const { data, error } = await supabase.from('core_values')
                                        .select('values')
                                        .eq('user_id', session?.user.sub)
  if (error) {
    console.error('supabase-api', 'Error fetching core_values', error)
    return Response.json({ error }, { status: 500 })
  }
  return Response.json(data && data.length > 0 ? data[0] : { values: [] }, { status: 200 })
}

export async function POST(req: Request) {
  const { errorResponse, session } = await checkSession(req)
  if (errorResponse) {
    return errorResponse
  }
  const body: CoreValues = await req.json()
  const { data, error: idError } = await supabase.from('core_values')
                                                 .select('id')
                                                 .eq('user_id', session?.user.sub)
  if (idError) {
    console.error('supabase-api', 'Error fetching core_values', idError)
    return Response.json({ error: idError }, { status: 500 })
  }
  const { error } = await supabase.from('core_values').upsert({
    id: data && data.length > 0 ? data[0].id : undefined,
    user_id: session?.user.sub,
    values: body.values
  })
  if (error) {
    console.error('supabase-api', 'Error upserting core_values', error)
    return Response.json({ error }, { status: 500 })
  }
  return new Response(null, { status: 200 })
}
