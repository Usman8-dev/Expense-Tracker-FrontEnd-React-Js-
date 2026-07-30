import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  ArrowLeftRight,
  PlusCircle,
  BarChart3,
  Tags,
  User,
} from "lucide-react";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: "📊" },
    { name: "Transaction", path: "/expenses/create", icon: "💳" },
    { name: "Categories", path: "/categories", icon: "📂" },
    { name: "Reports", path: "/expense/reports", icon: "📈" },
  ];

  const bottomNavLinks = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Transactions", path: "/expenses/all", icon: ArrowLeftRight },
    { name: "Add", path: "/expenses/create", icon: PlusCircle, isCenter: true },
    { name: "Reports", path: "/expense/reports", icon: BarChart3 },
    { name: "Categories", path: "/categories", icon: Tags },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@500;600;700;800&display=swap');
        
        .font-display { font-family: 'Outfit', sans-serif; }
        
        @keyframes slideRight {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .sidebar-glass {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95));
          backdrop-filter: blur(20px);
          border-right: 1px solid rgba(148, 163, 184, 0.15);
          box-shadow: 8px 0 32px 0 rgba(31, 38, 135, 0.2);
        }
        
        .navbar-top {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95));
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(148, 163, 184, 0.15);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2);
        }
        
        .sidebar-item {
          animation: slideRight 0.3s ease-out;
        }
        
        .nav-link {
          position: relative;
          color: #cbd5e1;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 10px;
          cursor: pointer;
        }
        
        .nav-link::after {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 3px;
          background: linear-gradient(180deg, #10b981, #06b6d4);
          border-radius: 0 10px 10px 0;
          transform: scaleY(0);
          transition: transform 0.3s ease;
        }
        
        .nav-link:hover {
          color: #ffffff;
          background: rgba(16, 185, 129, 0.1);
        }
        
        .nav-link:hover::after {
          transform: scaleY(1);
        }
        
        .nav-link.active {
          color: #10b981;
          background: rgba(16, 185, 129, 0.15);
        }
        
        .nav-link.active::after {
          transform: scaleY(1);
        }
        
        .overlay {
          animation: fadeIn 0.3s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      {/* Mobile Top Bar */}
      {/* Mobile Top Bar */}
      <div className="navbar-top fixed top-0 left-0 right-0 md:hidden z-40 h-16">
        <div className="flex items-center justify-between h-full px-4">
          {/* Hamburger Menu */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-slate-800 transition-all"
          >
            <svg
              className={`w-6 h-6 text-white transition-transform ${isOpen ? "rotate-90" : ""}`}
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

          {/* App Name - Centered */}
          <div className="flex items-center gap-2 flex-1 justify-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">Rs.</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-white text-base">
                ExpenseFlow
              </h1>
            </div>
          </div>

          {/* User Avatar */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`sidebar-glass fixed left-0 top-0 h-screen w-64 transform transition-transform duration-300 z-50 overflow-y-auto pt-20 md:pt-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo Section - Hidden on Mobile */}
        <div className="sidebar-item sticky top-0 bg-gradient-to-b from-slate-900 to-transparent p-6 border-b border-slate-700/50">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => {
              navigate("/dashboard");
              setIsOpen(false);
            }}
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">Rs.</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-white text-lg">
                ExpenseFlow
              </h1>
              <p className="text-emerald-400 text-xs">Smart Finance</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-item p-4 flex flex-col gap-2">
          {navLinks.map((link) => (
            <a
              key={link.path}
              onClick={() => {
                navigate(link.path);
                setIsOpen(false);
              }}
              className={`nav-link ${isActive(link.path) ? "active" : ""}`}
            >
              <span className="text-xl">{link.icon}</span>
              <span className="font-medium text-sm">{link.name}</span>
            </a>
          ))}
        </nav>

        {/* Profile Section */}
        <div className="sidebar-item absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950 to-transparent border-t border-slate-700/50">
          <div className="mb-4 p-4 rounded-lg bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {user?.name}
                </p>
                <p className="text-slate-400 text-xs truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full px-3 py-2 text-red-400 hover:bg-red-500/20 font-medium text-sm rounded-lg transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for Mobile */}
      {isOpen && (
        <div
          className="overlay fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Bottom Navigation - Mobile Only */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden z-40">
        <div className="navbar-top border-t border-slate-700/50">
          <div className="flex items-center justify-around px-2 py-2">
            {bottomNavLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);

              if (link.isCenter) {
                return (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className="flex flex-col items-center justify-center -mt-6"
                  >
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 transition-all">
                      <Icon size={26} className="text-white" />
                    </div>
                  </button>
                );
              }

              return (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className="flex flex-col items-center gap-1 px-3 py-1.5 min-w-[60px]"
                >
                  <Icon
                    size={20}
                    className={active ? "text-emerald-400" : "text-slate-400"}
                  />
                  <span
                    className={`text-[10px] font-medium ${
                      active ? "text-emerald-400" : "text-slate-500"
                    }`}
                  >
                    {link.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;
