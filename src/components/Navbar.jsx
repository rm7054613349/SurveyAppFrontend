import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import logoImage from '../assets/Image.png'; // Adjust the path as per your project structure

// Framer Motion animation variants
const buttonHover = {
  scale: 1.05,
  transition: { duration: 0.2 },
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
    console.log('Navbar: User logged out. Redirecting to /...');
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleDarkModeToggle = () => {
    toggleDarkMode();
    setIsMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    if (!user) {
      console.log('Navbar: User not logged in. Redirecting to /...');
      navigate('/');
    } else {
      console.log('Navbar: User logged in. Redirecting to /Intranet/Home...');
      navigate('/Intranet/Home');
    }
  };

  const handleHomeClick = () => {
    if (!user) {
      console.log('Navbar: User not logged in. Redirecting to /...');
      navigate('/');
    } else {
      console.log('Navbar: User logged in. Redirecting to /Intranet/Home...');
      navigate('/Intranet/Home');
    }
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

  const handleUserProfileClick = () => {
    setIsMobileMenuOpen(false);
    navigate('/profile');
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#E5E7EB] p-2 sm:p-3 shadow-lg fixed w-full top-0 z-50"
    >
      <div className="container mx-auto flex items-center justify-between">
        <div
          onClick={handleLogoClick}
          className="text-lg sm:text-xl font-bold flex items-center space-y-2 gap-2 focus:outline-none cursor-pointer"
        >
          <img
            src={logoImage}
            alt="SS Medical Systems Logo"
            className="w-[60px] h-[60px] sm:w-[70px] sm:h-[70px] object-contain bg-white rounded-full p-1 shadow-md"
          />
          <span className="text-xl sm:text-2xl font-extrabold text-[#1F2937] font-['Inter',sans-serif]">
            Intranet
          </span>
        </div>
        <div className="md:hidden">
          <motion.button
            whileHover={buttonHover}
            whileTap={{ scale: 0.95 }}
            animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
            onClick={toggleMobileMenu}
            className="p-2 rounded-md focus:outline-none"
            aria-label={isMobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
          >
            <svg
              className="w-6 h-6 text-[#1F2937]"
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
        <div className="hidden md:flex items-center justify-center flex-1">
          <div className="flex items-center space-x-8 lg:space-x-10">
            {user?.role === 'employee' ? (
              <>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <div
                    onClick={handleHomeClick}
                    className="text-[#1F2937] font-['Inter',sans-serif] text-lg lg:text-xl cursor-pointer"
                  >
                    Home
                  </div>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Link to="/employee" className="text-[#1F2937] font-['Inter',sans-serif] text-lg lg:text-xl">
                    Assessment
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Link to="/media" className="text-[#1F2937] font-['Inter',sans-serif] text-lg lg:text-xl">
                    Media
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Link to="/contact" className="text-[#1F2937] font-['Inter',sans-serif] text-lg lg:text-xl">
                    Contact Us
                  </Link>
                </motion.div>
              </>
            ) : user?.role === 'admin' ? (
              <>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <div
                    onClick={handleHomeClick}
                    className="text-[#1F2937] font-['Inter',sans-serif] text-lg lg:text-xl cursor-pointer"
                  >
                    Home
                  </div>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Link to="/admin/dashboard" className="text-[#1F2937] font-['Inter',sans-serif] text-lg lg:text-xl">
                    Dashboard
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Link to="/contact" className="text-[#1F2937] font-['Inter',sans-serif] text-lg lg:text-xl">
                    Contact Us
                  </Link>
                </motion.div>
              </>
            ) : null}
          </div>
        </div>
        <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
          {user ? (
            <>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleUserProfileClick}
                className="w-10 h-10 bg-[#1E3A8A] text-white rounded-full flex items-center justify-center font-bold shadow-md cursor-pointer text-lg"
              >
                {getUserInitial()}
              </motion.div>
              <motion.button
                whileHover={buttonHover}
                whileTap={{ scale: 0.95 }}
                onClick={handleDarkModeToggle}
                className="w-10 h-10 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center text-lg shadow-md hover:bg-[#1E40AF] transition-colors focus:outline-none"
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? '☀️' : '🌙'}
              </motion.button>
              <motion.button
                whileHover={buttonHover}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="w-10 h-10 bg-[#F97316] text-white rounded-full flex items-center justify-center shadow-md hover:bg-[#EA580C] transition-colors focus:outline-none"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </motion.button>
            </>
          ) : (
            <>
              <motion.button
                whileHover={buttonHover}
                whileTap={{ scale: 0.95 }}
                onClick={handleDarkModeToggle}
                className="w-10 h-10 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center text-lg shadow-md hover:bg-[#1E40AF] transition-colors focus:outline-none"
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? '☀️' : '🌙'}
              </motion.button>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link to="/login" className="text-[#1F2937] font-['Inter',sans-serif] text-lg lg:text-xl">
                  Get Started
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
        className="fixed top-0 right-0 h-full w-[250px] bg-[#E5E7EB] bg-opacity-90 md:hidden z-40"
      >
        <motion.div
          className="flex flex-col p-4 mt-12 relative space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate={isMobileMenuOpen ? 'visible' : 'hidden'}
        >
          <motion.button
            variants={closeButtonVariants}
            whileHover={buttonHover}
            whileTap={{ scale: 0.95 }}
            onClick={toggleMobileMenu}
            className="absolute top-4 right-4 p-2 rounded-md focus:outline-none"
            aria-label="Close mobile menu"
          >
            <svg
              className="w-6 h-6 text-[#1F2937]"
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
          <motion.div variants={menuItemVariants} className="flex flex-col space-y-4">
            {user ? (
              <>
                <div className="flex flex-col items-center space-y-4">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleUserProfileClick}
                    className="w-10 h-10 bg-[#1E3A8A] text-white rounded-full flex items-center justify-center font-bold shadow-md cursor-pointer text-lg"
                  >
                    {getUserInitial()}
                  </motion.div>
                  <motion.button
                    whileHover={buttonHover}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDarkModeToggle}
                    className="w-10 h-10 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center text-lg shadow-md hover:bg-[#1E40AF] transition-colors focus:outline-none"
                    aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                  >
                    {darkMode ? '☀️' : '🌙'}
                  </motion.button>
                  <motion.button
                    whileHover={buttonHover}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="w-10 h-10 bg-[#F97316] text-white rounded-full flex items-center justify-center shadow-md hover:bg-[#EA580C] transition-colors focus:outline-none"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                  </motion.button>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col items-center space-y-4">
                  <motion.button
                    whileHover={buttonHover}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDarkModeToggle}
                    className="w-10 h-10 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center text-lg shadow-md hover:bg-[#1E40AF] transition-colors focus:outline-none"
                    aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                  >
                    {darkMode ? '☀️' : '🌙'}
                  </motion.button>
                  <motion.div whileHover={{ scale: 1.05 }} className="w-full">
                    <Link
                      to="/login"
                      className="block text-[#1F2937] font-['Inter',sans-serif] text-lg text-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </motion.div>
                </div>
              </>
            )}
          </motion.div>
          <motion.div variants={menuItemVariants} className="flex flex-col space-y-6 w-full">
            {user?.role === 'employee' ? (
              <>
                <motion.div whileHover={{ scale: 1.05 }} className="w-full">
                  <div
                    onClick={handleHomeClick}
                    className="block text-[#1F2937] font-['Inter',sans-serif] text-lg text-center cursor-pointer"
                  >
                    Home
                  </div>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} className="w-full">
                  <Link
                    to="/employee"
                    className="block text-[#1F2937] font-['Inter',sans-serif] text-lg text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Assessment
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} className="w-full">
                  <Link
                    to="/media"
                    className="block text-[#1F2937] font-['Inter',sans-serif] text-lg text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Media
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} className="w-full">
                  <Link
                    to="/contact"
                    className="block text-[#1F2937] font-['Inter',sans-serif] text-lg text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Contact Us
                  </Link>
                </motion.div>
              </>
            ) : user?.role === 'admin' ? (
              <>
                <motion.div whileHover={{ scale: 1.05 }} className="w-full">
                  <div
                    onClick={handleHomeClick}
                    className="block text-[#1F2937] font-['Inter',sans-serif] text-lg text-center cursor-pointer"
                  >
                    Home
                  </div>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} className="w-full">
                  <Link
                    to="/admin/dashboard"
                    className="block text-[#1F2937] font-['Inter',sans-serif] text-lg text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} className="w-full">
                  <Link
                    to="/contact"
                    className="block text-[#1F2937] font-['Inter',sans-serif] text-lg text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Contact Us
                  </Link>
                </motion.div>
              </>
            ) : null}
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.nav>
  );
}

export default Navbar;