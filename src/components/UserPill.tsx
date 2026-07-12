type UserPillProps = {
  label: string;
  active?: boolean;
  onClick?: () => void;
};

export function UserPill({ label, active, onClick }: UserPillProps) {
  return (
    <button type="button" className={`pill ${active ? 'pill--active' : ''}`} onClick={onClick}>
      {label}
    </button>
  );
}
