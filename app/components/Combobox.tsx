'use client';

import React, { useState, useRef, useEffect } from 'react';

interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
}

export default function Combobox({ value, onChange, options, placeholder = '', className = '' }: ComboboxProps) {
  const [inputValue, setInputValue] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const filtered = options.filter(opt =>
    opt.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleSelect = (opt: string) => {
    setInputValue(opt);
    onChange(opt);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex(prev => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && filtered[highlightedIndex]) {
        handleSelect(filtered[highlightedIndex]);
      } else if (inputValue.trim()) {
        onChange(inputValue.trim());
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setIsOpen(true);
          setHighlightedIndex(-1);
          onChange(e.target.value);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`w-full ${className}`}
        autoComplete="off"
      />
      {isOpen && filtered.length > 0 && inputValue !== filtered[0] && (
        <div
          ref={listRef}
          className="absolute z-50 top-full mt-1 w-full max-h-40 overflow-auto rounded-xl bg-zinc-900 border border-zinc-700 shadow-2xl shadow-black/50"
        >
          {filtered.map((opt, i) => (
            <div
              key={opt}
              onMouseDown={() => handleSelect(opt)}
              className={`px-3 py-1.5 text-sm cursor-pointer transition-colors ${
                i === highlightedIndex
                  ? 'bg-sky-500/20 text-sky-300'
                  : 'text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
