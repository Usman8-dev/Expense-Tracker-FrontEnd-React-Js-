import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import api from "../apis/axios";
import { useToast } from "../context/ToastContext";

function Dashboard() {
  const navigate = useNavigate();
  const showToast = useToast();

  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState({
    total_balance: 0,
    total_income: 0,
    total_expense: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await api.get("/expense/AllExpense");

      if (response.data.success) {
        const allExpenses = response.data.All_Expenses || [];
        setExpenses(allExpenses);

        // Extract stats from the FIRST expense (most recent - sorted by date -1)
        if (allExpenses.length > 0) {
          const firstExpense = allExpenses[0];
          console.log("Stats from first expense:", firstExpense);

          setStats({
            total_balance: firstExpense.total_balance || 0,
            total_income: firstExpense.total_income || 0,
            total_expense: firstExpense.total_expense || 0,
          });
        }
      } else {
        showToast({
          severity: "error",
          summary: "Error",
          detail: response.data.message || "Failed to fetch expenses",
          life: 3000,
        });
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
      showToast({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.message || "Failed to fetch expenses",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const latestTransactions = expenses.slice(0, 5);

const formatCurrency = (value) => {
  return `Rs. ${new Intl.NumberFormat("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0)}`;
};

  const dateTemplate = (rowData) => {
    return new Date(rowData.date).toLocaleDateString("en-PK");
  };

  const amountTemplate = (rowData) => {
    return (
      <span
        className={
          rowData.type === "Income" ? "text-emerald-400" : "text-red-400"
        }
      >
        {rowData.type === "Income" ? "+" : "-"} {formatCurrency(rowData.amount)}
      </span>
    );
  };

  const typeTemplate = (rowData) => {
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          rowData.type === "Income"
            ? "bg-emerald-500/20 text-emerald-400"
            : "bg-red-500/20 text-red-400"
        }`}
      >
        {rowData.type === "Income" ? "Income" : "Expense"}
      </span>
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@500;600;700;800&display=swap');
        
        .font-display { font-family: 'Outfit', sans-serif; }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .card-glass {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.8));
          backdrop-filter: blur(20px);
          border: 1px solid rgba(148, 163, 184, 0.15);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2);
          animation: slideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        
        .stat-card {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9));
          backdrop-filter: blur(20px);
          border: 1px solid rgba(148, 163, 184, 0.15);
          transition: all 0.3s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 40px rgba(31, 38, 135, 0.3);
        }
        
        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }
        
        .p-datatable {
          background: transparent !important;
          color: #ffffff !important;
        }
        
        .p-datatable .p-datatable-thead > tr > th {
          background: rgba(15, 23, 42, 0.8) !important;
          color: #cbd5e1 !important;
          border-color: rgba(148, 163, 184, 0.15) !important;
          padding: 16px 12px !important;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 12px;
        }
        
        .p-datatable .p-datatable-tbody > tr {
          border-color: rgba(148, 163, 184, 0.15) !important;
          background: transparent !important;
        }
        
        .p-datatable .p-datatable-tbody > tr > td {
          padding: 14px 12px !important;
          border-color: rgba(148, 163, 184, 0.15) !important;
        }
        
        .p-datatable .p-datatable-tbody > tr:hover {
          background: rgba(16, 185, 129, 0.05) !important;
        }
      `}</style>

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
              Dashboard
            </h1>
            <p className="text-slate-400 text-sm">
              Welcome back! Here's your financial overview
            </p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              label="Add Income"
              icon="pi pi-plus"
              className="flex-1 sm:flex-none !rounded-xl !border-0 !py-3 !font-semibold !text-white bg-gradient-to-r !from-emerald-500 !via-teal-500 !to-cyan-500 hover:!shadow-[0_10px_40px_rgba(16,185,129,0.4)] transition-all duration-300 uppercase tracking-wider"
              onClick={() =>
                showToast({
                  severity: "info",
                  summary: "Coming Soon",
                  detail: "Add Income feature coming soon",
                  life: 3000,
                })
              }
            />
            <Button
              label="Add Expense"
              icon="pi pi-plus"
              className="flex-1 sm:flex-none !rounded-xl !border-0 !py-3 !font-semibold !text-white bg-gradient-to-r !from-orange-500 !via-pink-500 !to-red-500 hover:!shadow-[0_10px_40px_rgba(239,68,68,0.4)] transition-all duration-300 uppercase tracking-wider"
              onClick={() =>
                showToast({
                  severity: "info",
                  summary: "Coming Soon",
                  detail: "Add Expense feature coming soon",
                  life: 3000,
                })
              }
            />
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Balance Card */}
          <div className="stat-card rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-2">
                  Total Balance
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-white">
                  {formatCurrency(stats.total_balance)}
                </h2>
              </div>
              <div className="stat-icon bg-gradient-to-br from-blue-400 to-cyan-500">
                💰
              </div>
            </div>
            <div
              className={`text-sm font-medium ${stats.total_balance >= 0 ? "text-emerald-400" : "text-red-400"}`}
            >
              {stats.total_balance >= 0 ? "✓ Positive" : "⚠ Negative"}
            </div>
          </div>

          {/* Total Income Card */}
          <div className="stat-card rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-2">
                  Total Income
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-emerald-400">
                  {formatCurrency(stats.total_income)}
                </h2>
              </div>
              <div className="stat-icon bg-gradient-to-br from-emerald-400 to-teal-500">
                📈
              </div>
            </div>
            <p className="text-slate-400 text-sm">All time earnings</p>
          </div>

          {/* Total Expense Card */}
          <div className="stat-card rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-2">
                  Total Expense
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-red-400">
                  {formatCurrency(stats.total_expense)}
                </h2>
              </div>
              <div className="stat-icon bg-gradient-to-br from-red-400 to-orange-500">
                📉
              </div>
            </div>
            <p className="text-slate-400 text-sm">All time spending</p>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card-glass rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="font-display text-2xl font-bold text-white">
                Recent Transactions
              </h3>
              <p className="text-slate-400 text-sm mt-1">
                Latest 5 transactions
              </p>
            </div>

            <Button
              label="View All"
              icon="pi pi-arrow-right"
              iconPos="right"
              className="!rounded-xl !border-0 !py-2.5 !px-4 !font-semibold !text-white bg-gradient-to-r !from-emerald-500 !via-teal-500 !to-cyan-500 hover:!shadow-[0_10px_40px_rgba(16,185,129,0.4)] transition-all duration-300 uppercase tracking-wider text-sm"
              onClick={() => navigate("/expenses/all")}
            />
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
              </div>
              <p className="text-slate-400 mt-4">Loading transactions...</p>
            </div>
          ) : latestTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <DataTable
                value={latestTransactions}
                responsiveLayout="scroll"
                paginator={false}
                className="text-sm"
              >
                <Column field="title" header="Title" />
                <Column field="date" header="Date" body={dateTemplate} />
                <Column field="amount" header="Amount" body={amountTemplate} />
                <Column field="type" header="Type" body={typeTemplate} />
                <Column field="description" header="Description" />
              </DataTable>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-400">No transactions found</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Dashboard;
