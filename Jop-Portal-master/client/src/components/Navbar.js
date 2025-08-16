import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaSignOutAlt, FaBriefcase, FaHome, FaSearch, FaUserShield } from 'react-icons/fa';
import { Navbar, Nav, Container, Button, Dropdown, Form } from 'react-bootstrap';
import './Navbar.css';

const NavigationBar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsExpanded(false);
  };

  const handleNavClick = () => {
    setIsExpanded(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <Navbar 
      bg="light" 
      variant="light"
      expand="lg" 
      className="navbar-custom sticky-top shadow-sm"
      expanded={isExpanded}
      onToggle={() => setIsExpanded(!isExpanded)}
    >
      <Container>
        {/* Brand */}
        <Navbar.Brand as={Link} to="/" className="navbar-brand-custom">
          <FaBriefcase className="me-2" />
          JobNest
        </Navbar.Brand>

        {/* Mobile Toggle */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        {/* Navigation Items */}
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link 
              as={Link} 
              to="/" 
              className={`nav-link-custom ${isActive('/') ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              <FaHome className="me-1" />
              Home
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/jobs" 
              className={`nav-link-custom ${isActive('/jobs') ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              <FaSearch className="me-1" />
              Jobs
            </Nav.Link>
          </Nav>

          {/* Right Side Navigation */}
          <Nav className="ms-auto">
            {isAuthenticated ? (
              <>
                {/* Dashboard Links */}
                {user?.role === 'seeker' && (
                  <Nav.Link 
                    as={Link} 
                    to="/dashboard/seeker" 
                    className={`nav-link-custom ${isActive('/dashboard/seeker') ? 'active' : ''}`}
                    onClick={handleNavClick}
                  >
                    <FaUser className="me-1" />
                    Dashboard
                  </Nav.Link>
                )}
                {user?.role === 'recruiter' && (
                  <Nav.Link 
                    as={Link} 
                    to="/dashboard/recruiter" 
                    className={`nav-link-custom ${isActive('/dashboard/recruiter') ? 'active' : ''}`}
                    onClick={handleNavClick}
                  >
                    <FaUser className="me-1" />
                    Dashboard
                  </Nav.Link>
                )}
                {user?.role === 'admin' && (
                  <Nav.Link 
                    as={Link} 
                    to="/dashboard/admin" 
                    className={`nav-link-custom ${isActive('/dashboard/admin') ? 'active' : ''}`}
                    onClick={handleNavClick}
                  >
                    <FaUserShield className="me-1" />
                    Admin Panel
                  </Nav.Link>
                )}

                {/* User Dropdown */}
                <Dropdown align="end">
                  <Dropdown.Toggle variant="outline-primary" id="dropdown-basic" className="user-dropdown">
                    <FaUser className="me-1" />
                    {user?.name || 'User'}
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="dropdown-menu-custom">
                    <Dropdown.Item as={Link} to="/profile" onClick={handleNavClick}>
                      <FaUser className="me-2" />
                      Profile
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout} className="text-danger">
                      <FaSignOutAlt className="me-2" />
                      Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            ) : (
              <>
                <Nav.Link 
                  as={Link} 
                  to="/login" 
                  className="nav-link-custom"
                  onClick={handleNavClick}
                >
                  Login
                </Nav.Link>
                <Button 
                  as={Link} 
                  to="/register" 
                  variant="primary" 
                  className="ms-2"
                  onClick={handleNavClick}
                >
                  Register
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar; 