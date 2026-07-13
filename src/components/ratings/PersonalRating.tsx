import type { PersonalRatingData } from '../../types';
import { usePersonalRatings } from '../../hooks/usePersonalRatings';

const fields: Array<{ key: keyof PersonalRatingData; label: string }> = [
  { key: 'overall', label: 'Общая оценка' }, { key: 'gameplay', label: 'Геймплей' },
  { key: 'atmosphere', label: 'Атмосфера' }, { key: 'horror', label: 'Страшность' }, { key: 'stream', label: 'Для стрима' }
];

export function PersonalRating({ slug }: { slug: string }) {
  const { value, update, clear } = usePersonalRatings(slug);
  return <section className="personal-rating panel"><div className="section-title"><span className="badge">Личное</span><h2>Моя оценка</h2><p>Не смешивается с оценкой архива и хранится только в этом браузере.</p></div><div className="personal-rating__grid">{fields.map(({ key, label }) => <label key={key}><span>{label}</span><select value={value[key] ?? ''} onChange={(event) => update(key, event.target.value ? Number(event.target.value) : null)}><option value="">—</option>{Array.from({ length: 10 }, (_, index) => index + 1).map((number) => <option key={number} value={number}>{number}</option>)}</select></label>)}</div><button type="button" className="button button--ghost" onClick={clear}>Сбросить мою оценку</button></section>;
}
