import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { pageTransition, buttonHover, fadeIn } from '../animations/framerAnimations';
import LoadingSpinner from '../components/LoadingSpinner';
import { getDocuments, downloadDocument, getSections, getSubsections } from '../services/api1';

const DocumentCenter = () => {
  const [sections, setSections] = useState([]);
  const [subsections, setSubsections] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedSubsection, setSelectedSubsection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch sections on mount
  useEffect(() => {
    const fetchSections = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getSections();
        console.log('Fetched Sections:', response.data);
        setSections(response.data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        setError(err.response?.data?.message || 'Failed to fetch sections');
        toast.error(err.response?.data?.message || 'Failed to fetch sections');
      }
    };
    fetchSections();
  }, []);

  // Fetch subsections when a section is selected
  useEffect(() => {
    if (selectedSection) {
      const fetchSubsections = async () => {
        try {
          setLoading(true);
          setError(null);
          const response = await getSubsections();
          console.log('Fetched Subsections:', response.data);
          console.log('Selected Section ID:', selectedSection);
          const filteredSubsections = response.data.filter((sub) => {
            const sectionId = sub.sectionId?._id || sub.sectionId;
            console.log('Subsection:', sub, 'Section ID:', sectionId);
            return sectionId === selectedSection;
          });
          console.log('Filtered Subsections:', filteredSubsections);
          setSubsections(filteredSubsections);
          setSelectedSubsection(null);
          setDocuments([]);
          setLoading(false);
        } catch (err) {
          setLoading(false);
          setError(err.response?.data?.message || 'Failed to fetch subsections');
          toast.error(err.response?.data?.message || 'Failed to fetch subsections');
        }
      };
      fetchSubsections();
    } else {
      setSubsections([]);
      setSelectedSubsection(null);
      setDocuments([]);
    }
  }, [selectedSection]);

  // Fetch documents when a subsection is selected
  useEffect(() => {
    if (selectedSubsection) {
      const fetchDocuments = async () => {
        try {
          setLoading(true);
          setError(null);
          const response = await getDocuments(selectedSubsection);
          console.log('Fetched Documents:', response.data);
          setDocuments(response.data);
          setLoading(false);
        } catch (err) {
          setLoading(false);
          setError(err.response?.data?.message || 'Failed to fetch documents');
          toast.error(err.response?.data?.message || 'Failed to fetch documents');
        }
      };
      fetchDocuments();
    } else {
      setDocuments([]);
    }
  }, [selectedSubsection]);

  const handleDownload = async (id, name, fileType) => {
    try {
      const response = await downloadDocument(id);
      console.log('Download Response:', { fileType, name }); // Debug log
      // Create Blob with the correct MIME type
      const blob = new Blob([response.data], { type: fileType || 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      // Ensure file name has an extension
      const fileExtension = name.includes('.') ? '' : (fileType ? `.${fileType.split('/')[1]}` : '');
      link.setAttribute('download', `${name}${fileExtension}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url); // Clean up
      toast.success('Document downloaded successfully!');
    } catch (err) {
      console.error('Download Error:', err); // Debug log
      toast.error(err.response?.data?.message || 'Failed to download document');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <motion.div {...pageTransition} className="w-full flex-1 py-20 flex flex-col items-center justify-start min-h-screen bg-[#afeeee] px-4 sm:px-6 md:px-8">
      <motion.h2 {...fadeIn} className="text-3xl font-roboto mb-6 text-black text-center">
        Document Center
      </motion.h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="w-full max-w-4xl">
        {!selectedSection ? (
          <>
            <h3 className="text-2xl font-semibold mb-4">Sections</h3>
            {sections.length === 0 ? (
              <p className="text-gray-600">No sections available</p>
            ) : (
              <ul className="space-y-2">
                {sections.map((section) => (
                  <li key={section._id}>
                    <motion.button
                      whileHover={buttonHover}
                      onClick={() => setSelectedSection(section._id)}
                      className="w-full text-left p-3 bg-white rounded-lg shadow hover:bg-gray-50"
                    >
                      {section.name}
                    </motion.button>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : !selectedSubsection ? (
          <>
            <motion.button
              whileHover={buttonHover}
              onClick={() => setSelectedSection(null)}
              className="mb-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Back to Sections
            </motion.button>
            <h3 className="text-2xl font-semibold mb-4">{sections.find((s) => s._id === selectedSection)?.name || 'Section'}</h3>
            {subsections.length === 0 ? (
              <p className="text-gray-600">No subsections available for this section. Please check if subsections exist.</p>
            ) : (
              <ul className="space-y-2">
                {subsections.map((subsection) => (
                  <li key={subsection._id}>
                    <motion.button
                      whileHover={buttonHover}
                      onClick={() => setSelectedSubsection(subsection._id)}
                      className="w-full text-left p-3 bg-white rounded-lg shadow hover:bg-gray-50"
                    >
                      {subsection.name}
                    </motion.button>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <>
            <motion.button
              whileHover={buttonHover}
              onClick={() => setSelectedSubsection(null)}
              className="mb-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Back to Subsections
            </motion.button>
            <h3 className="text-2xl font-semibold mb-4">{sections.find((s) => s._id === selectedSection)?.name || 'Section'}</h3>
            <h4 className="text-xl font-medium mb-2">{subsections.find((s) => s._id === selectedSubsection)?.name || 'Subsection'}</h4>
            {documents.length === 0 ? (
              <p className="text-gray-600">No documents available for this subsection</p>
            ) : (
              <ul className="space-y-2">
                {documents.map((doc) => (
                  <li key={doc._id} className="flex justify-between items-center p-3 bg-white rounded-lg shadow">
                    <span>{doc.name}</span>
                    <div className="flex space-x-2">
                      <a
                        href={`http://localhost:5000/${doc.filePath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        View
                      </a>
                      <motion.button
                        whileHover={buttonHover}
                        onClick={() => handleDownload(doc._id, doc.name, doc.fileType)}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Download
                      </motion.button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
      <ToastContainer />
    </motion.div>
  );
};

export default DocumentCenter;