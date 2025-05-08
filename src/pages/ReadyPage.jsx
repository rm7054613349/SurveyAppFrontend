import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { pageTransition, fadeIn, buttonHover,cardAnimation } from '../animations/framerAnimations';
import ProtectedRoute from '../components/ProtectedRoute';

function ReadyPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const isReattempt = state?.isReattempt || false;

  const handleProceed = () => {
    navigate('/employee/survey', { state: { isReattempt } });
  };

  return (
    <ProtectedRoute allowedRole="employee">
      <motion.div {...pageTransition} className="container mx-auto p-6 text-center content-box">
        <motion.h2 {...fadeIn} className="text-3xl font-bold mb-6 text-primary-blue">
          Are You Ready?
        </motion.h2>
        <motion.p {...fadeIn} transition={{ delay: 0.1 }} className="text-lg text-gray-700 dark:text-gray-300 mb-8">
          You are about to {isReattempt ? 'reattempt' : 'start'} the survey. Make sure you're prepared!
        </motion.p>
        <motion.button
          whileHover={buttonHover}
          {...fadeIn}
          transition={{ delay: 0.2 }}
          onClick={handleProceed}
          className="bg-secondary-green text-white px-6 py-3 rounded-lg"
        >
          I'm Ready!
        </motion.button>
      </motion.div>
    </ProtectedRoute>
  );
}

export default ReadyPage;