import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FaUserShield, FaEye, FaEyeSlash, FaLock, FaEnvelope } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './AdminLogin.css';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await login(formData.email, formData.password);
      
      // Check if user is admin
      if (response.user.role !== 'admin') {
        toast.error('Access denied. Admin privileges required.');
        return;
      }

      toast.success('Admin login successful!');
      navigate('/dashboard/admin');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page light">
      <Container>
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col lg={5} md={7} sm={9}>
            <Card className="admin-login-card">
              <Card.Body className="p-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <div className="admin-icon-wrapper mb-3">
                    <FaUserShield className="admin-icon" />
                  </div>
                  <h2 className="admin-title">Admin Login</h2>
                  <p className="admin-subtitle">Access the admin dashboard</p>
                </div>

                {/* Login Form */}
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label">
                      <FaEnvelope className="me-2" />
                      Email Address
                    </Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter admin email"
                      className="form-control-custom"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="form-label">
                      <FaLock className="me-2" />
                      Password
                    </Form.Label>
                    <div className="password-input-group">
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter password"
                        className="form-control-custom"
                        required
                      />
                      <Button
                        type="button"
                        variant="outline-secondary"
                        className="password-toggle-btn"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </Button>
                    </div>
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="primary"
                    className="admin-login-btn w-100"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Logging in...
                      </>
                    ) : (
                      'Login as Admin'
                    )}
                  </Button>
                </Form>

                {/* Demo Credentials */}
                <Alert variant="info" className="mt-4">
                  <h6 className="alert-heading">Demo Admin Credentials:</h6>
                  <p className="mb-1"><strong>Email:</strong> admin@jobnest.com</p>
                  <p className="mb-0"><strong>Password:</strong> admin123</p>
                </Alert>

                {/* Back to Main Site */}
                <div className="text-center mt-4">
                  <Link to="/" className="back-link">
                    ← Back to Main Site
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminLogin; 