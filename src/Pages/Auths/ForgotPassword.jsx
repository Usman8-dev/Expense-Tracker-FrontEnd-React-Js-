import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { ForgotPasswordSchema } from "../../validations/ForgotPasswordSchema";
import api from "../../apis/axios";

import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { useToast } from "../../context/ToastContext";
import { ArrowLeft, MailCheck } from "lucide-react";
import { useState, useEffect } from "react";

function ForgotPassword() {
  const showToast = useToast();
  const [emailSent, setEmailSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [wakeUpTimer, setWakeUpTimer] = useState(null);

  useEffect(() => {
    return () => {
      if (wakeUpTimer) clearTimeout(wakeUpTimer);
    };
  }, [wakeUpTimer]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(ForgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    if (!navigator.onLine) {
      showToast({
        severity: "warn",
        summary: "You're offline",
        detail: "Connect to the internet to reset your password.",
        life: 3500,
      });
      return;
    }

    const timer = setTimeout(() => {
      setIsWakingUp(true);
    }, 3000);
    setWakeUpTimer(timer);

    try {
      const res = await api.post("/user/forgot-password", data);

      clearTimeout(timer);
      setWakeUpTimer(null);
      setIsWakingUp(false);

      setSubmittedEmail(data.email);
      setEmailSent(true);

      showToast({
        severity: "success",
        summary: "Email Sent",
        detail: res.data?.message || "Password reset link has been sent to your email",
        life: 4000,
      });
    } catch (error) {
      clearTimeout(timer);
      setWakeUpTimer(null);
      setIsWakingUp(false);

      showToast({
        severity: "error",
        summary: "Request Failed",
        detail: error.response?.data?.message || "Could not send reset email",
        life: 3500,
      });
    }
  };

  return (
    <div className="relative min-h-screen bg-[var(--ef-page-bg)] flex items-center justify-center p-4 overflow-hidden font-sans">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@500;600;700;800&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .font-display { font-family: 'Outfit', sans-serif; }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .form-container { animation: slideUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        .input-field {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.8));
          border: 1.5px solid rgba(148, 163, 184, 0.2);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        .input-field:hover {
          border-color: rgba(16, 185, 129, 0.4);
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9));
        }
        .input-field:focus {
          border-color: rgb(16, 185, 129) !important;
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.3) !important;
          background: linear-gradient(135deg, rgba(15, 23, 42, 1), rgba(30, 41, 59, 1));
        }
        .glass-card {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.7), rgba(30, 41, 59, 0.7));
          backdrop-filter: blur(20px);
          border: 1px solid rgba(148, 163, 184, 0.15);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
      `}</style>

      <div className="relative w-full max-w-lg form-container z-10">
        <div className="glass-card rounded-3xl p-8 md:p-10">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 text-sm font-medium mb-6 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Sign In
          </Link>

          <div className="mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">Rs.</span>
              </div>
              <span className="text-xs font-semibold tracking-widest text-emerald-400 uppercase">
                Smart Finance
              </span>
            </div>

            <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
              Forgot Password
            </h1>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              Enter your registered email address and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          {emailSent ? (
            <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-6 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <MailCheck size={28} />
              </div>
              <h2 className="text-xl font-bold text-white font-display">Check Your Email</h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                We&apos;ve sent a password reset link to <span className="text-emerald-400 font-semibold">{submittedEmail}</span>. The link expires in 15 minutes.
              </p>
              <div className="pt-2 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setEmailSent(false)}
                  className="w-full py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:border-emerald-500/50 hover:text-white text-sm font-medium transition-colors cursor-pointer"
                >
                  Try Another Email
                </button>
                <Link
                  to="/"
                  className="block w-full text-center py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-semibold text-sm uppercase tracking-wider"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                  Email Address
                </label>
                <InputText
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  className={`input-field !bg-transparent !text-white placeholder:!text-slate-500 !border !rounded-xl !px-4 !py-3.5 text-sm ${
                    errors.email ? "!border-red-500 !border-opacity-70" : ""
                  }`}
                />
                {errors.email && (
                  <small className="text-red-400 text-xs font-medium">
                    {errors.email.message}
                  </small>
                )}
              </div>

              <Button
                type="submit"
                label={isSubmitting ? "Sending Link..." : "Send Reset Link"}
                icon={isSubmitting ? "pi pi-spin pi-spinner" : undefined}
                iconPos="right"
                disabled={isSubmitting}
                className="w-full !rounded-xl !border-0 !py-3.5 !font-semibold !text-base !text-white bg-gradient-to-r !from-emerald-500 !via-teal-500 !to-cyan-500 hover:!shadow-[0_10px_40px_rgba(16,185,129,0.4)] transition-all duration-300 uppercase tracking-wider disabled:opacity-70"
              />

              {isWakingUp && (
                <div className="flex items-center justify-center gap-2 mt-2 text-amber-400 text-sm font-medium animate-pulse">
                  <i className="pi pi-spin pi-spinner text-base"></i>
                  <span>Waking up server... This may take a few seconds</span>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
