type Option = {
  value: string;
  label: string;
};

type ToggleGroupProps = {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
};

export function ToggleGroup({ label, value, options, onChange }: ToggleGroupProps) {
  return (
    <fieldset className="toggle-group">
      <legend>{label}</legend>
      <div className="toggle-group__items">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`toggle-group__button ${value === option.value ? 'toggle-group__button--active' : ''}`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
