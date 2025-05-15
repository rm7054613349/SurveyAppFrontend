import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { getUsers, getSections, getSubsections, sendReportByUser } from '../services/api';
import { pageTransition, fadeIn, buttonHover } from '../animations/framerAnimations';
import LoadingSpinner from '../components/LoadingSpinner';
import ProtectedRoute from '../components/ProtectedRoute';

function SendReport() {
  const [users, setUsers] = useState([]);
  const [sections, setSections] = useState([]);
  const [subsections, setSubsections] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSubsection, setSelectedSubsection] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, sectionData, subsectionData] = await Promise.all([
          getUsers(),
          getSections(),
          getSubsections(),
        ]);
        setUsers(userData);
        setSections(sectionData);
        setSubsections(subsectionData);
        setLoading(false);
      } catch (err) {
        toast.error(err.message || 'Failed to fetch data');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredSubsections = subsections.filter(
    (sub) => !selectedSection || sub.sectionId._id === selectedSection
  );

  const handleSendReport = async (e) => {
    e.preventDefault();
    if (!selectedUser) {
      toast.error('Please select a user');
      return;
    }
    try {
      setLoading(true);
      await sendReportByUser(selectedUser, selectedSection || undefined, selectedSubsection || undefined);
      toast.success('Report sent successfully!');
      setSelectedUser('');
      setSelectedSection('');
      setSelectedSubsection('');
      setLoading(false);
    } catch (err) {
      toast.error(err.message || 'Failed to send report');
      setLoading(false);
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
      <motion.div {...pageTransition} className="container mx-auto p-4 sm:p-6 max-w-lg">
        <motion.h2 {...fadeIn} className="text-2xl sm:text-3xl font-bold mb-6 text-primary-blue text-center">
          Send Report
        </motion.h2>
        <motion.form
          {...fadeIn}
          transition={{ delay: 0.1 }}
          onSubmit={handleSendReport}
          className="bg-card-bg dark:bg-card-dark-bg p-6 sm:p-8 rounded-lg shadow-lg space-y-6"
        >
          <div>
            <label className="block mb-2 text-gray-700 dark:text-gray-300 text-sm sm:text-base font-medium">
              Select User
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full p-2 sm:p-3 border rounded dark:bg-gray-800 dark:text-white text-sm sm:text-base focus:ring-2 focus:ring-secondary-green"
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
            <label className="block mb-2 text-gray-700 dark:text-gray-300 text-sm sm:text-base font-medium">
              Select Section (Optional)
            </label>
            <select
              value={selectedSection}
              onChange={(e) => {
                setSelectedSection(e.target.value);
                setSelectedSubsection('');
              }}
              className="w-full p-2 sm:p-3 border rounded dark:bg-gray-800 dark:text-white text-sm sm:text-base focus:ring-2 focus:ring-secondary-green"
            >
              <option value="">All Sections</option>
              {sections.map((sec) => (
                <option key={sec._id} value={sec._id}>{sec.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2 text-gray-700 dark:text-gray-300 text-sm sm:text-base font-medium">
              Select Subsection (Optional)
            </label>
            <select
              value={selectedSubsection}
              onChange={(e) => setSelectedSubsection(e.target.value)}
              className="w-full p-2 sm:p-3 border rounded dark:bg-gray-800 dark:text-white text-sm sm:text-base focus:ring-2 focus:ring-secondary-green"
              disabled={!selectedSection}
            >
              <option value="">All Subsections</option>
              {filteredSubsections.map((sub) => (
                <option key={sub._id} value={sub._id}>{sub.name}</option>
              ))}
            </select>
          </div>
          <motion.button
            whileHover={buttonHover}
            type="submit"
            className="w-full bg-primary-blue text-white p-3 rounded-lg text-sm sm:text-base hover:bg-primary-blue/90 focus:ring-2 focus:ring-primary-blue"
          >
            Send Report
          </motion.button>
        </motion.form>
      </motion.div>
    </ProtectedRoute>
  );
}

export default SendReport;