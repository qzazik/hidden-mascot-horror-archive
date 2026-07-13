type RatingBarProps = { label: string; value: number };

export function RatingBar({ label, value }: RatingBarProps) {
  const safeValue = Math.max(0, Math.min(10, value));
  return (
    <div className="rating-bar">
      <div className="rating-bar__label"><span>{label}</span><strong>{safeValue.toFixed(1)}</strong></div>
      <div className="rating-bar__track" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={10} aria-valuenow={safeValue}>
        <span style={{ '--rating-width': `${safeValue * 10}%` } as React.CSSProperties} />
      </div>
    </div>
  );
}
