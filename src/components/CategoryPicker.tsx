import { CATEGORIES, type Category } from '../types/article';
import { capitalize } from '../utils/format';
import Chip from './Chip';

interface CategoryPickerProps {
  selected: Category[];
  onChange: (selected: Category[]) => void;
  /** Allow only one category, with an "All" option to clear it. */
  single?: boolean;
}

export default function CategoryPicker({ selected, onChange, single = false }: CategoryPickerProps) {
  function toggle(category: Category) {
    if (selected.includes(category)) onChange(selected.filter((c) => c !== category));
    else onChange(single ? [category] : [...selected, category]);
  }

  return (
    <div className="chips">
      {single && <Chip label="All" selected={selected.length === 0} onToggle={() => onChange([])} />}
      {CATEGORIES.map((category) => (
        <Chip
          key={category}
          label={capitalize(category)}
          selected={selected.includes(category)}
          onToggle={() => toggle(category)}
        />
      ))}
    </div>
  );
}
