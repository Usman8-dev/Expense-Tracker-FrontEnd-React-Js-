import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate, useParams } from "react-router-dom";
import { ExpenseSchema } from "../../validations/ExpenseSchema";
import { useToast } from "../../context/ToastContext";
import api from "../../apis/axios";

import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { Calendar } from "primereact/calendar";

function EditTransaction() {
  const navigate = useNavigate();
  const { id } = useParams();
  const showToast = useToast();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(ExpenseSchema),
    defaultValues: {
      title: "",
      description: "",
      amount: null,
      category: "",
      type: "Expense",
      date: new Date(),
    },
  });

  const selectedType = watch("type");

  useEffect(() => {
    fetchCategories();
    fetchTransaction();
  }, [id]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await api.get("/category/AllCategory");
      if (response.data.success) {
        const list = response.data.All_Categories || response.data.categories || [];
        setCategories(
          list.map((cat) => ({
            label: cat.name,
            value: cat._id ,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchTransaction = async () => {
    try {
      setLoading(true);

      const response = await api.get(`/expense/GetExpenseById/${id}`);

      const data = response.data.expense || response.data.data || response.data;

      reset({
        title: data.title || "",
        description: data.description || "",
        amount: data.amount ?? null,
        category: data.category?._id || data.category || "",
        type: data.type || "Expense",
        date: data.date ? new Date(data.date) : new Date(),
      });
    } catch (error) {
      showToast({
        severity: "error",
        summary: "Failed",
        detail: error.response?.data?.message || "Could not load transaction",
        life: 3000,
      });
      navigate("/expenses/all");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
      title: data.title,
        description: data.description || "",
        amount: data.amount,
        category_id: data.category,
        type: data.type, 
        date: data.date,
    };
      await api.put(`/expense/update/${id}`, payload);
      showToast({
        severity: "success",
        summary: "Updated",
        detail: "Transaction updated successfully",
        life: 3000,
      });
      navigate("/expenses/all");
    } catch (error) {
      showToast({
        severity: "error",
        summary: "Failed",
        detail: error.response?.data?.message || "Could not update transaction",
        life: 3000,
      });
    }
  };

  const typeOptions = [
    { label: "Income", value: "Income" },
    { label: "Expense", value: "Expense" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-850 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto" />
          <p className="text-slate-400 mt-4">Loading transaction...</p>
        </div>
      </div>
    );
  }

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

        .p-inputnumber { width: 100%; }
        .p-inputnumber .p-inputnumber-input { width: 100%; }

          .p-calendar {
          width: 100% !important;
        }

        .p-calendar .p-inputtext {
          background: rgba(15, 23, 42, 0.7) !important;
          border: 1px solid rgba(148, 163, 184, 0.2) !important;
          color: #f1f5f9 !important;
          border-radius: 12px !important;
          padding: 0.75rem 1rem !important;
          width: 100% !important;
        }

        .p-calendar .p-datepicker-trigger {
          background: transparent !important;
          border: none !important;
          color: #10b981 !important;
        }

        .p-datepicker {
          background: #1e293b !important;
          border: 1px solid rgba(148, 163, 184, 0.2) !important;
          border-radius: 12px !important;
          color: #f1f5f9 !important;
        }

        .p-datepicker .p-datepicker-header {
          background: transparent !important;
          border-bottom: 1px solid rgba(148, 163, 184, 0.15) !important;
          color: #ffffff !important;
        }

        .p-datepicker .p-datepicker-prev,
        .p-datepicker .p-datepicker-next {
          color: #10b981 !important;
        }

        .p-datepicker table td > span {
          color: #cbd5e1 !important;
        }

        .p-datepicker table td > span:hover {
          background: rgba(16, 185, 129, 0.15) !important;
          color: #10b981 !important;
        }

        .p-datepicker table td.p-datepicker-today > span {
          background: rgba(16, 185, 129, 0.1) !important;
          color: #10b981 !important;
        }

        .p-datepicker table td > span.p-highlight {
          background: linear-gradient(135deg, #10b981, #06b6d4) !important;
          color: #ffffff !important;
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-850">
        <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <button
            onClick={() => navigate("/expenses/all")}
            className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 mb-6 text-sm font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Transactions
          </button>

          <div className="card-glass rounded-2xl p-6 sm:p-8">
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
                  Edit Transaction
                </h1>
                <p className="text-slate-400 text-sm mt-0.5">
                  Update income or expense details
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

              {/* Date */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Date
                </label>
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <Calendar
                      value={field.value}
                      onChange={(e) => field.onChange(e.value)}
                      dateFormat="dd M, yy"
                      showIcon
                      className={`w-full ${errors.date ? "!border-red-400" : ""}`}
                    />
                  )}
                />
                {errors.date && (
                  <small className="text-red-400 text-xs">{errors.date.message}</small>
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
                  onClick={() => navigate("/expenses/all")}
                  className="w-1/3 justify-center !rounded-xl !border !border-slate-700/60 !bg-transparent !text-slate-300 hover:!bg-slate-800/50 transition-all"
                />
                <Button
                  type="submit"
                  label={isSubmitting ? "Updating..." : "Update Transaction"}
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

export default EditTransaction;