import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Dummy data for Announcements and CMD Messages
const dummyAnnouncements = [
  { id: 1, title: 'Company Picnic', content: 'Join us for a fun-filled picnic on June 10, 2025 at Central Park!', date: '2025-05-20' },
  { id: 2, title: 'New HR Policy', content: 'Updated HR policies effective from June 1, 2025.', date: '2025-05-18' },
  { id: 3, title: 'Team Meeting', content: 'Mandatory team meeting on May 28, 2025 at 10 AM.', date: '2025-05-15' },
  { id: 4, title: 'Office Renovation', content: 'Office renovation starts on June 15, 2025.', date: '2025-05-10' },
  { id: 5, title: 'Holiday Schedule', content: '2025 holiday schedule released.', date: '2025-05-05' },
];

const dummyCMDMessages = [
  { id: 1, title: 'CMD Note', content: 'Great job on Q1 targets, team!', date: '2025-05-22' },
  { id: 2, title: 'Strategic Update', content: 'New strategic goals for Q2 announced.', date: '2025-05-19' },
  { id: 3, title: 'Leadership Meet', content: 'Leadership meeting outcomes shared.', date: '2025-05-16' },
  { id: 4, title: 'Innovation Drive', content: 'Submit your ideas for the innovation drive.', date: '2025-05-12' },
  { id: 5, title: 'Welcome New Hires', content: 'Warm welcome to our new team members!', date: '2025-05-08' },
];

const Announcement = () => {
  const [activeTab, setActiveTab] = useState('announcements');

  // Function to render latest 5 messages with marquee for the latest one
  const renderMessages = (messages) => {
    const latestMessage = messages[0]; // Latest message for marquee
    const otherMessages = messages.slice(1, 5); // Next 4 messages

    return (
      <div className="space-y-4">
        {/* Marquee for the latest message */}
        <div className="bg-blue-100 p-4 rounded-lg shadow-md overflow-hidden">
          <marquee behavior="scroll" direction="left" className="text-blue-800 font-semibold">
            <span>{latestMessage.date} - {latestMessage.title}: {latestMessage.content}</span>
          </marquee>
        </div>
        {/* Other messages */}
        {otherMessages.map((msg) => (
          <div key={msg.id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">{msg.title}</h3>
            <p className="text-gray-600">{msg.content}</p>
            <p className="text-sm text-gray-400">{msg.date}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Announcements</h1>

        {/* Tabs */}
        <div className="flex border-b border-gray-300 mb-6">
          <button
            className={`px-6 py-2 text-lg font-medium ${
              activeTab === 'announcements'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('announcements')}
          >
            Announcements
          </button>
          <button
            className={`px-6 py-2 text-lg font-medium ${
              activeTab === 'cmd'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('cmd')}
          >
            CMD Messages
          </button>
        </div>

        {/* Messages */}
        <div className="mb-6">
          {activeTab === 'announcements'
            ? renderMessages(dummyAnnouncements)
            : renderMessages(dummyCMDMessages)}
        </div>

        {/* Check All Announcements Button */}
        <Link to="/all-announcements">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-300">
            Check All Announcements
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Announcement;