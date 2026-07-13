import type { FeatureSet } from '../../types';

const labels: Record<keyof FeatureSet, string> = { openWorld: 'Открытая карта', chase: 'Погони', puzzles: 'Головоломки', stealth: 'Стелс', weapon: 'Оружие', inventory: 'Инвентарь', multipleEnemies: 'Несколько врагов', bosses: 'Боссы', coOp: 'Кооператив', russianLanguage: 'Русский язык', saves: 'Сохранения', oneStream: 'Можно пройти за один стрим' };

export function GameFeatures({ features, tags }: { features: FeatureSet; tags: string[] }) {
  const active = (Object.keys(labels) as Array<keyof FeatureSet>).filter((key) => features[key]);
  if (!active.length && !tags.length) return null;
  return <section className="game-features panel"><div className="section-title"><h2>Особенности</h2></div><div className="game-features__tags">{active.map((key) => <span className="tag tag--feature" key={key}>{labels[key]}</span>)}{tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div></section>;
}
