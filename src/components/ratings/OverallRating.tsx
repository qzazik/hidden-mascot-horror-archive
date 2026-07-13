import type { RatingConfidence, RatingSet, VerificationStatus } from '../../types';
import { calculateOverallRating, formatReviewDate, getRatingRank, getRatingCount } from '../../utils/ratings';
import { VerificationBadge } from './VerificationBadge';

type Props = { ratings: RatingSet; verificationStatus: VerificationStatus; ratingConfidence: RatingConfidence; reviewedAt?: string | null };

export function OverallRating({ ratings, verificationStatus, ratingConfidence, reviewedAt }: Props) {
  const overall = calculateOverallRating(ratings);
  const count = getRatingCount(ratings);
  const date = formatReviewDate(reviewedAt);

  if (overall === null) {
    return <section className="overall-rating overall-rating--empty panel">
      <div><span className="overall-rating__eyebrow">Оценка архива</span><h2>Игра ещё не оценена</h2><p>{count > 0 ? 'Недостаточно данных для общего рейтинга.' : 'Добавлена в очередь на проверку.'}</p></div>
      <VerificationBadge status={verificationStatus} confidence={ratingConfidence} unrated />
    </section>;
  }

  return <section className="overall-rating panel">
    <div><span className="overall-rating__eyebrow">Оценка архива</span><div className="overall-rating__score"><strong>{overall.toFixed(1)}</strong><span>/ 10</span></div></div>
    <div className="overall-rating__meta"><strong>Ранг {getRatingRank(overall)}</strong><VerificationBadge status={verificationStatus} confidence={ratingConfidence} />{date ? <span>Дата проверки: {date}</span> : null}</div>
  </section>;
}
