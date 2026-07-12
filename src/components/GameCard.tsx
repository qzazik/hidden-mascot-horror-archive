import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { Game } from '../types';
import {
  confidenceLabel,
  formatDuration,
  formatMaybe,
  formatRating,
  getPriceLabel,
  getTypeLabel,
  statusLabel,
  verificationLabel
} from '../utils/library';

type GameCardProps = {
  game: Game;
  action?: ReactNode;
  compact?: boolean;
};

const ratingLine = (label: string, value: number | null) => (
  <li>
    <span>{label}</span>
    <strong>{formatRating(value)}</strong>
  </li>
);

export function GameCard({ game, action, compact = false }: GameCardProps) {
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
          <span className={`badge ${game.ratingConfidence === 'high' ? 'badge--good' : ''}`}>
            {confidenceLabel[game.ratingConfidence]}
          </span>
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

        <ul className="game-card__ratings" aria-label={`Рейтинги игры ${game.title}`}>
          {ratingLine('Стрим', game.ratings.stream)}
          {ratingLine('Общий', game.ratings.overall)}
        </ul>

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

        <p className="game-card__footnote">
          Проверка: {verificationLabel[game.verificationStatus]}
        </p>
      </div>
    </article>
  );
}
