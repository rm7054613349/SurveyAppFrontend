import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getSurveys, getSurveysBySubsection, getSections, getSubsections, submitResponses, getFileContent, getResponsesBySubsection } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { LockClosedIcon, LockOpenIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

// Animation definitions (unchanged)
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
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, type: 'spring', stiffness: 120 },
  },
  hover: { scale: 1.05, boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)' },
};

const subsectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, type: 'spring', stiffness: 100 },
  },
  hover: { scale: 1.05, boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)' },
};

const questionVariants = {
  hidden: { opacity: 0, x: 100, scale: 0.9 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut', staggerChildren: 0.15 },
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
    transition: { duration: 0.4, type: 'spring', stiffness: 100 },
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
  const [showSubsectionPopup, setShowSubsectionPopup] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [fileContent, setFileContent] = useState(null);
  const [fileType, setFileType] = useState('');
  const [fileError, setFileError] = useState(null);
  const [pendingSubsection, setPendingSubsection] = useState(null);
  const [completedSubsections, setCompletedSubsections] = useState(() => {
    const savedCompleted = localStorage.getItem('completedSubsections');
    return savedCompleted ? new Set(JSON.parse(savedCompleted)) : new Set();
  });
  const [cachedFileContent, setCachedFileContent] = useState({});
  const [showScorePopup, setShowScorePopup] = useState(false);
  const [showSubmitConfirmPopup, setShowSubmitConfirmPopup] = useState(false);
  const [showBackConfirmPopup, setShowBackConfirmPopup] = useState(false);
  const [showMandatoryPopup, setShowMandatoryPopup] = useState(false);
  const [showNavConfirmPopup, setShowNavConfirmPopup] = useState(false);
  const [pendingNavPath, setPendingNavPath] = useState(null);
  const [subsectionScores, setSubsectionScores] = useState({});
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
  }, [selectedSection, currentSubsection, currentQuestionIndex, responses, timers, timeLeft, completedSubsections]);

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
        setSubsectionScores(prev => ({ ...prev, [subsectionId]: percent }));
        return { attempted: true, score: percent };
      }
      return { attempted: false, score: 0 };
    } catch (err) {
      console.error('Error checking responses:', err);
      return { attempted: false, score: 0 };
    }
  };

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

          // Fetch scores for all subsections to determine lock status
          const scorePromises = normalizedSubsections.map(sub => checkIfAttempted(sub._id));
          await Promise.all(scorePromises);

          if (!subsectionId && !nextSubsectionId) {
            setCurrentSubsection('');
            setCurrentQuestionIndex(0);
            setResponses({});
            setTimers({});
            setShowWarning({});
            localStorage.removeItem('currentSubsection');
            localStorage.removeItem('currentQuestionIndex');
            localStorage.removeItem('responses');
            localStorage.removeItem('timers');
            localStorage.removeItem('completedSubsections');
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
            }
          } else if (nextSubsectionId && percentage >= 70) {
            const { attempted } = await checkIfAttempted(nextSubsectionId);
            if (attempted && !isFileUploadSubsection(nextSubsectionId)) {
              toast.info('You have already responded to this test.');
              setPendingSubsection(nextSubsectionId);
              setShowScorePopup(true);
            } else {
              setPendingSubsection(nextSubsectionId);
              setShowSubsectionPopup(true);
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
  }, [subsectionId, nextSubsectionId, percentage]);

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
          const response = await getFileContent(fileUrl);
          const contentType = response.headers?.['content-type'] || 'application/octet-stream';
          let content, type;

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
            setCachedFileContent(prev => ({ ...prev, [fileUrl]: { content, type } }));
            setFileType(type);
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
          }
        }
      };
      attemptFetch(1);
    };
    fetchFileContent();
  }, [currentSubsection]);

  // Timer for non-file-upload subsections
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

  const isSubsectionLocked = (subsectionId, index) => {
    // Descriptive, file-upload, and optional subsections are always unlocked
    if (
      isDescriptiveSubsection(subsectionId) ||
      isFileUploadSubsection(subsectionId) ||
      isOptionalSubsection(subsectionId)
    ) {
      return false;
    }

    // First subsection is always unlocked
    if (index === 0) return false;

    // Check if the first subsection in the section has a score >= 70%
    const firstSubsectionId = filteredSubsections[0]?._id;
    const firstSubsectionScore = subsectionScores[firstSubsectionId] || 0;
    const isFirstSubsectionCompleted = completedSubsections.has(firstSubsectionId);

    if (isFirstSubsectionCompleted && firstSubsectionScore >= 70) {
      return false;
    }

    // For multiple-choice subsections, check if previous subsection is completed and has score >= 70
    const prevSubsectionId = filteredSubsections[index - 1]?._id;
    // Previous subsection is unlocked if it's descriptive, file-upload, or optional
    if (
      isDescriptiveSubsection(prevSubsectionId) ||
      isFileUploadSubsection(prevSubsectionId) ||
      isOptionalSubsection(prevSubsectionId)
    ) {
      return false;
    }

    const prevScore = subsectionScores[prevSubsectionId] || 0;
    const isPrevCompleted = completedSubsections.has(prevSubsectionId);
    return !isPrevCompleted || prevScore < 70;
  };

  const handleSectionClick = (sectionId) => {
    if (currentSubsection && !isFileUploadSubsection(currentSubsection) && !isDescriptiveSubsection(currentSubsection)) {
      setPendingNavPath(() => () => {
        setSelectedSection(sectionId);
        setCurrentSubsection('');
        setCurrentQuestionIndex(0);
        setTimers({});
        setShowWarning({});
        setShowSubsectionPopup(false);
        setShowFileModal(false);
        setFileContent(null);
        setFileError(null);
      });
      setShowNavConfirmPopup(true);
    } else {
      setSelectedSection(sectionId);
      setCurrentSubsection('');
      setCurrentQuestionIndex(0);
      setTimers({});
      setShowWarning({});
      setShowSubsectionPopup(false);
      setShowFileModal(false);
      setFileContent(null);
      setFileError(null);
    }
  };

  const handleSubsectionClick = async (subsectionId, index) => {
    if (isSubsectionLocked(subsectionId, index)) {
      toast.info('Please complete the previous subsection or achieve 70% or higher in the first subsection.');
      return;
    }
    const { attempted } = await checkIfAttempted(subsectionId);
    if (attempted && !isFileUploadSubsection(subsectionId)) {
      toast.info('You have already responded to this test.');
      setPendingSubsection(subsectionId);
      setShowScorePopup(true);
    } else {
      if (currentSubsection && !isFileUploadSubsection(currentSubsection) && !isDescriptiveSubsection(currentSubsection)) {
        setPendingNavPath(() => () => {
          setPendingSubsection(subsectionId);
          setShowSubsectionPopup(true);
        });
        setShowNavConfirmPopup(true);
      } else {
        setPendingSubsection(subsectionId);
        setShowSubsectionPopup(true);
      }
    }
  };

  const handleSubsectionConfirm = () => {
    if (pendingSubsection) {
      setCurrentSubsection(pendingSubsection);
      setCurrentQuestionIndex(0);
      setResponses({});
      if (!isFileUploadSubsection(pendingSubsection) && !isDescriptiveSubsection(pendingSubsection)) {
        setTimers(prev => ({ ...prev, [pendingSubsection]: 30 * 60 }));
        setShowWarning(prev => ({ ...prev, [pendingSubsection]: false }));
      }
      setCompletedSubsections(prev => new Set(prev).add(pendingSubsection));
      setShowSubsectionPopup(false);
      setPendingSubsection(null);
    }
  };

  const handleResponseChange = (surveyId, value) => {
    setResponses(prev => ({ ...prev, [surveyId]: { answer: value || '' } }));
  };

  const handleOpenFile = async (fileUrl) => {
    if (typeof fileUrl !== 'string' || !fileUrl) {
      toast.error('Invalid file URL');
      setFileError('Invalid file URL');
      setShowFileModal(true);
      return;
    }

    if (cachedFileContent[fileUrl] && !cachedFileContent[fileUrl].error) {
      setFileContent(cachedFileContent[fileUrl].content);
      setFileType(cachedFileContent[fileUrl].type);
      setFileError(null);
      setShowFileModal(true);
      return;
    }

    const normalizedFileUrl = fileUrl.replace(/^Uploads[\\\/]+/, '').replace(/^[\\\/]+/, '').replace(/[\\\/]+$/, '').split(/[\\\/]/).pop();
    try {
      setFileError(null);
      setFileContent(null);
      setFileType('');
      const response = await getFileContent(normalizedFileUrl);
      const contentType = response.headers?.['content-type'] || 'application/octet-stream';
      let content, type;

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
      setCachedFileContent(prev => ({ ...prev, [fileUrl]: { content, type } }));
      setFileType(type);
      setShowFileModal(true);
    } catch (error) {
      const errorMessage = error.response?.status === 404 ? 'File not found on server' : `Failed to load file: ${error.message}`;
      setFileError(errorMessage);
      setCachedFileContent(prev => ({ ...prev, [fileUrl]: { error: errorMessage } }));
      toast.error(errorMessage);
      setShowFileModal(true);
    }
  };

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
      
      setCompletedSubsections(prev => new Set(prev).add(targetSubsectionId));

      // Reset states before navigation
      setResponses({});
      setTimers(prev => ({ ...prev, [targetSubsectionId]: 0 }));
      setCurrentQuestionIndex(0);
      setCurrentSubsection('');
      setSubmitting(false);
      
      navigate(`/thank-you/${targetSubsectionId}`, { state: { totalMarks } });
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

  const handleBackToSubsections = () => {
    if (isFileUploadSubsection(currentSubsection) || isDescriptiveSubsection(currentSubsection)) {
      setCurrentSubsection('');
      setCurrentQuestionIndex(0);
      setResponses({});
      setTimers(prev => ({ ...prev, [currentSubsection]: 30 * 60 }));
    } else {
      setShowBackConfirmPopup(true);
    }
  };

  const handleConfirmBack = () => {
    setShowBackConfirmPopup(false);
    setCurrentSubsection('');
    setCurrentQuestionIndex(0);
    setResponses({});
    setTimers(prev => ({ ...prev, [currentSubsection]: 30 * 60 }));
  };

  const handleNavClick = (path) => {
    if (currentSubsection && !isFileUploadSubsection(currentSubsection) && !isDescriptiveSubsection(currentSubsection)) {
      setPendingNavPath(() => () => navigate(path));
      setShowNavConfirmPopup(true);
    } else {
      navigate(path);
    }
  };

  const handleConfirmNav = () => {
    setShowNavConfirmPopup(false);
    if (pendingNavPath) {
      pendingNavPath();
      setCurrentSubsection('');
      setCurrentQuestionIndex(0);
      setResponses({});
      setTimers(prev => ({ ...prev, [currentSubsection]: 30 * 60 }));
      setPendingNavPath(null);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (currentSubsection && !isFileUploadSubsection(currentSubsection) && !isDescriptiveSubsection(currentSubsection)) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentSubsection]);

  const wrappedNavigate = (path) => {
    if (currentSubsection && !isFileUploadSubsection(currentSubsection) && !isDescriptiveSubsection(currentSubsection)) {
      setPendingNavPath(() => () => navigate(path));
      setShowNavConfirmPopup(true);
    } else {
      navigate(path);
    }
  };

  const formatTime = seconds => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return (
      <motion.div {...fadeIn} className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
        <LoadingSpinner />
      </motion.div>
    );
  }

  return (
    <motion.div {...pageTransition} className="container mx-auto p-6 max-w-5xl bg-gray-50 dark:bg-gray-900 min-h-screen">
      {!subsectionId && !currentSubsection && (
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">Select a Section</h2>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
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
                  className={`p-6 rounded-xl shadow-lg cursor-pointer transition-all duration-300 ${
                    selectedSection === section._id
                      ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => handleSectionClick(section._id)}
                >
                  <h3 className="text-xl font-semibold text-center">{section.name}</h3>
                  <p className="text-sm text-center mt-2 opacity-80">Click to explore subsections</p>
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

      {!subsectionId && selectedSection && !currentSubsection && (
        <AnimatePresence>
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">Subsections</h2>
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
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
                      className={`p-6 rounded-xl shadow-md flex flex-col items-center justify-between relative transition-all duration-300 ${
                        isLocked
                          ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                          : isCompleted
                          ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'
                      }`}
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
                        <h4 className="text-lg font-medium text-center">{subsection.name}</h4>
                        {isMultipleChoice && isCompleted && (
                          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                            ({score.toFixed(2)}%)
                          </span>
                        )}
                      </div>
                      {(isFileUpload || isDescriptive || isOptional) && (
                        <span className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                          {isFileUpload ? 'File Upload' : isDescriptive ? 'Descriptive' : 'Optional'}
                        </span>
                      )}
                      {isFileUpload && fileUrl && (
                        <span className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mt-2">
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

      {currentSubsection && (
        <motion.div {...fadeIn} className="space-y-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          {isFileUploadSubsection(currentSubsection) && (() => {
            const fileUrl = getAdminFileUrl(currentSubsection);
            const question = getAdminFileQuestion(currentSubsection);
            return fileUrl ? (
              <motion.div
                variants={adminFileVariants}
                initial="hidden"
                animate="visible"
                className="p-6 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
              >
                <h4 className="text-xl font-semibold text-rose-600 dark:text-rose-400 mb-4">{question}</h4>
                <button
                  onClick={() => handleOpenFile(fileUrl)}
                  className="px-4 py-2 bg-rose-600 dark:bg-rose-500 text-white rounded-lg hover:bg-rose-700 dark:hover:bg-rose-600 transition-colors"
                >
                  View File
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
                  <h2 className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                    Time Left: {formatTime(subsectionId ? timeLeft : timers[currentSubsection] || 30 * 60)}
                  </h2>
                </motion.div>
              )}

              {filteredSurveys.length > 0 ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={filteredSurveys[currentQuestionIndex]._id}
                    variants={questionVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="p-6 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                  >
                    {filteredSurveys[currentQuestionIndex].questionType !== 'file-upload' ? (
                      <>
                        <motion.h4
                          variants={questionChildVariants}
                          className="text-xl font-semibold text-rose-600 dark:text-rose-400 mb-4"
                        >
                          {filteredSurveys[currentQuestionIndex].question || 'No question'}
                        </motion.h4>
                        <motion.p
                          variants={questionChildVariants}
                          className="text-gray-600 dark:text-gray-400 mb-4"
                        >
                          Category: {filteredSurveys[currentQuestionIndex].categoryId?.name || 'Uncategorized'} | Type:{' '}
                          {(filteredSurveys[currentQuestionIndex].questionType || 'unknown').replace('-', ' ').toUpperCase()} | Max Score: {filteredSurveys[currentQuestionIndex].maxScore || 'N/A'}
                        </motion.p>
                        {filteredSurveys[currentQuestionIndex].questionType === 'multiple-choice' && (
                          <motion.div variants={questionChildVariants} className="space-y-3">
                            {(filteredSurveys[currentQuestionIndex].options || []).map((option, optIndex) => (
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
                                  className="h-5 w-5 text-emerald-600 focus:ring-emerald-600"
                                />
                                <span>{option || 'N/A'}</span>
                              </label>
                            ))}
                          </motion.div>
                        )}
                        {(filteredSurveys[currentQuestionIndex].questionType === 'descriptive' || filteredSurveys[currentQuestionIndex].questionType === 'optional') && (
                          <motion.div variants={questionChildVariants} className="relative">
                            <textarea
                              value={responses[filteredSurveys[currentQuestionIndex]._id]?.answer || ''}
                              onChange={e => handleResponseChange(filteredSurveys[currentQuestionIndex]._id, e.target.value)}
                              className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-600 border-gray-300 dark:border-gray-600"
                              rows="5"
                              placeholder="Enter your answer"
                            />
                            {responses[filteredSurveys[currentQuestionIndex]._id]?.answer && (
                              <button
                                onClick={() => handleResponseChange(filteredSurveys[currentQuestionIndex]._id, '')}
                                className="absolute top-3 right-3 text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400"
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
                <motion.div variants={questionChildVariants} className="flex justify-between">
                  <button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className={`px-4 py-2 rounded-lg ${
                      currentQuestionIndex === 0
                        ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-rose-600 dark:bg-rose-500 text-white hover:bg-rose-700 dark:hover:bg-rose-600'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIndex === filteredSurveys.length - 1}
                    className={`px-4 py-2 rounded-lg ${
                      currentQuestionIndex === filteredSurveys.length - 1
                        ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-rose-600 dark:bg-rose-500 text-white hover:bg-rose-700 dark:hover:bg-rose-600'
                    }`}
                  >
                    Next
                  </button>
                </motion.div>
              )}
            </>
          )}
          <div className="flex justify-between">
            <button
              onClick={handleBackToSubsections}
              className="px-4 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-600 dark:hover:bg-gray-700"
            >
              Back to Subsections
            </button>
            {!isFileUploadSubsection(currentSubsection) && filteredSurveys.some(survey => survey.questionType !== 'file-upload') && (
              <button
                onClick={() => handleSubmit(currentSubsection)}
                disabled={submitting}
                className={`px-4 py-2 rounded-lg ${
                  submitting
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-rose-600 dark:bg-rose-500 text-white hover:bg-rose-700 dark:hover:bg-rose-600'
                }`}
              >
                {submitting ? 'Submitting...' : 'Submit Responses'}
              </button>
            )}
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {showSubsectionPopup && (
          <motion.div
            {...popupAnimation}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          >
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg text-center max-w-sm w-full border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400">Open this subsection?</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {isFileUploadSubsection(pendingSubsection) ? 'View admin-uploaded files.' : 'Answer test questions.'}
              </p>
              <div className="mt-4 flex justify-center gap-4">
                <button
                  onClick={handleSubsectionConfirm}
                  className="px-4 py-2 bg-emerald-600 dark:bg-emerald-500 text-white rounded hover:bg-emerald-700 dark:hover:bg-emerald-600"
                >
                  Yes
                </button>
                <button
                  onClick={() => {
                    setShowSubsectionPopup(false);
                    setPendingSubsection(null);
                  }}
                  className="px-4 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded hover:bg-gray-600 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showScorePopup && (
          <motion.div
            {...popupAnimation}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          >
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg text-center max-w-sm w-full border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400">Do you want to view your score?</h3>
              <div className="mt-4 flex justify-center gap-4">
                <button
                  onClick={() => {
                    setShowScorePopup(false);
                    wrappedNavigate(`/thank-you/${pendingSubsection || subsectionId}`);
                  }}
                  className="px-4 py-2 bg-emerald-600 dark:bg-emerald-500 text-white rounded hover:bg-emerald-700 dark:hover:bg-emerald-600"
                >
                  Yes
                </button>
                <button
                  onClick={() => {
                    setShowScorePopup(false);
                    setPendingSubsection(null);
                    if (subsectionId) {
                      wrappedNavigate('/employee/survey');
                    }
                  }}
                  className="px-4 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded hover:bg-gray-600 dark:hover:bg-gray-700"
                >
                  No
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSubmitConfirmPopup && (
          <motion.div
            {...popupAnimation}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          >
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg text-center max-w-sm w-full border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400">Are you sure you want to submit the test?</h3>
              <div className="mt-4 flex justify-center gap-4">
                <button
                  onClick={handleConfirmSubmit}
                  className="px-4 py-2 bg-emerald-600 dark:bg-emerald-500 text-white rounded hover:bg-emerald-700 dark:hover:bg-emerald-600"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowSubmitConfirmPopup(false)}
                  className="px-4 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded hover:bg-gray-600 dark:hover:bg-gray-700"
                >
                  No
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMandatoryPopup && (
          <motion.div
            {...popupAnimation}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          >
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg text-center max-w-sm w-full border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400">All questions are mandatory</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Please answer all questions before submitting.</p>
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => setShowMandatoryPopup(false)}
                  className="px-4 py-2 bg-rose-600 dark:bg-rose-500 text-white rounded hover:bg-rose-700 dark:hover:bg-rose-600"
                >
                  OK
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBackConfirmPopup && (
          <motion.div
            {...popupAnimation}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          >
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg text-center max-w-sm w-full border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400">Are you sure you want to cancel the test?</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Your progress will not be saved.</p>
              <div className="mt-4 flex justify-center gap-4">
                <button
                  onClick={handleConfirmBack}
                  className="px-4 py-2 bg-emerald-600 dark:bg-emerald-500 text-white rounded hover:bg-emerald-700 dark:hover:bg-emerald-600"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowBackConfirmPopup(false)}
                  className="px-4 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded hover:bg-gray-600 dark:hover:bg-gray-700"
                >
                  No
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNavConfirmPopup && (
          <motion.div
            {...popupAnimation}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          >
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg text-center max-w-sm w-full border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400">Are you sure you want to leave the test?</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Your progress will not be saved.</p>
              <div className="mt-4 flex justify-center gap-4">
                <button
                  onClick={handleConfirmNav}
                  className="px-4 py-2 bg-emerald-600 dark:bg-emerald-500 text-white rounded hover:bg-emerald-700 dark:hover:bg-emerald-600"
                >
                  Yes
                </button>
                <button
                  onClick={() => {
                    setShowNavConfirmPopup(false);
                    setPendingNavPath(null);
                  }}
                  className="px-4 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded hover:bg-gray-600 dark:hover:bg-gray-700"
                >
                  No
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFileModal && (
          <motion.div
            {...popupAnimation}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            role="dialog"
            aria-label="File Viewer Modal"
          >
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg max-w-lg sm:max-w-2xl w-full max-h-[80vh] overflow-auto border border-gray-200 dark:border-gray-700 relative">
              <button
                onClick={() => {
                  setShowFileModal(false);
                  setFileContent(null);
                  setFileType('');
                  setFileError(null);
                }}
                className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400"
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
                  <h3 className="text-lg font-bold text-rose-600 dark:text-rose-400 mb-4">Error Loading File</h3>
                  <p className="text-gray-600 dark:text-gray-400">{fileError}</p>
                </div>
              ) : fileContent && fileType ? (
                <div className="mt-4">
                  {fileType === 'text' && (
                    <pre className="text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-auto max-h-[60vh]">
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
                      <p className="text-gray-600 dark:text-gray-400 mb-4">File type not supported for preview.</p>
                      <a
                        href={fileContent}
                        download
                        className="px-4 py-2 bg-emerald-600 dark:bg-emerald-500 text-white rounded-lg hover:bg-emerald-700 dark:hover:bg-emerald-600"
                      >
                        Download File
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-400">Loading file...</p>
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