import { useEffect, useState } from 'react';

function readStoredValue(key, defaultValue) {
  if (typeof window === 'undefined') {
    return defaultValue;
  }

  try {
    const storedValue = window.localStorage.getItem(key);
    return storedValue ?? defaultValue;
  } catch {
    return defaultValue;
  }
}

export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => readStoredValue(key, defaultValue));

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Ignore storage failures and keep the in-memory workspace usable.
    }
  }, [key, value]);

  function clearValue(nextValue = defaultValue) {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Ignore storage failures and continue resetting in memory.
      }
    }

    setValue(nextValue);
  }

  return [value, setValue, clearValue];
}
