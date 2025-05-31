import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { pageTransition, buttonHover, fadeIn } from '../../animations/framerAnimations';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getSections, createSection, getSubsections, createSubsection, createDocument } from '../../services/api1';

const DocumentCenterForm = () => {
  const [name, setName] = useState('');
  const [section, setSection] = useState('');
  const [newSection, setNewSection] = useState('');
  const [subsection, setSubsection] = useState('');
  const [newSubsection, setNewSubsection] = useState('');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [sections, setSections] = useState([]);
  const [subsections, setSubsections] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch sections and subsections on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sectionData, subsectionData] = await Promise.all([
          getSections(),
          getSubsections(),
        ]);
        console.log('Fetched Sections:', sectionData.data); // Debug log
        console.log('Fetched Subsections:', subsectionData.data); // Debug log
        setSections(sectionData.data);
        setSubsections(subsectionData.data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        toast.error(err.response?.data?.message || 'Failed to fetch sections or subsections');
      }
    };
    fetchData();
  }, []);

  // Filter subsections based on selected section
  const filteredSubsections = subsections.filter(
    (sub) => (sub.sectionId?._id || sub.sectionId) === section
  );

  const validateInputs = () => {
    if (!name.trim() || name.trim().length < 3 || name.trim().length > 100) {
      toast.error('Document name must be between 3 and 100 characters');
      return false;
    }
    if (!section && !newSection.trim()) {
      toast.error('Please select or create a section');
      return false;
    }
    if (newSection.trim() && (newSection.trim().length < 3 || newSection.trim().length > 50)) {
      toast.error('Section name must be between 3 and 50 characters');
      return false;
    }
    if (!subsection && !newSubsection.trim()) {
      toast.error('Please select or create a subsection');
      return false;
    }
    if (newSubsection.trim() && (newSubsection.trim().length < 3 || newSubsection.trim().length > 50)) {
      toast.error('Subsection name must be between 3 and 50 characters');
      return false;
    }
    if (!file) {
      toast.error('File is required');
      return false;
    }
    return true;
  };

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
        'text/x-c', 'text/x-c++', 'text/x-java-source'
      ];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Unsupported file type');
        return;
      }
      setFile(selectedFile);
      setFilePreview(URL.createObjectURL(selectedFile));
    } else {
      setFile(null);
      setFilePreview(null);
    }
  };

  // Function to re-fetch subsections
  const fetchSubsections = async () => {
    try {
      const response = await getSubsections();
      console.log('Re-fetched Subsections:', response.data); // Debug log
      setSubsections(response.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch subsections');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateInputs()) {
      return;
    }

    try {
      setLoading(true);
      let sectionId = section;
      if (newSection.trim()) {
        if (sections.some((sec) => sec.name.toLowerCase() === newSection.trim().toLowerCase())) {
          toast.error('Section name already exists');
          setLoading(false);
          return;
        }
        const newSectionData = await createSection({ name: newSection.trim() });
        sectionId = newSectionData.data._id;
        setSections([...sections, newSectionData.data]);
        setSection(sectionId);
        setNewSection('');
        toast.success(`Section "${newSectionData.data.name}" created successfully`);
        // Re-fetch subsections to include any existing ones for the new section
        await fetchSubsections();
      }

      let subsectionId = subsection;
      if (newSubsection.trim()) {
        if (!sectionId) {
          toast.error('Invalid section ID');
          setLoading(false);
          return;
        }
        if (subsections.some((sub) => sub.name.toLowerCase() === newSubsection.trim().toLowerCase() && (sub.sectionId?._id || sub.sectionId) === sectionId)) {
          toast.error('Subsection name already exists in this section');
          setLoading(false);
          return;
        }
        const newSubsectionData = await createSubsection({ name: newSubsection.trim(), sectionId });
        subsectionId = newSubsectionData.data._id;
        setSubsections([...subsections, newSubsectionData.data]);
        setSubsection(subsectionId);
        setNewSubsection('');
        toast.success(`Subsection "${newSubsectionData.data.name}" created successfully`);
      }

      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('sectionId', sectionId);
      formData.append('subsectionId', subsectionId);
      formData.append('file', file);

      await createDocument(formData);
      setName('');
      setSection('');
      setSubsection('');
      setFile(null);
      setFilePreview(null);
      toast.success('Document uploaded successfully!');
      setLoading(false);
    } catch (err) {
      setLoading(false);
      toast.error(err.response?.data?.message || 'Failed to upload document');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <motion.div {...pageTransition} className="w-full flex-1 py-20 flex flex-col items-center justify-start min-h-screen bg-[#afeeee] px-4 sm:px-6 md:px-8">
      <motion.h2 {...fadeIn} className="text-3xl font-roboto mb-6 text-black text-center">
        Document Center Form
      </motion.h2>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <motion.div {...fadeIn} transition={{ delay: 0.1 }}>
          <label className="block mb-2 text-gray-700 font-medium">Document Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 100))}
            className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500"
            placeholder="Enter document name"
          />
        </motion.div>
        <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
          <label className="block mb-2 text-gray-700 font-medium">Select Section</label>
          <select
            value={section}
            onChange={(e) => {
              setSection(e.target.value);
              setSubsection('');
              setNewSubsection('');
            }}
            className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Section</option>
            {sections.map((sec) => (
              <option key={sec._id} value={sec._id}>{sec.name}</option>
            ))}
          </select>
        </motion.div>
        <motion.div {...fadeIn} transition={{ delay: 0.3 }}>
          <label className="block mb-2 text-gray-700 font-medium">Or Create New Section</label>
          <input
            type="text"
            value={newSection}
            onChange={(e) => setNewSection(e.target.value.slice(0, 50))}
            className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500"
            placeholder="Enter new section name"
            disabled={section}
          />
        </motion.div>
        <motion.div {...fadeIn} transition={{ delay: 0.4 }}>
          <label className="block mb-2 text-gray-700 font-medium">Select Subsection</label>
          <select
            value={subsection}
            onChange={(e) => setSubsection(e.target.value)}
            className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500"
            disabled={!section && !newSection.trim()}
          >
            <option value="">Select Subsection</option>
            {filteredSubsections.map((sub) => (
              <option key={sub._id} value={sub._id}>{sub.name}</option>
            ))}
          </select>
        </motion.div>
        <motion.div {...fadeIn} transition={{ delay: 0.5 }}>
          <label className="block mb-2 text-gray-700 font-medium">Or Create New Subsection</label>
          <input
            type="text"
            value={newSubsection}
            onChange={(e) => setNewSubsection(e.target.value.slice(0, 50))}
            className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500"
            placeholder="Enter new subsection name"
            disabled={subsection || (!section && !newSection.trim())}
          />
        </motion.div>
        <motion.div {...fadeIn} transition={{ delay: 0.6 }}>
          <label className="block mb-2 text-gray-700 font-medium">Upload File</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full p-3 border rounded"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
            required
          />
          {filePreview && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">
                Preview: <a href={filePreview} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View File</a>
              </p>
            </div>
          )}
        </motion.div>
        <motion.button
          whileHover={buttonHover}
          type="submit"
          disabled={loading}
          className={`w-full p-3 rounded-lg text-white ${loading ? 'bg-[#00ced1] cursor-not-allowed' : 'bg-[#00ced1]'}`}
        >
          {loading ? 'Uploading...' : 'Upload Document'}
        </motion.button>
      </form>
      <ToastContainer />
    </motion.div>
  );
};

export default DocumentCenterForm;