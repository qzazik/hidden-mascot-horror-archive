import { Link, Navigate, useParams } from 'react-router-dom';
import { GameCard } from '../components/GameCard';
import { SectionHeading } from '../components/SectionHeading';
import { developers, games } from '../data/library';

export function DeveloperPage() {
  const { slug } = useParams();
  const developer = developers.find((item) => item.slug === slug);

  if (!developer) {
    return <Navigate to="/games" replace />;
  }

  const developerGames = games.filter((game) => game.developerId === developer.id);

  return (
    <div className="container detail-page">
      <section className="detail-hero panel">
        <div>
          <span className="badge badge--accent">Разработчик</span>
          <h1>{developer.name}</h1>
          <p>{developer.description}</p>
        </div>
        <div className="detail-hero__links">
          <Link to="/games" className="button button--ghost">
            В каталог
          </Link>
          <Link to="/roulette" className="button button--primary">
            К рулетке
          </Link>
        </div>
      </section>

      <section className="section">
        <SectionHeading title="Игры разработчика" />
        <div className="grid grid--cards">
          {developerGames.map((game) => (
            <GameCard key={game.slug} game={game} />
          ))}
        </div>
        {developerGames.length === 0 ? <p className="empty-state">Пока нет подтвержденных игр для этой карточки разработчика.</p> : null}
      </section>

      <section className="section">
        <SectionHeading title="Ссылки" />
        <p className="empty-state">Ссылки на площадки не заполнены для этой версии.</p>
      </section>
    </div>
  );
}
