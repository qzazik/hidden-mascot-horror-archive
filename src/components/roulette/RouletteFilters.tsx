import type { ChangeEvent } from 'react';
import type { Game, RouletteFilters as RouletteFiltersState } from '../../types';
import { allPlatforms, allStorePlatforms, allTags, rouletteModes } from '../../data/library';
import { ToggleGroup } from '../ToggleGroup';

type RouletteFiltersProps = {
  filters: RouletteFiltersState;
  onChange: (next: RouletteFiltersState) => void;
  onReset: () => void;
  compact?: boolean;
};

const checkbox = (
  label: string,
  checked: boolean,
  onToggle: () => void,
  help?: string
) => (
  <label className="filter-checkbox">
    <span>
      <strong>{label}</strong>
      {help ? <small>{help}</small> : null}
    </span>
    <input type="checkbox" checked={checked} onChange={onToggle} />
  </label>
);

const updateTag = (tags: string[], tag: string, enabled: boolean) =>
  enabled ? Array.from(new Set([...tags, tag])) : tags.filter((item) => item !== tag);

type RouletteModeId = RouletteFiltersState['mode'];

export function RouletteFilters({ filters, onChange, onReset }: RouletteFiltersProps) {
  const set = <K extends keyof RouletteFiltersState>(key: K, value: RouletteFiltersState[K]) =>
    onChange({ ...filters, [key]: value });

  const setNumeric = (key: 'minStreamRating' | 'minOverallRating') => (event: ChangeEvent<HTMLInputElement>) =>
    set(key, Number(event.target.value) as RouletteFiltersState[typeof key]);

  const toggleTag = (tag: string) => {
    onChange({ ...filters, tags: updateTag(filters.tags, tag, !filters.tags.includes(tag)) });
  };

  return (
    <aside className="filters panel">
      <div className="filters__head">
        <div>
          <h3>Фильтры рулетки</h3>
          <p>Параметры влияют на вес выбора и на круг доступных игр.</p>
        </div>
        <button type="button" className="button button--ghost" onClick={onReset}>
          Сбросить
        </button>
      </div>

      <ToggleGroup
        label="Режим"
        value={filters.mode}
        onChange={(value) => set('mode', value as RouletteModeId)}
        options={rouletteModes.map((mode) => ({ value: mode.id, label: mode.label }))}
      />

      <div className="filters__section">
        <label>
          <span>Тип</span>
          <select value={filters.type} onChange={(event) => set('type', event.target.value as Game['type'] | 'all')}>
            <option value="all">Любой</option>
            <option value="original">Оригинал</option>
            <option value="fan_game">Фан-игра</option>
          </select>
        </label>

        <label>
          <span>Цена</span>
          <select value={filters.priceType} onChange={(event) => set('priceType', event.target.value as RouletteFiltersState['priceType'])}>
            <option value="all">Любая</option>
            <option value="free">Бесплатно</option>
            <option value="paid">Платно</option>
            <option value="unknown">Не указано</option>
          </select>
        </label>

        <label>
          <span>Платформа</span>
          <select value={filters.platform} onChange={(event) => set('platform', event.target.value)}>
            <option value="all">Любая</option>
            {allPlatforms.map((platform) => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Площадка</span>
          <select value={filters.storePlatform} onChange={(event) => set('storePlatform', event.target.value)}>
            <option value="all">Любая</option>
            {allStorePlatforms.map((platform) => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Источник</span>
          <select value={filters.duration} onChange={(event) => set('duration', event.target.value as RouletteFiltersState['duration'])}>
            <option value="any">Любая</option>
            <option value="short">До 30 минут</option>
            <option value="medium">30-60 минут</option>
            <option value="long">Больше часа</option>
          </select>
        </label>

        <label>
          <span>Проверка</span>
          <select
            value={filters.verification}
            onChange={(event) => set('verification', event.target.value as RouletteFiltersState['verification'])}
          >
            <option value="any">Любая</option>
            <option value="verified">Проверено</option>
            <option value="partially_verified">Частично</option>
            <option value="unverified">Не проверено</option>
          </select>
        </label>
      </div>

      <div className="filters__section">
        <label>
          <span>Стрим-рейтинг от {filters.minStreamRating}</span>
          <input type="range" min="0" max="10" step="0.5" value={filters.minStreamRating} onChange={setNumeric('minStreamRating')} />
        </label>

        <label>
          <span>Общий рейтинг от {filters.minOverallRating}</span>
          <input type="range" min="0" max="10" step="0.5" value={filters.minOverallRating} onChange={setNumeric('minOverallRating')} />
        </label>
      </div>

      <div className="filters__section">
        {checkbox('Только избранное', filters.onlyFavorites, () => set('onlyFavorites', !filters.onlyFavorites))}
        {checkbox('Только планирую пройти', filters.onlyPlanned, () => set('onlyPlanned', !filters.onlyPlanned))}
        {checkbox('Исключить пройденные', filters.excludeCompleted, () => set('excludeCompleted', !filters.excludeCompleted))}
        {checkbox('Исключить стримленные', filters.excludeStreamed, () => set('excludeStreamed', !filters.excludeStreamed))}
        {checkbox('Исключить готовое видео', filters.excludeVideoReady, () => set('excludeVideoReady', !filters.excludeVideoReady))}
      </div>

      <div className="filters__section">
        <h4>Теги</h4>
        <div className="filters__tags">
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`tag ${filters.tags.includes(tag) ? 'tag--selected' : ''}`}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
