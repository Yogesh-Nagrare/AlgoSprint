import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosClient from "../utils/axiosClient"; // ✅ Use your axios instance
import { useState } from "react";
import { useParams, useNavigate, NavLink } from "react-router";
import { Eye, EyeOff, Code, CheckCircle, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";

const schema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setMessage("");

    try {
      const res = await axiosClient.post(`/user/reset-password/${token}`, {
        password: data.password,
      });

      setMessage(res.data.message);
      setIsSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("❌ Reset password error:", err);
      setMessage(
        err.response?.data?.message || "Failed to reset password"
      );
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070707] text-gray-200 font-sans selection:bg-orange-500/30 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 w-full flex justify-between items-center px-6 py-6 md:px-12">
        <NavLink to="/" className="flex items-center gap-2 group">
          <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-1.5 rounded-xl text-black">
            <Code size={20} strokeWidth={3} />
          </div>
          <span className="text-xl font-black text-white tracking-tighter italic">
            ALGO<span className="text-orange-500">SPRINT</span>
          </span>
        </NavLink>
        <NavLink 
          to="/login" 
          className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white flex items-center gap-1 transition-colors"
        >
          <ChevronLeft size={14} /> Back to login
        </NavLink>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-[#0c0c0c]/80 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-[32px] p-8 md:p-10">
          
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase">
              Reset <span className="text-orange-500">Password</span>
            </h2>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
              Enter your new password below
            </p>
          </div>

          {!isSuccess ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* New Password */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`w-full bg-black/40 text-white rounded-2xl border px-4 py-3 text-sm transition-all duration-200
                      ${errors.password ? 'border-red-500/50' : 'border-white/10 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10'}
                      outline-none placeholder:text-gray-700`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-[10px] font-bold uppercase mt-2 ml-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    {...register("confirmPassword")}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`w-full bg-black/40 text-white rounded-2xl border px-4 py-3 text-sm transition-all duration-200
                      ${errors.confirmPassword ? 'border-red-500/50' : 'border-white/10 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10'}
                      outline-none placeholder:text-gray-700`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-[10px] font-bold uppercase mt-2 ml-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-2xl bg-orange-500 py-4 text-black font-black text-xs uppercase tracking-[0.2em] hover:bg-orange-600 transition-all shadow-[0_10px_30px_rgba(249,115,22,0.2)] active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <CheckCircle size={48} className="text-green-500 mx-auto" />
              <p className="text-gray-300">{message}</p>
              <p className="text-gray-500 text-xs">Redirecting to login...</p>
            </div>
          )}

          {message && !isSuccess && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400 text-xs text-center font-bold uppercase">
                {message}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default ResetPassword;