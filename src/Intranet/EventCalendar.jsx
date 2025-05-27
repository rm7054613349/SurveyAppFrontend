import { motion } from 'framer-motion';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Framer Motion animation variants
const containerVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  hover: { scale: 1.05, transition: { duration: 0.3 } },
};

// Setup moment localizer for react-big-calendar
const localizer = momentLocalizer(moment);

// Dummy event data (replace with API data)
const events = [
  {
    id: 1,
    title: 'Team Meeting',
    start: new Date(2025, 4, 28, 10, 0), // May 28, 2025, 10:00 AM
    end: new Date(2025, 4, 28, 11, 0),
    location: 'Conference Room A',
  },
  {
    id: 2,
    title: 'Company Picnic',
    start: new Date(2025, 5, 10, 12, 0), // June 10, 2025, 12:00 PM
    end: new Date(2025, 5, 10, 15, 0),
    location: 'Central Park',
  },
  {
    id: 3,
    title: 'Innovation Workshop',
    start: new Date(2025, 5, 15, 14, 0), // June 15, 2025, 2:00 PM
    end: new Date(2025, 5, 15, 16, 0),
    location: 'Training Hall',
  },
  {
    id: 4,
    title: 'Q2 Review',
    start: new Date(2025, 6, 1, 9, 0), // July 1, 2025, 9:00 AM
    end: new Date(2025, 6, 1, 10, 30),
    location: 'Board Room',
  },
];

function EventCalendar() {
  // Custom event styling
  const eventStyleGetter = (event) => ({
    style: {
      backgroundColor: '#14b8a6', // teal-500
      color: 'white',
      borderRadius: '5px',
      border: 'none',
    },
  });

  // Custom date cell styling to highlight dates with events
  const dayPropGetter = (date) => {
    const hasEvent = events.some(
      (event) =>
        moment(date).isSame(event.start, 'day') ||
        moment(date).isSame(event.end, 'day')
    );
    return {
      className: hasEvent ? 'bg-teal-100 text-teal-800 font-semibold' : '',
    };
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">Event Calendar</h2>
      <div className="mb-6">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 400 }}
          eventPropGetter={eventStyleGetter}
          dayPropGetter={dayPropGetter}
          className="rbc-calendar"
          views={['month', 'week', 'day']}
          defaultView="month"
          popup
          selectable
        />
      </div>
      <div className="max-h-96 overflow-y-auto space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Upcoming Events</h3>
        {events.map((event) => (
          <motion.div
            key={event.id}
            className="bg-gray-50 p-4 rounded-lg border border-gray-200"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
          >
            <h4 className="text-md font-medium text-gray-800">{event.title}</h4>
            <p className="text-gray-600">
              {moment(event.start).format('MMMM Do YYYY, h:mm A')} -{' '}
              {moment(event.end).format('h:mm A')}
            </p>
            <p className="text-gray-600">Location: {event.location}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default EventCalendar;