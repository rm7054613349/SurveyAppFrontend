import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import Confetti from 'react-confetti';
import { getResponsesBySubsection, getCategories, getSubsections } from '../services/api';
import { pageTransition, fadeIn } from '../animations/framerAnimations';
import LoadingSpinner from '../components/LoadingSpinner';

// Animation for response card fields
const fieldAnimation = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: 'easeOut' }
};

// Card animation with stagger
const cardAnimation = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  transition: { duration: 0.3, type: 'spring', stiffness: 180 }
};

// Badge animation with bounce effect
const badgeAnimation = {
  initial: { scale: 0, rotate: 0, opacity: 0 },
  animate: {
    scale: [0, 1.4, 1],
    rotate: [0, 15, -15, 0],
    opacity: 1,
    transition: {
      duration: 0.8,
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
    x: Math.cos((i * Math.PI) / 4) * 50,
    y: Math.sin((i * Math.PI) / 4) * 50,
    transition: {
      duration: 0.7,
      ease: 'easeOut',
      delay: i * 0.04
    }
  })
};

// Popup animation (unused but retained)
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
        className="flex justify-center items-center h-screen bg-blue-50/80 dark:bg-gray-900"
        aria-label="Loading"
      >
        <LoadingSpinner />
      </motion.div>
    );
  }

  return (
    <motion.div
      {...pageTransition}
      className="min-h-screen bg-blue-50/80 dark:bg-gray-900 relative overflow-hidden font-sans"
    >
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-300 to-pink-300 dark:from-blue-800 dark:to-purple-800 opacity-20 animate-gradient-bg" />

      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={window.innerWidth < 640 ? 60 : 120}
          colors={
            badge === 'Gold'
              ? ['#FFD700', '#FFA500', '#FFFF00']
              : badge === 'Silver'
              ? ['#C0C0C0', '#A9A9A9', '#D3D3D3']
              : ['#CD7F32', '#8B5A2B', '#A0522D']
          }
        />
      )}

      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl relative z-10">
        {shouldShowBadge && (
          <motion.div
            {...fadeIn}
            className="flex justify-center mt-6 sm:mt-8"
          >
            <motion.div className="relative inline-block">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={particleAnimation}
                  initial="initial"
                  animate="animate"
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: badge === 'Gold' ? '#FFD700' : badge === 'Silver' ? '#C0C0C0' : '#CD7F32',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              ))}
              <motion.div
                {...badgeAnimation}
                className="relative group"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                {badge === 'Bronze' && (
                  <svg
                    width="80"
                    height="80"
                    viewBox="0 0 100 100"
                    className="sm:w-24 sm:h-24 md:w-28 md:h-28 drop-shadow-lg"
                    aria-label="Bronze Badge"
                  >
                    <defs>
                      <linearGradient id="bronzeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#CD7F32', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#8B5A2B', stopOpacity: 1 }} />
                      </linearGradient>
                    </defs>
                    <circle cx="50" cy="50" r="48" fill="url(#bronzeGradient)" stroke="#A0522D" strokeWidth="2" />
                    <text x="50" y="55" textAnchor="middle" dominantBaseline="middle" fontSize="40" fill="#FFFFFF" fontWeight="bold">🥉</text>
                  </svg>
                )}
                {badge === 'Silver' && (
                  <svg
                    width="80"
                    height="80"
                    viewBox="0 0 100 100"
                    className="sm:w-24 sm:h-24 md:w-28 md:h-28 drop-shadow-lg"
                    aria-label="Silver Badge"
                  >
                    <defs>
                      <linearGradient id="silverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#C0C0C0', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#A9A9A9', stopOpacity: 1 }} />
                      </linearGradient>
                    </defs>
                    <circle cx="50" cy="50" r="48" fill="url(#silverGradient)" stroke="#D3D3D3" strokeWidth="2" />
                    <text x="50" y="55" textAnchor="middle" dominantBaseline="middle" fontSize="40" fill="#FFFFFF" fontWeight="bold">🥈</text>
                  </svg>
                )}
                {badge === 'Gold' && (
                  <svg
                    width="80"
                    height="80"
                    viewBox="0 0 100 100"
                    className="sm:w-24 sm:h-24 md:w-28 md:h-28 drop-shadow-lg"
                    aria-label="Gold Badge"
                  >
                    <defs>
                      <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#FFA500', stopOpacity: 1 }} />
                      </linearGradient>
                    </defs>
                    <circle cx="50" cy="50" r="48" fill="url(#goldGradient)" stroke="#FFFF00" strokeWidth="2" />
                    <text x="50" y="55" textAnchor="middle" dominantBaseline="middle" fontSize="40" fill="#FFFFFF" fontWeight="bold">🥇</text>
                  </svg>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        <div className="text-center mt-6 sm:mt-8">
          <motion.h2
            {...fadeIn}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-500 dark:from-blue-300 dark:to-pink-400 drop-shadow-md"
          >
            Thank You for Your Submission!
          </motion.h2>
          {shouldShowBadge && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="mt-3 sm:mt-4"
            >
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-blue-400 dark:text-blue-300 drop-shadow">
                🎉 Congratulations! You Have Cleared This Level!
              </span>
            </motion.div>
          )}
          {shouldShowBadge && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="mt-4 sm:mt-6"
            >
              <button
                onClick={handleBackToSectionClick}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-400 to-pink-500 dark:from-blue-500 dark:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300 ring-2 ring-blue-200 dark:ring-blue-700 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-600 ring-offset-2 pointer-events-auto"
                aria-label="Proceed to Next Level"
              >
                Ready for the Next Level?
              </button>
            </motion.div>
          )}
          {allDescriptive && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="mt-3 sm:mt-4"
            >
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-gray-600 dark:text-gray-300 drop-shadow">
                Your descriptive answers have been submitted for review.
              </span>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.4 }}
                className="mt-4 sm:mt-6"
              >
                <button
                  onClick={handleBackToSectionClick}
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-emerald-400 to-cyan-500 dark:from-emerald-500 dark:to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300 ring-2 ring-emerald-200 dark:ring-emerald-700 focus:ring-4 focus:ring-emerald-300 dark:focus:ring-emerald-600 ring-offset-2 pointer-events-auto"
                  aria-label="Back to Sections"
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
            className="flex flex-col items-center mb-6 sm:mb-8 mt-6 sm:mt-8"
          >
            <div className="inline-block bg-rose-100/80 dark:bg-rose-900/30 p-3 sm:p-4 rounded-xl shadow-md backdrop-blur-md">
              <span className="text-md sm:text-lg md:text-xl font-bold text-rose-600 dark:text-rose-400 drop-shadow">
                😔 Keep Practicing! You'll Ace It Next Time!
              </span>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="mt-4 sm:mt-6"
            >
              <button
                onClick={handleBackToSectionClick}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-emerald-400 to-cyan-500 dark:from-emerald-500 dark:to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300 ring-2 ring-emerald-200 dark:ring-emerald-700 focus:ring-4 focus:ring-emerald-300 dark:focus:ring-emerald-600 ring-offset-2 pointer-events-auto"
                aria-label="Back to Sections"
              >
                Back to Sections
              </button>
            </motion.div>
          </motion.div>
        )}

        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-6 sm:mt-8">
          {!allDescriptive && (
            <motion.div
              {...cardAnimation}
              className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-4 sm:p-6 rounded-2xl shadow-xl border-2 border-blue-200 dark:border-gray-700 w-full max-w-xs hover:scale-105 hover:shadow-2xl transition-all duration-300"
              style={{ borderImage: 'linear-gradient(to right, #60a5fa, #f472b6) 1' }}
            >
              <h3 className="text-xl sm:text-2xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-500 dark:from-blue-300 dark:to-pink-400 mb-3 sm:mb-4 drop-shadow">
                Your Performance
              </h3>
              <div className="space-y-2 sm:space-y-3">
                <motion.div
                  {...fieldAnimation}
                  className="flex justify-between items-center bg-blue-100/50 dark:bg-blue-900/30 p-2 sm:p-3 rounded-lg"
                >
                  <span className="text-sm sm:text-md text-gray-700 dark:text-gray-300">Gained Marks:</span>
                  <span className="text-sm sm:text-md font-bold text-blue-600 dark:text-blue-400">{gainedMarks}</span>
                </motion.div>
                <motion.div
                  {...fieldAnimation}
                  className="flex justify-between items-center bg-pink-100/50 dark:bg-pink-900/30 p-2 sm:p-3 rounded-lg"
                >
                  <span className="text-sm sm:text-md text-gray-700 dark:text-gray-300">Total Marks:</span>
                  <span className="text-sm sm:text-md font-bold text-pink-600 dark:text-pink-400">{totalMarks}</span>
                </motion.div>
                <motion.div
                  {...fieldAnimation}
                  className="flex justify-between items-center bg-emerald-100/50 dark:bg-emerald-900/30 p-2 sm:p-3 rounded-lg"
                >
                  <span className="text-sm sm:text-md text-gray-700 dark:text-gray-300">Percentage:</span>
                  <span className="text-sm sm:text-md font-bold text-emerald-600 dark:text-emerald-400">{percentage}%</span>
                </motion.div>
              </div>
            </motion.div>
          )}

          {responses.length === 0 ? (
            <motion.p
              {...fadeIn}
              className="text-gray-600 dark:text-gray-300 text-center text-md sm:text-lg w-full drop-shadow"
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
                  className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-4 sm:p-6 rounded-2xl shadow-xl border-2 border-blue-200 dark:border-gray-700 w-full max-w-xs hover:scale-105 hover:shadow-2xl transition-all duration-300"
                  style={{ borderImage: 'linear-gradient(to right, #60a5fa, #f472b6) 1' }}
                >
                  <motion.h3
                    {...fieldAnimation}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    className="text-md sm:text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-500 dark:from-blue-300 dark:to-pink-400 mb-2 sm:mb-3 line-clamp-2 drop-shadow"
                  >
                    {response.survey?.question || 'Question not available'}
                  </motion.h3>
                  <motion.p
                    {...fieldAnimation}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    className="text-gray-600 dark:text-gray-300 mb-1 sm:mb-2 text-sm sm:text-md"
                  >
                    <strong>Category:</strong>{' '}
                    {category?.name || 'Category not available'}
                  </motion.p>
                  <motion.p
                    {...fieldAnimation}
                    transition={{ delay: index * 0.1 + 0.4 }}
                    className="text-gray-600 dark:text-gray-300 mb-1 sm:mb-2 text-sm sm:text-md"
                  >
                    <strong>Your Answer:</strong>{' '}
                    <span
                      className={`${
                        isDescriptive
                          ? 'text-gray-600 dark:text-gray-300'
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
                        className="text-gray-600 dark:text-gray-300 mb-1 sm:mb-2 text-sm sm:text-md"
                      >
                        <strong>Correct Answer:</strong>{' '}
                        <span
                          className={`${
                            isCorrect
                              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                              : 'text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          {response.survey?.correctOption || 'N/A'}
                        </span>
                      </motion.p>
                      <motion.p
                        {...fieldAnimation}
                        transition={{ delay: index * 0.1 + 0.6 }}
                        className={`text-sm sm:text-md ${
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