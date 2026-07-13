export type GameType = 'original' | 'fan_game';
export type GameStatus = 'release' | 'demo' | 'in_development' | 'cancelled' | 'prologue' | 'early_access' | 'unknown';
export type VerificationStatus = 'verified' | 'partially_verified' | 'unverified';
export type RatingConfidence = 'high' | 'medium' | 'low';
export type PriceType = 'free' | 'paid' | 'unknown';
export type CurationStatus = 'approved' | 'experimental' | 'pending' | 'rejected';
export type ContentCategory = 'hidden_gem' | 'fan_game' | 'experimental' | 'upcoming' | 'short_horror';
export type ArchiveStatus = 'verified' | 'partially_verified' | 'queued' | 'archived' | 'unavailable' | 'cancelled';

export type ReviewProgress = {
  storePage: boolean;
  screenshots: boolean;
  trailer: boolean;
  partialGameplay: boolean;
  fullGameplay: boolean;
  technicalState: boolean;
  streamSuitability: boolean;
};

export type RatingSet = {
  gameplay: number | null;
  atmosphere: number | null;
  horror: number | null;
  story: number | null;
  graphics: number | null;
  sound: number | null;
  polish: number | null;
  mascotDesign: number | null;
  originality: number | null;
  replayability: number | null;
  stream: number | null;
  youtube: number | null;
  shorts: number | null;
  /** @deprecated Use polish. Kept for existing data compatibility. */
  execution: number | null;
  overall: number | null;
};

export type EditorialRatingData = {
  ratings: RatingSet;
  ratingSummary: string | null;
  strengths: string[];
  weaknesses: string[];
  recommendedFor: string[];
  streamVerdict: string | null;
  verificationStatus: VerificationStatus;
  ratingConfidence: RatingConfidence;
  reviewedAt: string | null;
  archiveStatus: ArchiveStatus;
  reviewProgress: ReviewProgress;
};

export type PersonalRatingData = {
  overall: number | null;
  gameplay: number | null;
  atmosphere: number | null;
  horror: number | null;
  stream: number | null;
};

export type FeatureSet = {
  openWorld?: boolean;
  chase?: boolean;
  puzzles?: boolean;
  stealth?: boolean;
  weapon?: boolean;
  inventory?: boolean;
  multipleEnemies?: boolean;
  bosses?: boolean;
  coOp?: boolean;
  russianLanguage?: boolean;
  saves?: boolean;
  oneStream?: boolean;
};

export type Developer = {
  id: string;
  slug: string;
  name: string;
  description: string;
  links?: {
    itchIo?: string;
    gameJolt?: string;
    steam?: string;
  };
};

export type Series = {
  id: string;
  slug: string;
  title: string;
  description: string;
  sortOrder: number;
};

export type Game = {
  id: string;
  slug: string;
  title: string;
  developerId: string;
  seriesId?: string;
  type: GameType;
  fanUniverse: boolean;
  status: GameStatus;
  versionLabel?: string;
  recommendedVersion?: string;
  verificationStatus: VerificationStatus;
  ratingConfidence: RatingConfidence;
  platforms: string[];
  storePlatforms: string[];
  priceType: PriceType;
  languages: string[];
  durationMinutes: number | null;
  description: string;
  shortDescription: string;
  tags: string[];
  features: FeatureSet;
  ratings: RatingSet;
  mainImage: string | null;
  gallery: string[];
  storeUrl: string | null;
  trailerUrl: string | null;
  releaseDate: string | null;
  lastChecked: string | null;
  relatedGameIds: string[];
  similarGameIds: string[];
  notes?: string;
  ratingSummary?: string | null;
  strengths?: string[];
  weaknesses?: string[];
  recommendedFor?: string[];
  streamVerdict?: string | null;
  source?: 'excel_import' | string;
  legacyRatings?: {
    streamPotential: number | null;
    clipsPotential: number | null;
    source: 'excel_v1';
  };
  editorialRatings?: RatingSet | null;
  importedAt?: string;
  needsManualReview?: boolean;
  contentCategory?: ContentCategory;
  curationStatus?: CurationStatus;
  curationReason?: string | null;
  archiveStatus?: ArchiveStatus;
  reviewProgress?: ReviewProgress;
  genre?: string[];
  engine?: string | null;
  gameSize?: string | null;
  controllerSupport?: boolean | null;
};

export type UserGameState = {
  favorite?: boolean;
  planned?: boolean;
  completed?: boolean;
  streamed?: boolean;
  videoReady?: boolean;
  personalRating?: number | null;
  notes?: string;
  roulette?: boolean;
};

export type RouletteMode = 'any' | 'stream' | 'video' | 'shorts' | 'hiddenGem' | 'fanGame' | 'challenge';

export type RouletteFilters = {
  mode: RouletteMode;
  type: 'all' | GameType;
  priceType: 'all' | PriceType;
  platform: 'all' | string;
  storePlatform: 'all' | string;
  duration: 'any' | 'short' | 'medium' | 'long';
  verification: 'any' | 'verified' | 'partially_verified' | 'unverified';
  minStreamRating: number;
  minOverallRating: number;
  onlyFavorites: boolean;
  onlyPlanned: boolean;
  excludeCompleted: boolean;
  excludeStreamed: boolean;
  excludeVideoReady: boolean;
  tags: string[];
};
