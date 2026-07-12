import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="container">
      <section className="empty-state panel" style={{ marginTop: '48px' }}>
        <h1>Страница не найдена</h1>
        <p>Похоже, этого маршрута еще нет. Вернемся в каталог или на главную.</p>
        <div className="game-page__links">
          <Link to="/" className="button button--primary">
            На главную
          </Link>
          <Link to="/games" className="button button--ghost">
            В каталог
          </Link>
        </div>
      </section>
    </div>
  );
}
