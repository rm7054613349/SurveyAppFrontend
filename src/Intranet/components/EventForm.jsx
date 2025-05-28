import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { createEvent } from '../../services/api';
import { toast } from 'react-toastify';

const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const EventForm = () => {
  const [messageType, setMessageType] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = async (data) => {
    if (!messageType) {
      setErrorMessage('Please select an event type');
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }
    setSuccessMessage('');
    setErrorMessage('');
    setIsLoading(true);
    try {
      // Combine date and time into a single ISO string
      const eventDateTime = new Date(`${data.date}T${data.time}:00`).toISOString();
      await createEvent({ 
        type: messageType,
        title: data.title,
        content: data.content,
        date: eventDateTime
      });
      setSuccessMessage('Event created successfully!');
      reset();
      setMessageType('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      const errorMsg = error.message || 'Error creating event';
      setErrorMessage(errorMsg);
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      variants={formVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-[#afeeee] flex items-center justify-center p-6"
    >
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 space-y-4">
        {successMessage && (
          <div className="bg-teal-50 text-teal-800 p-3 rounded-md text-sm font-medium">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="bg-red-50 text-red-800 p-3 rounded-md text-sm font-medium">
            {errorMessage}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Event Type
          </label>
          <select
            value={messageType}
            onChange={(e) => setMessageType(e.target.value)}
            className={`w-full p-2 border ${
              errors.messageType ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100`}
            disabled={isLoading}
          >
            <option value="" disabled>
              Select an event type
            </option>
            <option value="event">Event</option>
            <option value="workshop">Workshop</option>
            <option value="seminar">Seminar</option>
          </select>
          {errors.messageType && (
            <p className="text-red-500 text-xs mt-1">{errors.messageType.message}</p>
          )}
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Title
            </label>
            <input
              type="text"
              {...register('title', { required: 'Event title is required' })}
              className={`w-full p-2 border ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100`}
              disabled={isLoading}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Description
            </label>
            <textarea
              {...register('content', { required: 'Event description is required' })}
              className={`w-full p-2 border ${
                errors.content ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100`}
              rows="4"
              disabled={isLoading}
            />
            {errors.content && (
              <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Date
            </label>
            <input
              type="date"
              {...register('date', { required: 'Event date is required' })}
              className={`w-full p-2 border ${
                errors.date ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100`}
              disabled={isLoading}
            />
            {errors.date && (
              <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Time
            </label>
            <input
              type="time"
              {...register('time', { required: 'Event time is required' })}
              className={`w-full p-2 border ${
                errors.time ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100`}
              disabled={isLoading}
            />
            {errors.time && (
              <p className="text-red-500 text-xs mt-1">{errors.time.message}</p>
            )}
          </div>
          <motion.button
            type="submit"
            className={`w-full py-2 px-4 text-white text-sm font-medium rounded-md ${
              isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
            } transition-colors shadow-sm hover:shadow-md`}
            whileHover={{ scale: isLoading ? 1 : 1.03 }}
            whileTap={{ scale: isLoading ? 1 : 0.97 }}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
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
                Submitting...
              </div>
            ) : (
              'Submit Event'
            )}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

export default EventForm;