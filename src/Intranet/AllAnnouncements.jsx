import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMessages } from '../services/api';
import { toast } from 'react-toastify';

const AllAnnouncements = () => {
  const [activeTab, setActiveTab] = useState('all');
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

  // Filter messages based on active tab
  const filteredMessages = activeTab === 'all'
    ? messages
    : messages.filter((msg) => msg.type === (activeTab === 'announcements' ? 'announcement' : 'cmd'));

  return (
    <div className="min-h-screen bg-[#afeeee] py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
          All Announcements
        </h1>

        {/* Loading State */}
        {loading && (
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
              <span className="text-gray-600 text-sm sm:text-base">Loading messages...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 text-red-800 p-3 rounded-md mb-4 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Tabs */}
        {!loading && !error && (
          <div className="flex flex-wrap border-b border-gray-300 mb-4 gap-2 sm:gap-0">
            <button
              className={`px-3 py-2 sm:px-4 sm:py-2 font-medium text-sm sm:text-base ${
                activeTab === 'all'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-blue-500'
              }`}
              onClick={() => setActiveTab('all')}
            >
              All
            </button>
            <button
              className={`px-3 py-2 sm:px-4 sm:py-2 font-medium text-sm sm:text-base ${
                activeTab === 'announcements'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-blue-500'
              }`}
              onClick={() => setActiveTab('announcements')}
            >
              Announcements
            </button>
            <button
              className={`px-3 py-2 sm:px-4 sm:py-2 font-medium text-sm sm:text-base ${
                activeTab === 'cmd'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-blue-500'
              }`}
              onClick={() => setActiveTab('cmd')}
            >
              CMD Messages
            </button>
          </div>
        )}

        {/* Messages */}
        {!loading && !error && (
          <div className="space-y-4">
            {filteredMessages.length === 0 ? (
              <p className="text-gray-600 text-center text-sm sm:text-base">
                No {activeTab === 'all' ? 'messages' : activeTab === 'announcements' ? 'announcements' : 'CMD messages'} found.
              </p>
            ) : (
              filteredMessages.map((msg) => (
                <div
                  key={msg._id || msg.id}
                  className="bg-white p-3 sm:p-4 rounded-lg shadow border border-gray-200"
                >
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800">{msg.title}</h3>
                  <p className="text-gray-600 text-sm sm:text-base">{msg.content}</p>
                  <p className="text-xs sm:text-sm text-gray-400">
                    {formatDate(msg.date)} - {msg.type === 'announcement' ? 'Announcement' : 'CMD Message'}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Back Button */}
        {!loading && !error && (
          <Link to="/">
            <button className="mt-4 sm:mt-6 bg-blue-500 text-white px-4 sm:px-6 py-2 rounded-md hover:bg-blue-600 transition-colors shadow-sm hover:shadow-md text-sm sm:text-base">
              Back to Announcements
            </button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default AllAnnouncements;