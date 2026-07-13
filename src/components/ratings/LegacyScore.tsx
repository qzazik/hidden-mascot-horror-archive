import type { Game } from '../../types';
import { calculateLegacyIndex } from '../../utils/ratings';

export function LegacyScore({ legacyRatings }: { legacyRatings: Game['legacyRatings'] }) {
  const index = calculateLegacyIndex(legacyRatings);
  if (!legacyRatings || index === null) return null;
  return <section className="legacy-score panel"><div className="legacy-score__tile"><strong>{index.toFixed(1)}</strong><span>Excel индекс</span></div><div className="legacy-score__copy"><span className="overall-rating__eyebrow">Предварительные данны</span><h2>Потенциал для контента</h2><div><span>Для стрима <strong>{legacyRatings.streamPotential?.toFixed(1) ?? '—'}</strong></span><span>Для клипов <strong>{legacyRatings.clipsPotential?.toFixed(1) ?? '—'}</strong></span></div><p>Старая предварительная оценка из Excel. Не является рейтингом качества и не влияет на ранг.</p></div></section>;
}
