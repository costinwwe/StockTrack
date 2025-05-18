import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaChevronDown, FaChevronUp, FaSignOutAlt, FaClipboardCheck, FaUser, FaCog, FaUserShield, FaBug } from 'react-icons/fa';
import { logo } from '../assets/assets';
import api from '../utils/api';
import "../styles/navbar.scss";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const navigate = useNavigate();

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log("No token found in localStorage");
          setIsLoggedIn(false);
          return;
        }

        console.log("Token found, attempting to fetch user data");
        const res = await api.get('/api/auth/me');
        console.log("User data received:", res.data);
        
        if (res.data && res.data.data) {
          const user = res.data.data;
          setUserData(user);
          setIsLoggedIn(true);
          
          // Store debug info
          setDebugInfo({
            hasRole: !!user.role,
            roleValue: user.role,
            isAdmin: user.role === 'admin',
            hasIsAdmin: !!user.isAdmin,
            isAdminValue: user.isAdmin
          });
          
          // Check for admin privileges - more thorough check
          const adminCheck = 
            (user.role && user.role.toLowerCase() === 'admin') || 
            (user.isAdmin === true) ||
            (user.permissions && user.permissions.includes('admin'));
            
          console.log("Admin check result:", adminCheck);
          
          setIsAdmin(adminCheck);
        } else {
          console.log("No user data in response");
          setIsLoggedIn(false);
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setIsLoggedIn(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Handle scroll event to change navbar style when scrolling
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
    setActiveDropdown(null);
  };

  // Close mobile menu when a link is clicked
  const closeMenu = () => {
    setIsOpen(false);
    setActiveDropdown(null);
  };

  // Toggle mobile dropdown menu
  const toggleMobileDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserData(null);
    navigate('/login');
  };

  // Force show admin panel for debugging
  const forceShowAdmin = () => {
    setIsAdmin(true);
  };

  // Navigation items grouped by category
  const navItems = [
    {
      title: 'Home',
      path: '/',
      standalone: true
    },
    {
      title: 'Workspace',
      dropdown: true,
      items: [
        { title: 'Projects', path: '/projects' },
        { title: 'Collaboration Hub', path: '/collaboration-hub' }
      ]
    },
    {
      title: 'Analytics',
      dropdown: true,
      items: [
        { title: 'Dashboard', path: '/dashboard' },
        { title: 'Reports', path: '/reports' }
      ]
    },
    {
      title: 'Learn',
      dropdown: true,
      items: [
        { title: 'Tutorial', path: '/tutorial' },
        { title: 'FAQ', path: '/faq' },
        { title: 'Blog', path: '/blog' }
      ]
    },
    {
      title: 'About',
      dropdown: true,
      items: [
        { title: 'About Us', path: '/about' },
        { title: 'Contact', path: '/contact' },
        { title: 'Terms', path: '/terms' }
      ]
    },
    {
      title: 'Get Pro',
      path: '/get-pro',
      standalone: true,
      highlight: true
    }
  ];

  // User account section with conditional rendering based on login status
  const accountSection = isLoggedIn ? (
    <div className="user-account-section">
      <div className="user-avatar" onClick={() => navigate('/profile')}>
        {userData && userData.profileImage ? (
          <img 
            src={`${userData.profileImage.startsWith('/uploads/') ? '' : '/uploads/'}${userData.profileImage}`} 
            alt={userData.name} 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="%23718096"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>';
            }}
          />
        ) : (
          <div className="avatar-placeholder">
            <FaUser />
          </div>
        )}
      </div>
      <div className="user-dropdown">
        <Link to="/profile" className="dropdown-item">
          <FaUser /> Profile
        </Link>
        <Link to="/projects" className="dropdown-item">
          <FaClipboardCheck /> My Projects
        </Link>
        <Link to="/settings" className="dropdown-item">
          <FaCog /> Settings
        </Link>
        {isAdmin && (
          <Link to="/admin" className="dropdown-item admin-link">
            <FaUserShield /> Admin Panel
          </Link>
        )}
        {debugInfo && (
          <div className="dropdown-item debug-info">
            <FaBug /> 
            <span onClick={forceShowAdmin} style={{cursor: 'pointer', fontSize: '0.8rem'}}>
              Role: {debugInfo.roleValue || 'none'} 
              {debugInfo.isAdmin && ' (admin)'}
            </span>
          </div>
        )}
        <button onClick={handleLogout} className="dropdown-item logout-btn">
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </div>
  ) : (
    <div className="auth-buttons">
      <Link to="/login" className="login-btn">Login</Link>
      <Link to="/register" className="register-btn">Register</Link>
    </div>
  );

  // Mobile account items - varies based on login status
  const mobileAccountItems = isLoggedIn ? [
    { title: 'Profile', path: '/profile', icon: <FaUser /> },
    { title: 'My Projects', path: '/projects', icon: <FaClipboardCheck /> },
    { title: 'Settings', path: '/settings', icon: <FaCog /> },
    ...(isAdmin ? [{ title: 'Admin Panel', path: '/admin', icon: <FaUserShield /> }] : []),
    { title: 'Logout', action: handleLogout, icon: <FaSignOutAlt /> }
  ] : [
    { title: 'Login', path: '/login' },
    { title: 'Register', path: '/register' }
  ];

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">
            <img src={logo} alt="Logo" />
          </Link>
        </div>

        {/* Desktop navigation */}
        <ul className="nav-menu desktop">
          {navItems.map((item, index) => (
            item.standalone ? (
              <li key={index} className={`nav-item ${item.highlight ? 'highlight' : ''}`}>
                <Link to={item.path} className="nav-link">
                  {item.title}
                </Link>
              </li>
            ) : (
              <li key={index} className="nav-item dropdown">
                <div className="dropdown-toggle">
                  {item.title}
                  <span className="dropdown-icon">
                    <FaChevronDown />
                  </span>
                </div>
                <div className="dropdown-menu">
                  {item.items.map((dropdownItem, idx) => (
                    <Link 
                      key={idx} 
                      to={dropdownItem.path} 
                      className="dropdown-item"
                    >
                      {dropdownItem.title}
                    </Link>
                  ))}
                </div>
              </li>
            )
          ))}
        </ul>

        {/* User account section (desktop) */}
        <div className="navbar-auth">
          {accountSection}
        </div>

        {/* Mobile menu toggle button */}
        <div className={`mobile-menu-icon ${isOpen ? 'active' : ''}`} onClick={toggleMenu}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </div>

        {/* Mobile navigation */}
        <div className={`mobile-menu ${isOpen ? 'active' : ''}`}>
          <ul className="nav-menu mobile">
            {navItems.map((item, index) => (
              item.standalone ? (
                <li key={index} className={`nav-item ${item.highlight ? 'highlight' : ''}`}>
                  <Link 
                    to={item.path} 
                    className="nav-link" 
                    onClick={closeMenu}
                  >
                    {item.title}
                  </Link>
                </li>
              ) : (
                <li key={index} className="nav-item mobile-dropdown">
                  <div 
                    className={`mobile-dropdown-toggle ${activeDropdown === index ? 'active' : ''}`}
                    onClick={() => toggleMobileDropdown(index)}
                  >
                    {item.title}
                    <span className="dropdown-icon">
                      {activeDropdown === index ? <FaChevronUp /> : <FaChevronDown />}
                    </span>
                  </div>
                  <div className={`mobile-dropdown-menu ${activeDropdown === index ? 'active' : ''}`}>
                    {item.items.map((dropdownItem, idx) => (
                      <Link 
                        key={idx} 
                        to={dropdownItem.path} 
                        className="dropdown-item"
                        onClick={closeMenu}
                      >
                        {dropdownItem.title}
                      </Link>
                    ))}
                  </div>
                </li>
              )
            ))}

            {/* Mobile Account Section */}
            <li className="nav-item account-section-mobile">
              <div 
                className={`mobile-dropdown-toggle ${activeDropdown === 'account' ? 'active' : ''}`}
                onClick={() => toggleMobileDropdown('account')}
              >
                {isLoggedIn ? `Hello, ${userData?.name?.split(' ')[0] || 'User'}` : 'Account'}
                <span className="dropdown-icon">
                  {activeDropdown === 'account' ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </div>
              <div className={`mobile-dropdown-menu ${activeDropdown === 'account' ? 'active' : ''}`}>
                {mobileAccountItems.map((item, idx) => (
                  item.action ? (
                    <button 
                      key={idx} 
                      onClick={() => {
                        item.action();
                        closeMenu();
                      }} 
                      className="dropdown-item"
                    >
                      {item.icon} {item.title}
                    </button>
                  ) : (
                    <Link 
                      key={idx} 
                      to={item.path} 
                      className={`dropdown-item ${item.title === 'Admin Panel' ? 'admin-link' : ''}`}
                      onClick={closeMenu}
                    >
                      {item.icon} {item.title}
                    </Link>
                  )
                ))}
              </div>
            </li>
          </ul>
        </div>
        
        {/* Overlay for mobile menu */}
        <div 
          className={`mobile-menu-overlay ${isOpen ? 'active' : ''}`}
          onClick={closeMenu}
        ></div>
      </div>
    </nav>
  );
};

export default Navbar;