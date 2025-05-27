import { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import logoImage from '../assets/Image.png';

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

const sideMenuVariants = {
  open: { x: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeInOut' } },
  closed: { x: '100%', opacity: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
};

const containerVariants = {
  hidden: { transition: { staggerChildren: 0.1 } },
  visible: { transition: { staggerChildren: 0.1 } },
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
    setIsMobileMenuOpen((prev) => !prev);
  };

  const handleDarkModeToggle = () => {
    toggleDarkMode();
    setIsMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    const path = user ? '/Intranet/Home' : '/';
    console.log(`Navbar: Redirecting to ${path}...`);
    navigate(path);
  };

  const handleHomeClick = () => {
    const path = user ? '/Intranet/Home' : '/';
    console.log(`Navbar: Redirecting to ${path}...`);
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const getUserInitial = () => {
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  const handleUserProfileClick = () => {
    setIsMobileMenuOpen(false);
    navigate('/profile');
  };

  // Define active and inactive link styles for desktop
  const navLinkStyle = ({ isActive }) =>
    `font-inter text-lg sm:text-base lg:text-lg ${
      isActive ? 'text-white border-b-2 border-white' : 'text-black hover:text-gray-600'
    } transition-colors duration-200`;

  // Define active and inactive link styles for mobile menu
  const mobileNavLinkStyle = ({ isActive }) =>
    `block text-lg text-center font-inter ${
      isActive ? 'text-blue-800 font-bold' : 'text-gray-800'
    }`;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 h-16 sm:h-20 shadow-lg bg-[#00ced1]">
      <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between h-full">
        <div onClick={handleLogoClick} className="flex items-center gap-2 cursor-pointer">
          <img
            src={logoImage}
            alt="SS Medical Systems Logo"
            className="w-12 h-12 sm:w-14 sm:h-14 object-contain bg-white rounded-full p-1 shadow-md"
          />
          <span className="text-xl sm:text-2xl font-extrabold text-black font-inter">
            Intranet
          </span>
        </div>

        {/* Mobile Menu Button */}
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
              className="w-6 h-6 text-black"
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

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center justify-center flex-1">
          <div className="flex items-center space-x-4 lg:space-x-6">
            {user?.role === 'employee' ? (
              <>
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <NavLink
                      to="/Intranet/Home"
                      className={navLinkStyle}
                      end
                      onClick={handleHomeClick}
                    >
                      Home
                    </NavLink>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <NavLink to="/employee" className={navLinkStyle} end>
                      Assessment
                    </NavLink>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <NavLink to="/media" className={navLinkStyle} end>
                      Media
                    </NavLink>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <NavLink to="/contact" className={navLinkStyle} end>
                      Contact Us
                    </NavLink>
                  </motion.div>
                </>
            ) : user?.role === 'admin' ? (
              <>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <NavLink to="/Intranet/Home" className={navLinkStyle} end onClick={handleHomeClick}>
                    Home
                  </NavLink>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <NavLink to="/admin/dashboard" className={navLinkStyle} end>
                    Dashboard
                  </NavLink>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <NavLink to="/contact" className={navLinkStyle} end>
                    Contact Us
                  </NavLink>
                </motion.div>
              </>
            ) : null}
          </div>
        </div>

        {/* Desktop User Actions */}
        <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
          {user ? (
            <>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleUserProfileClick}
                className="w-10 h-10 bg-blue-800 text-white rounded-full flex items-center justify-center font-bold shadow-md cursor-pointer text-lg"
              >
                {getUserInitial()}
              </motion.div>
              <motion.button
                whileHover={buttonHover}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-orange-600 transition-colors focus:outline-none"
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
            <motion.div whileHover={{ scale: 1.05 }}>
              <NavLink to="/login" className={navLinkStyle}>
                Get Started
              </NavLink>
            </motion.div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        variants={sideMenuVariants}
        initial="closed"
        animate={isMobileMenuOpen ? 'open' : 'closed'}
        className="fixed top-0 right-0 h-full w-64 bg-gray-100 dark:bg-gray-800 bg-opacity-95 md:hidden z-40"
      >
        <motion.div
          className="flex flex-col p-4 mt-16 space-y-6"
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
              className="w-6 h-6 text-gray-800 dark:text-gray-200"
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
                    className="w-10 h-10 bg-blue-800 text-white rounded-full flex items-center justify-center font-bold shadow-md cursor-pointer text-lg"
                  >
                    {getUserInitial()}
                  </motion.div>
                  <motion.button
                    whileHover={buttonHover}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-orange-600 transition-colors focus:outline-none"
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
              <div className="flex flex-col items-center space-y-4">
                <motion.div whileHover={{ scale: 1.05 }} className="w-full">
                  <NavLink
                    to="/login"
                    className={mobileNavLinkStyle}
                    onClick={() => setIsMobileMenuOpen(false)}
                    end
                  >
                    Get Started
                  </NavLink>
                </motion.div>
              </div>
            )}
          </motion.div>
          <motion.div variants={menuItemVariants} className="flex flex-col space-y-6 w-full">
            {user?.role === 'employee' ? (
              <>
                <motion.div whileHover={{ scale: 1.05 }} className="w-full">
                  <NavLink
                    to="/Intranet/Home"
                    className={mobileNavLinkStyle}
                    onClick={handleHomeClick}
                    end
                  >
                    Home
                  </NavLink>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} className="w-full">
                  <NavLink
                    to="/employee"
                    className={mobileNavLinkStyle}
                    onClick={() => setIsMobileMenuOpen(false)}
                    end
                  >
                    Assessment
                  </NavLink>
                </motion.div>
                {/* <motion.div whileHover={{ scale: 1.05 }} className="w-full">
                  <NavLink
                    to="/employee/all-announcements"
                    className={mobileNavLinkStyle}
                    onClick={() => setIsMobileMenuOpen(false)}
                    end
                  >
                    All Announcements
                  </NavLink>
                </motion.div> */}
                <motion.div whileHover={{ scale: 1.05 }} className="w-full">
                  <NavLink
                    to="/media"
                    className={mobileNavLinkStyle}
                    onClick={() => setIsMobileMenuOpen(false)}
                    end
                  >
                    Media
                  </NavLink>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} className="w-full">
                  <NavLink
                    to="/contact"
                    className={mobileNavLinkStyle}
                    onClick={() => setIsMobileMenuOpen(false)}
                    end
                  >
                    Contact Us
                  </NavLink>
                </motion.div>
              </>
            ) : user?.role === 'admin' ? (
              <>
                <motion.div whileHover={{ scale: 1.05 }} className="w-full">
                  <NavLink
                    to="/Intranet/Home"
                    className={mobileNavLinkStyle}
                    onClick={handleHomeClick}
                    end
                  >
                    Home
                  </NavLink>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} className="w-full">
                  <NavLink
                    to="/admin/dashboard"
                    className={mobileNavLinkStyle}
                    onClick={() => setIsMobileMenuOpen(false)}
                    end
                  >
                    Dashboard
                  </NavLink>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} className="w-full">
                  <NavLink
                    to="/contact"
                    className={mobileNavLinkStyle}
                    onClick={() => setIsMobileMenuOpen(false)}
                    end
                  >
                    Contact Us
                  </NavLink>
                </motion.div>
              </>
            ) : null}
          </motion.div>
        </motion.div>
      </motion.div>
    </nav>
  );
}

export default Navbar;