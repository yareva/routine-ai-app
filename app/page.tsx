'use client'

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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('routine-history')
    if (saved) {
      try {
        setHistory(JSON.parse(saved))
      } catch {
        // Ignore parse errors
      }
    }
  }, [])

  // Save history to localStorage
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

  // Handle image scan
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    
    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = reader.result as string
      setScannedImage(base64)
      
      // Call OCR API
      try {
        const response = await fetch('/api/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64 }),
        })
        
        if (!response.ok) {
          throw new Error('OCR failed')
        }
        
        const data = await response.json()
        setScannedText(data.text || '')
      } catch {
        setError('Failed to scan image. Please try again.')
        setScannedImage(null)
      }
    }
    reader.readAsDataURL(file)
  }

  // Handle voice recording
  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      mediaRecorderRef.current?.stop()
      setIsRecording(false)
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mediaRecorder = new MediaRecorder(stream)
        mediaRecorderRef.current = mediaRecorder
        audioChunksRef.current = []

        mediaRecorder.ondataavailable = (e) => {
          audioChunksRef.current.push(e.data)
        }

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
          stream.getTracks().forEach(track => track.stop())
          
          // Send audio file to ASR
          try {
            const formData = new FormData()
            formData.append('file', audioBlob, 'recording.webm')
            
            const response = await fetch('/api/asr', {
              method: 'POST',
              body: formData,
            })
            
            if (!response.ok) {
              throw new Error('ASR failed')
            }
            
            const data = await response.json()
            setTranscript(data.transcript || '')
          } catch {
            setError('Failed to transcribe audio. Please try again.')
          }
        }

        mediaRecorder.start()
        setIsRecording(true)
        setError(null)
      } catch {
        setError('Could not access microphone. Please check permissions.')
      }
    }
  }

  // Generate routine
  const generateRoutine = async () => {
    setError(null)
    setIsLoading(true)

    // Determine input and mode
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

      if (!response.ok) {
        throw new Error('Generation failed')
      }

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

  // Reset all state
  const startOver = () => {
    setTranscript('')
    setTextInput('')
    setScannedImage(null)
    setScannedText(null)
    setRoutine(null)
    setShowRoutine(false)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <main className="min-h-screen flex flex-col p-4 sm:p-6 max-w-lg mx-auto">
      {/* Header */}
      <header className="flex items-start justify-between mb-2">
        <h1 className="font-serif text-2xl sm:text-3xl tracking-tight">routine ai</h1>
        <p className="text-sm text-muted-foreground">hey, friend</p>
      </header>

      {/* Time Toggle */}
      <div className="flex justify-center mb-8">
        <TimeToggle value={timeOfDay} onChange={setTimeOfDay} />
      </div>

      {/* Camera Button */}
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
          className={`w-12 h-12 rounded-full border-2 border-border flex items-center justify-center transition-all ${
            scannedImage ? 'bg-foreground text-background' : 'hover:bg-muted'
          }`}
          aria-label={scannedImage ? 'Image scanned' : 'Scan image'}
        >
          {scannedImage ? (
            <Check className="w-5 h-5" />
          ) : (
            <Camera className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center relative">
        {/* Make My Routine Button - Left Side */}
        <button
          onClick={generateRoutine}
          disabled={isLoading}
          className="absolute left-0 top-1/2 -translate-y-1/2 writing-vertical-lr rotate-180 px-3 py-6 bg-foreground text-background rounded-full text-sm tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50"
          style={{ writingMode: 'vertical-lr' }}
        >
          {isLoading ? 'generating...' : 'make my routine'}
        </button>

        {/* Mic Button */}
        <div className="flex flex-col items-center">
          <MicButton
            isRecording={isRecording}
            onClick={toggleRecording}
            disabled={isLoading}
          />

          {/* Transcript Display */}
          {transcript && (
            <p className="mt-4 text-sm text-muted-foreground text-center max-w-xs animate-in fade-in">
              {`"${transcript}"`}
            </p>
          )}

          {/* Or Type Button */}
          <button
            onClick={() => setShowTextInput(!showTextInput)}
            className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            or type
          </button>

          {/* Text Input */}
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

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 justify-center text-sm text-destructive mb-4 animate-in fade-in">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="p-1 hover:bg-muted rounded"
            aria-label="Retry"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* History Link */}
      <footer className="flex justify-end">
        <button
          onClick={() => setShowHistory(true)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          history
        </button>
      </footer>

      {/* Routine Sheet */}
      <RoutineSheet
        routine={routine}
        isOpen={showRoutine}
        onClose={() => setShowRoutine(false)}
        onStartOver={startOver}
      />

      {/* History Drawer */}
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
