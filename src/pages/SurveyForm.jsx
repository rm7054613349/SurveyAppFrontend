import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { getSurveys, getCategories, submitResponse } from '../services/api';
import { pageTransition, fadeIn, buttonHover } from '../animations/framerAnimations';
import LoadingSpinner from '../components/LoadingSpinner';
import ProtectedRoute from '../components/ProtectedRoute';

function SurveyForm() {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found. Please log in.');
        }
        const [surveyData, categoryData] = await Promise.all([getSurveys(), getCategories()]);
        setSurveys(surveyData);
        setCategories(categoryData);
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

  const filteredSurveys = selectedCategory === 'all'
    ? surveys
    : surveys.filter(survey => survey.categoryId?._id === selectedCategory);

  const handleResponseChange = (surveyId, answer) => {
    setResponses(prev => ({
      ...prev,
      [surveyId]: answer,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(responses).length === 0) {
      toast.error('Please answer at least one question');
      return;
    }
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
        if (!surveyId || !answer) {
          toast.error('Invalid survey or answer');
          continue;
        }
        const survey = surveys.find(s => s._id === surveyId);
        if (!survey) {
          toast.error('Survey not found');
          continue;
        }

        console.log('Selected answer:', answer);

        // Compute score: 1 if answer matches survey.correctAnswer, 0 otherwise
        const score = survey.correctOption && answer === survey.correctOption ? 1 : 0;

        console.log('Submitting response:', { userId, surveyId, answer, score }); // Debug log
        await submitResponse({
          userId,
          surveyId,
          answer,
          score,
        });
      }
      toast.success('Responses submitted successfully!');
      setResponses({});
      navigate('/employee/thank-you');
    } catch (err) {
      console.error('Submit error:', err);
      toast.error(err.message || 'Failed to submit responses');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) {
    return (
      <motion.div {...pageTransition} className="container mx-auto p-4 sm:p-6 content-box">
        <motion.h2 {...fadeIn} className="text-2xl sm:text-3xl font-bold mb-6 text-primary-blue text-center">
          Survey Form
        </motion.h2>
        <p className="text-red-600 dark:text-red-400 text-center text-sm sm:text-base">{error}</p>
      </motion.div>
    );
  }

  return (
    <ProtectedRoute allowedRole="employee">
      <motion.div {...pageTransition} className="container mx-auto p-4 sm:p-6 content-box">
        <motion.h2 {...fadeIn} className="text-2xl sm:text-3xl font-bold mb-6 text-primary-blue text-center">
          Survey Form
        </motion.h2>
        <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="mb-6">
          <label className="block mb-2 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
            Filter by Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-1/4 p-3 border rounded dark:bg-gray-800 dark:text-white text-sm sm:text-base"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </motion.div>
        <motion.form onSubmit={handleSubmit} {...fadeIn} transition={{ delay: 0.2 }} className="space-y-6">
          {filteredSurveys.length > 0 ? (
            filteredSurveys.map((survey) => (
              <div key={survey._id} className="bg-card-bg dark:bg-card-dark-bg p-4 sm:p-6 rounded-lg shadow-lg content-box">
                <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  {survey.question}
                </h3>
                <div className="space-y-2">
                  {survey.options.map((option, index) => (
                    <label key={index} className="flex items-center space-x-3 text-sm sm:text-base">
                      <input
                        type="radio"
                        name={survey._id}
                        value={option}
                        checked={responses[survey._id] === option}
                        onChange={() => handleResponseChange(survey._id, option)}
                        className="form-radio text-secondary-green"
                      />
                      <span className="text-gray-700 dark:text-gray-300">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
              No surveys available in this category.
            </p>
          )}
          {filteredSurveys.length > 0 && (
            <motion.button
              whileHover={buttonHover}
              type="submit"
              className="w-full bg-secondary-green text-white p-3 rounded-lg text-sm sm:text-base"
            >
              Submit Responses
            </motion.button>
          )}
        </motion.form>
      </motion.div>
    </ProtectedRoute>
  );
}

export default SurveyForm;