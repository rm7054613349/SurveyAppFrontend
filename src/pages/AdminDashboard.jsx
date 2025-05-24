import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { pageTransition, slideInRight, buttonHover, imageAnimation } from '../animations/framerAnimations';
import ProtectedRoute from '../components/ProtectedRoute';
import CreateQuestionImg from '../assets/CreateQ.jpg';
import ViewQuestionsImg from '../assets/ViewQ.jpg';
import ShowReportImg from '../assets/report.jpg';

// Container variants with staggered children for professional entrance
const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: 'easeOut',
      when: 'beforeChildren',
      staggerChildren: 0.2,
    },
  },
};

function AdminDashboard() {
  return (
    <ProtectedRoute allowedRole="admin">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="min-h-screen  dark:bg-[#1F2937] py-12 px-4 sm:px-6 lg:px-8"
      >
        <motion.div {...pageTransition} className="container mx-auto w-full max-w-full p-4 sm:p-6">
          {/* Section 1: Create Question */}
          <motion.div
            variants={slideInRight}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row gap-6 sm:gap-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-4 sm:p-6 mb-6 sm:mb-8 w-full"
          >
            <motion.div
              variants={imageAnimation}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
              className="sm:w-1/2 flex items-center"
            >
              <img
                src={CreateQuestionImg}
                alt="Create Question"
                className="w-full h-48 sm:h-64 md:h-80 object-cover rounded-lg shadow-md"
                loading="lazy"
              />
            </motion.div>
            <div className="sm:w-1/2 flex flex-col justify-center text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Create Question
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
                Add new survey questions by category
              </p>
              <Link to="/admin/create-question">
                <motion.button
                  whileHover={buttonHover}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-teal-500 text-white text-sm font-medium rounded-full hover:bg-teal-600 transition-colors shadow-md hover:shadow-lg w-fit mx-auto sm:mx-0"
                  aria-label="Navigate to create question"
                >
                  Go to Create Question
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Section 2: View Questions */}
          <motion.div
            variants={slideInRight}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row-reverse gap-6 sm:gap-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-4 sm:p-6 mb-6 sm:mb-8 w-full"
          >
            <motion.div
              variants={imageAnimation}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
              className="sm:w-1/2 flex items-center"
            >
              <img
                src={ViewQuestionsImg}
                alt="View Questions"
                className="w-full h-48 sm:h-64 md:h-80 object-cover rounded-lg shadow-md"
                loading="lazy"
              />
            </motion.div>
            <div className="sm:w-1/2 flex flex-col justify-center text-center sm:text-right">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                View Questions
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
                See all survey questions by category
              </p>
              <Link to="/admin/view-questions">
                <motion.button
                  whileHover={buttonHover}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-teal-500 text-white text-sm font-medium rounded-full hover:bg-teal-600 transition-colors shadow-md hover:shadow-lg w-fit mx-auto sm:mx-0"
                  aria-label="Navigate to view questions"
                >
                  Go to View Questions
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Section 3: Show Report */}
          <motion.div
            variants={slideInRight}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row gap-6 sm:gap-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-4 sm:p-6 mb-6 sm:mb-8 w-full"
          >
            <motion.div
              variants={imageAnimation}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
              className="sm:w-1/2 flex items-center"
            >
              <img
                src={ShowReportImg}
                alt="Show Report"
                className="w-full h-48 sm:h-64 md:h-80 object-cover rounded-lg shadow-md"
                loading="lazy"
              />
            </motion.div>
            <div className="sm:w-1/2 flex flex-col justify-center text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Show Report
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
                View user responses for all subsections
              </p>
              <Link to="/admin/show-report">
                <motion.button
                  whileHover={buttonHover}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-teal-500 text-white text-sm font-medium rounded-full hover:bg-teal-600 transition-colors shadow-md hover:shadow-lg w-fit mx-auto sm:mx-0"
                  aria-label="Navigate to show report"
                >
                  Go to Show Report
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </ProtectedRoute>
  );
}

export default AdminDashboard;