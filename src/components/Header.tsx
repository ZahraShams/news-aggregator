export type View = 'feed' | 'explore';

const TABS: { id: View; label: string }[] = [
  { id: 'feed', label: 'For you' },
  { id: 'explore', label: 'Explore' },
];

interface HeaderProps {
  view: View;
  onViewChange: (view: View) => void;
  onCustomize: () => void;
}

export default function Header({ view, onViewChange, onCustomize }: HeaderProps) {
  return (
    <header className="header">
      <span className="header__title">News Aggregator</span>
      <nav className="tabs" aria-label="Views">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={view === tab.id ? 'tab tab--active' : 'tab'}
            aria-current={view === tab.id ? 'page' : undefined}
            onClick={() => onViewChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <button type="button" className="header__customize" onClick={onCustomize}>
        Customize feed
      </button>
    </header>
  );
}
