import { Link, Navigate, useParams } from 'react-router-dom';
import { GameCard } from '../components/GameCard';
import { ImageGallery } from '../components/ImageGallery';
import { SectionHeading } from '../components/SectionHeading';
import { Tag } from '../components/Tag';
import { games, series } from '../data/library';
import { formatDuration, formatMaybe, formatRating, getPriceLabel, statusLabel, verificationLabel } from '../utils/library';
import { useUserLibrary } from '../hooks/useUserLibrary';

export function GamePage() {
  const { slug } = useParams();
  const game = games.find((item) => item.slug === slug);
  const { state, update, remove } = useUserLibrary();

  if (!game) {
    return <Navigate to="/games" replace />;
  }

  const userState = state[game.slug] ?? {};
  const related = [...new Set([...game.relatedGameIds, ...game.similarGameIds])]
    .map((id) => games.find((item) => item.id === id))
    .filter((item): item is (typeof games)[number] => Boolean(item));

  const seriesInfo = game.seriesId ? series.find((item) => item.id === game.seriesId) : null;

  const toggle = (key: 'favorite' | 'planned' | 'completed' | 'streamed' | 'videoReady') => {
    update(game.slug, { [key]: !userState[key] } as Partial<typeof userState>);
  };

  return (
    <div className="container game-page">
      <div className="game-page__hero panel">
        <div className="game-page__media">
          {game.mainImage ? <img src={game.mainImage} alt={game.title} loading="lazy" /> : null}
        </div>
        <div className="game-page__copy">
          <div className="game-page__badges">
            <span className="badge badge--accent">{statusLabel[game.status]}</span>
            <span className="badge">{verificationLabel[game.verificationStatus]}</span>
            <span className="badge">{game.type === 'fan_game' ? 'Фан-игра' : 'Оригинал'}</span>
          </div>
          <h1>{game.title}</h1>
          <p className="game-page__lead">{game.description}</p>

          <div className="game-page__facts">
            <div>
              <span>Разработчик</span>
              <strong>Не указано</strong>
            </div>
            <div>
              <span>Серия</span>
              <strong>{seriesInfo?.title ?? 'Отдельная запись'}</strong>
            </div>
            <div>
              <span>Версия</span>
              <strong>{formatMaybe(game.versionLabel)}</strong>
            </div>
            <div>
              <span>Рекомендуется</span>
              <strong>{formatMaybe(game.recommendedVersion)}</strong>
            </div>
            <div>
              <span>Платформа</span>
              <strong>{game.platforms.join(', ') || 'Не указано'}</strong>
            </div>
            <div>
              <span>Цена</span>
              <strong>{getPriceLabel(game.priceType)}</strong>
            </div>
            <div>
              <span>Длительность</span>
              <strong>{formatDuration(game.durationMinutes)}</strong>
            </div>
            <div>
              <span>Языки</span>
              <strong>{game.languages.join(', ') || 'Не указано'}</strong>
            </div>
          </div>

          <div className="game-page__rating panel">
            <div>
              <span>Геймплей</span>
              <strong>{formatRating(game.ratings.gameplay)}</strong>
            </div>
            <div>
              <span>Атмосфера</span>
              <strong>{formatRating(game.ratings.atmosphere)}</strong>
            </div>
            <div>
              <span>Страшность</span>
              <strong>{formatRating(game.ratings.horror)}</strong>
            </div>
            <div>
              <span>Для стрима</span>
              <strong>{formatRating(game.ratings.stream)}</strong>
            </div>
            <div>
              <span>Для YouTube</span>
              <strong>{formatRating(game.ratings.youtube)}</strong>
            </div>
            <div>
              <span>Для Shorts</span>
              <strong>{formatRating(game.ratings.shorts)}</strong>
            </div>
            <div>
              <span>Общий</span>
              <strong>{formatRating(game.ratings.overall)}</strong>
            </div>
          </div>

          <div className="game-page__actions">
            <button type="button" className={`button ${userState.favorite ? 'button--primary' : 'button--ghost'}`} onClick={() => toggle('favorite')}>
              {userState.favorite ? 'В избранном' : 'В избранное'}
            </button>
            <button type="button" className={`button ${userState.planned ? 'button--primary' : 'button--ghost'}`} onClick={() => toggle('planned')}>
              {userState.planned ? 'В плане' : 'Планирую пройти'}
            </button>
            <button type="button" className={`button ${userState.completed ? 'button--primary' : 'button--ghost'}`} onClick={() => toggle('completed')}>
              {userState.completed ? 'Пройдено' : 'Отметить пройденной'}
            </button>
            <button type="button" className={`button ${userState.streamed ? 'button--primary' : 'button--ghost'}`} onClick={() => toggle('streamed')}>
              {userState.streamed ? 'Стрим был' : 'Стримил'}
            </button>
            <button type="button" className={`button ${userState.videoReady ? 'button--primary' : 'button--ghost'}`} onClick={() => toggle('videoReady')}>
              {userState.videoReady ? 'Видео готово' : 'Видео не готово'}
            </button>
            <button type="button" className="button button--ghost" onClick={() => remove(game.slug)}>
              Сбросить отметки
            </button>
          </div>
        </div>
      </div>

      <section className="section">
        <SectionHeading title="Теги и особенности" />
        <div className="tags-row">
          {game.tags.map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
        </div>
        <div className="features-grid">
          {Object.entries(game.features).length > 0 ? (
            Object.entries(game.features).map(([key, value]) => (
              <div key={key} className={`feature feature--${value ? 'on' : 'off'}`}>
                <strong>{key}</strong>
                <span>{value ? 'Есть' : 'Не указано'}</span>
              </div>
            ))
          ) : (
            <p className="empty-state">Особенности пока не заполнены.</p>
          )}
        </div>
      </section>

      <section className="section">
        <SectionHeading title="Галерея" subtitle="Изображения из архива, разбитые по папкам во время организации ассетов." />
        <ImageGallery images={[...(game.mainImage ? [game.mainImage] : []), ...game.gallery]} title={game.title} />
      </section>

      <section className="section">
        <SectionHeading title="Связанные игры" />
        <div className="grid grid--cards">
          {related.length > 0 ? related.map((item) => <GameCard key={item.slug} game={item} compact />) : <p className="empty-state">Связанные игры пока не добавлены.</p>}
        </div>
      </section>

      <section className="section">
        <SectionHeading title="Навигация" />
        <div className="game-page__links">
          <Link to="/games" className="button button--ghost">
            Назад в каталог
          </Link>
          <Link to="/roulette" className="button button--primary">
            Выбрать случайную игру
          </Link>
          {seriesInfo ? (
            <Link to={`/series/${seriesInfo.slug}`} className="button button--ghost">
              Страница серии
            </Link>
          ) : null}
          <Link to="/developers/unknown" className="button button--ghost">
            Страница разработчика
          </Link>
        </div>
      </section>
    </div>
  );
}
