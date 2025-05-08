import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { buttonHover, logoAnimation } from '../animations/framerAnimations';

function Navbar({ darkMode, toggleDarkMode }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-primary-blue text-white p-4 shadow-lg"
    >
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold flex items-center space-x-2">
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...logoAnimation}
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4l3 4v-4l-3 4z" />
          </motion.svg>
          <span>Assesment</span>
        </Link>
        <div className="flex items-center space-x-6">
          <motion.button
            whileHover={buttonHover}
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-white text-primary-blue"
          >
            {darkMode ? '☀️' : '🌙'}
          </motion.button>
          {user ? (
            <>
              <motion.div
                {...logoAnimation}
                className="flex items-center space-x-2 logo-pulse"
              >
                <div className="w-10 h-10 bg-white text-primary-blue rounded-full flex items-center justify-center font-bold">
                  {user.email[0].toUpperCase()}
                </div>
                <span className="text-sm font-semibold">
                  {/* {user.email.split('@')[0]} ({user.role}) */}
                </span>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }}>
                <Link
                  to={user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard'}
                  className="hover:underline font-medium"
                >
                  Dashboard
                </Link>
              </motion.div>
              <motion.button
                whileHover={buttonHover}
                onClick={handleLogout}
                className="bg-accent-orange text-white px-4 py-2 rounded-full"
              >
                Logout
              </motion.button>
            </>
          ) : (
            <>
              <motion.div whileHover={{ scale: 1.1 }}>
                <Link to="/login" className="hover:underline font-medium">Login</Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }}>
                <Link to="/signup" className="bg-accent-orange text-white px-4 py-2 rounded-full">Signup</Link>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}

export default Navbar;