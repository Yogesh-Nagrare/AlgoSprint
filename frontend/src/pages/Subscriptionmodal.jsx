import { useState } from 'react';
import { NavLink } from 'react-router';
import {
    Code2,
    Rocket,
    Zap,
    Lock,
    Clock,
    Star,
    CheckCircle2,
    Infinity,
    Brain,
    BarChart3,
    Shield,
    ChevronRight,
    Sparkles,
    Timer,
    GitBranch,
    Trophy,
    X
} from 'lucide-react';

const SubscriptionPage = () => {
    const [hoveredPlan, setHoveredPlan] = useState(null);
    const [email, setEmail] = useState('');
    const [notified, setNotified] = useState(false);

    const handleNotify = () => {
        if (email.trim()) {
            setNotified(true);
        }
    };

    const features = [
        { icon: <Infinity size={18} />, label: 'Unlimited Run Attempts', desc: 'Execute your code as many times as you need, no daily caps.' },
        { icon: <Zap size={18} />, label: 'Real Code Execution', desc: 'Actual judge evaluation — not AI static analysis.' },
        { icon: <Brain size={18} />, label: 'Advanced AI Hints', desc: 'Deep contextual hints, not just surface-level feedback.' },
        { icon: <BarChart3 size={18} />, label: 'Full Analytics', desc: 'Track your progress, weak areas, and improvement over time.' },
        { icon: <GitBranch size={18} />, label: 'All Problem Sets', desc: 'Access to premium-only problems and company-tagged sets.' },
        { icon: <Timer size={18} />, label: 'Priority Queue', desc: 'Faster judge execution, no waiting in shared queues.' },
        { icon: <Trophy size={18} />, label: 'Leaderboards', desc: 'Compete globally and track your ranking.' },
        { icon: <Shield size={18} />, label: 'Interview Mode', desc: 'Timed mock interviews with real company questions.' },
    ];

    const plans = [
        {
            id: 'monthly',
            label: 'Monthly',
            price: '₹299',
            period: '/month',
            tag: null,
            features: ['Unlimited runs & submits', 'Real execution engine', 'AI hints & review', 'All problems'],
        },
        {
            id: 'yearly',
            label: 'Annual',
            price: '₹199',
            period: '/month',
            tag: 'BEST VALUE · SAVE 33%',
            features: ['Everything in Monthly', 'Priority judge queue', 'Full analytics dashboard', 'Interview mode', 'Leaderboard access'],
        },
    ];

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-gray-200 font-sans overflow-x-hidden">
            
            {/* ── NAVBAR ── */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-[#1a1a1a] shadow-xl z-20 sticky top-0">
                <div className="flex items-center gap-3">
                    <NavLink to="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-all group">
                        <div className="p-1.5 rounded-md group-hover:bg-white/10">
                            <Code2 size={18} />
                        </div>
                        <span className="text-sm font-medium">Problems</span>
                    </NavLink>
                    <span className="text-gray-700">/</span>
                    <span className="font-semibold text-gray-100 tracking-tight">Upgrade</span>
                </div>

                <NavLink
                    to="/"
                    className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-all"
                >
                    <X size={14} />
                    Back to Problems
                </NavLink>
            </div>

            {/* ── COMING SOON HERO BANNER ── */}
            <div className="relative overflow-hidden border-b border-amber-500/20 bg-[#1a1610]">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent animate-pulse"></div>
                <div className="relative z-10 flex items-center justify-center gap-3 px-6 py-3">
                    <Clock size={14} className="text-amber-400 animate-pulse" />
                    <span className="text-[11px] font-black text-amber-400 uppercase tracking-[0.25em]">
                        Feature Under Development
                    </span>
                    <span className="text-amber-600 text-[11px]">·</span>
                    <span className="text-[11px] text-amber-200/70 font-medium italic">
                        Subscriptions are not yet available — but they're coming soon!
                    </span>
                </div>
            </div>

            {/* ── MAIN HERO ── */}
            <div className="relative flex flex-col items-center justify-center px-6 pt-20 pb-16 text-center overflow-hidden">
                {/* Glow orb */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none"></div>

                {/* Badge */}
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/25 mb-8">
                    <Sparkles size={13} className="text-orange-400" />
                    <span className="text-[11px] font-black text-orange-400 uppercase tracking-widest">Coming Soon</span>
                </div>

                <h1 className="text-5xl sm:text-6xl font-black text-white tracking-tighter mb-4 leading-none">
                    Unlock Your
                    <span className="block bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 bg-clip-text text-transparent">
                        Full Potential
                    </span>
                </h1>

                <p className="text-gray-400 text-base max-w-xl leading-relaxed mb-10">
                    We're building a premium tier that removes all limits and gives you the tools to truly master competitive programming. 
                    <span className="text-orange-400 font-semibold"> Sign up to be notified when we launch.</span>
                </p>

                {/* Email Notify CTA */}
                {!notified ? (
                    <div className="flex items-center gap-2 w-full max-w-md">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-orange-500/50 focus:bg-white/8 transition-all"
                        />
                        <button
                            onClick={handleNotify}
                            className="flex items-center gap-2 px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] active:scale-95 shrink-0"
                        >
                            <Rocket size={14} />
                            Notify Me
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 px-6 py-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl animate-in zoom-in-95 duration-300">
                        <CheckCircle2 size={16} className="text-emerald-400" />
                        <span className="text-sm text-emerald-300 font-medium">
                            You're on the list! We'll notify you at <span className="font-bold text-white">{email}</span>
                        </span>
                    </div>
                )}

                <p className="text-gray-600 text-xs mt-4">No spam. No credit card required. Just a heads-up when we're live.</p>
            </div>

            {/* ── PRICING CARDS ── */}
            <div className="px-6 pb-16 flex flex-col items-center">
                <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] mb-8 text-center">
                    Planned Pricing
                </h2>

                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            onMouseEnter={() => setHoveredPlan(plan.id)}
                            onMouseLeave={() => setHoveredPlan(null)}
                            className={`relative flex-1 rounded-2xl border overflow-hidden transition-all duration-300 ${
                                plan.id === 'yearly'
                                    ? 'border-orange-500/40 bg-gradient-to-b from-orange-500/8 to-[#1a1a1a]'
                                    : 'border-white/10 bg-[#1a1a1a]'
                            } ${hoveredPlan === plan.id ? 'scale-[1.02] shadow-[0_0_40px_rgba(249,115,22,0.15)]' : ''}`}
                        >
                            {/* Top gradient bar */}
                            {plan.id === 'yearly' && (
                                <div className="h-1 w-full bg-gradient-to-r from-orange-600 via-amber-400 to-orange-600"></div>
                            )}

                            {/* Tag */}
                            {plan.tag && (
                                <div className="absolute top-4 right-4 px-2 py-0.5 bg-orange-500 rounded-full text-[9px] font-black text-white uppercase tracking-widest">
                                    {plan.tag}
                                </div>
                            )}

                            <div className="p-6">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{plan.label}</p>
                                
                                <div className="flex items-end gap-1 mb-6">
                                    <span className="text-4xl font-black text-white">{plan.price}</span>
                                    <span className="text-gray-500 text-sm mb-1">{plan.period}</span>
                                </div>

                                {/* Disabled button */}
                                <button
                                    disabled
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold mb-6 cursor-not-allowed bg-white/5 text-gray-600 border border-white/5"
                                >
                                    <Lock size={13} />
                                    Not Available Yet
                                </button>

                                <ul className="space-y-2.5">
                                    {plan.features.map((f, i) => (
                                        <li key={i} className="flex items-center gap-2.5 text-xs text-gray-400">
                                            <CheckCircle2 size={13} className={plan.id === 'yearly' ? 'text-orange-500' : 'text-gray-600'} />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Coming soon notice under cards */}
                <div className="flex items-center gap-2.5 mt-6 px-5 py-3 bg-blue-500/5 border border-blue-500/15 rounded-xl max-w-2xl w-full">
                    <Zap size={14} className="text-blue-400 shrink-0" />
                    <p className="text-[11px] text-blue-300/80 leading-relaxed">
                        <span className="font-bold text-blue-300">Subscriptions are not yet enabled.</span> The plans above are for planning purposes only. 
                        All payments and premium features will be activated when we officially launch.
                    </p>
                </div>
            </div>

            {/* ── FEATURES GRID ── */}
            <div className="px-6 pb-20 flex flex-col items-center">
                <div className="w-full max-w-3xl">
                    <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] mb-2 text-center">
                        What's Being Built
                    </h2>
                    <p className="text-center text-gray-600 text-xs mb-10">Features actively in development for the premium tier</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {features.map((f, i) => (
                            <div
                                key={i}
                                className="group flex items-start gap-4 p-4 rounded-xl bg-[#1a1a1a] border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all duration-200"
                            >
                                <div className="w-9 h-9 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shrink-0 group-hover:bg-orange-500/20 transition-colors">
                                    {f.icon}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-200 mb-0.5">{f.label}</p>
                                    <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                                </div>
                                <div className="ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight size={14} className="text-orange-500" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── BOTTOM CTA ── */}
            <div className="px-6 pb-16 flex justify-center">
                <div className="relative w-full max-w-3xl rounded-2xl overflow-hidden border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-[#1a1a1a] to-amber-500/5">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/5 to-transparent animate-pulse pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 p-8">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Star size={14} className="text-amber-400" />
                                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Early Access</span>
                            </div>
                            <h3 className="text-xl font-black text-white mb-1">Be First in Line</h3>
                            <p className="text-gray-400 text-sm">Join the waitlist and get 30% off your first month when we launch.</p>
                        </div>
                        <NavLink
                            to="/"
                            className="flex items-center gap-2 px-6 py-3 bg-[#252525] hover:bg-[#333] border border-white/10 text-white text-sm font-bold rounded-xl transition-all whitespace-nowrap shrink-0"
                        >
                            <Code2 size={14} className="text-orange-500" />
                            Back to Practice
                        </NavLink>
                    </div>
                </div>
            </div>

            {/* Footer note */}
            <div className="text-center pb-8 text-[11px] text-gray-700">
                This platform is currently in active development · Pricing and features are subject to change
            </div>
        </div>
    );
};

export default SubscriptionPage;