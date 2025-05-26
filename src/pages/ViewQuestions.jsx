import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { HiTrash, HiPencil } from 'react-icons/hi';
import {
  getSurveys,
  getCategories,
  getSections,
  getSubsections,
  updateSurvey,
  deleteSurvey,
} from '../services/api';
import { pageTransition, fadeIn, buttonHover } from '../animations/framerAnimations';
import LoadingSpinner from '../components/LoadingSpinner';
import ProtectedRoute from '../components/ProtectedRoute';

// Animation for survey cards
const cardAnimation = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut' },
  whileHover: { scale: 1.02, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' },
};

function ViewQuestions() {
  const [surveys, setSurveys] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sections, setSections] = useState([]);
  const [subsections, setSubsections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('all');
  const [selectedSubsection, setSelectedSubsection] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [editingSurvey, setEditingSurvey] = useState(null);
  const [editForm, setEditForm] = useState({
    question: '',
    options: ['', '', '', ''],
    sectionId: '',
    subsectionId: '',
    categoryId: '',
    questionType: 'multiple-choice',
    correctOption: '',
    scoringType: 'basic',
    maxScore: 1,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const fetchPromises = [
          getSurveys().catch(err => {
            console.error('Failed to fetch surveys:', err);
            return [];
          }),
          getCategories().catch(err => {
            console.error('Failed to fetch categories:', err);
            return [];
          }),
          getSections().catch(err => {
            console.error('Failed to fetch sections:', err);
            return [];
          }),
          getSubsections().catch(err => {
            console.error('Failed to fetch subsections:', err);
            return [];
          }),
        ];

        const [surveyData, categoryData, sectionData, subsectionData] = await Promise.all(fetchPromises);

        setSurveys(Array.isArray(surveyData) ? surveyData : []);
        setCategories(Array.isArray(categoryData) ? categoryData : []);
        setSections(Array.isArray(sectionData) ? sectionData : []);
        setSubsections(Array.isArray(subsectionData) ? subsectionData : []);
        console.log('Fetched Data:', { surveys: surveyData, categories: categoryData, sections: sectionData, subsections: subsectionData });
        setLoading(false);
      } catch (err) {
        console.error('Fetch error:', err);
        toast.error('Failed to load data. Please try again.');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredSubsections = subsections.filter(
    (sub) => selectedSection === 'all' || (sub.sectionId?._id === selectedSection)
  );

  const filteredCategories = categories.filter(
    (cat) => selectedSubsection === 'all' || (cat.subsectionId?._id === selectedSubsection)
  );

  const filteredSurveys = surveys.filter((survey) => {
    const matchesSection = selectedSection === 'all' || (survey.sectionId?._id === selectedSection);
    const matchesSubsection = selectedSubsection === 'all' || (survey.subsectionId?._id === selectedSubsection);
    const matchesCategory = selectedCategory === 'all' || (survey.categoryId?._id === selectedCategory);
    return matchesSection && matchesSubsection && matchesCategory;
  });

  const handleEdit = (survey) => {
    setEditingSurvey(survey._id);
    setEditForm({
      question: survey.question || '',
      options: survey.options ? survey.options.concat(new Array(4 - survey.options.length).fill('')) : ['', '', '', ''],
      sectionId: survey.sectionId?._id || '',
      subsectionId: survey.subsectionId?._id || '',
      categoryId: survey.categoryId?._id || '',
      questionType: survey.questionType || 'multiple-choice',
      correctOption: survey.correctOption || '',
      scoringType: survey.scoringType || 'basic',
      maxScore: survey.maxScore || 1,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editForm.question.trim()) {
      toast.error('Question cannot be empty');
      return;
    }
    if (!editForm.sectionId || !editForm.subsectionId || !editForm.categoryId) {
      toast.error('Section, subsection, and category are required');
      return;
    }
    if (editForm.questionType === 'multiple-choice') {
      if (editForm.options.some((opt) => !opt.trim())) {
        toast.error('All options must be filled for multiple-choice questions');
        return;
      }
      if (!editForm.correctOption) {
        toast.error('Correct option is required for multiple-choice questions');
        return;
      }
    }
    if (!editForm.maxScore || editForm.maxScore <= 0) {
      toast.error('Max score must be a positive number');
      return;
    }

    try {
      const updatedSurvey = await updateSurvey(editingSurvey, {
        question: editForm.question,
        options: editForm.questionType === 'multiple-choice' ? editForm.options.filter((opt) => opt.trim()) : [],
        sectionId: editForm.sectionId,
        subsectionId: editForm.subsectionId,
        categoryId: editForm.categoryId,
        questionType: editForm.questionType,
        correctOption: editForm.questionType === 'multiple-choice' ? editForm.correctOption : null,
        scoringType: editForm.scoringType,
        maxScore: editForm.maxScore,
      });
      setSurveys(surveys.map((s) => (s._id === editingSurvey ? updatedSurvey : s)));
      setEditingSurvey(null);
      setEditForm({
        question: '',
        options: ['', '', '', ''],
        sectionId: '',
        subsectionId: '',
        categoryId: '',
        questionType: 'multiple-choice',
        correctOption: '',
        scoringType: 'basic',
        maxScore: 1,
      });
      toast.success('Survey updated successfully!');
    } catch (err) {
      console.error('Update error:', err);
      toast.error(err.message || 'Failed to update survey');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this survey?')) return;
    try {
      await deleteSurvey(id);
      setSurveys(surveys.filter((s) => s._id !== id));
      toast.success('Survey deleted successfully!');
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(err.message || 'Failed to delete survey');
    }
  };

  if (loading) {
    return (
      <motion.div
        {...fadeIn}
        className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800"
      >
        <LoadingSpinner />
      </motion.div>
    );
  }

  return (
    <ProtectedRoute allowedRole="admin">
      <motion.div
        {...pageTransition}
        className="w-full flex-1 py-20 flex flex-col items-center justify-start min-h-screen bg-[#afeeee] dark:bg-gray-900 px-4 sm:px-6 md:px-8"
      >
        {/* Header */}
        <motion.h2
          {...fadeIn}
          className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-center mb-10"
        >
          View All Questions
        </motion.h2>

        {/* Filters */}
        <motion.div
          {...fadeIn}
          transition={{ delay: 0.1 }}
          className="bg-[#afeeee] dark:bg-gray-950 p-6 sm:p-8 rounded-2xl shadow-2xl mb-10"
        >
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Filter Questions
          </h3>
          <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-4 space-y-4 sm:space-y-0">
            <div className="flex-1">
              <label className="block mb-2 bg-[#afeeee] text-sm font-medium text-gray-700 dark:text-gray-300">
                Section
              </label>
              <select
                value={selectedSection}
                onChange={(e) => {
                  setSelectedSection(e.target.value);
                  setSelectedSubsection('all');
                  setSelectedCategory('all');
                }}
                className="w-full p-3 border rounded-lg bg-[#afeeee] dark:bg-gray-800 text-gray-900 dark:text-gray-200 text-sm focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500"
              >
                <option value="all">All Sections</option>
                {sections.map((sec) => (
                  <option key={sec._id} value={sec._id}>{sec.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Subsection
              </label>
              <select
                value={selectedSubsection}
                onChange={(e) => {
                  setSelectedSubsection(e.target.value);
                  setSelectedCategory('all');
                }}
                className="w-full p-3 border rounded-lg bg-[#afeeee] dark:bg-gray-800 text-gray-900 dark:text-gray-200 text-sm focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500"
                disabled={selectedSection === 'all'}
              >
                <option value="all">All Subsections</option>
                {filteredSubsections.map((sub) => (
                  <option key={sub._id} value={sub._id}>{sub.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block  mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-3 border bg-[#afeeee]  rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 text-sm focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500"
                disabled={selectedSubsection === 'all'}
              >
                <option value="all">All Categories</option>
                {filteredCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Survey Questions */}
        <motion.div
          {...fadeIn}
          transition={{ delay: 0.2 }}
          className="bg-[#afeeee] dark:bg-gray-950 p-6 sm:p-8 rounded-2xl shadow-2xl"
        >
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Survey Questions
          </h3>
          {filteredSurveys.length > 0 ? (
            editingSurvey ? (
              <form onSubmit={handleUpdate} className="space-y-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Section
                  </label>
                  <select
                    value={editForm.sectionId}
                    onChange={(e) => setEditForm({ ...editForm, sectionId: e.target.value, subsectionId: '', categoryId: '' })}
                    className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 text-sm focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500"
                  >
                    <option value="">Select Section</option>
                    {sections.map((sec) => (
                      <option key={sec._id} value={sec._id}>{sec.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Subsection
                  </label>
                  <select
                    value={editForm.subsectionId}
                    onChange={(e) => setEditForm({ ...editForm, subsectionId: e.target.value, categoryId: '' })}
                    className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 text-sm focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500"
                    disabled={!editForm.sectionId}
                  >
                    <option value="">Select Subsection</option>
                    {subsections
                      .filter((sub) => sub.sectionId?._id === editForm.sectionId)
                      .map((sub) => (
                        <option key={sub._id} value={sub._id}>{sub.name}</option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Category
                  </label>
                  <select
                    value={editForm.categoryId}
                    onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value })}
                    className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 text-sm focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500"
                    disabled={!editForm.subsectionId}
                  >
                    <option value="">Select Category</option>
                    {categories
                      .filter((cat) => cat.subsectionId?._id === editForm.subsectionId)
                      .map((cat) => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Question Type
                  </label>
                  <select
                    value={editForm.questionType}
                    onChange={(e) => setEditForm({ ...editForm, questionType: e.target.value, options: ['', '', '', ''], correctOption: '' })}
                    className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 text-sm focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500"
                  >
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="descriptive">Descriptive</option>
                    <option value="file-upload">File Upload</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Question
                  </label>
                  <input
                    type="text"
                    value={editForm.question}
                    onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                    className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 text-sm focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500"
                    placeholder="Enter your question"
                  />
                </div>
                {editForm.questionType === 'multiple-choice' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {editForm.options.map((option, index) => (
                      <div key={index}>
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
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
                          className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 text-sm focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500"
                          placeholder={`Enter option ${index + 1}`}
                        />
                      </div>
                    ))}
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Correct Option
                      </label>
                      <select
                        value={editForm.correctOption}
                        onChange={(e) => setEditForm({ ...editForm, correctOption: e.target.value })}
                        className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gradient-to-br dark:bg-gray-800 text-gray-900 dark:text-gray-200 text-sm focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500"
                      >
                        <option value="">Select Correct Option</option>
                        {editForm.options.map((option, index) => (
                          option && <option key={index} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Scoring Type
                  </label>
                  <select
                    value={editForm.scoringType}
                    onChange={(e) => setEditForm({ ...editForm, scoringType: e.target.value })}
                    className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 text-sm focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500"
                  >
                    <option value="basic">Basic</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Max Score
                  </label>
                  <input
                    type="number"
                    value={editForm.maxScore}
                    onChange={(e) => setEditForm({ ...editForm, maxScore: Number(e.target.value) })}
                    className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 text-sm focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500"
                    placeholder="Enter max score"
                    min="1"
                  />
                </div>
                <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
                  <motion.button
                    whileHover={buttonHover}
                    type="submit"
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base hover:from-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-indigo-600 shadow-lg"
                  >
                    Save Changes
                  </motion.button>
                  <motion.button
                    whileHover={buttonHover}
                    type="button"
                    onClick={() => setEditingSurvey(null)}
                    className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-lg text-sm sm:text-base hover:bg-gray-400 dark:hover:bg-gray-500 focus:ring-2 focus:ring-gray-400 shadow-lg"
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredSurveys.map((survey, index) => (
                  <motion.div
                    key={survey._id}
                    {...cardAnimation}
                    transition={{ delay: index * 0.1 }}
                    className="relative bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200 dark:border-gray-700"
                  >
                    {/* Icons */}
                    <div className="absolute top-4 right-4 flex space-x-2">
                      {/* <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEdit(survey)}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                        aria-label="Edit survey"
                      >
                        <HiPencil className="w-5 h-5" />
                      </motion.button> */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(survey._id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        aria-label="Delete survey"
                      >
                        <HiTrash className="w-5 h-5" />
                      </motion.button>
                    </div>
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 pr-12">
                      {survey.question || 'No question provided'}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span className="font-medium">Section:</span> {survey.sectionId?.name || 'Uncategorized'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span className="font-medium">Subsection:</span> {survey.subsectionId?.name || 'Uncategorized'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span className="font-medium">Category:</span> {survey.categoryId?.name || 'Uncategorized'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span className="font-medium">Question Type:</span> {(survey.questionType || 'unknown').replace('-', ' ').toUpperCase()}
                    </p>
                    {survey.questionType === 'multiple-choice' && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Options:</p>
                        <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
                          {(survey.options || []).map((option, index) => (
                            <li key={index}>{option || 'N/A'}</li>
                          ))}
                        </ul>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Correct Option:</span> {survey.correctOption || 'N/A'}
                        </p>
                      </div>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span className="font-medium">Scoring Type:</span> {(survey.scoringType || 'basic').toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Max Score:</span> {survey.maxScore || 'N/A'}
                    </p>
                  </motion.div>
                ))}
              </div>
            )
          ) : (
            <motion.div
              {...fadeIn}
              className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-md"
            >
              <svg
                className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
              <p className="text-gray-600 dark:text-gray-400 text-lg mt-4">
                No questions available for the selected filters.
              </p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </ProtectedRoute>
  );
}

export default ViewQuestions;