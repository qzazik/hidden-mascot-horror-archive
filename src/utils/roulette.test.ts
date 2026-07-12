import { describe, expect, it } from 'vitest';
import type { Game, RouletteFilters } from '../types';
import { buildCandidatePool, pickRandomGame } from './roulette';

const baseFilters: RouletteFilters = {
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

const makeGame = (overrides: Partial<Game>): Game =>
  ({
    id: overrides.id ?? overrides.slug ?? 'game',
    slug: overrides.slug ?? 'game',
    title: overrides.title ?? 'Game',
    developerId: 'unknown',
    seriesId: undefined,
    type: 'original',
    fanUniverse: false,
    status: 'unknown',
    versionLabel: 'Не указано',
    recommendedVersion: 'Не указано',
    verificationStatus: 'partially_verified',
    ratingConfidence: 'low',
    platforms: ['Windows'],
    storePlatforms: ['itch.io'],
    priceType: 'unknown',
    languages: ['Не указано'],
    durationMinutes: null,
    description: 'desc',
    shortDescription: 'short',
    tags: ['mascot horror'],
    features: {},
    ratings: {
      gameplay: null,
      atmosphere: null,
      horror: null,
      mascotDesign: null,
      originality: null,
      stream: null,
      youtube: null,
      shorts: null,
      execution: null,
      overall: null
    },
    mainImage: null,
    gallery: [],
    storeUrl: null,
    trailerUrl: null,
    releaseDate: null,
    lastChecked: null,
    relatedGameIds: [],
    similarGameIds: [],
    ...overrides
  }) as Game;

describe('roulette logic', () => {
  it('reduces the chance of recently selected games and keeps them out when alternatives exist', () => {
    const alpha = makeGame({ slug: 'alpha', title: 'Alpha', ratings: { ...makeGame({}).ratings, overall: 8 } });
    const beta = makeGame({ slug: 'beta', title: 'Beta', ratings: { ...makeGame({}).ratings, overall: 8 } });
    const pool = buildCandidatePool([alpha, beta], baseFilters, {});

    expect(pool).toHaveLength(2);
    const weighted = pickRandomGame([alpha, beta], baseFilters, {}, ['alpha'], () => 0.01);

    expect(weighted?.game.slug).toBe('beta');
  });

  it('filters by tags and platform before picking', () => {
    const alpha = makeGame({ slug: 'alpha', title: 'Alpha', tags: ['stealth'], platforms: ['Windows'] });
    const beta = makeGame({ slug: 'beta', title: 'Beta', tags: ['chase'], platforms: ['Android'] });
    const filters = { ...baseFilters, tags: ['stealth'], platform: 'Windows' as const };

    const pool = buildCandidatePool([alpha, beta], filters, {});
    expect(pool.map((item) => item.slug)).toEqual(['alpha']);
  });

  it('returns null when no games match', () => {
    const result = pickRandomGame([], baseFilters, {}, [], () => 0.5);
    expect(result).toBeNull();
  });
});
