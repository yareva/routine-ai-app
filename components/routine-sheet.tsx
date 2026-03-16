'use client'

import { X, Clock, Target, Coffee } from 'lucide-react'
import type { Routine, TagType } from '@/lib/types'

interface RoutineSheetProps {
  routine: Routine | null
  isOpen: boolean
  onClose: () => void
  onStartOver: () => void
}

const tagColors: Record<TagType, string> = {
  urgent: 'bg-tag-urgent text-white',
  focus: 'bg-tag-focus text-white',
  meeting: 'bg-tag-meeting text-white',
  break: 'bg-tag-break text-white',
  admin: 'bg-tag-admin text-white',
  personal: 'bg-tag-personal text-white',
}

export function RoutineSheet({ routine, isOpen, onClose, onStartOver }: RoutineSheetProps) {
  if (!isOpen || !routine) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div 
        className="absolute inset-0 bg-foreground/20" 
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-lg max-h-[90vh] bg-background rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-serif text-xl">your routine</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="p-3 bg-muted rounded-lg text-center">
              <Target className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-2xl font-mono">{routine.summary.tasks}</p>
              <p className="text-xs text-muted-foreground">tasks</p>
            </div>
            <div className="p-3 bg-muted rounded-lg text-center">
              <Clock className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-2xl font-mono">{routine.summary.focus_hours}</p>
              <p className="text-xs text-muted-foreground">focus hrs</p>
            </div>
            <div className="p-3 bg-muted rounded-lg text-center">
              <Coffee className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-2xl font-mono">{routine.summary.free_blocks}</p>
              <p className="text-xs text-muted-foreground">breaks</p>
            </div>
          </div>

          {/* Time Blocks */}
          <div className="space-y-3">
            {routine.blocks.map((block, index) => (
              <div
                key={index}
                className="p-4 border border-border rounded-lg animate-in fade-in slide-in-from-bottom-2"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm text-muted-foreground">
                        {block.time}
                      </span>
                      <span className="text-muted-foreground">·</span>
                      <span className="font-mono text-sm text-muted-foreground">
                        {block.duration}
                      </span>
                    </div>
                    <h3 className="font-medium text-foreground truncate">{block.title}</h3>
                    {block.note && (
                      <p className="text-sm text-muted-foreground mt-1">{block.note}</p>
                    )}
                  </div>
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full shrink-0 ${tagColors[block.tag]}`}
                  >
                    {block.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-border">
          <button
            onClick={onStartOver}
            className="w-full py-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            start over
          </button>
        </div>
      </div>
    </div>
  )
}
