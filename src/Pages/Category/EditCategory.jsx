import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate, useParams } from "react-router-dom";
import { CategorySchema } from "../../validations/CategorySchema";
import { useToast } from "../../context/ToastContext";
import api from "../../apis/axios";

import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { ArrowLeft, FolderKanban } from "lucide-react";

function EditCategory() {
  const navigate = useNavigate();
  const { id } = useParams();
  const showToast = useToast();

  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(CategorySchema),
    defaultValues: {
      name: "",
    },
  });



  const fetchCategory = async () => {
    try {
      setLoading(true);
        // get data through id 
      const response = await api.get(`/category/GetCategoryById/${id}`);

      const data =
        response.data.category ||
        response.data.data ||
        response.data;

      if (!response.data.success && !data?.name) {
        throw new Error(response.data.message || "Category not found");
      }

      reset({
        name: data.name || "",
      });
    } catch (error) {
      showToast({
        severity: "error",
        summary: "Failed",
        detail:
          error.response?.data?.message || "Could not load category",
        life: 3000,
      });
      navigate("/categories");
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
    fetchCategory();
  }, [id]);

  const onSubmit = async (data) => {
    try {
      // update data apis hit 
      await api.put(`/category/update/${id}`, {
        name: data.name.trim(),
      });

      showToast({
        severity: "success",
        summary: "Updated",
        detail: "Category updated successfully",
        life: 3000,
      });
      navigate("/categories");
    } catch (error) {
      showToast({
        severity: "error",
        summary: "Failed",
        detail:
          error.response?.data?.message || "Could not update category",
        life: 3000,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-850 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto" />
          <p className="text-slate-400 mt-4">Loading category...</p>
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

        .p-inputtext {
          background: rgba(15, 23, 42, 0.7) !important;
          border: 1px solid rgba(148, 163, 184, 0.2) !important;
          color: #f1f5f9 !important;
          border-radius: 12px !important;
          padding: 0.75rem 1rem !important;
          transition: all 0.2s ease !important;
        }

        .p-inputtext:enabled:focus {
          border-color: rgba(139, 92, 246, 0.5) !important;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.12) !important;
        }

        .p-inputtext::placeholder {
          color: #64748b !important;
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-850">
        <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <button
            onClick={() => navigate("/categories")}
            className="flex items-center gap-1.5 text-violet-400 hover:text-violet-300 mb-6 text-sm font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Categories
          </button>

          <div className="card-glass rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-violet-500 to-fuchsia-500">
                <FolderKanban size={22} className="text-white" />
              </div>
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
                  Edit Category
                </h1>
                <p className="text-slate-400 text-sm mt-0.5">
                  Update category name
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Category Name
                </label>
                <InputText
                  placeholder="e.g. Food, Salary, Transport"
                  {...register("name")}
                  className={`w-full ${errors.name ? "!border-red-400" : ""}`}
                />
                {errors.name && (
                  <small className="text-red-400 text-xs">
                    {errors.name.message}
                  </small>
                )}
              </div>

              <div className="flex gap-3 mt-3">
                <Button
                  type="button"
                  label="Cancel"
                  onClick={() => navigate("/categories")}
                  className="w-1/3 justify-center !rounded-xl !border !border-slate-700/60 !bg-transparent !text-slate-300 hover:!bg-slate-800/50 transition-all"
                />
                <Button
                  type="submit"
                  label={isSubmitting ? "Updating..." : "Update Category"}
                  icon={isSubmitting ? "pi pi-spin pi-spinner" : "pi pi-check"}
                  iconPos="right"
                  disabled={isSubmitting}
                  className="w-2/3 justify-center !rounded-xl !border-0 !font-semibold !text-white !bg-gradient-to-r !from-violet-600 !via-fuchsia-600 !to-orange-500 hover:!shadow-[0_10px_40px_rgba(139,92,246,0.4)] transition-all duration-300"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default EditCategory;