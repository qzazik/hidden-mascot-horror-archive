import { Link } from 'react-router-dom';
import type { Game } from '../../types';
import { confidenceLabel, formatDuration, formatRating, statusLabel, verificationLabel } from '../../utils/library';

type RouletteResultProps = {
  game: Game | null;
  poolSize: number;
  modeLabel: string;
  appliedFilters: string[];
  explanation: string[];
};

export function RouletteResult({ game, poolSize, modeLabel, appliedFilters, explanation }: RouletteResultProps) {
  if (!game) {
    return (
      <section className="roulette-result panel">
        <h3>Результат появится здесь</h3>
        <p>Выбери фильтры и нажми "Крутить рулетку".</p>
      </section>
    );
  }

  return (
    <section className="roulette-result panel">
      <div className="roulette-result__head">
        <div>
          <span className="badge badge--accent">Выбор рулетки</span>
          <h3>{game.title}</h3>
          <p>{game.shortDescription}</p>
        </div>
        {game.mainImage ? <img src={game.mainImage} alt={game.title} className="roulette-result__image" loading="lazy" /> : null}
      </div>

      <dl className="roulette-result__grid">
        <div>
          <dt>Режим</dt>
          <dd>{modeLabel}</dd>
        </div>
        <div>
          <dt>Кандидатов</dt>
          <dd>{poolSize}</dd>
        </div>
        <div>
          <dt>Стрим</dt>
          <dd>{formatRating(game.ratings.stream)}</dd>
        </div>
        <div>
          <dt>Общий</dt>
          <dd>{formatRating(game.ratings.overall)}</dd>
        </div>
        <div>
          <dt>Длительность</dt>
          <dd>{formatDuration(game.durationMinutes)}</dd>
        </div>
        <div>
          <dt>Проверка</dt>
          <dd>{verificationLabel[game.verificationStatus]}</dd>
        </div>
        <div>
          <dt>Статус</dt>
          <dd>{statusLabel[game.status]}</dd>
        </div>
        <div>
          <dt>Уверенность</dt>
          <dd>{confidenceLabel[game.ratingConfidence]}</dd>
        </div>
      </dl>

      <div className="roulette-result__details">
        <div>
          <h4>Почему подходит</h4>
          <ul>
            {explanation.length > 0 ? explanation.map((item) => <li key={item}>{item}</li>) : <li>Подходит по текущему набору фильтров.</li>}
          </ul>
        </div>
        <div>
          <h4>Примененные фильтры</h4>
          <ul>
            {appliedFilters.length > 0 ? appliedFilters.map((item) => <li key={item}>{item}</li>) : <li>Фильтры не ограничивали выбор.</li>}
          </ul>
        </div>
      </div>

      <div className="roulette-result__actions">
        <Link to={`/games/${game.slug}`} className="button button--primary">
          Открыть страницу игры
        </Link>
      </div>
    </section>
  );
}
