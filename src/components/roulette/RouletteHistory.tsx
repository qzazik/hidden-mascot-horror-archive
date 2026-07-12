import { Link } from 'react-router-dom';

type RouletteHistoryItem = {
  slug: string;
  title: string;
  selectedAt: string;
  mode: string;
  poolSize: number;
  appliedFilters: string[];
};

type RouletteHistoryProps = {
  items: RouletteHistoryItem[];
  onClear: () => void;
};

export function RouletteHistory({ items, onClear }: RouletteHistoryProps) {
  return (
    <section className="roulette-history panel">
      <div className="roulette-history__head">
        <div>
          <h3>Последние результаты</h3>
          <p>История хранится локально, максимум 10 записей.</p>
        </div>
        <button type="button" className="button button--ghost" onClick={onClear}>
          Очистить
        </button>
      </div>

      {items.length === 0 ? (
        <p className="empty-state">Пока нет результатов. Крутанем рулетку?</p>
      ) : (
        <ol className="roulette-history__list">
          {items.map((item) => (
            <li key={`${item.slug}-${item.selectedAt}`} className="roulette-history__item">
              <div>
                <strong>{item.title}</strong>
                <p>
                  {new Date(item.selectedAt).toLocaleString('ru-RU')} · {item.mode} · кандидатов: {item.poolSize}
                </p>
                <p className="roulette-history__filters">{item.appliedFilters.join(' · ') || 'Без дополнительных ограничений'}</p>
              </div>
              <Link to={`/games/${item.slug}`} className="button button--ghost">
                Открыть
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
