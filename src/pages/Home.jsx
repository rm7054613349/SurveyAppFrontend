import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { pageTransition, fadeIn, buttonHover, cardAnimation } from '../animations/framerAnimations';

function Home() {
  const navigate = useNavigate();

  // Check login status on component mount to prevent access to home page if logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    console.log('Home: Checking login status on mount - Token:', token, 'Role:', role);

    // If user is logged in, redirect based on role immediately
    if (token) {
      console.log('Home: User is logged in. Redirecting based on role...');
      if (role === 'admin') {
        navigate('/');
      } else if (role === 'employee') {
        navigate('/');
      } else {
        console.warn('Home: Unknown role detected:', role);
        navigate('/login'); // Fallback for unknown roles
      }
    } else {
      console.log('Home: User is not logged in. Rendering home page.');
    }
  }, [navigate]);

  // Handle "Get Started" button click
  const handleGetStarted = () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    console.log('Home: Get Started clicked - Token:', token, 'Role:', role);

    if (!token) {
      console.log('Home: User not logged in. Redirecting to /login...');
      navigate('/login');
    } else {
      console.log('Home: User logged in. Redirecting based on role...');
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'employee') {
        navigate('/employee/dashboard');
      } else {
        console.warn('Home: Unknown role detected:', role);
        navigate('/login');
      }
    }
  };

  

  // Render the home page for non-logged-in users
  return (
    <motion.div {...pageTransition} className="container mx-auto p-6 text-center content-box">
      <motion.h1
        {...fadeIn}
        className="text-5xl font-bold mb-6 text-primary-blue"
      >
        Welcome to Intranet World 
      </motion.h1>
      <motion.p
        {...fadeIn}
        transition={{ delay: 0.2 }}
        className="text-xl text-gray-700 dark:text-gray-300 mb-8"
      >
        Engage, Analyze, and Improve with our cutting-edge survey platform.
      </motion.p>
      <motion.div
        {...fadeIn}
        transition={{ delay: 0.4 }}
        className="flex justify-center space-x-4"
      >
        {/* Get Started Button
        <motion.button
          whileHover={buttonHover}
          onClick={handleGetStarted}
          className="bg-primary-blue text-white px-6 py-3 rounded-full text-lg"
        >
          Get Started
        </motion.button> */}
      </motion.div>
    </motion.div>
  );
}

export default Home;