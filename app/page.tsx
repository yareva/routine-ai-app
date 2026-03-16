'use client'

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

import { useState, useRef, useCallback, useEffect } from 'react'
import { Camera, Check, AlertCircle, RefreshCw } from 'lucide-react'
import { MicButton } from '@/components/mic-button'
import { TimeToggle } from '@/components/time-toggle'
import { RoutineSheet } from '@/components/routine-sheet'
import { HistoryDrawer } from '@/components/history-drawer'
import type { TimeOfDay, Routine, HistoryEntry } from '@/lib/types'

export default function RoutineAI() {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning')
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [showTextInput, setShowTextInput] = useState(false)
  const [textInput, setTextInput] = useState('')
  const [scannedImage, setScannedImage] = useState<string | null>(null)
  const [scannedText, setScannedText] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [routine, setRoutine] = useState<Routine | null>(null)
  const [showRoutine, setShowRoutine] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<HistoryEntry[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    const saved = localStorage.getItem('routine-history')
    if (saved) {
      try {
        setHistory(JSON.parse(saved))
      } catch {
        // ignore
      }
    }
  }, [])

  const saveToHistory = useCallback((newRoutine: Routine) => {
    const entry: HistoryEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      routine: newRoutine,
      timeOfDay,
    }
    const updatedHistory = [entry, ...history].slice(0, 20)
    setHistory(updatedHistory)
    localStorage.setItem('routine-history', JSON.stringify(updatedHistory))
  }, [history, timeOfDay])

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = reader.result as string
      setScannedImage(base64)
      try {
        const response = await fetch('/api/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64 }),
        })
        if (!response.ok) throw new Error('OCR failed')
        const data = await response.json()
        setScannedText(data.text || '')
      } catch {
        setError('Failed to scan image. Please try again.')
        setScannedImage(null)
      }
    }
    reader.readAsDataURL(file)
  }

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop()
      setIsRecording(false)
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError('Speech recognition not supported — please type instead.')
      return
    }

    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: any) => {
      const text = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join('')
      setTranscript(text)
    }

    recognition.onerror = () => {
      setError('Microphone error. Please try again.')
      setIsRecording(false)
    }

    recognition.onend = () => setIsRecording(false)

    recognition.start()
    setIsRecording(true)
    setError(null)
  }

  const generateRoutine = async () => {
    setError(null)
    setIsLoading(true)

    let input = ''
    let mode = 'text'

    if (scannedText) {
      input = scannedText
      mode = 'scan'
    } else if (transcript) {
      input = transcript
    } else if (textInput) {
      input = textInput
    }

    if (!input) {
      setError('Please record, type, or scan something first.')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, mode, timeOfDay }),
      })
      if (!response.ok) throw new Error('Generation failed')
      const data = await response.json()
      if (data.routine) {
        setRoutine(data.routine)
        saveToHistory(data.routine)
        setShowRoutine(true)
      } else {
        throw new Error('Invalid response')
      }
    } catch {
      setError('Failed to generate routine. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const startOver = () => {
    setTranscript('')
    setTextInput('')
    setScannedImage(null)
    setScannedText(null)
    setRoutine(null)
    setShowRoutine(false)
    setError(null)
    recognitionRef.current?.stop()
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <main className="min-h-screen flex flex-col p-4 sm:p-6 max-w-lg mx-auto">
      <header className="flex items-start justify-between mb-2">
        <h1 className="font-serif text-2xl sm:text-3xl tracking-tight">routine ai</h1>
        <p className="text-sm text-muted-foreground">hey, friend</p>
      </header>

      <div className="flex justify-center mb-8">
        <TimeToggle value={timeOfDay} onChange={setTimeOfDay} />
      </div>

      <div className="flex justify-center mb-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageSelect}
          className="hidden"
          aria-label="Scan image"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className={`w-12 h-12 rounded-full border-2 border-border flex items-center justify-center transition-all ${scannedImage ? 'bg-foreground text-background' : 'hover:bg-muted'
            }`}
          aria-label={scannedImage ? 'Image scanned' : 'Scan image'}
        >
          {scannedImage ? <Check className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center relative">
        <button
          onClick={generateRoutine}
          disabled={isLoading}
          className="absolute left-0 top-1/2 -translate-y-1/2 px-3 py-6 bg-foreground text-background rounded-full text-sm tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50"
          style={{ writingMode: 'vertical-lr', transform: 'translateY(-50%) rotate(180deg)' }}
        >
          {isLoading ? 'generating...' : 'make my routine'}
        </button>

        <div className="flex flex-col items-center">
          <MicButton
            isRecording={isRecording}
            onClick={toggleRecording}
            disabled={isLoading}
          />

          {transcript && (
            <p className="mt-4 text-sm text-muted-foreground text-center max-w-xs animate-in fade-in">
              {`"${transcript}"`}
            </p>
          )}

          <button
            onClick={() => setShowTextInput(!showTextInput)}
            className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            or type
          </button>

          {showTextInput && (
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="brain dump here..."
              className="mt-4 w-full max-w-xs bg-transparent text-foreground placeholder:text-muted-foreground text-sm resize-none focus:outline-none animate-in fade-in slide-in-from-top-2"
              rows={3}
            />
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 justify-center text-sm text-destructive mb-4 animate-in fade-in">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="p-1 hover:bg-muted rounded"
            aria-label="Dismiss error"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      )}

      <footer className="flex justify-end">
        <button
          onClick={() => setShowHistory(true)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          history
        </button>
      </footer>

      <RoutineSheet
        routine={routine}
        isOpen={showRoutine}
        onClose={() => setShowRoutine(false)}
        onStartOver={startOver}
      />

      <HistoryDrawer
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        history={history}
        onSelect={(selectedRoutine) => {
          setRoutine(selectedRoutine)
          setShowRoutine(true)
        }}
      />
    </main>
  )
}