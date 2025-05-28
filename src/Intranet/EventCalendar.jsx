import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getEvent } from '../services/api'; // Import the getEvent API

// Custom CSS for circular dates, custom toolbar, highlights, and modal
const customStyles = `
  .rbc-month-view .rbc-day-bg {
    border-radius: 50%;
    margin: 4px auto;
    height: 34px;
    width: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    box-sizing: border-box;
    background-color: #f9fafb; /* gray-50 for lighter background */
  }
  .rbc-month-view .rbc-date-cell {
    color: #2563eb; /* blue-600 */
    font-size: 13px;
    font-weight: 500;
    text-align: center;
    padding: 0;
    line-height: 34px;
    height: 100%;
    width: 100%;
  }
  .rbc-month-view .rbc-date-cell a {
    display: block;
    width: 100%;
    height: 100%;
    text-decoration: none;
    color: inherit;
    line-height: inherit;
  }
  .rbc-month-view .rbc-event {
    display: none; /* Hide events in month view */
  }
  .rbc-month-view .rbc-day-bg.has-event {
    background-color: rgb(37, 235, 235); /* cyan for event dates */
  }
  .rbc-month-view .rbc-today {
    background-color: #dbeafe; /* blue-100 for today's date */
  }
  .rbc-month-view .rbc-selected {
    background-color: #bfdbfe; /* blue-200 for selected date */
    color: #ffffff; /* white text for selected date */
  }
  .rbc-calendar {
    font-family: 'Inter', sans-serif;
  }
  .rbc-month-view .rbc-row {
    min-height: 46px;
  }
  .rbc-month-view .rbc-month-row {
    overflow: hidden;
  }
  .custom-toolbar {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    padding: 0 6px;
  }
  .custom-toolbar-label {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937; /* gray-800 */
    text-align: center;
  }
  .custom-toolbar-controls {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
  .custom-btn-group {
    display: flex;
    gap: 4px;
  }
  .custom-btn-group button {
    padding: 3px 8px;
    font-size: 12px;
    line-height: 1.4;
    border-radius: 5px;
    background-color: #f3f4f6; /* gray-100 */
    border: 1px solid #d1d5db; /* gray-300 */
    color: #374151; /* gray-700 */
    cursor: pointer;
    white-space: nowrap;
  }
  .custom-btn-group button:hover {
    background-color: #e5e7eb; /* gray-200 */
  }
  .custom-btn-group button.rbc-active {
    background-color: #2563eb; /* blue-600 */
    color: white;
    border-color: #2563eb;
  }
  .event-modal {
    max-height: 80vh;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #d1d5db #f9fafb;
  }
  .event-modal::-webkit-scrollbar {
    width: 8px;
  }
  .event-modal::-webkit-scrollbar-track {
    background: #f9fafb;
  }
  .event-modal::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 4px;
  }
  .event-item {
    background-color: #f9fafb; /* gray-50 */
    border-radius: 6px;
    padding: 12px;
    margin-bottom: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  .event-item p {
    margin: 4px 0;
    line-height: 1.5;
  }
  .event-item .label {
    font-weight: 600;
    color: #1f2937; /* gray-800 */
  }
  @media (max-width: 640px) {
    .rbc-month-view .rbc-day-bg {
      height: 30px;
      width: 30px;
      margin: 2px auto;
    }
    .rbc-month-view .rbc-date-cell {
      font-size: 12px;
      line-height: 30px;
    }
    .rbc-month-view .rbc-row {
      min-height: 40px;
    }
    .custom-toolbar {
      gap: 6px;
      padding: 0 4px;
    }
    .custom-toolbar-label {
      font-size: 14px;
    }
    .custom-btn-group button {
      padding: 2px 6px;
      font-size: 11px;
    }
    .event-modal {
      max-width: 90%;
    }
  }
  @media (max-width: 400px) {
    .rbc-month-view .rbc-day-bg {
      height: 26px;
      width: 26px;
      margin: 1px auto;
    }
    .rbc-month-view .rbc-date-cell {
      font-size: 10px;
      line-height: 26px;
    }
    .rbc-month-view .rbc-row {
      min-height: 34px;
    }
    .custom-toolbar {
      gap: 4px;
      padding: 0 3px;
    }
    .custom-toolbar-label {
      font-size: 13px;
    }
    .custom-btn-group button {
      padding: 2px 5px;
      font-size: 10px;
    }
    .event-modal {
      max-width: 95%;
    }
  }
`;

// Framer Motion animation variants
const containerVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
};

// Setup moment localizer for react-big-calendar
const localizer = momentLocalizer(moment);

// Custom Toolbar Component
const CustomToolbar = ({ label, onNavigate, onView }) => {
  return (
    <div className="custom-toolbar">
      <div className="custom-toolbar-label">{label}</div>
      <div className="custom-toolbar-controls">
        <div className="custom-btn-group">
          <button onClick={() => onNavigate('TODAY')}>Today</button>
          <button onClick={() => onNavigate('PREV')}>Back</button>
          <button onClick={() => onNavigate('NEXT')}>Next</button>
        </div>
        <div className="custom-btn-group">
          <button
            onClick={() => onView('month')}
            className={onView.current === 'month' ? 'rbc-active' : ''}
          >
            Month
          </button>
          <button
            onClick={() => onView('week')}
            className={onView.current === 'week' ? 'rbc-active' : ''}
          >
            Week
          </button>
          <button
            onClick={() => onView('day')}
            className={onView.current === 'day' ? 'rbc-active' : ''}
          >
            Day
          </button>
        </div>
      </div>
    </div>
  );
};

function EventCalendar() {
  const [events, setEvents] = useState([]);
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date()); // Current date: May 28, 2025, 3:06 PM IST

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const data = await getEvent();
        // Map API response to calendar event format
        const formattedEvents = data.map((event) => ({
          id: event._id, // Use _id from MongoDB
          type: event.type,
          title: event.title,
          content: event.content,
          start: new Date(event.date), // Parse date-time for calendar
          end: new Date(event.date), // Single-day events
        }));
        setEvents(formattedEvents);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Custom event styling (for week/day views)
  const eventStyleGetter = (event) => ({
    style: {
      backgroundColor: '#14b8a6', // teal-500
      color: 'white',
      borderRadius: '5px',
      border: 'none',
      cursor: 'pointer',
      padding: '4px 8px',
    },
  });

  // Custom date cell styling to highlight dates with events
  const dayPropGetter = (date) => {
    const hasEvent = events.some((event) =>
      moment(date).isSame(event.start, 'day')
    );
    return {
      className: hasEvent ? 'has-event' : '',
    };
  };

  // Handle date selection to show events for that day
  const handleSelectSlot = ({ start }) => {
    const selectedDate = moment(start).startOf('day');
    const eventsOnDate = events.filter((event) =>
      moment(event.start).isSame(selectedDate, 'day')
    );
    if (eventsOnDate.length > 0) {
      setSelectedDateEvents(eventsOnDate);
    }
  };

  // Handle navigation
  const handleNavigate = (newDate) => {
    setCurrentDate(newDate);
  };

  // Close modal
  const closeModal = () => {
    setSelectedDateEvents([]);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-xl shadow-lg p-4 max-w-lg mx-auto w-full"
    >
      <style>{customStyles}</style>

      {isLoading && <p className="text-gray-600 text-center">Loading events...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}

      <div className="overflow-hidden">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          date={currentDate}
          onNavigate={handleNavigate}
          style={{ height: '400px', minHeight: '300px' }}
          eventPropGetter={eventStyleGetter}
          dayPropGetter={dayPropGetter}
          className="rbc-calendar"
          views={['month', 'week', 'day']}
          defaultView="month"
          popup
          selectable
          onSelectSlot={handleSelectSlot}
          components={{
            toolbar: CustomToolbar,
          }}
        />
      </div>

      {/* Event Details Modal */}
      <AnimatePresence>
        {selectedDateEvents.length > 0 && (
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            role="dialog"
            aria-labelledby="event-details-title"
          >
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 event-modal">
              <h3
                id="event-details-title"
                className="text-xl font-semibold text-gray-800 mb-4"
              >
                Events on {moment(selectedDateEvents[0].start).format('MMMM Do YYYY')}
              </h3>
              <div className="space-y-4">
                {selectedDateEvents.map((event) => (
                  <div key={event.id} className="event-item">
                    <p className="text-sm">
                      <span className="label">Type:</span> {event.type}
                    </p>
                    <p className="text-sm">
                      <span className="label">Title:</span> {event.title}
                    </p>
                    <p className="text-sm">
                      <span className="label">Content:</span> {event.content}
                    </p>
                    <p className="text-sm">
                      <span className="label">Date:</span>{' '}
                      {moment(event.start).format('MMMM Do YYYY, h:mm A')}
                    </p>
                  </div>
                ))}
              </div>
              <button
                onClick={closeModal}
                className="mt-6 w-full bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 text-sm font-medium"
                aria-label="Close event details"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default EventCalendar;