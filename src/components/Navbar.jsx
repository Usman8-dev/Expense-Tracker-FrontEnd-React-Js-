import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Expenses", path: "/expenses" },
    { name: "Categories", path: "/categories" },
    { name: "Reports", path: "/reports" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@500;600;700;800&display=swap');
        
        .font-display { font-family: 'Outfit', sans-serif; }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .navbar-glass {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.8));
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(148, 163, 184, 0.15);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2);
        }
        
        .mobile-menu {
          animation: slideDown 0.3s ease-out;
        }
        
        .nav-link {
          position: relative;
          color: #cbd5e1;
          transition: all 0.3s ease;
        }
        
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #10b981, #06b6d4);
          transition: width 0.3s ease;
        }
        
        .nav-link:hover {
          color: #ffffff;
        }
        
        .nav-link:hover::after {
          width: 100%;
        }
        
        .nav-link.active {
          color: #10b981;
        }
        
        .nav-link.active::after {
          width: 100%;
        }
        
        .profile-dropdown {
          animation: slideDown 0.3s ease-out;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95));
          backdrop-filter: blur(20px);
          border: 1px solid rgba(148, 163, 184, 0.15);
        }
      `}</style>

      <nav className="navbar-glass sticky top-0 z-50 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/dashboard")}>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-lg">₹</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-display font-bold text-white text-lg">ExpenseFlow</h1>
                <p className="text-emerald-400 text-xs">Smart Finance</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a  
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`nav-link text-sm font-medium cursor-pointer ${
                    isActive(link.path) ? "active" : ""
                  }`}
                >
                  {link.name}
                </a>
              ))}
            </div>

            {/* Desktop Profile & Logout */}
            <div className="hidden md:flex items-center gap-4">
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 hover:border-emerald-500/60 transition-all">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-white text-sm font-medium">{user?.name}</span>
                </button>

                {/* Desktop Dropdown */}
                <div className="absolute right-0 mt-2 w-48 rounded-xl profile-dropdown hidden group-hover:block">
                  <div className="p-4 border-b border-slate-700">
                    <p className="text-white text-sm font-medium">{user?.name}</p>
                    <p className="text-slate-400 text-xs">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/20 text-sm font-medium transition-all"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-white p-2 rounded-lg hover:bg-slate-800 transition-all"
            >
              <svg
                className={`w-6 h-6 transition-transform ${isOpen ? "rotate-90" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="mobile-menu md:hidden pb-6">
              <div className="flex flex-col gap-3 mb-4">
                
                {navLinks.map((link) => (
                  <a
                    key={link.path}
                    onClick={() => {
                      navigate(link.path);
                      setIsOpen(false);
                    }}
                    className={`nav-link block px-4 py-2 rounded-lg font-medium text-sm cursor-pointer transition-all ${
                      isActive(link.path)
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    {link.name}
                  </a>
                ))}
              </div>

              {/* Mobile Profile Section */}
              <div className="border-t border-slate-700 pt-4">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="text-left">
                      <p className="text-white text-sm font-medium">{user?.name}</p>
                      <p className="text-slate-400 text-xs">{user?.email}</p>
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 text-emerald-400 transition-transform ${
                      isProfileOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </button>

                {/* Mobile Dropdown */}
                {isProfileOpen && (
                  <div className="mobile-menu mt-3 bg-slate-800/50 rounded-lg p-3">
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                        setIsProfileOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/20 font-medium text-sm rounded-lg transition-all"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}

export default Navbar;