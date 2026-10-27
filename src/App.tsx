import { useState } from 'react';
import ExploreView from './components/ExploreView';
import FeedView from './components/FeedView';
import Header, { type View } from './components/Header';

function App() {
  const [view, setView] = useState<View>('feed');

  return (
    <>
      <Header view={view} onViewChange={setView} />
      <main className="page">{view === 'feed' ? <FeedView /> : <ExploreView />}</main>
    </>
  );
}

export default App;
