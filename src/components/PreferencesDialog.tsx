import { useEffect, useRef, useState, type FormEvent } from 'react';
import { DEFAULT_PREFERENCES, type Preferences } from '../context/preferencesContext';
import { usePreferences } from '../hooks/usePreferences';
import { normalizeAuthor } from '../utils/format';
import CategoryPicker from './CategoryPicker';
import SourcePicker from './SourcePicker';

interface PreferencesDialogProps {
  onClose: () => void;
}

/**
 * Edits a draft copy of the preferences, so Cancel throws changes away.
 * The parent mounts it only while open, which gives every opening a fresh draft.
 */
export default function PreferencesDialog({ onClose }: PreferencesDialogProps) {
  const { preferences, setPreferences } = usePreferences();
  const [draft, setDraft] = useState<Preferences>(preferences);
  const [authorInput, setAuthorInput] = useState('');
  const dialogRef = useRef<HTMLDialogElement>(null);

  // showModal() traps focus inside the dialog and closes it on Escape.
  useEffect(() => dialogRef.current?.showModal(), []);

  function addAuthor(event: FormEvent) {
    event.preventDefault();
    const name = authorInput.trim();
    const exists = draft.authors.some((author) => normalizeAuthor(author) === normalizeAuthor(name));
    if (name && !exists) setDraft({ ...draft, authors: [...draft.authors, name] });
    setAuthorInput('');
  }

  function removeAuthor(name: string) {
    setDraft({ ...draft, authors: draft.authors.filter((author) => author !== name) });
  }

  function save() {
    setPreferences(draft);
    onClose();
  }

  return (
    <dialog ref={dialogRef} className="dialog" aria-labelledby="preferences-title" onClose={onClose}>
      <header className="dialog__header">
        <h2 id="preferences-title">Customize your feed</h2>
        <button type="button" className="icon-button" aria-label="Close" onClick={onClose}>
          ×
        </button>
      </header>

      <div className="dialog__body">
        <fieldset>
          <legend>Sources</legend>
          <SourcePicker selected={draft.sources} onChange={(selected) => setDraft({ ...draft, sources: selected })} />
        </fieldset>

        <fieldset>
          <legend>Categories</legend>
          <p className="hint">Leave empty to see top stories.</p>
          <CategoryPicker
            selected={draft.categories}
            onChange={(categories) => setDraft({ ...draft, categories })}
          />
        </fieldset>

        <fieldset>
          <legend>Authors</legend>
          <p className="hint">Articles by these authors are highlighted and shown first.</p>
          <form className="author-form" onSubmit={addAuthor}>
            <input
              type="text"
              placeholder="Author name"
              aria-label="Author name"
              value={authorInput}
              onChange={(event) => setAuthorInput(event.target.value)}
            />
            <button type="submit" disabled={!authorInput.trim()}>
              Add
            </button>
          </form>
          {draft.authors.length > 0 && (
            <ul className="tags">
              {draft.authors.map((author) => (
                <li key={author} className="tag">
                  {author}
                  <button type="button" aria-label={`Remove ${author}`} onClick={() => removeAuthor(author)}>
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </fieldset>
      </div>

      <footer className="dialog__footer">
        <button type="button" className="link" onClick={() => setDraft(DEFAULT_PREFERENCES)}>
          Reset
        </button>
        <div className="dialog__actions">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="button--primary" onClick={save}>
            Save
          </button>
        </div>
      </footer>
    </dialog>
  );
}
