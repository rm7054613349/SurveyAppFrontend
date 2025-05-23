import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { pageTransition, fadeIn, buttonHover, cardAnimation } from '../animations/framerAnimations';
import ProtectedRoute from '../components/ProtectedRoute';


const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};
function AdminDashboard() {
  return (
    <ProtectedRoute allowedRole="admin">
      <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-[#E5E7EB] dark:bg-[#1F2937] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
    >
      <motion.div {...pageTransition} className="container mx-auto p-6 content-box">
        <motion.h2 {...fadeIn} className="text-3xl font-bold mb-6 text-primary-blue">
          Admin Dashboard
        </motion.h2>
        <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {[
            { to: '/admin/create-question', title: 'Create Question', desc: 'Add new survey questions by category' },
            { to: '/admin/view-questions', title: 'View Questions', desc: 'See all survey questions by category' },
            { to: '/admin/show-report', title: 'Show Report', desc: 'View user responses for all subsections' },
            // { to: '/admin/send-report', title: 'Send Report', desc: 'Email response reports to users' },
          ].map((item, index) => (
            <Link key={index} to={item.to}>
              <motion.div
                whileHover={buttonHover}
                {...cardAnimation}
                transition={{ delay: 0.2 * index }}
                className="bg-card-bg dark:bg-card-dark-bg p-6 rounded-lg shadow-lg text-center content-box"
              >
                <h3 className="text-lg font-semibold text-primary-blue">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{item.desc}</p>
              </motion.div>
            </Link>
          ))}
        </motion.div>
        <motion.div {...fadeIn} transition={{ delay: 0.2 }} className="mt-8 text-center">
          <Link to="/">
            {/* <motion.button
              whileHover={buttonHover}
              className="bg-primary-blue text-white px-6 py-3 rounded-lg"
            >
              Back to Home
            </motion.button> */}
          </Link>
        </motion.div>
      </motion.div>
      </motion.div>
    </ProtectedRoute>
  );
}

export default AdminDashboard;