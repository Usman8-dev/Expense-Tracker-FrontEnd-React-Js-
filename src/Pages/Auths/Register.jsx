import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { RegisterSchema } from "../../validations/RegisterSchema";
import api from "../../apis/axios";

import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { useToast } from "../../context/ToastContext";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

function Register() {
  const navigate = useNavigate();
  const showToast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(RegisterSchema),
  });

  const onSubmit = async (data) => {
    try {
      const { confirmPassword, ...payload } = data;
      await api.post("/user/register", payload);
      showToast({
        severity: "success",
        summary: "Success",
        detail: "Account created successfully!",
        life: 3000,
      });
      navigate("/");
    } catch (error) {
      showToast({
        severity: "error",
        summary: "Registration Failed",
        detail: error.response?.data?.message || "Something went wrong",
        life: 3000,
      });
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-850 flex items-center justify-center p-4 overflow-hidden font-sans">
      {/* Animated background elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@500;600;700;800&display=swap');
        
        * { font-family: 'Inter', sans-serif; }
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
        
        @keyframes shimmer {
          0%, 100% { background-position: 0% 0%; }
          50% { background-position: 100% 0%; }
        }
        
        .form-container {
          animation: slideUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        
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
        
        .submit-btn {
          position: relative;
          overflow: hidden;
        }
        
        .submit-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s ease;
        }
        
        .submit-btn:hover::before {
          left: 100%;
        }
        
        .error-text {
          animation: slideUp 0.3s ease-out both;
        }
        
        .glass-card {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.7), rgba(30, 41, 59, 0.7));
          backdrop-filter: blur(20px);
          border: 1px solid rgba(148, 163, 184, 0.15);
          box-shadow: 
            0 8px 32px 0 rgba(31, 38, 135, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        
        .text-gradient {
          background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Toast Styling - White Text */
        .p-toast .p-toast-message {
          color: #ffffff !important;
        }
        
        .p-toast-message-content {
          color: #ffffff !important;
        }
        
        .p-toast-message-summary {
          color: #ffffff !important;
          font-weight: 600;
        }
        
        .p-toast-message-detail {
          color: #ffffff !important;
          font-weight: 400;
        }
        
        .p-toast-message.p-toast-message-success .p-toast-message-content {
          color: #ffffff !important;
        }
        
        .p-toast-message.p-toast-message-error .p-toast-message-content {
          color: #ffffff !important;
        }
        
        .p-toast-message.p-toast-message-info .p-toast-message-content {
          color: #ffffff !important;
        }
        
        .p-toast-message.p-toast-message-warn .p-toast-message-content {
          color: #ffffff !important;
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
        {/* Glass morphism card */}
        <div className="glass-card rounded-3xl p-8 md:p-10">
          {/* Header Section */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">Rs.</span>
              </div>
              <span className="text-xs font-semibold tracking-widest text-emerald-400 uppercase">
                Smart Finance
              </span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-3 leading-tight">
              Join ExpenseFlow
            </h1>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              Take control of your finances. Track, analyze, and optimize your spending in seconds.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            {/* Name and Age Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Name Field */}
              <div className="flex flex-col gap-2.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                  Full Name
                </label>
                <InputText
                  placeholder="Sarah Johnson"
                  {...register("name")}
                  className={`input-field !bg-transparent !text-white placeholder:!text-slate-500 !border !rounded-xl !px-4 !py-3.5 text-sm ${
                    errors.name ? "!border-red-500 !border-opacity-70" : ""
                  }`}
                />
                {errors.name && (
                  <small className="error-text text-red-400 text-xs font-medium">
                    {errors.name.message}
                  </small>
                )}
              </div>

              {/* Age Field */}
              <div className="flex flex-col gap-2.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                  Age
                </label>
                <InputText
                  type="number"
                  placeholder="25"
                  min="13"
                  max="120"
                  {...register("age")}
                  className={`input-field !bg-transparent !text-white placeholder:!text-slate-500 !border !rounded-xl !px-4 !py-3.5 text-sm ${
                    errors.age ? "!border-red-500 !border-opacity-70" : ""
                  }`}
                />
                {errors.age && (
                  <small className="error-text text-red-400 text-xs font-medium">
                    {errors.age.message}
                  </small>
                )}
              </div>
            </div>

            {/* Email Field */}
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
                <small className="error-text text-red-400 text-xs font-medium">
                  {errors.email.message}
                </small>
              )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <InputText
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter a secure password"
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
                <small className="error-text text-red-400 text-xs font-medium">
                  {errors.password.message}
                </small>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="flex flex-col gap-2.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                Confirm Password
              </label>
              <div className="relative">
                <InputText
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
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
                <small className="error-text text-red-400 text-xs font-medium">
                  {errors.confirmPassword.message}
                </small>
              )}
            </div>
            {/* Submit Button */}
            <Button
              type="submit"
              label="Create Account"
              className="submit-btn w-full !rounded-xl !border-0 !py-3.5 !font-semibold !text-base !text-white bg-gradient-to-r !from-emerald-500 !via-teal-500 !to-cyan-500 hover:!shadow-[0_10px_40px_rgba(16,185,129,0.4)] transition-all duration-300 !mt-2 uppercase tracking-wider"
            />
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700/50"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-slate-500">
                Already have an account?
              </span>
            </div>
          </div>

          {/* Sign In Link */}
          <a
            href="/"
            className="block w-full text-center px-4 py-3 rounded-xl border border-slate-700/50 text-slate-300 font-medium hover:border-emerald-500/50 hover:bg-gradient-to-r hover:from-emerald-500/10 hover:to-teal-500/10 transition-all duration-300"
          >
            Sign In Instead
          </a>
        </div>

        {/* Footer text */}
        <p className="text-center text-xs text-slate-500 mt-8 leading-relaxed">
          By creating an account, you agree to our{" "}
          <a href="#" className="text-emerald-400 hover:text-emerald-300 transition-colors">
            Terms of Service
          </a>
          {" "}and{" "}
          <a href="#" className="text-emerald-400 hover:text-emerald-300 transition-colors">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}

export default Register;