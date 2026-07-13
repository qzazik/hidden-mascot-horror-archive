import { useMemo, useState } from 'react';
import { games } from '../data/library';
import { SectionHeading } from '../components/SectionHeading';
import { RouletteWheel } from '../components/roulette/RouletteWheel';
import { RouletteFilters } from '../components/roulette/RouletteFilters';
import { RouletteResult } from '../components/roulette/RouletteResult';
import { RouletteHistory } from '../components/roulette/RouletteHistory';
import { useRoulette } from '../hooks/useRoulette';
import { explainCandidate } from '../utils/roulette';

export function RoulettePage() {
  const roulette = useRoulette();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [wheelTargetSlug, setWheelTargetSlug] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [lastAppliedFilters, setLastAppliedFilters] = useState<string[]>([]);

  const selectedGame = useMemo(() => games.find((game) => game.slug === selectedSlug) ?? null, [selectedSlug]);

  const handleSpin = () => {
    if (spinning || !roulette.hasGames) return;
    setSpinning(true);
    const result = roulette.spin();
    if (!result) {
      setSpinning(false);
      return;
    }
    setLastAppliedFilters(result.appliedFilters);
    setWheelTargetSlug(result.game.slug);
    window.setTimeout(() => {
      setSelectedSlug(result.game.slug);
      setSpinning(false);
    }, 2800);
  };

  const explanation = selectedGame ? explainCandidate(selectedGame, roulette.filters) : [];

  return (
    <div className="container roulette-page">
      <SectionHeading
        title="Рулетка случайной игры"
        subtitle="Выбирай режим, ограничивай каталог и получай честный случайный результат с локальной историей."
        action={
          <div className="roulette-page__actions">
            <button type="button" className="button button--ghost roulette-page__mobileFilters" onClick={() => setMobileFiltersOpen(true)}>
              Фильтры
            </button>
            <button type="button" className="button button--primary" onClick={handleSpin} disabled={spinning || !roulette.hasGames}>
              {spinning ? 'Крутим...' : 'Крутить рулетку'}
            </button>
          </div>
        }
      />

      <div className="roulette-page__layout">
        <div className={`roulette-page__filtersWrap ${mobileFiltersOpen ? 'roulette-page__filtersWrap--open' : ''}`}>
          <div className="roulette-page__filtersOverlay" aria-hidden="true" onClick={() => setMobileFiltersOpen(false)} />
          <div className="roulette-page__filters">
            <RouletteFilters
              filters={roulette.filters}
              onChange={roulette.setFilters}
              onReset={roulette.resetFilters}
            />
            <button type="button" className="button button--ghost roulette-page__close" onClick={() => setMobileFiltersOpen(false)}>
              Закрыть
            </button>
          </div>
        </div>

        <div className="roulette-page__main">
          <RouletteWheel games={roulette.pool} selectedSlug={wheelTargetSlug ?? selectedSlug} spinning={spinning} />

          <div className="roulette-page__buttonRow">
            <button type="button" className="button button--primary" onClick={handleSpin} disabled={spinning || !roulette.hasGames}>
              {spinning ? 'Крутим...' : 'Крутить рулетку'}
            </button>
            <button type="button" className="button button--ghost" onClick={() => { setSelectedSlug(null); setWheelTargetSlug(null); }}>
              Сбросить выбор
            </button>
          </div>

          {!roulette.hasGames ? (
            <div className="empty-state panel">
              <h3>Подходящих игр нет</h3>
              <p>Ослабь фильтры, чтобы вернуть кандидатов в круг.</p>
              <button type="button" className="button button--primary" onClick={roulette.resetFilters}>
                Сбросить фильтры
              </button>
            </div>
          ) : null}

          <RouletteResult
            game={selectedGame}
            poolSize={roulette.pool.length}
            modeLabel={roulette.activeModeLabel}
            appliedFilters={lastAppliedFilters}
            explanation={selectedGame ? explanation : []}
          />
        </div>
      </div>

      <RouletteHistory items={roulette.history} onClear={roulette.clearHistory} />
    </div>
  );
}
