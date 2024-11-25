import React from 'react';
import { GlyphSwap } from './components/GlyphSwap';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[url('https://static.wixstatic.com/media/c0fd9f_7a29e6d3a40f4821a14dbe8f93b9d069~mv2.jpg')] bg-cover bg-center bg-fixed">
      <div className="min-h-screen backdrop-blur-sm bg-black/50">
        <GlyphSwap />
      </div>
    </div>
  );
};

export default App;