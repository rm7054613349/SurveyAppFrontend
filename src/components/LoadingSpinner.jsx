import { motion } from 'framer-motion';

function LoadingSpinner() {
  return (
    <motion.div
      className="flex justify-center items-center h-32"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary-blue"></div>
    </motion.div>
  );
}

export default LoadingSpinner;