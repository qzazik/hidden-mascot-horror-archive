import { Link } from 'react-router-dom';
import type { Game, UserGameState } from '../../types';
import { statusLabel } from '../../utils/library';
import { archiveStatusText, calculateOverallRating, deriveArchiveStatus, getRatingRank } from '../../utils/ratings';

type Props = {
  game: Game;
  developerName: string;
  seriesName?: string | null;
  userState: UserGameState;
  onToggle: (key: 'favorite' | 'planned' | 'roulette') => void;
};

export function GameHero({ game, developerName, seriesName, userState, onToggle }: Props) {
  const heroImage = game.gallery.find((image) => /\/hero\//.test(image)) ?? game.mainImage;
  const overall = calculateOverallRating(game.ratings);
  const archiveStatus = deriveArchiveStatus(game);
  const genres = game.genre?.length ? game.genre : game.tags.slice(0, 3);
  return <section className="game-hero panel">
    {heroImage ? <div className="game-hero__backdrop" style={{ backgroundImage: `url(${heroImage})` }} aria-hidden="true" /> : null}
    <div className="game-hero__shade" aria-hidden="true" />
    <div className="game-hero__content">
      <div className="game-hero__cover">{game.mainImage ? <img src={game.mainImage} alt={`Обложка ${game.title}`} /> : <div className="game-hero__placeholder">{game.title}</div>}</div>
      <div className="game-hero__copy">
        <div className="game-hero__badges"><span className="badge badge--accent">{game.type === 'fan_game' ? 'Фан-игра' : 'Оригинал'}</span><span className="badge">{statusLabel[game.status]}</span><span className={`archive-badge archive-badge--${archiveStatus}`}>{archiveStatusText[archiveStatus].label}</span>{game.platforms.map((platform) => <span className="badge badge--soft" key={platform}>{platform}</span>)}</div>
        <h1>{game.title}</h1>
        <p className="game-hero__byline">{developerName === 'Не указано' ? 'Разработчик не подтверждён' : developerName}{seriesName ? ` · ${seriesName}` : ''}</p>
        <p className="game-hero__lead">{game.shortDescription || game.description}</p>
        <div className="game-hero__summary">
          <div className={`game-score-tile ${overall === null ? 'game-score-tile--empty' : overall >= 8 ? 'game-score-tile--high' : overall >= 6 ? 'game-score-tile--medium' : 'game-score-tile--low'}`}><strong>{overall === null ? '—' : overall.toFixed(1)}</strong><span>{overall === null ? 'Без оценки' : `Ранг ${getRatingRank(overall)}`}</span></div>
          <div><strong>{overall === null ? 'Игра ещё не получила редакционную оценку' : 'Оценка архива'}</strong><span>{overall === null ? 'Добавлена в очередь · требуется просмотр полного геймплея' : archiveStatusText[archiveStatus].description}</span></div>
        </div>
        <div className="game-hero__genres">{genres.map((genre) => <span key={genre}>{genre}</span>)}</div>
        <div className="game-hero__actions">
          {game.storeUrl ? <a className="button button--primary" href={game.storeUrl} target="_blank" rel="noreferrer">Перейти к скачиванию</a> : null}
          <button type="button" className={`button ${userState.favorite ? 'button--primary' : 'button--ghost'}`} onClick={() => onToggle('favorite')}>{userState.favorite ? 'В избранном' : 'Добавить в избранное'}</button>
          <button type="button" className={`button ${userState.planned ? 'button--primary' : 'button--ghost'}`} onClick={() => onToggle('planned')}>{userState.planned ? 'В плане' : 'Планирую пройти'}</button>
          <button type="button" className={`button ${userState.roulette ? 'button--primary' : 'button--ghost'}`} onClick={() => onToggle('roulette')}>{userState.roulette ? 'В рулетке' : 'Добавить в рулетку'}</button>
          <Link className="button button--ghost" to="/games">Назад в каталог</Link>
        </div>
      </div>
    </div>
  </section>;
}
