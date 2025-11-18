import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import PlayerManagement from './pages/PlayerManagement';
import './App.css';

type CurrentPage = 'dashboard' | 'players';

function App() {
  const [currentPage, setCurrentPage] = useState<CurrentPage>('dashboard');

  useEffect(() => {
    // Simple hash-based routing
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove the # symbol
      if (hash === '/players') {
        setCurrentPage('players');
      } else {
        setCurrentPage('dashboard');
      }
    };

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    // Check initial hash
    handleHashChange();
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigation = (page: CurrentPage) => {
    if (page === 'dashboard') {
      window.location.hash = '';
    } else {
      window.location.hash = `/${page}`;
    }
    setCurrentPage(page);
  };

  return (
    <div className="app">
      {/* Navigation */}
      <nav className="app-nav">
        <div className="nav-container">
          <div className="nav-brand">
            <span className="brand-icon">⚽</span>
            <span className="brand-text">Soccer Team Maker</span>
          </div>
          
          <div className="nav-links">
            <button 
              className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
              onClick={() => handleNavigation('dashboard')}
            >
              <span className="nav-icon">🏠</span>
              Dashboard
            </button>
            
            <button 
              className={`nav-link ${currentPage === 'players' ? 'active' : ''}`}
              onClick={() => handleNavigation('players')}
            >
              <span className="nav-icon">👥</span>
              Players
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="app-main">
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'players' && <PlayerManagement />}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <p>© 2025 Soccer Team Maker - Create balanced teams with ease</p>
          <div className="footer-links">
            <span>⚽ Made for soccer organizers</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;