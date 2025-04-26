import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Scale, Menu, X, ChevronRight } from 'lucide-react';
import { gsap } from 'gsap';
import Button from './Button';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const navRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const logoIconRef = useRef(null);
  const navItemsRef = useRef([]);

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 10;
      if (scrolled !== isScrolled) {
        setIsScrolled(scrolled);
        
        // Animate navbar on scroll
        if (scrolled) {
          gsap.to(navRef.current, {
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
            padding: '10px 0',
            duration: 0.4,
            ease: 'power2.out'
          });
        } else {
          gsap.to(navRef.current, {
            backgroundColor: 'rgba(14, 16, 26, 0.2)', 
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            padding: '20px 0',
            duration: 0.4,
            ease: 'power2.out'
          });
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    
    // Stagger animation for nav items on mount
    const navElements = navItemsRef.current.filter(item => item !== null);
    gsap.fromTo(navElements, 
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: 'power2.out', delay: 0.2 }
    );
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrolled]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Setup mobile menu animations
  useEffect(() => {
    if (!mobileMenuRef.current) return;
    
    if (isOpen) {
      gsap.set(mobileMenuRef.current, { display: 'block' });
      gsap.fromTo(mobileMenuRef.current, 
        { opacity: 0, height: 0 },
        { opacity: 1, height: 'auto', duration: 0.4, ease: 'power3.out' }
      );
      
      // Stagger animation for mobile menu items
      const menuItems = mobileMenuRef.current.querySelectorAll('.mobile-menu-item');
      gsap.fromTo(menuItems, 
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.08, duration: 0.5, ease: 'back.out(1.2)', delay: 0.2 }
      );
    } else {
      const menuItems = mobileMenuRef.current.querySelectorAll('.mobile-menu-item');
      gsap.to(menuItems, { 
        x: -20, 
        opacity: 0, 
        stagger: 0.05, 
        duration: 0.3,
        onComplete: () => {
          gsap.to(mobileMenuRef.current, {
            opacity: 0, 
            height: 0, 
            duration: 0.3, 
            ease: 'power3.in',
            onComplete: () => gsap.set(mobileMenuRef.current, { display: 'none' })
          });
        }
      });
    }
  }, [isOpen]);

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/legal-book', label: 'Legal Resources' },
    { path: '/schedule-meet', label: 'Schedule Consultation' },
    { path: '/chat', label: 'Messages' },
    { path: '/contact', label: 'Contact' },
  ];

  // Logo animation
  const animateLogo = () => {
    gsap.to(logoIconRef.current, {
      rotate: 360,
      scale: 1.2,
      duration: 0.8,
      ease: 'elastic.out(1, 0.3)'
    });
    
    setTimeout(() => {
      gsap.to(logoIconRef.current, {
        scale: 1,
        duration: 0.5,
        ease: 'power2.out'
      });
    }, 800);
  };

  // Handle navigation - simply use the browser's native navigation
  const handleNavigation = (e, to) => {
    e.preventDefault();
    
    // Don't transition if already on this page
    if (location.pathname === to) return;
    
    // Use React Router's navigate
    navigate(to);
  };

  // Toggle mobile menu with animation
  const toggleMobileMenu = () => {
    // Button animation
    gsap.to('.menu-button', {
      rotate: isOpen ? 0 : 180,
      scale: 1.1,
      duration: 0.3,
      onComplete: () => gsap.to('.menu-button', { scale: 1, duration: 0.2 })
    });
    
    setIsOpen(!isOpen);
  };

  return (
    <nav 
      ref={navRef}
      className="fixed w-full z-40 py-5"
      style={{ 
        backgroundColor: 'rgba(14, 16, 26, 0.2)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 group"
            onClick={(e) => {
              animateLogo();
              handleNavigation(e, '/');
            }}
          >
            <div 
              ref={logoIconRef} 
              className="relative bg-gradient-to-br from-primary-500 to-purple-600 p-2 rounded-lg shadow-lg"
            >
              <Scale className="h-7 w-7 text-white" />
            </div>
            <span className={`text-xl font-bold transition-colors duration-200 bg-clip-text text-transparent bg-gradient-to-r ${
              isScrolled 
                ? 'from-gray-800 to-gray-600' 
                : 'from-white to-gray-300'
            }`}>
              LawConnect
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  ref={el => navItemsRef.current[index] = el}
                  onClick={(e) => handleNavigation(e, item.path)}
                  className={`
                    relative px-4 py-2 rounded-lg text-sm font-medium transition duration-200
                    overflow-hidden group
                    ${isScrolled
                      ? isActive
                        ? 'text-white bg-gradient-to-r from-primary-500 to-primary-600 shadow-md'
                        : 'text-gray-700 hover:text-primary-600'
                      : isActive
                        ? 'text-white bg-white/20 backdrop-blur-md shadow-md'
                        : 'text-white/90 hover:text-white'
                    }
                  `}
                >
                  <span className="relative z-10">{item.label}</span>
                  
                  {!isActive && (
                    <span className={`absolute inset-0 w-full h-full transition-all duration-300 
                      ${isScrolled ? 'bg-gray-100' : 'bg-white/10'}
                      opacity-0 group-hover:opacity-100 scale-x-0 group-hover:scale-x-100
                      origin-left rounded-lg`} 
                    />
                  )}
                  
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white transform" />
                  )}
                </Link>
              );
            })}

            <div className="pl-6 flex items-center space-x-3">
              <Link 
                to="/login" 
                onClick={(e) => handleNavigation(e, '/login')}
                className="relative overflow-hidden group"
              >
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`relative z-10 border-2 transition-all duration-300 ${
                    isScrolled ? 'border-primary-600 text-primary-600' : 'border-white text-white'
                  }`}
                >
                  <span className="relative z-10 group-hover:text-white transition-colors duration-300">Sign In</span>
                  <span className="absolute inset-0 bg-primary-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Button>
              </Link>
              <Link 
                to="/register" 
                onClick={(e) => handleNavigation(e, '/register')}
                className="relative overflow-hidden group"
              >
                <Button 
                  variant="primary" 
                  size="sm"
                  className="relative z-10 shadow-lg bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-purple-600 transition-all duration-300"
                >
                  <span className="flex items-center">
                    Get Started
                    <ChevronRight className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className={`md:hidden p-2 rounded-lg transition-all menu-button ${
              isScrolled
                ? 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
                : 'text-white hover:bg-white/10 active:bg-white/20'
            }`}
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        <div
          ref={mobileMenuRef}
          className="md:hidden overflow-hidden rounded-xl mt-4 shadow-xl"
          style={{ 
            display: 'none',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)' 
          }}
        >
          <div className="py-3 space-y-1">
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={(e) => handleNavigation(e, item.path)}
                  className={`mobile-menu-item block px-5 py-3 text-sm font-medium transition-colors rounded-lg mx-2 
                    ${isActive
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    {item.label}
                    {isActive && <ChevronRight className="h-4 w-4" />}
                  </div>
                </Link>
              );
            })}
            <div className="px-5 py-3 space-y-3">
              <Link 
                to="/login" 
                onClick={(e) => handleNavigation(e, '/login')}
                className="mobile-menu-item block"
              >
                <Button 
                  variant="outline" 
                  fullWidth
                  className="border-2 border-primary-600 text-primary-600"
                >
                  Sign In
                </Button>
              </Link>
              <Link 
                to="/register" 
                onClick={(e) => handleNavigation(e, '/register')}
                className="mobile-menu-item block"
              >
                <Button 
                  variant="primary" 
                  fullWidth
                  className="bg-gradient-to-r from-primary-600 to-primary-500"
                >
                  <span className="flex items-center justify-center">
                    Get Started
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;