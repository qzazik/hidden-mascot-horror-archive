import type { Game, GameStatus, RouletteFilters, UserGameState } from '../types';
import { allPlatforms, allStorePlatforms, developers, featuredGameSlugs, hiddenGemSlugs, rouletteModes, series } from '../data/library';

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9а-яё]+/gi, ' ')
    .trim()
    .replace(/\s+/g, ' ');

export const slugify = (value: string) =>
  normalize(value)
    .replace(/ё/g, 'е')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

export const formatMaybe = (value: string | number | null | undefined, fallback = 'Не указано') =>
  value === null || value === undefined || value === '' ? fallback : String(value);

export const formatDuration = (minutes: number | null) => {
  if (!minutes) return 'Не указано';
  if (minutes < 60) return `${minutes} мин`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest > 0 ? `${hours} ч ${rest} мин` : `${hours} ч`;
};

export const formatRating = (value: number | null) => (value === null ? 'Не указано' : value.toFixed(1));

export const statusLabel: Record<GameStatus, string> = {
  release: 'Релиз',
  demo: 'Демо',
  in_development: 'В разработке',
  cancelled: 'Отменено',
  prologue: 'Пролог',
  early_access: 'Ранний доступ',
  unknown: 'Требует проверки'
};

export const confidenceLabel: Record<'high' | 'medium' | 'low', string> = {
  high: 'Высокая',
  medium: 'Средняя',
  low: 'Низкая'
};

export const verificationLabel: Record<'verified' | 'partially_verified' | 'unverified', string> = {
  verified: 'Проверено',
  partially_verified: 'Частично проверено',
  unverified: 'Не проверено'
};

export const isHot = (game: Game) => game.tags.some((tag) => ['short', 'короткая игра', 'короткая'].includes(normalize(tag)));

export const gameMatchesQuery = (game: Game, query: string) => {
  const text = normalize(query);
  if (!text) return true;
  const seriesName = series.find((item) => item.id === game.seriesId)?.title ?? '';
  const developerName = developers.find((item) => item.id === game.developerId)?.name ?? '';
  return [
    game.title,
    game.slug,
    game.description,
    game.shortDescription,
    game.tags.join(' '),
    seriesName,
    developerName,
    game.languages.join(' '),
    game.platforms.join(' '),
    game.storePlatforms.join(' ')
  ]
    .map(normalize)
    .some((field) => field.includes(text));
};

export const getTypeLabel = (game: Game) => (game.type === 'fan_game' ? 'Фан-игра' : 'Оригинал');

export const getPriceLabel = (type: Game['priceType']) =>
  type === 'free' ? 'Бесплатно' : type === 'paid' ? 'Платно' : 'Не указано';

export const hasPlatform = (game: Game, platform: string) =>
  platform === 'all' ? true : game.platforms.some((item) => normalize(item) === normalize(platform));

export const hasStorePlatform = (game: Game, storePlatform: string) =>
  storePlatform === 'all' ? true : game.storePlatforms.some((item) => normalize(item) === normalize(storePlatform));

export const matchesDuration = (game: Game, duration: RouletteFilters['duration']) => {
  if (duration === 'any') return true;
  const minutes = game.durationMinutes;
  if (minutes === null) return false;
  if (duration === 'short') return minutes <= 30;
  if (duration === 'medium') return minutes > 30 && minutes <= 60;
  return minutes > 60;
};

export const matchesVerification = (game: Game, filter: RouletteFilters['verification']) =>
  filter === 'any' ? true : game.verificationStatus === filter;

export const getWeightedScore = (game: Game, mode: RouletteFilters['mode']) => {
  const overall = game.ratings.overall ?? 0;
  const stream = game.ratings.stream ?? 0;
  const youtube = game.ratings.youtube ?? 0;
  const shorts = game.ratings.shorts ?? 0;

  if (mode === 'stream') return stream * 1.2 + overall * 0.8;
  if (mode === 'video') return youtube * 1.3 + overall;
  if (mode === 'shorts') return shorts * 1.4 + overall * 0.6;
  if (mode === 'hiddenGem') return (game.ratings.originality ?? 0) + (game.ratings.atmosphere ?? 0) + overall * 0.8;
  if (mode === 'challenge') return (game.ratings.execution ?? 0) * 0.6 + (game.ratings.overall ?? 0) * 0.4;
  return overall + stream * 0.2 + youtube * 0.2;
};

export const modeApplies = (game: Game, mode: RouletteFilters['mode']) => {
  if (mode === 'any') return true;
  if (mode === 'fanGame') return game.type === 'fan_game';
  if (mode === 'hiddenGem') return hiddenGemSlugs.includes(game.slug);
  if (mode === 'challenge') return game.verificationStatus !== 'verified' || game.ratingConfidence !== 'high';
  if (mode === 'stream') return true;
  if (mode === 'video') return true;
  if (mode === 'shorts') return true;
  return true;
};

export const filterGames = (games: Game[], filters: RouletteFilters, states: Record<string, UserGameState> = {}) =>
  games.filter((game) => {
    const tagSet = new Set(filters.tags);
    const userState = states[game.slug] ?? {};

    if (!modeApplies(game, filters.mode)) return false;
    if (filters.type !== 'all' && game.type !== filters.type) return false;
    if (filters.priceType !== 'all' && game.priceType !== filters.priceType) return false;
    if (!hasPlatform(game, filters.platform)) return false;
    if (filters.storePlatform !== 'all' && !hasStorePlatform(game, filters.storePlatform)) return false;
    if (!matchesDuration(game, filters.duration)) return false;
    if (!matchesVerification(game, filters.verification)) return false;
    if (filters.onlyFavorites && !userState.favorite) return false;
    if (filters.onlyPlanned && !userState.planned) return false;
    if (filters.excludeCompleted && userState.completed) return false;
    if (filters.excludeStreamed && userState.streamed) return false;
    if (filters.excludeVideoReady && userState.videoReady) return false;
    if (filters.minStreamRating > 0 && (game.ratings.stream ?? 0) < filters.minStreamRating) return false;
    if (filters.minOverallRating > 0 && (game.ratings.overall ?? 0) < filters.minOverallRating) return false;
    if (tagSet.size > 0 && !filters.tags.every((tag) => game.tags.includes(tag))) return false;
    return true;
  });

export const getRandomFrom = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

export const getModeTitle = (mode: RouletteFilters['mode']) => rouletteModes.find((item) => item.id === mode)?.label ?? 'Любая игра';

export const getCatalogStats = (games: Game[]) => ({
  games: games.length,
  fanGames: games.filter((game) => game.type === 'fan_game').length,
  demos: games.filter((game) => game.status === 'demo').length,
  inDevelopment: games.filter((game) => game.status === 'in_development').length
});

export const getPrimaryPlatforms = () => allPlatforms;
export const getPrimaryStores = () => allStorePlatforms;

export const orderFeatured = (games: Game[]) => {
  const featured = featuredGameSlugs
    .map((slug) => games.find((game) => game.slug === slug))
    .filter((game): game is Game => Boolean(game));
  const rest = games.filter((game) => !featuredGameSlugs.includes(game.slug));
  return [...featured, ...rest];
};
