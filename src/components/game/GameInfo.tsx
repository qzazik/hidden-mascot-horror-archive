import type { Game } from '../../types';
import { formatDuration, getPriceLabel, statusLabel } from '../../utils/library';

type InfoItem = { label: string; value: string | null | undefined };

export function GameInfo({ game, developerName, seriesName }: { game: Game; developerName: string; seriesName?: string | null }) {
  const confirmed = (value?: string | null) => value && value !== 'Не указано' ? value : null;
  const items: InfoItem[] = [
    { label: 'Разработчик', value: developerName === 'Не указано' ? 'Разработчик не подтверждён' : developerName },
    { label: 'Серия', value: seriesName }, { label: 'Версия', value: confirmed(game.versionLabel) },
    { label: 'Рекомендуемая версия', value: confirmed(game.recommendedVersion) }, { label: 'Статус', value: statusLabel[game.status] },
    { label: 'Цена', value: game.priceType === 'unknown' ? null : getPriceLabel(game.priceType) }, { label: 'Длительность', value: game.durationMinutes ? formatDuration(game.durationMinutes) : null },
    { label: 'Языки', value: game.languages.filter((item) => item !== 'Не указано').join(', ') || null }, { label: 'Платформы', value: game.platforms.join(', ') || null },
    { label: 'Площадки', value: game.storePlatforms.join(', ') || null }, { label: 'Дата выхода', value: game.releaseDate },
    { label: 'Жанр', value: game.genre?.join(', ') || null }, { label: 'Движок', value: game.engine }, { label: 'Размер игры', value: game.gameSize },
    { label: 'Контроллер', value: game.controllerSupport === true ? 'Поддерживается' : null }
  ];
  const visible = items.filter((item) => item.value);
  return <section className="game-info panel"><div className="section-title"><h2>Информация</h2></div><dl>{visible.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl></section>;
}
