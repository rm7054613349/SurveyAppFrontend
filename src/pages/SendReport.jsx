import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { getUsers, sendReportByUser } from '../services/api';
import { pageTransition, buttonHover, fadeIn } from '../animations/framerAnimations';
import LoadingSpinner from '../components/LoadingSpinner';
import ProtectedRoute from '../components/ProtectedRoute';

function SendReport() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await getUsers();
        setUsers(userData);
        setLoading(false);
      } catch (err) {
        toast.error(err.message || 'Failed to fetch users');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSendReport = async (e) => {
    e.preventDefault();
    if (!selectedUser) {
      toast.error('Please select a user');
      return;
    }
    try {
      setSending(true);
      await sendReportByUser(selectedUser);
      toast.success('Report sent successfully!');
      setSelectedUser('');
    } catch (err) {
      console.error('Send report failed:', {
        message: err.message,
        code: err.code || 'N/A',
        response: err.response || 'No response data',
        responseCode: err.responseCode || 'N/A',
        command: err.command || 'N/A',
      });
      const errorMessage = err.message.includes('Invalid email credentials')
        ? 'Failed to send email: Invalid email credentials. Please contact the administrator to verify email settings.'
        : err.message.includes('User not found')
        ? 'Selected user not found. Please refresh and try again.'
        : err.message.includes('No responses found')
        ? 'No responses found for this user.'
        : err.message || 'Failed to send report. Please try again later.';
      toast.error(errorMessage);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <motion.div {...fadeIn} className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner />
      </motion.div>
    );
  }

  return (
    <ProtectedRoute allowedRole="admin">
      <motion.div {...pageTransition} className="container mx-auto p-4 sm:p-6 max-w-lg content-box">
        <motion.h2 {...fadeIn} className="text-2xl sm:text-3xl font-bold mb-6 text-primary-blue text-center">
          Send Report
        </motion.h2>
        <form onSubmit={handleSendReport} className="space-y-6 bg-card-bg dark:bg-card-dark-bg p-6 sm:p-8 rounded-lg shadow-lg content-box">
          <motion.div {...fadeIn} transition={{ delay: 0.1 }}>
            <label className="block mb-2 text-gray-700 dark:text-gray-300 text-sm sm:text-base font-medium">
              Select User
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className={`w-full p-3 border rounded dark:bg-gray-800 dark:text-white text-sm sm:text-base ${
                sending ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={sending}
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.email} ({user.role.charAt(0).toUpperCase() + user.role.slice(1)})
                </option>
              ))}
            </select>
          </motion.div>
          <motion.button
            whileHover={!sending ? buttonHover : {}}
            type="submit"
            className={`w-full p-3 rounded-lg text-sm sm:text-base text-white flex items-center justify-center transition-all duration-300 ${
              sending ? 'bg-secondary-green/70 cursor-not-allowed' : 'bg-secondary-green hover:bg-secondary-green/90'
            }`}
            disabled={sending}
          >
            {sending ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="flex items-center"
              >
                <LoadingSpinner size="small" className="text-white" />
                <span className="ml-2 font-medium">Sending...</span>
              </motion.div>
            ) : (
              'Send Report'
            )}
          </motion.button>
        </form>
      </motion.div>
    </ProtectedRoute>
  );
}

export default SendReport;