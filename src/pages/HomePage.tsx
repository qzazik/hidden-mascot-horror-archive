import { Link } from 'react-router-dom';
import { games, hiddenGemSlugs, rouletteModes } from '../data/library';
import { SectionHeading } from '../components/SectionHeading';
import { GameCard } from '../components/GameCard';
import { StatCard } from '../components/StatCard';
import { getCatalogStats, getModeTitle, orderFeatured } from '../utils/library';

export function HomePage() {
  const stats = getCatalogStats(games);
  const featured = orderFeatured(games).slice(0, 6);
  const hiddenGems = games.filter((game) => hiddenGemSlugs.includes(game.slug)).slice(0, 4);
  const fanGames = games.filter((game) => game.type === 'fan_game').slice(0, 4);
  const recent = [...games].slice(-4).reverse();

  return (
    <div className="home">
      <section className="hero container panel">
        <div className="hero__copy">
          <span className="hero__eyebrow">Архив mascot horror</span>
          <h1>Hidden Mascot Horror Archive</h1>
          <p>
            Каталог малоизвестных mascot horror, фан-игр, демо и прототипов. В этой первой версии уже есть поиск,
            фильтры, страницы игр, список пользователя и отдельная рулетка.
          </p>
          <div className="hero__actions">
            <Link to="/games" className="button button--primary">
              Открыть каталог
            </Link>
            <Link to="/roulette" className="button button--ghost">
              Перейти к рулетке
            </Link>
          </div>
          <div className="hero__stats">
            <StatCard label="Игры" value={stats.games} tone="red" />
            <StatCard label="Фан-игры" value={stats.fanGames} tone="blue" />
            <StatCard label="Демо" value={stats.demos} tone="green" />
            <StatCard label="В разработке" value={stats.inDevelopment} tone="default" />
          </div>
        </div>

        <div className="hero__panel">
          <div className="hero__module">
            <span className="badge badge--accent">Нужна игра на сейчас?</span>
            <h2>Не знаешь, во что сыграть?</h2>
            <p>Рулетка умеет брать безопасный набор фильтров по умолчанию и сохраняет историю локально.</p>
            <Link to="/roulette" className="button button--primary">
              Выбрать случайную игру
            </Link>
          </div>
          <div className="hero__module hero__module--grid">
            {rouletteModes.slice(0, 4).map((mode) => (
              <div key={mode.id} className="hero__mode">
                <strong>{mode.label}</strong>
                <small>{mode.description}</small>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container section">
        <SectionHeading
          title="Рекомендуемые для стрима"
          subtitle="Подборка из главных карточек архива. Для первой версии это вручную выбранные записи."
          action={<Link to="/games">Весь каталог</Link>}
        />
        <div className="grid grid--cards">
          {featured.map((game) => (
            <GameCard key={game.slug} game={game} />
          ))}
        </div>
      </section>

      <section className="container section">
        <SectionHeading title="Hidden Gems" subtitle="Скрытые находки, которые приятно смотреть и показывать." />
        <div className="grid grid--cards">
          {hiddenGems.map((game) => (
            <GameCard key={game.slug} game={game} compact />
          ))}
        </div>
      </section>

      <section className="container section">
        <SectionHeading title="Фан-игры" subtitle="Проекты, сделанные по знакомым вселенным." />
        <div className="grid grid--cards">
          {fanGames.map((game) => (
            <GameCard key={game.slug} game={game} compact />
          ))}
        </div>
      </section>

      <section className="container section">
        <SectionHeading title="Последние добавленные" subtitle="Пока это список из конца локального набора данных." />
        <div className="grid grid--cards">
          {recent.map((game) => (
            <GameCard key={game.slug} game={game} compact />
          ))}
        </div>
      </section>
    </div>
  );
}
