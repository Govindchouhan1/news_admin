import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Hash, Loader2, Plus } from 'lucide-react';
import hashtagService from '../../services/hashtagService';

const HashtagInput = ({ value = [], onChange, max = 10 }) => {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const q = input.trim();
    if (!q) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await hashtagService.getAll({ search: q, limit: 8 });
        const results = (res.data.data || []).filter(
          (h) => !value.includes(h.name)
        );
        setSuggestions(results);
        setOpen(true);
        setActiveIdx(-1);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [input, value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const addTag = useCallback((name) => {
    const tag = name.trim();
    if (!tag || value.includes(tag) || value.length >= max) return;
    onChange([...value, tag]);
    setInput('');
    setSuggestions([]);
    setOpen(false);
    setActiveIdx(-1);
    inputRef.current?.focus();
  }, [value, onChange, max]);

  const removeTag = (tag) => onChange(value.filter((t) => t !== tag));

  const handleKeyDown = (e) => {
    if (open && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, -1));
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (activeIdx >= 0 && suggestions[activeIdx]) {
          addTag(suggestions[activeIdx].name);
        } else if (input.trim()) {
          addTag(input);
        }
        return;
      }
      if (e.key === 'Escape') {
        setOpen(false);
        setActiveIdx(-1);
        return;
      }
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (input.trim()) addTag(input);
    }

    if (e.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const isMax = value.length >= max;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="label mb-0">{t('news.hashtags')}</label>
        <span className={`text-xs ${isMax ? 'text-red-500' : 'text-gray-400'}`}>
          {value.length}/{max}
        </span>
      </div>

      {/* Selected tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full text-xs font-medium
                         bg-primary-50 dark:bg-primary-900/30
                         text-primary-700 dark:text-primary-400
                         border border-primary-200 dark:border-primary-800"
            >
              <Hash className="w-2.5 h-2.5" />
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-0.5 p-0.5 rounded-full hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input + dropdown */}
      <div className="relative">
        <div className={`flex items-center input-field p-0 overflow-hidden gap-1
                        ${isMax ? 'opacity-60 pointer-events-none' : ''}`}>
          <Hash className="w-4 h-4 text-gray-400 shrink-0 ml-3" />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => input.trim() && suggestions.length && setOpen(true)}
            placeholder={isMax ? `Maksimum ${max} ta` : t('news.addHashtag')}
            disabled={isMax}
            className="flex-1 bg-transparent outline-none py-2 pr-3 text-sm
                       text-gray-900 dark:text-gray-100
                       placeholder-gray-400 dark:placeholder-gray-600"
          />
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400 mr-3 shrink-0" />}
        </div>

        {/* Dropdown */}
        {open && (
          <div
            ref={dropdownRef}
            className="absolute z-50 top-full left-0 right-0 mt-1 card shadow-lg overflow-hidden animate-fade-in"
          >
            {suggestions.length > 0 ? (
              <ul>
                {suggestions.map((h, idx) => (
                  <li
                    key={h.id}
                    onMouseDown={(e) => { e.preventDefault(); addTag(h.name); }}
                    onMouseEnter={() => setActiveIdx(idx)}
                    className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer text-sm transition-colors
                      ${idx === activeIdx
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                  >
                    <Hash className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="font-medium">{h.name}</span>
                  </li>
                ))}
                {/* Add custom option */}
                {input.trim() && !suggestions.some(s => s.name.toLowerCase() === input.trim().toLowerCase()) && (
                  <li
                    onMouseDown={(e) => { e.preventDefault(); addTag(input); }}
                    className="flex items-center gap-2 px-3 py-2.5 cursor-pointer text-sm
                               text-primary-600 dark:text-primary-400
                               hover:bg-primary-50 dark:hover:bg-primary-900/30
                               border-t border-gray-100 dark:border-gray-800 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 shrink-0" />
                    <span>«<b>{input.trim()}</b>» qo'shish</span>
                  </li>
                )}
              </ul>
            ) : !loading && input.trim() ? (
              <div
                onMouseDown={(e) => { e.preventDefault(); addTag(input); }}
                className="flex items-center gap-2 px-3 py-2.5 cursor-pointer text-sm
                           text-primary-600 dark:text-primary-400
                           hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span>«<b>{input.trim()}</b>» qo'shish</span>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <p className="mt-1.5 text-xs text-gray-400">
        Type and select, or press Enter to add new
      </p>
    </div>
  );
};

export default HashtagInput;
