import { useState, useEffect } from 'react';
import AppRoutes from './routes/AppRoutes.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './pages/Footer.jsx'

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
    <div
      className={`min-h-screen ${
        darkMode ? 'dark bg-[#1F2937]' : 'bg-[#FFFFFF]'
      } transition-colors font-inter pt-16 sm:pt-20`}
    >
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <AppRoutes />
      </main>
      <Footer/>
    </div>
  );
}

export default App;