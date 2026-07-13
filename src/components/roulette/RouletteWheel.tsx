import type { Game } from '../../types';

type RouletteWheelProps = {
  games: Game[];
  selectedSlug?: string | null;
  spinning?: boolean;
};

export function RouletteWheel({ games, selectedSlug, spinning }: RouletteWheelProps) {
  const selectedGame = selectedSlug ? games.find((game) => game.slug === selectedSlug) : null;
  const initialVisible = games.slice(0, 12);
  const visible = selectedGame && !initialVisible.some((game) => game.slug === selectedGame.slug)
    ? [...initialVisible.slice(0, 11), selectedGame]
    : initialVisible;
  const angleStep = visible.length > 0 ? 360 / visible.length : 0;
  const selectedIndex = visible.findIndex((game) => game.slug === selectedSlug);
  const finalRotation = 1440 - Math.max(0, selectedIndex) * angleStep;

  return (
    <div className={`roulette-wheel ${spinning ? 'roulette-wheel--spinning' : ''}`}>
      <div className="roulette-wheel__pointer" aria-label="Указатель результа"><span /></div>
      <div className="roulette-wheel__ring" aria-hidden="true" style={{ '--roulette-end': `${finalRotation}deg` } as React.CSSProperties}>
        {visible.map((game, index) => {
          const active = selectedSlug === game.slug;
          const angle = index * angleStep - 90;
          const angleInRadians = (angle * Math.PI) / 180;
          const left = 50 + Math.cos(angleInRadians) * 40;
          const top = 50 + Math.sin(angleInRadians) * 40;

          return (
            <div
              key={game.slug}
              className={`roulette-wheel__slot ${active ? 'roulette-wheel__slot--active' : ''}`}
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              {game.mainImage ? <img src={game.mainImage} alt="" loading="lazy" /> : <span>{game.title}</span>}
            </div>
          );
        })}
      </div>
      <div className="roulette-wheel__center">
        <span>РУЛЕТКА</span>
      </div>
    </div>
  );
}
