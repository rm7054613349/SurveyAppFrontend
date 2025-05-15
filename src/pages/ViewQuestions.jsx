import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
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
        <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="mb-6 space-y-4">
          <div>
            <label className="block mb-2 text-gray-700 dark:text-gray-300 text-sm sm:text-base font-medium">
              Filter by Section
            </label>
            <select
              value={selectedSection}
              onChange={(e) => {
                setSelectedSection(e.target.value);
                setSelectedSubsection('all');
                setSelectedCategory('all');
              }}
              className="w-full sm:w-64 p-2 sm:p-3 border rounded dark:bg-gray-800 dark:text-white text-sm sm:text-base focus:ring-2 focus:ring-secondary-green"
            >
              <option value="all">All Sections</option>
              {sections.map((sec) => (
                <option key={sec._id} value={sec._id}>{sec.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2 text-gray-700 dark:text-gray-300 text-sm sm:text-base font-medium">
              Filter by Subsection
            </label>
            <select
              value={selectedSubsection}
              onChange={(e) => {
                setSelectedSubsection(e.target.value);
                setSelectedCategory('all');
              }}
              className="w-full sm:w-64 p-2 sm:p-3 border rounded dark:bg-gray-800 dark:text-white text-sm sm:text-base focus:ring-2 focus:ring-secondary-green"
              disabled={selectedSection === 'all'}
            >
              <option value="all">All Subsections</option>
              {filteredSubsections.map((sub) => (
                <option key={sub._id} value={sub._id}>{sub.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2 text-gray-700 dark:text-gray-300 text-sm sm:text-base font-medium">
              Filter by Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-64 p-2 sm:p-3 border rounded dark:bg-gray-800 dark:text-white text-sm sm:text-base focus:ring-2 focus:ring-secondary-green"
              disabled={selectedSubsection === 'all'}
            >
              <option value="all">All Categories</option>
              {filteredCategories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
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
                    Section
                  </label>
                  <select
                    value={editForm.sectionId}
                    onChange={(e) => setEditForm({ ...editForm, sectionId: e.target.value, subsectionId: '', categoryId: '' })}
                    className="w-full p-2 sm:p-3 border rounded dark:bg-gray-800 dark:text-white text-sm sm:text-base focus:ring-2 focus:ring-secondary-green"
                  >
                    <option value="">Select Section</option>
                    {sections.map((sec) => (
                      <option key={sec._id} value={sec._id}>{sec.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-gray-700 dark:text-gray-300 text-sm sm:text-base font-medium">
                    Subsection
                  </label>
                  <select
                    value={editForm.subsectionId}
                    onChange={(e) => setEditForm({ ...editForm, subsectionId: e.target.value, categoryId: '' })}
                    className="w-full p-2 sm:p-3 border rounded dark:bg-gray-800 dark:text-white text-sm sm:text-base focus:ring-2 focus:ring-secondary-green"
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
                  <label className="block mb-2 text-gray-700 dark:text-gray-300 text-sm sm:text-base font-medium">
                    Category
                  </label>
                  <select
                    value={editForm.categoryId}
                    onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value })}
                    className="w-full p-2 sm:p-3 border rounded dark:bg-gray-800 dark:text-white text-sm sm:text-base focus:ring-2 focus:ring-secondary-green"
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
                  <label className="block mb-2 text-gray-700 dark:text-gray-300 text-sm sm:text-base font-medium">
                    Question Type
                  </label>
                  <select
                    value={editForm.questionType}
                    onChange={(e) => setEditForm({ ...editForm, questionType: e.target.value, options: ['', '', '', ''], correctOption: '' })}
                    className="w-full p-2 sm:p-3 border rounded dark:bg-gray-800 dark:text-white text-sm sm:text-base focus:ring-2 focus:ring-secondary-green"
                  >
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="descriptive">Descriptive</option>
                    <option value="file-upload">File Upload</option>
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
                {editForm.questionType === 'multiple-choice' && (
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
                    <div>
                      <label className="block mb-2 text-gray-700 dark:text-gray-300 text-sm sm:text-base font-medium">
                        Correct Option
                      </label>
                      <select
                        value={editForm.correctOption}
                        onChange={(e) => setEditForm({ ...editForm, correctOption: e.target.value })}
                        className="w-full p-2 sm:p-3 border rounded dark:bg-gray-800 dark:text-white text-sm sm:text-base focus:ring-2 focus:ring-secondary-green"
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
                  <label className="block mb-2 text-gray-700 dark:text-gray-300 text-sm sm:text-base font-medium">
                    Scoring Type
                  </label>
                  <select
                    value={editForm.scoringType}
                    onChange={(e) => setEditForm({ ...editForm, scoringType: e.target.value })}
                    className="w-full p-2 sm:p-3 border rounded dark:bg-gray-800 dark:text-white text-sm sm:text-base focus:ring-2 focus:ring-secondary-green"
                  >
                    <option value="basic">Basic</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-gray-700 dark:text-gray-300 text-sm sm:text-base font-medium">
                    Max Score
                  </label>
                  <input
                    type="number"
                    value={editForm.maxScore}
                    onChange={(e) => setEditForm({ ...editForm, maxScore: Number(e.target.value) })}
                    className="w-full p-2 sm:p-3 border rounded dark:bg-gray-800 dark:text-white text-sm sm:text-base focus:ring-2 focus:ring-secondary-green"
                    placeholder="Enter max score"
                    min="1"
                  />
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
                      {survey.question || 'No question provided'}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <strong>Section:</strong> {survey.sectionId?.name || 'Uncategorized'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <strong>Subsection:</strong> {survey.subsectionId?.name || 'Uncategorized'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <strong>Category:</strong> {survey.categoryId?.name || 'Uncategorized'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <strong>Question Type:</strong> {(survey.questionType || 'unknown').replace('-', ' ').toUpperCase()}
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
                          <strong>Correct Option:</strong> {survey.correctOption || 'N/A'}
                        </p>
                      </div>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <strong>Scoring Type:</strong> {(survey.scoringType || 'basic').toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <strong>Max Score:</strong> {survey.maxScore || 'N/A'}
                    </p>
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
              No questions available for the selected filters.
            </p>
          )}
        </motion.div>
      </motion.div>
    </ProtectedRoute>
  );
}

export default ViewQuestions;