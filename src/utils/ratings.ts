import type { ArchiveStatus, Game, RatingConfidence, RatingSet, ReviewProgress, VerificationStatus } from '../types';

export type RatingKey =
  | 'gameplay' | 'atmosphere' | 'horror' | 'story' | 'graphics' | 'sound' | 'polish'
  | 'mascotDesign' | 'originality' | 'replayability' | 'stream' | 'youtube' | 'shorts';

export type RatingCriterion = { key: RatingKey; label: string; weight: number };

export const ratingGroups: Array<{ title: string; criteria: RatingCriterion[] }> = [
  {
    title: 'Качество игры',
    criteria: [
      { key: 'gameplay', label: 'Геймплей', weight: 18 },
      { key: 'atmosphere', label: 'Атмосфера', weight: 13 },
      { key: 'horror', label: 'Страшность', weight: 7 },
      { key: 'story', label: 'Сюжет', weight: 8 },
      { key: 'graphics', label: 'Графика', weight: 6 },
      { key: 'sound', label: 'Звук', weight: 5 },
      { key: 'polish', label: 'Техническое качество', weight: 11 }
    ]
  },
  {
    title: 'Дизайн',
    criteria: [
      { key: 'mascotDesign', label: 'Дизайн маскотов', weight: 9 },
      { key: 'originality', label: 'Оригинальность', weight: 12 }
    ]
  },
  {
    title: 'Для контента',
    criteria: [
      { key: 'stream', label: 'Для стрима', weight: 3 },
      { key: 'youtube', label: 'Для YouTube', weight: 3 },
      { key: 'shorts', label: 'Для Shorts', weight: 2 },
      { key: 'replayability', label: 'Реиграбельность', weight: 3 }
    ]
  }
];

export const allRatingCriteria = ratingGroups.flatMap((group) => group.criteria);

export const emptyRatingSet = (): RatingSet => ({
  gameplay: null, atmosphere: null, horror: null, story: null, graphics: null, sound: null, polish: null,
  mascotDesign: null, originality: null, replayability: null, stream: null, youtube: null, shorts: null,
  execution: null, overall: null
});

export const normalizeRatingSet = (ratings: Partial<RatingSet>): RatingSet => ({
  ...emptyRatingSet(),
  ...ratings,
  polish: ratings.polish ?? ratings.execution ?? null
});

export const calculateOverallRating = (input: Partial<RatingSet>): number | null => {
  const ratings = normalizeRatingSet(input);
  const filled = allRatingCriteria.filter(({ key }) => ratings[key] !== null);
  if (filled.length < 5) return null;
  const weighted = filled.reduce((sum, criterion) => sum + (ratings[criterion.key] ?? 0) * criterion.weight, 0);
  const totalWeight = filled.reduce((sum, criterion) => sum + criterion.weight, 0);
  return Math.round((weighted / totalWeight) * 10) / 10;
};

export const getRatingRank = (rating: number | null) => {
  if (rating === null) return 'Без рейтинга';
  if (rating >= 9.5) return 'S+';
  if (rating >= 9) return 'S';
  if (rating >= 8) return 'A';
  if (rating >= 7) return 'B';
  if (rating >= 6) return 'C';
  if (rating >= 5) return 'D';
  return 'F';
};

export const getRatingCount = (ratings: Partial<RatingSet>) => {
  const normalized = normalizeRatingSet(ratings);
  return allRatingCriteria.filter(({ key }) => normalized[key] !== null).length;
};

export const confidenceText: Record<RatingConfidence, string> = {
  high: 'Проверено', medium: 'Частично проверено', low: 'Предварительная оценка'
};

export const verificationText: Record<VerificationStatus, string> = {
  verified: 'Проверено', partially_verified: 'Частично проверено', unverified: 'Предварительно'
};

export const formatReviewDate = (value: string | null | undefined) => value
  ? new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value))
  : null;

export const archiveStatusText: Record<ArchiveStatus, { label: string; description: string }> = {
  verified: { label: 'Проверено', description: 'Игра полностью изучена и оценена.' },
  partially_verified: { label: 'Частично проверено', description: 'Просмотрены страница, материалы или часть прохождения.' },
  queued: { label: 'В очереди', description: 'Игра добавлена, но ещё не изучена.' },
  archived: { label: 'Архив', description: 'Старая, удалённая или историческая версия.' },
  unavailable: { label: 'Недоступна', description: 'Страница или сборка больше не работает.' },
  cancelled: { label: 'Отменена', description: 'Проект официально отменён.' }
};

export const deriveArchiveStatus = (game: Pick<Game, 'status' | 'verificationStatus' | 'archiveStatus'>): ArchiveStatus => {
  if (game.archiveStatus) return game.archiveStatus;
  if (game.status === 'cancelled') return 'cancelled';
  if (game.verificationStatus === 'verified') return 'verified';
  if (game.verificationStatus === 'partially_verified') return 'partially_verified';
  return 'queued';
};

export const defaultReviewProgress = (game: Pick<Game, 'storeUrl' | 'mainImage' | 'gallery' | 'trailerUrl'>): ReviewProgress => ({
  storePage: Boolean(game.storeUrl), screenshots: Boolean(game.mainImage || game.gallery.length), trailer: Boolean(game.trailerUrl),
  partialGameplay: false, fullGameplay: false, technicalState: false, streamSuitability: false
});
