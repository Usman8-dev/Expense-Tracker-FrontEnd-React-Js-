import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { ArrowLeft, FileSpreadsheet, Download } from "lucide-react";
import api from "../../apis/axios";
import { useToast } from "../../context/ToastContext";

function Reports() {
  const navigate = useNavigate();
  const showToast = useToast();

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const formatDateForApi = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

const handleDownload = async () => {
  if (!startDate || !endDate) {
    showToast({
      severity: "warn",
      summary: "Missing Dates",
      detail: "Please select both start and end date",
      life: 3000,
    });
    return;
  }

  if (new Date(startDate) > new Date(endDate)) {
    showToast({
      severity: "warn",
      summary: "Invalid Range",
      detail: "Start date cannot be after end date",
      life: 3000,
    });
    return;
  }

  try {
    setDownloading(true);

    const response = await api.post(
      "/expense/export",
      {
        startDate: formatDateForApi(startDate),
        endDate: formatDateForApi(endDate),
      },
      {
        responseType: "blob", 
      }
    );

    // Create a blob link and trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Expense_Report_${formatDateForApi(startDate)}_to_${formatDateForApi(endDate)}.xlsx`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    showToast({
      severity: "success",
      summary: "Success",
      detail: "Report downloaded successfully",
      life: 3000,
    });
  } catch (error) {
    showToast({
      severity: "error",
      summary: "Failed",
      detail: error.response?.data?.message || "Could not generate report",
      life: 3000,
    });
  } finally {
    setDownloading(false);
  }
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
        
        .card-glass {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.8));
          backdrop-filter: blur(20px);
          border: 1px solid rgba(148, 163, 184, 0.12);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2);
          animation: slideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }

        .p-calendar {
          width: 100% !important;
        }

        .p-calendar .p-inputtext {
          background: rgba(15, 23, 42, 0.8) !important;
          border: 1.5px solid rgba(148, 163, 184, 0.2) !important;
          color: #ffffff !important;
          border-radius: 12px !important;
          padding: 14px 16px !important;
          width: 100% !important;
        }

        .p-calendar .p-inputtext::placeholder {
          color: #64748b !important;
        }

        .p-calendar .p-inputtext:enabled:hover {
          border-color: rgba(16, 185, 129, 0.4) !important;
        }

        .p-calendar .p-inputtext:enabled:focus {
          border-color: rgb(16, 185, 129) !important;
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.3) !important;
        }

        .p-calendar .p-datepicker-trigger {
          background: transparent !important;
          border: none !important;
          color: #10b981 !important;
        }

        .p-datepicker {
          background: rgba(15, 23, 42, 0.98) !important;
          backdrop-filter: blur(20px) !important;
          border: 1px solid rgba(148, 163, 184, 0.15) !important;
          border-radius: 12px !important;
          color: #ffffff !important;
        }

        .p-datepicker .p-datepicker-header {
          background: transparent !important;
          border-bottom: 1px solid rgba(148, 163, 184, 0.15) !important;
          color: #ffffff !important;
        }

        .p-datepicker .p-datepicker-header .p-datepicker-title select {
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

        .p-datepicker-calendar-container select {
          background: rgba(30, 41, 59, 0.9) !important;
          color: #ffffff !important;
          border: 1px solid rgba(148, 163, 184, 0.2) !important;
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-850">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          {/* Page Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 mb-4 text-sm font-medium transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-2">
              Reports
            </h1>
            <p className="text-slate-400 text-sm">
              Generate and download your transaction reports
            </p>
          </div>

          {/* Report Generator Card */}
          <div className="card-glass rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0">
                <FileSpreadsheet size={22} className="text-white" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-white">
                  Excel Report
                </h2>
                <p className="text-slate-400 text-sm">
                  Select a date range to export your transactions
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
              {/* Start Date */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Start Date
                </label>
                <Calendar
                  value={startDate}
                  onChange={(e) => setStartDate(e.value)}
                  placeholder="Select start date"
                  dateFormat="dd M, yy"
                  showIcon
                  maxDate={endDate || new Date()}
                />
              </div>

              {/* End Date */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  End Date
                </label>
                <Calendar
                  value={endDate}
                  onChange={(e) => setEndDate(e.value)}
                  placeholder="Select end date"
                  dateFormat="dd M, yy"
                  showIcon
                  minDate={startDate}
                  maxDate={new Date()}
                />
              </div>
            </div>

            <Button
              label={downloading ? "Generating Report..." : "Download Report"}
              icon={downloading ? "pi pi-spin pi-spinner" : "pi pi-download"}
              onClick={handleDownload}
              disabled={downloading}
              className="w-full !rounded-xl !border-0 !py-3.5 !font-semibold !text-white bg-gradient-to-r !from-emerald-500 !via-teal-500 !to-cyan-500 hover:!shadow-[0_10px_40px_rgba(16,185,129,0.4)] transition-all duration-300 uppercase tracking-wider disabled:opacity-60"
            />

            <p className="text-slate-500 text-xs text-center mt-4">
              The report will include all income and expense transactions within the selected range
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Reports;