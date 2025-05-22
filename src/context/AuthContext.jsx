import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { login as loginService, signup as signupService } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ id: payload.id, role: payload.role, email: payload.email });
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        toast.error('Invalid token, please log in again');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password, role) => {
    try {
      const data = await loginService(email, password, role);
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role); // Ensure role is stored
      setUser({ id: data.id, role: data.role, email: data.email });
      toast.success('Logged in successfully!');
      // navigate(role === 'admin' ? '/admin/dashboard' : '/employee/dashboard');
      navigate('/')
    } catch (err) {
      toast.error(err.message || 'Invalid credentials');
      throw err;
    }
  };

  const signup = async (email, password, role) => {
    try {
      const data = await signupService(email, password, role);
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role); // Ensure role is stored
      // setUser({ id: data.id, role: data.role, email: data.email });


      // Logic for Permitted Admins 
      const allowedAdmins = [import.meta.env.VITE_ADMIN_ACCESS_EMAIL];
      if (role === 'admin' && !allowedAdmins.includes(email)) {
        toast.error('Not authorized to sign up as admin');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setUser(null);
        // navigate('/login');
        return;
      }


      // Logic for Permitted Employee to login this app 
      // Logic for Permitted Employee to login this app 
       const allowedEmployee = [import.meta.env.VITE_EMPLOYEE_ACCESS_EMAIL];
       if (role === 'employee' && !allowedEmployee.includes(email)) {
        toast.error('Not authorized to sign up as employee');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setUser(null);
        // navigate('/login');
        return;
      }

       
      
      toast.success('Signed up successfully!');
      // navigate(role === 'admin' ? '/admin/dashboard' : '/employee/dashboard');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Signup failed');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setUser(null);
    toast.info('Logged out successfully');
    // navigate('/login');
    navigate('/')
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};