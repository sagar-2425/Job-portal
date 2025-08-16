import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaBuilding } from 'react-icons/fa';
import toast from 'react-hot-toast';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'seeker'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      // Remove confirmPassword from the data sent to backend
      const { confirmPassword, ...registrationData } = formData;
      await register(registrationData);
      toast.success('Registration successful!');
      // Redirect to intended page or home
      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <div className="register-icon">
              <FaUser />
            </div>
            <h2 className="register-title">Create your account</h2>
            <p className="register-subtitle">
              Already have an account?{' '}
              <Link to="/login" className="link-primary">
                Sign in here
              </Link>
            </p>
          </div>
          
          <form className="register-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                <FaUser className="form-icon" />
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter your full name"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <FaEnvelope className="form-icon" />
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter your email"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="role" className="form-label">
                <FaBuilding className="form-icon" />
                I am a
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="form-control"
              >
                <option value="seeker">Job Seeker</option>
                <option value="recruiter">Recruiter</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <FaLock className="form-icon" />
                Password
              </label>
              <div className="password-input-group">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                <FaLock className="form-icon" />
                Confirm Password
              </label>
              <div className="password-input-group">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="register-btn"
            >
              {loading ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <span>Creating account...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="login-link">
            <p>Already have an account?</p>
            <Link to="/login" className="login-btn-secondary">
              Sign in to existing account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 