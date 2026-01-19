import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code, Brain, Target, Rocket, 
  ChevronRight, Zap, Briefcase, 
  Trophy, Users, Globe, CheckCircle2 
} from 'lucide-react';

/**
 * ACETERNITY LOGIC: Infinite Moving Cards
 */
const InfiniteMovingCards = ({ items, direction = "left", speed = "fast", pauseOnHover = true }) => {
  const containerRef = React.useRef(null);
  const scrollerRef = React.useRef(null);

  useEffect(() => {
    addAnimation();
  }, []);

  const [start, setStart] = useState(false);

  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });

      getDirection();
      getSpeed();
      setStart(true);
    }
  }

  const getDirection = () => {
    if (containerRef.current) {
      containerRef.current.style.setProperty(
        "--animation-direction",
        direction === "left" ? "forwards" : "reverse"
      );
    }
  };

  const getSpeed = () => {
    if (containerRef.current) {
      if (speed === "fast") {
        containerRef.current.style.setProperty("--animation-duration", "20s");
      } else if (speed === "normal") {
        containerRef.current.style.setProperty("--animation-duration", "40s");
      } else {
        containerRef.current.style.setProperty("--animation-duration", "80s");
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="scroller relative z-20 max-w-7xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]"
    >
      <ul
        ref={scrollerRef}
        className={`flex min-w-full shrink-0 gap-8 py-4 w-max flex-nowrap ${
          start && "animate-scroll"
        } ${pauseOnHover && "hover:[animation-play-state:paused]"}`}
      >
        {items.map((item, idx) => (
          <li
            key={idx}
            className="w-[250px] max-w-full relative rounded-2xl border border-white/10 px-8 py-6 bg-gradient-to-b from-white/5 to-transparent flex-shrink-0"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Briefcase size={16} className="text-orange-500" />
                </div>
                <span className="text-lg font-black text-white tracking-tight">
                  {item.company}
                </span>
              </div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Top Hiring Partner
              </span>
            </div>
          </li>
        ))}
      </ul>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scroll {
          to {
            transform: translate(calc(-50% - 0.5rem));
          }
        }
        .animate-scroll {
          animation: scroll var(--animation-duration, 40s) var(--animation-direction, forwards) linear infinite;
        }
      `}} />
    </div>
  );
};

function LandingPage() {
  const navigate = useNavigate();

  const companies = [
    { company: "Google" }, { company: "Amazon" }, { company: "Microsoft" },
    { company: "Meta" }, { company: "Netflix" }, { company: "Apple" },
    { company: "Uber" }, { company: "Zomato" }, { company: "Adobe" }
  ];

  const features = [
    {
      icon: <Brain className="text-orange-500" />,
      title: "Algorithmic Mastery",
      desc: "Solve 1000+ hand-picked problems designed to crack top-tier tech interviews."
    },
    {
      icon: <Target className="text-purple-500" />,
      title: "Focused Learning",
      desc: "Topic-wise curation from Arrays to Dynamic Programming with detailed explanations."
    },
    {
      icon: <Zap className="text-blue-500" />,
      title: "Real-time Feedback",
      desc: "Industry-standard judge system that provides sub-second execution feedback."
    }
  ];

  return (
    <div className="min-h-screen bg-[#070707] text-gray-200 font-sans selection:bg-orange-500/30 overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      {/* NAVBAR */}
      <nav className="bg-[#0c0c0c]/80 backdrop-blur-2xl border-b border-white/10 px-4 md:px-12 h-16 sticky top-0 z-50 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-2 group">
          <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-1.5 rounded-xl text-black">
            <Code size={20} strokeWidth={3} />
          </div>
          <span className="text-xl font-black text-white tracking-tighter italic">ALGO<span className="text-orange-500">SPRINT</span></span>
        </div>

        <div className="flex items-center gap-6">
          <NavLink to="/login" className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all">Log In</NavLink>
          <button 
            onClick={() => navigate('/signup')}
            className="px-6 py-2 rounded-full bg-orange-500 text-black text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-[0_0_20px_rgba(249,115,22,0.4)]"
          >
            Register
          </button>
        </div>
      </nav>

      <main className="relative z-10">
        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/30 bg-orange-500/5 text-orange-500 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
              <Trophy size={12} /> The Proving Ground for Coders
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-8 leading-[0.9]">
              CODE. SOLVE. <br />
              <span className="text-orange-500 italic">CONQUER.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-gray-400 text-lg md:text-xl font-medium mb-10 leading-relaxed">
              Master Data Structures and Algorithms with the most intuitive 
              coding platform. Built for the next generation of engineers.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => navigate('/signup')}
                className="group flex items-center gap-3 px-10 py-4 bg-white text-black rounded-2xl font-black text-sm hover:bg-orange-500 transition-all duration-300"
              >
                Get Started Free <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-10 py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-sm hover:bg-white/10 transition-all">
                View Problems
              </button>
            </div>
          </motion.div>
        </section>

        {/* ACETERNITY MOVING CARDS SECTION */}
        <section className="py-20 bg-white/[0.02] border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-center text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mb-12">
              Our Graduates are Hired by Global Giants
            </h2>
            <InfiniteMovingCards 
              items={companies}
              direction="left"
              speed="normal"
            />
          </div>
        </section>

        {/* WHY CODE MASTER (FEATURES) */}
        <section className="max-w-7xl mx-auto px-6 py-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -10 }}
                className="p-8 rounded-3xl bg-[#0f0f0f] border border-white/10 group hover:border-orange-500/50 transition-all shadow-2xl"
              >
                <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center mb-8 border border-white/5 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-black text-white mb-4 italic uppercase tracking-tight">{feature.title}</h3>
                <p className="text-gray-500 text-sm font-medium leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CLONE INFO / SYSTEM STATS */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="bg-gradient-to-br from-orange-500/20 via-[#0f0f0f] to-[#0f0f0f] rounded-[40px] border border-white/10 p-8 md:p-16 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-10 opacity-10">
               <Globe size={300} className="text-orange-500" />
            </div>
            
            <div className="grid lg:grid-cols-2 gap-16 relative z-10">
              <div>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-8 leading-tight">
                  A High-Performance <br />
                  <span className="text-orange-500">Learning Ecosystem.</span>
                </h2>
                <div className="space-y-6">
                  {[
                    "Distributed Judge System for instant results",
                    "Global Contests with real-time Leaderboards",
                    "Detailed Submission Analytics & Memory Graphs",
                    "Company-specific curated problem sets"
                  ].map((text, i) => (
                    <div key={i} className="flex items-center gap-4 text-gray-300 font-bold">
                      <div className="bg-orange-500 rounded-full p-1">
                        <CheckCircle2 size={14} className="text-black" />
                      </div>
                      {text}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-black/40 backdrop-blur-xl p-6 rounded-3xl border border-white/5">
                    <p className="text-4xl font-black text-white mb-1">99.9%</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-orange-500">Uptime</p>
                 </div>
                 <div className="bg-black/40 backdrop-blur-xl p-6 rounded-3xl border border-white/5">
                    <p className="text-4xl font-black text-white mb-1">0.2s</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">Latency</p>
                 </div>
                 <div className="bg-black/40 backdrop-blur-xl p-6 rounded-3xl border border-white/5">
                    <p className="text-4xl font-black text-white mb-1">500k+</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-purple-500">Submissions</p>
                 </div>
                 <div className="bg-black/40 backdrop-blur-xl p-6 rounded-3xl border border-white/5">
                    <p className="text-4xl font-black text-white mb-1">100+</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Companies</p>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA FOOTER */}
        <section className="py-32 text-center px-6">
           <motion.div
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             transition={{ duration: 1 }}
           >
              <h2 className="text-4xl md:text-6xl font-black text-white mb-10 tracking-tighter">
                READY TO <span className="text-orange-500 italic">START?</span>
              </h2>
              <button 
                onClick={() => navigate('/signup')}
                className="bg-orange-500 text-black px-12 py-5 rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-[0_20px_50px_rgba(249,115,22,0.3)]"
              >
                Join the Community Now
              </button>
              <p className="mt-8 text-gray-500 font-bold text-sm uppercase tracking-[0.3em]">ALGOSPRINT © 2024</p>
           </motion.div>
        </section>
      </main>
    </div>
  );
}

export default LandingPage;