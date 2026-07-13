import type { PersonalRatingData } from '../types';
import { useLocalStorageState } from './useLocalStorage';

const emptyPersonalRating = (): PersonalRatingData => ({ overall: null, gameplay: null, atmosphere: null, horror: null, stream: null });

export function usePersonalRatings(slug: string) {
  const [ratings, setRatings] = useLocalStorageState<Record<string, PersonalRatingData>>('hmha:personal-ratings:v1', {});
  const value = ratings[slug] ?? emptyPersonalRating();

  const update = (key: keyof PersonalRatingData, nextValue: number | null) => {
    setRatings((current) => ({ ...current, [slug]: { ...(current[slug] ?? emptyPersonalRating()), [key]: nextValue } }));
  };

  const clear = () => setRatings((current) => {
    const next = { ...current };
    delete next[slug];
    return next;
  });

  return { value, update, clear };
}
