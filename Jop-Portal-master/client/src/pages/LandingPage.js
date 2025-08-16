import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaBriefcase, FaUsers, FaBuilding, FaMapMarkerAlt, FaMoneyBillWave, FaClock, FaRocket, FaChartLine, FaGlobe } from 'react-icons/fa';
import { jobService } from '../services/jobService';
import JobCard from '../components/JobCard';
import toast from 'react-hot-toast';
import './LandingPage.css';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ jobsPosted: 0, companies: 0, cities: 0 });
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadFeaturedJobs();
    animateCounters();
  }, []);

  const loadFeaturedJobs = async () => {
    try {
      const response = await jobService.getJobs({ limit: 6 });
      setFeaturedJobs(response.jobs);
    } catch (error) {
      console.error('Error loading featured jobs:', error);
      toast.error('Failed to load featured jobs');
    } finally {
      setLoading(false);
    }
  };

  const animateCounters = () => {
    const targetStats = { jobsPosted: 1000, companies: 500, cities: 50 };
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      setStats({
        jobsPosted: Math.floor(targetStats.jobsPosted * progress),
        companies: Math.floor(targetStats.companies * progress),
        cities: Math.floor(targetStats.cities * progress)
      });
      if (currentStep >= steps) {
        clearInterval(timer);
        setStats(targetStats);
      }
    }, stepDuration);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (location) params.append('location', location);
    navigate(`/jobs?${params.toString()}`);
  };

  const jobCategories = [
    { name: 'Technology', icon: FaRocket, count: 250 },
    { name: 'Healthcare', icon: FaUsers, count: 180 },
    { name: 'Finance', icon: FaChartLine, count: 120 },
    { name: 'Remote', icon: FaGlobe, count: 300 }
  ];

  // Modern horizontal carousel logic
  const [sliderIndex, setSliderIndex] = useState(0);
  const jobsPerView = window.innerWidth < 600 ? 1 : window.innerWidth < 900 ? 2 : 3;
  const maxIndex = Math.max(0, featuredJobs.length - jobsPerView);

  const handlePrev = () => setSliderIndex((prev) => Math.max(prev - 1, 0));
  const handleNext = () => setSliderIndex((prev) => Math.min(prev + 1, maxIndex));

  useEffect(() => {
    if (featuredJobs.length === 0) return;
    const interval = setInterval(() => {
      setSliderIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
    }, 5000);
    return () => clearInterval(interval);
  }, [featuredJobs, maxIndex]);

  // Parallax/tilt effect for hero card
  const heroCardRef = useRef(null);
  useEffect(() => {
    const card = heroCardRef.current;
    if (!card) return;
    const handleMouseMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * 8;
      const rotateY = ((x - centerX) / centerX) * -8;
      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };
    const handleMouseLeave = () => {
      card.style.transform = 'rotateX(0deg) rotateY(0deg)';
    };
    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Bubble physics simulation
  const heroAreaRef = useRef(null);
  const [bubbles, setBubbles] = useState([]);

  // Initialize bubbles only once
  useEffect(() => {
    const lightColors = [
      '#ff7730', '#ffb347', '#7877c6', '#9b7cff', '#ff6b35', '#f7931e',
      '#00c9a7', '#00b4d8', '#f72585', '#7209b7', '#3a86ff', '#ffbe0b'
    ];
    const darkColors = [
      '#00e676', // green
      '#ff1744', // red
      '#f50057', // pink
      '#2979ff', // blue
      '#212121', // black
      '#00bfae', // teal-green
      '#d500f9', // purple-pink
      '#00b8d4', // cyan-blue
      '#ff4081', // hot pink
      '#1de9b6', // light green
      '#651fff', // deep blue
      '#263238'  // dark blue-black
    ];
    const colors = lightColors; // Default to light theme
    const directions = [
      { dx: 1, dy: 0 },    // right
      { dx: -1, dy: 0 },   // left
      { dx: 0, dy: 1 },    // down
      { dx: 0, dy: -1 },   // up
      { dx: 0.7, dy: 0.7 }, // down-right
      { dx: -0.7, dy: 0.7 }, // down-left
      { dx: 0.7, dy: -0.7 }, // up-right
      { dx: -0.7, dy: -0.7 } // up-left
    ];
    const areaW = 1200; // px, fallback if ref not ready
    const areaH = 480; // px
    const newBubbles = Array.from({ length: 10 }).map((_, i) => {
      const size = Math.random() * 60 + 40; // 40-100px
      const color = colors[Math.floor(Math.random() * colors.length)];
      const x = Math.random() * (areaW - size);
      const y = Math.random() * (areaH - size);
      const speed = Math.random() * 1.0 + 1.2; // 1.2-2.2 px/frame (smoother)
      const dir = directions[Math.floor(Math.random() * directions.length)];
      return {
        key: `bubble-${i}`,
        size,
        color,
        x,
        y,
        dx: dir.dx * speed,
        dy: dir.dy * speed
      };
    });
    setBubbles(newBubbles);
  }, []);

  useEffect(() => {
    let animationId;
    const damping = 1.0; // no friction, always move
    const randomize = (v) => v + (Math.random() - 0.5) * 0.2; // small random tweak
    const animate = () => {
      setBubbles(prevBubbles => {
        if (!heroAreaRef.current) return prevBubbles;
        const areaW = heroAreaRef.current.offsetWidth;
        const areaH = heroAreaRef.current.offsetHeight;
        const next = prevBubbles.map((b, i) => {
          let { x, y, dx, dy, size } = b;
          x += dx;
          y += dy;
          // Bounce off borders
          let bounced = false;
          if (x < 0) { x = 0; dx = Math.abs(dx); bounced = true; }
          if (x + size > areaW) { x = areaW - size; dx = -Math.abs(dx); bounced = true; }
          if (y < 0) { y = 0; dy = Math.abs(dy); bounced = true; }
          if (y + size > areaH) { y = areaH - size; dy = -Math.abs(dy); bounced = true; }
          if (bounced) {
            dx = randomize(dx) * damping;
            dy = randomize(dy) * damping;
          } else {
            dx = dx * damping;
            dy = dy * damping;
          }
          return { ...b, x, y, dx, dy };
        });
        // Bounce off other bubbles
        for (let i = 0; i < next.length; i++) {
          for (let j = i + 1; j < next.length; j++) {
            const a = next[i], b = next[j];
            const dx = (a.x + a.size/2) - (b.x + b.size/2);
            const dy = (a.y + a.size/2) - (b.y + b.size/2);
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < (a.size + b.size)/2) {
              // Elastic bounce: swap directions, add random tweak
              const tempDx = a.dx, tempDy = a.dy;
              next[i].dx = randomize(b.dx) * damping; next[i].dy = randomize(b.dy) * damping;
              next[j].dx = randomize(tempDx) * damping; next[j].dy = randomize(tempDy) * damping;
              // Move them apart
              const overlap = (a.size + b.size)/2 - dist;
              const moveX = (dx/dist) * (overlap/2);
              const moveY = (dy/dist) * (overlap/2);
              next[i].x += moveX; next[i].y += moveY;
              next[j].x -= moveX; next[j].y -= moveY;
            }
          }
        }
        return next;
      });
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="landing-page">
      {/* Enhanced 3D Hero Section */}
      <section className="hero-section" ref={heroAreaRef}>
        <div className="hero-bg-animation"></div>
        <div className="hero-3d-bg">
          {bubbles.map(bubble => (
            <div
              key={bubble.key}
              className="hero-bubble"
              style={{
                width: bubble.size,
                height: bubble.size,
                background: bubble.color,
                left: bubble.x,
                top: bubble.y
              }}
            />
          ))}
        </div>
        <div className="hero-3d-card" ref={heroCardRef}>
          <div className="hero-content">
            <h1>
              Find Your <span className="highlight">Dream Job</span> <br />
              <span className="highlight">Faster</span> Than Ever
            </h1>
            <p className="hero-subtitle">
              Discover thousands of opportunities from top companies. Your next career move starts here.
            </p>
            <form className="hero-search" onSubmit={handleSearch}>
              <div className="hero-search-fields">
                <input
                  type="text"
                  placeholder="Job title, keywords, or company"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="search-input"
                />
                <button type="submit">Search</button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-card">
            <FaBriefcase className="stat-icon" />
            <div className="stat-number">{stats.jobsPosted}+</div>
            <div className="stat-label">Active Jobs</div>
          </div>
          <div className="stat-card">
            <FaBuilding className="stat-icon" />
            <div className="stat-number">{stats.companies}+</div>
            <div className="stat-label">Companies</div>
          </div>
          <div className="stat-card">
            <FaGlobe className="stat-icon" />
            <div className="stat-number">{stats.cities}+</div>
            <div className="stat-label">Cities</div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="categories-header">
          <h2 className="section-title">Popular Job Categories</h2>
          <p className="section-subtitle">Explore opportunities in your field</p>
        </div>
        <div className="categories-list">
          {jobCategories.map((category, index) => (
            <button
              key={index}
              className="category-btn"
              onClick={() => navigate(`/jobs?search=${category.name}`)}
            >
              <category.icon className="category-icon" />
              <div className="category-name">{category.name}</div>
              <div className="category-count">{category.count} jobs</div>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="featured-jobs-section">
        <div className="featured-header">
          <h2 className="section-title">Featured Jobs</h2>
          <p className="section-subtitle">Discover the latest opportunities from top companies</p>
        </div>
        {loading ? (
          <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading featured jobs...</p>
          </div>
        ) : (
          <div className="featured-jobs-list">
            {featuredJobs.map((job) => (
              <JobCard job={job} key={job._id} />
            ))}
          </div>
        )}
        <div className="view-all-btn-container">
          <Link to="/jobs" className="view-all-btn">View All Jobs</Link>
        </div>
      </section>

      {/* Find Your Dream Job Box or 'Ready to Start Your Journey?' section */}
      { !isAuthenticated && (
        <section className="dream-job-section">
          <div className="dream-job-box">
            <h2 className="dream-job-title">Find Your Dream Job</h2>
            <p className="dream-job-desc">Search thousands of jobs from top companies and take the next step in your career.</p>
            <form className="dream-job-search" onSubmit={handleSearch}>
              <div className="dream-job-fields">
                <div className="dream-job-field">
                  <span className="dream-job-icon"><FaSearch /></span>
                  <input
                    type="text"
                    placeholder="Job title, keywords, or company"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="dream-job-input"
                  />
                </div>
                <div className="dream-job-field">
                  <span className="dream-job-icon"><FaMapMarkerAlt /></span>
                  <input
                    type="text"
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="dream-job-input"
                  />
                </div>
                <button type="submit" className="dream-job-btn">Search</button>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* CTA Section */}
      { !isAuthenticated && (
        <section className="cta-section">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Start Your Journey?</h2>
            <p className="cta-subtitle">Join thousands of professionals finding their dream jobs</p>
            <div className="cta-buttons">
              <Link to="/register" className="cta-btn primary">Sign Up as Job Seeker</Link>
              <Link to="/register" className="cta-btn outline">Post a Job</Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default LandingPage; 