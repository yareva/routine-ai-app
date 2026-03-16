'use client'

import { Mic } from 'lucide-react'

interface MicButtonProps {
  isRecording: boolean
  onClick: () => void
  disabled?: boolean
}

export function MicButton({ isRecording, onClick, disabled }: MicButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-foreground text-background flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label={isRecording ? 'Stop recording' : 'Start recording'}
    >
      {isRecording && (
        <>
          <span className="absolute inset-0 rounded-full bg-foreground animate-pulse-ring" />
          <span className="absolute inset-0 rounded-full bg-foreground animate-pulse-ring [animation-delay:0.5s]" />
        </>
      )}
      <Mic className="w-10 h-10 sm:w-12 sm:h-12 relative z-10" />
    </button>
  )
}
