import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { getSurveys, getCategories, updateSurvey, deleteSurvey } from '../services/api';
import { pageTransition, fadeIn, buttonHover } from '../animations/framerAnimations';
import LoadingSpinner from '../components/LoadingSpinner';
import ProtectedRoute from '../components/ProtectedRoute';

function ViewQuestions() {
  const [surveys, setSurveys] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [editingSurvey, setEditingSurvey] = useState(null);
  const [editForm, setEditForm] = useState({ question: '', options: ['', '', '', ''], categoryId: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [surveyData, categoryData] = await Promise.all([getSurveys(), getCategories()]);
        setSurveys(surveyData);
        setCategories(categoryData);
        setLoading(false);
      } catch (err) {
        toast.error(err.message || 'Failed to fetch data');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredSurveys = selectedCategory === 'all'
    ? surveys
    : surveys.filter(survey => survey.categoryId?._id === selectedCategory);

  const handleEdit = (survey) => {
    setEditingSurvey(survey._id);
    setEditForm({
      question: survey.question,
      options: survey.options.concat(new Array(4 - survey.options.length).fill('')),
      categoryId: survey.categoryId._id,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editForm.question.trim()) {
      toast.error('Question cannot be empty');
      return;
    }
    if (editForm.options.some(opt => !opt.trim())) {
      toast.error('All options must be filled');
      return;
    }
    if (!editForm.categoryId) {
      toast.error('Please select a category');
      return;
    }
    try {
      const updatedSurvey = await updateSurvey(editingSurvey, {
        question: editForm.question,
        options: editForm.options.filter(opt => opt.trim()),
        categoryId: editForm.categoryId,
      });
      setSurveys(surveys.map(s => (s._id === editingSurvey ? updatedSurvey : s)));
      setEditingSurvey(null);
      setEditForm({ question: '', options: ['', '', '', ''], categoryId: '' });
      toast.success('Survey updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update survey');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this survey?')) return;
    try {
      await deleteSurvey(id);
      setSurveys(surveys.filter(s => s._id !== id));
      toast.success('Survey deleted successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to delete survey');
    }
  };

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
          View All Questions
        </motion.h2>
        <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="mb-6">
          <label className="block mb-2 text-gray-700 dark:text-gray-300 text-sm sm:text-base font-medium">
            Filter by Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-64 p-2 sm:p-3 border rounded dark:bg-gray-800 dark:text-white text-sm sm:text-base focus:ring-2 focus:ring-secondary-green"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </motion.div>
        <motion.div {...fadeIn} transition={{ delay: 0.2 }} className="bg-card-bg dark:bg-card-dark-bg p-4 sm:p-6 rounded-lg shadow-lg">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Survey Questions
          </h3>
          {filteredSurveys.length > 0 ? (
            editingSurvey ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block mb-2 text-gray-700 dark:text-gray-300 text-sm sm:text-base font-medium">
                    Category
                  </label>
                  <select
                    value={editForm.categoryId}
                    onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value })}
                    className="w-full p-2 sm:p-3 border rounded dark:bg-gray-800 dark:text-white text-sm sm:text-base focus:ring-2 focus:ring-secondary-green"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-gray-700 dark:text-gray-300 text-sm sm:text-base font-medium">
                    Question
                  </label>
                  <input
                    type="text"
                    value={editForm.question}
                    onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                    className="w-full p-2 sm:p-3 border rounded dark:bg-gray-800 dark:text-white text-sm sm:text-base focus:ring-2 focus:ring-secondary-green"
                    placeholder="Enter your question"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {editForm.options.map((option, index) => (
                    <div key={index}>
                      <label className="block mb-2 text-gray-700 dark:text-gray-300 text-sm sm:text-base font-medium">
                        Option {index + 1}
                      </label>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...editForm.options];
                          newOptions[index] = e.target.value;
                          setEditForm({ ...editForm, options: newOptions });
                        }}
                        className="w-full p-2 sm:p-3 border rounded dark:bg-gray-800 dark:text-white text-sm sm:text-base focus:ring-2 focus:ring-secondary-green"
                        placeholder={`Enter option ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
                  <motion.button
                    whileHover={buttonHover}
                    type="submit"
                    className="bg-secondary-green text-white px-4 py-2 rounded-lg text-sm sm:text-base hover:bg-secondary-green/90 focus:ring-2 focus:ring-secondary-green"
                  >
                    Save Changes
                  </motion.button>
                  <motion.button
                    whileHover={buttonHover}
                    type="button"
                    onClick={() => setEditingSurvey(null)}
                    className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-lg text-sm sm:text-base hover:bg-gray-400 dark:hover:bg-gray-500 focus:ring-2 focus:ring-gray-400"
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredSurveys.map((survey) => (
                  <motion.div
                    key={survey._id}
                    {...fadeIn}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200 dark:border-gray-700"
                  >
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {survey.question}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <strong>Category:</strong> {survey.categoryId?.name || 'Uncategorized'}
                    </p>
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Options:</p>
                      <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
                        {survey.options.map((option, index) => (
                          <li key={index}>{option}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEdit(survey)}
                        className="bg-primary-blue text-white px-3 py-1.5 rounded-lg text-sm hover:bg-primary-blue/90 focus:ring-2 focus:ring-primary-blue"
                      >
                        Edit
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(survey._id)}
                        className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-700 focus:ring-2 focus:ring-red-600"
                      >
                        Delete
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )
          ) : (
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base text-center">
              No questions available in this category.
            </p>
          )}
        </motion.div>
      </motion.div>
    </ProtectedRoute>
  );
}

export default ViewQuestions;