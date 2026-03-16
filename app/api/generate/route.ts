import { NextRequest, NextResponse } from 'next/server'

const BRAIN_DUMP_PROMPT = `You are a calm, no-nonsense personal scheduler. Return ONLY raw JSON, no markdown. Shape: {"summary":{"tasks":NUMBER,"focus_hours":NUMBER,"free_blocks":NUMBER},"blocks":[{"time":"9:00 AM","duration":"30 min","title":"Short title","note":"optional tip","tag":"focus|admin|break|personal|meeting|urgent"}]}. 6-10 blocks, always include a break and a meal.`

const SCAN_MODE_PROMPT = `You are a routine expert. The user scanned some items. Build a practical ordered routine for the selected time of day from the label text — could be skincare, supplements, meal prep, workout, cleaning, anything. Return ONLY raw JSON, same shape: {"summary":{"tasks":NUMBER,"focus_hours":NUMBER,"free_blocks":NUMBER},"blocks":[{"time":"Step 1","duration":"2 min","title":"Short title","note":"optional tip","tag":"focus|admin|break|personal|meeting|urgent"}]}. steps instead of times. Flag conflicts in notes.`

export async function POST(request: NextRequest) {
  try {
    const { input, mode, timeOfDay } = await request.json()

    const apiKey = process.env.NVIDIA_API_KEY
    console.log('[v0] NVIDIA_API_KEY exists:', !!apiKey, 'length:', apiKey?.length || 0)

    if (!input) {
      return NextResponse.json({ error: 'No input provided' }, { status: 400 })
    }
    
    if (!apiKey) {
      return NextResponse.json({ error: 'NVIDIA API key not configured' }, { status: 500 })
    }

    const systemPrompt = mode === 'scan' ? SCAN_MODE_PROMPT : BRAIN_DUMP_PROMPT
    const userMessage = mode === 'scan' 
      ? `Time of day: ${timeOfDay}. Scanned items: ${input}`
      : `Time of day: ${timeOfDay}. Brain dump: ${input}`

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'nvidia/llama-3.1-nemotron-ultra-253b-v1',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('NVIDIA Nemotron error:', errorText)
      return NextResponse.json(
        { error: 'Failed to generate routine' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''

    // Parse JSON from response
    try {
      // Try to extract JSON from the response (in case there's any extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const routine = JSON.parse(jsonMatch[0])
        return NextResponse.json({ routine })
      }
      return NextResponse.json({ error: 'Invalid response format' }, { status: 500 })
    } catch {
      console.error('Failed to parse routine JSON:', content)
      return NextResponse.json({ error: 'Failed to parse routine' }, { status: 500 })
    }
  } catch (error) {
    console.error('Generate API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate routine' },
      { status: 500 }
    )
  }
}
