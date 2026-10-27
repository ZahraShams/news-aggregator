interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <form className="search" role="search" onSubmit={(event) => event.preventDefault()}>
      <input
        type="search"
        placeholder="Search articles…"
        aria-label="Search articles"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {value && (
        <button type="button" className="search__clear" aria-label="Clear search" onClick={() => onChange('')}>
          ×
        </button>
      )}
    </form>
  );
}
