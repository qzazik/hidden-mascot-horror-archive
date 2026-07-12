type TagProps = {
  label: string;
  removable?: boolean;
  onRemove?: () => void;
};

export function Tag({ label, removable, onRemove }: TagProps) {
  return (
    <span className={`tag ${removable ? 'tag--removable' : ''}`}>
      {label}
      {removable ? (
        <button type="button" className="tag__remove" onClick={onRemove} aria-label={`Удалить фильтр ${label}`}>
          ×
        </button>
      ) : null}
    </span>
  );
}
