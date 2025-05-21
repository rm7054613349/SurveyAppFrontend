import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';

// Framer Motion animation variants (unchanged)
const buttonHover = {
  scale: 1.05,
  transition: { duration: 0.2 },
};

const logoAnimation = {
  whileHover: { rotate: 360, transition: { duration: 0.5 } },
};

const menuItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const closeButtonVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.3, type: 'spring', stiffness: 200 } },
};

function Navbar({ darkMode, toggleDarkMode }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleDarkModeToggle = () => {
    toggleDarkMode();
    setIsMobileMenuOpen(false);
  };

  const sideMenuVariants = {
    open: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeInOut' },
    },
    closed: {
      x: '100%',
      opacity: 0,
      transition: { duration: 0.3, ease: 'easeInOut' },
    },
  };

  const containerVariants = {
    hidden: { transition: { staggerChildren: 0.1 } },
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const getUserInitial = () => {
    return user && user.email && typeof user.email === 'string' && user.email.length > 0
      ? user.email[0].toUpperCase()
      : 'U';
  };

  // Function to handle redirect to user profile
  const handleUserProfileClick = () => {
    setIsMobileMenuOpen(false); // Close mobile menu if open
    navigate('/profile');
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#1E3A8A] dark:bg-[#1E40AF] text-white p-4 sm:p-6 shadow-lg fixed w-full top-0 z-50"
    >
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl sm:text-2xl font-bold flex items-center space-x-2">
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-[28px] h-[28px] sm:w-8 sm:h-8"
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
        <div className="md:hidden">
          <motion.button
            whileHover={buttonHover}
            whileTap={{ scale: 0.95 }}
            animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
            onClick={toggleMobileMenu}
            className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            aria-label={isMobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
          >
            <svg
              className="w-[28px] h-[28px] sm:w-8 sm:h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </motion.button>
        </div>
        <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
          <motion.button
            whileHover={buttonHover}
            whileTap={{ scale: 0.95 }}
            onClick={toggleDarkMode}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#E5E7EB] text-[#1E3A8A] dark:text-[#1E40AF] flex items-center justify-center text-xl shadow-md hover:bg-[#E5E7EB] dark:hover:bg-[#D1D5DB] transition-colors focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? '☀️' : '🌙'}
          </motion.button>
          {user ? (
            <>
              <div className="flex items-center space-x-2">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleUserProfileClick}
                  className="w-10 h-10 bg-white dark:bg-[#E5E7EB] text-[#1E3A8A] dark:text-[#1E40AF] rounded-full flex items-center justify-center font-bold shadow-md cursor-pointer"
                >
                  {getUserInitial()}
                </motion.div>
                <span className="text-sm font-semibold hidden lg:inline">
                  {/* {user.email.split('@')[0]} ({user.role}) */}
                </span>
              </div>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link
                  to={user.role === 'admin' ? '/admin/dashboard' : '/employee'}
                  className="bg-white dark:bg-[#E5E7EB] text-[#1E3A8A] dark:text-[#1E40AF] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium shadow-md hover:bg-[#E5E7EB] dark:hover:bg-[#D1D5DB] transition-colors focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                >
                  Dashboard
                </Link>
              </motion.div>
              <motion.button
                whileHover={buttonHover}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="bg-[#F97316] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium shadow-md hover:bg-[#EA580C] transition-colors focus:outline-none focus:ring-2 focus:ring-white"
              >
                Logout
              </motion.button>
            </>
          ) : (
            <>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link
                  to="/login"
                  className="bg-white dark:bg-[#E5E7EB] text-[#1E3A8A] dark:text-[#1E40AF] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium shadow-md hover:bg-[#E5E7EB] dark:hover:bg-[#D1D5DB] transition-colors focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                >
                  Login
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link
                  to="/signup"
                  className="bg-[#F97316] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium shadow-md hover:bg-[#EA580C] transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                >
                  Signup
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </div>
      <motion.div
        variants={sideMenuVariants}
        initial="closed"
        animate={isMobileMenuOpen ? 'open' : 'closed'}
        className="fixed top-0 right-0 h-full w-[200px] bg-[#1E3A8A] dark:bg-[#1E40AF] bg-opacity-90 text-white md:hidden z-40"
      >
        <motion.div
          className="flex flex-col p-4 mt-16 relative space-y-3"
          variants={containerVariants}
          initial="hidden"
          animate={isMobileMenuOpen ? 'visible' : 'hidden'}
        >
          <motion.button
            variants={closeButtonVariants}
            whileHover={buttonHover}
            whileTap={{ scale: 0.95 }}
            onClick={toggleMobileMenu}
            className="absolute top-4 right-4 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            aria-label="Close mobile menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </motion.button>
          {user ? (
            <>
              <motion.div variants={menuItemVariants} className="flex items-center space-x-2">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleUserProfileClick}
                  className="w-10 h-10 bg-white dark:bg-[#E5E7EB] text-[#1E3A8A] dark:text-[#1E40AF] rounded-full flex items-center justify-center font-bold shadow-md cursor-pointer"
                >
                  {getUserInitial()}
                </motion.div>
                <motion.button
                  whileHover={buttonHover}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDarkModeToggle}
                  className="w-8 h-8 rounded-full bg-white dark:bg-[#E5E7EB] text-[#1E3A8A] dark:text-[#1E40AF] flex items-center justify-center text-lg shadow-md hover:bg-[#E5E7EB] dark:hover:bg-[#D1D5DB] transition-colors focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                  aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {darkMode ? '☀️' : '🌙'}
                </motion.button>
              </motion.div>
              <motion.div variants={menuItemVariants} whileHover={{ scale: 1.05 }}>
                <Link
                  to={user.role === 'admin' ? '/admin/dashboard' : '/employee'}
                  className="block w-full bg-white dark:bg-[#E5E7EB] text-[#1E3A8A] dark:text-[#1E40AF] px-4 py-2 rounded-full font-medium shadow-md hover:bg-[#E5E7EB] dark:hover:bg-[#D1D5DB] transition-colors focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              </motion.div>
              <motion.button
                variants={menuItemVariants}
                whileHover={buttonHover}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="w-full bg-[#F97316] text-white px-4 py-2 rounded-full font-medium shadow-md hover:bg-[#EA580C] transition-colors focus:outline-none focus:ring-2 focus:ring-white"
              >
                Logout
              </motion.button>
            </>
          ) : (
            <>
              <motion.div variants={menuItemVariants}>
                <motion.button
                  whileHover={buttonHover}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDarkModeToggle}
                  className="w-8 h-8 rounded-full bg-white dark:bg-[#E5E7EB] text-[#1E3A8A] dark:text-[#1E40AF] flex items-center justify-center text-lg shadow-md hover:bg-[#E5E7EB] dark:hover:bg-[#D1D5DB] transition-colors focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                  aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {darkMode ? '☀️' : '🌙'}
                </motion.button>
              </motion.div>
              <motion.div variants={menuItemVariants} whileHover={{ scale: 1.05 }}>
                <Link
                  to="/login"
                  className="block w-full bg-white dark:bg-[#E5E7EB] text-[#1E3A8A] dark:text-[#1E40AF] px-4 py-2 rounded-full font-medium shadow-md hover:bg-[#E5E7EB] dark:hover:bg-[#D1D5DB] transition-colors focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
              </motion.div>
              <motion.div variants={menuItemVariants} whileHover={{ scale: 1.05 }}>
                <Link
                  to="/signup"
                  className="block w-full bg-[#F97316] text-white px-4 py-2 rounded-full font-medium shadow-md hover:bg-[#EA580C] transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Signup
                </Link>
              </motion.div>
            </>
          )}
        </motion.div>
      </motion.div>
    </motion.nav>
  );
}

export default Navbar;