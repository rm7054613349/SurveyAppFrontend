import { useContext } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { fadeIn, buttonHover } from '../animations/framerAnimations';

function ProtectedRoute({ children, allowedRole }) {
  const { user } = useContext(AuthContext);

  if (!user) {
    return (
      <motion.div
        {...fadeIn}
        className="container mx-auto p-6 text-center content-box"
      >
        <h2 className="text-2xl font-bold mb-4 text-primary-blue">
          Access Denied
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Please log in or sign up to access this page.
        </p>
        <motion.div
          whileHover={buttonHover}
          className="inline-block"
        >
          <Link to="/signup" className="bg-primary-blue text-white p-2 rounded">
            Go to Signup
          </Link>
        </motion.div>
      </motion.div>
    );
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;