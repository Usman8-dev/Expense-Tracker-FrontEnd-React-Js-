import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import {
  Search,
  ArrowLeft,
  FolderKanban,
  Pencil,
  Trash2,
} from "lucide-react";
import api from "../../apis/axios";
import { useToast } from "../../context/ToastContext";

function AllCategories() {
  const navigate = useNavigate();
  const showToast = useToast();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get("/category/AllCategory");

      if (response.data.success) {
        setCategories(
          response.data.All_Categories || response.data.categories || []
        );
      } else {
        showToast({
          severity: "error",
          summary: "Failed",
          detail: response.data.message || "Could not load categories",
          life: 3000,
        });
      }
    } catch (error) {
      showToast({
        severity: "error",
        summary: "Failed",
        detail: error.response?.data?.message || "Could not load categories",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = (id) => {
    confirmDialog({
      message: "Do you want to delete this category?",
      header: "Delete Confirmation",
      icon: "pi pi-info-circle",
      acceptClassName: "p-button-danger",
      acceptLabel: "Delete",
      rejectLabel: "Cancel",
      accept: async () => {
        try {
          setDeletingId(id);
          await api.delete(`/category/delete/${id}`);
          showToast({
            severity: "success",
            summary: "Deleted",
            detail: "Category deleted successfully",
            life: 3000,
          });
          setCategories((prev) =>
            prev.filter((item) => (item._id || item.id) !== id)
          );
        } catch (error) {
          showToast({
            severity: "error",
            summary: "Failed",
            detail: error.response?.data?.message || "Could not delete category",
            life: 3000,
          });
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  const nameBodyTemplate = (rowData) => (
    <div className="flex items-center gap-3 py-1">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-emerald-400/20 to-teal-500/20 border border-emerald-500/30">
        <FolderKanban size={16} className="text-emerald-400" />
      </div>
      <span className="font-semibold text-white text-sm">
        {rowData.name || rowData.title || "—"}
      </span>
    </div>
  );

  const dateBodyTemplate = (rowData) => (
    <span className="text-slate-400 text-sm whitespace-nowrap">
      {formatDate(rowData.createdAt || rowData.date)}
    </span>
  );

  const actionsBodyTemplate = (rowData) => {
    const id = rowData._id || rowData.id;
    const isDeleting = deletingId === id;

    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(`/categories/edit/${id}`)}
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors"
          title="Edit"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => handleDelete(id)}
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

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const renderHeader = () => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2">
      <div className="flex items-center gap-2">
        <FolderKanban size={18} className="text-emerald-400" />
        <span className="text-white text-sm font-semibold">
          {categories.length} Categor{categories.length !== 1 ? "ies" : "y"}
        </span>
      </div>
      <div className="relative w-full sm:w-80">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
        />
        <InputText
          value={globalFilterValue}
          onChange={onGlobalFilterChange}
          placeholder="Search categories..."
          className="!w-full !bg-slate-800/60 !border-slate-700/60 !text-white placeholder:!text-slate-500 !rounded-xl !pl-10 !pr-4 !py-2.5 !text-sm focus:!border-emerald-500/50 transition-all"
        />
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@500;600;700;800&display=swap');

        .font-display { font-family: 'Outfit', sans-serif; }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
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
          color: #f1f5f9 !important;
        }

        .p-datatable .p-datatable-tbody > tr:hover {
          background: rgba(16, 185, 129, 0.06) !important;
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 mb-4 text-sm font-medium transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Dashboard
              </button>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-2">
                All Categories
              </h1>
              <p className="text-slate-400 text-sm">
                Manage your income and expense categories
              </p>
            </div>

            <button
              onClick={() => navigate("/categories/create")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm uppercase tracking-wider bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:shadow-[0_10px_40px_rgba(16,185,129,0.4)] transition-all"
            >
              <FolderKanban size={16} />
              Add Category
            </button>
          </div>

          {/* Categories Table */}
          <div className="card-glass rounded-2xl p-5 sm:p-7">
            {!loading && categories.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 items-center justify-center mb-4">
                  <FolderKanban size={24} className="text-white" />
                </div>
                <h3 className="text-white font-semibold mb-1.5">
                  No categories yet
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  Create your first category to organize transactions
                </p>
                <button
                  onClick={() => navigate("/categories/create")}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500"
                >
                  Add Category
                </button>
              </div>
            ) : (
              <DataTable
                value={categories}
                paginator
                rows={5}
                rowsPerPageOptions={[5, 10, 25]}
                loading={loading}
                globalFilterFields={["name", "title"]}
                globalFilter={globalFilterValue}
                header={renderHeader()}
                responsiveLayout="scroll"
                emptyMessage="No categories found"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
                rowClassName={(_, options) =>
                  options.rowIndex % 2 === 1 ? "p-row-odd" : ""
                }
              >
                <Column
                  field="name"
                  header="Name"
                  body={nameBodyTemplate}
                  sortable
                  style={{ minWidth: "220px" }}
                />
                <Column
                  field="createdAt"
                  header="Date"
                  body={dateBodyTemplate}
                  sortable
                  style={{ minWidth: "160px" }}
                />
                <Column
                  header="Actions"
                  body={actionsBodyTemplate}
                  style={{ minWidth: "120px" }}
                />
              </DataTable>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default AllCategories;