import type { Game } from '../../types';

type RouletteWheelProps = {
  games: Game[];
  selectedSlug?: string | null;
  spinning?: boolean;
};

export function RouletteWheel({ games, selectedSlug, spinning }: RouletteWheelProps) {
  const visible = games.slice(0, 12);
  const angleStep = visible.length > 0 ? 360 / visible.length : 0;

  return (
    <div className={`roulette-wheel ${spinning ? 'roulette-wheel--spinning' : ''}`}>
      <div className="roulette-wheel__ring" aria-hidden="true">
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
