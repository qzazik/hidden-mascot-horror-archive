import type { RatingConfidence, RatingSet, VerificationStatus } from '../../types';
import { calculateOverallRating, formatReviewDate, getRatingRank, getRatingCount } from '../../utils/ratings';
import { VerificationBadge } from './VerificationBadge';
import { Link } from 'react-router-dom';
import type { ArchiveStatus } from '../../types';
import { archiveStatusText } from '../../utils/ratings';

type Props = { ratings: RatingSet; verificationStatus: VerificationStatus; ratingConfidence: RatingConfidence; reviewedAt?: string | null; gameSlug?: string; archiveStatus?: ArchiveStatus };

export function OverallRating({ ratings, verificationStatus, ratingConfidence, reviewedAt, gameSlug, archiveStatus }: Props) {
  const overall = calculateOverallRating(ratings);
  const count = getRatingCount(ratings);
  const date = formatReviewDate(reviewedAt);

  if (overall === null) {
    return <section className="overall-rating overall-rating--empty panel">
      <div><span className="overall-rating__eyebrow">Оценка архива</span><h2>Игра ещё не получила редакционную оценку</h2><p>{count > 0 ? 'Недостаточно данных для общего рейтинга.' : archiveStatus ? archiveStatusText[archiveStatus].description : 'Добавлена в очередь на проверку.'}</p>{gameSlug ? <Link className="button button--primary overall-rating__action" to={`/admin/ratings?game=${gameSlug}`}>Оценить игру</Link> : null}</div>
      <div className="overall-rating__empty-status"><span className="game-score-tile game-score-tile--empty"><strong>—</strong><span>Без оценки</span></span><VerificationBadge status={verificationStatus} confidence={ratingConfidence} unrated /></div>
    </section>;
  }

  return <section className="overall-rating panel">
    <div><span className="overall-rating__eyebrow">Оценка архива</span><div className="overall-rating__score"><strong>{overall.toFixed(1)}</strong><span>/ 10</span></div></div>
    <div className="overall-rating__meta"><strong>Ранг {getRatingRank(overall)}</strong><VerificationBadge status={verificationStatus} confidence={ratingConfidence} />{date ? <span>Дата проверки: {date}</span> : null}</div>
  </section>;
}
