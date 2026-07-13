import { useState } from 'react';
import type { PersonalRatingData } from '../../types';
import { usePersonalRatings } from '../../hooks/usePersonalRatings';

const fields: Array<{ key: keyof PersonalRatingData; label: string }> = [
  { key: 'overall', label: 'Общая оценка' }, { key: 'gameplay', label: 'Геймплей' },
  { key: 'atmosphere', label: 'Атмосфера' }, { key: 'horror', label: 'Страшность' }, { key: 'stream', label: 'Для стрима' }
];

export function PersonalRating({ slug }: { slug: string }) {
  const { value, save, clear } = usePersonalRatings(slug);
  const hasSaved = Object.values(value).some((item) => item !== null);
  const [editing, setEditing] = useState(!hasSaved);
  const [draft, setDraft] = useState(value);

  const reset = () => { clear(); setDraft({ overall: null, gameplay: null, atmosphere: null, horror: null, stream: null }); setEditing(true); };
  return <section className="personal-rating panel"><div className="section-title"><span className="badge">Личное</span><h2>Моя оценка</h2><p>Хранится только в этом браузере и не влияет на оценку архива.</p></div>{!editing && hasSaved ? <div className="personal-rating__saved">{fields.filter(({ key }) => value[key] !== null).map(({ key, label }) => <div key={key}><span>{label}</span><strong>{value[key]}/10</strong></div>)}<div className="personal-rating__actions"><button className="button button--primary" type="button" onClick={() => { setDraft(value); setEditing(true); }}>Изменить</button><button className="button button--ghost" type="button" onClick={reset}>Сбросить</button></div></div> : <><div className="personal-rating__scales">{fields.map(({ key, label }) => <div key={key}><span>{label}</span><div>{Array.from({ length: 10 }, (_, index) => index + 1).map((number) => <button type="button" className={draft[key] === number ? 'is-active' : ''} onClick={() => setDraft({ ...draft, [key]: number })} key={number}>{number}</button>)}</div></div>)}</div><div className="personal-rating__actions"><button type="button" className="button button--primary" onClick={() => { save(draft); setEditing(false); }}>Сохранить</button>{hasSaved ? <button type="button" className="button button--ghost" onClick={() => setEditing(false)}>Отмена</button> : null}<button type="button" className="button button--ghost" onClick={reset}>Сбросить</button></div></>}</section>;
}
