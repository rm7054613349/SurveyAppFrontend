import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { pageTransition, fadeIn, buttonHover,cardAnimation } from '../animations/framerAnimations';
import ProtectedRoute from '../components/ProtectedRoute';

function OpenSurvey() {
  const [isReattempt, setIsReattempt] = useState(false);
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/employee/ready', { state: { isReattempt } });
  };

  return (
    <ProtectedRoute allowedRole="employee">
      <motion.div {...pageTransition} className="container mx-auto p-6 text-center content-box">
        <motion.h2 {...fadeIn} className="text-3xl font-bold mb-6 text-primary-blue">
          Open Survey
        </motion.h2>
        <motion.p {...fadeIn} transition={{ delay: 0.1 }} className="text-lg text-gray-700 dark:text-gray-300 mb-8">
          Ready to {isReattempt ? 'reattempt' : 'start'} your survey? Let's get started!
        </motion.p>
        {/* <motion.div {...fadeIn} transition={{ delay: 0.2 }} className="mb-6">
          <label className="flex items-center justify-center space-x-2 text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={isReattempt}
              onChange={() => setIsReattempt(!isReattempt)}
              className="h-5 w-5"
            />
            <span>Reattempt Survey</span>
          </label>
        </motion.div> */}
        <motion.button
          whileHover={buttonHover}
          {...fadeIn}
          transition={{ delay: 0.3 }}
          onClick={handleStart}
          className="bg-primary-blue text-white px-6 py-3 rounded-lg"
        >
          Start Survey
        </motion.button>
      </motion.div>
    </ProtectedRoute>
  );
}

export default OpenSurvey;