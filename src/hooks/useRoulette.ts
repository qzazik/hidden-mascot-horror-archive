import { useMemo } from 'react';
import { games, rouletteModes } from '../data/library';
import type { RouletteFilters } from '../types';
import { useLocalStorageState } from './useLocalStorage';
import { buildCandidatePool, hasEligibleGames, pickRandomGame } from '../utils/roulette';
import { useUserLibrary } from './useUserLibrary';

const defaultFilters: RouletteFilters = {
  mode: 'any',
  type: 'all',
  priceType: 'all',
  platform: 'all',
  storePlatform: 'all',
  duration: 'any',
  verification: 'any',
  minStreamRating: 0,
  minOverallRating: 0,
  onlyFavorites: false,
  onlyPlanned: false,
  excludeCompleted: false,
  excludeStreamed: false,
  excludeVideoReady: false,
  tags: []
};

export function useRoulette() {
  const [filters, setFilters] = useLocalStorageState<RouletteFilters>('hmha:roulette-filters', defaultFilters);
  const [history, setHistory] = useLocalStorageState<
    Array<{
      slug: string;
      title: string;
      selectedAt: string;
      mode: RouletteFilters['mode'];
      poolSize: number;
      appliedFilters: string[];
    }>
  >('hmha:roulette-history', []);
  const [lastSlug, setLastSlug] = useLocalStorageState<string | null>('hmha:roulette-last', null);
  const [muted, setMuted] = useLocalStorageState<boolean>('hmha:roulette-muted', false);
  const { state: userState, update } = useUserLibrary();

  const pool = useMemo(() => buildCandidatePool(games, filters, userState), [filters, userState]);
  const hasGames = hasEligibleGames(games, filters, userState);
  const recentSlugs = history.slice(0, 5).map((item) => item.slug);

  const spin = (rng = Math.random) => {
    const result = pickRandomGame(games, filters, userState, recentSlugs.length > 0 ? recentSlugs : lastSlug ? [lastSlug] : [], rng);
    if (!result) return null;

    setLastSlug(result.game.slug);
    setHistory((current) => [
      {
        slug: result.game.slug,
        title: result.game.title,
        selectedAt: new Date().toISOString(),
        mode: filters.mode,
        poolSize: result.poolSize,
        appliedFilters: result.appliedFilters
      },
      ...current
    ].slice(0, 10));

    return result;
  };

  const resetFilters = () => setFilters(defaultFilters);
  const clearHistory = () => setHistory([]);

  const activeModeLabel = rouletteModes.find((item) => item.id === filters.mode)?.label ?? 'Любая игра';

  return {
    filters,
    setFilters,
    history,
    clearHistory,
    muted,
    setMuted,
    spin,
    hasGames,
    pool,
    activeModeLabel,
    userState,
    updateUserState: update,
    resetFilters,
    setLastSlug
  };
}
