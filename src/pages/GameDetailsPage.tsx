import { Link, Navigate, useParams } from 'react-router-dom';
import type { EditorialRatingData, Game } from '../types';
import { developers, games, series } from '../data/library';
import { useUserLibrary } from '../hooks/useUserLibrary';
import { useLocalStorageState } from '../hooks/useLocalStorage';
import { GameHero } from '../components/game/GameHero';
import { OverallRating } from '../components/ratings/OverallRating';
import { RatingBreakdown } from '../components/ratings/RatingBreakdown';
import { GameInfo } from '../components/game/GameInfo';
import { GameVerdict } from '../components/game/GameVerdict';
import { GameFeatures } from '../components/game/GameFeatures';
import { GameGallery } from '../components/game/GameGallery';
import { RelatedVersions } from '../components/game/RelatedVersions';
import { SimilarGames } from '../components/game/SimilarGames';
import { PersonalRating } from '../components/ratings/PersonalRating';

export const editorialStorageKey = 'hmha:editorial-ratings:v1';

const embedTrailer = (url: string) => {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`;
    if (parsed.hostname.includes('youtube.com')) return `https://www.youtube.com/embed/${parsed.searchParams.get('v')}`;
    return url;
  } catch { return url; }
};

export function GameDetailsPage() {
  const { slug } = useParams();
  const baseGame = games.find((item) => item.slug === slug);
  const { state, update } = useUserLibrary();
  const [localRatings] = useLocalStorageState<Record<string, EditorialRatingData>>(editorialStorageKey, {});
  if (!baseGame) return <Navigate to="/games" replace />;

  const override = localRatings[baseGame.slug];
  const game: Game = override ? { ...baseGame, ratings: override.ratings, ratingSummary: override.ratingSummary, strengths: override.strengths, weaknesses: override.weaknesses, recommendedFor: override.recommendedFor, streamVerdict: override.streamVerdict, verificationStatus: override.verificationStatus, ratingConfidence: override.ratingConfidence, lastChecked: override.reviewedAt } : baseGame;
  const developer = developers.find((item) => item.id === game.developerId);
  const seriesInfo = series.find((item) => item.id === game.seriesId);
  const userState = state[game.slug] ?? {};
  const toggle = (key: 'favorite' | 'planned' | 'roulette') => update(game.slug, { [key]: !userState[key] });
  const gallery = [...(game.mainImage ? [game.mainImage] : []), ...game.gallery];

  return <div className="container game-details">
    <GameHero game={game} developerName={developer?.name ?? 'Не указано'} seriesName={seriesInfo?.title} userState={userState} onToggle={toggle} />
    <div className="game-details__rating-layout">
      <OverallRating ratings={game.ratings} verificationStatus={game.verificationStatus} ratingConfidence={game.ratingConfidence} reviewedAt={game.lastChecked} />
      <GameInfo game={game} developerName={developer?.name ?? 'Не указано'} seriesName={seriesInfo?.title} />
    </div>
    {game.slug === 'silent-mansion' && !override ? <aside className="game-review-notice panel"><div><strong>Игра ещё не получила редакционную оценку</strong><span>Статус: частично проверено · требуется просмотр геймплея</span></div><Link className="button button--primary" to="/admin/ratings?game=silent-mansion">Оценить игру</Link></aside> : null}
    <RatingBreakdown ratings={game.ratings} />
    <GameVerdict game={game} />
    <div className="game-details__content-layout"><GameFeatures features={game.features} tags={game.tags} /><PersonalRating slug={game.slug} /></div>
    <GameGallery images={gallery} title={game.title} />
    {game.trailerUrl ? <section className="game-trailer panel"><div className="section-title"><h2>Трейлер</h2></div><div className="game-trailer__frame"><iframe src={embedTrailer(game.trailerUrl)} title={`Трейлер ${game.title}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div></section> : null}
    <RelatedVersions game={game} games={games} />
    <SimilarGames game={game} games={games} />
  </div>;
}
