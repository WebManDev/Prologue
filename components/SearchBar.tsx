import { useState, useEffect, useRef } from 'react'

interface SearchBarProps {
  onSearch: (term: string) => void
  placeholder?: string
  delay?: number
  initialValue?: string
}

export default function SearchBar({ onSearch, placeholder = "Search...", delay = 300, initialValue = "" }: SearchBarProps) {
  const [inputValue, setInputValue] = useState(initialValue)
  const onSearchRef = useRef(onSearch)

  // Update the ref when onSearch changes
  useEffect(() => {
    onSearchRef.current = onSearch
  }, [onSearch])

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchRef.current(inputValue)
    }, delay)
    return () => clearTimeout(handler)
  }, [inputValue, delay])

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