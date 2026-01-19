import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router'; 
import { loginUser } from "../authSlice";
import { useEffect, useState } from 'react';
import { Eye, EyeOff, Code, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import GoogleAuthButton from '../components/GoogleAuthButton';

const loginSchema = z.object({
  emailId: z.string().email("Invalid Email"),
  password: z.string().min(8, "Password is too weak") 
});

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    dispatch(loginUser(data));
  };

  return (
    <div className="min-h-screen bg-[#070707] text-gray-200 font-sans selection:bg-orange-500/30 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      
      {/* Background Decor (Matching Landing Page) */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Header / Logo */}
      <header className="absolute top-0 left-0 w-full flex justify-between items-center px-6 py-6 md:px-12">
        <NavLink to="/" className="flex items-center gap-2 group">
          <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-1.5 rounded-xl text-black">
            <Code size={20} strokeWidth={3} />
          </div>
          <span className="text-xl font-black text-white tracking-tighter italic">ALGO<span className="text-orange-500">SPRINT</span></span>
        </NavLink>
        <NavLink to="/" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white flex items-center gap-1 transition-colors">
          <ChevronLeft size={14} /> Back to home
        </NavLink>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-[#0c0c0c]/80 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-[32px] p-8 md:p-10">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase">
              Welcome <span className="text-orange-500 text-2xl">Back.</span>
            </h2>
            {/* <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mt-2">
              The grind never stops.
            </p> */}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Email Address</label>
              <input
                type="email"
                placeholder="name@company.com"
                className={`w-full bg-black/40 text-white rounded-2xl border px-4 py-3 text-sm transition-all duration-200
                  ${errors.emailId ? 'border-red-500/50' : 'border-white/10 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10'}
                  outline-none placeholder:text-gray-700`}
                {...register('emailId')}
              />
              {errors.emailId && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider mt-2 ml-1">{errors.emailId.message}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2 ml-1">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Password</label>
                <NavLink to="/forgot-password" size="xs" className="text-[10px] font-black uppercase tracking-widest text-orange-500 hover:text-orange-400 transition-colors">
                  Forgot?
                </NavLink>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full bg-black/40 text-white rounded-2xl border px-4 py-3 text-sm transition-all duration-200
                    ${errors.password ? 'border-red-500/50' : 'border-white/10 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10'}
                    outline-none placeholder:text-gray-700`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider mt-2 ml-1">{errors.password.message}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-orange-500 py-4 text-black font-black text-xs uppercase tracking-[0.2em] hover:bg-orange-600 transition-all shadow-[0_10px_30px_rgba(249,115,22,0.2)] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-8">
            <span className="flex-1 border-b border-white/5" />
            <span className="mx-4 text-[10px] font-black text-gray-600 uppercase tracking-widest">or continue with</span>
            <span className="flex-1 border-b border-white/5" />
          </div>

          {/* Google Auth Button - You might need to adjust internal padding of this component via props if possible */}
          <div className="space-y-3">
            <GoogleAuthButton type="user" isLoading={loading} />
          </div>

          {/* Footer */}
          <p className="text-center text-[11px] font-bold text-gray-500 mt-10 uppercase tracking-widest">
            New to the sprint?{' '}
            <NavLink to="/signup" className="text-white hover:text-orange-500 transition-colors underline underline-offset-4 decoration-orange-500/30">
              Create an account
            </NavLink>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;