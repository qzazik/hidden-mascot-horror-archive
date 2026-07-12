import { useMemo } from 'react';
import type { UserGameState } from '../types';
import { useLocalStorageState } from './useLocalStorage';

export type UserLibraryState = Record<string, UserGameState>;

export function useUserLibrary() {
  const [state, setState] = useLocalStorageState<UserLibraryState>('hmha:user-library', {});

  const api = useMemo(() => {
    const update = (slug: string, patch: Partial<UserGameState>) => {
      setState((current) => ({
        ...current,
        [slug]: {
          ...(current[slug] ?? {}),
          ...patch
        }
      }));
    };

    const remove = (slug: string) => {
      setState((current) => {
        const next = { ...current };
        delete next[slug];
        return next;
      });
    };

    return {
      update,
      remove
    };
  }, [setState]);

  return {
    state,
    ...api
  };
}
