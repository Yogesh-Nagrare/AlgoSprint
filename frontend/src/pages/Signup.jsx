import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Code, ChevronLeft, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { registerUser } from '../authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { motion } from 'framer-motion';
import GoogleAuthButton from '../components/GoogleAuthButton';

// 1. Zod schema
const signupSchema = z.object({
  firstName: z.string().min(3, 'Minimum 3 characters required'),
  emailId: z.string().email('Invalid Email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);
const onSubmit = (data) => {
  dispatch(registerUser(data))
    .unwrap()
    .then((response) => {
      // Show success message
      alert("Registration successful! Please check your email to verify your account.");
      navigate("/verify-notice");
    })
    .catch((err) => {
      console.error("Registration error:", err);
      const errorMsg = err?.message || err || "Registration failed";
      alert(errorMsg);
    }); 
};

  return (
    <div className="min-h-screen bg-[#070707] text-gray-200 font-sans selection:bg-orange-500/30 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      
      {/* Background Decor */}
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
        <NavLink to="/login" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white flex items-center gap-1 transition-colors">
          Already a member? <span className="text-orange-500 ml-1">Login</span>
        </NavLink>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10 py-12"
      >
        <div className="bg-[#0c0c0c]/80 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-[32px] p-8 md:p-10">
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase">
              Start Your <span className="text-orange-500 text-4xl">Sprint.</span>
            </h2>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
              Join 50,000+ developers mastering algorithms.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
            {/* First Name */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">First Name</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="John Doe"
                  className={`w-full bg-black/40 text-white rounded-2xl border px-4 py-3 text-sm transition-all duration-200
                    ${errors.firstName ? 'border-red-500/50' : 'border-white/10 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10'}
                    outline-none placeholder:text-gray-700`}
                  {...register('firstName')}
                />
              </div>
              {errors.firstName && <p className="text-red-500 text-[10px] font-bold uppercase mt-2 ml-1">{errors.firstName.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Email Address</label>
              <input
                type="email"
                placeholder="john@example.com"
                className={`w-full bg-black/40 text-white rounded-2xl border px-4 py-3 text-sm transition-all duration-200
                  ${errors.emailId ? 'border-red-500/50' : 'border-white/10 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10'}
                  outline-none placeholder:text-gray-700`}
                {...register('emailId')}
              />
              {errors.emailId && <p className="text-red-500 text-[10px] font-bold uppercase mt-2 ml-1">{errors.emailId.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Create Password</label>
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
              {errors.password && <p className="text-red-500 text-[10px] font-bold uppercase mt-2 ml-1">{errors.password.message}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-orange-500 py-4 text-black font-black text-xs uppercase tracking-[0.2em] hover:bg-orange-600 transition-all shadow-[0_10px_30px_rgba(249,115,22,0.2)] active:scale-[0.98] disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-8">
            <span className="flex-1 border-b border-white/5" />
            <span className="mx-4 text-[10px] font-black text-gray-600 uppercase tracking-widest">social signup</span>
            <span className="flex-1 border-b border-white/5" />
          </div>

          {/* OAuth */}
          <div className="space-y-3">
             <GoogleAuthButton type="user" isLoading={loading} />
          </div>

          <p className="text-center text-[10px] text-gray-600 mt-8 leading-relaxed uppercase font-bold tracking-tighter">
            By signing up, you agree to our <span className="text-gray-400 hover:text-white cursor-pointer">Terms of Service</span> and <span className="text-gray-400 hover:text-white cursor-pointer">Privacy Policy</span>.
          </p>
        </div>

        {/* Home Link */}
        <div className="mt-8 text-center">
            <NavLink to="/" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-1">
               <ChevronLeft size={14} /> Back to explore
            </NavLink>
        </div>
      </motion.div>
    </div>
  );
}

export default Signup;