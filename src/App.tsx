import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { OrderBookSwap } from './components/OrderBookSwap';
import { TokenList } from './pages/TokenList';
import { Navigation } from './components/Navigation';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-[url('https://static.wixstatic.com/media/c0fd9f_7a29e6d3a40f4821a14dbe8f93b9d069~mv2.jpg')] bg-cover bg-center bg-fixed">
        <div className="min-h-screen backdrop-blur-sm bg-black/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center mb-4">
              <Navigation />
              <div className="flex flex-col items-end gap-2">
                <a 
                  href="https://photonic.radiant4people.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-yellow-600/20 text-yellow-600 px-4 py-2 rounded-lg text-sm font-semibold border border-yellow-600/30 hover:bg-yellow-600/30 transition-colors"
                >
                  <img 
                    src="https://static.wixstatic.com/shapes/c0fd9f_893a3fcd86f5426eb168724c33fc2630.svg"
                    alt="Photonic"
                    className="w-5 h-5"
                  />
                  Photonic Wallet
                </a>
                <div className="bg-red-600/20 text-red-500 px-3 py-1 rounded-full text-sm font-semibold border border-red-500/30">
                  TEST PHASE
                </div>
              </div>
            </div>
          </div>
          <Routes>
            <Route path="/" element={<OrderBookSwap />} />
            <Route path="/tokens" element={<TokenList />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;