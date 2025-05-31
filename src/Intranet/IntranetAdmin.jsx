import { motion } from 'framer-motion';
import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Import images (placeholders, replace with actual paths)
import announcementImage from '../assets/announcementImage.jpg';
import eventCalendarImage from '../assets/eventCalendarImage.jpg';
import dataCenterImage from '../assets/dataCenterImage.jpg';
import AnnouncementForm from '../Intranet/components/AnnouncementForm'

// Framer Motion animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

const slideInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

const slideInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

function IntranetAdmin() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect to login if not authenticated or not admin
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !user || user?.role !== 'admin') {
      console.log('IntranetAdmin: User not authenticated or not admin. Redirecting to /...');
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#afeeee]">
      {/* Announcement Section */}
      <motion.div
        variants={slideInLeft}
        initial="hidden"
        animate="visible"
        className="flex flex-col sm:flex-row gap-4 sm:gap-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-4 sm:p-6 mb-6 sm:mb-8 w-full"
      >
        <div className="sm:w-1/2 flex items-center">
          <img
            src={announcementImage}
            alt="Announcement banner"
            className="w-full h-48 sm:h-64 md:h-80 object-cover rounded-lg shadow-md"
            loading="lazy"
          />
        </div>
        <div className="sm:w-1/2 flex flex-col justify-center">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Announcements
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
            Create, manage, and broadcast important announcements to keep your team informed and engaged.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/admin/announcementsform')}
            className="px-4 py-2 bg-teal-500 text-white text-sm font-medium rounded-full hover:bg-teal-600 transition-colors shadow-md hover:shadow-lg w-fit"
            aria-label="Navigate to announcements"
          >
            Go To
          </motion.button>
        </div>
      </motion.div>

      {/* Event Calendar Section */}
      <motion.div
        variants={slideInRight}
        initial="hidden"
        animate="visible"
        className="flex flex-col sm:flex-row gap-4 sm:gap-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-4 sm:p-6 mb-6 sm:mb-8 w-full"
      >
        <div className="sm:w-1/2 flex flex-col justify-center order-1 sm:order-0">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Event Calendar
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
            Schedule and manage company events, meetings, and deadlines with an interactive calendar.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/admin/eventform')}
            className="px-4 py-2 bg-teal-500 text-white text-sm font-medium rounded-full hover:bg-teal-600 transition-colors shadow-md hover:shadow-lg w-fit"
            aria-label="Navigate to events"
          >
            Go To
          </motion.button>
        </div>
        <div className="sm:w-1/2 flex items-center order-0 sm:order-1">
          <img
            src={eventCalendarImage}
            alt="Event calendar overview"
            className="w-full h-48 sm:h-64 md:h-80 object-cover rounded-lg shadow-md"
            loading="lazy"
          />
        </div>
      </motion.div>

      {/* Data Center Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col sm:flex-row gap-4 sm:gap-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-4 sm:p-6 w-full"
      >
        <div className="sm:w-1/2 flex items-center">
          <img
            src={dataCenterImage}
            alt="Data center dashboard"
            className="w-full h-48 sm:h-64 md:h-80 object-cover rounded-lg shadow-md"
            loading="lazy"
          />
        </div>
        <div className="sm:w-1/2 flex flex-col justify-center">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Document Center
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
            Access centralized data, generate reports, and analyze key metrics to drive informed decisions.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/admin/documentcenter')}
            className="px-4 py-2 bg-teal-500 text-white text-sm font-medium rounded-full hover:bg-teal-600 transition-colors shadow-md hover:shadow-lg w-fit"
            aria-label="Navigate to data center"
          >
            Go To
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

export default IntranetAdmin;