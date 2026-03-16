import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json()

    if (!image) {
      return NextResponse.json({ error: 'No image data provided' }, { status: 400 })
    }

    const response = await fetch('https://integrate.api.nvidia.com/v1/infer', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NVIDIA_OCR_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: [
          {
            type: 'image_url',
            url: image,
          },
        ],
        merge_levels: ['paragraph'],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('NVIDIA OCR error:', errorText)
      return NextResponse.json(
        { error: 'OCR extraction failed' },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // Extract text from OCR response
    let extractedText = ''
    if (data.data && data.data[0] && data.data[0].text_detections) {
      extractedText = data.data[0].text_detections
        .map((detection: { text_prediction?: { text?: string } }) => detection.text_prediction?.text || '')
        .filter(Boolean)
        .join(' ')
    }

    return NextResponse.json({ text: extractedText })
  } catch (error) {
    console.error('OCR API error:', error)
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    )
  }
}
