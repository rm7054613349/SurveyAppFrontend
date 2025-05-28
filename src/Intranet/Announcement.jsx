import React, { useState, useEffect } from 'react';
import { getMessages } from '../services/api';
import { toast } from 'react-toastify';

const Announcement = () => {
  const [activeTab, setActiveTab] = useState('announcements');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Format date to DD-MM-YYYY
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
  };

  // Fetch messages on component mount
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getMessages();
        setMessages(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
      } catch (err) {
        const errorMsg = err.message || 'Failed to fetch messages';
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  // Filter messages by type
  const filteredMessages = messages.filter(
    (msg) => msg.type === (activeTab === 'announcements' ? 'announcement' : 'cmd')
  );

  // Render messages
  const renderMessages = (messages) => {
    if (messages.length === 0) {
      return (
        <p className="text-gray-600 text-center text-sm sm:text-base">
          No {activeTab === 'announcements' ? 'announcements' : 'CMD messages'} found.
        </p>
      );
    }

    const latestMessage = messages[0];
    const otherMessages = messages.slice(1, 5);

    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Marquee for latest message */}
        <div className="bg-[#00ced1] p-3 rounded-md shadow-md overflow-hidden">
          <marquee
            behavior="scroll"
            direction="left"
            className="text-black font-medium text-sm sm:text-base"
            scrollamount="3"
            onMouseOver={(e) => e.target.stop()}
            onMouseOut={(e) => e.target.start()}
          >
            <span className="px-4">
              {formatDate(latestMessage.date)} - {latestMessage.title}: {latestMessage.content}
            </span>
          </marquee>
        </div>
        {/* Other messages with horizontal scroll */}
        <div className="overflow-x-auto flex space-x-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 snap-x snap-mandatory">
          {otherMessages.length === 0 ? (
            <p className="text-gray-600 text-sm sm:text-base flex-shrink-0">
              No additional {activeTab === 'announcements' ? 'announcements' : 'CMD messages'}.
            </p>
          ) : (
            otherMessages.map((msg) => (
              <div
                key={msg._id}
                className="bg-white p-3 sm:p-4 rounded-md shadow-md border border-gray-200 hover:bg-gray-50 transition-colors min-w-[280px] sm:min-w-[300px] flex-shrink-0 snap-center"
              >
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">{msg.title}</h3>
                <p className="text-gray-600 text-sm sm:text-base">{msg.content}</p>
                <p className="text-xs sm:text-sm text-black">{formatDate(msg.date)}</p>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="py-4 sm:py-6 px-4 sm:px-6">
      {/* Loading State */}
      {loading && (
        <div className="max-w-4xl mx-auto bg-white rounded-md shadow-md p-4 sm:p-6">
          <div className="flex justify-center py-6">
            <div className="flex items-center space-x-2">
              <svg
                className="animate-spin h-5 w-5 sm:h-6 sm:w-6 text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="text-black text-sm sm:text-base">Loading messages...</span>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="max-w-4xl mx-auto bg-white rounded-md shadow-md p-4 sm:p-6">
          <div className="bg-red-100 text-red-800 p-3 rounded-md text-sm sm:text-base">
            {error}
          </div>
        </div>
      )}

      {/* Tabs and Messages */}
      {!loading && !error && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#afeeee] p-1 rounded-full flex flex-wrap gap-2 mb-4 sm:mb-6">
            <button
              className={`flex-1 px-4 py-2 text-sm sm:text-base font-medium rounded-full ${
                activeTab === 'announcements'
                  ? 'bg-[#00ced1] text-white'
                  : 'text-gray-600 '
              }`}
              onClick={() => setActiveTab('announcements')}
            >
              Announcements
            </button>
            <button
              className={`flex-1 px-4 py-2 text-sm sm:text-base font-medium rounded-full ${
                activeTab === 'cmd' ? 'bg-[#00ced1] text-white' : 'text-gray-600 '
              }`}
              onClick={() => setActiveTab('cmd')}
            >
              CMD
            </button>
          </div>
          {renderMessages(filteredMessages)}
        </div>
      )}
    </div>
  );
};

export default Announcement;