import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getResponsesBySubsection } from '../services/api';
import { pageTransition, fadeIn, cardAnimation } from '../animations/framerAnimations';
import LoadingSpinner from '../components/LoadingSpinner';
import ProtectedRoute from '../components/ProtectedRoute';
import CircularProgress from '../components/CircularProgress';

const rowAnimation = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.3, ease: 'easeOut' },
};

const cellAnimation = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration: 0.2, ease: 'easeInOut' },
};

function ShowReport() {
  const { subsectionId } = useParams();
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalScore, setTotalScore] = useState(0);
  const [totalPossible, setTotalPossible] = useState(0);
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const role = localStorage.getItem('role');
        if (role !== 'admin') {
          toast.error('Unauthorized access');
          setLoading(false);
          return;
        }

        const responseData = await getResponsesBySubsection(subsectionId);
        const validResponses = responseData.filter(
          (response) => response?.userId?._id && response?.surveyId?.question
        );

        setResponses(validResponses);

        // Calculate total score and possible score
        const score = validResponses.reduce((sum, response) => sum + (response.score || 0), 0);
        const possible = validResponses.reduce(
          (sum, response) => sum + (response.surveyId?.maxScore || 1),
          0
        );
        const percent = possible > 0 ? ((score / possible) * 100).toFixed(2) : 0;

        setTotalScore(score);
        setTotalPossible(possible);
        setPercentage(percent);

        // Log warnings for invalid responses
        const invalidResponses = responseData.filter(
          (response) => !response?.userId?._id || !response?.surveyId?.question
        );
        if (invalidResponses.length > 0) {
          console.warn('Found invalid responses:', invalidResponses);
        }

        setLoading(false);
      } catch (err) {
        toast.error(err.message || 'Failed to fetch responses');
        setLoading(false);
      }
    };
    fetchData();
  }, [subsectionId]);

  // Group responses by user
  const groupedResponses = responses.reduce((acc, response) => {
    const userId = response.userId._id;
    if (!acc[userId]) {
      acc[userId] = {
        email: response.userId.email || 'Unknown',
        role: response.userId.role || 'unknown',
        responses: [],
        score: 0,
        total: 0,
      };
    }
    acc[userId].responses.push(response);
    acc[userId].score += response.score || 0;
    acc[userId].total += response.surveyId?.maxScore || 1;
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
          Subsection Report
        </motion.h2>
        <motion.div {...fadeIn} transition={{ delay: 0.2 }} className="space-y-6">
          {Object.entries(groupedResponses).length > 0 ? (
            Object.entries(groupedResponses).map(([userId, userData]) => {
              const userPercentage = userData.total > 0
                ? ((userData.score / userData.total) * 100).toFixed(2)
                : 0;

              return (
                <motion.div
                  key={userId}
                  {...cardAnimation}
                  className="bg-card-bg dark:bg-card-dark-bg p-4 sm:p-6 rounded-lg shadow-lg"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                        {userData.email}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Role: {userData.role.toUpperCase()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                      <CircularProgress percentage={userPercentage} />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Score: {userData.score} / {userData.total}
                        </p>
                        <p className="text-sm font-semibold text-secondary-green">
                          {userPercentage}%
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto mt-2">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-primary-blue text-white">
                        <tr>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium uppercase tracking-wider">
                            Question
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium uppercase tracking-wider">
                            Answer
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium uppercase tracking-wider">
                            Correct Answer
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium uppercase tracking-wider">
                            Score
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {userData.responses.map((response, index) => (
                          <motion.tr
                            key={response._id}
                            {...rowAnimation}
                            transition={{ delay: index * 0.1 }}
                          >
                            <motion.td
                              {...cellAnimation}
                              className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 dark:text-gray-300"
                            >
                              {response.surveyId?.question || 'N/A'}
                            </motion.td>
                            <motion.td
                              {...cellAnimation}
                              className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 dark:text-gray-300"
                            >
                              {response.surveyId?.questionType === 'file-upload' ? (
                                response.fileUrl ? (
                                  <a
                                    href={`/api/files/${response.fileUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-secondary-green hover:underline"
                                  >
                                    View File
                                  </a>
                                ) : (
                                  'No File Uploaded'
                                )
                              ) : (
                                response.answer || 'No Answer'
                              )}
                            </motion.td>
                            <motion.td
                              {...cellAnimation}
                              className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 dark:text-gray-300"
                            >
                              {response.surveyId?.questionType === 'multiple-choice'
                                ? response.surveyId?.correctOption || 'N/A'
                                : 'N/A'}
                            </motion.td>
                            <motion.td
                              {...cellAnimation}
                              className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 dark:text-gray-300"
                            >
                              {response.score ?? 0} / {response.surveyId?.maxScore || 1}
                            </motion.td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.p
              {...fadeIn}
              className="text-gray-600 dark:text-gray-300 text-sm sm:text-base text-center"
            >
              No responses available for this subsection.
            </motion.p>
          )}
        </motion.div>
      </motion.div>
    </ProtectedRoute>
  );
}

export default ShowReport;