import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Home, Medal, Camera, Menu, X } from 'lucide-react';
import AudioConsole from './AudioConsole.jsx';

const Navbar = () => {
  const location = useLocation();
  const [hidden, setHidden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollY.current && currentY > 60) {
        setHidden(true);
        setMobileMenuOpen(false);
      } else {
        setHidden(false);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileMenuOpen(false); }, [location]);

  const navItems = [
    { name: 'Base',        path: '/',            icon: Home   },
    { name: 'Rankings',   path: '/rankings',    icon: Trophy },
    { name: 'Tournaments',path: '/tournaments', icon: Medal  },
    { name: 'Gallery',    path: '/gallery',     icon: Camera },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] px-3 sm:px-6 py-2 sm:py-4 selection:bg-primary selection:text-white transition-transform duration-300 ${
          hidden ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        <div className="max-w-[1400px] mx-auto flex items-center justify-between glass-panel px-3 sm:px-8 py-2 sm:py-3 bg-black/80 border-white/5 backdrop-blur-3xl shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-4 group flex-shrink-0">
            <div className="flex-shrink-0 w-9 h-9 sm:w-14 sm:h-14 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
              <img
                src="/logo.png"
                alt="Daitya Legion Official Logo"
                className="h-full w-auto object-contain drop-shadow-[0_0_15px_rgba(136,8,8,0.5)]"
                onError={(e) => { e.target.src = 'https://cricheroes.com/assets/images/team-profile-placeholder.png'; }}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-2xl font-black text-white tracking-widest leading-none drop-shadow-sm select-none uppercase">
                DAITYA <span className="text-primary italic">LEGION</span>
              </span>
              <span className="hidden sm:block text-[7px] sm:text-[8px] font-bold text-gray-500 uppercase tracking-[0.5em] mt-1 opacity-80 select-none">
                Operational Command
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2 lg:gap-8">
            <div className="hidden lg:flex flex-col items-end mr-6 text-gray-700">
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-[8px] font-black uppercase tracking-widest">Neural Link: Online</span>
               </div>
               <span className="text-[6px] font-bold text-primary/40 uppercase tracking-[0.4em] mt-1">Architect: Sagar Pathak</span>
            </div>

            <div className="mr-2">
              <AudioConsole />
            </div>

            <div className="flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex items-center gap-3 px-5 py-2.5 rounded-sm text-[10px] font-black uppercase tracking-[0.3em] transition-all group overflow-hidden ${location.pathname === item.path ? 'text-white' : 'text-gray-500 hover:text-white'}`}
                >
                  {location.pathname === item.path && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 bg-primary/10 border-b-2 border-primary"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <item.icon className={`w-3.5 h-3.5 relative z-10 transition-colors ${location.pathname === item.path ? 'text-primary' : 'group-hover:text-primary'}`} />
                  <span className="relative z-10">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile: nav links + hamburger */}
          <div className="flex md:hidden items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex items-center gap-1 px-2 py-2 rounded-sm text-[9px] font-black uppercase tracking-[0.1em] transition-all ${location.pathname === item.path ? 'text-primary' : 'text-gray-500'}`}
              >
                <item.icon className="w-4 h-4" />
                <span className="hidden xs:inline">{item.name}</span>
              </Link>
            ))}
            <button
              onClick={() => setMobileMenuOpen((p) => !p)}
              className="ml-1 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-primary transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile slide-down menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-[60px] left-0 right-0 z-[99] bg-black/95 border-b border-white/5 backdrop-blur-3xl md:hidden px-4 py-4"
          >
            <AudioConsole />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
