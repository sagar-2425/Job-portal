import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt, FaFilter, FaBriefcase } from 'react-icons/fa';
import { jobService } from '../services/jobService';
import JobCard from '../components/JobCard';
import toast from 'react-hot-toast';
import './JobList.css';

const JobList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || '',
    type: searchParams.get('type') || '',
    minSalary: searchParams.get('minSalary') || '',
    maxSalary: searchParams.get('maxSalary') || ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalJobs: 0
  });
  const [jobsPerPage, setJobsPerPage] = useState(10);

  useEffect(() => {
    loadJobs();
  }, [filters, pagination.currentPage, jobsPerPage]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        page: pagination.currentPage,
        limit: jobsPerPage
      };
      
      const response = await jobService.getJobs(params);
      setJobs(response.jobs);
      setPagination({
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalJobs: response.totalJobs
      });
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    setSearchParams(params);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      location: '',
      type: '',
      minSalary: '',
      maxSalary: ''
    });
    setSearchParams({});
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageChange = (page) => {
    scrollToTop();
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'Applied': 'badge-primary',
      'Viewed': 'badge-info',
      'Interview': 'badge-warning',
      'Rejected': 'badge-danger',
      'Hired': 'badge-success'
    };
    return statusColors[status] || 'badge-primary';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Next Job</h1>
          <p className="text-gray-600">Discover opportunities that match your skills and interests</p>
        </div>

        {/* Search and Filters */}
        <div className="search-filters mb-8">
          <form onSubmit={handleSearch}>
            <div className="filters-row">
              <div className="filter-group">
                <label className="filter-label" htmlFor="search">
                  <FaSearch style={{ marginRight: 6 }} />
                  Keywords
                </label>
                <input
                  id="search"
                  type="text"
                  name="search"
                  placeholder="Job title, keywords, or company"
                  value={filters.search}
                  onChange={handleFilterChange}
                  className="filter-control"
                />
              </div>
              <div className="filter-group">
                <label className="filter-label" htmlFor="location">
                  <FaMapMarkerAlt style={{ marginRight: 6 }} />
                  Location
                </label>
                <input
                  id="location"
                  type="text"
                  name="location"
                  placeholder="Location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  className="filter-control"
                />
              </div>
              <div className="filter-group">
                <label className="filter-label" htmlFor="type">
                  <FaFilter style={{ marginRight: 6 }} />
                  Job Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  className="filter-control"
                >
                  <option value="">All Types</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>
              <div className="filter-group">
                <label className="filter-label">Salary Range</label>
                <div className="salary-inputs">
                  <input
                    type="number"
                    name="minSalary"
                    placeholder="Min"
                    value={filters.minSalary}
                    onChange={handleFilterChange}
                    className="filter-control"
                    min="0"
                  />
                  <input
                    type="number"
                    name="maxSalary"
                    placeholder="Max"
                    value={filters.maxSalary}
                    onChange={handleFilterChange}
                    className="filter-control"
                    min="0"
                  />
                </div>
              </div>
            </div>
            <div className="button-row">
              <button type="submit" className="search-btn">
                <FaSearch className="search-btn-icon" style={{ marginRight: 6 }} />
                Search Jobs
              </button>
              <button type="button" onClick={clearFilters} className="clear-btn">
                Clear Filters
              </button>
            </div>
          </form>
        </div>

        {/* Results Count and Show Per Page */}
        <div className="flex justify-between items-center mb-6 results-header-row">
          <p className="text-gray-600">
            Showing {jobs.length} of {pagination.totalJobs} jobs
          </p>
          <div className="show-per-page-group">
            <label htmlFor="jobsPerPage" className="show-per-page-label">Show per page:</label>
            <select
              id="jobsPerPage"
              value={jobsPerPage}
              onChange={e => { setJobsPerPage(Number(e.target.value)); setPagination(prev => ({ ...prev, currentPage: 1 })); }}
              className="show-per-page-select"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <FaBriefcase className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="pagination-group">
            <div className="pagination">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="page-btn"
                aria-label="Previous Page"
              >
                Previous
              </button>
              {/* Smart Pagination Logic */}
              {(() => {
                const pages = [];
                const { currentPage, totalPages } = pagination;
                if (totalPages <= 3) {
                  for (let page = 1; page <= totalPages; page++) {
                    pages.push(
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`page-btn${page === currentPage ? ' active' : ''}`}
                        aria-label={`Page ${page}`}
                        aria-current={page === currentPage ? 'page' : undefined}
                      >
                        {page}
                      </button>
                    );
                  }
                } else {
                  // Always show first page
                  pages.push(
                    <button
                      key={1}
                      onClick={() => handlePageChange(1)}
                      className={`page-btn${currentPage === 1 ? ' active' : ''}`}
                      aria-label="Page 1"
                      aria-current={currentPage === 1 ? 'page' : undefined}
                    >
                      1
                    </button>
                  );
                  // If currentPage is 2, show it directly after 1
                  if (currentPage === 2) {
                    pages.push(
                      <button
                        key={2}
                        onClick={() => handlePageChange(2)}
                        className="page-btn active"
                        aria-label="Page 2"
                        aria-current="page"
                      >
                        2
                      </button>
                    );
                    pages.push(<span key="end-ellipsis" className="page-ellipsis">...</span>);
                  } else if (currentPage === totalPages - 1) {
                    // If currentPage is just before last, show ellipsis then currentPage
                    pages.push(<span key="start-ellipsis" className="page-ellipsis">...</span>);
                    pages.push(
                      <button
                        key={currentPage}
                        onClick={() => handlePageChange(currentPage)}
                        className="page-btn active"
                        aria-label={`Page ${currentPage}`}
                        aria-current="page"
                      >
                        {currentPage}
                      </button>
                    );
                  } else if (currentPage !== 1 && currentPage !== totalPages) {
                    // If currentPage is in the middle, show ellipsis, current, ellipsis
                    pages.push(<span key="start-ellipsis" className="page-ellipsis">...</span>);
                    pages.push(
                      <button
                        key={currentPage}
                        onClick={() => handlePageChange(currentPage)}
                        className="page-btn active"
                        aria-label={`Page ${currentPage}`}
                        aria-current="page"
                      >
                        {currentPage}
                      </button>
                    );
                    pages.push(<span key="end-ellipsis" className="page-ellipsis">...</span>);
                  } else if (currentPage < totalPages - 1) {
                    // If currentPage is 1, show ellipsis
                    pages.push(<span key="end-ellipsis" className="page-ellipsis">...</span>);
                  } else if (currentPage > 2) {
                    // If currentPage is last, show ellipsis
                    pages.push(<span key="start-ellipsis" className="page-ellipsis">...</span>);
                  }
                  // Always show last page
                  if (totalPages > 1) {
                    pages.push(
                      <button
                        key={totalPages}
                        onClick={() => handlePageChange(totalPages)}
                        className={`page-btn${currentPage === totalPages ? ' active' : ''}`}
                        aria-label={`Page ${totalPages}`}
                        aria-current={currentPage === totalPages ? 'page' : undefined}
                      >
                        {totalPages}
                      </button>
                    );
                  }
                }
                return pages;
              })()}
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="page-btn"
                aria-label="Next Page"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobList; 