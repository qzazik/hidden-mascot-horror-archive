import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { Game } from '../types';
import {
  formatDuration,
  formatMaybe,
  getPriceLabel,
  getTypeLabel,
  statusLabel
} from '../utils/library';
import { calculateOverallRating, getRatingRank } from '../utils/ratings';
import { VerificationBadge } from './ratings/VerificationBadge';

type GameCardProps = {
  game: Game;
  action?: ReactNode;
  compact?: boolean;
};

const ratingLine = (label: string, value: number) => (
  <li>
    <span>{label}</span>
    <strong>{value.toFixed(1)}</strong>
  </li>
);

export function GameCard({ game, action, compact = false }: GameCardProps) {
  const overall = calculateOverallRating(game.ratings);
  const contentRatings = [
    game.ratings.stream !== null ? { label: 'Стрим', value: game.ratings.stream } : null,
    game.ratings.shorts !== null ? { label: 'Shorts', value: game.ratings.shorts } : null
  ].filter((item): item is { label: string; value: number } => Boolean(item));

  return (
    <article className={`game-card ${compact ? 'game-card--compact' : ''}`}>
      <Link to={`/games/${game.slug}`} className="game-card__media" aria-label={`Открыть страницу игры ${game.title}`}>
        {game.mainImage ? (
          <img src={game.mainImage} alt={game.title} loading="lazy" />
        ) : (
          <div className="game-card__placeholder">
            <span>{game.title}</span>
          </div>
        )}
      </Link>

      <div className="game-card__body">
        <div className="game-card__topline">
          <span className="badge">{getTypeLabel(game)}</span>
          <span className="badge badge--soft">{statusLabel[game.status]}</span>
          <VerificationBadge status={game.verificationStatus} confidence={game.ratingConfidence} unrated={overall === null} />
        </div>

        <h3>
          <Link to={`/games/${game.slug}`}>{game.title}</Link>
        </h3>
        <p className="game-card__description">{game.shortDescription}</p>

        <dl className="game-card__meta">
          <div>
            <dt>Разработчик</dt>
            <dd>{formatMaybe(null)}</dd>
          </div>
          <div>
            <dt>Платформа</dt>
            <dd>{game.platforms.join(', ') || 'Не указано'}</dd>
          </div>
          <div>
            <dt>Цена</dt>
            <dd>{getPriceLabel(game.priceType)}</dd>
          </div>
          <div>
            <dt>Длительность</dt>
            <dd>{formatDuration(game.durationMinutes)}</dd>
          </div>
        </dl>

        {overall === null ? <div className="game-card__unrated"><strong>Без оценки</strong><span>В очереди на проверку</span></div> : <div className="game-card__score"><strong>{overall.toFixed(1)}</strong><span>Ранг {getRatingRank(overall)}</span></div>}
        {contentRatings.length ? <ul className="game-card__ratings" aria-label={`Рейтинги игры ${game.title}`}>{contentRatings.map((item) => ratingLine(item.label, item.value))}</ul> : null}

        <div className="game-card__footer">
          <div className="game-card__tags">
            {game.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
          {action ?? (
            <Link to={`/games/${game.slug}`} className="button button--ghost">
              Подробнее
            </Link>
          )}
        </div>

      </div>
    </article>
  );
}
