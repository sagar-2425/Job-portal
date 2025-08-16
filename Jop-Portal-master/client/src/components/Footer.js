import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaBriefcase, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGithub, FaLinkedin, FaTwitter, FaWhatsapp, FaMailBulk } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <Container>
        <Row className="footer-content">
          <Col lg={4} md={6} className="mb-4">
            <div className="footer-section">
              <div className="footer-brand mb-3">
                <FaBriefcase className="footer-icon" />
                <h5 className="footer-title">JobNest</h5>
              </div>
              <p className="footer-description">
                Connecting talented professionals with amazing opportunities. 
                Find your dream job or hire the perfect candidate.
              </p>
              <div className="social-links">
                <a href="https://github.com/yadam1298" className="social-link" title="GitHub" target="_blank" rel="noopener noreferrer">
                  <FaGithub />
                </a>
                <a href="https://www.linkedin.com/in/ynvnk" className="social-link" title="LinkedIn" target="_blank" rel="noopener noreferrer">
                  <FaLinkedin />
                </a>
                <a href="https://wa.me/919347772102" className="social-link" title="WhatsApp" target="_blank" rel="noopener noreferrer">
                  <FaWhatsapp />
                </a>
              </div>
            </div>
          </Col>

          <Col lg={2} md={6} className="mb-4">
            <div className="footer-section">
              <h6 className="footer-heading">For Job Seekers</h6>
              <ul className="footer-links">
                <li><Link to="/jobs">Browse Jobs</Link></li>
                <li><Link to="/register">Create Account</Link></li>
                <li><Link to="/profile">My Profile</Link></li>
                <li><Link to="/dashboard/seeker">Dashboard</Link></li>
              </ul>
            </div>
          </Col>

          <Col lg={2} md={6} className="mb-4">
            <div className="footer-section">
              <h6 className="footer-heading">For Employers</h6>
              <ul className="footer-links">
                <li><Link to="/register">Post a Job</Link></li>
                <li><Link to="/dashboard/recruiter">Recruiter Dashboard</Link></li>
                <li><Link to="/profile">Company Profile</Link></li>
                <li><Link to="/jobs">Browse Candidates</Link></li>
              </ul>
            </div>
          </Col>

          <Col lg={2} md={6} className="mb-4">
            <div className="footer-section">
              <h6 className="footer-heading">Resources</h6>
              <ul className="footer-links">
                <li><Link to="/jobs">Job Search Tips</Link></li>
                <li><Link to="/jobs">Career Advice</Link></li>
                <li><Link to="/jobs">Resume Builder</Link></li>
                <li><Link to="/jobs">Interview Prep</Link></li>
              </ul>
            </div>
          </Col>

          <Col lg={2} md={6} className="mb-4">
            <div className="footer-section">
              <h6 className="footer-heading">Contact</h6>
              <div className="contact-info">
                <div className="contact-item">
                  <FaMapMarkerAlt className="contact-icon" />
                  <span>Vijayawada, NTR District, Andhra Pradesh – 521108</span>
                </div>
                <div className="contact-item">
                  <FaMailBulk className="contact-icon" />
                  <span>22761a1264@gmail.com</span>
                </div>
                <div className="contact-item">
                  <FaPhone className="contact-icon" />
                  <span>+91-93477 72102</span>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        <Row className="footer-bottom">
          <Col>
            <div className="footer-divider"></div>
            <div className="footer-bottom-content">
              <p className="copyright">
                © {currentYear} JobNest. All rights reserved.
              </p>
              <div className="footer-bottom-links">
                <Link to="/jobs">Privacy Policy</Link>
                <Link to="/jobs">Terms of Service</Link>
                <Link to="/jobs">Cookie Policy</Link>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer; 