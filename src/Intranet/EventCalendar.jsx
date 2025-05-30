import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getEvent } from '../services/api';

// Updated Custom CSS
const customStyles = `
  .rbc-month-view .rbc-day-bg {
    border-radius: 50%;
    margin: 4px auto;
    height: 38px;
    width: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    background-color: #f9fafb;
    aspect-ratio: 1/1; /* Ensure perfect circle */
    overflow: hidden; /* Prevent content overflow */
    cursor: pointer; /* Indicate clickable area */
    border: 1px solid #d1d5db; /* Thicker border for definition */
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
  }
  .rbc-month-view .rbc-day-bg.has-event {
    background-color: #b3e4e5; /* Light cyan for days with events */
    border-color: #14b8a6; /* Darker border for event days */
  }
  .rbc-month-view .rbc-date-cell {
    color: black;
    font-size: 14px;
    font-weight: 600; /* Bolder font for clarity */
    text-align: center;
    padding: 0;
    line-height: 38px;
    height: 38px;
    width: 38px;
    border-radius: 50%;
    aspect-ratio: 1/1; /* Ensure perfect circle */
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer; /* Indicate clickable area */
    background-color: transparent; /* No background conflict */
    z-index: 1; /* Text above background */
  }
  .rbc-month-view .rbc-date-cell a {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    text-decoration: none;
    color: inherit;
    line-height: inherit;
    border-radius: 50%;
  }
  .rbc-month-view .rbc-event {
    display: none;
  }
  .rbc-month-view .rbc-today {
    background-color: #dbeafe;
    border-color: #3b82f6; /* Blue border for today */
  }
  .rbc-month-view .rbc-selected, .rbc-month-view .rbc-day-bg.rbc-selected {
    background-color: #bfdbfe;
    color: #ffffff;
    border-color: #3b82f6; /* Consistent selected border */
  }
  .rbc-month-view .rbc-off-range-bg {
    background-color: #e5e7eb;
    opacity: 0.6;
  }
  .rbc-calendar {
    font-family: 'Inter', sans-serif;
  }
  .rbc-month-view .rbc-row {
    min-height: 48px; /* Increased row height for spacing */
  }
  .rbc-month-view .rbc-row-segment {
    padding: 4px; /* Add padding for spacing between cells */
  }
  .rbc-time-view .rbc-event {
    background-color: #14b8a6;
    color: white;
    border-radius: 4px;
    border: none;
    padding: 4px 6px;
    font-size: 12px;
    min-height: 40px;
    height: auto;
    line-height: 1.3;
    white-space: normal;
    word-wrap: break-word;
    width: 100%;
    box-sizing: border-box;
    cursor: pointer;
  }
  .rbc-time-view .rbc-events-container {
    width: 100%;
  }
  .rbc-time-view .rbc-event-label {
    font-size: 10px;
    color: #fff;
  }
  .rbc-time-view .rbc-time-slot.has-event {
    background-color: #00ced1; /* Cyan for time slots with events */
  }
  .rbc-time-view .rbc-time-slot {
    background-color: #f9fafb;
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
    color: #1f2937;
    text-align: center;
  }
  .custom-toolbar-controls {
    display: flex;
    flex-wrap: wrap;
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
    background-color: #f3f4f6;
    border: 1px solid #d1d5db;
    color: #374151;
    cursor: pointer;
    white-space: nowrap;
  }
  .custom-btn-group button:hover {
    background-color: #e5e7eb;
  }
  .custom-btn-group button.rbc-active {
    background-color: #00ced1;
    color: white;
    border-color: #00ced1;
  }
  .event-modal {
    max-height: 80vh;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #d1d5db #f9fafb;
    max-width: 450px;
    width: 90%;
    padding: 20px;
    position: relative;
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    margin: auto; /* Center horizontally */
  }
  .event-modal::-webkit-scrollbar {
    width: 6px;
  }
  .event-modal::-webkit-scrollbar-track {
    background: #f9fafb;
    border-radius: 4px;
  }
  .event-modal::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 4px;
  }
  .event-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 12px;
  }
  .event-modal-title {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
  }
  .event-item {
    background-color: #f9fafb;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-left: 4px solid #14b8a6; /* Visual hierarchy with colored border */
  }
  .event-item p {
    margin: 6px 0;
    line-height: 1.5;
    font-size: 13px;
    display: flex;
    flex-wrap: wrap;
  }
  .event-item .label {
    font-weight: 600;
    color: #1f2937;
    min-width: 80px; /* Align labels */
  }
  .event-item .value {
    color: #374151;
    flex: 1;
  }
  .close-icon {
    position: absolute;
    top: 16px;
    right: 16px;
    cursor: pointer;
    color: #374151;
    width: 24px;
    height: 24px;
    transition: color 0.2s ease;
  }
  .close-icon:hover {
    color: #1f2937;
  }
  @media (max-width: 640px) {
    .rbc-month-view .rbc-day-bg {
      height: 34px;
      width: 34px;
      margin: 3px auto;
      aspect-ratio: 1/1;
      overflow: hidden;
      border: 1px solid #d1d5db;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }
    .rbc-month-view .rbc-day-bg.has-event {
      background-color: #b3e4e5;
      border-color: #14b8a6;
    }
    .rbc-month-view .rbc-date-cell {
      font-size: 12px;
      line-height: 34px;
      height: 34px;
      width: 34px;
      aspect-ratio: 1/1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .rbc-month-view .rbc-row {
      min-height: 44px;
    }
    .rbc-month-view .rbc-row-segment {
      padding: 3px;
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
      padding: 16px;
      max-height: 75vh;
    }
    .rbc-calendar {
      height: 350px !important;
    }
    .rbc-time-view .rbc-event {
      font-size: 10px;
      padding: 3px 4px;
      min-height: 35px;
    }
    .close-icon {
      width: 20px;
      height: 20px;
    }
    .event-modal-title {
      font-size: 16px;
    }
    .event-item {
      padding: 10px;
    }
    .event-item p {
      font-size: 12px;
    }
  }
  @media (max-width: 400px) {
    .rbc-month-view .rbc-day-bg {
      height: 30px;
      width: 30px;
      margin: 2px auto;
      aspect-ratio: 1/1;
      overflow: hidden;
      border: 1px solid #d1d5db;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }
    .rbc-month-view .rbc-day-bg.has-event {
      background-color: #b3e4e5;
      border-color: #14b8a6;
    }
    .rbc-month-view .rbc-date-cell {
      font-size: 11px;
      line-height: 30px;
      height: 30px;
      width: 30px;
      aspect-ratio: 1/1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .rbc-month-view .rbc-row {
      min-height: 40px;
    }
    .rbc-month-view .rbc-row-segment {
      padding: 2px;
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
      padding: 12px;
      max-height: 70vh;
    }
    .rbc-calendar {
      height: 300px !important;
    }
    .rbc-time-view .rbc-event {
      font-size: 9px;
      padding: 2px 3px;
      min-height: 30px;
    }
    .close-icon {
      width: 18px;
      height: 18px;
    }
    .event-modal-title {
      font-size: 14px;
    }
    .event-item {
      padding: 8px;
    }
    .event-item p {
      font-size: 11px;
    }
  }
`;

// Framer Motion animation variants
const containerVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 50 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.8, y: 50, transition: { duration: 0.2 } },
};

// Setup moment localizer for react-big-calendar
const localizer = momentLocalizer(moment);

// Custom Toolbar Component
const CustomToolbar = ({ label, onNavigate, onView, view }) => {
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
            className={view === 'month' ? 'rbc-active' : ''}
          >
            Month
          </button>
          <button
            onClick={() => onView('day')}
            className={view === 'day' ? 'rbc-active' : ''}
          >
            Day
          </button>
        </div>
      </div>
    </div>
  );
};

// Custom Event Component
const CustomEvent = ({ event }) => (
  <div className="rbc-event-content">
    <div>{event.title}</div>
  </div>
);

function EventCalendar() {
  const [events, setEvents] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState('month');

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (selectedEvents.length > 0) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    // Cleanup on component unmount or modal close
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [selectedEvents]);

  // Fetch events and filter out past events
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const data = await getEvent();
        const currentDateTime = moment();
        const formattedEvents = data
          .filter((event) => moment(event.date).isSameOrAfter(currentDateTime, 'day'))
          .map((event) => ({
            id: event._id,
            type: event.type,
            title: event.title,
            content: event.content,
            start: new Date(event.date),
            end: new Date(event.date),
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

  // Custom event styling
  const eventStyleGetter = (event, start, end, isSelected) => ({
    style: {
      backgroundColor: '#14b8a6',
      color: 'white',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      padding: '4px 6px',
      fontSize: '12px',
      minHeight: '40px',
      width: '100%',
    },
  });

  // Updated date cell styling for month view
  const dayPropGetter = (date) => {
    const hasEvent = events.some((event) =>
      moment(date).isSame(event.start, 'day')
    );
    const isSelected = moment(date).isSame(currentDate, 'day') && currentView === 'day';
    return {
      className: `${hasEvent ? 'has-event' : ''} ${isSelected ? 'rbc-selected' : ''}`,
      style: {
        backgroundColor: isSelected ? '#bfdbfe' : hasEvent ? '#b3e4e5' : '#f9fafb',
        color: isSelected ? '#ffffff' : 'black',
      },
    };
  };

  // Slot styling for day view
  const slotPropGetter = (date) => {
    const hasEvent = events.some(
      (event) =>
        moment(date).isSameOrAfter(event.start) &&
        moment(date).isSameOrBefore(event.end)
    );
    return {
      className: hasEvent ? 'has-event' : '',
      style: { backgroundColor: hasEvent ? '#00ced1' : '#f9fafb' },
    };
  };

  // Updated slot selection to navigate to day view
  const handleSelectSlot = ({ start }) => {
    setCurrentDate(start); // Update current date
    setCurrentView('day'); // Switch to day view
    const selectedDate = moment(start).startOf('day');
    const eventsOnDate = events.filter((event) =>
      moment(event.start).isSame(selectedDate, 'day')
    );
    if (eventsOnDate.length > 0) {
      setSelectedEvents(eventsOnDate); // Show events in modal
    }
  };

  // Handle event click
  const handleSelectEvent = (event) => {
    if (currentView === 'day') {
      const selectedTime = moment(event.start);
      const eventsAtTime = events.filter((e) =>
        moment(e.start).isSame(selectedTime, 'minute')
      );
      setSelectedEvents(eventsAtTime);
    } else {
      setCurrentDate(event.start); // Update current date
      setCurrentView('day'); // Switch to day view
      setSelectedEvents([event]);
    }
  };

  // Handle navigation
  const handleNavigate = (newDate) => {
    setCurrentDate(newDate);
  };

  // Handle view change
  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  // Close modal
  const closeModal = () => {
    setSelectedEvents([]);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-xl shadow-lg p-3 sm:p-4 md:p-5 lg:p-6 max-w-[95%] sm:max-w-[90%] md:max-w-2xl lg:max-w-3xl mx-auto w-full"
    >
      <style>{customStyles}</style>

      {isLoading && <p className="text-gray-600 text-center">Loading events...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        date={currentDate}
        onNavigate={handleNavigate}
        style={{ height: '400px', minHeight: '320px' }}
        eventPropGetter={eventStyleGetter}
        dayPropGetter={dayPropGetter}
        slotPropGetter={slotPropGetter}
        className="rbc-calendar"
        views={['month', 'day']}
        defaultView="month"
        popup
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        onView={handleViewChange}
        components={{
          toolbar: CustomToolbar,
          event: CustomEvent,
        }}
        step={30}
        timeslots={2}
      />

      {/* Event Details Modal */}
      <AnimatePresence>
        {selectedEvents.length > 0 && (
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            role="dialog"
            aria-labelledby="event-details-title"
          >
            <div className="event-modal">
              <div className="event-modal-header">
                <h3
                  id="event-details-title"
                  className="event-modal-title"
                >
                  Events on {moment(selectedEvents[0].start).format('MMMM Do YYYY, h:mm A')}
                </h3>
                <svg
                  className="close-icon"
                  onClick={closeModal}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-label="Close event details"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>
              <div className="space-y-4">
                {selectedEvents.map((event) => (
                  <div key={event.id} className="event-item">
                    <p>
                      <span className="label">Type:</span>
                      <span className="value">{event.type}</span>
                    </p>
                    <p>
                      <span className="label">Title:</span>
                      <span className="value">{event.title}</span>
                    </p>
                    <p>
                      <span className="label">Content:</span>
                      <span className="value">{event.content}</span>
                    </p>
                    <p>
                      <span className="label">Date:</span>
                      <span className="value">{moment(event.start).format('MMMM Do YYYY, h:mm A')}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default EventCalendar;