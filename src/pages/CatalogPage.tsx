import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { GameCard } from '../components/GameCard';
import { SectionHeading } from '../components/SectionHeading';
import { Tag } from '../components/Tag';
import { games } from '../data/library';
import { gameMatchesQuery, orderFeatured } from '../utils/library';

type SortKey = 'rating' | 'stream' | 'clips' | 'name' | 'recent';

const sortOptions: Array<{ value: SortKey; label: string }> = [
  { value: 'rating', label: 'Общий рейтинг' },
  { value: 'stream', label: 'Рейтинг стрима' },
  { value: 'clips', label: 'Потенциал клипов' },
  { value: 'name', label: 'Название' },
  { value: 'recent', label: 'Сначала новые' }
];

const durationLabel = (value: 'any' | 'short' | 'medium' | 'long') => {
  if (value === 'short') return 'до 30 мин';
  if (value === 'medium') return '30-60 мин';
  if (value === 'long') return 'больше часа';
  return 'любой';
};

export function CatalogPage() {
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('rating');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    platform: 'all',
    source: 'all',
    price: 'all',
    tag: 'all',
    curation: 'approved'
  });

  const filtered = useMemo(() => {
    const source = orderFeatured(games);
    const base = source.filter((game) => gameMatchesQuery(game, query));
    const filteredByTag = base.filter((game) => {
      const curationStatus = game.curationStatus ?? 'approved';
      if (curationStatus === 'pending' || curationStatus === 'rejected') return false;
      if (filters.curation === 'approved' && curationStatus !== 'approved') return false;
      if (filters.curation === 'experimental' && curationStatus !== 'experimental') return false;
      if (filters.type !== 'all' && game.type !== filters.type) return false;
      if (filters.status !== 'all' && game.status !== filters.status) return false;
      if (filters.platform !== 'all' && !game.platforms.includes(filters.platform)) return false;
      if (filters.source !== 'all' && !game.storePlatforms.includes(filters.source)) return false;
      if (filters.price !== 'all' && game.priceType !== filters.price) return false;
      if (filters.tag !== 'all' && !game.tags.includes(filters.tag)) return false;
      return true;
    });

    return [...filteredByTag].sort((a, b) => {
      if (sortBy === 'name') return a.title.localeCompare(b.title, 'ru');
      if (sortBy === 'recent') return (b.releaseDate ?? '').localeCompare(a.releaseDate ?? '');
      const ratingA = sortBy === 'stream' ? a.ratings.stream ?? -1 : sortBy === 'clips' ? a.ratings.shorts ?? -1 : a.ratings.overall ?? -1;
      const ratingB = sortBy === 'stream' ? b.ratings.stream ?? -1 : sortBy === 'clips' ? b.ratings.shorts ?? -1 : b.ratings.overall ?? -1;
      return ratingB - ratingA || a.title.localeCompare(b.title, 'ru');
    });
  }, [filters, query, sortBy]);

  const activeTags = [
    filters.type !== 'all' ? { label: `тип: ${filters.type}`, remove: () => setFilters({ ...filters, type: 'all' }) } : null,
    filters.status !== 'all' ? { label: `статус: ${filters.status}`, remove: () => setFilters({ ...filters, status: 'all' }) } : null,
    filters.platform !== 'all' ? { label: `платформа: ${filters.platform}`, remove: () => setFilters({ ...filters, platform: 'all' }) } : null,
    filters.source !== 'all' ? { label: `магазин: ${filters.source}`, remove: () => setFilters({ ...filters, source: 'all' }) } : null,
    filters.price !== 'all' ? { label: `цена: ${filters.price}`, remove: () => setFilters({ ...filters, price: 'all' }) } : null,
    filters.tag !== 'all' ? { label: `тег: ${filters.tag}`, remove: () => setFilters({ ...filters, tag: 'all' }) } : null,
    filters.curation === 'experimental'
      ? { label: 'странные и экспериментальные', remove: () => setFilters({ ...filters, curation: 'approved' }) }
      : null
  ].filter((item): item is { label: string; remove: () => void } => Boolean(item));

  const reset = () => {
    setQuery('');
    setSortBy('rating');
    setFilters({
      type: 'all',
      status: 'all',
      platform: 'all',
      source: 'all',
      price: 'all',
      tag: 'all',
      curation: 'approved'
    });
  };

  return (
    <div className="catalog container">
      <SectionHeading
        title="Каталог игр"
        subtitle="Поиск по названию, тегам, платформам и статусам. На мобильных фильтры открываются в боковой панели."
        action={
          <div className="catalog__actions">
            <button type="button" className="button button--ghost catalog__filtersButton" onClick={() => setDrawerOpen(true)}>
              Фильтры
            </button>
            <button type="button" className="button button--ghost" onClick={reset}>
              Сбросить всё
            </button>
          </div>
        }
      />

      <div className="search-bar panel">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Поиск по названию, разработчику, серии или тегам"
          aria-label="Поиск по каталогу"
        />
        <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortKey)}>
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="catalog__active">
        {activeTags.map((tag) => (
          <Tag key={tag.label} label={tag.label} removable onRemove={tag.remove} />
        ))}
        {query ? <Tag label={`поиск: ${query}`} removable onRemove={() => setQuery('')} /> : null}
        <span className="catalog__count">{filtered.length} игр</span>
      </div>

      <div className={`catalog__layout ${drawerOpen ? 'catalog__layout--open' : ''}`}>
        <div className="catalog__overlay" aria-hidden="true" onClick={() => setDrawerOpen(false)} />
        <aside className="catalog__sidebar panel">
          <div className="catalog__sidebarHead">
            <h3>Фильтры</h3>
            <button type="button" className="button button--ghost" onClick={() => setDrawerOpen(false)}>
              Закрыть
            </button>
          </div>

          <label>
            <span>Качество отбора</span>
            <select value={filters.curation} onChange={(event) => setFilters({ ...filters, curation: event.target.value })}>
              <option value="approved">Отобранные игры</option>
              <option value="experimental">Странные и экспериментальные</option>
            </select>
          </label>

          <label>
            <span>Тип</span>
            <select value={filters.type} onChange={(event) => setFilters({ ...filters, type: event.target.value })}>
              <option value="all">Любой</option>
              <option value="original">Оригинал</option>
              <option value="fan_game">Фан-игра</option>
            </select>
          </label>

          <label>
            <span>Статус</span>
            <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
              <option value="all">Любой</option>
              <option value="release">Релиз</option>
              <option value="demo">Демо</option>
              <option value="in_development">В разработке</option>
              <option value="prologue">Пролог</option>
              <option value="unknown">Требует проверки</option>
            </select>
          </label>

          <label>
            <span>Платформа</span>
            <select value={filters.platform} onChange={(event) => setFilters({ ...filters, platform: event.target.value })}>
              <option value="all">Любая</option>
              <option value="Windows">Windows</option>
              <option value="Android">Android</option>
              <option value="Browser">Браузер</option>
            </select>
          </label>

          <label>
            <span>Площадка</span>
            <select value={filters.source} onChange={(event) => setFilters({ ...filters, source: event.target.value })}>
              <option value="all">Любая</option>
              <option value="itch.io">itch.io</option>
              <option value="Game Jolt">Game Jolt</option>
              <option value="Steam">Steam</option>
            </select>
          </label>

          <label>
            <span>Цена</span>
            <select value={filters.price} onChange={(event) => setFilters({ ...filters, price: event.target.value })}>
              <option value="all">Любая</option>
              <option value="free">Бесплатно</option>
              <option value="paid">Платно</option>
              <option value="unknown">Не указано</option>
            </select>
          </label>

          <label>
            <span>Тег</span>
            <select value={filters.tag} onChange={(event) => setFilters({ ...filters, tag: event.target.value })}>
              <option value="all">Любой</option>
              {Array.from(new Set(games.flatMap((game) => game.tags))).map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </label>
        </aside>

        <section className="catalog__results">
          {filters.curation === 'experimental' ? (
            <div className="experimental-note panel">
              <span className="badge badge--accent">Экспериментальная подборка</span>
              <h2>Может быть плохо, но интересно</h2>
              <p>Мемные, странные или неровные игры, которые могут дать хороший материал для стрима.</p>
            </div>
          ) : null}
          <div className="grid grid--cards">
            {filtered.map((game) => (
              <GameCard key={game.slug} game={game} />
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state panel">
              <h3>Ничего не найдено</h3>
              <p>Попробуй сбросить часть фильтров или расширить поиск.</p>
              <button type="button" className="button button--primary" onClick={reset}>
                Сбросить фильтры
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
