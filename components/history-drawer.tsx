'use client'

import { X } from 'lucide-react'
import type { HistoryEntry, Routine } from '@/lib/types'

interface HistoryDrawerProps {
  isOpen: boolean
  onClose: () => void
  history: HistoryEntry[]
  onSelect: (routine: Routine) => void
}

export function HistoryDrawer({ isOpen, onClose, history, onSelect }: HistoryDrawerProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      <div 
        className="absolute inset-0 bg-foreground/20" 
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-background shadow-lg animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-serif text-xl">history</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto h-[calc(100vh-73px)]">
          {history.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              no routines yet
            </p>
          ) : (
            <div className="space-y-3">
              {history.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => {
                    onSelect(entry.routine)
                    onClose()
                  }}
                  className="w-full text-left p-4 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  <p className="font-mono text-xs text-muted-foreground mb-2">
                    {entry.date} · {entry.timeOfDay}
                  </p>
                  <div className="space-y-1">
                    {entry.routine.blocks.slice(0, 3).map((block, index) => (
                      <p key={index} className="text-sm truncate">
                        {block.title}
                      </p>
                    ))}
                    {entry.routine.blocks.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{entry.routine.blocks.length - 3} more
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
