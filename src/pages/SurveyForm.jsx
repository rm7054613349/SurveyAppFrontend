import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import { getSurveys, getCategories, submitResponse } from '../services/api';
import { pageTransition, fadeIn, buttonHover } from '../animations/framerAnimations';
import LoadingSpinner from '../components/LoadingSpinner';
import ProtectedRoute from '../components/ProtectedRoute';

// Animation for question transitions
const questionSlide = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -100 },
  transition: { duration: 0.5, ease: 'easeOut' }
};

// Animation for Next/Previous buttons
const iconButtonHover = {
  scale: 1.1,
  backgroundColor: '#10B981',
  color: '#FFFFFF',
  transition: { duration: 0.3 }
};

// Animation for popup
const popupVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } }
};

// Animation for timer
const timerPulse = {
  scale: [1, 1.05, 1],
  transition: { duration: 1, repeat: Infinity }
};

function SurveyForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [surveys, setSurveys] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({}); // { surveyId: answer }
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const timerMinutes = parseInt(import.meta.env.REACT_APP_QUESTION_TIMER_MINUTES, 10) || 2 ;
  const totalTimerSeconds = timerMinutes * 60;
  const [timer, setTimer] = useState(totalTimerSeconds);

  // Initialize timer from cache
  useEffect(() => {
    const startTime = localStorage.getItem('surveyTimerStart');
    if (startTime) {
      const elapsed = Math.floor((Date.now() - parseInt(startTime)) / 1000);
      const remaining = totalTimerSeconds - elapsed;
      if (remaining > 0) {
        setTimer(remaining);
      } else {
        setTimer(0);
        handleTimeout();
      }
    } else {
      localStorage.setItem('surveyTimerStart', Date.now().toString());
      setTimer(totalTimerSeconds);
    }
  }, [totalTimerSeconds]);

  // Prevent navigation with toast
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isSubmitted) {
        toast.warn('First submit your survey');
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isSubmitted]);

  // Fetch surveys and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found. Please log in.');
        }
        const [surveyData, categoryData] = await Promise.all([getSurveys(), getCategories()]);
        setSurveys(surveyData || []);
        setCategories(categoryData || []);
        setLoading(false);
      } catch (err) {
        console.error('Fetch error details:', err);
        const errorMessage = err.message.includes('Access denied')
          ? 'Access denied: Please ensure you are logged in with the correct permissions.'
          : err.message || 'Failed to fetch surveys or categories';
        setError(errorMessage);
        toast.error(errorMessage);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Group surveys by category
  const surveysByCategory = useMemo(() => {
    const grouped = {};
    categories.forEach((cat) => {
      grouped[cat._id] = surveys.filter((survey) => survey.categoryId?._id === cat._id) || [];
    });
    return grouped;
  }, [surveys, categories]);

  // Define allSurveys, currentCategory, currentSurveys, and currentSurvey
  const allSurveys = useMemo(() => {
    return categories
      .flatMap((cat) => surveysByCategory[cat._id] || [])
      .filter((survey) => survey);
  }, [categories, surveysByCategory]);

  const currentCategory = categories[currentCategoryIndex] || {};
  const currentSurveys = selectedCategory === 'all'
    ? allSurveys
    : surveysByCategory[selectedCategory] || [];
  const currentSurvey = currentSurveys[currentQuestionIndex];

  // Update currentCategoryIndex for "all" filter
  useEffect(() => {
    if (selectedCategory === 'all' && currentSurvey) {
      const categoryId = currentSurvey.categoryId?._id;
      const index = categories.findIndex((cat) => cat._id === categoryId);
      if (index >= 0 && index !== currentCategoryIndex) {
        setCurrentCategoryIndex(index);
      }
    }
  }, [currentSurvey, selectedCategory, categories, currentCategoryIndex]);

  // Single timer for all questions
  useEffect(() => {
    if (loading || error || !currentSurveys.length || timer <= 0) {
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [loading, error, currentSurveys.length, timer]);

  // Format timer as minutes and seconds
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleResponseChange = (surveyId, answer) => {
    if (!currentSurvey?.categoryId?._id) return;
    setResponses((prev) => ({
      ...prev,
      [surveyId]: answer,
    }));
  };

  const handleNextQuestion = () => {
    console.log('Next:', { currentQuestionIndex, total: currentSurveys.length, currentSurveys, selectedCategory });
    if (currentQuestionIndex < currentSurveys.length - 1) {
      setCurrentQuestionIndex((prev) => {
        console.log('Setting next index:', prev + 1);
        return prev + 1;
      });
    } else if (selectedCategory !== 'all' && currentCategoryIndex < categories.length - 1) {
      const nextCategoryIndex = currentCategoryIndex + 1;
      setSelectedCategory(categories[nextCategoryIndex]._id);
      setCurrentCategoryIndex(nextCategoryIndex);
      setCurrentQuestionIndex(0);
      toast.info(`Moved to ${categories[nextCategoryIndex].name}`);
    }
  };

  const handlePreviousQuestion = () => {
    console.log('Previous:', { currentQuestionIndex, total: currentSurveys.length, currentSurveys, selectedCategory });
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      if (isSubmitted) {
        toast.info('Form submitted for this test');
      }
      setCurrentQuestionIndex((prev) => {
        console.log('Setting previous index:', prev - 1);
        return prev - 1;
      });
    } else if (selectedCategory !== 'all' && currentCategoryIndex > 0) {
      const prevCategoryIndex = currentCategoryIndex - 1;
      const prevCategoryId = categories[prevCategoryIndex]._id;
      const prevCategorySurveys = surveysByCategory[prevCategoryId] || [];
      setSelectedCategory(prevCategoryId);
      setCurrentCategoryIndex(prevCategoryIndex);
      setCurrentQuestionIndex(prevCategorySurveys.length - 1);
      toast.info(`Moved to ${categories[prevCategoryIndex].name}`);
    }
  };

  const handleSubmitSurvey = () => {
    setShowConfirm(true);
  };

  const confirmSubmit = async () => {
    setShowConfirm(false);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }
      let userId;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.id || payload._id;
        if (!userId) {
          throw new Error('User ID not found in token.');
        }
      } catch (decodeErr) {
        toast.error('Invalid token. Please log in again.');
        return;
      }

      for (const [surveyId, answer] of Object.entries(responses)) {
        if (!surveyId || !answer) continue;
        const survey = surveys.find((s) => s._id === surveyId);
        if (!survey) {
          console.warn('Survey not found:', surveyId);
          continue;
        }
        const score = survey.correctOption && answer === survey.correctOption ? 1 : 0;
        console.log('Submitting response:', { userId, surveyId, answer, score });
        await submitResponse({
          userId,
          surveyId,
          answer,
          score,
        });
      }
      setIsSubmitted(true);
      localStorage.removeItem('surveyTimerStart');
      toast.success('Survey submitted successfully!');
      navigate('/employee/thank-you');
    } catch (err) {
      console.error('Submit error:', err);
      toast.error(err.message || 'Failed to submit survey');
    }
  };

  const handleTimeout = async () => {
    if (Object.keys(responses).length > 0) {
      await confirmSubmit();
    } else {
      localStorage.removeItem('surveyTimerStart');
      toast.info('Time is up! No responses submitted.');
      navigate('/employee/thank-you');
    }
  };

  const handleCategoryFilter = (categoryId) => {
    if (categoryId !== 'all' && isSubmitted) {
      toast.info('Form submitted for this test');
    }
    setSelectedCategory(categoryId);
    setCurrentQuestionIndex(0);
    if (categoryId !== 'all') {
      const index = categories.findIndex((cat) => cat._id === categoryId);
      setCurrentCategoryIndex(index >= 0 ? index : 0);
    }
  };

  // Check if on last question of last category or last question in "All Categories"
  const isLastQuestion = () => {
    if (selectedCategory === 'all') {
      return currentQuestionIndex === currentSurveys.length - 1;
    }
    return (
      currentQuestionIndex === currentSurveys.length - 1 &&
      currentCategoryIndex === categories.length - 1
    );
  };

  // Check if Previous button should be disabled
  const isPreviousDisabled = () => {
    return currentQuestionIndex === 0 && (selectedCategory === 'all' || currentCategoryIndex === 0);
  };

  if (loading) return <LoadingSpinner />;
  if (error) {
    return (
      <motion.div {...pageTransition} className="container mx-auto p-4 sm:p-6 content-box">
        <motion.h2 {...fadeIn} className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 text-primary-blue text-center">
          Survey Form
        </motion.h2>
        <p className="text-red-600 dark:text-red-400 text-center text-xs sm:text-sm md:text-base">{error}</p>
      </motion.div>
    );
  }

  return (
    <ProtectedRoute allowedRole="employee">
      <motion.div {...pageTransition} className="container mx-auto p-4 sm:p-6 content-box">
        <motion.h2 {...fadeIn} className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 text-primary-blue text-center">
          Survey Form
        </motion.h2>
        <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="mb-6">
          <label className="block mb-2 text-gray-700 dark:text-gray-300 text-xs sm:text-sm md:text-base">
            Filter by Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryFilter(e.target.value)}
            className="w-full sm:w-1/3 md:w-1/4 p-2 sm:p-3 border rounded dark:bg-gray-800 dark:text-white text-xs sm:text-sm md:text-base"
            disabled={isSubmitted}
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </motion.div>
        <motion.div
          {...fadeIn}
          className="flex flex-row items-center justify-between gap-4 mb-4 text-gray-700 dark:text-gray-300 text-xs sm:text-sm md:text-base"
        >
          <span>
            {selectedCategory === 'all'
              ? `Question ${currentQuestionIndex + 1}/${currentSurveys.length}`
              : `Category: ${currentSurvey?.categoryId?.name || 'N/A'} | Question ${currentQuestionIndex + 1}/${currentSurveys.length}`}
          </span>
          <motion.span
            className="font-bold text-lg sm:text-xl text-red-500 dark:text-red-400 "
            // animate={timerPulse}
          >
            Time left: {formatTimer(timer)}
          </motion.span>
        </motion.div>
        <AnimatePresence mode="wait">
          {currentSurvey ? (
            <motion.form
              key={`${currentSurvey._id}`}
              {...questionSlide}
              className="space-y-6"
            >
              <motion.div
                className="bg-card-bg dark:bg-card-dark-bg p-4 sm:p-6 rounded-lg shadow-lg content-box"
              >
                <h4 className="text-base sm:text-lg md:text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  {currentSurvey.question}
                </h4>
                <div className="space-y-2">
                  {currentSurvey.options.map((option, index) => (
                    <label
                      key={index}
                      className="flex items-center space-x-3 text-xs sm:text-sm md:text-base"
                    >
                      <input
                        type="radio"
                        name={currentSurvey._id}
                        value={option}
                        checked={responses[currentSurvey._id] === option}
                        onChange={() => handleResponseChange(currentSurvey._id, option)}
                        className="form-radio text-secondary-green w-4 h-4 sm:w-5 sm:h-5"
                        disabled={isSubmitted}
                      />
                      <span className="text-gray-700 dark:text-gray-300">{option}</span>
                    </label>
                  ))}
                </div>
              </motion.div>
              <div className="flex flex-row gap-2 justify-between items-center">
                <motion.button
                  whileHover={iconButtonHover}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  type="button"
                  onClick={handlePreviousQuestion}
                  disabled={isPreviousDisabled()}
                  className="flex items-center gap-2 bg-gray-500 text-white px-2 py-2 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm md:text-base disabled:opacity-50 min-w-[100px]"
                  aria-label="Previous question"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Previous
                </motion.button>
                {isLastQuestion() && !isSubmitted ? (
                  <motion.button
                    whileHover={buttonHover}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    type="button"
                    onClick={handleSubmitSurvey}
                    className="w-full sm:w-auto bg-secondary-green text-white p-2 sm:p-3 rounded-lg text-xs sm:text-sm md:text-base min-w-[100px]"
                  >
                    Submit Survey
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={iconButtonHover}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    type="button"
                    onClick={handleNextQuestion}
                    disabled={!currentSurvey || isSubmitted}
                    className="flex items-center gap-2 bg-secondary-green text-white px-2 py-2 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm md:text-base disabled:opacity-50 min-w-[100px]"
                    aria-label="Next question"
                  >
                    Next
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </motion.button>
                )}
              </div>
            </motion.form>
          ) : (
            <motion.p
              {...fadeIn}
              className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm md:text-base"
            >
              No surveys available for this category.
            </motion.p>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showConfirm && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full"
                variants={popupVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Are you ready to submit your survey?
                </h3>
                <div className="flex flex-row gap-4 justify-end">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={confirmSubmit}
                    className="bg-secondary-green text-white px-4 py-2 rounded-lg text-sm sm:text-base"
                  >
                    Yes
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowConfirm(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm sm:text-base"
                  >
                    No
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </ProtectedRoute>
  );
}

export default SurveyForm;