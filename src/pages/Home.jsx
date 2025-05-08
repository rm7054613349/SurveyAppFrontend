import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { pageTransition, fadeIn, buttonHover,cardAnimation } from '../animations/framerAnimations';

function Home() {
  return (
    <motion.div {...pageTransition} className="container mx-auto p-6 text-center content-box">
      <motion.h1
        {...fadeIn}
        className="text-5xl font-bold mb-6 text-primary-blue"
      >
        Welcome to SurveyApp
      </motion.h1>
      <motion.p
        {...fadeIn}
        transition={{ delay: 0.2 }}
        className="text-xl text-gray-700 dark:text-gray-300 mb-8"
      >
        Engage, Analyze, and Improve with our cutting-edge survey platform.
      </motion.p>
      <motion.div
        {...fadeIn}
        transition={{ delay: 0.4 }}
        className="flex justify-center space-x-4"
      >
        <Link to="/signup">
          <motion.button
            whileHover={buttonHover}
            className="bg-primary-blue text-white px-6 py-3 rounded-full text-lg"
          >
            Get Started
          </motion.button>
        </Link>
        <Link to="/login">
          <motion.button
            whileHover={buttonHover}
            className="bg-accent-orange text-white px-6 py-3 rounded-full text-lg"
          >
            Login
          </motion.button>
        </Link>
      </motion.div>
      <motion.div
        {...fadeIn}
        transition={{ delay: 0.6 }}
        className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {[
          { title: 'Create Surveys', desc: 'Design custom surveys with ease.' },
          { title: 'Analyze Responses', desc: 'Gain insights with detailed reports.' },
          { title: 'Engage Teams', desc: 'Foster collaboration and feedback.' },
        ].map((feature, index) => (
          <motion.div
            key={index}
            {...cardAnimation}
            transition={{ delay: 0.2 * index }}
            className="bg-card-bg dark:bg-card-dark-bg p-6 rounded-lg shadow-lg content-box"
          >
            <h3 className="text-lg font-semibold text-primary-blue">{feature.title}</h3>
            <p className="text-gray-600 dark:text-gray-300">{feature.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

export default Home;