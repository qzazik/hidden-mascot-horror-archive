import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { EditorialRatingData, Game, RatingConfidence, VerificationStatus } from '../types';
import { games } from '../data/library';
import { useLocalStorageState } from '../hooks/useLocalStorage';
import { allRatingCriteria, calculateOverallRating, emptyRatingSet, getRatingRank, normalizeRatingSet, ratingGroups } from '../utils/ratings';
import { editorialStorageKey } from './GameDetailsPage';
import { OverallRating } from '../components/ratings/OverallRating';
import { RatingBreakdown } from '../components/ratings/RatingBreakdown';

const toLines = (items: string[]) => items.join('\n');
const fromLines = (value: string) => value.split('\n').map((item) => item.trim()).filter(Boolean);
const makeDraft = (game: Game, override?: EditorialRatingData): EditorialRatingData => override ?? {
  ratings: normalizeRatingSet(game.ratings), ratingSummary: game.ratingSummary ?? null, strengths: game.strengths ?? [], weaknesses: game.weaknesses ?? [], recommendedFor: game.recommendedFor ?? [], streamVerdict: game.streamVerdict ?? null,
  verificationStatus: game.verificationStatus, ratingConfidence: game.ratingConfidence, reviewedAt: game.lastChecked
};

const download = (data: unknown) => {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = 'ratings.json'; link.click(); URL.revokeObjectURL(url);
};

export function AdminRatingsPage() {
  const [params] = useSearchParams();
  const [records, setRecords] = useLocalStorageState<Record<string, EditorialRatingData>>(editorialStorageKey, {});
  const initialSlug = params.get('game') && games.some((game) => game.slug === params.get('game')) ? params.get('game') as string : games[0]?.slug ?? '';
  const [selectedSlug, setSelectedSlug] = useState(initialSlug);
  const selectedGame = games.find((game) => game.slug === selectedSlug) ?? games[0];
  const [draft, setDraft] = useState<EditorialRatingData>(() => makeDraft(selectedGame, records[selectedGame.slug]));
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unrated' | 'medium' | 'high'>('all');
  const [message, setMessage] = useState('');
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => setDraft(makeDraft(selectedGame, records[selectedGame.slug])), [selectedGame.slug]);
  const overall = calculateOverallRating(draft.ratings);
  const filteredGames = useMemo(() => games.filter((game) => {
    const current = records[game.slug] ?? makeDraft(game);
    if (!game.title.toLowerCase().includes(query.toLowerCase())) return false;
    if (filter === 'unrated' && calculateOverallRating(current.ratings) !== null) return false;
    if (filter === 'medium' && current.ratingConfidence !== 'medium') return false;
    if (filter === 'high' && current.ratingConfidence !== 'high') return false;
    return true;
  }), [filter, query, records]);

  const updateCriterion = (key: (typeof allRatingCriteria)[number]['key'], value: number | null) => setDraft((current) => ({ ...current, ratings: { ...current.ratings, [key]: value, overall: null } }));
  const save = () => {
    const next = { ...draft, ratings: { ...draft.ratings, overall }, reviewedAt: draft.reviewedAt || new Date().toISOString().slice(0, 10) };
    setRecords((current) => ({ ...current, [selectedGame.slug]: next })); setDraft(next); setMessage('Оценка сохранена локально. Для пубикации экспортируйте JSON.');
  };
  const importFile = async (file?: File) => {
    if (!file) return;
    try { const parsed = JSON.parse(await file.text()) as Record<string, EditorialRatingData>; setRecords(parsed); setMessage(`Импортировано записей: ${Object.keys(parsed).length}.`); }
    catch { setMessage('Не удалось прочитать ratings.json.'); }
  };
  const copyGame = async () => {
    await navigator.clipboard.writeText(JSON.stringify({ ...selectedGame, ...draft, ratings: { ...draft.ratings, overall } }, null, 2)); setMessage('Объект игры скопирован.');
  };

  return <div className="container ratings-admin">
    <header className="ratings-admin__header"><div><span className="badge badge--accent">Скрытая страница</span><h1>Редакционные оценки</h1><p>Локальное сохранение не обновляет публичный сайт. Экспортируйте `ratings.json`, добавьте его в проект и выполните git push.</p></div></header>
    <div className="ratings-admin__toolbar panel"><button className="button button--primary" onClick={save}>Сохранить локально</button><button className="button button--ghost" onClick={() => download(records)}>Экспортировать ratings.json</button><button className="button button--ghost" onClick={() => importRef.current?.click()}>Импортировать ratings.json</button><input ref={importRef} hidden type="file" accept="application/json,.json" onChange={(event) => importFile(event.target.files?.[0])} /><button className="button button--ghost" onClick={copyGame}>Скопировать объект игры</button><Link className="button button--ghost" to={`/games/${selectedGame.slug}`} target="_blank">Предварительный просмотр</Link></div>
    {message ? <p className="ratings-admin__message">{message}</p> : null}
    <div className="ratings-admin__layout">
      <aside className="ratings-admin__games panel"><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск игры" /><select value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)}><option value="all">Все игры</option><option value="unrated">Без оценки</option><option value="medium">Частично проверено</option><option value="high">Проверено</option></select><div className="ratings-admin__game-list">{filteredGames.map((game) => { const value = records[game.slug] ?? makeDraft(game); const rating = calculateOverallRating(value.ratings); return <button type="button" className={game.slug === selectedGame.slug ? 'is-active' : ''} onClick={() => setSelectedSlug(game.slug)} key={game.slug}><span><strong>{game.title}</strong><small>{rating === null ? 'Без оценки' : `${rating.toFixed(1)} · ${getRatingRank(rating)}`}</small></span><span className="badge">{value.ratingConfidence}</span></button>; })}</div></aside>
      <main className="ratings-admin__editor">
        <div className="ratings-admin__title panel"><div><span className="badge">{selectedGame.slug}</span><h2>{selectedGame.title}</h2></div><div><strong>{overall === null ? 'Недостаточно данных' : `${overall.toFixed(1)} / 10`}</strong><span>Ранг {getRatingRank(overall)}</span></div></div>
        <section className="ratings-admin__criteria panel"><h2>Критерии</h2>{ratingGroups.map((group) => <div className="ratings-admin__group" key={group.title}><h3>{group.title}</h3><div>{group.criteria.map(({ key, label }) => <label key={key}><span>{label}</span><input type="number" min="0" max="10" step="0.1" value={draft.ratings[key] ?? ''} onChange={(event) => updateCriterion(key, event.target.value === '' ? null : Math.max(0, Math.min(10, Number(event.target.value))))} /><button type="button" onClick={() => updateCriterion(key, null)} aria-label={`Очистить ${label}`}>×</button></label>)}</div></div>)}</section>
        <section className="ratings-admin__metadata panel"><h2>Вердикт и проверка</h2><label><span>Краткий вывод</span><textarea value={draft.ratingSummary ?? ''} onChange={(event) => setDraft({ ...draft, ratingSummary: event.target.value || null })} /></label><div className="ratings-admin__text-grid"><label><span>Сильные стороны, по одной на строку</span><textarea value={toLines(draft.strengths)} onChange={(event) => setDraft({ ...draft, strengths: fromLines(event.target.value) })} /></label><label><span>Слабые стороны</span><textarea value={toLines(draft.weaknesses)} onChange={(event) => setDraft({ ...draft, weaknesses: fromLines(event.target.value) })} /></label><label><span>Кому рекомендуется</span><textarea value={toLines(draft.recommendedFor)} onChange={(event) => setDraft({ ...draft, recommendedFor: fromLines(event.target.value) })} /></label><label><span>Вердикт для стрима</span><textarea value={draft.streamVerdict ?? ''} onChange={(event) => setDraft({ ...draft, streamVerdict: event.target.value || null })} /></label></div><div className="ratings-admin__selects"><label><span>Статус проверки</span><select value={draft.verificationStatus} onChange={(event) => setDraft({ ...draft, verificationStatus: event.target.value as VerificationStatus })}><option value="unverified">Не проверено</option><option value="partially_verified">Частично проверено</option><option value="verified">Проверено</option></select></label><label><span>Confidence</span><select value={draft.ratingConfidence} onChange={(event) => setDraft({ ...draft, ratingConfidence: event.target.value as RatingConfidence })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label><label><span>Дата проверки</span><input type="date" value={draft.reviewedAt?.slice(0, 10) ?? ''} onChange={(event) => setDraft({ ...draft, reviewedAt: event.target.value || null })} /></label></div></section>
        <div className="ratings-admin__preview"><OverallRating ratings={draft.ratings} verificationStatus={draft.verificationStatus} ratingConfidence={draft.ratingConfidence} reviewedAt={draft.reviewedAt} /><RatingBreakdown ratings={draft.ratings} /></div>
      </main>
    </div>
  </div>;
}
