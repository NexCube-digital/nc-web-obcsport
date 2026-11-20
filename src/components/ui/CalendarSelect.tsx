import { useEffect, useId, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

export type CalendarSelectOption = {
  value: string
  label: string
  disabled?: boolean
}

type CalendarSelectProps = {
  label: string
  value: string
  options: CalendarSelectOption[]
  onSelect: (value: string) => void
}

export default function CalendarSelect({ label, value, options, onSelect }: CalendarSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listId = useId()
  const selectedOption = options.find((option) => option.value === value)

  useEffect(() => {
    if (!isOpen) return
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setIsOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [isOpen])

  return (
    <div
      ref={rootRef}
      className="relative min-w-0"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsOpen(false)
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listId}
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-[#D8E1D2] bg-[#F7F9F4] px-3 text-left text-xs font-semibold text-[#34413A] transition-colors hover:border-[#AFC293] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F5A2A]/30"
      >
        <span className="truncate capitalize">{selectedOption?.label ?? value}</span>
        <ChevronDown size={14} className={`shrink-0 text-[#617B28] transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {isOpen && (
        <ul id={listId} role="listbox" aria-label={label} className="absolute left-0 top-full z-40 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-[#D8E1D2] bg-white p-1 shadow-[0_12px_30px_rgba(27,57,28,0.16)]">
          {options.map((option) => {
            const selected = option.value === value
            return (
              <li key={option.value} role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  disabled={option.disabled}
                  onClick={() => {
                    onSelect(option.value)
                    setIsOpen(false)
                    triggerRef.current?.focus()
                  }}
                  className={`w-full rounded-md px-2.5 py-2 text-left text-xs capitalize transition-colors disabled:cursor-not-allowed disabled:text-[#C7CCC3] ${selected ? 'bg-[#1F5A2A] font-semibold text-white' : 'text-[#34413A] hover:bg-[#F3F8E8] hover:text-[#1F5A2A]'}`}
                >
                  {option.label}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
