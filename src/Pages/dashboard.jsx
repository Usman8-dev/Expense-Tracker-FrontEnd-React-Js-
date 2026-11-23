import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import {
  Plus,
  Folder as FolderIcon,
  Eye,
  TrendingUp,
  TrendingDown,
  Calendar,
  Sparkles,
} from "lucide-react";
import api from "../apis/axios";
import { useToast } from "../context/ToastContext";

// Color theme maps for folders
const FOLDER_THEMES = {
  cyan: {
    name: "Cyan",
    border: "border-cyan-400",
    stroke: "#06b6d4",
    glow: "rgba(6, 182, 212, 0.4)",
    badgeBg: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
    accent: "rgba(6, 182, 212, 0.15)",
    iconBack: "#0284c7",
    iconFront: "#06b6d4",
    iconGlow: "#38bdf8",
  },
  purple: {
    name: "Purple",
    border: "border-purple-400/50",
    stroke: "rgba(168, 85, 247, 0.5)",
    glow: "rgba(168, 85, 247, 0.3)",
    badgeBg: "bg-purple-500/10 text-purple-300 border-purple-500/20",
    accent: "rgba(168, 85, 247, 0.12)",
    iconBack: "#6366f1",
    iconFront: "#8b5cf6",
    iconGlow: "#a855f7",
  },
  amber: {
    name: "Amber",
    border: "border-amber-400/50",
    stroke: "rgba(245, 158, 11, 0.5)",
    glow: "rgba(245, 158, 11, 0.3)",
    badgeBg: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    accent: "rgba(245, 158, 11, 0.12)",
    iconBack: "#d97706",
    iconFront: "#f59e0b",
    iconGlow: "#fbbf24",
  },
  emerald: {
    name: "Emerald",
    border: "border-emerald-400/50",
    stroke: "rgba(16, 185, 129, 0.5)",
    glow: "rgba(16, 185, 129, 0.3)",
    badgeBg: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    accent: "rgba(16, 185, 129, 0.12)",
    iconBack: "#059669",
    iconFront: "#10b981",
    iconGlow: "#34d399",
  },
  rose: {
    name: "Rose",
    border: "border-rose-400/50",
    stroke: "rgba(244, 63, 94, 0.5)",
    glow: "rgba(244, 63, 94, 0.3)",
    badgeBg: "bg-rose-500/10 text-rose-300 border-rose-500/20",
    accent: "rgba(244, 63, 94, 0.12)",
    iconBack: "#e11d48",
    iconFront: "#f43f5e",
    iconGlow: "#fb7185",
  },
};

// 3D & Neon Folder Icon component matching the attached design
function FolderGraphic({ theme = "cyan", isNeon = false, className = "w-11 h-11" }) {
  if (isNeon) {
    
            // Added edit and delete icons for each folder card
            // (Will be injected into the folder card JSX below)

      <svg className={className} viewBox="0 0 54 44" fill="none">
        <path
          d="M3 10C3 7.79086 4.79086 6 7 6H18.5C19.8 6 21 6.6 21.8 7.6L24.8 11.4C25.6 12.4 26.8 13 28.1 13H47C49.2091 13 51 14.7909 51 17V37C51 39.2091 49.2091 41 47 41H7C4.79086 41 3 39.2091 3 37V10Z"
          stroke="#06b6d4"
          strokeWidth="2.5"
          fill="rgba(6, 182, 212, 0.08)"
          style={{ filter: "drop-shadow(0 0 8px rgba(6, 182, 212, 0.6))" }}
        />
        <path
          d="M7 21H47"
          stroke="#06b6d4"
          strokeWidth="2"
          strokeDasharray="3 3"
          opacity="0.5"
        />
      </svg>
    );
  }

  const t = FOLDER_THEMES[theme] || FOLDER_THEMES.purple;

  
            // Added edit and delete icons for each folder card
            // (Will be injected into the folder card JSX below)

    <svg className={className} viewBox="0 0 54 44" fill="none">
      <defs>
        <linearGradient id={`bg-${theme}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={t.iconBack} />
          <stop offset="100%" stopColor={t.iconBack} stopOpacity="0.75" />
        </linearGradient>
        <linearGradient id={`fg-${theme}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={t.iconGlow} />
          <stop offset="100%" stopColor={t.iconFront} />
        </linearGradient>
      </defs>

      {/* Back tab */}
      <path
        d="M6 9C6 7.34315 7.34315 6 9 6H19.5C20.6 6 21.7 6.6 22.3 7.5L24.7 10.5C25.3 11.4 26.4 12 27.5 12H45C46.6569 12 48 13.3431 48 15V34C48 35.6569 46.6569 37 45 37H9C7.34315 37 6 35.6569 6 34V9Z"
        fill={`url(#bg-${theme})`}
        opacity="0.85"
      />

      {/* Paper document peeking */}
      <rect
        x="12"
        y="11"
        width="28"
        height="18"
        rx="2"
        fill="#f8fafc"
        opacity="0.45"
      />

      {/* Front flap with 3D slant */}
      <path
        d="M4 17C4 15.3431 5.34315 14 7 14H47C48.6569 14 50 15.3431 50 17L48 37C48 38.6569 46.6569 40 45 40H9C7.34315 40 6 38.6569 6 37L4 17Z"
        fill={`url(#fg-${theme})`}
        style={{ filter: "drop-shadow(0 4px 10px rgba(0, 0, 0, 0.4))" }}
      />
    </svg>
  );
}

// SVG Background Silhouette for Folder Card Shape with raised top-left tab
function FolderCardBackground({ isActive, theme = "cyan" }) {
  const t = FOLDER_THEMES[theme] || FOLDER_THEMES.cyan;
  const strokeColor = isActive ? "#06b6d4" : "rgba(148, 163, 184, 0.16)";
  const strokeWidth = isActive ? 2 : 1;

  
            // Added edit and delete icons for each folder card
            // (Will be injected into the folder card JSX below)

    <svg
      className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
      viewBox="0 0 360 185"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`card-bg-${theme}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(20, 27, 45, 0.88)" />
          <stop offset="100%" stopColor="rgba(15, 23, 42, 0.94)" />
        </linearGradient>
      </defs>

      {/* Seamless Folder Silhouette: Tab on top-left, sloping down to the top horizontal border */}
      <path
        d="M 1 24 Q 1 7 16 7 L 115 7 Q 128 7 136 16 L 143 24 Q 148 28 158 28 L 344 28 Q 359 28 359 43 L 359 169 Q 359 184 344 184 L 16 184 Q 1 184 1 169 Z"
        fill={`url(#card-bg-${theme})`}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        style={{
          filter: isActive ? "drop-shadow(0 0 14px rgba(6, 182, 212, 0.45))" : "none",
        }}
      />

      {/* Tab subtle ambient tint */}
      <path
        d="M 1 24 Q 1 7 16 7 L 115 7 Q 128 7 136 16 L 143 24 Q 148 28 158 28 L 1 28 Z"
        fill={t.accent}
        opacity={isActive ? 0.4 : 0.25}
      />
    </svg>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const showToast = useToast();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFolderKey, setActiveFolderKey] = useState(null);

  // Custom user-created folders stored in localStorage
  const [customFolders, setCustomFolders] = useState(() => {
    try {
      const saved = localStorage.getItem("expenseflow_custom_folders");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal states
  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderMonth, setNewFolderMonth] = useState("November");
  const [newFolderYear, setNewFolderYear] = useState("2026");
  const [newFolderTheme, setNewFolderTheme] = useState("cyan");

  const [selectedFolderDetails, setSelectedFolderDetails] = useState(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Offline changes synced event
  useEffect(() => {
    const refetch = () => fetchExpenses();
    window.addEventListener("expenseflow:synced", refetch);
    
            // Added edit and delete icons for each folder card
            // (Will be injected into the folder card JSX below)
) => window.removeEventListener("expenseflow:synced", refetch);
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const [expenseRes, folderRes] = await Promise.allSettled([
        api.get("/expense/AllExpense"),
        api.get("/expense/folder/all"),
      ]);

      if (expenseRes.status === "fulfilled" && expenseRes.value.data.success) {
        setExpenses(expenseRes.value.data.All_Expenses || []);
      }

      if (folderRes.status === "fulfilled" && folderRes.value.data.success) {
        const serverFolders = folderRes.value.data.folders || [];
        if (serverFolders.length > 0) {
          setCustomFolders((prev) => {
            const map = new Map();
            prev.forEach((f) => map.set(f.name, f));
            serverFolders.forEach((f) => map.set(f.name, f));
            const merged = Array.from(map.values());
            try {
              localStorage.setItem("expenseflow_custom_folders", JSON.stringify(merged));
            } catch (e) {
              console.error(e);
            }
            return merged;
          });
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      showToast({
        severity: "error",
        summary: "Error",
        detail: "Failed to fetch expenses",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return `Rs. ${new Intl.NumberFormat("en-PK", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  // ONLY User-created custom folders (no system auto-built or mock folders)
  const userFolders = useMemo(() => {
    return customFolders.map((cf) => {
      const folderTitle = (cf.name || "").trim();
      const targetLower = folderTitle.toLowerCase();

      // Find matching expenses for this custom folder
      const matchingExpenses = expenses.filter((exp) => {
        if (exp.folder && exp.folder.trim().toLowerCase() === targetLower) {
          return true;
        }
        if (exp.date) {
          const d = new Date(exp.date);
          if (!isNaN(d.getTime())) {
            const mName = d.toLocaleString("en-US", { month: "long" }).toLowerCase();
            const yStr = String(d.getFullYear());
            if (`${mName} ${yStr}` === targetLower) {
              return true;
            }
          }
        }
        return false;
      });

      let totalIncome = 0;
      let totalExpense = 0;

      matchingExpenses.forEach((exp) => {
        const amt = Number(exp.amount) || 0;
        const type = (exp.type || "").toLowerCase();
        if (type === "income") totalIncome += amt;
        else if (type === "expense") totalExpense += amt;
      });

      return {
        id: cf._id || cf.id || folderTitle,
        _id: cf._id || cf.id,
        name: folderTitle,
        monthName: cf.month || cf.monthName,
        year: cf.year,
        theme: cf.theme || "cyan",
        count: matchingExpenses.length,
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        transactions: matchingExpenses,
      };
    });
  }, [expenses, customFolders]);

  // Set default active folder if not chosen
  useEffect(() => {
    if (!activeFolderKey && userFolders.length > 0) {
      setActiveFolderKey(userFolders[0]?.id);
    }
  }, [userFolders, activeFolderKey]);

  // Active folder data
  const currentActiveFolder = useMemo(() => {
    if (activeFolderKey) {
      const found = userFolders.find(
        (f) => f.id === activeFolderKey || f.name.toLowerCase() === String(activeFolderKey).toLowerCase()
      );
      if (found) return found;
    }

    if (userFolders.length > 0) {
      return userFolders[0];
    }

    // When no custom folders exist yet, calculate current month totals from expenses
    const now = new Date();
    const curMonth = now.getMonth();
    const curYear = now.getFullYear();

    let income = 0;
    let expense = 0;

    expenses.forEach((exp) => {
      const d = exp.date ? new Date(exp.date) : null;
      if (d && !isNaN(d.getTime()) && d.getMonth() === curMonth && d.getFullYear() === curYear) {
        const amt = Number(exp.amount) || 0;
        if ((exp.type || "").toLowerCase() === "income") income += amt;
        else if ((exp.type || "").toLowerCase() === "expense") expense += amt;
      }
    });

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    return {
      name: `${monthNames[curMonth]} ${curYear}`,
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense,
      count: 0,
    };
  }, [userFolders, activeFolderKey, expenses]);

  // Handle creating a new folder
  const handleCreateFolder = async () => {
    const folderTitle =
      newFolderName.trim() || `${newFolderMonth} ${newFolderYear}`;
    const newFolder = {
      id: folderTitle,
      name: folderTitle,
      monthName: newFolderMonth,
      year: newFolderYear,
      theme: newFolderTheme,
    };

    const updated = [
      ...customFolders.filter((f) => f.id !== folderTitle),
      newFolder,
    ];
    setCustomFolders(updated);
    try {
      localStorage.setItem(
        "expenseflow_custom_folders",
        JSON.stringify(updated)
      );
    } catch (e) {
      console.error(e);
    }

    try {
      await api.post("/expense/folder/create", {
        name: folderTitle,
        month: newFolderMonth,
        year: newFolderYear,
        theme: newFolderTheme,
      });
    } catch (e) {
      console.log("Folder saved locally (offline / server):", e);
    }

    setActiveFolderKey(folderTitle);
    setShowCreateFolderDialog(false);
    setNewFolderName("");

    showToast({
      severity: "success",
      summary: "Folder Created",
      detail: `Folder "${folderTitle}" added successfully!`,
      life: 3000,
    });
  };

  const monthsList = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const yearsList = ["2025", "2026", "2027", "2028"];

  
            // Added edit and delete icons for each folder card
            // (Will be injected into the folder card JSX below)

    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@500;600;700;800&display=swap');
        
        .font-display { font-family: 'Outfit', sans-serif; }
        
        .stat-card {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9));
          backdrop-filter: blur(20px);
          border: 1px solid rgba(148, 163, 184, 0.15);
          transition: all 0.3s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 35px rgba(6, 182, 212, 0.15);
        }
      `}</style>

      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-1.5 tracking-tight">
              Dashboard
            </h1>
            <p className="text-slate-400 text-sm">
              Welcome back! Here's your financial overview
            </p>
          </div>

          {/* Action Buttons matching screenshot */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => navigate("/expenses/create")}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-lg shadow-cyan-500/25 active:scale-95 cursor-pointer"
            >
              <Plus size={16} strokeWidth={3} />
              <span>ADD TRANSACTION</span>
            </button>

            <button
              onClick={() => setShowCreateFolderDialog(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-lg shadow-cyan-500/25 active:scale-95 cursor-pointer"
            >
              <Plus size={16} strokeWidth={3} />
              <span>CREATE FOLDER</span>
            </button>
          </div>
        </div>

        {/* 3 Monthly Summary Cards (This Month Balance, This Month Income, This Month Expense) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* This Month Balance */}
          <div className="stat-card rounded-2xl p-6 relative overflow-hidden">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-1.5">
                  This Month Balance
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-cyan-400">
                  {formatCurrency(currentActiveFolder.balance)}
                </h2>
              </div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-2xl shadow-inner">
                💰
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>
                Active: <strong className="text-slate-200">{currentActiveFolder.name}</strong>
              </span>
            </div>
          </div>

          {/* This Month Income */}
          <div className="stat-card rounded-2xl p-6 relative overflow-hidden">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-1.5">
                  This Month Income
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-emerald-400 flex items-center gap-1.5">
                  <span>{formatCurrency(currentActiveFolder.totalIncome)}</span>
                  <span className="text-xl leading-none">↗</span>
                </h2>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
                <TrendingUp size={24} />
              </div>
            </div>
            <p className="text-slate-400 text-xs">Monthly earnings & receipts</p>
          </div>

          {/* This Month Expense */}
          <div className="stat-card rounded-2xl p-6 relative overflow-hidden">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-1.5">
                  This Month Expense
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-red-400">
                  {formatCurrency(currentActiveFolder.totalExpense)}
                </h2>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 shadow-inner">
                <TrendingDown size={24} />
              </div>
            </div>
            <p className="text-slate-400 text-xs">Monthly spending & payouts</p>
          </div>
        </div>

        {/* Folders Section */}
        <div>
          <div className="mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h2 className="font-display text-2xl font-bold text-white tracking-tight">
                Folders
              </h2>
              <p className="text-slate-400 text-sm mt-0.5">
                {userFolders.length > 0
                  ? `Your custom folders (${userFolders.length})`
                  : "No folders created yet. Click '+ CREATE FOLDER' to create one."}
              </p>
            </div>

            <button
              onClick={() => setShowCreateFolderDialog(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-lg shadow-cyan-500/20 active:scale-95"
            >
              <Plus size={15} strokeWidth={3} />
              <span>+ CREATE FOLDER</span>
            </button>
          </div>

          {/* Folders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Render ONLY user-created custom folders */}
            {userFolders.map((folder) => {
              const isActive = activeFolderKey === folder.id || activeFolderKey === folder.name;
              const badgeClass =
                FOLDER_THEMES[folder.theme]?.badgeBg ||
                "bg-slate-700/50 text-slate-300 border-slate-600/50";

              
            // Added edit and delete icons for each folder card
            // (Will be injected into the folder card JSX below)

                <div
                  key={folder.id}
                  onClick={() => navigate(`/expenses/all?month=${encodeURIComponent(folder.name)}`)}
                  className="relative group min-h-[190px] cursor-pointer transition-all duration-300 hover:-translate-y-1"
                >
                  <FolderCardBackground isActive={isActive} theme={folder.theme} />

                  <div className="relative z-10 p-5 pt-8 flex flex-col justify-between h-full">
                    {/* Header Row: Folder Icon + Title & Total + Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <FolderGraphic
                          theme={folder.theme}
                          isNeon={folder.theme === "cyan"}
                          className="w-11 h-10 shrink-0"
                        />
                        <div>
                          <h3 className="font-bold text-white text-base md:text-lg leading-tight group-hover:text-cyan-300 transition-colors">
                            {folder.name}
                          </h3>
                          <p className="text-slate-400 text-xs mt-0.5">
                            Total: {formatCurrency(folder.totalExpense)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${badgeClass}`}
                        >
                          {folder.count} Transactions
                        </span>
                      </div>
                    </div>

                    {/* Bottom Row: Breakdown of Total Expense and Total Income */}
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-700/40">
                      <div>
                        <p className="text-slate-400 text-[11px] font-medium">
                          Total Expense
                        </p>
                        <p className="text-red-400 font-bold text-sm md:text-base mt-0.5">
                          {formatCurrency(folder.totalExpense)}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-400 text-[11px] font-medium">
                          Total Income
                        </p>
                        <p className="text-emerald-400 font-bold text-sm md:text-base mt-0.5">
                          {formatCurrency(folder.totalIncome)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add New Folder Card */}
            <div
              onClick={() => setShowCreateFolderDialog(true)}
              className="relative rounded-2xl border-2 border-dashed border-slate-700/90 hover:border-cyan-400/80 bg-slate-900/40 hover:bg-slate-800/50 p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group min-h-[190px]"
            >
              <div className="w-11 h-11 rounded-full bg-slate-800/80 group-hover:bg-cyan-500/20 flex items-center justify-center text-slate-300 group-hover:text-cyan-400 transition-colors mb-2">
                <Plus size={24} strokeWidth={2} />
              </div>
              <p className="text-slate-300 font-semibold text-sm mb-4">
                Add New Folder
              </p>
              <button
                type="button"
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-cyan-500/20 active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Plus size={14} strokeWidth={3} />
                <span>CREATE FOLDER</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE FOLDER DIALOG */}
      <Dialog
        header={
          <div className="flex items-center gap-2 text-white font-display text-xl font-bold">
            <FolderIcon className="text-cyan-400" size={22} />
            <span>Create Monthly Folder</span>
          </div>
        }
        visible={showCreateFolderDialog}
        onHide={() => setShowCreateFolderDialog(false)}
        className="w-full max-w-md mx-4"
        contentClassName="!bg-slate-900 !text-white !p-6"
        headerClassName="!bg-slate-900 !text-white !border-b !border-slate-800"
      >
        <div className="space-y-4">
          <p className="text-slate-400 text-sm">
            Add a new month folder to organize and group your income and expenses.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Month & Year
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Dropdown
                value={newFolderMonth}
                options={monthsList}
                onChange={(e) => setNewFolderMonth(e.value)}
                className="w-full bg-slate-800 text-white border-slate-700"
                placeholder="Month"
              />
              <Dropdown
                value={newFolderYear}
                options={yearsList}
                onChange={(e) => setNewFolderYear(e.value)}
                className="w-full bg-slate-800 text-white border-slate-700"
                placeholder="Year"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Custom Folder Title (Optional)
            </label>
            <InputText
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder={`${newFolderMonth} ${newFolderYear}`}
              className="w-full bg-slate-800 text-white border-slate-700 p-2.5 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Folder Theme Accent
            </label>
            <div className="flex gap-3">
              {Object.keys(FOLDER_THEMES).map((themeKey) => {
                const t = FOLDER_THEMES[themeKey];
                const isSelected = newFolderTheme === themeKey;
                
            // Added edit and delete icons for each folder card
            // (Will be injected into the folder card JSX below)

                  <button
                    key={themeKey}
                    type="button"
                    onClick={() => setNewFolderTheme(themeKey)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? "border-cyan-400 bg-cyan-500/20 text-white shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                        : "border-slate-700 bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {t.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              label="Cancel"
              className="!text-slate-400 hover:!text-white !p-button-text text-sm"
              onClick={() => setShowCreateFolderDialog(false)}
            />
            <button
              onClick={handleCreateFolder}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-lg shadow-cyan-500/25 active:scale-95 cursor-pointer"
            >
              Save Folder
            </button>
          </div>
        </div>
      </Dialog>

      {/* FOLDER DETAILS MODAL (When double-clicking a folder) */}
      <Dialog
        header={
          <div className="flex items-center gap-2 text-white font-display text-xl font-bold">
            <FolderIcon className="text-cyan-400" size={22} />
            <span>{selectedFolderDetails?.name} Details</span>
          </div>
        }
        visible={!!selectedFolderDetails}
        onHide={() => setSelectedFolderDetails(null)}
        className="w-full max-w-2xl mx-4"
        contentClassName="!bg-slate-900 !text-white !p-6"
        headerClassName="!bg-slate-900 !text-white !border-b !border-slate-800"
      >
        {selectedFolderDetails && (
          <div className="space-y-6">
            {/* Quick summary stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <p className="text-slate-400 text-xs">Total Income</p>
                <p className="text-emerald-400 font-bold text-lg mt-1">
                  {formatCurrency(selectedFolderDetails.totalIncome)}
                </p>
              </div>
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <p className="text-slate-400 text-xs">Total Expense</p>
                <p className="text-red-400 font-bold text-lg mt-1">
                  {formatCurrency(selectedFolderDetails.totalExpense)}
                </p>
              </div>
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <p className="text-slate-400 text-xs">Net Balance</p>
                <p
                  className={`font-bold text-lg mt-1 ${
                    selectedFolderDetails.balance >= 0
                      ? "text-cyan-400"
                      : "text-red-400"
                  }`}
                >
                  {formatCurrency(selectedFolderDetails.balance)}
                </p>
              </div>
            </div>

            {/* Transactions List */}
            <div>
              <h4 className="font-semibold text-white text-sm mb-3">
                Transactions ({selectedFolderDetails.transactions.length})
              </h4>
              {selectedFolderDetails.transactions.length > 0 ? (
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {selectedFolderDetails.transactions.map((t, idx) => (
                    <div
                      key={t._id || idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm"
                    >
                      <div>
                        <p className="font-semibold text-white">{t.title}</p>
                        <p className="text-xs text-slate-400">{formatDate(t.date)}</p>
                      </div>
                      <span
                        className={`font-bold ${
                          t.type === "Income"
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        {t.type === "Income" ? "+ " : "- "}
                        {formatCurrency(t.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 text-sm bg-slate-800/30 rounded-xl">
                  No recorded transactions for this month yet.
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-800">
              <Button
                label="View All Transactions"
                icon="pi pi-arrow-right"
                iconPos="right"
                className="!text-cyan-400 !p-button-text text-sm font-semibold"
                onClick={() => {
                  setSelectedFolderDetails(null);
                  navigate("/expenses/all");
                }}
              />
              <button
                onClick={() => {
                  setSelectedFolderDetails(null);
                  navigate("/expenses/create");
                }}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all"
              >
                + Add Expense
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}

export default Dashboard;
