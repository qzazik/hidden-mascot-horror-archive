import type { Game } from '../../types';
import { GameCard } from '../GameCard';
import { useNavigate } from 'react-router-dom';

const featureKeys = (game: Game) => Object.entries(game.features).filter(([, value]) => value).map(([key]) => key);

export function SimilarGames({ game, games }: { game: Game; games: Game[] }) {
  const navigate = useNavigate();
  const explicit = new Set(game.similarGameIds);
  const currentFeatures = featureKeys(game);
  const ranked = games.filter((item) => item.id !== game.id).map((item) => {
    let score = explicit.has(item.id) ? 20 : 0;
    score += item.tags.filter((tag) => game.tags.includes(tag)).length * 4;
    score += featureKeys(item).filter((key) => currentFeatures.includes(key)).length * 2;
    if (item.type === game.type) score += 2;
    if (item.fanUniverse === game.fanUniverse) score += 1;
    if (item.developerId === game.developerId && game.developerId !== 'unknown') score += 4;
    return { item, score };
  }).filter(({ score }) => score > 0).sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title, 'ru')).slice(0, 6).map(({ item }) => item);
  if (!ranked.length) return null;
  const randomSimilar = () => navigate(`/games/${ranked[Math.floor(Math.random() * ranked.length)].slug}`);
  return <section className="similar-games"><div className="similar-games__head"><div className="section-title"><h2>Похожие игры</h2></div><button type="button" className="button button--primary" onClick={randomSimilar}>Выбрать похожую случайную игру</button></div><div className="grid grid--cards similar-games__grid">{ranked.map((item) => <GameCard game={item} compact key={item.slug} />)}</div></section>;
}
