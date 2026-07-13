import { describe, expect, it } from 'vitest';
import { calculateLegacyIndex, calculateOverallRating, defaultReviewProgress, deriveArchiveStatus, emptyRatingSet, getRatingRank, normalizeRatingSet } from './ratings';

describe('ratings', () => {
  it('does not calculate an overall score with fewer than five criteria', () => {
    expect(calculateOverallRating({ gameplay: 9, atmosphere: 8, horror: 7, story: 8 })).toBeNull();
  });

  it('calculates a weighted score and ignores empty criteria', () => {
    const ratings = { ...emptyRatingSet(), gameplay: 8, atmosphere: 8, horror: 8, story: 8, originality: 8 };
    expect(calculateOverallRating(ratings)).toBe(8);
  });

  it('maps score boundaries to archive ranks', () => {
    expect(getRatingRank(9.5)).toBe('S+');
    expect(getRatingRank(9)).toBe('S');
    expect(getRatingRank(8)).toBe('A');
    expect(getRatingRank(4.9)).toBe('F');
    expect(getRatingRank(null)).toBe('Без рейтинга');
  });

  it('keeps legacy execution as a polish fallback', () => {
    expect(normalizeRatingSet({ execution: 7 }).polish).toBe(7);
  });

  it('derives archive status without inventing verification', () => {
    expect(deriveArchiveStatus({ status: 'cancelled', verificationStatus: 'unverified' })).toBe('cancelled');
    expect(deriveArchiveStatus({ status: 'unknown', verificationStatus: 'partially_verified' })).toBe('partially_verified');
    expect(deriveArchiveStatus({ status: 'unknown', verificationStatus: 'unverified' })).toBe('queued');
  });

  it('marks only locally evidenced review progress', () => {
    expect(defaultReviewProgress({ storeUrl: null, mainImage: '/cover.png', gallery: [], trailerUrl: null })).toEqual({
      storePage: false, screenshots: true, trailer: false, partialGameplay: false, fullGameplay: false, technicalState: false, streamSuitability: false
    });
  });

  it('keeps the Excel content index separate from editorial ratings', () => {
    expect(calculateLegacyIndex({ streamPotential: 9, clipsPotential: 8, source: 'excel_v1' })).toBe(8.5);
    expect(calculateLegacyIndex(undefined)).toBeNull();
  });
});
