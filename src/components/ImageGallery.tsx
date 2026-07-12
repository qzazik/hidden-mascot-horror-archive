type ImageGalleryProps = {
  images: string[];
  title: string;
};

export function ImageGallery({ images, title }: ImageGalleryProps) {
  if (images.length === 0) {
    return <p className="empty-state">Галерея пока не заполнена.</p>;
  }

  return (
    <div className="gallery">
      {images.map((src, index) => (
        <figure key={src} className="gallery__item">
          <img src={src} alt={`${title} - изображение ${index + 1}`} loading="lazy" />
        </figure>
      ))}
    </div>
  );
}
