import type { RatingConfidence, VerificationStatus } from '../../types';
import { confidenceText, verificationText } from '../../utils/ratings';

export function VerificationBadge({ status, confidence, unrated = false }: { status: VerificationStatus; confidence: RatingConfidence; unrated?: boolean }) {
  const label = unrated ? verificationText[status] : confidence === 'low' ? confidenceText.low : confidence === 'high' ? confidenceText.high : verificationText[status];
  return <span className={`verification-badge verification-badge--${confidence}`}>{label}</span>;
}
