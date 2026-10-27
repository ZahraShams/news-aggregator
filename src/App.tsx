import { useState } from 'react';
import ExploreView from './components/ExploreView';
import FeedView from './components/FeedView';
import Header, { type View } from './components/Header';
import PreferencesDialog from './components/PreferencesDialog';
import PreferencesProvider from './context/PreferencesProvider';

function App() {
  const [view, setView] = useState<View>('feed');
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const openPreferences = () => setPreferencesOpen(true);

  return (
    <PreferencesProvider>
      <Header view={view} onViewChange={setView} onCustomize={openPreferences} />
      <main className="page">
        {view === 'feed' ? <FeedView onCustomize={openPreferences} /> : <ExploreView />}
      </main>
      {preferencesOpen && <PreferencesDialog onClose={() => setPreferencesOpen(false)} />}
    </PreferencesProvider>
  );
}

export default App;
