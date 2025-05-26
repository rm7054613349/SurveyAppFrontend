
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  createSurvey,
  getCategories,
  createCategory,
  getSections,
  createSection,
  getSubsections,
  createSubsection,
} from '../services/api';
import { pageTransition, buttonHover, fadeIn } from '../animations/framerAnimations';
import ProtectedRoute from '../components/ProtectedRoute';
import LoadingSpinner from '../components/LoadingSpinner';

function CreateQuestion() {
  const [newQuestion, setNewQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [section, setSection] = useState('');
  const [newSection, setNewSection] = useState('');
  const [subsection, setSubsection] = useState('');
  const [newSubsection, setNewSubsection] = useState('');
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [questionType, setQuestionType] = useState('multiple-choice');
  const [correctOption, setCorrectOption] = useState('');
  const [scoringType, setScoringType] = useState('basic');
  const [maxScore, setMaxScore] = useState(1);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [sections, setSections] = useState([]);
  const [subsections, setSubsections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sectionData, subsectionData, categoryData] = await Promise.all([
          getSections(),
          getSubsections(),
          getCategories(),
        ]);
        console.log('Fetched data:', { sections: sectionData, subsections: subsectionData, categories: categoryData });
        setSections(sectionData);
        setSubsections(subsectionData);
        setCategories(categoryData);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        console.error('Error fetching data:', {
          message: err.message,
          stack: err.stack,
          error: err,
        });
        toast.error(err.message || 'Failed to fetch sections, subsections, or categories');
      }
    };
    fetchData();
  }, []);

  const filteredSubsections = subsections.filter(
    (sub) => sub.sectionId?._id === section
  );

  const filteredCategories = categories.filter(
    (cat) => cat.subsectionId?._id === subsection
  );

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 20 * 1024 * 1024) {
        toast.error('File size must be less than 20MB');
        return;
      }
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp', 'image/tiff', 'image/heic', 'image/heif',
        'video/mp4', 'video/mpeg', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska',
        'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/webm', 'audio/aac', 'audio/x-wav',
        'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain', 'text/csv', 'text/html', 'application/json', 'application/rtf', 'application/xml',
        'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed', 'application/x-tar', 'application/gzip',
        'application/javascript', 'application/x-python-code', 'application/x-java', 'text/css', 'text/markdown',
        'text/x-c', 'text/x-c++', 'text/x-java-source',
      ];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Unsupported file type');
        return;
      }
      console.log('Selected file:', { name: selectedFile.name, size: selectedFile.size, type: selectedFile.type });
      setFile(selectedFile);
      setFilePreview(URL.createObjectURL(selectedFile));
    } else {
      setFile(null);
      setFilePreview(null);
    }
  };

  const handleCreateSurvey = async (e) => {
    e.preventDefault();

    if (!newQuestion.trim()) {
      toast.error('Question cannot be empty');
      return;
    }
    if (!section && !newSection.trim()) {
      toast.error('Please select or create a section');
      return;
    }
    if (!subsection && !newSubsection.trim()) {
      toast.error('Please select or create a subsection');
      return;
    }
    if (!category && !newCategory.trim()) {
      toast.error('Please select or create a category');
      return;
    }
    if (questionType === 'multiple-choice') {
      if (!options || options.length !== 4) {
        toast.error('Multiple-choice questions must have exactly 4 options');
        return;
      }
      if (options.some((opt) => !opt || !opt.trim())) {
        toast.error('All options must be filled for multiple-choice questions');
        return;
      }
      if (!correctOption) {
        toast.error('Please select a correct option for multiple-choice questions');
        return;
      }
      if (!options.includes(correctOption)) {
        toast.error('Correct option must be one of the provided options');
        return;
      }
    }
    if (questionType === 'descriptive' && options.some((opt) => opt.trim())) {
      toast.error('Descriptive questions should not have options');
      return;
    }
    if (questionType === 'file-upload') {
      if (!file) {
        toast.error('File is required for file-upload questions');
        return;
      }
      if (options.some((opt) => opt.trim())) {
        toast.error('File-upload questions should not have options');
        return;
      }
    }
    if (!maxScore || maxScore <= 0 || isNaN(maxScore)) {
      toast.error('Max score must be a positive number');
      return;
    }

    try {
      setLoading(true);
      let sectionId = section;
      if (newSection.trim()) {
        try {
          const newSectionData = await createSection({ name: newSection.trim() });
          if (!newSectionData || !newSectionData._id) {
            console.error('Section creation response:', newSectionData);
            throw new Error('Failed to create section: Invalid response from server');
          }
          sectionId = newSectionData._id;
          setSections([...sections, newSectionData]);
          toast.success(`Section "${newSectionData.name}" created successfully`);
          console.log('New section created:', newSectionData);
        } catch (err) {
          console.error('Section creation error:', {
            message: err.message,
            stack: err.stack,
            response: err.response ? {
              status: err.response.status,
              data: err.response.data,
              headers: err.response.headers,
            } : 'No response data',
            error: err,
          });
          toast.error(`Failed to create section: ${err.message || 'Unknown error'}`);
          setLoading(false);
          return;
        }
      }

      let subsectionId = subsection;
      if (newSubsection.trim()) {
        if (!sectionId || typeof sectionId !== 'string' || sectionId.length !== 24) {
          console.error('Invalid sectionId:', sectionId);
          toast.error('Invalid section ID. Please select or create a valid section.');
          setLoading(false);
          return;
        }
        if (newSubsection.trim().length < 3) {
          toast.error('Subsection name must be at least 3 characters long');
          setLoading(false);
          return;
        }
        try {
          const subsectionData = { name: newSubsection.trim(), sectionId };
          console.log('Creating subsection with data:', subsectionData);
          const newSubsectionData = await createSubsection(subsectionData);
          if (!newSubsectionData || !newSubsectionData._id) {
            console.error('Subsection creation response:', newSubsectionData);
            throw new Error('Failed to create subsection: Invalid response from server');
          }
          subsectionId = newSubsectionData._id;
          setSubsections([...subsections, newSubsectionData]);
          toast.success(`Subsection "${newSubsectionData.name}" created successfully`);
          console.log('New subsection created:', newSubsectionData);
        } catch (err) {
          const errorMessage = err.response?.data?.message || err.message || 'Unknown error';
          console.error('Subsection creation error:', {
            message: errorMessage,
            stack: err.stack,
            response: err.response ? {
              status: err.response.status,
              data: err.response.data,
              headers: err.response.headers,
            } : 'No response data',
            error: err,
          });
          toast.error(`Failed to create subsection: ${errorMessage}`);
          setLoading(false);
          return;
        }
      }

      let categoryId = category;
      if (newCategory.trim()) {
        if (!subsectionId) {
          toast.error('Cannot create category without a valid subsection');
          setLoading(false);
          return;
        }
        try {
          const newCategoryData = await createCategory({
            name: newCategory.trim(),
            subsectionId,
          });
          if (!newCategoryData || !newCategoryData._id) {
            console.error('Category creation response:', newCategoryData);
            throw new Error('Failed to create category: Invalid response from server');
          }
          categoryId = newCategoryData._id;
          setCategories([...categories, newCategoryData]);
          toast.success(`Category "${newCategoryData.name}" created successfully`);
          console.log('New category created:', newCategoryData);
        } catch (err) {
          console.error('Category creation error:', {
            message: err.message,
            stack: err.stack,
            response: err.response ? {
              status: err.response.status,
              data: err.response.data,
              headers: err.response.headers,
            } : 'No response data',
            error: err,
          });
          toast.error(`Failed to create category: ${err.message || 'Unknown error'}`);
          setLoading(false);
          return;
        }
      }

      if (!sectionId || !subsectionId || !categoryId) {
        console.error('Invalid IDs:', { sectionId, subsectionId, categoryId });
        toast.error('Invalid section, subsection, or category ID');
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('question', newQuestion.trim());
      formData.append('categoryId', categoryId);
      formData.append('sectionId', sectionId);
      formData.append('subsectionId', subsectionId);
      formData.append('questionType', questionType);
      formData.append('scoringType', scoringType);
      formData.append('maxScore', maxScore.toString());
      if (questionType === 'multiple-choice') {
        console.log('Options before FormData:', options); // Debug log
        options.forEach((option, index) => {
          if (option && option.trim()) {
            formData.append(`option${index + 1}`, option.trim());
          }
        });
        if (correctOption && correctOption.trim()) {
          formData.append('correctOption', correctOption.trim());
        }
      }
      if (file) {
        formData.append('file', file);
      }

      console.log('FormData before submission:', [...formData.entries()]);

      const surveyResponse = await createSurvey(formData);
      console.log('Survey creation response:', surveyResponse);

      setNewQuestion('');
      setOptions(['', '', '', '']);
      setNewSection('');
      setNewSubsection('');
      setNewCategory('');
      setQuestionType('multiple-choice');
      setCorrectOption('');
      setScoringType('basic');
      setMaxScore(1);
      setFile(null);
      setFilePreview(null);
      setSection(sectionId);
      setSubsection(subsectionId);
      setCategory(categoryId);
      toast.success('Survey question created successfully!');
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error('Error creating survey:', {
        message: err.message,
        stack: err.stack,
        response: err.response ? {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers,
        } : 'No response data',
        error: err,
      });
      toast.error(`Failed to create survey: ${err.message || 'Unknown error'}`);
    }
  };

  if (loading) {
    return (
      <motion.div
        {...fadeIn}
        className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900"
      >
        <LoadingSpinner />
      </motion.div>
    );
  }

  return (
    <ProtectedRoute allowedRole="admin">
      <motion.div {...pageTransition} className="w-full flex-1 py-20 flex flex-col items-center justify-start min-h-screen bg-[#afeeee] dark:bg-gray-900 px-4 sm:px-6 md:px-8" >
        <motion.h2 {...fadeIn} className="text-3xl font-bold mb-6 text-primary-blue text-center">
          Create New Survey Question
        </motion.h2>
        <form onSubmit={handleCreateSurvey} className="space-y-6 bg-card-bg dark:bg-card-dark-bg p-8 rounded-lg shadow-lg content-box">
          <motion.div {...fadeIn} transition={{ delay: 0.1 }}>
            <label className="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Select Section</label>
            <select
              value={section}
              onChange={(e) => {
                setSection(e.target.value);
                setSubsection('');
                setCategory('');
                setNewSubsection('');
                setNewCategory('');
              }}
              className="w-full p-3 border rounded dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-secondary-green"
            >
              <option value="">Select Section</option>
              {sections.map((sec) => (
                <option key={sec._id} value={sec._id}>{sec.name}</option>
              ))}
            </select>
          </motion.div>
          <motion.div {...fadeIn} transition={{ delay: 0.15 }}>
            <label className="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Or Create New Section</label>
            <input
              type="text"
              value={newSection}
              onChange={(e) => setNewSection(e.target.value)}
              className="w-full p-3 border rounded dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-secondary-green"
              placeholder="Enter new section name (e.g., Mathematics)"
              disabled={section}
            />
          </motion.div>

          <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
            <label className="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Select Subsection</label>
            <select
              value={subsection}
              onChange={(e) => {
                setSubsection(e.target.value);
                setCategory('');
                setNewCategory('');
              }}
              className="w-full p-3 border rounded dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-secondary-green"
              disabled={!section && !newSection.trim()}
            >
              <option value="">Select Subsection</option>
              {filteredSubsections.map((sub) => (
                <option key={sub._id} value={sub._id}>{sub.name}</option>
              ))}
            </select>
          </motion.div>
          <motion.div {...fadeIn} transition={{ delay: 0.25 }}>
            <label className="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Or Create New Subsection</label>
            <input
              type="text"
              value={newSubsection}
              onChange={(e) => setNewSubsection(e.target.value)}
              className="w-full p-3 border rounded dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-secondary-green"
              placeholder="Enter new subsection name (e.g., Algebra)"
              disabled={subsection || (!section && !newSection.trim())}
            />
          </motion.div>

          <motion.div {...fadeIn} transition={{ delay: 0.3 }}>
            <label className="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Select Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 border rounded dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-secondary-green"
              disabled={!subsection && !newSubsection.trim()}
            >
              <option value="">Select Category</option>
              {filteredCategories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </motion.div>
          <motion.div {...fadeIn} transition={{ delay: 0.35 }}>
            <label className="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Or Create New Category</label>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full p-3 border rounded dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-secondary-green"
              placeholder="Enter new category name (e.g., Linear Equations)"
              disabled={category || (!subsection && !newSubsection.trim())}
            />
          </motion.div>

          <motion.div {...fadeIn} transition={{ delay: 0.4 }}>
            <label className="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Question Type</label>
            <select
              value={questionType}
              onChange={(e) => {
                setQuestionType(e.target.value);
                setOptions(['', '', '', '']);
                setCorrectOption('');
                setFile(null);
                setFilePreview(null);
              }}
              className="w-full p-3 border rounded dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-secondary-green"
            >
              <option value="multiple-choice">Multiple Choice</option>
              <option value="descriptive">Descriptive</option>
              <option value="file-upload">File Upload</option>
            </select>
          </motion.div>

          <motion.div {...fadeIn} transition={{ delay: 0.45 }}>
            <label className="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Question</label>
            <input
              type="text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="w-full p-3 border rounded dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-secondary-green"
              placeholder="Enter your question (e.g., What is 2+2?)"
            />
          </motion.div>

          {questionType === 'multiple-choice' && (
            <>
              {options.map((option, index) => (
                <motion.div key={index} {...fadeIn} transition={{ delay: 0.5 + 0.1 * index }}>
                  <label className="block mb-2 text-gray-700 dark:text-gray-300 font-medium">
                    Option {index + 1}
                  </label>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...options];
                      newOptions[index] = e.target.value;
                      setOptions(newOptions);
                      if (correctOption === option) {
                        setCorrectOption(e.target.value);
                      }
                    }}
                    className="w-full p-3 border rounded dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-secondary-green"
                    placeholder={`Enter option ${index + 1} (e.g., 4)`}
                    required // Add required attribute
                  />
                </motion.div>
              ))}
              <motion.div {...fadeIn} transition={{ delay: 0.9 }}>
                <label className="block mb-2 text-gray-700 dark:text-gray-300 font-medium">
                  Correct Option
                </label>
                <select
                  value={correctOption}
                  onChange={(e) => setCorrectOption(e.target.value)}
                  className="w-full p-3 border rounded dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-secondary-green"
                  required // Add required attribute
                >
                  <option value="">Select Correct Option</option>
                  {options.map((option, index) => (
                    option.trim() && (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    )
                  ))}
                </select>
              </motion.div>
            </>
          )}

          {questionType === 'file-upload' && (
            <motion.div {...fadeIn} transition={{ delay: 0.5 }}>
              <label className="block mb-2 text-gray-700 dark:text-gray-300 font-medium">
                Upload File (Required)
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full p-3 border rounded dark:bg-gray-800 dark:text-white"
                accept="
                .jpg,.jpeg,.png,.gif,.webp,.svg,.bmp,.tiff,
                .pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,
                .txt,.csv,.json,.xml,
                .zip,.rar,.7z,.tar,
                .mp3,.wav,.ogg,
                .mp4,.avi,.mkv,.webm"
                required
              />
              {filePreview && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Preview: <a href={filePreview} target="_blank" rel="noopener noreferrer" className="text-secondary-green hover:underline">View File</a>
                  </p>
                </div>
              )}
            </motion.div>
          )}

          <motion.div {...fadeIn} transition={{ delay: 1.0 }}>
            <label className="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Scoring Type</label>
            <select
              value={scoringType}
              onChange={(e) => setScoringType(e.target.value)}
              className="w-full p-3 border rounded dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-secondary-green"
            >
              <option value="basic">Basic</option>
              <option value="hard">Hard</option>
            </select>
          </motion.div>

          <motion.div {...fadeIn} transition={{ delay: 1.1 }}>
            <label className="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Max Score</label>
            <input
              type="number"
              value={maxScore}
              onChange={(e) => setMaxScore(Number(e.target.value))}
              className="w-full p-3 border rounded dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-secondary-green"
              placeholder="Enter max score (e.g., 10)"
              min="1"
              required
            />
          </motion.div>

          <motion.button
            whileHover={buttonHover}
            type="submit"
            disabled={loading}
            className={`w-full p-3 rounded-lg text-white ${
              loading
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                : 'bg-primary-blue hover:bg-primary-blue/90 focus:ring-2 focus:ring-primary-blue'
            }`}
          >
            {loading ? 'Creating...' : 'Create Survey Question'}
          </motion.button>
        </form>
      </motion.div>
    </ProtectedRoute>
  );
}

export default CreateQuestion;
