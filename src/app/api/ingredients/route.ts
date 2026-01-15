import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../lib/supabaseServer'; 
import Papa from "papaparse";

interface IngredientRow {
  ingredient: string
  description: string
  expire_pantry_days: string
  expire_fridge_days: string
  expire_freezer_days: string
  // Add other properties as needed
}

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

        const csvText = await file.text();
        const result = Papa.parse<IngredientRow>(csvText, {
          header: true,
          skipEmptyLines: true,
        });
        
        let successCount = 0
        let failedCount = 0
        let progress = 0
        const errors: string[] = []

        for (const row of result.data) {
          progress++

          const ingredient = row.ingredient
          const description = row.description
          const pantryDays =
            row.expire_pantry_days === "" ? null : Number(row.expire_pantry_days);
        
          const fridgeDays =
            row.expire_fridge_days === "" ? null : Number(row.expire_fridge_days);
        
          const freezerDays =
            row.expire_freezer_days === "" ? null : Number(row.expire_freezer_days);

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: 'progress',
              current: progress,
              total: result.data.length
            })}\n\n`)
          )


          if (!ingredient) {
            errors.push(`Row ${progress + 1}: Missing ingredient name`)
            failedCount++
            progress++
            continue
          }

          if ((pantryDays !== null && isNaN(pantryDays)) || 
              (fridgeDays !== null && isNaN(fridgeDays)) || 
              (freezerDays !== null && isNaN(freezerDays))) {
            errors.push(`Row ${progress + 1} (${ingredient}): Invalid number in expiration days`)
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
                pantry_expire: pantryDays,
                fridge_expire: fridgeDays,
                freezer_expire: freezerDays,
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
            errors.push(`Row ${progress + 1} (${ingredient}): ${err instanceof Error ? err.message : 'Unknown error'}`)
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