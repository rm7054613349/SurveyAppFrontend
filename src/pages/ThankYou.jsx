import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getResponses, getCategories } from '../services/api';
import { pageTransition, fadeIn, cardAnimation, buttonHover } from '../animations/framerAnimations';
import LoadingSpinner from '../components/LoadingSpinner';

// Animation for response card fields
const fieldAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: 'easeOut' }
};

function ThankYou() {
  const [responses, setResponses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gainedMarks, setGainedMarks] = useState(0);
  const [totalMarks, setTotalMarks] = useState(0);
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [responseData, categoryData] = await Promise.all([
          getResponses(),
          getCategories(),
        ]);
        setResponses(responseData);
        setCategories(categoryData);

        // Filter valid responses (those with surveyId and question)
        const validResponses = responseData.filter(
          (response) => response?.surveyId && response.surveyId?.question
        );

        // Calculate gained and total marks
        const gained = validResponses.reduce((sum, response) => {
          // If answer is null, undefined, or empty, score is 0
          const isUnselected = !response.answer || response.answer.trim() === '';
          return sum + (isUnselected ? 0 : response.score || 0);
        }, 0);
        const total = validResponses.length;
        const percent = total > 0 ? (gained / total) * 100 : 0;

        setGainedMarks(gained);
        setTotalMarks(total);
        setPercentage(percent.toFixed(2));

        // Log warnings for invalid responses
        const invalidResponses = responseData.filter(
          (response) => !response?.surveyId || !response.surveyId?.question
        );
        if (invalidResponses.length > 0) {
          console.warn('Found invalid responses (missing surveyId or question):', invalidResponses);
        }

        setLoading(false);
      } catch (err) {
        toast.error(err.message || 'Failed to load responses');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <motion.div {...fadeIn} className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner />
      </motion.div>
    );
  }

  // Filter responses to only show those with valid surveyId and question
  const validResponses = responses.filter(
    (response) => response?.surveyId && response.surveyId?.question
  );

  return (
    <motion.div
      {...pageTransition}
      className="container mx-auto p-6 min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800"
    >
      <motion.h2
        {...fadeIn}
        className="text-4xl md:text-5xl font-extrabold mb-10 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500 dark:from-blue-400 dark:to-green-400"
      >
        Thank You for Your Submission!
      </motion.h2>

      {/* Summary Card */}
      <motion.div
        {...fadeIn}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl mb-10 max-w-lg mx-auto border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">
          Your Performance
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
            <span className="text-lg md:text-xl text-gray-700 dark:text-gray-300">Gained Marks:</span>
            <span className="text-lg md:text-xl font-bold text-blue-600 dark:text-blue-400">{gainedMarks}</span>
          </div>
          <div className="flex justify-between items-center bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
            <span className="text-lg md:text-xl text-gray-700 dark:text-gray-300">Total Marks:</span>
            <span className="text-lg md:text-xl font-bold text-green-600 dark:text-green-400">{totalMarks}</span>
          </div>
          <div className="flex justify-between items-center bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
            <span className="text-lg md:text-xl text-gray-700 dark:text-gray-300">Percentage:</span>
            <span className="text-lg md:text-xl font-bold text-purple-600 dark:text-purple-400">{percentage}%</span>
          </div>
        </div>
      </motion.div>

      {/* Detailed Responses */}
      {validResponses.length === 0 ? (
        <motion.p
          {...fadeIn}
          className="text-gray-600 dark:text-gray-400 text-center text-lg md:text-xl"
        >
          No valid responses found.
        </motion.p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {validResponses.map((response, index) => {
            const category = categories.find(
              (cat) => cat._id === response.surveyId?.categoryId?._id
            );
            const isUnselected = !response.answer || response.answer.trim() === '';
            return (
              <motion.div
                key={response._id}
                {...cardAnimation}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
              >
                <motion.h3
                  {...fieldAnimation}
                  transition={{ delay: index * 0.1 + 0.2 }}
                  className="text-lg md:text-xl font-semibold mb-3 text-gray-900 dark:text-white line-clamp-2"
                >
                  {response.surveyId?.question || 'No question available'}
                </motion.h3>
                <motion.p
                  {...fieldAnimation}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="text-gray-600 dark:text-gray-400 mb-2 text-sm md:text-base"
                >
                  <strong>Category:</strong>{' '}
                  {category?.name || 'No category available'}
                </motion.p>
                <motion.p
                  {...fieldAnimation}
                  transition={{ delay: index * 0.1 + 0.4 }}
                  className="text-gray-600 dark:text-gray-400 mb-2 text-sm md:text-base"
                >
                  <strong>Your Answer:</strong>{' '}
                  <span
                    className={`${
                      isUnselected
                        ? 'text-red-500'
                        : response.answer === response.surveyId?.correctOption
                        ? 'text-green-600 dark:text-green-400 font-semibold'
                        : 'text-red-500 dark:text-red-400'
                    }`}
                  >
                    {response.answer || 'Unselected'}
                    {response.answer && response.surveyId?.correctOption && (
                      <span className="ml-2">
                        {response.answer === response.surveyId.correctOption ? (
                          <span className="text-green-500">✔</span>
                        ) : (
                          <span className="text-red-500">✘</span>
                        )}
                      </span>
                    )}
                  </span>
                </motion.p>
                <motion.p
                  {...fieldAnimation}
                  transition={{ delay: index * 0.1 + 0.5 }}
                  className="text-gray-600 dark:text-gray-400 mb-2 text-sm md:text-base"
                >
                  <strong>Correct Answer:</strong>{' '}
                  <span
                    className={`${
                      response.answer && response.answer === response.surveyId?.correctOption
                        ? 'text-green-600 dark:text-green-400 font-semibold'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {response.surveyId?.correctOption || 'N/A'}
                  </span>
                </motion.p>
                <motion.p
                  {...fieldAnimation}
                  transition={{ delay: index * 0.1 + 0.6 }}
                  className={`text-sm md:text-base ${
                    isUnselected || response.score === 0
                      ? 'text-red-500 dark:text-red-400'
                      : 'text-green-600 dark:text-green-400'
                  }`}
                >
                  <strong>Score:</strong>{' '}
                  {isUnselected ? 0 : response.score ?? 0}
                </motion.p>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* View Detailed Report Button */}
      {/* <motion.div
        {...fadeIn}
        transition={{ delay: 0.4 }}
        className="mt-12 text-center"
      >
        <Link to="/employee/show-report">
          <motion.button
            whileHover={buttonHover}
            className="bg-gradient-to-r from-blue-600 to-green-500 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-green-600 dark:hover:from-blue-500 dark:hover:to-green-400 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            View Detailed Report
          </motion.button>
        </Link>
      </motion.div> */}
    </motion.div>
  );
}

export default ThankYou;