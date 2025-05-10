import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { getResponses, getCategories } from '../services/api';
import { pageTransition, fadeIn, cardAnimation } from '../animations/framerAnimations';
import LoadingSpinner from '../components/LoadingSpinner';
import ProtectedRoute from '../components/ProtectedRoute';
import CircularProgress from '../components/CircularProgress';

// Define new animation for table rows
const rowAnimation = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.3, ease: 'easeOut' }
};

// Animation for score and correct answer cells
const cellAnimation = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration: 0.2, ease: 'easeInOut' }
};

function ShowReport() {
  const [responses, setResponses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const role = localStorage.getItem('role');
        const [responseData, categoryData] = await Promise.all([
          getResponses(role),
          getCategories()
        ]);
        setResponses(responseData);
        setCategories(categoryData);
        setLoading(false);
      } catch (err) {
        toast.error(err.message || 'Failed to fetch data');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Group responses by user and category
  const groupedResponses = responses.reduce((acc, response) => {
    // Validate response data
    if (!response?.userId?._id) {
      console.warn('Skipping response with invalid userId:', response);
      return acc;
    }
    if (!response?.surveyId) {
      console.warn('Skipping response with missing surveyId:', response);
      return acc;
    }

    const userId = response.userId._id;
    const categoryId = response.surveyId?.categoryId?._id || 'uncategorized';
    const categoryName = response.surveyId?.categoryId?.name || 'Uncategorized';

    if (!acc[userId]) {
      acc[userId] = {
        email: response.userId.email || 'Unknown',
        role: response.userId.role || 'unknown',
        categories: {},
        totalScore: 0,
        totalPossible: 0,
      };
    }
    if (!acc[userId].categories[categoryId]) {
      acc[userId].categories[categoryId] = {
        name: categoryName,
        responses: [],
        score: 0,
        total: 0,
      };
    }
    acc[userId].categories[categoryId].responses.push(response);
    acc[userId].categories[categoryId].score += response.score || 0;
    acc[userId].categories[categoryId].total += 1;
    acc[userId].totalScore += response.score || 0;
    acc[userId].totalPossible += 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <motion.div {...fadeIn} className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner />
      </motion.div>
    );
  }

  return (
    <ProtectedRoute allowedRole="admin">
      <motion.div {...pageTransition} className="container mx-auto p-4 sm:p-6 max-w-5xl">
        <motion.h2 {...fadeIn} className="text-2xl sm:text-3xl font-bold mb-6 text-primary-blue text-center">
          Survey Report
        </motion.h2>
        {Object.values(groupedResponses).length > 0 ? (
          <div className="space-y-8">
            {Object.values(groupedResponses).map((userData, index) => (
              <motion.div
                key={userData.email}
                {...cardAnimation}
                transition={{ delay: 0.2 * index }}
                className="report-card bg-card-bg dark:bg-card-dark-bg p-4 sm:p-6 rounded-lg shadow-lg"
              >
                <h3 className="text-lg sm:text-xl font-semibold text-primary-blue mb-4">
                  {userData.email} ({userData.role.charAt(0).toUpperCase() + userData.role.slice(1)})
                </h3>
                <div className="summary-card bg-gray border border-gray-200 rounded-2xl p-6 mb-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                  <h4 className="text-xl sm:text-2xl font-extrabold text-black-800 text-center mb-6">
                    Your Performance
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-blue-50 rounded-lg p-3 sm:p-4">
                      <span className="text-base sm:text-lg text-gray-700">Gained Marks:</span>
                      <span className="text-base sm:text-lg font-bold text-blue-600">{userData.totalScore}</span>
                    </div>
                    <div className="flex justify-between items-center bg-green-50 rounded-lg p-3 sm:p-4">
                      <span className="text-base sm:text-lg text-gray-700">Total Marks:</span>
                      <span className="text-base sm:text-lg font-bold text-green-600">{userData.totalPossible}</span>
                    </div>
                    <div className="flex justify-between items-center bg-purple-50 rounded-lg p-3 sm:p-4">
                      <span className="text-base sm:text-lg text-gray-700">Percentage:</span>
                      <span className="text-base sm:text-lg font-bold text-purple-600">
                        {userData.totalPossible > 0
                          ? ((userData.totalScore / userData.totalPossible) * 100).toFixed(2)
                          : '0.00'}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {Object.values(userData.categories).map((category, catIndex) => (
                    <CircularProgress
                      key={catIndex}
                      score={category.score}
                      total={category.total}
                      title={`${category.name} (${category.score}/${category.total})`}
                    />
                  ))}
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm sm:text-base">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Question
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Your Answer
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Score
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Correct Answer
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-card-bg dark:bg-card-dark-bg divide-y divide-gray-200 dark:divide-gray-700">
                      {Object.values(userData.categories).flatMap(category =>
                        category.responses.map((response, rowIndex) => (
                          <motion.tr
                            key={response._id}
                            {...rowAnimation}
                            transition={{ delay: 0.1 * rowIndex }}
                          >
                            <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-gray-900 dark:text-gray-300">
                              {category.name}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-900 dark:text-gray-300">
                              {response.surveyId?.question || 'N/A'}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-900 dark:text-gray-300">
                              {response.answer || 'N/A'}
                            </td>
                            <motion.td
                              className={`px-2 sm:px-4 py-2 sm:py-3 ${
                                response.score > 0 ? 'text-gray-900 dark:text-gray-300' : 'text-red-500 dark:text-red-400'
                              } font-semibold`}
                              {...cellAnimation}
                            >
                              {response.score ?? 'N/A'}
                            </motion.td>
                            <motion.td
                              className={`px-2 sm:px-4 py-2 sm:py-3 ${
                                response.answer === response.surveyId?.correctOption
                                  ? 'text-gray-900 dark:text-gray-300 font-semibold'
                                  : 'text-gray-900 dark:text-gray-300'
                              }`}
                              {...cellAnimation}
                            >
                              {response.surveyId?.correctOption || 'N/A'}
                            </motion.td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.p
            {...fadeIn}
            className="text-gray-600 dark:text-gray-300 text-center text-base sm:text-lg"
          >
            No responses available.
          </motion.p>
        )}
      </motion.div>
    </ProtectedRoute>
  );
}

export default ShowReport;