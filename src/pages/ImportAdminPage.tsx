import { useEffect, useMemo, useState } from 'react';

type ImportDecision = 'recommended' | 'experimental' | 'needs_review' | 'duplicate' | 'rejected' | 'unavailable';
type AdminAction = 'approved' | 'experimental' | 'merged' | 'pending' | 'rejected';

type ImportGame = {
  title: string;
  proposedSlug: string;
  decision: ImportDecision;
  sourceUrl: string | null;
  sourceStatus: string | null;
  sourcePrice: string | null;
  sourceDuration: string | null;
  comment: string | null;
  legacyRatings: { streamPotential: number | null; clipsPotential: number | null; source: string };
  existingMatch: { slug: string; title: string } | null;
  possibleDuplicates: string[];
  images: { cover: string | null; hero: string | null; gallery: string[]; matchedCount: number };
  warnings: string[];
  curationReason: string | null;
  [key: string]: unknown;
};

type ImportReport = {
  generatedAt: string;
  sourceFile: string;
  summary: Record<string, number>;
  uncertain: Array<{ title: string }>;
};

const tabs: Array<{ id: ImportDecision; label: string }> = [
  { id: 'recommended', label: 'Рекомендуемые' },
  { id: 'experimental', label: 'Экспериментальные' },
  { id: 'needs_review', label: 'Требуют проверки' },
  { id: 'duplicate', label: 'Дубликаты' },
  { id: 'rejected', label: 'Отклонённые' },
  { id: 'unavailable', label: 'Недоступные' }
];

const storageKey = 'hmha:import-decisions:v1';
const labelForAction: Record<AdminAction, string> = {
  approved: 'Добавить', experimental: 'Добавить как экспериментальную', merged: 'Объединить', pending: 'Оставить на проверку', rejected: 'Отклонить'
};

const downloadJson = (filename: string, value: unknown) => {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export function ImportAdminPage() {
  const [games, setGames] = useState<ImportGame[]>([]);
  const [report, setReport] = useState<ImportReport | null>(null);
  const [activeTab, setActiveTab] = useState<ImportDecision>('needs_review');
  const [error, setError] = useState('');
  const [decisions, setDecisions] = useState<Record<string, AdminAction>>(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) ?? '{}'); } catch { return {}; }
  });

  useEffect(() => {
    const importBase = `${import.meta.env.BASE_URL}data-import`;
    Promise.all([
      fetch(`${importBase}/imported-games.json`).then((response) => {
        if (!response.ok) throw new Error('Сначала запустите npm run import:games');
        return response.json() as Promise<ImportGame[]>;
      }),
      fetch(`${importBase}/import-report.json`).then((response) => response.json() as Promise<ImportReport>)
    ]).then(([items, importReport]) => { setGames(items); setReport(importReport); }).catch((reason: Error) => setError(reason.message));
  }, []);

  const setDecision = (slug: string, action: AdminAction) => {
    const next = { ...decisions, [slug]: action };
    setDecisions(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };
  const visible = useMemo(() => games.filter((game) => game.decision === activeTab), [activeTab, games]);
  const selected = (actions: AdminAction[]) => games
    .filter((game) => actions.includes(decisions[game.proposedSlug]))
    .map((game) => {
      const adminDecision = decisions[game.proposedSlug];
      const type = game.type === 'fan_game' ? 'fan_game' : null;
      const upcoming = game.status === 'in_development' ? 'upcoming' : null;
      const short = /(коротк|минут)/i.test(String(game.sourceDuration ?? '')) ? 'short_horror' : null;
      const contentCategory = adminDecision === 'experimental' ? 'experimental' : type ?? upcoming ?? short ?? 'hidden_gem';
      const curationStatus = adminDecision === 'experimental' ? 'experimental' : adminDecision === 'approved' ? 'approved' : adminDecision === 'rejected' ? 'rejected' : 'pending';

      return { ...game, adminDecision, contentCategory, curationStatus, needsManualReview: curationStatus === 'pending' };
    });

  return (
    <div className="container import-admin">
      <header className="import-admin__header">
        <div><span className="badge badge--accent">Скрытая страница</span><h1>Проверка Excel-импорта</h1><p>Решения хранятся локально и не меняют публичный каталог.</p></div>
        {report ? <p className="import-admin__date">Отчёт: {new Date(report.generatedAt).toLocaleString('ru-RU')}</p> : null}
      </header>

      {error ? <div className="empty-state panel"><h3>Данные импорта не найдены</h3><p>{error}</p></div> : null}
      {report ? <div className="import-admin__summary panel">{Object.entries(report.summary).map(([key, value]) => <div key={key}><strong>{value}</strong><span>{key}</span></div>)}</div> : null}

      <div className="import-admin__exports panel">
        <button className="button button--primary" onClick={() => downloadJson('approved-games.json', selected(['approved', 'experimental']))}>Экспортировать подтверждённые игры</button>
        <button className="button button--ghost" onClick={() => downloadJson('review-queue.json', selected(['pending']))}>Экспортировать очередь проверки</button>
        <button className="button button--ghost" onClick={() => downloadJson('rejected-games.json', selected(['rejected']))}>Экспортировать отклонённые</button>
        <button className="button button--ghost" disabled={!report} onClick={() => downloadJson('full-import-report.json', { report, games, decisions })}>Скачать полный отчёт</button>
      </div>

      <div className="import-admin__tabs" role="tablist">{tabs.map((tab) => <button key={tab.id} className={`button ${activeTab === tab.id ? 'button--primary' : 'button--ghost'}`} onClick={() => setActiveTab(tab.id)}>{tab.label} ({games.filter((game) => game.decision === tab.id).length})</button>)}</div>
      <div className="import-admin__list">
        {visible.map((game) => {
          const images = [game.images.cover, game.images.hero, ...game.images.gallery].filter((image): image is string => Boolean(image)).slice(0, 5);
          return <article className="import-card panel" key={`${game.proposedSlug}-${game.sourceUrl}`}>
            <div className="import-card__head"><div><span className="badge">{game.decision}</span><h2>{game.title}</h2><code>{game.proposedSlug}</code></div>{decisions[game.proposedSlug] ? <span className="badge badge--good">Решение: {labelForAction[decisions[game.proposedSlug]]}</span> : null}</div>
            {images.length ? <div className="import-card__images">{images.map((image) => <img src={image} alt="" key={image} loading="lazy" />)}</div> : <p className="empty-state">Изображения не сопоставлены</p>}
            <dl className="import-card__grid"><div><dt>Данные Excel</dt><dd>{[game.sourceStatus, game.sourcePrice, game.sourceDuration].filter(Boolean).join(' · ') || 'Не указано'}</dd></div><div><dt>Старая предварительная оценка</dt><dd>Стрим: {game.legacyRatings.streamPotential ?? '—'}/10 · клипы: {game.legacyRatings.clipsPotential ?? '—'}/10</dd></div><div><dt>Найденная игра</dt><dd>{game.existingMatch?.title ?? 'Нет'}</dd></div><div><dt>Возможные дубликаты</dt><dd>{game.possibleDuplicates.join(', ') || 'Нет'}</dd></div></dl>
            {game.comment ? <p>{game.comment}</p> : null}<p className="import-card__reason"><strong>Причина:</strong> {game.curationReason ?? 'Требует проверки'}</p>{game.warnings.length ? <ul>{game.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul> : null}
            {game.sourceUrl ? <a href={game.sourceUrl} target="_blank" rel="noreferrer" className="button button--ghost">Открыть страницу</a> : null}
            <div className="import-card__actions">{(Object.keys(labelForAction) as AdminAction[]).map((action) => <button key={action} className={`button ${decisions[game.proposedSlug] === action ? 'button--primary' : 'button--ghost'}`} onClick={() => setDecision(game.proposedSlug, action)}>{labelForAction[action]}</button>)}</div>
          </article>;
        })}
        {!error && visible.length === 0 ? <div className="empty-state panel">В этой категории нет записей.</div> : null}
      </div>
    </div>
  );
}
