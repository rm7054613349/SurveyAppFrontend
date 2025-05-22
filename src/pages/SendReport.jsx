import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { getUsers, getSections, getSubsections, sendReportByUser } from '../services/api';
import { pageTransition, fadeIn, buttonHover } from '../animations/framerAnimations';
import LoadingSpinner from '../components/LoadingSpinner';
import ProtectedRoute from '../components/ProtectedRoute';
import { useNavigate } from 'react-router-dom';

function SendReport() {
  const [users, setUsers] = useState([]);
  const [sections, setSections] = useState([]);
  const [subsections, setSubsections] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSubsection, setSelectedSubsection] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Cache configuration
  const CACHE_KEY = 'sendReportData';
  const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

  // Check token presence
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('SendReport - Token:', token ? token.slice(0, 20) + '...' : 'No token'); // Debug log
    if (!token) {
      toast.error('No authentication token found. Please log in.');
      navigate('/login');
    }
  }, [navigate]);

  // Load data from cache or API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check cache
        const cachedData = JSON.parse(localStorage.getItem(CACHE_KEY));
        const now = Date.now();
        if (cachedData && cachedData.timestamp + CACHE_TTL > now) {
          console.log('SendReport - Loading from cache');
          setUsers(cachedData.users || []);
          setSections(cachedData.sections || []);
          setSubsections(cachedData.subsections || []);
          setLoading(false);
          return;
        }

        // Fetch from API
        setLoading(true);
        const [userData, sectionData, subsectionData] = await Promise.all([
          getUsers(),
          getSections(),
          getSubsections(),
        ]);

        // Normalize data
        const normalizedUsers = Array.isArray(userData) ? userData : [];
        const normalizedSections = Array.isArray(sectionData) ? sectionData : [];
        const normalizedSubsections = Array.isArray(subsectionData) ? subsectionData : [];

        setUsers(normalizedUsers);
        setSections(normalizedSections);
        setSubsections(normalizedSubsections);

        // Save to cache
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            users: normalizedUsers,
            sections: normalizedSections,
            subsections: normalizedSubsections,
            timestamp: now,
          })
        );

        setLoading(false);
      } catch (err) {
        console.error('SendReport - Fetch data error:', err.message, 'Status:', err.response?.status); // Debug log
        let message = err.message || 'Failed to fetch data';
        if (err.message.includes('HTML response')) {
          message = `Server error: Received an HTML response (status: ${err.response?.status || 'unknown'}). Check server route or contact support.`;
        } else if (err.message.includes('Failed to connect')) {
          message = 'Network error: Cannot connect to server. Ensure backend is running.';
        } else if (err.response?.status === 401 || err.message.includes('Invalid token') || err.message.includes('No token provided')) {
          message = 'Unauthorized: Please log in again';
          navigate('/login');
        } else if (err.response?.status === 403 || err.message.includes('Access denied')) {
          message = 'Access denied: Admin privileges required';
        } else if (err.response?.status === 404) {
          message = 'API endpoint not found. Verify server route configuration.';
        }
        toast.error(message);
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  // Filter subsections based on selected section
  const filteredSubsections = subsections.filter(
    (sub) => !selectedSection || sub.sectionId?._id === selectedSection
  );

  // Handle form submission
  const handleSendReport = async (e) => {
    e.preventDefault();
    if (!selectedUser) {
      toast.error('Please select a user');
      return;
    }
    try {
      setLoading(true);
      const payload = { userId: selectedUser };
      if (selectedSection) payload.sectionId = selectedSection;
      if (selectedSubsection) payload.subsectionId = selectedSubsection;

      console.log('SendReport - Sending report with payload:', payload); // Debug log
      await sendReportByUser(payload);
      toast.success('Report sent successfully!');
      setSelectedUser('');
      setSelectedSection('');
      setSelectedSubsection('');
    } catch (err) {
      console.error('SendReport - Send report error:', err.message, 'Status:', err.response?.status); // Debug log
      let message = err.message || 'Failed to send report';
      if (err.message.includes('HTML response')) {
        message = `Server error: Received an HTML response (status: ${err.response?.status || 'unknown'}). Check server route or contact support.`;
      } else if (err.message.includes('Failed to connect')) {
        message = 'Network error: Cannot connect to server. Ensure backend is running.';
      } else if (err.response?.status === 401 || err.message.includes('Invalid token') || err.message.includes('No token provided')) {
        message = 'Unauthorized: Please log in again';
        navigate('/login');
      } else if (err.response?.status === 403 || err.message.includes('Access denied')) {
        message = 'Access denied: Admin privileges required';
      } else if (err.response?.status === 404) {
        message = 'API endpoint not found. Verify server route configuration.';
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <motion.div {...fadeIn} className="flex justify-center items-center h-screen bg-gray-50 dark:bg-slate-800">
        <LoadingSpinner />
      </motion.div>
    );
  }

  return (
    <ProtectedRoute allowedRole="admin">
      <motion.div
        {...pageTransition}
        className="container mx-auto p-4 sm:p-6 max-w-lg bg-gray-50 dark:bg-slate-800 min-h-screen"
      >
        <motion.h2
          {...fadeIn}
          className="text-2xl sm:text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-500 dark:to-indigo-600 text-center"
        >
          Send Report
        </motion.h2>
        <motion.form
          {...fadeIn}
          transition={{ delay: 0.1 }}
          onSubmit={handleSendReport}
          className="bg-white dark:bg-gray-700 p-6 sm:p-8 rounded-lg shadow-2xl space-y-6"
        >
          <div>
            <label
              htmlFor="userSelect"
              className="block mb-2 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200"
            >
              Select User
            </label>
            <select
              id="userSelect"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full p-2 sm:p-3 border rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-gray-200 text-sm sm:text-base focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500"
              aria-label="Select a user"
              required
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.email} ({user.role})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="sectionSelect"
              className="block mb-2 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200"
            >
              Select Section (Optional)
            </label>
            <select
              id="sectionSelect"
              value={selectedSection}
              onChange={(e) => {
                setSelectedSection(e.target.value);
                setSelectedSubsection('');
              }}
              className="w-full p-2 sm:p-3 border rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-gray-200 text-sm sm:text-base focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500"
              aria-label="Select a section"
            >
              <option value="">All Sections</option>
              {sections.map((sec) => (
                <option key={sec._id} value={sec._id}>
                  {sec.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="subsectionSelect"
              className="block mb-2 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200"
            >
              Select Subsection (Optional)
            </label>
            <select
              id="subsectionSelect"
              value={selectedSubsection}
              onChange={(e) => setSelectedSubsection(e.target.value)}
              className="w-full p-2 sm:p-3 border rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-gray-200 text-sm sm:text-base focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!selectedSection}
              aria-label="Select a subsection"
            >
              <option value="">All Subsections</option>
              {filteredSubsections.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>
          <motion.button
            whileHover={buttonHover}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-3 rounded-lg text-sm sm:text-base hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            aria-label="Send report"
          >
            {loading ? 'Sending...' : 'Send Report'}
          </motion.button>
        </motion.form>
      </motion.div>
    </ProtectedRoute>
  );
}

export default SendReport;