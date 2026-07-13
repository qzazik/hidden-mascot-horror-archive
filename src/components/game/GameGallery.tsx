import { useEffect, useState } from 'react';

export function GameGallery({ images, title }: { images: string[]; title: string }) {
  const unique = [...new Set(images)];
  const [selected, setSelected] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const move = (direction: number) => setSelected((current) => (current + direction + unique.length) % unique.length);

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setFullscreen(false); if (event.key === 'ArrowLeft') move(-1); if (event.key === 'ArrowRight') move(1); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fullscreen, unique.length]);

  if (!unique.length) return null;
  return <section className="game-gallery panel"><div className="game-gallery__head"><div className="section-title"><h2>Галерея</h2></div><span>{selected + 1} / {unique.length}</span></div><button type="button" className="game-gallery__stage" onClick={() => setFullscreen(true)}><img src={unique[selected]} alt={`${title}, изображение ${selected + 1}`} /></button>{unique.length > 1 ? <div className="game-gallery__controls"><button type="button" className="button button--ghost" onClick={() => move(-1)} aria-label="Предыдущее изображение">←</button><div className="game-gallery__thumbs">{unique.map((image, index) => <button type="button" className={selected === index ? 'is-active' : ''} onClick={() => setSelected(index)} key={image}><img src={image} alt="" loading="lazy" /></button>)}</div><button type="button" className="button button--ghost" onClick={() => move(1)} aria-label="Следующее изображение">→</button></div> : null}{fullscreen ? <div className="game-gallery__lightbox" role="dialog" aria-modal="true" aria-label={`Галерея ${title}`}><button type="button" className="game-gallery__close" onClick={() => setFullscreen(false)} aria-label="Закрыть">×</button><button type="button" onClick={() => move(-1)} aria-label="Назад">←</button><img src={unique[selected]} alt={`${title}, изображение ${selected + 1}`} /><button type="button" onClick={() => move(1)} aria-label="Вперёд">→</button></div> : null}</section>;
}
