import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Menu, X, User, LogOut, Shield } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/rooms', label: 'Rooms' },
    { to: '/vacancies', label: 'Vacancies' },
    { to: '/gallery', label: 'Gallery' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <nav className="bg-charcoal text-white border-b border-primary/20 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex flex-col" onClick={() => setIsOpen(false)}>
              <span className="font-playfair text-xl sm:text-2xl font-bold tracking-widest text-primary">Regal Rivulet</span>
              <span className="text-[9px] sm:text-[10px] tracking-[0.2em] text-gray-400 font-light -mt-1 uppercase">Retreat Hotel Singapore</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-5">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`transition-colors font-medium text-sm ${isActive(link.to) ? 'text-primary' : 'text-gray-300 hover:text-primary'}`}
              >
                {link.label}
              </Link>
            ))}
            <div className="h-6 w-px bg-gray-700 mx-1" />
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-300 hover:text-primary transition-colors rounded-full"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link
                  to={isAdmin ? '/admin' : '/dashboard'}
                  className="flex items-center space-x-1.5 hover:text-primary transition-colors font-medium text-sm text-gray-200"
                >
                  {isAdmin ? <Shield className="h-4 w-4 text-primary" /> : <User className="h-4 w-4 text-primary" />}
                  <span className="max-w-[120px] truncate">{user?.full_name || 'Dashboard'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-red-400 hover:text-red-300 transition-colors font-medium text-sm bg-red-950/20 px-3 py-1.5 rounded border border-red-900/30"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-gray-300 hover:text-primary transition-colors text-sm font-medium">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary hover:bg-primary-dark text-charcoal font-semibold text-xs uppercase tracking-wider px-4 py-2.5 rounded transition-all shadow-lg shadow-primary/10"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile right actions */}
          <div className="flex items-center md:hidden space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-300 hover:text-primary rounded-full"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2.5 rounded-md text-gray-300 hover:text-white hover:bg-gray-800 transition-colors focus:outline-none"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - slides down */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="bg-charcoal border-t border-primary/10 px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setIsOpen(false)}
              className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                isActive(link.to)
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="border-t border-gray-800 my-2" />

          {isAuthenticated ? (
            <>
              <Link
                to={isAdmin ? '/admin' : '/dashboard'}
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2 px-4 py-3 rounded-lg text-base font-medium text-primary hover:bg-primary/10 transition-colors"
              >
                {isAdmin ? <Shield className="h-5 w-5" /> : <User className="h-5 w-5" />}
                <span>{user?.full_name || 'Dashboard'}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 px-4 py-3 rounded-lg text-base font-medium text-red-400 hover:bg-red-950/20 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col space-y-2 pt-1 pb-2">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="w-full text-center px-4 py-3 rounded-lg text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors border border-gray-700"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="w-full text-center px-4 py-3 rounded-lg text-base font-bold uppercase text-xs tracking-wider bg-primary hover:bg-primary-dark text-charcoal transition-all"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
