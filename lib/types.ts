export type TimeOfDay = 'morning' | 'afternoon' | 'night'

export type TagType = 'urgent' | 'focus' | 'meeting' | 'break' | 'admin' | 'personal'

export interface RoutineBlock {
  time: string
  duration: string
  title: string
  note?: string
  tag: TagType
}

export interface RoutineSummary {
  tasks: number
  focus_hours: number
  free_blocks: number
}

export interface Routine {
  summary: RoutineSummary
  blocks: RoutineBlock[]
}

export interface HistoryEntry {
  id: string
  date: string
  routine: Routine
  timeOfDay: TimeOfDay
}
