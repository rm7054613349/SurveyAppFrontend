import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { pageTransition, fadeIn, buttonHover } from '../animations/framerAnimations';
import LoadingSpinner from '../components/LoadingSpinner';

function AccessCode() {
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!accessCode.trim()) {
      toast.error('Access code is required');
      setLoading(false);
      return;
    }

    const correctCode = import.meta.env.VITE_ADMIN_ACCESS_CODE;
    if (!correctCode) {
      toast.error('Access code configuration missing. Contact administrator.');
      setLoading(false);
      return;
    }

    if (accessCode !== correctCode) {
      toast.error('Invalid access code. Please try again.');
      setLoading(false);
      return;
    }

    // Set access code verification flag
    localStorage.setItem('adminAccessVerified', 'true');
    toast.success('Access granted!');
    setLoading(false);
    navigate('/admin/dashboard');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <motion.div
      {...pageTransition}
      className="container mx-auto p-4 sm:p-6 max-w-md content-box"
    >
      <motion.h2
        {...fadeIn}
        className="text-2xl sm:text-3xl font-bold mb-6 text-primary-blue text-center"
      >
        Admin Access Verification
      </motion.h2>
      <motion.form
        onSubmit={handleSubmit}
        {...fadeIn}
        transition={{ delay: 0.2 }}
        className="space-y-6 bg-card-bg dark:bg-card-dark-bg p-6 sm:p-8 rounded-lg shadow-lg content-box"
      >
        <motion.div {...fadeIn} transition={{ delay: 0.3 }}>
          <label className="block mb-2 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
            Enter Access Code
          </label>
          <input
            type="password"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            placeholder="Enter access code"
            className="w-full p-3 border rounded dark:bg-gray-800 dark:text-white text-sm sm:text-base focus:ring-2 focus:ring-secondary-green"
            required
          />
        </motion.div>
        <motion.button
          whileHover={buttonHover}
          type="submit"
          className="w-full bg-secondary-green text-white p-3 rounded-lg text-sm sm:text-base"
        >
          Verify Access
        </motion.button>
      </motion.form>
    </motion.div>
  );
}

export default AccessCode;