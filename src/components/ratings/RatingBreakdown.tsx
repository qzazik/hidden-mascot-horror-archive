import type { RatingSet } from '../../types';
import { getRatingCount, normalizeRatingSet, ratingGroups } from '../../utils/ratings';
import { RatingBar } from './RatingBar';

export function RatingBreakdown({ ratings }: { ratings: RatingSet }) {
  const normalized = normalizeRatingSet(ratings);
  if (getRatingCount(normalized) === 0) return null;

  return <section className="rating-breakdown panel"><div className="section-title"><span className="badge badge--accent">Редакционная оценка</span><h2>Оценки архива</h2></div><div className="rating-breakdown__groups">{ratingGroups.map((group) => {
    const filled = group.criteria.filter(({ key }) => normalized[key] !== null);
    if (!filled.length) return null;
    return <div className="rating-breakdown__group" key={group.title}><h3>{group.title}</h3>{filled.map(({ key, label }) => <RatingBar key={key} label={label} value={normalized[key] as number} />)}</div>;
  })}</div></section>;
}
