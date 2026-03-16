'use client'

import type { TimeOfDay } from '@/lib/types'

interface TimeToggleProps {
  value: TimeOfDay
  onChange: (value: TimeOfDay) => void
}

const options: { value: TimeOfDay; label: string }[] = [
  { value: 'morning', label: 'morning' },
  { value: 'afternoon', label: 'afternoon' },
  { value: 'night', label: 'night' },
]

export function TimeToggle({ value, onChange }: TimeToggleProps) {
  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      {options.map((option, index) => (
        <span key={option.value} className="flex items-center">
          <button
            onClick={() => onChange(option.value)}
            className={`transition-colors ${
              value === option.value
                ? 'text-foreground'
                : 'hover:text-foreground/70'
            }`}
          >
            {option.label}
          </button>
          {index < options.length - 1 && <span className="mx-1.5">·</span>}
        </span>
      ))}
    </div>
  )
}
