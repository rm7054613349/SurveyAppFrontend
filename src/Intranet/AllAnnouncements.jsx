import React from 'react';
import { Link } from 'react-router-dom';

// Using the same dummy data for consistency
const allAnnouncements = [
  { id: 1, title: 'Company Picnic', content: 'Join us for a fun-filled picnic on June 10, 2025 at Central Park!', date: '2025-05-20', type: 'Announcement' },
  { id: 2, title: 'New HR Policy', content: 'Updated HR policies effective from June 1, 2025.', date: '2025-05-18', type: 'Announcement' },
  { id: 3, title: 'Team Meeting', content: 'Mandatory team meeting on May 28, 2025 at 10 AM.', date: '2025-05-15', type: 'Announcement' },
  { id: 4, title: 'Office Renovation', content: 'Office renovation starts on June 15, 2025.', date: '2025-05-10', type: 'Announcement' },
  { id: 5, title: 'Holiday Schedule', content: '2025 holiday schedule released.', date: '2025-05-05', type: 'Announcement' },
  { id: 6, title: 'CMD Note', content: 'Great job on Q1 targets, team!', date: '2025-05-22', type: 'CMD Message' },
  { id: 7, title: 'Strategic Update', content: 'New strategic goals for Q2 announced.', date: '2025-05-19', type: 'CMD Message' },
  { id: 8, title: 'Leadership Meet', content: 'Leadership meeting outcomes shared.', date: '2025-05-16', type: 'CMD Message' },
  { id: 9, title: 'Innovation Drive', content: 'Submit your ideas for the innovation drive.', date: '2025-05-12', type: 'CMD Message' },
  { id: 10, title: 'Welcome New Hires', content: 'Warm welcome to our new team members!', date: '2025-05-08', type: 'CMD Message' },
];

const AllAnnouncements = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">All Announcements</h1>
        <div className="space-y-4">
          {allAnnouncements.map((announcement) => (
            <div key={announcement.id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">{announcement.title}</h3>
              <p className="text-gray-600">{announcement.content}</p>
              <p className="text-sm text-gray-400">{announcement.date} - {announcement.type}</p>
            </div>
          ))}
        </div>
        <Link to="/announcements">
          <button className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-300">
            Back to Announcements
          </button>
        </Link>
      </div>
    </div>
  );
};

export default AllAnnouncements;