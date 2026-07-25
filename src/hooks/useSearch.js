import { useState, useCallback, useRef } from 'react';
import { searchItems, debounce } from '../utils/helpers.js';

/**
 * useSearch — manages search query state and grouped result computation.
 * Debounces the actual search to avoid re-rendering on every keystroke.
 * Results are grouped: { exams, examTools, tools, total }.
 */
export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ exams: [], examTools: [], tools: [], total: 0 });
  const [isFocused, setIsFocused] = useState(false);

  // Debounced search
  const runSearch = useRef(
    debounce((q) => {
      setResults(searchItems(q));
    }, 150),
  ).current;

  const handleChange = useCallback(
    (value) => {
      setQuery(value);
      runSearch(value);
    },
    [runSearch],
  );

  const handleFocus = useCallback(() => setIsFocused(true), []);

  const handleBlur = useCallback(() => {
    // Slight delay so clicks on autocomplete items register first
    setTimeout(() => setIsFocused(false), 180);
  }, []);

  const clear = useCallback(() => {
    setQuery('');
    setResults({ exams: [], examTools: [], tools: [], total: 0 });
  }, []);

  const showPanel = isFocused && query.length >= 2 && results.total > 0;

  return { query, results, isFocused, showPanel, handleChange, handleFocus, handleBlur, clear };
}
