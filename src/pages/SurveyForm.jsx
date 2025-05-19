import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { flushSync } from 'react-dom';
import { toast } from 'react-toastify';
import { getSurveys, getSurveysBySubsection, getSections, getSubsections, submitResponses, getFileContent, getResponsesBySubsection } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { LockClosedIcon, LockOpenIcon, CheckCircleIcon, DocumentIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';

// Animation definitions
const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: 'easeOut' },
};

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.3 },
};

const popupAnimation = {
  initial: { opacity: 0, scale: 0.8, rotateX: 20 },
  animate: { opacity: 1, scale: 1, rotateX: 0 },
  exit: { opacity: 0, scale: 0.8, rotateX: 20 },
  transition: { duration: 0.3, type: 'spring', stiffness: 200 },
};

const sectionVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, type: 'spring', stiffness: 180 },
  },
  hover: {
    scale: 1.03,
    shadow: '0 10px 20px rgba(0, 0, 0, 0.15)',
    transition: { duration: 0.2 },
  },
};

const subsectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, type: 'spring', stiffness: 170 },
  },
  hover: {
    scale: 1.03,
    shadow: '0 10px 20px rgba(0, 0, 0, 0.15)',
    transition: { duration: 0.2 },
  },
};

const questionVariants = {
  hidden: { opacity: 0, x: 100, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut', staggerChildren: 0.2 },
  },
  exit: { opacity: 0, x: -100, scale: 0.95, transition: { duration: 0.3 } },
};

const questionChildVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};

const adminFileVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, type: 'spring', stiffness: 160 },
  },
};

function SurveyForm() {
  const { subsectionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { percentage, nextSubsectionId, sectionId: navigatedSectionId } = location.state || {};
  const [surveys, setSurveys] = useState([]);
  const [sections, setSections] = useState([]);
  const [subsections, setSubsections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(() => navigatedSectionId || localStorage.getItem('selectedSection') || '');
  const [currentSubsection, setCurrentSubsection] = useState(() => localStorage.getItem('currentSubsection') || '');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => {
    const savedIndex = localStorage.getItem('currentQuestionIndex');
    return savedIndex ? parseInt(savedIndex, 10) : 0;
  });
  const [responses, setResponses] = useState(() => {
    const savedResponses = localStorage.getItem('responses');
    return savedResponses ? JSON.parse(savedResponses) : {};
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);


  const [timers, setTimers] = useState(() => {
    const savedTimers = localStorage.getItem('timers');
    return savedTimers ? JSON.parse(savedTimers) : {};
  });
  const [timeLeft, setTimeLeft] = useState(() => {
    const savedTimeLeft = localStorage.getItem('timeLeft');
    return savedTimeLeft ? parseInt(savedTimeLeft, 10) : 30 * 60;
  });

  
  const [showWarning, setShowWarning] = useState({});
  const [showFileModal, setShowFileModal] = useState(false);
  const [fileContent, setFileContent] = useState(null);
  const [fileType, setFileType] = useState('');
  const [fileError, setFileError] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false); // New state for button loader
  const [completedSubsections, setCompletedSubsections] = useState(() => {
    const savedCompleted = localStorage.getItem('completedSubsections');
    return savedCompleted ? new Set(JSON.parse(savedCompleted)) : new Set();
  });
  const [cachedFileContent, setCachedFileContent] = useState({});
  const [showScorePopup, setShowScorePopup] = useState(false);
  const [showSubmitConfirmPopup, setShowSubmitConfirmPopup] = useState(false);
  const [showBackConfirmPopup, setShowBackConfirmPopup] = useState(false);
  const [showMandatoryPopup, setShowMandatoryPopup] = useState(false);
  const [subsectionScores, setSubsectionScores] = useState(() => {
    const savedScores = localStorage.getItem('subsectionScores');
    return savedScores ? JSON.parse(savedScores) : {};
  });
  const hasFetched = useRef(false);
  const isMounted = useRef(true);
  const blobUrls = useRef(new Map());

  // Persist states to localStorage
  useEffect(() => {
    localStorage.setItem('selectedSection', selectedSection);
    localStorage.setItem('currentSubsection', currentSubsection);
    localStorage.setItem('currentQuestionIndex', currentQuestionIndex.toString());
    localStorage.setItem('responses', JSON.stringify(responses));
    localStorage.setItem('timers', JSON.stringify(timers));
    localStorage.setItem('timeLeft', timeLeft.toString());
    localStorage.setItem('completedSubsections', JSON.stringify([...completedSubsections]));
    localStorage.setItem('subsectionScores', JSON.stringify(subsectionScores));
  }, [selectedSection, currentSubsection, currentQuestionIndex, responses, timers, timeLeft, completedSubsections, subsectionScores]);

  // Check if subsection has been attempted and fetch score
  const checkIfAttempted = async (subsectionId) => {
    try {
      const responseData = await getResponsesBySubsection(subsectionId);
      let validResponses = [];
      if (Array.isArray(responseData)) {
        validResponses = responseData;
      } else if (responseData && typeof responseData === 'object') {
        validResponses = responseData.responseDetails && Array.isArray(responseData.responseDetails)
          ? responseData.responseDetails
          : [responseData];
      }
      validResponses = validResponses.filter(res => res && res.survey && res.answer !== undefined && res.answer !== '');
      if (validResponses.length > 0) {
        const nonDescriptive = validResponses.filter(res => res.survey?.questionType === 'multiple-choice');
        const gained = nonDescriptive.reduce((sum, res) => sum + (res.answer === res.survey?.correctOption ? 1 : 0), 0);
        const total = nonDescriptive.length;
        const percent = total > 0 ? (gained / total) * 100 : 0;
        return { attempted: true, score: percent };
      }
      return { attempted: false, score: 0 };
    } catch (err) {
      console.error(`Error checking responses for ${subsectionId}:`, err);
      return { attempted: false, score: 0 };
    }
  };

  // Fetch initial data
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
          setSurveys(normalizedSurveys);
          setSections(Array.isArray(sectionData) ? sectionData : []);
          setSubsections(normalizedSubsections);

          const scorePromises = normalizedSubsections.map(async (sub) => {
            const { score } = await checkIfAttempted(sub._id);
            setSubsectionScores(prev => ({
              ...prev,
              [sub._id]: score
            }));
          });
          await Promise.all(scorePromises);

          if (!subsectionId && !nextSubsectionId) {
            setCurrentSubsection('');
            setCurrentQuestionIndex(0);
            setResponses({});
            setTimers({});
            setShowWarning({});
          }

          if (subsectionId) {
            const { attempted } = await checkIfAttempted(subsectionId);
            if (attempted && !isFileUploadSubsection(subsectionId)) {
              toast.info('You have already responded to this test.');
              setShowScorePopup(true);
            } else {
              const subsection = normalizedSubsections.find(sub => sub._id === subsectionId);
              if (subsection && subsection.sectionId?._id) {
                setSelectedSection(subsection.sectionId._id);
              }
              setCurrentSubsection(subsectionId);
              if (isFileUploadSubsection(subsectionId)) {
                const fileUrl = getAdminFileUrl(subsectionId);
                if (fileUrl) {
                  setShowFileModal(false);
                }
              }
            }
          } else if (nextSubsectionId) {
            const { attempted } = await checkIfAttempted(nextSubsectionId);
            if (attempted && !isFileUploadSubsection(nextSubsectionId)) {
              toast.info('You have already responded to this test.');
              setCurrentSubsection(nextSubsectionId);
              setShowScorePopup(true);
            } else {
              setCurrentSubsection(nextSubsectionId);
              setCurrentQuestionIndex(0);
              setResponses({});
              if (!isFileUploadSubsection(nextSubsectionId) && !isDescriptiveSubsection(nextSubsectionId)) {
                setTimers(prev => ({ ...prev, [nextSubsectionId]: 1 * 60 }));
                setShowWarning(prev => ({ ...prev, [nextSubsectionId]: false }));
              }
            }
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
  }, [subsectionId, nextSubsectionId]);

  // Refresh scores when selectedSection changes
  useEffect(() => {
    const refreshScores = async () => {
      const filteredSubsections = Array.isArray(subsections)
        ? subsections.filter(sub => sub.sectionId?._id === selectedSection)
        : [];
      const scorePromises = filteredSubsections.map(async (sub) => {
        const { score } = await checkIfAttempted(sub._id);
        setSubsectionScores(prev => ({
          ...prev,
          [sub._id]: score
        }));
      });
      await Promise.all(scorePromises);
    };
    if (selectedSection && subsections.length > 0) {
      refreshScores();
    }
  }, [selectedSection, subsections]);

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
          setFileLoading(true);
          const response = await getFileContent(fileUrl);
          const contentType = response.headers?.['content-type'] || 'application/octet-stream';
          let content, type;

          if (contentType.includes('text')) {
            content = await response.data.text();
            type = 'text';
          } else if (contentType.includes('image')) {
            const blob = await response.data;
            content = URL.createObjectURL(blob);
            type = 'image';
            blobUrls.current.set(fileUrl, content);
          } else if (contentType.includes('pdf')) {
            const blob = await response.data;
            content = URL.createObjectURL(blob);
            type = 'pdf';
            blobUrls.current.set(fileUrl, content);
          } else if (contentType.includes('video')) {
            const blob = await response.data;
            content = URL.createObjectURL(blob);
            type = 'video';
            blobUrls.current.set(fileUrl, content);
          } else if (contentType.includes('audio')) {
            const blob = await response.data;
            content = URL.createObjectURL(blob);
            type = 'audio';
            blobUrls.current.set(fileUrl, content);
          } else {
            const blob = await response.data;
            content = URL.createObjectURL(blob);
            type = 'download';
            blobUrls.current.set(fileUrl, content);
          }

          if (isMounted.current) {
            setCachedFileContent(prev => ({ ...prev, [fileUrl]: { content, type } }));
            setFileType(type);
            setFileContent(content);
            setFileError(null);
          }
        } catch (error) {
          if (attempt <= retries) {
            await new Promise(resolve => setTimeout(resolve, delay));
            return attemptFetch(attempt + 1);
          }
          if (isMounted.current) {
            setCachedFileContent(prev => ({
              ...prev,
              [fileUrl]: { error: `Failed to pre-fetch file: ${error.message}` },
            }));
            setFileError(`Failed to pre-fetch file: ${error.message}`);
          }
        } finally {
          if (isMounted.current) {
            setFileLoading(false);
          }
        }
      };
      attemptFetch(1);
    };
    fetchFileContent();
  }, [currentSubsection]);

  // Timer for multiple-choice subsections
  useEffect(() => {
    if (!currentSubsection || isFileUploadSubsection(currentSubsection) || isDescriptiveSubsection(currentSubsection)) return;

    const timerId = setInterval(() => {
      if (subsectionId) {
        setTimeLeft(prev => {
          if (prev <= 0) {
            handleSubmit(currentSubsection);
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
            handleSubmit(currentSubsection);
            return { ...prev, [currentSubsection]: 0 };
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

  // Subsection type checks
  const isFileUploadSubsection = subsectionId => {
    return surveys.some(survey => survey.subsectionId?._id === subsectionId && survey.questionType === 'file-upload');
  };

  const isDescriptiveSubsection = subsectionId => {
    return surveys.some(survey => survey.subsectionId?._id === subsectionId && survey.questionType === 'descriptive');
  };

  const isMultipleChoiceSubsection = subsectionId => {
    return surveys.some(survey => survey.subsectionId?._id === subsectionId && survey.questionType === 'multiple-choice');
  };

  const isOptionalSubsection = subsectionId => {
    return surveys.some(survey => survey.subsectionId?._id === subsectionId && survey.questionType === 'optional');
  };

  const getAdminFileUrl = subsectionId => {
    const surveyWithFile = surveys.find(
      survey => survey.subsectionId?._id === subsectionId && survey.questionType === 'file-upload' && survey.fileUrl
    );
    return surveyWithFile?.fileUrl
      ? surveyWithFile.fileUrl.replace(/^Uploads[\\\/]+/, '').replace(/^[\\\/]+/, '').replace(/[\\\/]+$/, '').split(/[\\\/]/).pop()
      : null;
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

  // Subsection locking logic
  const isSubsectionLocked = (subsectionId, index) => {
    if (
      isDescriptiveSubsection(subsectionId) ||
      isFileUploadSubsection(subsectionId) ||
      isOptionalSubsection(subsectionId)
    ) {
      return false;
    }

    if (index === 0) {
      return false;
    }

    const prevSubsectionId = filteredSubsections[index - 1]?._id;
    const prevScore = subsectionScores[prevSubsectionId] || 0;
    return prevScore < 70;
  };

  // Handle section click with synchronous state update
  const handleSectionClick = useCallback((sectionId, event) => {
    event.stopPropagation();
    flushSync(() => {
      setSelectedSection(sectionId);
      setCurrentSubsection('');
      localStorage.setItem('selectedSection', sectionId);
      localStorage.setItem('currentSubsection', '');
    });
    navigate(`/subsections/${sectionId}`, { replace: true });
  }, [navigate, selectedSection]);

  // Handle subsection click
  const handleSubsectionClick = async (subsectionId, index) => {
    if (isSubsectionLocked(subsectionId, index)) {
      toast.info('Please achieve 70% or higher in the previous subsection to unlock this.');
      return;
    }
    const { attempted } = await checkIfAttempted(subsectionId);
    if (attempted && !isFileUploadSubsection(subsectionId)) {
      toast.info('You have already responded to this test.');
      setCurrentSubsection(subsectionId);
      setShowScorePopup(true);
    } else {
      setCurrentSubsection(subsectionId);
      setCurrentQuestionIndex(0);
      setResponses({});
      setShowScorePopup(false);
      if (!isFileUploadSubsection(subsectionId) && !isDescriptiveSubsection(subsectionId)) {
        setTimers(prev => ({ ...prev, [subsectionId]: 30 * 60 }));
        setShowWarning(prev => ({ ...prev, [subsectionId]: false }));
      }
    }
  };

  const handleResponseChange = (surveyId, value) => {
    setResponses(prev => ({ ...prev, [surveyId]: { answer: value || '' } }));
  };

  // Handle file opening
  const handleOpenFile = async (fileUrl) => {
    if (!fileUrl || typeof fileUrl !== 'string') {
      toast.error('Invalid file URL');
      setFileError('Invalid file URL');
      setShowFileModal(true);
      return;
    }

    // Check cache first for instant open
    if (cachedFileContent[fileUrl] && !cachedFileContent[fileUrl].error) {
      setFileContent(cachedFileContent[fileUrl].content);
      setFileType(cachedFileContent[fileUrl].type);
      setFileError(null);
      setShowFileModal(true); // Open modal instantly
      return;
    }

    const normalizedFileUrl = fileUrl.replace(/^Uploads[\\\/]+/, '').replace(/^[\\\/]+/, '').replace(/[\\\/]+$/, '').split(/[\\\/]/).pop();
    try {
      setIsButtonLoading(true); // Show loader on button
      setFileLoading(true); // Show loader in modal
      setFileError(null);
      setFileContent(null);
      setFileType('');
      setShowFileModal(true); // Open modal immediately

      const response = await getFileContent(normalizedFileUrl);
      const contentType = response.headers?.['content-type'] || 'application/octet-stream';
      let content, type;

      if (contentType.includes('text')) {
        content = await response.data.text();
        type = 'text';
      } else if (contentType.includes('image')) {
        const blob = await response.data;
        content = URL.createObjectURL(blob);
        type = 'image';
        blobUrls.current.set(fileUrl, content);
      } else if (contentType.includes('pdf')) {
        const blob = await response.data;
        content = URL.createObjectURL(blob);
        type = 'pdf';
        blobUrls.current.set(fileUrl, content);
      } else if (contentType.includes('video')) {
        const blob = await response.data;
        content = URL.createObjectURL(blob);
        type = 'video';
        blobUrls.current.set(fileUrl, content);
      } else if (contentType.includes('audio')) {
        const blob = await response.data;
        content = URL.createObjectURL(blob);
        type = 'audio';
        blobUrls.current.set(fileUrl, content);
      } else {
        const blob = await response.data;
        content = URL.createObjectURL(blob);
        type = 'download';
        blobUrls.current.set(fileUrl, content);
      }

      if (isMounted.current) {
        setFileContent(content);
        setCachedFileContent(prev => ({ ...prev, [fileUrl]: { content, type } }));
        setFileType(type);
        setFileError(null);
      }
    } catch (error) {
      const errorMessage = error.response?.status === 404 ? 'File not found on server' : `Failed to load file: ${error.message}`;
      if (isMounted.current) {
        setFileError(errorMessage);
        setCachedFileContent(prev => ({ ...prev, [fileUrl]: { error: errorMessage } }));
        toast.error(errorMessage);
      }
    } finally {
      if (isMounted.current) {
        setFileLoading(false);
        setIsButtonLoading(false);
      }
    }
  };

  // Handle submission
  const handleSubmit = async (subsectionId = null) => {
    if (submitting) return;

    const targetSubsectionId = subsectionId || currentSubsection;
    const targetSurveys = filteredSurveys.length > 0 ? filteredSurveys : surveys;

    const unansweredQuestions = targetSurveys
      .filter(survey => survey.questionType !== 'file-upload')
      .filter(survey => !responses[survey._id]?.answer?.trim());

    if (unansweredQuestions.length > 0) {
      setShowMandatoryPopup(true);
      return;
    }

    setShowSubmitConfirmPopup(true);
  };

  const handleConfirmSubmit = async () => {
    setShowSubmitConfirmPopup(false);

    const targetSubsectionId = currentSubsection;
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

      const totalMarks = targetSurveys
        .filter(survey => survey.questionType === 'multiple-choice')
        .length;

      await submitResponses(targetSubsectionId, { responses: responseArray });
      toast.success('Subsection submitted successfully!');

      setCompletedSubsections(prev => {
        const newSet = new Set(prev);
        newSet.add(targetSubsectionId);
        localStorage.setItem('completedSubsections', JSON.stringify([...newSet]));
        return newSet;
      });

      const { score } = await checkIfAttempted(targetSubsectionId);
      setSubsectionScores(prev => {
        const newScores = { ...prev, [targetSubsectionId]: score };
        localStorage.setItem('subsectionScores', JSON.stringify(newScores));
        return newScores;
      });

      setResponses({});
      setTimers(prev => ({ ...prev, [targetSubsectionId]: 0 }));
      setCurrentQuestionIndex(0);
      setSubmitting(false);
      setShowScorePopup(true);
    } catch (err) {
      console.error('Submission error:', err);
      toast.error('Failed to submit. Please try again.');
      setSubmitting(false);
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

  // Handle back to subsections
  const handleBackToSubsections = () => {
    if (isFileUploadSubsection(currentSubsection) || isOptionalSubsection(currentSubsection)) {
      setCurrentSubsection('');
      setCurrentQuestionIndex(0);
      setResponses({});
      setTimers(prev => ({ ...prev, [currentSubsection]: 30 * 60 }));
      navigate(`/subsections/${selectedSection}`);
    } else {
      setShowBackConfirmPopup(true);
    }
  };

  const handleConfirmBack = () => {
    setShowBackConfirmPopup(false);
    setCurrentSubsection('');
    setCurrentQuestionIndex(0);
    setResponses({});
    setTimers(prev => ({ ...prev, [currentSubsection]: 1 * 60 }));
    navigate(`/subsections/${selectedSection}`);
  };

  // Prevent accidental navigation
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (currentSubsection && (isMultipleChoiceSubsection(currentSubsection) || isDescriptiveSubsection(currentSubsection)) && Object.keys(responses).length > 0) {
        event.preventDefault();
        event.returnValue = 'Are you sure you want to leave? Your progress will not be saved.';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentSubsection, responses]);

  const formatTime = seconds => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return (
      <motion.div {...fadeIn} className="flex justify-center items-center h-screen bg-blue-50/80 dark:bg-gray-900">
        <LoadingSpinner />
      </motion.div>
    );
  }

  return (
    <motion.div
      {...pageTransition}
      className="container mx-auto p-8 max-w-7xl bg-blue-50/80 dark:bg-gray-900 min-h-fit font-sans relative overflow-hidden rounded-[3rem]"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-300 to-pink-300 dark:from-blue-800 dark:to-purple-800 opacity-20 animate-gradient-bg" />

      {/* Sections View */}
      {!subsectionId && !currentSubsection && !selectedSection && (
        <div className="mb-16 flex flex-col items-center relative z-10">
          <h2 className="text-5xl font-extrabold text-gray-800 dark:text-gray-100 mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-500">
            Select a Section
          </h2>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 w-full h-auto py-10"
            variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
            initial="hidden"
            animate="visible"
          >
            {sections.length > 0 ? (
              sections.map(section => (
                <motion.div
                  key={section._id}
                  variants={sectionVariants}
                  whileHover="hover"
                  className={`p-8 rounded-[2.5rem] shadow-xl cursor-pointer transition-all duration-300 bg-white dark:bg-gray-800 bg-opacity-60 backdrop-blur-xl border-2 pointer-events-auto ${
                    selectedSection === section._id
                      ? 'border-transparent bg-gradient-to-br from-blue-400 to-pink-500 text-white'
                      : 'border-blue-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50/80 dark:hover:bg-gray-700/80 hover:shadow-lg'
                  }`}
                  style={{
                    borderImage: selectedSection === section._id ? 'none' : 'linear-gradient(to right, #60a5fa, #f472b6) 1',
                  }}
                  onClick={(e) => handleSectionClick(section._id, e)}
                >
                  <h3 className="text-2xl font-extrabold text-center">{section.name || 'Untitled Section'}</h3>
                  <p className="text-sm text-center mt-4 opacity-80">Explore available subsections</p>
                </motion.div>
              ))
            ) : (
              <motion.p variants={sectionVariants} className="text-gray-600 dark:text-gray-400 text-center col-span-full">
                No sections available.
              </motion.p>
            )}
          </motion.div>
        </div>
      )}

      {/* Subsections View */}
      {!subsectionId && selectedSection && !currentSubsection && (
        <AnimatePresence>
          <div className="mb-16 flex flex-col items-center relative z-10">
            <button
              onClick={() => {
                setSelectedSection('');
                setCurrentSubsection('');
                localStorage.setItem('selectedSection', '');
                localStorage.setItem('currentSubsection', '');
                navigate('/employee/survey', { replace: true });
              }}
              className="absolute top-4 left-4 p-3 bg-blue-400 dark:bg-blue-500 text-white rounded-full hover:bg-blue-500 dark:hover:bg-blue-600 hover:scale-110 hover:shadow-lg transition-all ring-2 ring-blue-200 dark:ring-blue-700 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-600 ring-offset-2 pointer-events-auto"
              aria-label="Back to Sections"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <h2 className="text-5xl font-extrabold text-gray-800 dark:text-gray-100 mt-16 mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-500">
              Levels
            </h2>
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 w-full h-auto py-10"
            >
              {filteredSubsections.length ? (
                filteredSubsections.map((subsection, index) => {
                  const isLocked = isSubsectionLocked(subsection._id, index);
                  const isCompleted = completedSubsections.has(subsection._id);
                  const isFileUpload = isFileUploadSubsection(subsection._id);
                  const isDescriptive = isDescriptiveSubsection(subsection._id);
                  const isOptional = isOptionalSubsection(subsection._id);
                  const isMultipleChoice = isMultipleChoiceSubsection(subsection._id);
                  const fileUrl = isFileUpload ? getAdminFileUrl(subsection._id) : null;
                  const score = subsectionScores[subsection._id] || 0;

                  return (
                    <motion.div
                      key={subsection._id}
                      variants={subsectionVariants}
                      whileHover={isLocked ? {} : 'hover'}
                      className={`p-6 rounded-[2.5rem] shadow-xl flex flex-col items-center justify-between relative transition-all duration-300 bg-white dark:bg-gray-800 bg-opacity-60 backdrop-blur-xl border-2 pointer-events-auto ${
                        isLocked
                          ? 'border-rose-200 dark:border-rose-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                          : isCompleted
                          ? 'border-emerald-300 dark:border-emerald-600 bg-emerald-50/80 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                          : 'border-blue-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50/80 dark:hover:bg-gray-700/80 hover:shadow-lg'
                      }`}
                      style={{
                        borderImage: isLocked || isCompleted ? 'none' : 'linear-gradient(to right, #60a5fa, #f472b6) 1',
                      }}
                      onClick={() => !isLocked && handleSubsectionClick(subsection._id, index)}
                    >
                      <div className="flex items-center justify-center mb-4">
                        {isLocked ? (
                          <LockClosedIcon className="h-6 w-6 text-rose-400" />
                        ) : isCompleted ? (
                          <CheckCircleIcon className="h-6 w-6 text-emerald-500" />
                        ) : (
                          <LockOpenIcon className="h-6 w-6 text-emerald-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-extrabold text-center">{subsection.name || 'Untitled Subsection'}</h4>
                        {isMultipleChoice && isCompleted && (
                          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                            ({score.toFixed(2)}%)
                          </span>
                        )}
                      </div>
                      {(isFileUpload || isDescriptive || isOptional) && (
                        <span className="text-sm text-blue-400 dark:text-blue-300 mt-2 font-medium">
                          {isFileUpload ? 'File Upload' : isDescriptive ? 'Descriptive' : 'Optional'}
                        </span>
                      )}
                      {isFileUpload && fileUrl && (
                        <span className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mt-2">
                          <DocumentIcon className="h-5 w-5" />
                          File Available
                        </span>
                      )}
                    </motion.div>
                  );
                })
              ) : (
                <motion.p variants={subsectionVariants} className="text-gray-600 dark:text-gray-400 text-center col-span-full">
                  No subsections available.
                </motion.p>
              )}
            </motion.div>
          </div>
        </AnimatePresence>
      )}

      {/* Subsection Questions View */}
      {currentSubsection && (
        <motion.div
          {...fadeIn}
          className="space-y-8 bg-white dark:bg-gray-800 bg-opacity-60 backdrop-blur-xl p-10 rounded-[3rem] shadow-xl border-2 border-blue-200 dark:border-gray-700 relative z-10"
          style={{ borderImage: 'linear-gradient(to right, #60a5fa, #f472b6) 1' }}
        >
          {isFileUploadSubsection(currentSubsection) && (() => {
            const fileUrl = getAdminFileUrl(currentSubsection);
            const question = getAdminFileQuestion(currentSubsection);
            return fileUrl ? (
              <motion.div
                variants={adminFileVariants}
                initial="hidden"
                animate="visible"
                className="p-6 rounded-2xl bg-gray-50/80 dark:bg-gray-700/50 border border-blue-200 dark:border-gray-600"
              >
                <h4 className="text-xl font-extrabold text-blue-400 dark:text-blue-300 mb-4">{question}</h4>
                <button
                  onClick={() => handleOpenFile(fileUrl)}
                  disabled={isButtonLoading}
                  className={`px-6 py-2 bg-blue-400 dark:bg-blue-500 text-white rounded-lg font-medium transition-all ring-2 ring-blue-200 dark:ring-blue-700 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-600 ring-offset-2 pointer-events-auto flex items-center justify-center ${
                    isButtonLoading
                      ? 'bg-blue-300 dark:bg-blue-600 cursor-not-allowed animate-pulse'
                      : 'hover:bg-blue-500 dark:hover:bg-blue-600 hover:scale-110 hover:shadow-lg'
                  }`}
                  aria-label="View File"
                >
                  {isButtonLoading ? (
                    <>
                      <LoadingSpinner className="h-5 w-5 mr-2" />
                      Loading...
                    </>
                  ) : (
                    'View File'
                  )}
                </button>
              </motion.div>
            ) : (
              <motion.p
                variants={adminFileVariants}
                initial="hidden"
                animate="visible"
                className="text-gray-600 dark:text-gray-400"
              >
                No file available for this subsection.
              </motion.p>
            );
          })()}

          {!isFileUploadSubsection(currentSubsection) && (
            <>
              {filteredSurveys.length > 0 && !isDescriptiveSubsection(currentSubsection) && !isOptionalSubsection(currentSubsection) && (
                <motion.div className="text-center">
                  <h2 className="text-2xl font-extrabold text-blue-400 dark:text-blue-300">
                    Time Left: {formatTime(subsectionId ? timeLeft : timers[currentSubsection] || 30 * 60)}
                  </h2>
                </motion.div>
              )}

              {filteredSurveys.length > 0 ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={filteredSurveys[currentQuestionIndex]?._id || 'no-question'}
                    variants={questionVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="p-6 rounded-2xl bg-white dark:bg-gray-900 bg-opacity-60 backdrop-blur-xl border border-blue-200 dark:border-gray-700"
                  >
                    {filteredSurveys[currentQuestionIndex]?.questionType !== 'file-upload' ? (
                      <>
                        <motion.h4
                          variants={questionChildVariants}
                          className="text-xl font-extrabold text-blue-400 dark:text-blue-300 mb-4"
                        >
                          {filteredSurveys[currentQuestionIndex]?.question || 'No question'}
                        </motion.h4>
                        <motion.p
                          variants={questionChildVariants}
                          className="text-gray-600 dark:text-gray-400 mb-4"
                        >
                          Category: {filteredSurveys[currentQuestionIndex]?.categoryId?.name || 'Uncategorized'} | Type:{' '}
                          {(filteredSurveys[currentQuestionIndex]?.questionType || 'unknown').replace('-', ' ').toUpperCase()} | Max Score: {filteredSurveys[currentQuestionIndex]?.maxScore || 'N/A'}
                        </motion.p>
                        {filteredSurveys[currentQuestionIndex]?.questionType === 'multiple-choice' && (
                          <motion.div variants={questionChildVariants} className="space-y-4">
                            {(filteredSurveys[currentQuestionIndex]?.options || []).map((option, optIndex) => (
                              <label
                                key={optIndex}
                                className="flex items-center space-x-3 text-gray-700 dark:text-gray-300"
                              >
                                <input
                                  type="radio"
                                  name={filteredSurveys[currentQuestionIndex]._id}
                                  value={option}
                                  checked={responses[filteredSurveys[currentQuestionIndex]._id]?.answer === option}
                                  onChange={() => handleResponseChange(filteredSurveys[currentQuestionIndex]._id, option)}
                                  className="h-5 w-5 text-blue-400 "
                                />
                                <span>{option || 'N/A'}</span>
                              </label>
                            ))}
                          </motion.div>
                        )}
                        {(filteredSurveys[currentQuestionIndex]?.questionType === 'descriptive' || filteredSurveys[currentQuestionIndex]?.questionType === 'optional') && (
                          <motion.div variants={questionChildVariants} className="relative">
                            <textarea
                              value={responses[filteredSurveys[currentQuestionIndex]._id]?.answer || ''}
                              onChange={e => handleResponseChange(filteredSurveys[currentQuestionIndex]._id, e.target.value)}
                              className="w-full p-4 border rounded-lg dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 border-blue-200 dark:border-gray-600 ring-2 ring-blue-200 dark:ring-blue-700"
                              rows="6"
                              placeholder="Enter your answer"
                            />
                            {responses[filteredSurveys[currentQuestionIndex]._id]?.answer && (
                              <button
                                onClick={() => handleResponseChange(filteredSurveys[currentQuestionIndex]._id, '')}
                                className="absolute top-3 right-3 text-gray-500 dark:text-gray-400 hover:text-rose-500 dark:hover:text-rose-400"
                                title="Clear content"
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
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            )}
                          </motion.div>
                        )}
                      </>
                    ) : (
                      <motion.p
                        variants={questionChildVariants}
                        className="text-gray-600 dark:text-gray-400"
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
                <motion.div variants={questionChildVariants} className="flex justify-between gap-6">
                  <button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className={`px-6 py-2 rounded-lg font-medium transition-all pointer-events-auto ${
                      currentQuestionIndex === 0
                        ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-blue-400 dark:bg-blue-500 text-white hover:bg-blue-500 dark:hover:bg-blue-600 hover:scale-110 hover:shadow-lg ring-2 ring-blue-200 dark:ring-blue-700 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-600 ring-offset-2'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIndex === filteredSurveys.length - 1}
                    className={`px-6 py-2 rounded-lg font-medium transition-all pointer-events-auto ${
                      currentQuestionIndex === filteredSurveys.length - 1
                        ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-blue-400 dark:bg-blue-500 text-white hover:bg-blue-500 dark:hover:bg-blue-600 hover:scale-110 hover:shadow-lg ring-2 ring-blue-200 dark:ring-blue-700 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-600 ring-offset-2'
                    }`}
                  >
                    Next
                  </button>
                </motion.div>
              )}
            </>
          )}
          <div className="flex justify-between gap-6">
            <button
              onClick={handleBackToSubsections}
              className="p-3 bg-blue-400 dark:bg-blue-500 text-white rounded-full hover:bg-blue-500 dark:hover:bg-blue-600 hover:scale-110 hover:shadow-lg transition-all ring-2 ring-blue-200 dark:ring-blue-700 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-600 ring-offset-2 pointer-events-auto"
              aria-label="Back to Subsections"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            {!isFileUploadSubsection(currentSubsection) && filteredSurveys.some(survey => survey.questionType !== 'file-upload') && (
              <button
                onClick={() => handleSubmit(currentSubsection)}
                disabled={submitting}
                className={`px-6 py-2 rounded-lg font-medium transition-all pointer-events-auto ${
                  submitting
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-blue-400 dark:bg-blue-500 text-white hover:bg-blue-500 dark:hover:bg-blue-600 hover:scale-110 hover:shadow-lg ring-2 ring-blue-200 dark:ring-blue-700 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-600 ring-offset-2'
                }`}
              >
                {submitting ? 'Submitting...' : 'Submit Responses'}
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Score Popup */}
      <AnimatePresence>
        {showScorePopup && (
          <motion.div
            {...popupAnimation}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-white-2xl z-50"
            role="alertdialog"
            aria-label="Score Confirmation Popup"
          >
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-white-2xl p-12 rounded-2xl shadow-2xl text-center max-w-md w-full border-2 border-blue-300 dark:border-gray-600">
              <h3 className="text-2xl font-extrabold text-blue-500 dark:text-blue-300 mb-4">Do you want to view your score?</h3>
              <div className="mt-6 flex justify-center gap-6">
                <button
                  onClick={() => {
                    setShowScorePopup(false);
                    setCurrentSubsection('');
                    setCurrentQuestionIndex(0);
                    setResponses({});
                    navigate(`/thank-you/${currentSubsection || subsectionId}`);
                  }}
                  className="px-6 py-2 bg-emerald-500 dark:bg-emerald-400 text-white rounded-lg hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:scale-110 hover:shadow-lg transition-all font-medium ring-2 ring-emerald-300 dark:ring-emerald-600 focus:ring-4 focus:ring-emerald-400 dark:focus:ring-emerald-500 ring-offset-2 pointer-events-auto"
                >
                  Yes
                </button>
                <button
                  onClick={() => {
                    setShowScorePopup(false);
                    setCurrentSubsection('');
                    setCurrentQuestionIndex(0);
                    setResponses({});
                    navigate(`/subsections/${selectedSection}`);
                  }}
                  className="px-6 py-2 bg-gray-600 dark:bg-gray-500 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 hover:scale-110 hover:shadow-lg transition-all font-medium ring-2 ring-gray-300 dark:ring-gray-600 focus:ring-4 focus:ring-gray-400 dark:focus:ring-gray-500 ring-offset-2 pointer-events-auto"
                >
                  No
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Confirmation Popup */}
      <AnimatePresence>
        {showSubmitConfirmPopup && (
          <motion.div
            {...popupAnimation}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-white-2xl z-50"
            role="alertdialog"
            aria-label="Submit Confirmation Popup"
          >
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-white-2xl p-12 rounded-2xl shadow-2xl text-center max-w-md w-full border-2 border-blue-300 dark:border-gray-600">
              <h3 className="text-2xl font-extrabold text-blue-500 dark:text-blue-300 mb-4">Are you sure you want to submit the test?</h3>
              <p className="text-base text-gray-700 dark:text-gray-300 mb-4">Your responses will be saved.</p>
              <div className="mt-6 flex justify-center gap-6">
                <button
                  onClick={handleConfirmSubmit}
                  className="px-6 py-2 bg-emerald-500 dark:bg-emerald-400 text-white rounded-lg hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:scale-110 hover:shadow-lg transition-all font-medium ring-2 ring-emerald-300 dark:ring-emerald-600 focus:ring-4 focus:ring-emerald-400 dark:focus:ring-emerald-500 ring-offset-2 pointer-events-auto"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowSubmitConfirmPopup(false)}
                  className="px-6 py-2 bg-gray-600 dark:bg-gray-500 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 hover:scale-110 hover:shadow-lg transition-all font-medium ring-2 ring-gray-300 dark:ring-gray-600 focus:ring-4 focus:ring-gray-400 dark:focus:ring-gray-500 ring-offset-2 pointer-events-auto"
                >
                  No
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mandatory Questions Popup */}
      <AnimatePresence>
        {showMandatoryPopup && (
          <motion.div
            {...popupAnimation}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-white-2xl z-50"
            role="alertdialog"
            aria-label="Mandatory Questions Popup"
          >
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-white-2xl p-12 rounded-2xl shadow-2xl text-center max-w-md w-full border-2 border-blue-300 dark:border-gray-600">
              <h3 className="text-2xl font-extrabold text-blue-500 dark:text-blue-300 mb-4">All questions are mandatory</h3>
              <p className="text-base text-gray-700 dark:text-gray-300 mb-4">Please answer all questions before submitting.</p>
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setShowMandatoryPopup(false)}
                  className="px-6 py-2 bg-blue-400 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-500 dark:hover:bg-blue-600 hover:scale-110 hover:shadow-lg transition-all font-medium ring-2 ring-blue-300 dark:ring-blue-600 focus:ring-4 focus:ring-blue-400 dark:focus:ring-blue-500 ring-offset-2 pointer-events-auto"
                >
                  OK
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back Confirmation Popup */}
      <AnimatePresence>
        {showBackConfirmPopup && (
          <motion.div
            {...popupAnimation}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-white-2xl z-50"
            role="alertdialog"
            aria-label="Back Confirmation Popup"
          >
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-white-2xl p-12 rounded-2xl shadow-2xl text-center max-w-md w-full border-2 border-blue-300 dark:border-gray-600">
              <h3 className="text-2xl font-extrabold text-blue-500 dark:text-blue-300 mb-4">Are you sure you want to leave this page?</h3>
              <p className="text-base text-gray-700 dark:text-gray-300 mb-4">Your progress will not be saved.</p>
              <div className="mt-6 flex justify-center gap-6">
                <button
                  onClick={handleConfirmBack}
                  className="px-6 py-2 bg-emerald-500 dark:bg-emerald-400 text-white rounded-lg hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:scale-110 hover:shadow-lg transition-all font-medium ring-2 ring-emerald-300 dark:ring-emerald-600 focus:ring-4 focus:ring-emerald-400 dark:focus:ring-emerald-500 ring-offset-2 pointer-events-auto"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowBackConfirmPopup(false)}
                  className="px-6 py-2 bg-gray-600 dark:bg-gray-500 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 hover:scale-110 hover:shadow-lg transition-all font-medium ring-2 ring-gray-300 dark:ring-gray-600 focus:ring-4 focus:ring-gray-400 dark:focus:ring-gray-500 ring-offset-2 pointer-events-auto"
                >
                  No
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
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-white-2xl z-50"
            role="dialog"
            aria-label="File Viewer Modal"
          >
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-white-2xl p-12 rounded-2xl shadow-2xl max-w-md sm:max-w-4xl w-full max-h-[80vh] overflow-auto border-2 border-blue-300 dark:border-gray-600 relative">
              <button
                onClick={() => {
                  setShowFileModal(false);
                  setFileContent(null);
                  setFileType('');
                  setFileError(null);
                  setFileLoading(false);
                }}
                className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 pointer-events-auto"
                aria-label="Close modal"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              {fileError ? (
                <div className="text-center">
                  <h3 className="text-2xl font-extrabold text-rose-500 dark:text-rose-400 mb-4">Error Loading File</h3>
                  <p className="text-base text-gray-700 dark:text-gray-300">{fileError}</p>
                </div>
              ) : fileLoading ? (
                <div className="text-center">
                  <LoadingSpinner className="h-8 w-8" />
                  <p className="text-base text-gray-700 dark:text-gray-300 mt-4">Loading file...</p>
                </div>
              ) : fileContent && fileType ? (
                <div className="mt-4">
                  {fileType === 'text' && (
                    <pre className="text-gray-700 dark:text-gray-300 bg-gray-100/80 dark:bg-gray-800/80 p-4 rounded-lg overflow-auto max-h-[60vh]">
                      {fileContent}
                    </pre>
                  )}
                  {fileType === 'image' && (
                    <img
                      src={fileContent}
                      alt="Uploaded file"
                      className="max-w-full h-auto rounded-lg"
                    />
                  )}
                  {fileType === 'pdf' && (
                    <iframe
                      src={fileContent}
                      title="PDF Viewer"
                      className="w-full h-[60vh] rounded-lg"
                    />
                  )}
                  {fileType === 'video' && (
                    <video
                      controls
                      src={fileContent}
                      className="w-full h-auto rounded-lg"
                    >
                      Your browser does not support the video tag.
                    </video>
                  )}
                  {fileType === 'audio' && (
                    <audio
                      controls
                      src={fileContent}
                      className="w-full"
                    >
                      Your browser does not support the audio tag.
                    </audio>
                  )}
                  {fileType === 'download' && (
                    <div className="text-center">
                      <p className="text-base text-gray-700 dark:text-gray-300 mb-4">File type not supported for preview.</p>
                      <a
                        href={fileContent}
                        download
                        className="px-6 py-2 bg-emerald-500 dark:bg-emerald-400 text-white rounded-lg hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:scale-110 hover:shadow-lg transition-all font-medium ring-2 ring-emerald-300 dark:ring-emerald-600 focus:ring-4 focus:ring-emerald-400 dark:focus:ring-emerald-500 ring-offset-2 pointer-events-auto"
                      >
                        Download File
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-base text-gray-700 dark:text-gray-300">No file content available.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>  
  );
}    

export default SurveyForm;