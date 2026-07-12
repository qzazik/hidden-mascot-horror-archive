import { Link, Navigate, useParams } from 'react-router-dom';
import { GameCard } from '../components/GameCard';
import { SectionHeading } from '../components/SectionHeading';
import { games, series } from '../data/library';

export function SeriesPage() {
  const { slug } = useParams();
  const seriesItem = series.find((item) => item.slug === slug);

  if (!seriesItem) {
    return <Navigate to="/games" replace />;
  }

  const items = games.filter((game) => game.seriesId === seriesItem.id);

  return (
    <div className="container detail-page">
      <section className="detail-hero panel">
        <div>
          <span className="badge badge--accent">Серия</span>
          <h1>{seriesItem.title}</h1>
          <p>{seriesItem.description}</p>
        </div>
        <div className="detail-hero__links">
          <Link to="/games" className="button button--ghost">
            Каталог
          </Link>
          <Link to="/roulette" className="button button--primary">
            Рулетка
          </Link>
        </div>
      </section>

      <section className="section">
        <SectionHeading title="Игры и версии" subtitle="В этой первой версии список строится по найденным записям каталога." />
        <div className="grid grid--cards">
          {items.map((game) => (
            <GameCard key={game.slug} game={game} compact />
          ))}
        </div>
        {items.length === 0 ? <p className="empty-state">Для этой серии пока нет связанных игр в каталоге.</p> : null}
      </section>
    </div>
  );
}
