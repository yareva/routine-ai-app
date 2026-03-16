import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('file') as File | null

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    // Create form data for NVIDIA API
    const nvidiaFormData = new FormData()
    nvidiaFormData.append('file', audioFile)
    nvidiaFormData.append('language', 'en-US')

    const response = await fetch('https://integrate.api.nvidia.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VITE_NVIDIA_API_KEY}`,
      },
      body: nvidiaFormData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('NVIDIA ASR error:', errorText)
      return NextResponse.json(
        { error: 'ASR transcription failed', details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({ transcript: data.text || data.transcript || '' })
  } catch (error) {
    console.error('ASR API error:', error)
    return NextResponse.json(
      { error: 'Failed to process audio' },
      { status: 500 }
    )
  }
}
