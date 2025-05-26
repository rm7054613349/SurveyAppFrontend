import { useState, useEffect } from 'react';
import AppRoutes from './routes/AppRoutes.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './pages/Footer.jsx';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <div
      className={`min-h-screen flex flex-col w-full ${
        darkMode ? 'dark bg-gray-800' : 'bg-white'
      } transition-colors duration-300 font-inter`}
    >
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <main className="flex-1 w-full pt-16 sm:pt-20">
        <AppRoutes />
      </main>
      <Footer />
    </div>
  );
}

export default App;