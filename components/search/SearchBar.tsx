'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const TYPE_ICONS: Record<string, string> = {
  AGENT: '🤖',
  WORKFLOW: '⚡',
  SWARM: '🐝',
  KNOWLEDGE_PACK: '📚',
  TEMPLATE: '📋',
  INTEGRATION: '🔌',
}

interface Suggestion {
  text: string
  url: string
  type?: string
  description?: string
  publisher?: string
}

interface SearchBarProps {
  className?: string
  size?: 'default' | 'large'
  placeholder?: string
  autoFocus?: boolean
}

export function SearchBar({
  className = '',
  size = 'default',
  placeholder = 'Search agents, workflows, swarms...',
  autoFocus = false,
}: SearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [trending, setTrending] = useState<Suggestion[]>([])
  const [categories, setCategories] = useState<Suggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Fetch suggestions as user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([])
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`)
        const data = await response.json()
        setSuggestions(data.suggestions || [])
        setCategories(data.categories || [])
      } catch (error) {
        console.error('Failed to fetch suggestions:', error)
      } finally {
        setIsLoading(false)
      }
    }

    const debounce = setTimeout(fetchSuggestions, 200)
    return () => clearTimeout(debounce)
  }, [query])

  // Fetch trending on focus (if no query)
  useEffect(() => {
    if (isOpen && !query) {
      fetch('/api/search/suggestions?q=')
        .then(r => r.json())
        .then(data => setTrending(data.trending || []))
        .catch(() => {})
    }
  }, [isOpen, query])

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/marketplace?q=${encodeURIComponent(query.trim())}`)
      setIsOpen(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = query ? suggestions : trending
    
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, items.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, -1))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      router.push(items[selectedIndex].url)
      setIsOpen(false)
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  const sizeClasses = size === 'large'
    ? 'px-6 py-4 text-lg'
    : 'px-4 py-3'

  const items = query ? suggestions : trending
  const showDropdown = isOpen && (items.length > 0 || categories.length > 0 || isLoading)

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(-1)
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className={`w-full ${sizeClasses} pl-12 pr-4 bg-[#111] border border-[#222] rounded-xl text-white placeholder-[#666] focus:outline-none focus:border-violet-500 transition-colors`}
          />
          {isLoading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <svg className="animate-spin w-5 h-5 text-[#666]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          )}
        </div>
      </form>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#111] border border-[#222] rounded-xl shadow-2xl overflow-hidden z-50">
          {/* Results */}
          {items.length > 0 && (
            <div className="py-2">
              {!query && <div className="px-4 py-2 text-xs text-[#666] uppercase">Trending</div>}
              {items.map((item, index) => (
                <Link
                  key={item.url}
                  href={item.url}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-[#1a1a1a] transition-colors ${
                    index === selectedIndex ? 'bg-[#1a1a1a]' : ''
                  }`}
                >
                  {item.type && (
                    <span className="text-xl">{TYPE_ICONS[item.type] || '📦'}</span>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">{item.text}</div>
                    {item.description && (
                      <div className="text-[#666] text-sm truncate">{item.description}</div>
                    )}
                  </div>
                  {item.publisher && (
                    <span className="text-[#555] text-sm">by {item.publisher}</span>
                  )}
                </Link>
              ))}
            </div>
          )}

          {/* Categories */}
          {categories.length > 0 && (
            <div className="border-t border-[#1a1a1a] py-2">
              <div className="px-4 py-2 text-xs text-[#666] uppercase">Categories</div>
              {categories.map((cat) => (
                <Link
                  key={cat.url}
                  href={cat.url}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-[#1a1a1a] transition-colors"
                >
                  <svg className="w-4 h-4 text-[#666]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span className="text-white">{cat.text}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Search All */}
          {query && (
            <div className="border-t border-[#1a1a1a]">
              <button
                onClick={handleSubmit}
                className="w-full px-4 py-3 text-left text-violet-400 hover:bg-[#1a1a1a] transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search all for "{query}"
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

