import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import { ExpenseSchema } from "../../validations/ExpenseSchema";
import { useToast } from "../../context/ToastContext";
import api from "../../apis/axios";

import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { ArrowLeft, Receipt, TrendingUp, TrendingDown } from "lucide-react";

function CreateTransaction() {
  const navigate = useNavigate();
  const showToast = useToast();

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(ExpenseSchema),
    defaultValues: {
      title: "",
      description: "",
      amount: null,
      category: "",
      type: "Expense",
    },
  });

  const selectedType = watch("type");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      // Adjust endpoint if your API is different
      const response = await api.get("/category/AllCategory");
      if (response.data.success) {
        const list = response.data.All_Categories || response.data.categories || [];
        setCategories(
          list.map((cat) => ({
            label: cat.name || cat.title || cat.category,
            value: cat._id || cat.id || cat.name,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
      showToast({
        severity: "warn",
        summary: "Warning",
        detail: "Could not load categories. You can still create a transaction.",
        life: 3000,
      });
    } finally {
      setLoadingCategories(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      await api.post("/expense/create", {
        title: data.title,
        description: data.description || "",
        amount: data.amount,
        category: data.category,
        type: data.type,
      });

      showToast({
        severity: "success",
        summary: "Created",
        detail: `${data.type} added successfully`,
        life: 3000,
      });
      navigate("/dashboard");
    } catch (error) {
      showToast({
        severity: "error",
        summary: "Failed",
        detail: error.response?.data?.message || "Could not create transaction",
        life: 3000,
      });
    }
  };

  const typeOptions = [
    { label: "Income", value: "Income" },
    { label: "Expense", value: "Expense" },
  ];

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
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.85), rgba(30, 41, 59, 0.85));
          backdrop-filter: blur(20px);
          border: 1px solid rgba(148, 163, 184, 0.12);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.25);
          animation: slideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }

        /* PrimeReact overrides for dark theme */
        .p-inputtext,
        .p-inputtextarea,
        .p-inputnumber-input {
          background: rgba(15, 23, 42, 0.7) !important;
          border: 1px solid rgba(148, 163, 184, 0.2) !important;
          color: #f1f5f9 !important;
          border-radius: 12px !important;
          padding: 0.75rem 1rem !important;
          transition: all 0.2s ease !important;
        }

        .p-inputtext:enabled:focus,
        .p-inputtextarea:enabled:focus,
        .p-inputnumber-input:enabled:focus {
          border-color: rgba(16, 185, 129, 0.5) !important;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12) !important;
        }

        .p-inputtext::placeholder,
        .p-inputtextarea::placeholder {
          color: #64748b !important;
        }

        .p-dropdown {
          background: rgba(15, 23, 42, 0.7) !important;
          border: 1px solid rgba(148, 163, 184, 0.2) !important;
          border-radius: 12px !important;
          color: #f1f5f9 !important;
        }

        .p-dropdown:not(.p-disabled).p-focus {
          border-color: rgba(16, 185, 129, 0.5) !important;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12) !important;
        }

        .p-dropdown .p-dropdown-label {
          color: #f1f5f9 !important;
          padding: 0.75rem 1rem !important;
        }

        .p-dropdown .p-dropdown-trigger {
          color: #94a3b8 !important;
        }

        .p-dropdown-panel {
          background: #1e293b !important;
          border: 1px solid rgba(148, 163, 184, 0.2) !important;
          border-radius: 12px !important;
        }

        .p-dropdown-panel .p-dropdown-items .p-dropdown-item {
          color: #e2e8f0 !important;
        }

        .p-dropdown-panel .p-dropdown-items .p-dropdown-item:hover {
          background: rgba(16, 185, 129, 0.15) !important;
          color: #10b981 !important;
        }

        .p-dropdown-panel .p-dropdown-items .p-dropdown-item.p-highlight {
          background: rgba(16, 185, 129, 0.2) !important;
          color: #10b981 !important;
        }

        .p-inputnumber {
          width: 100%;
        }

        .p-inputnumber .p-inputnumber-input {
          width: 100%;
        }
/* Dark Dropdown Panel - targets portal-rendered panel */
.dark-dropdown-panel {
  background: rgba(15, 23, 42, 0.98) !important;
  backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(148, 163, 184, 0.15) !important;
  border-radius: 12px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5) !important;
  overflow: hidden !important;
}

.dark-dropdown-panel .p-dropdown-header {
  background: rgba(15, 23, 42, 0.95) !important;
  border-bottom: 1px solid rgba(148, 163, 184, 0.15) !important;
  padding: 10px !important;
}

.dark-dropdown-panel .p-dropdown-filter-container {
  width: 100% !important;
}

.dark-dropdown-panel .p-dropdown-filter {
  background: rgba(30, 41, 59, 0.9) !important;
  border: 1px solid rgba(148, 163, 184, 0.2) !important;
  color: #ffffff !important;
  border-radius: 8px !important;
  padding: 10px 40px 10px 14px !important;
}

.dark-dropdown-panel .p-dropdown-filter::placeholder {
  color: #64748b !important;
}

.dark-dropdown-panel .p-dropdown-filter-icon {
  color: #64748b !important;
}

.dark-dropdown-panel .p-dropdown-items-wrapper {
  background: rgba(15, 23, 42, 0.98) !important;
}

.dark-dropdown-panel .p-dropdown-items {
  padding: 6px !important;
}

.dark-dropdown-panel .p-dropdown-item {
  color: #cbd5e1 !important;
  padding: 10px 14px !important;
  border-radius: 8px !important;
  font-size: 14px !important;
  background: transparent !important;
}

.dark-dropdown-panel .p-dropdown-item:hover {
  background: rgba(16, 185, 129, 0.15) !important;
  color: #10b981 !important;
}

.dark-dropdown-panel .p-dropdown-item.p-highlight {
  background: rgba(16, 185, 129, 0.2) !important;
  color: #10b981 !important;
}

.dark-dropdown-panel .p-dropdown-empty-message {
  color: #64748b !important;
  padding: 16px !important;
  text-align: center !important;
  background: transparent !important;
}

/* Main dropdown trigger box */
.p-dropdown {
  background: rgba(15, 23, 42, 0.8) !important;
  border: 1.5px solid rgba(148, 163, 184, 0.2) !important;
  border-radius: 12px !important;
}

.p-dropdown:not(.p-disabled):hover {
  border-color: rgba(16, 185, 129, 0.4) !important;
}

.p-dropdown:not(.p-disabled).p-focus {
  border-color: rgb(16, 185, 129) !important;
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.3) !important;
}

.p-dropdown .p-dropdown-label {
  color: #ffffff !important;
  padding: 14px 16px !important;
}

.p-dropdown .p-dropdown-label.p-placeholder {
  color: #64748b !important;
}

.p-dropdown .p-dropdown-trigger {
  color: #10b981 !important;
}
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-850">
        <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          {/* Back + Header */}
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 mb-6 text-sm font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>

          <div className="card-glass rounded-2xl p-6 sm:p-8">
            {/* Icon + Title */}
            <div className="flex items-center gap-4 mb-6">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  selectedType === "Income"
                    ? "bg-gradient-to-br from-emerald-400 to-teal-500"
                    : "bg-gradient-to-br from-red-400 to-orange-500"
                }`}
              >
                {selectedType === "Income" ? (
                  <TrendingUp size={22} className="text-white" />
                ) : (
                  <TrendingDown size={22} className="text-white" />
                )}
              </div>
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
                  Add Transaction
                </h1>
                <p className="text-slate-400 text-sm mt-0.5">
                  Record a new income or expense
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              {/* Type */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Type
                </label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Dropdown
                      {...field}
                      options={typeOptions}
                      placeholder="Select type"
                      className={`w-full ${errors.type ? "!border-red-400" : ""}`}
                    />
                  )}
                />
                {errors.type && (
                  <small className="text-red-400 text-xs">{errors.type.message}</small>
                )}
              </div>

              {/* Title */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Title
                </label>
                <InputText
                  placeholder="e.g. Salary, Groceries, Freelance"
                  {...register("title")}
                  className={`w-full ${errors.title ? "!border-red-400" : ""}`}
                />
                {errors.title && (
                  <small className="text-red-400 text-xs">{errors.title.message}</small>
                )}
              </div>

              {/* Amount */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Amount (Rs.)
                </label>
                <Controller
                  name="amount"
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      value={field.value}
                      onValueChange={(e) => field.onChange(e.value)}
                      placeholder="0"
                      mode="decimal"
                      minFractionDigits={0}
                      maxFractionDigits={0}
                      min={0}
                      className={`w-full ${errors.amount ? "!border-red-400" : ""}`}
                      inputClassName="w-full"
                    />
                  )}
                />
                {errors.amount && (
                  <small className="text-red-400 text-xs">{errors.amount.message}</small>
                )}
              </div>

              {/* Category */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Category
                </label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Dropdown
                      {...field}
                      options={categories}
                      placeholder={
                        loadingCategories
                          ? "Loading categories..."
                          : categories.length === 0
                          ? "No categories found"
                          : "Select category"
                      }
                      disabled={loadingCategories || categories.length === 0}
                      className={`w-full ${errors.category ? "!border-red-400" : ""}`}
                      panelClassName="dark-dropdown-panel"
                      filter
                      filterPlaceholder="Search category..."
                      emptyMessage="No categories available"
                    />
                  )}
                />
                {errors.category && (
                  <small className="text-red-400 text-xs">{errors.category.message}</small>
                )}
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Description <span className="text-slate-600 normal-case">(optional)</span>
                </label>
                <InputTextarea
                  placeholder="Add a note about this transaction..."
                  rows={3}
                  {...register("description")}
                  className={`w-full resize-none ${errors.description ? "!border-red-400" : ""}`}
                />
                {errors.description && (
                  <small className="text-red-400 text-xs">{errors.description.message}</small>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-3">
                <Button
                  type="button"
                  label="Cancel"
                  onClick={() => navigate("/dashboard")}
                  className="w-1/3 justify-center !rounded-xl !border !border-slate-700/60 !bg-transparent !text-slate-300 hover:!bg-slate-800/50 transition-all"
                />
                <Button
                  type="submit"
                  label={isSubmitting ? "Saving..." : "Save Transaction"}
                  icon={isSubmitting ? "pi pi-spin pi-spinner" : "pi pi-check"}
                  iconPos="right"
                  disabled={isSubmitting}
                  className={`w-2/3 justify-center !rounded-xl !border-0 !font-semibold !text-white transition-all duration-300 ${
                    selectedType === "Income"
                      ? "!bg-gradient-to-r !from-emerald-500 !via-teal-500 !to-cyan-500 hover:!shadow-[0_10px_40px_rgba(16,185,129,0.4)]"
                      : "!bg-gradient-to-r !from-orange-500 !via-pink-500 !to-red-500 hover:!shadow-[0_10px_40px_rgba(239,68,68,0.4)]"
                  }`}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default CreateTransaction;