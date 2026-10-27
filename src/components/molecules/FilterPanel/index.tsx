import { useState } from 'react';
import { DATE_PRESETS, presetRange, type DatePreset } from '../../../utils/dates';
import { countActiveFilters, DEFAULT_FILTERS, type Filters } from '../../../utils/filters';
import { Chip } from '../../atoms';
import CategoryPicker from '../CategoryPicker';
import SourcePicker from '../SourcePicker';

interface FilterPanelProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export default function FilterPanel({ filters, onChange }: FilterPanelProps) {
  // Only used on small screens, where the panel is collapsed behind a button.
  const [open, setOpen] = useState(false);
  const activeCount = countActiveFilters(filters);

  function selectPreset(preset: DatePreset) {
    // A custom range keeps the dates already picked; presets replace them.
    const range = preset === 'custom' ? { from: filters.from, to: filters.to } : presetRange(preset);
    onChange({ ...filters, datePreset: preset, ...range });
  }

  return (
    <div className="filters">
      <div className="filters__bar">
        <button
          type="button"
          className="filters__toggle"
          aria-expanded={open}
          aria-controls="filter-options"
          onClick={() => setOpen(!open)}
        >
          Filters {activeCount > 0 && <span className="filters__count">{activeCount}</span>}
        </button>
        {activeCount > 0 && (
          <button type="button" className="link" onClick={() => onChange(DEFAULT_FILTERS)}>
            Clear filters
          </button>
        )}
      </div>

      <div id="filter-options" className={open ? 'filters__options filters__options--open' : 'filters__options'}>
        <fieldset>
          <legend>Category</legend>
          <CategoryPicker
            single
            selected={filters.category ? [filters.category] : []}
            onChange={([category]) => onChange({ ...filters, category })}
          />
        </fieldset>

        <fieldset>
          <legend>Date</legend>
          <div className="chips">
            {DATE_PRESETS.map((preset) => (
              <Chip
                key={preset.id}
                label={preset.label}
                selected={filters.datePreset === preset.id}
                onToggle={() => selectPreset(preset.id)}
              />
            ))}
          </div>
          {filters.datePreset === 'custom' && (
            <div className="date-range">
              <label>
                From
                <input
                  type="date"
                  value={filters.from ?? ''}
                  max={filters.to}
                  onChange={(event) => onChange({ ...filters, from: event.target.value || undefined })}
                />
              </label>
              <label>
                To
                <input
                  type="date"
                  value={filters.to ?? ''}
                  min={filters.from}
                  onChange={(event) => onChange({ ...filters, to: event.target.value || undefined })}
                />
              </label>
            </div>
          )}
        </fieldset>

        <fieldset>
          <legend>Sources</legend>
          <SourcePicker selected={filters.sources} onChange={(selected) => onChange({ ...filters, sources: selected })} />
        </fieldset>
      </div>
    </div>
  );
}
