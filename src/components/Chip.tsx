interface ChipProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
  disabled?: boolean;
  title?: string;
}

/** A toggle button used for every filter option. */
export default function Chip({ label, selected, onToggle, disabled, title }: ChipProps) {
  return (
    <button
      type="button"
      className={selected ? 'chip chip--selected' : 'chip'}
      aria-pressed={selected}
      onClick={onToggle}
      disabled={disabled}
      title={title}
    >
      {label}
    </button>
  );
}
