import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { createSurvey, getCategories } from '../services/api';
import { pageTransition, buttonHover, fadeIn } from '../animations/framerAnimations';
import ProtectedRoute from '../components/ProtectedRoute';

function CreateQuestion() {
  const [newQuestion, setNewQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [category, setCategory] = useState('');
  const [correctOption, setCorrectOption] = useState(''); // New state for correct option
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        toast.error(err.message || 'Failed to fetch categories');
      }
    };
    fetchCategories();
  }, []);

  const handleCreateSurvey = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) {
      toast.error('Question cannot be empty');
      return;
    }
    if (options.some(opt => !opt.trim())) {
      toast.error('All options must be filled');
      return;
    }
    if (!category && !newCategory.trim()) {
      toast.error('Please select or create a category');
      return;
    }
    if (!correctOption) {
      toast.error('Please select a correct option');
      return;
    }
    try {
      const categoryId = category || await createCategory(newCategory);
      await createSurvey({ question: newQuestion, options, categoryId, correctOption });
      setNewQuestion('');
      setOptions(['', '', '', '']);
      setCategory('');
      setNewCategory('');
      setCorrectOption('');
      toast.success('Survey created successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to create survey');
    }
  };

  const createCategory = async (name) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/category`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ name }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create category');
      setCategories([...categories, data]);
      return data._id;
    } catch (err) {
      toast.error(err.message || 'Failed to create category');
      throw err;
    }
  };

  return (
    <ProtectedRoute allowedRole="admin">
      <motion.div {...pageTransition} className="container mx-auto p-6 max-w-lg content-box">
        <motion.h2 {...fadeIn} className="text-3xl font-bold mb-6 text-primary-blue">
          Create New Survey Question
        </motion.h2>
        <form onSubmit={handleCreateSurvey} className="space-y-6 bg-card-bg dark:bg-card-dark-bg p-8 rounded-lg shadow-lg content-box">
          <motion.div {...fadeIn} transition={{ delay: 0.1 }}>
            <label className="block mb-2 text-gray-700 dark:text-gray-300">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 border rounded dark:bg-gray-800 dark:text-white"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </motion.div>
          <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
            <label className="block mb-2 text-gray-700 dark:text-gray-300">Or Create New Category</label>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full p-3 border rounded dark:bg-gray-800 dark:text-white"
              placeholder="Enter new category name"
            />
          </motion.div>
          <motion.div {...fadeIn} transition={{ delay: 0.3 }}>
            <label className="block mb-2 text-gray-700 dark:text-gray-300">Question</label>
            <input
              type="text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="w-full p-3 border rounded dark:bg-gray-800 dark:text-white"
              placeholder="Enter your question"
            />
          </motion.div>
          {options.map((option, index) => (
            <motion.div key={index} {...fadeIn} transition={{ delay: 0.4 + 0.1 * index }}>
              <label className="block mb-2 text-gray-700 dark:text-gray-300">Option {index + 1}</label>
              <input
                type="text"
                value={option}
                onChange={(e) => {
                  const newOptions = [...options];
                  newOptions[index] = e.target.value;
                  setOptions(newOptions);
                }}
                className="w-full p-3 border rounded dark:bg-gray-800 dark:text-white"
                placeholder={`Enter option ${index + 1}`}
              />
            </motion.div>
          ))}
          <motion.div {...fadeIn} transition={{ delay: 0.8 }}>
            <label className="block mb-2 text-gray-700 dark:text-gray-300">Correct Option</label>
            <select
              value={correctOption}
              onChange={(e) => setCorrectOption(e.target.value)}
              className="w-full p-3 border rounded dark:bg-gray-800 dark:text-white"
            >
              <option value="">Select Correct Option</option>
              {options.map((option, index) => (
                option && <option key={index} value={option}>{option}</option>
              ))}
            </select>
          </motion.div>
          <motion.button
            whileHover={buttonHover}
            type="submit"
            className="w-full bg-primary-blue text-white p-3 rounded-lg"
          >
            Create Survey
          </motion.button>
        </form>
      </motion.div>
    </ProtectedRoute>
  );
}

export default CreateQuestion;