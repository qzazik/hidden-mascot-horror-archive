type StatCardProps = {
  label: string;
  value: string | number;
  tone?: 'default' | 'red' | 'blue' | 'green';
};

export function StatCard({ label, value, tone = 'default' }: StatCardProps) {
  return (
    <article className={`stat-card stat-card--${tone}`}>
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  );
}
