import SendGrid from '@sendgrid/mail'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  if (!process.env.SENDGRID_API_KEY ||
      !process.env.SENDGRID_FROM_EMAIL ||
      !process.env.SENDGRID_TEMPLATE_ID) {
    console.error('sendgrid-api', 'SendGrid environment variables not set')
    return Response.json({ 
      error: 'SendGrid environment variables not set' },
      { status: 500 }
    )
  }
  SendGrid.setApiKey(process.env.SENDGRID_API_KEY)

  let supabase: SupabaseClient
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE) {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE)
  } else {
    return Response.json({ error: 'Supabase not initialized' }, { status: 500 })
  }

  // TODO: switch this id from hardcoded to a list of user ids from the database
  const { data, error } = await supabase.from('core_values')
                                        .select('values')
                                        .eq('user_id', 'google-oauth2|116768850045963329528')
  if (error || !data || data.length === 0) {
    console.error('supabase-api', 'Error fetching core_values', error)
    return Response.json({ error }, { status: 500 })
  }

  // TODO: switch this email from hardcoded to a list of emails from the database
  const response = await SendGrid.send({
    to: 'isaiahbmann@gmail.com',
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: 'Your InMind Rollup',
    text: 'Here\'s a reminder of your core values',
    html: 'Here\'s a reminder of your <strong>core values</strong>',
    templateId: process.env.SENDGRID_TEMPLATE_ID,
    dynamicTemplateData: {
      // TODO: pull these from Supabase:
      values: data[0].values,
    },
  })
  return Response.json(response, { status: 200 })
}
