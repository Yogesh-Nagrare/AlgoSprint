import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom'; // Changed to common router import
import { motion } from 'framer-motion';
import { 
  Code, Brain, Target, Rocket, 
  ChevronRight, Zap, Briefcase, 
  Trophy, Users, Globe, CheckCircle2,
  Sparkles, ArrowRight, Star, Github,
  Twitter, Linkedin, Mail, Heart
} from 'lucide-react';

/**
 * Enhanced Company Logo Component with Brand Colors
 */
const CompanyLogo = ({ name }) => {
  const logos = {
    Google: (
      <svg viewBox="0 0 24 24" className="w-8 h-8">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    ),
    Amazon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8">
        <path fill="#FF9900" d="M14.09 18.51c-2.6 1.92-6.37 2.93-9.62 2.93-4.55 0-8.65-1.68-11.75-4.48-.24-.22-.03-.52.27-.35 3.34 1.94 7.47 3.11 11.73 3.11 2.88 0 6.04-.6 8.95-1.83.44-.19.81.29.42.62z"/>
        <path fill="#FF9900" d="M15.35 16.98c-.33-.42-2.19-.2-3.02-.1-.25.03-.29-.19-.06-.35 1.48-1.04 3.91-.74 4.19-.39.28.35-.07 2.79-1.46 3.96-.21.18-.42.08-.32-.15.31-.77 1-.25 1.67-.97z"/>
        <path fill="#221F1F" d="M13.77 7.03c0 .77.02 1.41-.37 2.1-.31.56-.81.9-1.36.9-.75 0-1.19-.57-1.19-1.42 0-1.67 1.5-1.97 2.92-1.97v.39zm1.87 4.52c-.12.11-.29.12-.43.04-.6-.5-.71-.73-1.04-1.21-.99.02-1.74.13-2.45-.04-1.24-.3-2.11-1.09-2.11-2.73 0-1.42.74-2.39 1.78-2.86.91-.42 2.18-.5 3.15-.62v-.23c0-.46.04-.99-.23-1.38-.23-.35-.68-.5-1.07-.5-.73 0-1.38.37-1.54 1.14-.03.17-.16.33-.33.34l-1.8-.19c-.15-.03-.32-.16-.28-.39.42-2.21 2.42-2.88 4.21-2.88.92 0 2.11.24 2.83 1.94.11.5.11 1.36.11 2.02v2.49c0 .75.31 1.08.6 1.48.1.14.12.31-.01.42-.33.28-.91.78-1.23 1.06l-.02-.01z"/>
      </svg>
    ),
    Microsoft: (
      <svg viewBox="0 0 24 24" className="w-8 h-8">
        <path fill="#F25022" d="M1 1h10v10H1z"/><path fill="#00A4EF" d="M13 1h10v10H13z"/><path fill="#7FBA00" d="M1 13h10v10H1z"/><path fill="#FFB900" d="M13 13h10v10H13z"/>
      </svg>
    ),
    Meta: (
      <svg viewBox="0 0 24 24" className="w-8 h-8">
        <path fill="#0866FF" d="M22.676 0H1.324C.593 0 0 .593 0 1.324v21.352C0 23.407.593 24 1.324 24h11.494v-9.294H9.689v-3.621h3.129V8.413c0-3.099 1.894-4.785 4.659-4.785 1.325 0 2.464.097 2.796.141v3.24h-1.921c-1.5 0-1.792.721-1.792 1.771v2.311h3.584l-.465 3.63H16.56V24h6.115c.733 0 1.325-.593 1.325-1.324V1.324C24 .593 23.407 0 22.676 0"/>
      </svg>
    ),
    Netflix: (
      <svg viewBox="0 0 24 24" className="w-8 h-8">
        <path fill="#E50914" d="M5.398 0v.006c3.028 8.556 5.37 15.175 8.348 23.596 2.344.058 4.85.398 4.854.398-2.8-7.924-5.923-16.747-8.487-24zm8.489 0v9.63L18.6 22.951c-.043-7.86-.004-15.913.002-22.95zM5.398 1.05V24c1.873-.225 2.81-.312 4.715-.398v-9.22z"/>
      </svg>
    ),
    Apple: (
      <svg viewBox="0 0 24 24" className="w-8 h-8">
        <path fill="#555555" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
      </svg>
    ),
    Uber: (
      <svg viewBox="0 0 24 24" className="w-8 h-8">
        <path fill="#000000" d="M0 0v24h24V0zm10.5 19.5h-3v-9h3zm12 0h-3v-9h1.5c1.65 0 3 1.35 3 3v1.5c0 1.65-1.35 3-3 3h-1.5v1.5zM3 4.5h3v3H3z"/>
      </svg>
    ),
    Zomato: (
      <svg viewBox="0 0 24 24" className="w-8 h-8">
        <path fill="#E23744" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.5 13.5h-7c-.276 0-.5-.224-.5-.5s.224-.5.5-.5h7c.276 0 .5.224.5.5s-.224.5-.5.5zm0-3h-7c-.276 0-.5-.224-.5-.5s.224-.5.5-.5h7c.276 0 .5.224.5.5s-.224.5-.5.5zm0-3h-7c-.276 0-.5-.224-.5-.5s.224-.5.5-.5h7c.276 0 .5.224.5.5s-.224.5-.5.5z"/>
      </svg>
    ),
    Adobe: (
      <svg viewBox="0 0 24 24" className="w-8 h-8">
        <path fill="#FF0000" d="M13.966 22.624l-1.69-4.281H8.122l3.892-9.144 5.662 13.425zM8.884 1.376H0v21.248zm15.116 0h-8.884L24 22.624Z"/>
      </svg>
    ),
  };

  return (
    <div className="flex items-center gap-3">
      <div className="bg-white rounded-lg p-2 flex items-center justify-center">
        {logos[name]}
      </div>
      <span className="text-lg font-black text-white tracking-tight">{name}</span>
    </div>
  );
};

/**
 * ACETERNITY LOGIC: Infinite Moving Cards Enhanced
 */
const InfiniteMovingCards = ({ items, direction = "left", speed = "fast", pauseOnHover = true }) => {
  const containerRef = React.useRef(null);
  const scrollerRef = React.useRef(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    addAnimation();
  }, []);

  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);
      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) scrollerRef.current.appendChild(duplicatedItem);
      });
      getDirection();
      getSpeed();
      setStart(true);
    }
  }

  const getDirection = () => {
    if (containerRef.current) {
      containerRef.current.style.setProperty("--animation-direction", direction === "left" ? "forwards" : "reverse");
    }
  };

  const getSpeed = () => {
    if (containerRef.current) {
      const duration = speed === "fast" ? "20s" : speed === "normal" ? "40s" : "80s";
      containerRef.current.style.setProperty("--animation-duration", duration);
    }
  };

  return (
    <div ref={containerRef} className="scroller relative z-20 max-w-7xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]">
      <ul ref={scrollerRef} className={`flex min-w-full shrink-0 gap-6 py-4 w-max flex-nowrap ${start && "animate-scroll"} ${pauseOnHover && "hover:[animation-play-state:paused]"}`}>
        {items.map((item, idx) => (
          <li key={idx} className="w-[280px] relative rounded-2xl border border-white/10 px-6 py-6 bg-gradient-to-br from-white/5 via-white/[0.02] to-transparent backdrop-blur-sm flex-shrink-0 hover:border-orange-500/30 transition-all hover:shadow-[0_0_30px_rgba(249,115,22,0.15)] group">
            <div className="flex flex-col gap-3">
              <CompanyLogo name={item.company} />
              <div className="flex items-center gap-2">
                <Star size={12} className="text-orange-500 fill-orange-500" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Top Hiring Partner</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <style dangerouslySetInnerHTML={{ __html: `@keyframes scroll { to { transform: translate(calc(-50% - 0.5rem)); } } .animate-scroll { animation: scroll var(--animation-duration, 40s) var(--animation-direction, forwards) linear infinite; }`}} />
    </div>
  );
};

/**
 * Floating Particles Background
 */
const FloatingParticles = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-orange-500/30 rounded-full"
          initial={{ x: Math.random() * 1000, y: Math.random() * 1000 }}
          animate={{ x: Math.random() * 1000, y: Math.random() * 1000 }}
          transition={{ duration: Math.random() * 20 + 10, repeat: Infinity, repeatType: "reverse" }}
        />
      ))}
    </div>
  );
};

function LandingPage() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const companies = [
    { company: "Google" }, { company: "Amazon" }, { company: "Microsoft" },
    { company: "Meta" }, { company: "Netflix" }, { company: "Apple" },
    { company: "Uber" }, { company: "Zomato" }, { company: "Adobe" }
  ];

  const features = [
    {
      icon: <Brain className="text-orange-500" size={28} />,
      title: "Algorithmic Mastery",
      desc: "Solve 1000+ hand-picked problems designed to crack top-tier tech interviews with detailed editorial solutions."
    },
    {
      icon: <Target className="text-purple-500" size={28} />,
      title: "Focused Learning",
      desc: "Topic-wise curation from Arrays to Dynamic Programming with step-by-step video explanations and hints."
    },
    {
      icon: <Zap className="text-blue-500" size={28} />,
      title: "Real-time Feedback",
      desc: "Industry-standard judge system that provides sub-second execution feedback with detailed test case analysis."
    }
  ];

  const stats = [
    { value: "99.9%", label: "Uptime", color: "orange" },
    { value: "0.2s", label: "Latency", color: "blue" },
    { value: "500k+", label: "Submissions", color: "purple" },
    { value: "100+", label: "Companies", color: "emerald" }
  ];

  return (
    <div className="min-h-screen bg-[#070707] text-gray-200 font-sans selection:bg-orange-500/30 overflow-x-hidden">
      <FloatingParticles />
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px] animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* NAVBAR */}
      <nav className={`${isScrolled ? 'bg-[#0c0c0c]/95 shadow-2xl' : 'bg-[#0c0c0c]/80'} backdrop-blur-2xl border-b border-white/10 px-4 md:px-12 h-16 sticky top-0 z-50 flex items-center justify-between transition-all duration-300`}>
        <div className="flex items-center gap-2 group cursor-pointer">
          <motion.div className="bg-gradient-to-br from-orange-400 to-orange-600 p-1.5 rounded-xl text-black" whileHover={{ rotate: 180 }}>
            <Code size={20} strokeWidth={3} />
          </motion.div>
          <span className="text-xl font-black text-white tracking-tighter italic">ALGO<span className="text-orange-500">SPRINT</span></span>
        </div>

        <div className="flex items-center gap-6">
          <NavLink to="/login" className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all">Log In</NavLink>
          <motion.button 
            onClick={() => navigate('/signup')}
            whileHover={{ scale: 1.05 }}
            className="px-6 py-2 rounded-full bg-orange-500 text-black text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(249,115,22,0.4)]"
          >
            Register
          </motion.button>
        </div>
      </nav>

      <main className="relative z-10">
        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-6 pt-32 pb-24 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/30 bg-orange-500/5 text-orange-500 text-[10px] font-black uppercase tracking-[0.2em] mb-10">
              <Sparkles size={14} className="animate-pulse" /> The Proving Ground for Coders
            </div>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white mb-10 leading-[0.9]">
              CODE. SOLVE. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 italic">CONQUER.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-gray-400 text-lg md:text-xl font-medium mb-12">
              Master Data Structures and Algorithms with the most intuitive coding platform. Built for the next generation of engineers.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button 
                onClick={() => navigate('/signup')}
                whileHover={{ scale: 1.05, boxShadow: "0 20px 60px rgba(249,115,22,0.4)" }}
                className="group flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-orange-500 to-orange-600 text-black rounded-2xl font-black text-sm"
              >
                Get Started Free <ArrowRight size={18} />
              </motion.button>
              <button className="px-10 py-5 bg-white/5 border border-white/10 rounded-2xl font-black text-sm hover:bg-white/10 transition-all">
                View Problems
              </button>
            </div>
          </motion.div>
        </section>

        {/* LOGO MARQUEE */}
        <section className="py-24 border-y border-white/5 bg-white/[0.01]">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-center text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mb-16">Graduates Hired by Global Giants</h2>
            <InfiniteMovingCards items={companies} />
          </div>
        </section>

        {/* FEATURES */}
        <section className="max-w-7xl mx-auto px-6 py-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div key={idx} whileHover={{ y: -10 }} className="p-8 rounded-3xl bg-gradient-to-br from-[#0f0f0f] to-[#0a0a0a] border border-white/10 group hover:border-orange-500/50 transition-all">
                <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center mb-8 border border-white/5 group-hover:scale-110 transition-all">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-black text-white mb-4 italic uppercase">{feature.title}</h3>
                <p className="text-gray-500 text-sm font-medium leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* STATS & ECOSYSTEM */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} className="bg-gradient-to-br from-orange-500/20 via-[#0f0f0f] to-[#0f0f0f] rounded-[40px] border border-white/10 p-8 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-10"><Globe size={300} className="text-orange-500" /></div>
            <div className="grid lg:grid-cols-2 gap-16 relative z-10">
              <div>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-8">A High-Performance <br /><span className="text-orange-500">Learning Ecosystem.</span></h2>
                <div className="space-y-6">
                  {["Distributed Judge System", "Global Contests", "Detailed Submission Analytics", "Company Curated Sets"].map((text, i) => (
                    <div key={i} className="flex items-center gap-4 text-gray-300 font-bold">
                      <div className="bg-orange-500 rounded-full p-1"><CheckCircle2 size={14} className="text-black" /></div>{text}
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 {stats.map((stat, idx) => (
                   <div key={idx} className="bg-black/40 backdrop-blur-xl p-6 rounded-3xl border border-white/5">
                      <p className="text-4xl font-black text-white mb-1">{stat.value}</p>
                      <p className={`text-[10px] font-black uppercase tracking-widest text-orange-500`}>{stat.label}</p>
                   </div>
                 ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* FINAL CTA */}
        <section className="py-32 text-center px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter">
              READY TO <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 italic">START?</span>
            </h2>
            <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto">Join thousands of developers mastering algorithms today.</p>
            <motion.button 
              onClick={() => navigate('/signup')}
              whileHover={{ scale: 1.05 }}
              className="px-12 py-5 bg-orange-500 text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(249,115,22,0.3)]"
            >
              Join the Community Now
            </motion.button>
          </motion.div>
        </section>
      </main>

      {/* ENHANCED FOOTER */}
      <footer className="border-t border-white/10 bg-[#050505] pt-24 pb-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 mb-20">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-8">
                <div className="bg-orange-500 p-1.5 rounded-lg text-black"><Code size={20} strokeWidth={3} /></div>
                <span className="text-xl font-black text-white italic">ALGO<span className="text-orange-500">SPRINT</span></span>
              </div>
              <p className="text-gray-500 text-sm font-medium max-w-xs mb-8">Master data structures, algorithms, and technical interviews.</p>
              <div className="flex gap-4">
                {[Github, Twitter, Linkedin, Mail].map((Icon, i) => (
                  <a key={i} href="#" className="text-gray-500 hover:text-orange-500 transition-colors"><Icon size={20} /></a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-white font-black text-[10px] uppercase tracking-[0.2em] mb-8">Platform</h4>
              <ul className="space-y-4 text-sm font-bold text-gray-500">
                <li><a href="#" className="hover:text-orange-500">Problems</a></li>
                <li><a href="#" className="hover:text-orange-500">Contests</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-black text-[10px] uppercase tracking-[0.2em] mb-8">Company</h4>
              <ul className="space-y-4 text-sm font-bold text-gray-500">
                <li><a href="#" className="hover:text-orange-500">About Us</a></li>
                <li><a href="#" className="hover:text-orange-500">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.3em]">© 2024 ALGO SPRINT INC.</p>
            <div className="flex items-center gap-2 text-gray-600 text-[10px] font-black uppercase tracking-[0.3em]">
              Made with <Heart size={12} className="text-orange-500 fill-orange-500" /> by Engineers
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;