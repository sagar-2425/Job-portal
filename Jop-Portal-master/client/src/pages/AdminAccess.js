import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaUserShield, FaLock, FaArrowLeft } from 'react-icons/fa';
import './AdminAccess.css';

const AdminAccess = () => {
  // Remove any import or usage of '../context/ThemeContext' and useTheme

  return (
    <div className="admin-access-page">
      <Container>
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col lg={6} md={8} sm={10}>
            <Card className="admin-access-card">
              <Card.Body className="p-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <div className="admin-icon-wrapper mb-3">
                    <FaUserShield className="admin-icon" />
                  </div>
                  <h2 className="admin-title">Admin Access</h2>
                  <p className="admin-subtitle">Restricted Area</p>
                </div>

                {/* Access Options */}
                <div className="access-options">
                  <Button
                    as={Link}
                    to="/admin/login"
                    variant="primary"
                    size="lg"
                    className="access-btn w-100 mb-3"
                  >
                    <FaLock className="me-2" />
                    Admin Login
                  </Button>
                  
                  <div className="text-center">
                    <Link to="/" className="back-link">
                      <FaArrowLeft className="me-2" />
                      Back to Main Site
                    </Link>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="security-notice mt-4">
                  <div className="alert alert-warning">
                    <strong>Security Notice:</strong> This area is restricted to authorized administrators only. 
                    Unauthorized access attempts will be logged and monitored.
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminAccess; 