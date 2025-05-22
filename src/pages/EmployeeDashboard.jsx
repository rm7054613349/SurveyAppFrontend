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
        <motion.div
          {...fadeIn}
          transition={{ delay: 0.1 }}
          className="flex flex-row flex-wrap gap-6 justify-center"
        >
          <Link to="/employee/survey">
            <motion.div
              whileHover={buttonHover}
              {...cardAnimation}
              className="bg-card-bg dark:bg-card-dark-bg p-6 rounded-lg shadow-lg text-center content-box w-full max-w-md"
            >
              <h3 className="text-lg font-semibold text-primary-blue">Let's Start Learning Journey with SSMED</h3>
              <p className="text-gray-600 dark:text-gray-300">Start or continue your Journey</p>
            </motion.div>
          </Link>

          {/* <Link to="#">
            <motion.div
              whileHover={buttonHover}
              {...cardAnimation}
              className="bg-card-bg dark:bg-card-dark-bg p-6 rounded-lg shadow-lg text-center content-box w-full max-w-md"
            >
              <h3 className="text-lg font-semibold text-primary-blue">Demo Data</h3>
              <p className="text-gray-600 dark:text-gray-300"> Contrary to popular belief,simply random text.</p>
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