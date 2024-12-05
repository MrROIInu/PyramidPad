import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { OrderBookSwap } from './components/OrderBookSwap';
import { TokenList } from './pages/TokenList';
import { Navigation } from './components/Navigation';
import { GlyphSwapLogo } from './components/GlyphSwapLogo';
import { LatestOrders } from './pages/LatestOrders';
import { MyOrders } from './pages/MyOrders';
import { Bubbles } from './pages/Bubbles';
import { RadiantHeader } from './components/RadiantHeader';
import { LatestActivity } from './components/activity/LatestActivity';
import { TopGainers } from './components/TopGainers';
import { SwapProvider } from './contexts/SwapContext';
import { Footer } from './components/Footer';

const App: React.FC = () => {
  return (
    <SwapProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <RadiantHeader />
          <div className="flex-grow">
            <div className="container mx-auto px-4 py-4">
              <div className="flex justify-between items-center mb-4">
                <Navigation />
              </div>
            </div>
            <Routes>
              <Route path="/" element={
                <div className="container mx-auto px-4">
                  <GlyphSwapLogo />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <LatestActivity />
                    <TopGainers />
                  </div>
                  <OrderBookSwap />
                </div>
              } />
              <Route path="/tokens" element={<TokenList />} />
              <Route path="/bubbles" element={<Bubbles />} />
              <Route path="/latest" element={<LatestOrders />} />
              <Route path="/my-orders" element={<MyOrders />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </SwapProvider>
  );
};

export default App;