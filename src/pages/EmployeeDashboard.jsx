import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { pageTransition, fadeIn, buttonHover, cardAnimation } from '../animations/framerAnimations';
import ProtectedRoute from '../components/ProtectedRoute';

function EmployeeDashboard() {
  return (
    <ProtectedRoute allowedRole="employee">
      <motion.div {...pageTransition} className="container mx-auto p-6 content-box">
        <motion.h2 {...fadeIn} className="text-3xl font-bold mb-6 text-primary-blue">
          Employee Dashboard
        </motion.h2>
        <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="p-6 rounded-lg shadow-lg text-center w-full max-w-md mx-auto"
        >
          <Link to="/employee/open-survey">
            <motion.div
              whileHover={buttonHover}      
              {...cardAnimation}              
             className="bg-card-bg dark:bg-card-dark-bg p-6 rounded-lg shadow-lg text-center content-box w-full max-w-md mx-auto"
            >
              <h3 className="text-lg font-semibold text-primary-blue">Open Survey</h3>
              <p className="text-gray-600 dark:text-gray-300">Start or continue your survey</p>
            </motion.div>
          </Link>
          {/* <Link to="/employee/open-survey">
            <motion.div
              whileHover={buttonHover}
              {...cardAnimation}
              className="bg-card-bg dark:bg-card-dark-bg p-6 rounded-lg shadow-lg text-center content-box"
            >
              <h3 className="text-lg font-semibold text-primary-blue">Reattempt Survey</h3>
              <p className="text-gray-600 dark:text-gray-300">Retake the survey to improve your score</p>
            </motion.div>
          </Link> */}
        </motion.div>
        <motion.div {...fadeIn} transition={{ delay: 0.2 }} className="mt-8 text-center">
          <Link to="/">
            <motion.button
              whileHover={buttonHover}
              className="bg-primary-blue text-white px-6 py-3 rounded-lg"
            >
              Back to Home
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </ProtectedRoute>
  );
}

export default EmployeeDashboard;