import { NavLink, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { games } from '../data/library';
import { getCatalogStats } from '../utils/library';

type LayoutProps = {
  children: ReactNode;
};

const navItems = [
  { to: '/', label: 'Главная' },
  { to: '/games', label: 'Каталог' },
  { to: '/roulette', label: 'Рулетка' },
  { to: '/my-list', label: 'Мой список' }
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const stats = getCatalogStats(games);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="container topbar__inner">
          <NavLink to="/" className="brand" aria-label="Hidden Mascot Horror Archive">
            <span className="brand__mark">HM</span>
            <span className="brand__text">
              <strong>Hidden Mascot Horror Archive</strong>
              <small>Русский каталог малоизвестных horror-игр</small>
            </span>
          </NavLink>

          <nav className="nav" aria-label="Основная навигация">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav__link ${isActive ? 'nav__link--active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="topbar__stats">
            <span className="topbar__stat">
              <strong>{stats.games}</strong>
              <small>игр</small>
            </span>
            <span className="topbar__stat">
              <strong>{stats.fanGames}</strong>
              <small>фан-игр</small>
            </span>
            <span className="topbar__stat">
              <strong>{stats.demos}</strong>
              <small>демо</small>
            </span>
          </div>
        </div>
      </header>

      <main className={`page page--${location.pathname.replace(/\//g, '-').replace(/^-/, '') || 'home'}`}>
        {children}
      </main>

      <footer className="footer">
        <div className="container footer__inner">
          <p>Локальный каталог без backend. Данные, избранное и история рулетки хранятся в localStorage.</p>
          <p>GitHub Pages-ready: BrowserRouter с base path и fallback-страницей 404.</p>
        </div>
      </footer>
    </div>
  );
}
