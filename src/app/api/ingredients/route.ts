import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../lib/supabaseServer'; 


// fetch all ingredients
export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('ingredients')
    .select('*')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ items: data })
}


// insert ingredients + embeddings with csv
export async function POST(request: NextRequest) {
  console.log('starting embedding and saving process')
  
  const supabase = await createClient()
  
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'No file provided' })}\n\n`))
          controller.close()
          return
        }

        const text = await file.text()
        const lines = text.split('\n').filter(line => line.trim())
        
        const dataLines = lines.slice(1)
        
        let successCount = 0
        let failedCount = 0
        const errors: string[] = []

        for (let i = 0; i < dataLines.length; i++) {
          const line = dataLines[i]
          const [ingredient, description] = line.split(',').map(s => s.trim())

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: 'progress',
              current: i + 1,
              total: dataLines.length
            })}\n\n`)
          )

          if (!ingredient) {
            errors.push(`Row ${i + 2}: Missing ingredient name`)
            failedCount++
            continue
          }

          try {
            const combinedText = `${ingredient}${description ? ': ' + description : ''}`
            const embedding = await generateEmbedding(combinedText)

            const { error } = await supabase
              .from('ingredients')
              .insert({
                ingredient,
                description: description || null,
                embedding
              })

            if (error) {
              console.log('error from inserting:', error)
              throw error
            }

            successCount++
          } catch (err) {
            failedCount++
            console.error('Full error:', err)
            errors.push(`Row ${i + 2} (${ingredient}): ${err instanceof Error ? err.message : 'Unknown error'}`)
          }
        }

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({
            type: 'complete',
            results: { success: successCount, failed: failedCount, errors }
          })}\n\n`)
        )

        controller.close()
      } catch (err) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({
            type: 'error',
            message: err instanceof Error ? err.message : 'Unknown error'
          })}\n\n`)
        )
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  })
}

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text
    })
  })

  const data = await response.json()
  return data.data[0].embedding
}