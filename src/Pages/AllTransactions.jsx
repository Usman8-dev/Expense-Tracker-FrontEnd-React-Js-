import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";

import { Dialog } from "primereact/dialog";


import {
  TrendingUp,
  TrendingDown,
  Search,
  ArrowLeft,
  Receipt,
  Pencil,
  Trash2,
  Folder as FolderIcon,
  X,
} from "lucide-react";
import api from "../apis/axios";
import { useToast } from "../context/ToastContext";

function AllTransactions() {
  const navigate = useNavigate();
  const showToast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // Selected folder/month state
  const [selectedMonth, setSelectedMonth] = useState(
    () => searchParams.get("month") || ""
  );

  useEffect(() => {
    const m = searchParams.get("month") || "";
    setSelectedMonth(m);
  }, [searchParams]);

  const handleSelectMonth = (monthName) => {
    setSelectedMonth(monthName);
    if (monthName) {
      setSearchParams({ month: monthName });
    } else {
      setSearchParams({});
    }
  };

  // Multi-select (bulk delete) state
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectionActive, setSelectionActive] = useState(false); // turned on by long-press on mobile
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 767px)").matches;
  });

  // Long-press helpers
  const pressTimerRef = useRef(null);
  const pressStartRef = useRef(null);
  const longPressFiredRef = useRef(false);

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Offline changes just landed on the server: refresh to clear pending rows.
  useEffect(() => {
    const refetch = () => fetchExpenses();
    window.addEventListener("expenseflow:synced", refetch);
    return () => window.removeEventListener("expenseflow:synced", refetch);
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await api.get("/expense/AllExpense");

      if (response.data.success) {
        setExpenses(response.data.All_Expenses || []);
      } else {
        showToast({
          severity: "error",
          summary: "Failed",
          detail: response.data.message || "Could not load transactions",
          life: 3000,
        });
      }
    } catch (error) {
      showToast({
        severity: "error",
        summary: "Failed",
        detail: error.response?.data?.message || "Could not load transactions",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Available folders / months from expenses + custom folders + sample defaults
  const availableFolders = useMemo(() => {
    const map = new Map();

    expenses.forEach((exp) => {
      const d = new Date(exp.date);
      if (!isNaN(d.getTime())) {
        const monthName = d.toLocaleString("en-US", { month: "long" });
        const year = d.getFullYear();
        const key = `${monthName} ${year}`;
        if (!map.has(key)) {
          map.set(key, { name: key, count: 0, income: 0, expense: 0 });
        }
        const item = map.get(key);
        item.count += 1;
        const amt = Number(exp.amount) || 0;
        const type = (exp.type || "").toLowerCase();
        if (type === "income") item.income += amt;
        else if (type === "expense") item.expense += amt;
      }
    });

    // Custom folders from localStorage
    try {
      const saved = localStorage.getItem("expenseflow_custom_folders");
      if (saved) {
        const custom = JSON.parse(saved);
        custom.forEach((cf) => {
          if (!map.has(cf.name)) {
            map.set(cf.name, { name: cf.name, count: 0, income: 0, expense: 0 });
          }
        });
      }
    } catch (e) {
      console.error(e);
    }

    // Default months matching the mockup
    const defaultMockMonths = [
      "October 2026",
      "September 2026",
      "August 2026",
      "July 2026",
    ];
    defaultMockMonths.forEach((m) => {
      if (!map.has(m)) {
        map.set(m, { name: m, count: 0, income: 0, expense: 0 });
      }
    });

    return Array.from(map.values());
  }, [expenses]);

  // Filtered transactions for the selected month
  const displayExpenses = useMemo(() => {
    if (!selectedMonth || selectedMonth === "ALL") return expenses;
    return expenses.filter((exp) => {
      const d = new Date(exp.date);
      if (isNaN(d.getTime())) return false;
      const monthName = d.toLocaleString("en-US", { month: "long" });
      const year = d.getFullYear();
      const key = `${monthName} ${year}`;
      return key.toLowerCase() === selectedMonth.toLowerCase();
    });
  }, [expenses, selectedMonth]);

  // Selected month stats: Income, Expense, Balance
  const selectedMonthStats = useMemo(() => {
    let income = 0;
    let expense = 0;

    if (displayExpenses.length > 0) {
      displayExpenses.forEach((exp) => {
        const amt = Number(exp.amount) || 0;
        const type = (exp.type || "").toLowerCase();
        if (type === "income") income += amt;
        else if (type === "expense") expense += amt;
      });
    } else if (selectedMonth) {
      // Fallback numbers for sample mockup months if not yet in database
      const samples = {
        "october 2026": { income: 3500, expense: 1751 },
        "september 2026": { income: 3500, expense: 732 },
        "august 2026": { income: 3500, expense: 300 },
        "july 2026": { income: 3500, expense: 450 },
      };
      const s = samples[selectedMonth.toLowerCase()];
      if (s) {
        income = s.income;
        expense = s.expense;
      }
    } else {
      // Overall total across all records
      expenses.forEach((exp) => {
        const amt = Number(exp.amount) || 0;
        const type = (exp.type || "").toLowerCase();
        if (type === "income") income += amt;
        else if (type === "expense") expense += amt;
      });
    }

    const balance = income - expense;
    return { income, expense, balance };
  }, [displayExpenses, expenses, selectedMonth]);

  // Keep the mobile/desktop flag in sync.
  // Phones (<768px) hide the checkboxes until a long-press, tablet/laptop always show them.
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const handleChange = (event) => {
      setIsMobile(event.matches);
      if (!event.matches) setSelectionActive(false);
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

const handleDelete = (id, title) => {
  confirmDialog({
    message: `Do you want to delete this transaction?`,
    header: "Delete Confirmation",
    icon: "pi pi-info-circle",
    acceptClassName: "p-button-danger",
    acceptLabel: "Delete",
    rejectLabel: "Cancel",
    accept: async () => {
      try {
        setDeletingId(id);
        await api.delete(`/expense/delete/${id}`);
        showToast({
          severity: "success",
          summary: "Deleted",
          detail: "Transaction deleted successfully",
          life: 3000,
        });
        setExpenses((prev) =>
          prev.filter((item) => (item._id || item.id) !== id)
        );
        setSelectedRows((prev) =>
          prev.filter((row) => (row._id || row.id) !== id)
        );
      } catch (error) {
        showToast({
          severity: "error",
          summary: "Failed",
          detail:
            error.response?.data?.message || "Could not delete transaction",
          life: 3000,
        });
      } finally {
        setDeletingId(null);
      }
    },
  });
};

  const formatCurrency = (value) => {
    return `Rs. ${new Intl.NumberFormat("en-PK").format(value || 0)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();
    const time = date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${day} ${month}, ${year} at ${time}`;
  };

  const titleBodyTemplate = (rowData) => (
    <div className="flex items-center gap-3 py-1">
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
          rowData.type === "Income"
            ? "bg-gradient-to-br from-emerald-400/20 to-teal-500/20 border border-emerald-500/30"
            : "bg-gradient-to-br from-red-400/20 to-orange-500/20 border border-red-500/30"
        }`}
      >
        {rowData.type === "Income" ? (
          <TrendingUp size={16} className="text-emerald-400" />
        ) : (
          <TrendingDown size={16} className="text-red-400" />
        )}
      </div>
      <span className="font-semibold text-white text-sm">{rowData.title}</span>
      {rowData.__pending && (
        <span
          className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30"
          title="Saved offline - it will sync automatically"
        >
          ⏳ Pending
        </span>
      )}
    </div>
  );

  const dateBodyTemplate = (rowData) => (
    <span className="text-slate-400 text-sm">{formatDate(rowData.date)}</span>
  );

  const amountBodyTemplate = (rowData) => (
    <span
      className={`font-bold text-sm ${
        rowData.type === "Income" ? "text-emerald-400" : "text-red-400"
      }`}
    >
      {rowData.type === "Income" ? "+ " : "- "}
      {formatCurrency(rowData.amount)}
    </span>
  );

  const typeBodyTemplate = (rowData) => (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
        rowData.type === "Income"
          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
          : "bg-red-500/15 text-red-400 border border-red-500/30"
      }`}
    >
      {rowData.type === "Income" ? "Income" : "Expense"}
    </span>
  );

  const descriptionBodyTemplate = (rowData) => (
    <span className="text-slate-400 text-sm">{rowData.description || "—"}</span>
  );

    const categoryBodyTemplate = (rowData) => (
    <span className="text-slate-400 text-sm">{rowData.category_id?.name || "—"}</span>
  );


 const actionsBodyTemplate = (rowData) => {
  const id = rowData._id || rowData.id;
  const isDeleting = deletingId === id;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => navigate(`/expenses/edit/${id}`)}
        className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors"
        title="Edit"
      >
        <Pencil size={14} />
      </button>
      <button
        // onClick={() => handleDelete(id, rowData.title)}
        onClick={() => handleDelete(rowData._id || rowData.id)}
        disabled={isDeleting}
        className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 transition-colors disabled:opacity-50"
        title="Delete"
      >
        {isDeleting ? (
          <i className="pi pi-spin pi-spinner text-xs" />
        ) : (
          <Trash2 size={14} />
        )}
      </button>
    </div>
  );
};

  const clearLongPress = useCallback(() => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    pressStartRef.current = null;
    if (typeof document !== "undefined") {
      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
    }
  }, []);

  // Cancel a pending long-press when the user scrolls or moves their finger.
  useEffect(() => {
    const handleMove = (event) => {
      if (!pressTimerRef.current || !pressStartRef.current) return;
      const point =
        event.touches && event.touches[0] ? event.touches[0] : event;
      const dx = Math.abs(point.clientX - pressStartRef.current.x);
      const dy = Math.abs(point.clientY - pressStartRef.current.y);
      if (dx > 12 || dy > 12) clearLongPress();
    };
    const handleRelease = () => clearLongPress();

    window.addEventListener("touchmove", handleMove, { passive: true });
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleRelease);
    window.addEventListener("touchend", handleRelease);
    window.addEventListener("touchcancel", handleRelease);
    window.addEventListener("pointercancel", handleRelease);
    window.addEventListener("scroll", handleRelease, true);
    return () => {
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleRelease);
      window.removeEventListener("touchend", handleRelease);
      window.removeEventListener("touchcancel", handleRelease);
      window.removeEventListener("pointercancel", handleRelease);
      window.removeEventListener("scroll", handleRelease, true);
      clearLongPress();
    };
  }, [clearLongPress]);

  // Long-press a row (mobile only) to enter selection mode and select it.
  const handleRowPointerDown = (event) => {
    if (!isMobile) return; // On tablet/laptop the checkboxes are always visible
    const row = event.data;
    if (!row) return;

    clearLongPress();
    longPressFiredRef.current = false;

    const originalEvent = event.originalEvent;
    pressStartRef.current = {
      x: originalEvent?.clientX ?? 0,
      y: originalEvent?.clientY ?? 0,
    };
    if (typeof document !== "undefined") {
      document.body.style.userSelect = "none";
      document.body.style.webkitUserSelect = "none";
    }

    pressTimerRef.current = setTimeout(() => {
      pressTimerRef.current = null;
      longPressFiredRef.current = true;

      const id = row._id || row.id;
      setSelectedRows((prev) =>
        prev.some((item) => (item._id || item.id) === id)
          ? prev
          : [...prev, row]
      );
      setSelectionActive(true);

      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try {
          navigator.vibrate(20);
        } catch {
          // ignore browsers that don't support vibration
        }
      }
    }, 500);
  };

  const handleRowPointerUp = () => {
    clearLongPress();
  };

  // Swallow the "ghost" click browsers fire after a long press so it doesn't
  // immediately toggle the row we just selected.
  const handleTableClickCapture = (event) => {
    if (!longPressFiredRef.current) return;

    const target = event.target;
    const isControl =
      target instanceof Element &&
      (["INPUT", "TEXTAREA", "BUTTON", "A"].includes(target.nodeName) ||
        target.closest("button, a, input, textarea, .p-checkbox, .p-button"));

    if (!isControl) {
      event.preventDefault();
      event.stopPropagation();
    }
    longPressFiredRef.current = false;
  };

  const handleContextMenu = (event) => {
    if (isMobile) event.preventDefault();
  };

  const cancelSelection = () => {
    setSelectedRows([]);
    setSelectionActive(false);
    longPressFiredRef.current = false;
  };

  const handleBulkDelete = () => {
    const ids = selectedRows.map((row) => row._id || row.id);
    if (ids.length === 0) return;

    confirmDialog({
      message: `Do you want to delete ${ids.length} selected transaction${
        ids.length !== 1 ? "s" : ""
      }?`,
      header: "Delete Confirmation",
      icon: "pi pi-info-circle",
      acceptClassName: "p-button-danger",
      acceptLabel: "Delete",
      rejectLabel: "Cancel",
      accept: async () => {
        try {
          setBulkDeleting(true);
          const results = await Promise.allSettled(
            ids.map((id) => api.delete(`/expense/delete/${id}`))
          );
          const deletedIds = ids.filter(
            (_, index) => results[index].status === "fulfilled"
          );
          const failedCount = ids.length - deletedIds.length;

          if (deletedIds.length > 0) {
            setExpenses((prev) =>
              prev.filter((item) => !deletedIds.includes(item._id || item.id))
            );
            setSelectedRows((prev) =>
              prev.filter((row) => !deletedIds.includes(row._id || row.id))
            );
          }

          if (failedCount === 0) {
            setSelectedRows([]);
            setSelectionActive(false);
            showToast({
              severity: "success",
              summary: "Deleted",
              detail: `${deletedIds.length} transaction${
                deletedIds.length !== 1 ? "s" : ""
              } deleted successfully`,
              life: 3000,
            });
          } else {
            showToast({
              severity: "error",
              summary: "Partial failure",
              detail: `${deletedIds.length} deleted, ${failedCount} failed`,
              life: 3000,
            });
          }
        } catch (error) {
          showToast({
            severity: "error",
            summary: "Failed",
            detail:
              error.response?.data?.message || "Could not delete transactions",
            life: 3000,
          });
        } finally {
          setBulkDeleting(false);
        }
      },
    });
  };

  // Checkboxes: always visible on tablet/laptop, revealed by long-press on phones
  const showCheckboxes = !isMobile || selectionActive;
  const showBulkBar =
    showCheckboxes && (selectedRows.length > 0 || selectionActive);

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const renderHeader = () => {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Receipt size={15} />
            </div>
            <span className="text-white text-sm font-semibold">
              {selectedMonth
                ? `${displayExpenses.length} Transactions in Folder`
                : `${displayExpenses.length} Transaction${displayExpenses.length !== 1 ? "s" : ""}`}
            </span>
            {showCheckboxes && selectedRows.length > 0 && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {selectedRows.length} selected
              </span>
            )}
          </div>
          {isMobile && !selectionActive && displayExpenses.length > 0 && (
            <span className="text-[11px] text-slate-500">
              Long-press a transaction to select &amp; delete
            </span>
          )}
        </div>
        <div className="relative w-full sm:w-80">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
          />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Search transactions..."
            className="!w-full !bg-slate-800/60 !border-slate-700/60 !text-white placeholder:!text-slate-500 !rounded-xl !pl-10 !pr-4 !py-2.5 !text-sm focus:!border-emerald-500/50 transition-all"
          />
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@500;600;700;800&display=swap');
        
        .font-display { font-family: 'Outfit', sans-serif; }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .stat-card {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9));
          backdrop-filter: blur(20px);
          border: 1px solid rgba(148, 163, 184, 0.15);
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 30px rgba(6, 182, 212, 0.15);
        }
        
        .card-glass {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.8));
          backdrop-filter: blur(20px);
          border: 1px solid rgba(148, 163, 184, 0.12);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2);
          animation: slideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }

        .p-datatable-wrapper {
          border-radius: 16px !important;
          overflow-x: auto !important;
          -webkit-overflow-scrolling: touch;
        }
        
        .p-datatable {
          background: transparent !important;
          color: #ffffff !important;
          border-radius: 16px;
        }

        .p-datatable-header {
          background: transparent !important;
          border: none !important;
          padding: 0 0 20px 0 !important;
        }
        
        .p-datatable .p-datatable-thead > tr > th {
          background: rgba(15, 23, 42, 0.9) !important;
          color: #94a3b8 !important;
          border: none !important;
          border-bottom: 1px solid rgba(148, 163, 184, 0.12) !important;
          padding: 14px 16px !important;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.05em;
        }
        
        .p-datatable .p-datatable-tbody > tr {
          background: rgba(255, 255, 255, 0.01) !important;
          transition: background 0.2s ease;
        }
        
        .p-datatable .p-datatable-tbody > tr.p-row-odd {
          background: rgba(255, 255, 255, 0.02) !important;
        }
        
        .p-datatable .p-datatable-tbody > tr > td {
          padding: 16px !important;
          border: none !important;
          border-bottom: 1px solid rgba(148, 163, 184, 0.08) !important;
        }
        
        .p-datatable .p-datatable-tbody > tr:hover {
          background: rgba(16, 185, 129, 0.06) !important;
        }

        /* Multi-select (checkboxes) */
        .p-datatable .p-datatable-tbody > tr.p-highlight,
        .p-datatable .p-datatable-tbody > tr[data-p-highlight="true"] {
          background: rgba(16, 185, 129, 0.14) !important;
        }

        .p-datatable .p-checkbox .p-checkbox-box {
          background: rgba(30, 41, 59, 0.9) !important;
          border-color: rgba(148, 163, 184, 0.35) !important;
          border-radius: 6px !important;
          width: 1.2rem !important;
          height: 1.2rem !important;
        }

        .p-datatable .p-checkbox .p-checkbox-box.p-highlight {
          background: linear-gradient(135deg, #10b981, #06b6d4) !important;
          border-color: #10b981 !important;
        }

        .p-datatable
          .p-checkbox:not(.p-checkbox-disabled):not(.p-checkbox-checked):hover
          .p-checkbox-box {
          border-color: #10b981 !important;
        }

        .p-datatable .p-checkbox .p-checkbox-box .p-checkbox-icon {
          color: #ffffff !important;
          font-size: 0.7rem !important;
        }

        .p-datatable th[data-p-selection-column],
        .p-datatable td[data-p-selection-column] {
          text-align: center;
          padding-left: 8px !important;
          padding-right: 8px !important;
        }

        .p-datatable .p-sortable-column .p-sortable-column-icon {
          color: #64748b !important;
          font-size: 12px !important;
        }

        .p-datatable .p-sortable-column:hover {
          background: rgba(16, 185, 129, 0.08) !important;
          color: #10b981 !important;
        }

        .p-datatable .p-sortable-column.p-highlight {
          background: rgba(16, 185, 129, 0.1) !important;
          color: #10b981 !important;
        }

        .p-datatable .p-sortable-column.p-highlight .p-sortable-column-icon {
          color: #10b981 !important;
        }

        .p-paginator {
          background: transparent !important;
          border: none !important;
          padding: 16px 4px 4px 4px !important;
        }

        .p-paginator .p-paginator-current {
          color: #94a3b8 !important;
          font-size: 13px !important;
        }

        .p-paginator .p-paginator-pages .p-paginator-page {
          color: #cbd5e1 !important;
          border-radius: 8px !important;
          min-width: 2.2rem !important;
          height: 2.2rem !important;
          margin: 0 2px !important;
        }

        .p-paginator .p-paginator-pages .p-paginator-page.p-highlight {
          background: linear-gradient(135deg, #10b981, #06b6d4) !important;
          color: #ffffff !important;
          font-weight: 600;
        }

        .p-paginator .p-paginator-pages .p-paginator-page:not(.p-highlight):hover {
          background: rgba(16, 185, 129, 0.15) !important;
          color: #10b981 !important;
        }

        .p-paginator .p-paginator-first,
        .p-paginator .p-paginator-prev,
        .p-paginator .p-paginator-next,
        .p-paginator .p-paginator-last {
          color: #94a3b8 !important;
          border-radius: 8px !important;
          min-width: 2.2rem !important;
          height: 2.2rem !important;
        }

        .p-paginator .p-paginator-first:not(.p-disabled):hover,
        .p-paginator .p-paginator-prev:not(.p-disabled):hover,
        .p-paginator .p-paginator-next:not(.p-disabled):hover,
        .p-paginator .p-paginator-last:not(.p-disabled):hover {
          background: rgba(16, 185, 129, 0.15) !important;
          color: #10b981 !important;
        }

        .p-paginator .p-dropdown {
          background: rgba(30, 41, 59, 0.6) !important;
          border: 1px solid rgba(148, 163, 184, 0.15) !important;
          border-radius: 8px !important;
          color: #cbd5e1 !important;
          height: 2.2rem !important;
        }

        .p-paginator .p-dropdown .p-dropdown-trigger {
          color: #10b981 !important;
        }

        .p-datatable-loading-overlay {
          background: rgba(15, 23, 42, 0.6) !important;
          backdrop-filter: blur(4px);
        }

        .p-datatable .p-datatable-emptymessage td {
          text-align: center !important;
          padding: 60px 20px !important;
        }

        /* ConfirmDialog dark theme */
        .p-confirm-dialog {
          background: #1e293b !important;
          border: 1px solid rgba(148, 163, 184, 0.2) !important;
          border-radius: 16px !important;
          color: #e2e8f0 !important;
        }
        .p-confirm-dialog .p-dialog-header {
          background: transparent !important;
          color: #f1f5f9 !important;
          border-bottom: 1px solid rgba(148, 163, 184, 0.12) !important;
        }
        .p-confirm-dialog .p-dialog-content {
          background: transparent !important;
          color: #cbd5e1 !important;
        }
        .p-confirm-dialog .p-dialog-footer {
          background: transparent !important;
          border-top: 1px solid rgba(148, 163, 184, 0.12) !important;
        }
      `}</style>

      <ConfirmDialog />

      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-850">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 mb-3 text-sm font-medium transition-colors cursor-pointer"
              >
                <ArrowLeft size={16} />
                Back to Dashboard
              </button>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
                {selectedMonth ? `${selectedMonth} Folder` : "October 2026 Folder"}
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Viewing income and expenses for {selectedMonth || "October 2026"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/expenses/create")}
                className="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-lg shadow-cyan-500/25 active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Plus size={16} strokeWidth={3} />
                <span>ADD NEW EXPENSE</span>
              </button>
            </div>
          </div>

          {/* 3 Summary Blocks for the Selected Month (This Month Balance, This Month Income, This Month Expense) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* This Month Balance Card */}
            <div className="stat-card rounded-2xl p-6 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-1.5">
                    This Month Balance
                  </p>
                  <h2 className="text-3xl md:text-4xl font-bold text-cyan-400 flex items-center gap-1.5">
                    <span>{formatCurrency(selectedMonthStats.balance)}</span>
                    <span className="text-xl leading-none text-cyan-400/80">↓</span>
                  </h2>
                </div>
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-2xl shadow-inner">
                  💰
                </div>
              </div>
            </div>

            {/* This Month Income Card */}
            <div className="stat-card rounded-2xl p-6 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-1.5">
                    This Month Income
                  </p>
                  <h2 className="text-3xl md:text-4xl font-bold text-emerald-400 flex items-center gap-1.5">
                    <span>{formatCurrency(selectedMonthStats.income)}</span>
                    <span className="text-xl leading-none">↗</span>
                  </h2>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
                  <TrendingUp size={24} />
                </div>
              </div>
            </div>

            {/* This Month Expense Card */}
            <div className="stat-card rounded-2xl p-6 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-1.5">
                    This Month Expense
                  </p>
                  <h2 className="text-3xl md:text-4xl font-bold text-red-400">
                    {formatCurrency(selectedMonthStats.expense)}
                  </h2>
                </div>
                <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 shadow-inner">
                  <TrendingDown size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Clean Quick Folder Switcher */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Switch Folder:
            </span>
            <button
              onClick={() => handleSelectMonth("")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                !selectedMonth
                  ? "bg-cyan-500 text-slate-950 font-bold"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50"
              }`}
            >
              All
            </button>
            {availableFolders.map((m) => {
              const isSelected = (selectedMonth || "October 2026").toLowerCase() === m.name.toLowerCase();
              return (
                <button
                  key={m.name}
                  onClick={() => handleSelectMonth(m.name)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                      : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50"
                  }`}
                >
                  <FolderIcon size={11} className={isSelected ? "text-slate-950" : "text-cyan-400"} />
                  <span>{m.name}</span>
                </button>
              );
            })}
          </div>

          {/* Transactions Table */}
          <div className="card-glass rounded-2xl p-5 sm:p-7">
            {!loading && displayExpenses.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 items-center justify-center mb-4">
                  <Receipt size={24} className="text-white" />
                </div>
                <h3 className="text-white font-semibold mb-1.5">
                  {selectedMonth ? `No transactions in ${selectedMonth}` : "No transactions yet"}
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  {selectedMonth
                    ? "Add an expense or income to this folder"
                    : "Start by adding your first income or expense"}
                </p>
                {selectedMonth && (
                  <button
                    onClick={() => handleSelectMonth("")}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                  >
                    View All Transactions
                  </button>
                )}
              </div>
            ) : (
              <div
                onClickCapture={handleTableClickCapture}
                onContextMenu={handleContextMenu}
              >
                <DataTable
                  value={displayExpenses}
                  selection={selectedRows}
                  onSelectionChange={(e) => setSelectedRows(e.value)}
                  selectionAutoFocus={false}
                  onRowPointerDown={handleRowPointerDown}
                  onRowPointerUp={handleRowPointerUp}
                  paginator
                  rows={10}
                  rowsPerPageOptions={[5, 10, 25]}
                  loading={loading}
                  globalFilterFields={["title", "description", "amount", "type"]}
                  globalFilter={globalFilterValue}
                  header={renderHeader()}
                  responsiveLayout="scroll"
                  emptyMessage="No transactions found"
                  currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
                  rowClassName={(_, options) =>
                    options.rowIndex % 2 === 1 ? "p-row-odd" : ""
                  }
                >
                  {showCheckboxes && (
                    <Column
                      selectionMode="multiple"
                      headerStyle={{ width: "56px" }}
                      bodyStyle={{ width: "56px" }}
                    />
                  )}
                  <Column
                    field="title"
                    header="Title"
                    body={titleBodyTemplate}
                    sortable
                    style={{ minWidth: "200px" }}
                  />
                  <Column
                    field="category_id.name"
                    header="Category"
                    body={categoryBodyTemplate}
                    sortable
                    style={{ minWidth: "120px" }}
                  />
                  <Column
                    field="date"
                    header="Date"
                    body={dateBodyTemplate}
                    sortable
                    style={{ minWidth: "150px" }}
                  />
                  <Column
                    field="amount"
                    header="Amount"
                    body={amountBodyTemplate}
                    sortable
                    style={{ minWidth: "140px" }}
                  />
                  <Column
                    field="type"
                    header="Type"
                    body={typeBodyTemplate}
                    sortable
                    style={{ minWidth: "110px" }}
                  />
                  <Column
                    field="description"
                    header="Description"
                    body={descriptionBodyTemplate}
                    style={{ minWidth: "180px" }}
                  />
                  <Column
                    header="Actions"
                    body={actionsBodyTemplate}
                    style={{ minWidth: "120px" }}
                    frozen
                    alignFrozen="right"
                  />
                </DataTable>
              </div>
            )}
          </div>

          {/* Bulk delete bar (multi-select) */}
          {showBulkBar && (
            <div className="fixed left-1/2 -translate-x-1/2 bottom-24 md:bottom-8 z-50 w-[calc(100%-2rem)] md:w-auto max-w-md flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border border-emerald-500/30 bg-slate-900/95 backdrop-blur-xl shadow-2xl">
              <span className="text-sm font-semibold text-white whitespace-nowrap">
                {selectedRows.length} selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={cancelSelection}
                  className="px-3 py-2 rounded-xl text-sm font-medium text-slate-300 border border-slate-600/60 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={selectedRows.length === 0 || bulkDeleting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-br from-red-500 to-orange-500 hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {bulkDeleting ? (
                    <i className="pi pi-spin pi-spinner text-xs" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                  Delete ({selectedRows.length})
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default AllTransactions;