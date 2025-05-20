import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { getResponsesBySubsection, getSections, getSubsections } from '../services/api';
import { pageTransition, fadeIn, cardAnimation } from '../animations/framerAnimations';
import LoadingSpinner from '../components/LoadingSpinner';
import ProtectedRoute from '../components/ProtectedRoute';
import CircularProgress from '../components/CircularProgress';

// Animation for response cards
const responseCardAnimation = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut' },
  whileHover: { scale: 1.02, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' },
};

function ShowReport() {
  const { subsectionId: initialSubsectionId } = useParams();
  const navigate = useNavigate();
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalScore, setTotalScore] = useState(0);
  const [totalPossible, setTotalPossible] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [sections, setSections] = useState([]);
  const [subsections, setSubsections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSubsection, setSelectedSubsection] = useState(initialSubsectionId || '');
  const [subsectionName, setSubsectionName] = useState('');
  const [invalidResponses, setInvalidResponses] = useState([]);

  // Fetch sections, subsections, and set initial subsection name
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const role = localStorage.getItem('role');
        if (role !== 'admin') {
          toast.error('Unauthorized access');
          navigate('/login');
          return;
        }

        const [sectionData, subsectionData] = await Promise.all([
          getSections().catch(err => {
            console.error('Failed to fetch sections:', err);
            toast.error('Failed to fetch sections');
            return [];
          }),
          getSubsections().catch(err => {
            console.error('Failed to fetch subsections:', err);
            toast.error('Failed to fetch subsections');
            return [];
          }),
        ]);

        const normalizedSections = Array.isArray(sectionData) ? sectionData : [];
        const normalizedSubsections = Array.isArray(subsectionData)
          ? subsectionData
          : subsectionData && typeof subsectionData === 'object'
          ? Object.values(subsectionData)
          : [];

        setSections(normalizedSections);
        setSubsections(normalizedSubsections);

        const currentSubsection = normalizedSubsections.find((sub) => sub._id === initialSubsectionId);
        setSubsectionName(currentSubsection?.name || 'Unknown Subsection');

        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch initial data:', err);
        toast.error('Failed to fetch sections or subsections');
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [initialSubsectionId, navigate]);

  // Fetch responses and update subsection name
  useEffect(() => {
    if (!selectedSubsection) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const responseData = await getResponsesBySubsection(selectedSubsection).catch(err => {
          console.error('Failed to fetch responses:', err);
          toast.error('Failed to fetch responses');
          return [];
        });

        const validResponseData = Array.isArray(responseData) ? responseData : [];

        // Filter and validate responses
        let invalidResponsesTemp = [];
        let validResponses = validResponseData.filter(response => {
          if (!response?.user?._id) {
            invalidResponsesTemp.push({
              responseId: response?._id || 'Unknown',
              reason: 'Missing or invalid user data',
              response,
            });
            return false;
          }
          if (!response?.survey?._id) {
            invalidResponsesTemp.push({
              responseId: response?._id || 'Unknown',
              reason: 'Missing or invalid survey data',
              response,
            });
            return false;
          }
          if (!response.survey.question) {
            response.survey.question = 'Untitled Question';
          }
          return true;
        });

        setInvalidResponses(invalidResponsesTemp);
        setResponses(validResponses);

        // Calculate performance metrics
        const nonDescriptiveResponses = validResponses.filter(
          response => response.survey?.questionType !== 'descriptive'
        );
        const score = nonDescriptiveResponses.reduce((sum, response) => {
          const isCorrect = response.answer && response.answer === response.survey?.correctOption;
          return sum + (isCorrect ? response.survey?.maxScore || 1 : 0);
        }, 0);
        const possible = nonDescriptiveResponses.reduce(
          (sum, response) => sum + (response.survey?.maxScore || 1),
          0
        );
        const percent = possible > 0 ? ((score / possible) * 100).toFixed(2) : 0;

        setTotalScore(score);
        setTotalPossible(possible);
        setPercentage(percent);

        // Update subsection name
        const selectedSub = subsections.find((sub) => sub._id === selectedSubsection);
        setSubsectionName(selectedSub?.name || 'Unknown Subsection');

        if (validResponses.length === 0 && invalidResponsesTemp.length === 0) {
          toast.warn(`No responses available for subsection ${selectedSub?.name || selectedSubsection}`);
        }

        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch responses:', err);
        toast.error('Failed to fetch responses');
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedSubsection, subsections]);

  // Filter subsections based on selected section
  const filteredSubsections = selectedSection
    ? subsections.filter((sub) => sub.sectionId?._id === selectedSection)
    : subsections;

  // Group responses by user
  const groupedResponses = responses.reduce((acc, response) => {
    if (response.survey?.questionType === 'file-upload') return acc;

    const userId = response.user._id;
    if (!acc[userId]) {
      acc[userId] = {
        email: response.user.email || 'Unknown',
        role: response.user.role || 'unknown',
        responses: [],
        score: 0,
        total: 0,
      };
    }
    acc[userId].responses.push(response);
    const isCorrect = response.answer && response.answer === response.survey?.correctOption;
    acc[userId].score += response.survey?.questionType !== 'descriptive' && isCorrect
      ? response.survey?.maxScore || 1
      : 0;
    acc[userId].total += response.survey?.questionType !== 'descriptive'
      ? response.survey?.maxScore || 1
      : 0;
    return acc;
  }, {});

  // Utility to format date safely
  const formatDate = (date) => {
    if (!date || isNaN(new Date(date).getTime())) {
      return 'N/A';
    }
    return new Date(date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  };

  // Download report as Excel
  const downloadExcel = () => {
    const excelData = Object.entries(groupedResponses).flatMap(([userId, userData]) =>
      userData.responses
        .filter(response => response.survey?.questionType !== 'file-upload')
        .map((response) => {
          const isDescriptive = response.survey?.questionType === 'descriptive';
          const isOptional = response.survey?.questionType === 'optional';
          const isUnselected = !response.answer || response.answer.trim() === '';
          const isCorrect = response.answer && response.survey?.correctOption && response.answer === response.survey.correctOption;

          const row = {
            Subsection: subsectionName,
            SubsectionID: selectedSubsection || initialSubsectionId || 'None',
            UserEmail: userData.email,
            UserRole: userData.role.toUpperCase(),
            Question: response.survey?.question || 'N/A',
            QuestionType: response.survey?.questionType || 'N/A',
            Answer: isUnselected ? 'Unselected' : response.answer || 'No Answer',
            CorrectAnswer: isDescriptive ? 'N/A' : response.survey?.correctOption || 'N/A',
          };

          // Include score only for non-descriptive questions
          if (!isDescriptive) {
            row.Score = isUnselected || !isCorrect ? 0 : response.survey?.maxScore || 1;
            row.MaxScore = response.survey?.maxScore || 1;
          }

          // Include submission date only for non-descriptive and non-optional questions
          // if (!isDescriptive && !isOptional) {
          //   row.SubmissionDate = formatDate(response.createdAt);
          // }

          return row;
        })
    );

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData, {
      header: [
        'Subsection',
        'SubsectionID',
        'UserEmail',
        'UserRole',
        'Question',
        'QuestionType',
        'Answer',
        
        'Score',
       
      ],
    });

    // Style headers and cells
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!worksheet[cellAddress]) continue;

        // Header styling
        if (R === 0) {
          worksheet[cellAddress].s = {
            font: { bold: true, color: { rgb: 'FFFFFF' } },
            fill: { fgColor: { rgb: '1E3A8A' } }, // Dark blue background
            alignment: { horizontal: 'center', vertical: 'center' },
            border: {
              top: { style: 'thin', color: { rgb: '000000' } },
              bottom: { style: 'thin', color: { rgb: '000000' } },
              left: { style: 'thin', color: { rgb: '000000' } },
              right: { style: 'thin', color: { rgb: '000000' } },
            },
          };
        } else {
          // Cell styling
          worksheet[cellAddress].s = {
            alignment: { vertical: 'center', wrapText: true },
            border: {
              top: { style: 'thin', color: { rgb: 'E5E7EB' } },
              bottom: { style: 'thin', color: { rgb: 'E5E7EB' } },
              left: { style: 'thin', color: { rgb: 'E5E7EB' } },
              right: { style: 'thin', color: { rgb: 'E5E7EB' } },
            },
            fill: R % 2 === 0 ? { fgColor: { rgb: 'F9FAFB' } } : { fgColor: { rgb: 'FFFFFF' } }, // Alternating row colors
          };
        }
      }
    }

    // Auto-adjust column widths
    const colWidths = excelData.reduce((acc, row) => {
      Object.keys(row).forEach((key, i) => {
        const value = row[key] ? row[key].toString() : '';
        acc[i] = Math.max(acc[i] || 10, Math.min(value.length + 2, 50));
      });
      return acc;
    }, []);
    worksheet['!cols'] = colWidths.map(wch => ({ wch }));

    // Freeze header row
    worksheet['!freeze'] = { xSplit: 0, ySplit: 1 };

    // Create workbook and append worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Responses');

    // Write file
    XLSX.writeFile(workbook, `Report_${subsectionName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
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
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 min-h-screen"
      >
        {/* Header */}
        <motion.div {...fadeIn} className="mb-10 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            Report
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Subsection ID: {selectedSubsection || initialSubsectionId || 'None'}
          </p>
        </motion.div>

        {/* Invalid Responses Warning */}
        {invalidResponses.length > 0 && (
          <motion.div
            {...fadeIn}
            className="bg-amber-100 dark:bg-amber-950 border-l-4 border-amber-500 p-5 mb-10 rounded-xl shadow-lg"
          >
            <div className="flex items-center">
              <svg
                className="w-7 h-7 text-amber-500 mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0zM10 5a1 1 0 011 1v3a1 1 0 11-2 0V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200">
                Warning: Invalid Responses Detected
              </h3>
            </div>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-3">
              {invalidResponses.length} response(s) could not be displayed due to missing data:
            </p>
            <ul className="text-sm text-amber-700 dark:text-amber-300 list-disc list-inside mt-3">
              {invalidResponses.map((inv, index) => (
                <li key={index}>
                  Response ID: {inv.responseId} - {inv.reason}
                </li>
              ))}
            </ul>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-3">
              Please check the database to fix these responses or contact support.
            </p>
          </motion.div>
        )}
        {/* Filter Section */}
        <motion.div
          {...fadeIn}
          className="bg-white dark:bg-gray-950 p-6 sm:p-8 rounded-2xl shadow-2xl mb-10"
        >
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Select Section & Subsection
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Select Section
              </label>
              {sections.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {sections.map((section, index) => (
                    <motion.div
                      key={section._id}
                      whileHover={{ scale: 1.05, rotate: 1 }}
                      whileTap={{ scale: 0.95 }}
                      {...cardAnimation}
                      transition={{ delay: 0.1 * index }}
                      className={`p-5 rounded-xl shadow-md text-center cursor-pointer transition-all duration-300 ${
                        selectedSection === section._id
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => {
                        setSelectedSection(section._id);
                        setSelectedSubsection('');
                      }}
                      role="button"
                      aria-label={`Select section ${section.name || 'Unnamed Section'}`}
                    >
                      <h4 className="text-base font-semibold">
                        {section.name || 'Unnamed Section'}
                      </h4>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  No sections available.
                </p>
              )}
            </div>

            {selectedSection && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Select Subsection
                </label>
                {filteredSubsections.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredSubsections.map((subsection, index) => (
                      <motion.div
                        key={subsection._id}
                        whileHover={{ scale: 1.05, rotate: 1 }}
                        whileTap={{ scale: 0.95 }}
                        {...cardAnimation}
                        transition={{ delay: 0.1 * index }}
                        className={`p-5 rounded-xl shadow-md text-center cursor-pointer transition-all duration-300 ${
                          selectedSubsection === subsection._id
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => setSelectedSubsection(subsection._id)}
                        role="button"
                        aria-label={`Select subsection ${subsection.name || 'Unnamed Subsection'}`}
                      >
                        <h4 className="text-base font-semibold">
                          {subsection.name || 'Unnamed Subsection'}
                        </h4>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    No subsections available for this section.
                  </p>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Report Section */}
        {selectedSubsection && (
          <motion.div
            {...fadeIn}
            className="bg-white dark:bg-gray-950 p-6 sm:p-8 rounded-2xl shadow-2xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-gray-100">
                Responses for Subsection: {subsectionName}
              </h3>
              <button
                onClick={downloadExcel}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                disabled={Object.entries(groupedResponses).length === 0}
                aria-label="Download responses as Excel"
              >
                <svg
                  className="w-5 h-5"
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
                    d="M12 4v16m8-8H4"
                  ></path>
                </svg>
                Download Excel
              </button>
            </div>

            {/* Performance Metrics */}
            <motion.div
              {...fadeIn}
              className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900 dark:to-purple-900 p-6 rounded-xl mb-8 shadow-inner"
            >
              <h4 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Performance Overview
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="text-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Score</p>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {totalScore} / {totalPossible}
                  </p>
                </div>
                <div className="text-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Percentage</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {percentage}%
                  </p>
                </div>
                <div className="text-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Responses</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {responses.length}
                  </p>
                </div>
              </div>
            </motion.div>

            {Object.entries(groupedResponses).length > 0 ? (
              Object.entries(groupedResponses).map(([userId, userData]) => (
                <div key={userId} className="mb-8">
                  <h4 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    {userData.email}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userData.responses
                      .filter(response => response.survey?.questionType !== 'file-upload')
                      .map((response, index) => {
                        const isDescriptive = response.survey?.questionType === 'descriptive';
                        const isOptional = response.survey?.questionType === 'optional';
                        const isUnselected = !response.answer || response.answer.trim() === '';
                        const isCorrect = response.answer && response.survey?.correctOption && response.answer === response.survey.correctOption;

                        return (
                          <motion.div
                            key={response._id}
                            {...responseCardAnimation}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
                            role="region"
                            aria-label={`Response ${index + 1} from ${userData.email}`}
                          >
                            {isDescriptive ? (
                              <div>
                                <p className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                  {response.survey?.question || 'N/A'}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {isUnselected ? 'Unselected' : response.answer || 'No Answer'}
                                </p>
                              </div>
                            ) : (
                              <div>
                                <p className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                  {response.survey?.question || 'N/A'}
                                </p>
                                <div className="space-y-2">
                                  <p className="text-sm">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Answer: </span>
                                    <span
                                      className={`${
                                        isUnselected
                                          ? 'text-red-500 dark:text-red-400'
                                          : isCorrect
                                          ? 'text-green-600 dark:text-green-400 font-semibold'
                                          : 'text-red-500 dark:text-red-400'
                                      }`}
                                    >
                                      {isUnselected ? 'Unselected' : response.answer || 'No Answer'}
                                      {(isOptional || !isDescriptive) && response.answer && response.survey?.correctOption && (
                                        <span className="ml-2">
                                          {isCorrect ? (
                                            <span className="text-green-500">✔</span>
                                          ) : (
                                            <span className="text-red-500">✘</span>
                                          )}
                                        </span>
                                      )}
                                    </span>
                                  </p>
                                  {(isOptional || !isDescriptive) && (
                                    <>
                                      <p className="text-sm">
                                        <span className="font-medium text-gray-700 dark:text-gray-300">Correct Answer: </span>
                                        {response.survey?.correctOption || 'N/A'}
                                      </p>
                                      <p className="text-sm">
                                        <span className="font-medium text-gray-700 dark:text-gray-300">Score: </span>
                                        {`${isUnselected || !isCorrect ? 0 : response.survey?.maxScore || 1} / ${response.survey?.maxScore || 1}`}
                                      </p>
                                      {/* {!isOptional && (
                                        // <p className="text-sm">
                                        //   <span className="font-medium text-gray-700 dark:text-gray-300">Submission Date: </span>
                                        //   {formatDate(response.createdAt)}
                                        // </p>
                                      )} */}
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                  </div>
                </div>
              ))
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
                  No valid responses available for this subsection.
                </p>
                <Link
                  to="/admin/dashboard"
                  className="mt-4 inline-block text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
                  aria-label="Back to dashboard"
                >
                  Back to Dashboard
                </Link>
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>
    </ProtectedRoute>
  );
}

export default ShowReport;