import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ResetPasswordSchema } from "../../validations/ResetPasswordSchema";
import api from "../../apis/axios";

import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { useToast } from "../../context/ToastContext";
import { AlertCircle, ArrowLeft, Eye, EyeOff, KeyRound } from "lucide-react";
import { useState, useEffect } from "react";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const showToast = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState("");

  useEffect(() => {
    let active = true;
    const verifyToken = async () => {
      try {
        setVerifying(true);
        await api.get(`/user/reset-password/${token}`);
        if (active) {
          setTokenValid(true);
        }
      } catch (error) {
        if (active) {
          setTokenValid(false);
          setTokenError(
            error.response?.data?.message || "Password reset link is invalid or has expired."
          );
        }
      } finally {
        if (active) {
          setVerifying(false);
        }
      }
    };

    if (token) {
      verifyToken();
    } else {
      setVerifying(false);
      setTokenValid(false);
      setTokenError("Missing password reset token.");
    }

    return () => {
      active = false;
    };
  }, [token]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(ResetPasswordSchema),
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

    try {
      const res = await api.post(`/user/reset-password/${token}`, {
        password: data.password,
      });

      showToast({
        severity: "success",
        summary: "Password Reset",
        detail: res.data?.message || "Password reset successfully!",
        life: 3500,
      });

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      showToast({
        severity: "error",
        summary: "Reset Failed",
        detail: error.response?.data?.message || "Could not reset password",
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
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
        }
        input::-webkit-credentials-auto-fill-button,
        input::-webkit-strong-password-auto-fill-button {
          display: none !important;
          visibility: hidden;
          pointer-events: none;
          position: absolute;
          right: 0;
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
                <KeyRound size={20} className="text-white" />
              </div>
              <span className="text-xs font-semibold tracking-widest text-emerald-400 uppercase">
                Smart Finance
              </span>
            </div>

            <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
              Reset Password
            </h1>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              Enter your new password below to regain access to your account.
            </p>
          </div>

          {verifying ? (
            <div className="py-10 text-center space-y-3">
              <i className="pi pi-spin pi-spinner text-emerald-400 text-3xl"></i>
              <p className="text-slate-400 text-sm">Verifying reset link...</p>
            </div>
          ) : !tokenValid ? (
            <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-6 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/20 flex items-center justify-center text-red-400">
                <AlertCircle size={28} />
              </div>
              <h2 className="text-xl font-bold text-white font-display">Link Invalid or Expired</h2>
              <p className="text-slate-300 text-sm leading-relaxed">{tokenError}</p>
              <Link
                to="/forgot-password"
                className="block w-full text-center py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-semibold text-sm uppercase tracking-wider"
              >
                Request New Reset Link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                  New Password
                </label>
                <div className="relative">
                  <InputText
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 6 characters"
                    {...register("password")}
                    className={`input-field !bg-transparent !text-white placeholder:!text-slate-500 !border !rounded-xl !px-4 !py-3.5 !pr-11 text-sm w-full ${
                      errors.password ? "!border-red-500 !border-opacity-70" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <small className="text-red-400 text-xs font-medium">
                    {errors.password.message}
                  </small>
                )}
              </div>

              <div className="flex flex-col gap-2.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                  Confirm Password
                </label>
                <div className="relative">
                  <InputText
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your new password"
                    {...register("confirmPassword")}
                    className={`input-field !bg-transparent !text-white placeholder:!text-slate-500 !border !rounded-xl !px-4 !py-3.5 !pr-11 text-sm w-full ${
                      errors.confirmPassword ? "!border-red-500 !border-opacity-70" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <small className="text-red-400 text-xs font-medium">
                    {errors.confirmPassword.message}
                  </small>
                )}
              </div>

              <Button
                type="submit"
                label={isSubmitting ? "Resetting Password..." : "Reset Password"}
                icon={isSubmitting ? "pi pi-spin pi-spinner" : undefined}
                iconPos="right"
                disabled={isSubmitting}
                className="w-full !rounded-xl !border-0 !py-3.5 !font-semibold !text-base !text-white bg-gradient-to-r !from-emerald-500 !via-teal-500 !to-cyan-500 hover:!shadow-[0_10px_40px_rgba(16,185,129,0.4)] transition-all duration-300 uppercase tracking-wider disabled:opacity-70"
              />
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
