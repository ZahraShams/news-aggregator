import { sources } from '../sources/registry';
import type { SourceId } from '../types/article';
import Chip from './Chip';

interface SourcePickerProps {
  selected: SourceId[];
  onChange: (selected: SourceId[]) => void;
}

/** Sources without an API key are shown but disabled, so the user knows they exist. */
export default function SourcePicker({ selected, onChange }: SourcePickerProps) {
  function toggle(id: SourceId) {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  }

  return (
    <div className="chips">
      {sources.map((source) => (
        <Chip
          key={source.id}
          label={source.name}
          selected={source.isConfigured() && selected.includes(source.id)}
          disabled={!source.isConfigured()}
          title={source.isConfigured() ? undefined : 'No API key configured'}
          onToggle={() => toggle(source.id)}
        />
      ))}
    </div>
  );
}
