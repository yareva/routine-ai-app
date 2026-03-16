import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { audio } = await request.json()

    if (!audio) {
      return NextResponse.json({ error: 'No audio data provided' }, { status: 400 })
    }

    const response = await fetch('https://integrate.api.nvidia.com/v1/asr', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VITE_NVIDIA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio: audio,
        config: {
          language_code: 'en-US',
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('NVIDIA ASR error:', errorText)
      return NextResponse.json(
        { error: 'ASR transcription failed' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({ transcript: data.transcript || data.text || '' })
  } catch (error) {
    console.error('ASR API error:', error)
    return NextResponse.json(
      { error: 'Failed to process audio' },
      { status: 500 }
    )
  }
}
