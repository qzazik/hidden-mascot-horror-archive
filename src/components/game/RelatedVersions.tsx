import { Link } from 'react-router-dom';
import type { Game } from '../../types';
import { statusLabel } from '../../utils/library';

const versionBadge = (game: Game, currentSlug: string) => {
  if (game.slug === currentSlug) return 'Актуальная';
  const text = `${game.versionLabel ?? ''} ${game.title}`.toLowerCase();
  if (game.status === 'cancelled') return 'Cancelled';
  if (game.status === 'demo') return 'Демо';
  if (text.includes('classic')) return 'Classic';
  if (text.includes('old')) return 'Old';
  if (text.includes('remake')) return 'Remake';
  if (game.recommendedVersion && game.recommendedVersion !== 'Не указано') return 'Рекомендуется';
  return statusLabel[game.status];
};

export function RelatedVersions({ game, games }: { game: Game; games: Game[] }) {
  const versions = games.filter((item) => item.seriesId && item.seriesId === game.seriesId);
  if (!game.seriesId || versions.length < 2) return null;
  return <section className="related-versions panel"><div className="section-title"><h2>Версии и связанные проекты</h2></div><div className="related-versions__list">{versions.map((item) => <Link to={`/games/${item.slug}`} key={item.slug} className={item.slug === game.slug ? 'is-current' : ''}><div>{item.mainImage ? <img src={item.mainImage} alt="" loading="lazy" /> : null}<span><strong>{item.title}</strong><small>{statusLabel[item.status]}</small></span></div><span className="badge">{versionBadge(item, game.slug)}</span></Link>)}</div></section>;
}
