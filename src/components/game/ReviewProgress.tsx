import type { ArchiveStatus, ReviewProgress as ReviewProgressData } from '../../types';
import { archiveStatusText } from '../../utils/ratings';

const labels: Record<keyof ReviewProgressData, string> = {
  storePage: 'страница игры', screenshots: 'скриншоты и изображения', trailer: 'трейлер', partialGameplay: 'часть прохождения',
  fullGameplay: 'полное прохождение', technicalState: 'техническое состояние', streamSuitability: 'потенциал для стрима'
};

export function ReviewProgress({ status, progress }: { status: ArchiveStatus; progress: ReviewProgressData }) {
  const entries = Object.entries(progress) as Array<[keyof ReviewProgressData, boolean]>;
  const done = entries.filter(([, value]) => value);
  const pending = entries.filter(([, value]) => !value);
  return <section className="review-progress panel"><div className="review-progress__head"><div><span className="overall-rating__eyebrow">Проверка игры</span><h2>{archiveStatusText[status].label}</h2><p>{archiveStatusText[status].description}</p></div><span className={`archive-badge archive-badge--${status}`}>{done.length}/{entries.length}</span></div><div className="review-progress__columns">{done.length ? <div><h3>Готово</h3><ul>{done.map(([key]) => <li key={key}><span>✓</span>{labels[key]}</li>)}</ul></div> : null}{pending.length ? <div><h3>Осталось проверить</h3><ul>{pending.map(([key]) => <li key={key}><span>·</span>{labels[key]}</li>)}</ul></div> : null}</div></section>;
}
