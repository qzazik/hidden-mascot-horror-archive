import type { Game, RouletteFilters, UserGameState } from '../types';
import { filterGames, getWeightedScore, matchesDuration, matchesVerification, modeApplies } from './library';

export type RouletteCandidate = Game & {
  userState: UserGameState;
  weight: number;
  reasons: string[];
};

export type RouletteResult = {
  game: Game;
  selectedAt: string;
  mode: RouletteFilters['mode'];
  poolSize: number;
  appliedFilters: string[];
  weight: number;
};

export const clampWeight = (weight: number) => Math.max(0.2, Number(weight.toFixed(4)));

export const buildCandidatePool = (games: Game[], filters: RouletteFilters, states: Record<string, UserGameState>) =>
  filterGames(games, filters, states)
    .map((game) => {
      const userState = states[game.slug] ?? {};
      const baseWeight = getWeightedScore(game, filters.mode) || 1;
      const recentPenalty = userState.completed ? 0.75 : 1;
      const streamedPenalty = userState.streamed ? 0.8 : 1;
      const videoPenalty = userState.videoReady ? 0.85 : 1;
      const favoriteBoost = userState.favorite ? 1.15 : 1;
      const plannedBoost = userState.planned ? 1.08 : 1;
      const confidenceBoost = game.ratingConfidence === 'high' ? 1.05 : game.ratingConfidence === 'low' ? 0.92 : 1;

      const reasons = [
        userState.favorite ? 'в избранном' : '',
        userState.planned ? 'в плане' : '',
        userState.completed ? 'пройдено' : '',
        userState.streamed ? 'уже стримили' : '',
        userState.videoReady ? 'видео готово' : ''
      ].filter(Boolean);

      return {
        ...game,
        userState,
        weight: clampWeight(baseWeight * recentPenalty * streamedPenalty * videoPenalty * favoriteBoost * plannedBoost * confidenceBoost),
        reasons
      };
    })
    .filter((candidate) => modeApplies(candidate, filters.mode) && matchesVerification(candidate, filters.verification) && matchesDuration(candidate, filters.duration));

const recentPenaltyForIndex = (index: number) => {
  if (index === 0) return 0;
  if (index === 1) return 0.45;
  if (index === 2) return 0.6;
  if (index === 3) return 0.75;
  if (index === 4) return 0.85;
  return 0.9;
};

const pickByWeightedLottery = <T extends { weight: number }>(items: T[], rng = Math.random) => {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  if (total <= 0) return items[0] ?? null;
  let cursor = rng() * total;
  for (const item of items) {
    cursor -= item.weight;
    if (cursor <= 0) return item;
  }
  return items[items.length - 1] ?? null;
};

export const pickRandomGame = (
  games: Game[],
  filters: RouletteFilters,
  states: Record<string, UserGameState>,
  recentSlugs: string[] = [],
  rng = Math.random
) => {
  const pool = buildCandidatePool(games, filters, states);
  const weightedPool = pool.map((candidate) => {
    const recentIndex = recentSlugs.indexOf(candidate.slug);
    if (recentIndex < 0) return candidate;
    return {
      ...candidate,
      weight: clampWeight(candidate.weight * recentPenaltyForIndex(recentIndex))
    };
  });
  const eligible = weightedPool.filter((candidate) => {
    if (pool.length <= 1) return true;
    const last = recentSlugs[0];
    return !last || candidate.slug !== last;
  });
  const weighted = eligible.length > 0 ? eligible : weightedPool;
  const result = pickByWeightedLottery(weighted, rng);
  if (!result) return null;

  return {
    game: result,
    poolSize: pool.length,
    selectedWeight: result.weight,
    appliedFilters: describeAppliedFilters(filters, result.userState)
  };
};

export const describeAppliedFilters = (filters: RouletteFilters, state?: UserGameState) => {
  const labels: string[] = [];
  if (filters.mode !== 'any') labels.push(`режим: ${filters.mode}`);
  if (filters.type !== 'all') labels.push(`тип: ${filters.type}`);
  if (filters.priceType !== 'all') labels.push(`цена: ${filters.priceType}`);
  if (filters.platform !== 'all') labels.push(`платформа: ${filters.platform}`);
  if (filters.storePlatform !== 'all') labels.push(`площадка: ${filters.storePlatform}`);
  if (filters.duration !== 'any') labels.push(`длительность: ${filters.duration}`);
  if (filters.verification !== 'any') labels.push(`проверка: ${filters.verification}`);
  if (filters.minStreamRating > 0) labels.push(`стрим >= ${filters.minStreamRating}`);
  if (filters.minOverallRating > 0) labels.push(`общий >= ${filters.minOverallRating}`);
  if (filters.onlyFavorites) labels.push('только избранное');
  if (filters.onlyPlanned) labels.push('только план');
  if (filters.excludeCompleted) labels.push('исключить пройденные');
  if (filters.excludeStreamed) labels.push('исключить стримленные');
  if (filters.excludeVideoReady) labels.push('исключить готовое видео');
  if (filters.tags.length > 0) labels.push(`теги: ${filters.tags.join(', ')}`);
  if (state?.favorite) labels.push('пометка: избранное');
  if (state?.planned) labels.push('пометка: план');
  if (state?.completed) labels.push('пометка: пройдено');
  return labels;
};

export const hasEligibleGames = (games: Game[], filters: RouletteFilters, states: Record<string, UserGameState>) =>
  buildCandidatePool(games, filters, states).length > 0;

export const explainCandidate = (game: Game, filters: RouletteFilters) => {
  const reasons: string[] = [];
  if (filters.mode === 'stream') reasons.push('подходит для стрима по общему весу');
  if (filters.mode === 'video') reasons.push('подходит для видео по общему весу');
  if (filters.mode === 'shorts') reasons.push('может дать короткий яркий момент');
  if (filters.mode === 'hiddenGem') reasons.push('попадает в подборку скрытых находок');
  if (filters.mode === 'fanGame') reasons.push('это фан-игра');
  if (filters.mode === 'challenge') reasons.push('не выглядит полностью безопасной/проверенной');
  if (game.ratingConfidence === 'low') reasons.push('оценка предварительная');
  if (game.verificationStatus !== 'verified') reasons.push('полная проверка не подтверждена');
  return reasons;
};
