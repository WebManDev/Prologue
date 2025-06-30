import { useState, useEffect } from 'react'

interface SearchBarProps {
  onSearch: (term: string) => void
  placeholder?: string
  delay?: number
  initialValue?: string
}

export default function SearchBar({ onSearch, placeholder = "Search...", delay = 300, initialValue = "" }: SearchBarProps) {
  const [inputValue, setInputValue] = useState(initialValue)

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(inputValue)
    }, delay)
    return () => clearTimeout(handler)
  }, [inputValue, delay, onSearch])

  return (
    <input
      type="text"
      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-prologue-electric/20"
      placeholder={placeholder}
      value={inputValue}
      onChange={e => setInputValue(e.target.value)}
    />
  )
} 