import { useState, useEffect } from 'react';
import AppRoutes from './routes/AppRoutes.jsx';
import Navbar from './components/Navbar.jsx';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    // Get saved mode from localStorage or default to false
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    // Apply the dark class to <html> on initial load
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-dark-bg' : 'bg-light-bg'} transition-colors font-inter`}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <AppRoutes />
    </div>
  );
}

export default App;
