import type { Game } from '../../types';

export function GameVerdict({ game }: { game: Game }) {
  const hasData = Boolean(game.ratingSummary || game.streamVerdict || game.strengths?.length || game.weaknesses?.length || game.recommendedFor?.length);
  if (!hasData) return null;
  const list = (title: string, items?: string[]) => items?.length ? <div><h3>{title}</h3><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></div> : null;
  return <section className="game-verdict panel"><div className="section-title"><span className="badge badge--accent">Редакция</span><h2>Вердикт архива</h2></div>{game.ratingSummary ? <p className="game-verdict__summary">{game.ratingSummary}</p> : null}<div className="game-verdict__columns">{list('Сильные стороны', game.strengths)}{list('Слабые стороны', game.weaknesses)}{list('Кому подойдёт', game.recommendedFor)}</div>{game.streamVerdict ? <p className="game-verdict__stream"><strong>Вердикт для стрима:</strong> {game.streamVerdict}</p> : null}</section>;
}
