import { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { pageTransition, buttonHover, fadeIn } from '../animations/framerAnimations';
import LoadingSpinner from '../components/LoadingSpinner';

function Signup() {
  const { signup } = useContext(AuthContext);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [signupError, setSignupError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setSignupError(null);
      await signup(data.email, data.password, data.role);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setSignupError(err.message || 'Signup failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <motion.div
        {...fadeIn}
        className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900"
      >
        <LoadingSpinner />
      </motion.div>
    );
  }

  return (
    <motion.div {...pageTransition} className="container mx-auto p-6 max-w-md content-box">
      <motion.h2 {...fadeIn} className="text-3xl font-bold mb-6 text-primary-blue">Signup</motion.h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-card-bg dark:bg-card-dark-bg p-8 rounded-lg shadow-lg content-box">
        <motion.div {...fadeIn} transition={{ delay: 0.1 }}>
          <label className="block mb-2 text-gray-700 dark:text-gray-300">Email</label>
          <input
            type="email"
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' }
            })}
            className="w-full p-3 border rounded dark:bg-gray-800 dark:text-white"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </motion.div>
        <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
          <label className="block mb-2 text-gray-700 dark:text-gray-300">Password</label>
          <input
            type="password"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' },
              pattern: {
                value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,
                message: 'Password must contain at least one letter and one number'
              }
            })}
            className="w-full p-3 border rounded dark:bg-gray-800 dark:text-white"
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </motion.div>
        <motion.div {...fadeIn} transition={{ delay: 0.3 }}>
          <label className="block mb-2 text-gray-700 dark:text-gray-300">Role</label>
          <select
            {...register('role', { required: 'Role is required' })}
            className="w-full p-3 border rounded dark:bg-gray-800 dark:text-white"
          >
            <option value="">Select Role</option>
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
          </select>
          {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>}
        </motion.div>
        <motion.button
          whileHover={buttonHover}
          {...fadeIn}
          transition={{ delay: 0.4 }}
          type="submit"
          className="w-full bg-primary-blue text-white p-3 rounded-lg"
        >
          Signup
        </motion.button>
        {signupError && (
          <motion.div
            {...fadeIn}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <p className="text-red-500 mb-2">{signupError} Already have an account?</p>
            <Link to="/login">
              <motion.button
                whileHover={buttonHover}
                className="bg-accent-orange text-white p-2 rounded-lg"
              >
                Go to Login
              </motion.button>
            </Link>
          </motion.div>
        )}
      </form>
    </motion.div>
  );
}

export default Signup;