import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import Confetti from 'react-confetti';
import { getResponsesBySubsection, getCategories, getSubsections } from '../services/api';
import { pageTransition, fadeIn, cardAnimation } from '../animations/framerAnimations';
import LoadingSpinner from '../components/LoadingSpinner';

// Animation for response card fields
const fieldAnimation = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut' }
};

// Badge animation with "boom" effect
const badgeAnimation = {
  initial: { scale: 0, rotate: 0, opacity: 0 },
  animate: {
    scale: [0, 1.5, 1],
    rotate: [0, 10, -10, 0],
    opacity: 1,
    transition: {
      duration: 1,
      ease: 'easeOut',
      times: [0, 0.5, 0.75, 1],
    }
  }
};

// Particle burst animation
const particleAnimation = {
  initial: { scale: 0, opacity: 1, x: 0, y: 0 },
  animate: (i) => ({
    scale: [0, 1, 0],
    opacity: [1, 1, 0],
    x: Math.cos((i * Math.PI) / 4) * 40,
    y: Math.sin((i * Math.PI) / 4) * 40,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
      delay: i * 0.05
    }
  })
};

// Popup animation (not used but kept for consistency)
const popupAnimation = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
  transition: { duration: 0.3, ease: 'easeOut' }
};

function ThankYou() {
  const { subsectionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [responses, setResponses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subsections, setSubsections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gainedMarks, setGainedMarks] = useState(0);
  const [totalMarks, setTotalMarks] = useState(location.state?.totalMarks || 0);
  const [percentage, setPercentage] = useState(0);
  const [badge, setBadge] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [responseData, categoryData, subsectionData] = await Promise.all([
          getResponsesBySubsection(subsectionId).catch(err => {
            console.error('Failed to fetch responses:', err);
            return [];
          }),
          getCategories().catch(err => {
            console.error('Failed to fetch categories:', err);
            return [];
          }),
          getSubsections().catch(err => {
            console.error('Failed to fetch subsections:', err);
            return [];
          }),
        ]);

        let validResponseData = [];
        if (Array.isArray(responseData)) {
          validResponseData = responseData;
        } else if (responseData && typeof responseData === 'object') {
          validResponseData = responseData.responseDetails && Array.isArray(responseData.responseDetails)
            ? responseData.responseDetails
            : [responseData];
        }

        const validResponses = validResponseData.filter(
          response => response && response.survey
        );

        const normalizedSubsections = Array.isArray(subsectionData)
          ? subsectionData
          : subsectionData && typeof subsectionData === 'object'
          ? Object.values(subsectionData)
          : [];

        setResponses(validResponses);
        setCategories(Array.isArray(categoryData) ? categoryData : []);
        setSubsections(normalizedSubsections);

        const nonDescriptiveResponses = validResponses.filter(
          response => response.survey?.questionType !== 'descriptive'
        );
        const gained = nonDescriptiveResponses.reduce((sum, response) => {
          const isCorrect = response.answer && response.answer === response.survey?.correctOption;
          return sum + (isCorrect ? 1 : 0);
        }, 0);
        const total = totalMarks || nonDescriptiveResponses.length;
        const percent = total > 0 ? (gained / total) * 100 : 0;

        setGainedMarks(gained);
        setTotalMarks(total);
        setPercentage(percent.toFixed(2));

        if (percent >= 70 && total > 0) {
          setShowConfetti(true);
          const subsectionCount = normalizedSubsections.length;
          const subsectionIndex = normalizedSubsections.findIndex(sub => sub._id === subsectionId) + 1;
          
          let badgeType = null;
          if (subsectionCount === 1) {
            badgeType = 'Gold';
          } else if (subsectionCount === 2) {
            badgeType = subsectionIndex === 1 ? 'Silver' : 'Gold';
          } else if (subsectionCount >= 3) {
            if (subsectionIndex === 1) badgeType = 'Bronze';
            else if (subsectionIndex === 2) badgeType = 'Silver';
            else if (subsectionIndex >= 3) badgeType = 'Gold';
          }
          
          setBadge(badgeType);
          setTimeout(() => setShowConfetti(false), 5000);
        }

        setLoading(false);
      } catch (err) {
        console.error('Fetch error:', err);
        toast.error(err.message || 'Failed to load responses');
        setResponses([]);
        setCategories([]);
        setSubsections([]);
        setLoading(false);
      }
    };
    fetchData();
  }, [subsectionId, totalMarks]);

  const allDescriptive = responses.every(response => response.survey?.questionType === 'descriptive');
  const shouldShowBadge = badge !== null;

  const handleBackToSectionClick = () => {
    localStorage.removeItem('currentSubsection');
    localStorage.removeItem('currentQuestionIndex');
    localStorage.removeItem('responses');
    localStorage.removeItem('timers');
    localStorage.removeItem('completedSubsections');
    
    navigate('/employee/survey', {
      state: {
        sectionId: subsections.find(sub => sub._id === subsectionId)?.sectionId?._id,
        percentage: parseFloat(percentage),
      },
    });
  };

  if (loading) {
    return (
      <motion.div
        {...fadeIn}
        className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900"
        aria-label="Loading"
      >
        <LoadingSpinner />
      </motion.div>
    );
  }

  return (
    <motion.div
      {...pageTransition}
      className="min-h-screen bg-gray-100 dark:bg-gray-900 relative"
    >
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={window.innerWidth < 640 ? 80 : 150}
        />
      )}

      <div className="container mx-auto px-2 sm:px-4 py-4 max-w-screen-xl">
        {shouldShowBadge && (
          <motion.div
            {...fadeIn}
            className="flex justify-center mt-4 sm:mt-6"
          >
            <motion.div className="relative inline-block">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={particleAnimation}
                  initial="initial"
                  animate="animate"
                  className="absolute w-2 sm:w-3 h-2 sm:h-3 rounded-full"
                  style={{
                    backgroundColor: badge === 'Gold' ? '#FFD700' : badge === 'Silver' ? '#C0C0C0' : '#CD7F32',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              ))}
              <motion.div {...badgeAnimation} className="relative">
                {badge === 'Bronze' && (
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 100 100"
                    className="sm:w-[80px] sm:h-[80px] md:w-[90px] md:h-[90px]"
                    aria-label="Bronze Badge"
                  >
                    <circle cx="50" cy="50" r="48" fill="#CD7F32" opacity="0.8" />
                    <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" fontSize="50" fill="#FFFFFF" fontWeight="bold">🥉</text>
                  </svg>
                )}
                {badge === 'Silver' && (
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 100 100"
                    className="sm:w-[80px] sm:h-[80px] md:w-[90px] md:h-[90px]"
                    aria-label="Silver Badge"
                  >
                    <circle cx="50" cy="50" r="48" fill="#C0C0C0" opacity="0.8" />
                    <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" fontSize="50" fill="#FFFFFF" fontWeight="bold">🥈</text>
                  </svg>
                )}
                {badge === 'Gold' && (
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 100 100"
                    className="sm:w-[80px] sm:h-[80px] md:w-[90px] md:h-[90px]"
                    aria-label="Gold Badge"
                  >
                    <circle cx="50" cy="50" r="48" fill="#FFD700" opacity="0.8" />
                    <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" fontSize="50" fill="#FFFFFF" fontWeight="bold">🥇</text>
                  </svg>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        <div className="text-center mt-2 sm:mt-4">
          <motion.h2
            {...fadeIn}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-amber-500 dark:from-rose-400 dark:to-amber-400"
          >
            Thank You for Your Submission!
          </motion.h2>
          {shouldShowBadge && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-1 sm:mt-2"
            >
              <span className="text-md sm:text-lg md:text-xl lg:text-xl font-bold text-rose-600 dark:text-rose-400">
                🎉 Congratulations! You Have Cleared This Level!
              </span>
            </motion.div>
          )}
          {shouldShowBadge && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="mt-3 sm:mt-4"
            >
              <button
                onClick={handleBackToSectionClick}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-rose-600 text-white font-semibold rounded-lg shadow-md hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600 transition-all duration-300"
              >
                Are You Ready for the Next Level?
              </button>
            </motion.div>
          )}
          {allDescriptive && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-3 sm:mt-4"
            >
              <span className="text-md sm:text-lg md:text-xl lg:text-xl font-bold text-gray-600 dark:text-gray-400">
                Your descriptive answers have been submitted for review.
              </span>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                className="mt-3 sm:mt-4"
              >
                <button
                  onClick={handleBackToSectionClick}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 transition-all duration-300"
                >
                  Back to Sections
                </button>
              </motion.div>
            </motion.div>
          )}
        </div>

        {!allDescriptive && percentage < 70 && totalMarks > 0 && (
          <motion.div
            {...fadeIn}
            className="flex flex-col items-center mb-2 sm:mb-4 mt-2 sm:mt-4"
          >
            <div className="inline-block bg-rose-100 dark:bg-rose-900/30 p-2 sm:p-3 rounded-lg">
              <span className="text-sm sm:text-md md:text-lg lg:text-lg font-bold text-rose-600 dark:text-rose-400">
                😔 Don't worry! Keep practicing, and you'll shine next time!
              </span>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-3 sm:mt-4"
            >
              <button
                onClick={handleBackToSectionClick}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 transition-all duration-300"
              >
                Back to Sections
              </button>
            </motion.div>
          </motion.div>
        )}

        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-2 sm:mt-6">
          {!allDescriptive && (
            <motion.div
              {...fadeIn}
              className="bg-white dark:bg-gray-900 p-3 sm:p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 w-full max-w-[280px] sm:max-w-xs"
            >
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-2xl font-bold mb-1 sm:mb-2 text-center text-rose-600 dark:text-rose-400">
                Your Performance
              </h3>
              <div className="space-y-1 sm:space-y-2">
                <div className="flex justify-between items-center bg-amber-100 dark:bg-amber-800/30 p-1 sm:p-2 rounded-lg">
                  <span className="text-sm sm:text-md md:text-lg lg:text-lg text-gray-700 dark:text-gray-300">Gained Marks:</span>
                  <span className="text-sm sm:text-md md:text-lg lg:text-lg font-bold text-amber-600 dark:text-amber-400">{gainedMarks}</span>
                </div>
                <div className="flex justify-between items-center bg-rose-100 dark:bg-rose-800/30 p-1 sm:p-2 rounded-lg">
                  <span className="text-sm sm:text-md md:text-lg lg:text-lg text-gray-700 dark:text-gray-300">Total Marks:</span>
                  <span className="text-sm sm:text-md md:text-lg lg:text-lg font-bold text-rose-600 dark:text-rose-400">{totalMarks}</span>
                </div>
                <div className="flex justify-between items-center bg-emerald-100 dark:bg-emerald-800/30 p-1 sm:p-2 rounded-lg">
                  <span className="text-sm sm:text-md md:text-lg lg:text-lg text-gray-700 dark:text-gray-300">Percentage:</span>
                  <span className="text-sm sm:text-md md:text-lg lg:text-lg font-bold text-emerald-600 dark:text-emerald-400">{percentage}%</span>
                </div>
              </div>
            </motion.div>
          )}

          {responses.length === 0 ? (
            <motion.p
              {...fadeIn}
              className="text-gray-600 dark:text-gray-400 text-center text-sm sm:text-md md:text-lg lg:text-lg w-full"
            >
              No valid responses found for this subsection.
            </motion.p>
          ) : (
            responses.map((response, index) => {
              const category = categories.find(
                cat => cat._id === (response.survey?.categoryId?._id || response.survey?.categoryId)
              );
              const isDescriptive = response.survey?.questionType === 'descriptive';
              const isUnselected = !response.answer || response.answer.trim() === '';
              const isCorrect = response.answer && response.survey?.correctOption && response.answer === response.survey.correctOption;

              return (
                <motion.div
                  key={response._id || index}
                  {...cardAnimation}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-900 p-3 sm:p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-800 w-full max-w-[280px] sm:max-w-xs"
                >
                  <motion.h3
                    {...fieldAnimation}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    className="text-md sm:text-lg md:text-xl lg:text-xl font-semibold mb-0.5 sm:mb-1 text-rose-600 dark:text-rose-400 line-clamp-2"
                  >
                    {response.survey?.question || 'Question not available'}
                  </motion.h3>
                  <motion.p
                    {...fieldAnimation}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    className="text-gray-600 dark:text-gray-400 mb-0.5 text-sm sm:text-md md:text-lg lg:text-lg"
                  >
                    <strong>Category:</strong>{' '}
                    {category?.name || 'Category not available'}
                  </motion.p>
                  <motion.p
                    {...fieldAnimation}
                    transition={{ delay: index * 0.1 + 0.4 }}
                    className="text-gray-600 dark:text-gray-400 mb-0.5 text-sm sm:text-md md:text-lg lg:text-lg"
                  >
                    <strong>Your Answer:</strong>{' '}
                    <span
                      className={`${
                        isDescriptive
                          ? 'text-gray-600 dark:text-gray-400'
                          : isUnselected
                          ? 'text-rose-500 dark:text-rose-400'
                          : isCorrect
                          ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                          : 'text-rose-500 dark:text-rose-400'
                      }`}
                    >
                      {isUnselected ? 'Unselected' : response.answer || 'No answer provided'}
                      {!isDescriptive && response.answer && response.survey?.correctOption && (
                        <span className="ml-1">
                          {isCorrect ? (
                            <span className="text-emerald-500">✔</span>
                          ) : (
                            <span className="text-rose-500">✘</span>
                          )}
                        </span>
                      )}
                    </span>
                  </motion.p>
                  {!isDescriptive && (
                    <>
                      <motion.p
                        {...fieldAnimation}
                        transition={{ delay: index * 0.1 + 0.5 }}
                        className="text-gray-600 dark:text-gray-400 mb-0.5 text-sm sm:text-md md:text-lg lg:text-lg"
                      >
                        <strong>Correct Answer:</strong>{' '}
                        <span
                          className={`${
                            isCorrect
                              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {response.survey?.correctOption || 'N/A'}
                        </span>
                      </motion.p>
                      <motion.p
                        {...fieldAnimation}
                        transition={{ delay: index * 0.1 + 0.6 }}
                        className={`text-sm sm:text-md md:text-lg lg:text-lg ${
                          isUnselected || !isCorrect
                            ? 'text-rose-500 dark:text-rose-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        <strong>Score:</strong>{' '}
                        {isUnselected || !isCorrect ? 0 : 1}
                      </motion.p>
                    </>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default ThankYou;