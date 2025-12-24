'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

export function Select({ value, onChange, options, placeholder, className = '' }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={selectRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 rounded-lg flex items-center justify-between transition-all"
        style={{
          background: 'rgba(40, 50, 40, 0.8)',
          border: '1px solid rgba(100, 150, 100, 0.3)',
          color: 'rgba(200, 240, 200, 0.95)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(120, 180, 120, 0.5)';
          e.currentTarget.style.backgroundColor = 'rgba(45, 55, 45, 0.9)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(100, 150, 100, 0.3)';
          e.currentTarget.style.backgroundColor = 'rgba(40, 50, 40, 0.8)';
        }}
      >
        <span className="text-left flex-1">
          {selectedOption ? selectedOption.label : placeholder || 'Select...'}
        </span>
        <ChevronDown
          size={16}
          className="transition-transform"
          style={{
            color: 'rgba(180, 220, 180, 0.9)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1 rounded-lg overflow-hidden"
            style={{
              background: 'rgba(30, 40, 30, 0.95)',
              border: '1px solid rgba(100, 150, 100, 0.3)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div
              className="max-h-60 overflow-y-auto select-dropdown-scrollbar"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(120, 200, 120, 0.3) transparent',
              }}
            >
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className="w-full px-4 py-2 text-left flex items-center gap-2 transition-all relative"
                    style={{
                      background: isSelected
                        ? 'rgba(120, 200, 120, 0.4)'
                        : 'transparent',
                      color: isSelected
                        ? 'rgba(220, 255, 220, 1)'
                        : 'rgba(200, 240, 200, 0.95)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'rgba(120, 200, 120, 0.2)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {isSelected && (
                      <Check
                        size={16}
                        style={{ color: 'rgba(220, 255, 220, 1)' }}
                      />
                    )}
                    <span className={isSelected ? 'font-semibold' : ''}>
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

