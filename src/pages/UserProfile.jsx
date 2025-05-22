import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { changePassword, getUserProfile } from '../services/api';

// Animation variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: 'easeIn' } },
};

const sectionVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, type: 'spring', stiffness: 120 } },
};

const buttonHover = {
  scale: 1.05,
  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
  transition: { duration: 0.2, ease: 'easeInOut' },
};

const modalVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2, ease: 'easeIn' } },
};

function UserProfile() {
  const { user: authUser, logout, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userData = await getUserProfile();
        setUser(userData);
      } catch (err) {
        toast.error('Failed to load user profile. Logging out.');
        logout();
        navigate('/login');
      }
    };

    if (authUser && !authLoading) {
      fetchUserProfile();
    }
  }, [authUser, authLoading, logout, navigate]);

  // Show loading state while fetching user data or auth is loading
  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <svg
            className="animate-spin h-5 w-5 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
            ></path>
          </svg>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  const getUserInitial = () => {
    return user.email && typeof user.email === 'string' && user.email.length > 0
      ? user.email[0].toUpperCase()
      : 'U';
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All fields are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully! Please log in again.');
      setShowChangePassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      logout();
      navigate('/login');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6"
    >
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700"
      >
        {/* Header with Logout */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Profile</h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={logout}
            className="text-sm text-red-500 dark:text-red-400 hover:underline focus:outline-none"
          >
            Logout
          </motion.button>
        </div>

        {/* User Details */}
        <div className="flex flex-col items-center mb-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-20 h-20 bg-blue-500 dark:bg-blue-600 text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-lg mb-4"
          >
            {getUserInitial()}
          </motion.div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              <span className="font-medium">Email:</span> {user.email}
            </p>
            <p className="text-gray-600 dark:text-gray-300 text-sm"></p>
            {user.role === 'employee' && user.badges && user.badges.length > 0 && (
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">Badges:</span>
                {user.badges.map((badge, index) => (
                  <span
                    key={index}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      badge === 'gold'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-200 dark:text-yellow-900'
                        : badge === 'silver'
                        ? 'bg-gray-100 text-gray-800 dark:bg-gray-200 dark:text-gray-900'
                        : 'bg-orange-100 text-orange-800 dark:bg-orange-200 dark:text-orange-900'
                    }`}
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zm0 16a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                    {badge.charAt(0).toUpperCase() + badge.slice(1)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <motion.button
            whileHover={buttonHover}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowChangePassword(true)}
            className="w-full py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg font-medium shadow-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            Change Password
          </motion.button>
          <motion.button
            whileHover={buttonHover}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(user.role === 'admin' ? '/admin/dashboard' : '/employee')}
            className="w-full py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg font-medium shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            Back to Dashboard
          </motion.button>
        </div>

        {/* Change Password Modal */}
        <AnimatePresence>
          {showChangePassword && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-4"
            >
              <motion.div
                variants={modalVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Change Password</h3>
                  <button
                    onClick={() => setShowChangePassword(false)}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-colors"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <motion.button
                    whileHover={buttonHover}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowChangePassword(false)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg font-medium shadow-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={buttonHover}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleChangePassword}
                    disabled={loading}
                    className={`px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg font-medium shadow-sm hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                          ></path>
                        </svg>
                        Updating...
                      </div>
                    ) : (
                      'Update Password'
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export default UserProfile;