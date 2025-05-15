
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getSurveys, getSurveysBySubsection, getSections, getSubsections, submitResponses, getFileContent } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

// Animation definitions
const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.5 },
};

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.5 },
};

const popupAnimation = {
  initial: { opacity: 0, scale: 0.7, rotateX: 20 },
  animate: { opacity: 1, scale: 1, rotateX: 0 },
  exit: { opacity: 0, scale: 0.7, rotateX: 20 },
  transition: { duration: 0.3, type: 'spring', stiffness: 100 },
};

const sectionVariants = {
  hidden: { opacity: 0, scale: 0.8, rotate: -10 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.4,
      type: 'spring',
      stiffness: 120,
      when: 'beforeChildren',
      staggerChildren: 0.1,
    },
  },
  hover: { scale: 1.1, rotate: 5, boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)' },
};

const sectionChildVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const subsectionVariants = {
  hidden: { opacity: 0, y: -30, rotateY: 15 },
  visible: {
    opacity: 1,
    y: 0,
    rotateY: 0,
    transition: {
      duration: 0.5,
      type: 'spring',
      stiffness: 100,
      when: 'beforeChildren',
      staggerChildren: 0.1,
    },
  },
  hover: { scale: 1.08, rotateY: -5, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' },
};

const subsectionChildVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

const questionVariants = {
  hidden: { opacity: 0, x: 100, scale: 0.9 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
      when: 'beforeChildren',
      staggerChildren: 0.15,
    },
  },
  exit: { opacity: 0, x: -100, scale: 0.9, transition: { duration: 0.5 } },
};

const questionChildVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const adminFileVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      type: 'spring',
      stiffness: 100,
      when: 'beforeChildren',
      staggerChildren: 0.1,
    },
  },
};

const adminFileChildVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

function SurveyForm() {
  const { subsectionId } = useParams();
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState([]);
  const [sections, setSections] = useState([]);
  const [subsections, setSubsections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [currentSubsection, setCurrentSubsection] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timers, setTimers] = useState({});
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [showWarning, setShowWarning] = useState({});
  const [showSubsectionPopup, setShowSubsectionPopup] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [fileContent, setFileContent] = useState(null);
  const [fileType, setFileType] = useState('');
  const [fileError, setFileError] = useState(null);
  const [pendingSubsection, setPendingSubsection] = useState(null);
  const [completedSubsections, setCompletedSubsections] = useState(new Set());
  const [cachedFileContent, setCachedFileContent] = useState({});
  const hasFetched = useRef(false);
  const isMounted = useRef(true);
  const blobUrls = useRef(new Map());

  useEffect(() => {
    isMounted.current = true;
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [sectionData, subsectionData, surveyDataResult] = await Promise.all([
          getSections().catch(err => {
            console.error('Failed to fetch sections:', err);
            return [];
          }),
          getSubsections().catch(err => {
            console.error('Failed to fetch subsections:', err);
            return [];
          }),
          (subsectionId ? getSurveysBySubsection(subsectionId) : getSurveys()).catch(err => {
            console.error(`Failed to fetch surveys${subsectionId ? ' by subsection' : ''}:`, err);
            return [];
          }),
        ]);

        if (isMounted.current) {
          const normalizedSurveys = Array.isArray(surveyDataResult) ? surveyDataResult : [];
          const normalizedSubsections = Array.isArray(subsectionData)
            ? subsectionData
            : subsectionData && typeof subsectionData === 'object'
            ? Object.values(subsectionData)
            : [];
          console.log('Fetched Data:', {
            surveys: normalizedSurveys.map(s => ({
              _id: s._id,
              question: s.question,
              fileUrl: s.fileUrl,
              questionType: s.questionType,
              subsectionId: s.subsectionId?._id,
            })),
            sections: Array.isArray(sectionData) ? sectionData : [],
            subsections: normalizedSubsections,
          });
          setSurveys(normalizedSurveys);
          setSections(Array.isArray(sectionData) ? sectionData : []);
          setSubsections(normalizedSubsections);
          if (subsectionId) {
            const subsection = normalizedSubsections.find(sub => sub._id === subsectionId);
            if (subsection && subsection.sectionId?._id) {
              setSelectedSection(subsection.sectionId._id);
            }
            setCurrentSubsection(subsectionId);
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted.current) {
          console.error('Fetch error:', err);
          toast.error('Failed to load survey data.');
          setSurveys([]);
          setSections([]);
          setSubsections([]);
          setLoading(false);
        }
      }
    };
    fetchData();

    return () => {
      isMounted.current = false;
      blobUrls.current.forEach(url => URL.revokeObjectURL(url));
      blobUrls.current.clear();
    };
  }, [subsectionId]);

  // Clear cached file content on section change
  useEffect(() => {
    setCachedFileContent({});
    setFileContent(null);
    setFileType('');
    setFileError(null);
    blobUrls.current.forEach(url => URL.revokeObjectURL(url));
    blobUrls.current.clear();
  }, [selectedSection]);

  // Pre-fetch file content with retry for file-upload subsections
  useEffect(() => {
    if (!currentSubsection || !isFileUploadSubsection(currentSubsection)) return;

    const fetchFileContent = async (retries = 2, delay = 1000) => {
      const fileUrl = getAdminFileUrl(currentSubsection);
      if (!fileUrl || cachedFileContent[fileUrl]) return;

      const attemptFetch = async (attempt) => {
        try {
          console.log(`Pre-fetching file (attempt ${attempt}):`, fileUrl);
          const response = await getFileContent(fileUrl);
          const contentType = response.headers?.['content-type'] || 'application/octet-stream';
          console.log('Pre-fetched file:', { filename: fileUrl, contentType, status: response.status });

          let content;
          let type;

          if (contentType.includes('text')) {
            content = await response.data.text();
            type = 'text';
          } else if (contentType.includes('image')) {
            content = URL.createObjectURL(await response.data);
            type = 'image';
            blobUrls.current.set(fileUrl, content);
          } else if (contentType.includes('pdf')) {
            content = URL.createObjectURL(await response.data);
            type = 'pdf';
            blobUrls.current.set(fileUrl, content);
          } else if (contentType.includes('video')) {
            content = URL.createObjectURL(await response.data);
            type = 'video';
            blobUrls.current.set(fileUrl, content);
          } else if (contentType.includes('audio')) {
            content = URL.createObjectURL(await response.data);
            type = 'audio';
            blobUrls.current.set(fileUrl, content);
          } else {
            content = URL.createObjectURL(await response.data);
            type = 'download';
            blobUrls.current.set(fileUrl, content);
          }

          if (isMounted.current) {
            setCachedFileContent(prev => ({
              ...prev,
              [fileUrl]: { content, type },
            }));
            setFileType(type);
          }
        } catch (error) {
          console.error(`Pre-fetch error (attempt ${attempt}):`, {
            fileUrl,
            message: error.message,
            status: error.response?.status,
          });
          if (attempt <= retries) {
            console.log(`Retrying fetch for ${fileUrl} in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return attemptFetch(attempt + 1);
          }
          if (isMounted.current) {
            setCachedFileContent(prev => ({
              ...prev,
              [fileUrl]: { error: `Failed to pre-fetch file: ${error.message}` },
            }));
          }
        }
      };

      attemptFetch(1);
    };

    fetchFileContent();
  }, [currentSubsection]);

  // Timer for non-file-upload subsections
  useEffect(() => {
    if (!currentSubsection || isFileUploadSubsection(currentSubsection)) return;

    const timerId = setInterval(() => {
      if (subsectionId) {
        setTimeLeft(prev => {
          if (prev <= 0) {
            handleSubmit();
            return 0;
          }
          if (prev <= 60 && !showWarning[currentSubsection]) {
            setShowWarning(prev => ({ ...prev, [currentSubsection]: true }));
          }
          return prev - 1;
        });
      } else {
        setTimers(prev => {
          const timeLeft = prev[currentSubsection] || 30 * 60;
          if (timeLeft <= 0) {
            handleAutoSubmit(currentSubsection);
            return prev;
          }
          if (timeLeft <= 60 && !showWarning[currentSubsection]) {
            setShowWarning(prev => ({ ...prev, [currentSubsection]: true }));
          }
          return { ...prev, [currentSubsection]: timeLeft - 1 };
        });
      }
    }, 1000);
    return () => clearInterval(timerId);
  }, [currentSubsection, subsectionId]);

  const isFileUploadSubsection = subsectionId => {
    return surveys.some(survey => survey.subsectionId?._id === subsectionId && survey.questionType === 'file-upload');
  };

  const hasAdminFile = subsectionId => {
    const surveyWithFile = surveys.find(
      survey => survey.subsectionId?._id === subsectionId && survey.questionType === 'file-upload' && survey.fileUrl
    );
    return surveyWithFile?.fileUrl && typeof surveyWithFile.fileUrl === 'string';
  };

  const getAdminFileUrl = subsectionId => {
    const surveyWithFile = surveys.find(
      survey => survey.subsectionId?._id === subsectionId && survey.questionType === 'file-upload' && survey.fileUrl
    );
    if (surveyWithFile?.fileUrl) {
      const normalized = surveyWithFile.fileUrl
        .replace(/^Uploads[\\\/]+/, '')
        .replace(/^[\\\/]+/, '')
        .replace(/[\\\/]+$/, '')
        .split(/[\\\/]/)
        .pop();
      console.log('getAdminFileUrl:', {
        subsectionId,
        original: surveyWithFile.fileUrl,
        normalized,
      });
      return normalized;
    }
    console.warn('getAdminFileUrl: No file found for subsection', { subsectionId });
    return null;
  };

  const getAdminFileQuestion = subsectionId => {
    const surveyWithFile = surveys.find(
      survey => survey.subsectionId?._id === subsectionId && survey.questionType === 'file-upload' && survey.fileUrl
    );
    return surveyWithFile?.question || 'No question provided';
  };

  const filteredSubsections = Array.isArray(subsections)
    ? subsections.filter(sub => sub.sectionId?._id === selectedSection)
    : [];

  const filteredSurveys = Array.isArray(surveys)
    ? surveys.filter(survey => survey.sectionId?._id === selectedSection && survey.subsectionId?._id === currentSubsection)
    : [];

  const isSubsectionLocked = (subsectionId, index) => {
    if (index === 0) return false;
    return !completedSubsections.has(filteredSubsections[0]?._id);
  };

  const handleSectionClick = sectionId => {
    setSelectedSection(sectionId);
    setCurrentSubsection('');
    setCurrentQuestionIndex(0);
    setTimers({});
    setShowWarning({});
    setShowSubsectionPopup(false);
    setShowFileModal(false);
    setFileContent(null);
    setFileError(null);
  };

  const handleSubsectionClick = subsectionId => {
    if (isSubsectionLocked(subsectionId, filteredSubsections.findIndex(sub => sub._id === subsectionId))) {
      toast.info('Please complete the first subsection.');
      return;
    }
    setPendingSubsection(subsectionId);
    setShowSubsectionPopup(true);
  };

  const handleSubsectionConfirm = () => {
    if (pendingSubsection) {
      setCurrentSubsection(pendingSubsection);
      setCurrentQuestionIndex(0);
      if (!isFileUploadSubsection(pendingSubsection)) {
        setTimers(prev => ({ ...prev, [pendingSubsection]: 30 * 60 }));
        setShowWarning(prev => ({ ...prev, [pendingSubsection]: false }));
      } else {
        setCompletedSubsections(prev => new Set(prev).add(pendingSubsection));
      }
      console.log('Opened Subsection:', pendingSubsection, { fileUrl: getAdminFileUrl(pendingSubsection) });
      setShowSubsectionPopup(false);
      setPendingSubsection(null);
    }
  };

  const handleResponseChange = (surveyId, value) => {
    setResponses(prev => ({
      ...prev,
      [surveyId]: { answer: value || prev[surveyId]?.answer || '' },
    }));
  };

  const handleOpenFile = async (fileUrl) => {
    if (typeof fileUrl !== 'string' || !fileUrl) {
      toast.error('Invalid file URL');
      console.error('handleOpenFile: Invalid fileUrl', { fileUrl });
      setFileError('Invalid file URL');
      setShowFileModal(true);
      return;
    }

    if (cachedFileContent[fileUrl] && !cachedFileContent[fileUrl].error) {
      console.log('Using cached file content:', {
        fileUrl,
        type: cachedFileContent[fileUrl].type,
        contentPreview: cachedFileContent[fileUrl].content?.substring(0, 50),
      });
      setFileContent(cachedFileContent[fileUrl].content);
      setFileType(cachedFileContent[fileUrl].type);
      setFileError(null);
      setShowFileModal(true);
      return;
    }

    const normalizedFileUrl = fileUrl
      .replace(/^Uploads[\\\/]+/, '')
      .replace(/^[\\\/]+/, '')
      .replace(/[\\\/]+$/, '')
      .split(/[\\\/]/)
      .pop();
    const requestUrl = `/api/files/${normalizedFileUrl}`;

    console.log('handleOpenFile:', {
      original: fileUrl,
      normalized: normalizedFileUrl,
      requestUrl,
    });

    try {
      setFileError(null);
      setFileContent(null);
      setFileType('');
      console.log('Fetching file:', requestUrl);
      const response = await getFileContent(normalizedFileUrl);
      const contentType = response.headers?.['content-type'] || 'application/octet-stream';
      console.log('File fetched:', {
        filename: normalizedFileUrl,
        contentType,
        status: response.status,
        size: response.data.size,
      });

      let content;
      let type;

      if (contentType.includes('text')) {
        content = await response.data.text();
        type = 'text';
      } else if (contentType.includes('image')) {
        content = URL.createObjectURL(await response.data);
        type = 'image';
        blobUrls.current.set(fileUrl, content);
      } else if (contentType.includes('pdf')) {
        content = URL.createObjectURL(await response.data);
        type = 'pdf';
        blobUrls.current.set(fileUrl, content);
      } else if (contentType.includes('video')) {
        content = URL.createObjectURL(await response.data);
        type = 'video';
        blobUrls.current.set(fileUrl, content);
      } else if (contentType.includes('audio')) {
        content = URL.createObjectURL(await response.data);
        type = 'audio';
        blobUrls.current.set(fileUrl, content);
      } else {
        content = URL.createObjectURL(await response.data);
        type = 'download';
        blobUrls.current.set(fileUrl, content);
      }

      setFileContent(content);
      setCachedFileContent(prev => ({
        ...prev,
        [fileUrl]: { content, type },
      }));
      setFileType(type);
      setShowFileModal(true);
    } catch (error) {
      const errorDetails = {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: requestUrl,
      };
      console.error('handleOpenFile: Failed to fetch file', errorDetails);
      const errorMessage = error.response?.status === 404
        ? 'File not found on server'
        : `Failed to load file: ${error.message}`;
      setFileError(errorMessage);
      setCachedFileContent(prev => ({
        ...prev,
        [fileUrl]: { error: errorMessage },
      }));
      toast.error(errorMessage);
      setShowFileModal(true);
    }
  };

  const handleSubmit = async (subsectionId = null) => {
    if (submitting) return;

    const targetSubsectionId = subsectionId || currentSubsection;
    const targetSurveys = filteredSurveys.length > 0 ? filteredSurveys : surveys;

    try {
      setSubmitting(true);
      const userId = localStorage.getItem('userId');
      if (!userId) {
        toast.error('Please log in again.');
        throw new Error('User not authenticated');
      }

      const responseArray = targetSurveys
        .filter(survey => survey.questionType !== 'file-upload')
        .map(survey => ({
          surveyId: survey._id,
          answer: responses[survey._id]?.answer || '',
        }));

      console.log('Submitting:', { subsectionId: targetSubsectionId, responses: responseArray });
      await submitResponses(targetSubsectionId, { responses: responseArray });
      toast.success('Subsection submitted successfully!');
      setCompletedSubsections(prev => new Set(prev).add(targetSubsectionId));
      setResponses({});
      setTimers(prev => ({ ...prev, [targetSubsectionId]: 0 }));
      setSubmitting(false);
      navigate(`/thank-you/${targetSubsectionId}`);
    } catch (err) {
      console.error('Submission error:', err);
      toast.error('Failed to submit. Please try again.');
      setSubmitting(false);
    }
  };

  const handleAutoSubmit = subsectionId => {
    if (isFileUploadSubsection(subsectionId)) return;
    if (Object.keys(responses).length > 0) {
      handleSubmit(subsectionId);
    } else {
      toast.info('No responses to submit.');
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < filteredSurveys.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const formatTime = seconds => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return (
      <motion.div {...fadeIn} className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-950">
        <LoadingSpinner />
      </motion.div>
    );
  }

  return (
    <motion.div {...pageTransition} className="container mx-auto p-4 sm:p-6 max-w-4xl">
      {/* Sections Display */}
      {!subsectionId && (
        <motion.div
          className="mb-8 flex flex-wrap gap-4"
          variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
          initial="hidden"
          animate="visible"
        >
          {sections.length > 0 ? (
            sections.map(section => (
              <motion.div
                key={section._id}
                variants={sectionVariants}
                whileHover="hover"
                className={`p-4 rounded-lg cursor-pointer text-center flex-1 min-w-[150px] max-w-[200px] ${
                  selectedSection === section._id
                    ? 'bg-purple-600 dark:bg-purple-700 text-white'
                    : 'bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-white'
                }`}
                onClick={() => handleSectionClick(section._id)}
              >
                <motion.h3 variants={sectionChildVariants} className="text-lg font-semibold">
                  {section.name}
                </motion.h3>
              </motion.div>
            ))
          ) : (
            <motion.p variants={sectionVariants} className="text-gray-600 dark:text-gray-400 text-center w-full">
              No sections available.
            </motion.p>
          )}
        </motion.div>
      )}

      {/* Subsections Display */}
      {!subsectionId && selectedSection && (
        <AnimatePresence>
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
            className="mb-8 flex flex-wrap gap-4"
          >
            {filteredSubsections.length ? (
              filteredSubsections.map((subsection, index) => {
                const isFileUpload = isFileUploadSubsection(subsection._id);
                const fileUrl = isFileUpload ? getAdminFileUrl(subsection._id) : null;
                return (
                  <motion.div
                    key={subsection._id}
                    variants={subsectionVariants}
                    whileHover={isSubsectionLocked(subsection._id, index) ? {} : 'hover'}
                    className={`p-4 rounded-lg text-center flex-1 min-w-[150px] max-w-[200px] flex items-center justify-center relative ${
                      isSubsectionLocked(subsection._id, index)
                        ? 'bg-gray-400 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                        : currentSubsection === subsection._id
                        ? 'bg-cyan-600 dark:bg-cyan-700 text-white'
                        : 'bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-white cursor-pointer'
                    }`}
                    onClick={() => !isSubsectionLocked(subsection._id, index) && handleSubsectionClick(subsection._id)}
                  >
                    <motion.div variants={subsectionChildVariants} className="flex items-center justify-center w-full">
                      <motion.h4 className="text-md font-medium">{subsection.name}</motion.h4>
                      {isFileUpload && fileUrl && (
                        <motion.span
                          variants={subsectionChildVariants}
                          className="ml-2 text-cyan-600 dark:text-cyan-500"
                          title="File Available"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </motion.span>
                      )}
                    </motion.div>
                    {isSubsectionLocked(subsection._id, index) && (
                      <motion.p variants={subsectionChildVariants} className="text-xs mt-1 absolute bottom-2">
                        Locked
                      </motion.p>
                    )}
                  </motion.div>
                );
              })
            ) : (
              <motion.p variants={subsectionVariants} className="text-gray-600 dark:text-gray-400 text-center w-full">
                No subsections available.
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Admin-Uploaded File and Questions */}
      {currentSubsection && (
        <motion.div {...fadeIn} className="space-y-6">
          {/* File-Upload Subsection */}
          {isFileUploadSubsection(currentSubsection) && (() => {
            const fileUrl = getAdminFileUrl(currentSubsection);
            const question = getAdminFileQuestion(currentSubsection);
            console.log('Admin File:', { currentSubsection, fileUrl, question, isFileUpload: true });
            return fileUrl ? (
              <motion.div
                variants={adminFileVariants}
                initial="hidden"
                animate="visible"
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md"
              >
                <motion.h4
                  variants={adminFileChildVariants}
                  className="text-lg font-semibold text-gray-900 dark:text-white mb-2"
                >
                  {question}
                </motion.h4>
                <motion.div variants={adminFileChildVariants} className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenFile(fileUrl)}
                    className="px-3 py-1 bg-purple-600 dark:bg-purple-700 text-white rounded text-sm"
                  >
                    View File
                  </button>
                </motion.div>
              </motion.div>
            ) : (
              <motion.p
                variants={adminFileVariants}
                initial="hidden"
                animate="visible"
                className="text-sm text-gray-600 dark:text-gray-400"
              >
                No file available for this subsection.
              </motion.p>
            );
          })()}

          {/* Non-File-Upload Subsection */}
          {!isFileUploadSubsection(currentSubsection) && (
            <>
              <motion.div className="text-center">
                <motion.h2
                  variants={questionChildVariants}
                  className="text-2xl font-bold text-purple-600 dark:text-purple-400"
                >
                  Time Left: {formatTime(subsectionId ? timeLeft : timers[currentSubsection] || 30 * 60)}
                </motion.h2>
              </motion.div>

              {filteredSurveys.length > 0 ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={filteredSurveys[currentQuestionIndex]._id}
                    variants={questionVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
                  >
                    {filteredSurveys[currentQuestionIndex].questionType !== 'file-upload' ? (
                      <>
                        <motion.h4
                          variants={questionChildVariants}
                          className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2"
                        >
                          {filteredSurveys[currentQuestionIndex].question || 'No question'}
                        </motion.h4>
                        <motion.p
                          variants={questionChildVariants}
                          className="text-sm text-gray-600 dark:text-gray-400 mb-4"
                        >
                          Category: {filteredSurveys[currentQuestionIndex].categoryId?.name || 'Uncategorized'} | Type:{' '}
                          {(filteredSurveys[currentQuestionIndex].questionType || 'unknown').replace('-', ' ').toUpperCase()}{' '}
                          | Max Score: {filteredSurveys[currentQuestionIndex].maxScore || 'N/A'}
                        </motion.p>
                        {filteredSurveys[currentQuestionIndex].questionType === 'multiple-choice' && (
                          <motion.div variants={questionChildVariants} className="space-y-2">
                            {(filteredSurveys[currentQuestionIndex].options || []).map((option, optIndex) => (
                              <label
                                key={optIndex}
                                className="flex items-center space-x-2 text-sm sm:text-base text-gray-700 dark:text-gray-300"
                              >
                                <input
                                  type="radio"
                                  name={filteredSurveys[currentQuestionIndex]._id}
                                  value={option}
                                  checked={responses[filteredSurveys[currentQuestionIndex]._id]?.answer === option}
                                  onChange={() => handleResponseChange(filteredSurveys[currentQuestionIndex]._id, option)}
                                  className="h-4 w-4 text-cyan-600 dark:text-cyan-500 focus:ring-cyan-600"
                                />
                                <span>{option || 'N/A'}</span>
                              </label>
                            ))}
                          </motion.div>
                        )}
                        {filteredSurveys[currentQuestionIndex].questionType === 'descriptive' && (
                          <motion.textarea
                            variants={questionChildVariants}
                            value={responses[filteredSurveys[currentQuestionIndex]._id]?.answer || ''}
                            onChange={e => handleResponseChange(filteredSurveys[currentQuestionIndex]._id, e.target.value)}
                            className="w-full p-3 border rounded dark:bg-gray-700 dark:text-white text-sm sm:text-base focus:ring-2 focus:ring-cyan-600"
                            rows="4"
                            placeholder="Enter your answer"
                          />
                        )}
                      </>
                    ) : (
                      <motion.p
                        variants={questionChildVariants}
                        className="text-sm text-gray-600 dark:text-gray-400"
                      >
                        Please view the admin-uploaded file above.
                      </motion.p>
                    )}
                  </motion.div>
                </AnimatePresence>
              ) : (
                <motion.p
                  variants={questionVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-gray-600 dark:text-gray-400 text-center"
                >
                  No questions available for this subsection.
                </motion.p>
              )}

              {filteredSurveys.length > 0 && (
                <motion.div variants={questionChildVariants} className="flex justify-between">
                  <button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className={`p-3 rounded-lg text-sm sm:text-base ${
                      currentQuestionIndex === 0
                        ? 'bg-gray-400 dark:bg-gray-600 text-gray-600 cursor-not-allowed'
                        : 'bg-purple-600 dark:bg-purple-700 text-white'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIndex === filteredSurveys.length - 1}
                    className={`p-3 rounded-lg text-sm sm:text-base ${
                      currentQuestionIndex === filteredSurveys.length - 1
                        ? 'bg-gray-400 dark:bg-gray-600 text-gray-600 cursor-not-allowed'
                        : 'bg-purple-600 dark:bg-purple-700 text-white'
                    }`}
                  >
                    Next
                  </button>
                </motion.div>
              )}

              {filteredSurveys.some(survey => survey.questionType !== 'file-upload') && (
                <button
                  onClick={() => handleSubmit(currentSubsection)}
                  disabled={submitting}
                  className={`w-full p-3 rounded-lg text-sm sm:text-base ${
                    submitting
                      ? 'bg-gray-400 dark:bg-gray-600 text-gray-600 cursor-not-allowed'
                      : 'bg-purple-600 dark:bg-purple-700 text-white'
                  }`}
                >
                  {submitting ? 'Submitting...' : 'Submit Responses'}
                </button>
              )}
            </>
          )}
        </motion.div>
      )}

      {/* Subsection Popup */}
      <AnimatePresence>
        {showSubsectionPopup && (
          <motion.div
            {...popupAnimation}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          >
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center max-w-sm w-full">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Open this subsection?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {isFileUploadSubsection(pendingSubsection)
                  ? 'View admin-uploaded files.'
                  : 'Answer test questions.'}
              </p>
              <div className="mt-4 flex justify-center gap-4">
                <button
                  onClick={handleSubsectionConfirm}
                  className="px-4 py-2 bg-cyan-600 dark:bg-cyan-700 text-white rounded"
                >
                  Yes
                </button>
                <button
                  onClick={() => {
                    setShowSubsectionPopup(false);
                    setPendingSubsection(null);
                  }}
                  className="px-4 py-2 bg-gray-400 dark:bg-gray-600 text-white rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Modal */}
      <AnimatePresence>
        {showFileModal && (
          <motion.div
            {...popupAnimation}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          >
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-5xl w-full max-h-[90vh] overflow-auto">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Admin-Uploaded File</h3>
              {fileError ? (
                <p className="text-red-600 dark:text-red-400">{fileError}</p>
              ) : fileContent ? (
                <>
                  {fileType === 'text' && (
                    <pre className="text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-900 p-4 rounded whitespace-pre-wrap">
                      {fileContent}
                    </pre>
                  )}
                  {fileType === 'image' && (
                    <img
                      src={fileContent}
                      alt="Admin uploaded file"
                      className="w-full max-h-[90vh] object-contain rounded"
                    />
                  )}
                  {fileType === 'pdf' && (
                    <div className="flex flex-col space-y-2">
                      <iframe
                        src={fileContent}
                        className="w-full h-[90vh] rounded"
                        title="Admin uploaded PDF"
                      />
                      <a
                        href={fileContent}
                        download
                        className="text-cyan-600 dark:text-cyan-500 hover:underline text-sm"
                      >
                        Download PDF
                      </a>
                    </div>
                  )}
                  {fileType === 'video' && (
                    <video
                      src={fileContent}
                      controls
                      className="w-full max-h-[90vh] rounded"
                    />
                  )}
                  {fileType === 'audio' && (
                    <audio
                      src={fileContent}
                      controls
                      className="w-full"
                    />
                  )}
                  {fileType === 'download' && (
                    <div className="flex flex-col space-y-2">
                      <p className="text-gray-600 dark:text-gray-400">
                        This file type is not viewable in the browser.
                      </p>
                      <a
                        href={fileContent}
                        download={fileUrl}
                        className="text-cyan-600 dark:text-cyan-500 hover:underline text-sm"
                      >
                        Download File
                      </a>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">Loading file...</p>
              )}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setShowFileModal(false);
                    setFileContent(null);
                    setFileType('');
                    setFileError(null);
                  }}
                  className="px-4 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Warning Popup */}
      <AnimatePresence>
        {showWarning[currentSubsection] && !isFileUploadSubsection(currentSubsection) && (
          <motion.div
            {...popupAnimation}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          >
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center max-w-sm w-full">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Time Running Out!</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Less than 1 minute left. Responses will auto-submit.
              </p>
              <button
                onClick={() => setShowWarning(prev => ({ ...prev, [currentSubsection]: false }))}
                className="mt-4 px-4 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded"
              >
                OK
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default SurveyForm;
