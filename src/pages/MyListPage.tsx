import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { GameCard } from '../components/GameCard';
import { SectionHeading } from '../components/SectionHeading';
import { games } from '../data/library';
import { useUserLibrary } from '../hooks/useUserLibrary';

type TabKey = 'favorite' | 'planned' | 'completed' | 'streamed' | 'videoReady';

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: 'favorite', label: 'Избранное' },
  { key: 'planned', label: 'Планирую пройти' },
  { key: 'completed', label: 'Пройдено' },
  { key: 'streamed', label: 'Стримил' },
  { key: 'videoReady', label: 'Видео готово' }
];

export function MyListPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('favorite');
  const { state } = useUserLibrary();

  const items = useMemo(() => {
    return games.filter((game) => state[game.slug]?.[activeTab]);
  }, [activeTab, state]);

  return (
    <div className="container my-list">
      <SectionHeading
        title="Мой список"
        subtitle="Все отметки хранятся только в localStorage этого браузера."
        action={
          <Link to="/games" className="button button--ghost">
            В каталог
          </Link>
        }
      />

      <div className="tabs panel">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`tabs__button ${activeTab === tab.key ? 'tabs__button--active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid--cards">
        {items.map((game) => (
          <GameCard key={game.slug} game={game} />
        ))}
      </div>

      {items.length === 0 ? (
        <div className="empty-state panel">
          <h3>Список пуст</h3>
          <p>Добавь игры из карточек, чтобы они появились здесь.</p>
          <Link to="/games" className="button button--primary">
            Перейти в каталог
          </Link>
        </div>
      ) : null}
    </div>
  );
}
