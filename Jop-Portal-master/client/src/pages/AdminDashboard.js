import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Modal, Form, Alert } from 'react-bootstrap';
import { FaUsers, FaBriefcase, FaFileAlt, FaChartBar, FaTrash, FaEdit, FaEye, FaUserShield } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalApplications: 0,
    activeRecruiters: 0
  });
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // In a real app, you'd have admin-specific API endpoints
      // For now, we'll simulate the data
      setStats({
        totalUsers: 25,
        totalJobs: 45,
        totalApplications: 120,
        activeRecruiters: 8
      });

      // Simulate loading users, jobs, and applications
      setTimeout(() => {
        setUsers([
          { id: 1, name: 'John Doe', email: 'john@example.com', role: 'seeker', status: 'active', createdAt: '2024-01-15' },
          { id: 2, name: 'Jane Smith', email: 'jane@company.com', role: 'recruiter', status: 'active', createdAt: '2024-01-10' },
          { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'seeker', status: 'inactive', createdAt: '2024-01-05' },
        ]);

        setJobs([
          { id: 1, title: 'Senior Developer', company: 'TechCorp', status: 'active', applications: 15, createdAt: '2024-01-20' },
          { id: 2, title: 'UI/UX Designer', company: 'DesignStudio', status: 'active', applications: 8, createdAt: '2024-01-18' },
          { id: 3, title: 'Product Manager', company: 'StartupXYZ', status: 'inactive', applications: 5, createdAt: '2024-01-12' },
        ]);

        setApplications([
          { id: 1, jobTitle: 'Senior Developer', applicant: 'John Doe', status: 'applied', createdAt: '2024-01-22' },
          { id: 2, jobTitle: 'UI/UX Designer', applicant: 'Alice Johnson', status: 'interviewed', createdAt: '2024-01-21' },
          { id: 3, jobTitle: 'Product Manager', applicant: 'Mike Brown', status: 'hired', createdAt: '2024-01-19' },
        ]);

        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        // API call to delete user
        toast.success('User deleted successfully');
        setUsers(users.filter(user => user.id !== userId));
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        // API call to delete job
        toast.success('Job deleted successfully');
        setJobs(jobs.filter(job => job.id !== jobId));
      } catch (error) {
        toast.error('Failed to delete job');
      }
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: 'success',
      inactive: 'secondary',
      applied: 'primary',
      interviewed: 'warning',
      hired: 'success',
      rejected: 'danger'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <Container fluid>
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="admin-header">
              <div className="admin-header-content">
                <FaUserShield className="admin-icon" />
                <div>
                  <h1 className="admin-title">Admin Dashboard</h1>
                  <p className="admin-subtitle">Welcome back, {user?.name}</p>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* Navigation Tabs */}
        <Row className="mb-4">
          <Col>
            <div className="admin-tabs">
              <Button
                variant={activeTab === 'overview' ? 'primary' : 'outline-primary'}
                onClick={() => setActiveTab('overview')}
                className="me-2"
              >
                <FaChartBar className="me-2" />
                Overview
              </Button>
              <Button
                variant={activeTab === 'users' ? 'primary' : 'outline-primary'}
                onClick={() => setActiveTab('users')}
                className="me-2"
              >
                <FaUsers className="me-2" />
                Users
              </Button>
              <Button
                variant={activeTab === 'jobs' ? 'primary' : 'outline-primary'}
                onClick={() => setActiveTab('jobs')}
                className="me-2"
              >
                <FaBriefcase className="me-2" />
                Jobs
              </Button>
              <Button
                variant={activeTab === 'applications' ? 'primary' : 'outline-primary'}
                onClick={() => setActiveTab('applications')}
              >
                <FaFileAlt className="me-2" />
                Applications
              </Button>
            </div>
          </Col>
        </Row>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <Row>
            <Col lg={3} md={6} className="mb-4">
              <Card className="stat-card">
                <Card.Body>
                  <div className="stat-content">
                    <div className="stat-icon users-icon">
                      <FaUsers />
                    </div>
                    <div className="stat-info">
                      <h3>{stats.totalUsers}</h3>
                      <p>Total Users</p>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={3} md={6} className="mb-4">
              <Card className="stat-card">
                <Card.Body>
                  <div className="stat-content">
                    <div className="stat-icon jobs-icon">
                      <FaBriefcase />
                    </div>
                    <div className="stat-info">
                      <h3>{stats.totalJobs}</h3>
                      <p>Active Jobs</p>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={3} md={6} className="mb-4">
              <Card className="stat-card">
                <Card.Body>
                  <div className="stat-content">
                    <div className="stat-icon applications-icon">
                      <FaFileAlt />
                    </div>
                    <div className="stat-info">
                      <h3>{stats.totalApplications}</h3>
                      <p>Applications</p>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={3} md={6} className="mb-4">
              <Card className="stat-card">
                <Card.Body>
                  <div className="stat-content">
                    <div className="stat-icon recruiters-icon">
                      <FaUserShield />
                    </div>
                    <div className="stat-info">
                      <h3>{stats.activeRecruiters}</h3>
                      <p>Recruiters</p>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <Row>
            <Col>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">User Management</h5>
                </Card.Header>
                <Card.Body>
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id}>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td>
                            <Badge bg={user.role === 'admin' ? 'danger' : user.role === 'recruiter' ? 'warning' : 'info'}>
                              {user.role}
                            </Badge>
                          </td>
                          <td>{getStatusBadge(user.status)}</td>
                          <td>{user.createdAt}</td>
                          <td>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={user.role === 'admin'}
                            >
                              <FaTrash />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <Row>
            <Col>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Job Management</h5>
                </Card.Header>
                <Card.Body>
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Company</th>
                        <th>Status</th>
                        <th>Applications</th>
                        <th>Posted</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map(job => (
                        <tr key={job.id}>
                          <td>{job.title}</td>
                          <td>{job.company}</td>
                          <td>{getStatusBadge(job.status)}</td>
                          <td>{job.applications}</td>
                          <td>{job.createdAt}</td>
                          <td>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteJob(job.id)}
                            >
                              <FaTrash />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <Row>
            <Col>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Application Management</h5>
                </Card.Header>
                <Card.Body>
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>Job Title</th>
                        <th>Applicant</th>
                        <th>Status</th>
                        <th>Applied</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map(application => (
                        <tr key={application.id}>
                          <td>{application.jobTitle}</td>
                          <td>{application.applicant}</td>
                          <td>{getStatusBadge(application.status)}</td>
                          <td>{application.createdAt}</td>
                          <td>
                            <Button variant="outline-primary" size="sm" className="me-2">
                              <FaEye />
                            </Button>
                            <Button variant="outline-warning" size="sm">
                              <FaEdit />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
};

export default AdminDashboard; 