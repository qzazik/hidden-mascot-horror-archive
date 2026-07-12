import { useEffect, useState } from 'react';
import { readJson, writeJson } from '../utils/storage';

export function useLocalStorageState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => readJson(key, initialValue));

  useEffect(() => {
    writeJson(key, value);
  }, [key, value]);

  return [value, setValue] as const;
}
