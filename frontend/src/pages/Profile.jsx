import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, Code, ChevronLeft, ExternalLink, Camera, Loader2,
    Github, Linkedin, Globe, Save, X, Edit3, Zap, Trophy,
    TrendingUp, Target, Flame
} from 'lucide-react';
import axios from 'axios';
import axiosClient from '../utils/axiosClient';
import { updateUserProfilePic } from '../authSlice';
import SolvedStats from '../components/SolvedStats'; // <--- Restored Import

// --- Badge Configuration ---
const BADGES = [
    { id: 1, name: "Novice Coder", threshold: 1, color: "text-emerald-400", bg: "bg-emerald-400/10", icon: Code },
    { id: 2, name: "Streak Master", threshold: 10, color: "text-orange-400", bg: "bg-orange-400/10", icon: Flame },
    { id: 3, name: "Problem Slayer", threshold: 50, color: "text-purple-400", bg: "bg-purple-400/10", icon: Zap },
    { id: 4, name: "Algorithm God", threshold: 100, color: "text-yellow-400", bg: "bg-yellow-400/10", icon: Trophy },
];

function Profile() {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [solvedProblems, setSolvedProblems] = useState([]);
    const [allProblems, setAllProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Socials State
    const [isEditing, setIsEditing] = useState(false);
    const [socials, setSocials] = useState(() => {
        const savedLinks = localStorage.getItem('user_social_links');
        return savedLinks ? JSON.parse(savedLinks) : {
            github: user?.github || '',
            linkedin: user?.linkedin || '',
            portfolio: user?.portfolio || ''
        };
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const [solvedRes, allRes] = await Promise.all([
                    axiosClient.get('/problem/problemSolvedByUser'),
                    axiosClient.get('/problem/getAllProblem')
                ]);
                setSolvedProblems(solvedRes.data);
                setAllProblems(allRes.data);
            } catch (error) {
                console.error("Error fetching profile data", error);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchProfileData();
    }, [user]);

    // --- HEATMAP LOGIC (Fixed for CSS Grid) ---
    const heatmapData = useMemo(() => {
        const today = new Date();
        const data = [];
        const solMap = {};
        
        solvedProblems.forEach(prob => {
            const dateKey = new Date(prob.updatedAt).toDateString();
            solMap[dateKey] = (solMap[dateKey] || 0) + 1;
        });

        // Generate 365 days backwards from today
        const startDate = new Date();
        startDate.setDate(today.getDate() - 364); 

        for (let i = 0; i < 365; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            const dateStr = d.toDateString();
            data.push({
                date: dateStr,
                count: solMap[dateStr] || 0
            });
        }
        return data;
    }, [solvedProblems]);

    // --- STREAK LOGIC ---
    const streakStats = useMemo(() => {
        if (!solvedProblems.length) return { current: 0 };
        const uniqueDates = [...new Set(solvedProblems.map(p => new Date(p.updatedAt).toDateString()))]
            .map(d => new Date(d)).sort((a, b) => b - a);
        
        let current = 0;
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        const lastSolve = uniqueDates[0];
        if (lastSolve.toDateString() === today.toDateString() || lastSolve.toDateString() === yesterday.toDateString()) {
            current = 1;
            for (let i = 0; i < uniqueDates.length - 1; i++) {
                const diffTime = Math.abs(uniqueDates[i] - uniqueDates[i + 1]);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                if (diffDays === 1) current++;
                else break;
            }
        }
        return { current };
    }, [solvedProblems]);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            setUploading(true);
            const sigRes = await axiosClient.get('/user/avatar-signature');
            const { signature, timestamp, public_id, api_key, upload_url } = sigRes.data;
            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', api_key);
            formData.append('timestamp', timestamp);
            formData.append('signature', signature);
            formData.append('public_id', public_id);
            const uploadRes = await axios.post(upload_url, formData);
            const saveRes = await axiosClient.post('/user/update-avatar', {
                cloudinaryPublicId: uploadRes.data.public_id,
                secureUrl: uploadRes.data.secure_url,
            });
            dispatch(updateUserProfilePic(saveRes.data.profilePic));
        } catch (err) {
            alert("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleSaveSocials = () => {
        setIsSaving(true);
        setTimeout(() => {
            localStorage.setItem('user_social_links', JSON.stringify(socials));
            setIsSaving(false);
            setIsEditing(false);
        }, 500);
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-200 pb-20 font-sans selection:bg-orange-500/30">
            <div className="max-w-7xl mx-auto px-6 pt-10">
                <button onClick={() => navigate('/')} className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-white transition-all mb-10">
                    <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Problems
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    {/* LEFT COLUMN: User Info & Badges */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1 space-y-6">
                        <div className="bg-[#111] rounded-[2.5rem] border border-white/5 p-10 relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/10 blur-[60px] rounded-full -mr-10 -mt-10"></div>
                            
                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="relative group cursor-pointer mb-6">
                                    <div className="w-28 h-28 rounded-full overflow-hidden bg-[#111] border-4 border-[#1a1a1a] shadow-xl">
                                        {uploading ? (
                                            <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-orange-500" /></div>
                                        ) : (
                                            <img src={user?.profilePic || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=f97316&color=fff`} className="w-full h-full object-cover" alt="Profile" />
                                        )}
                                    </div>
                                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                                        <Camera size={24} className="text-white" />
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                    </label>
                                </div>

                                <h1 className="text-3xl font-black text-white tracking-tight mb-1">{user.firstName} {user.lastName}</h1>
                                <p className="text-orange-500 text-xs font-bold uppercase tracking-widest mb-6">{user.role || 'Coder'}</p>

                                <div className="flex gap-3 mb-8">
                                    {[
                                        { link: socials.github, icon: Github, color: "hover:text-white" },
                                        { link: socials.linkedin, icon: Linkedin, color: "hover:text-blue-400" },
                                        { link: socials.portfolio, icon: Globe, color: "hover:text-emerald-400" }
                                    ].map((social, idx) => (
                                        <a key={idx} href={social.link || '#'} target="_blank" rel="noreferrer" 
                                           className={`p-3 bg-white/5 rounded-2xl transition-all border border-white/5 ${social.link ? `${social.color} hover:bg-white/10 hover:-translate-y-1` : 'opacity-20 cursor-default pointer-events-none'}`}>
                                            <social.icon size={18} />
                                        </a>
                                    ))}
                                </div>

                                <div className="w-full space-y-4 text-left border-t border-white/5 pt-8">
                                    <AnimatePresence mode='wait'>
                                        {!isEditing ? (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key="display" className="space-y-5">
                                                <div className="flex items-center gap-4 group">
                                                    <div className="p-2.5 bg-white/5 rounded-xl text-gray-400 group-hover:text-orange-500 transition-colors"><Mail size={18} /></div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] uppercase font-black text-gray-600 tracking-widest">Email Address</span>
                                                        <span className="text-sm font-bold text-gray-300">{user.emailId}</span>
                                                    </div>
                                                </div>
                                                <button onClick={() => setIsEditing(true)} className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                                                    <Edit3 size={14} /> Edit Socials
                                                </button>
                                            </motion.div>
                                        ) : (
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} key="edit" className="space-y-4">
                                                {['github', 'linkedin', 'portfolio'].map((field) => (
                                                    <div key={field} className="space-y-1">
                                                        <label className="text-[9px] font-black text-gray-500 uppercase ml-1">{field}</label>
                                                        <input value={socials[field]} onChange={(e) => setSocials({...socials, [field]: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:border-orange-500 outline-none" placeholder={`Your ${field} URL`} />
                                                    </div>
                                                ))}
                                                <div className="flex gap-2 pt-2">
                                                    <button onClick={handleSaveSocials} disabled={isSaving} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all">
                                                        {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
                                                    </button>
                                                    <button onClick={() => setIsEditing(false)} className="bg-white/5 hover:bg-white/10 px-4 rounded-xl border border-white/10">
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>

                        {/* Badges Section */}
                        <div className="bg-[#111] rounded-[2.5rem] border border-white/5 p-8">
                            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2"><Trophy size={14} /> Achievements</h3>
                            <div className="grid grid-cols-4 gap-2">
                                {BADGES.map((badge) => {
                                    const isUnlocked = solvedProblems.length >= badge.threshold;
                                    return (
                                        <div key={badge.id} className="relative group flex flex-col items-center justify-center">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${isUnlocked ? `${badge.bg} ${badge.color} border-${badge.color.split('-')[1]}-500/30` : 'bg-white/5 border-white/5 text-gray-700 grayscale'}`}>
                                                <badge.icon size={20} />
                                            </div>
                                            <div className="absolute bottom-14 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black text-[10px] font-bold py-1 px-3 rounded-lg whitespace-nowrap pointer-events-none">
                                                {badge.name}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </motion.div>

                    {/* RIGHT COLUMN: Stats & Heatmap */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* Top Stats Cards */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Streak Counter */}
                            <div className="bg-[#111] p-6 rounded-[2rem] border border-white/5 relative overflow-hidden group">
                                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-orange-500/20 blur-[40px] rounded-full group-hover:bg-orange-500/30 transition-all"></div>
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Current Streak</p>
                                    <Flame size={14} className={streakStats.current > 0 ? "text-orange-500 animate-pulse" : "text-gray-700"} />
                                </div>
                                <h3 className="text-4xl font-black text-white">{streakStats.current} <span className="text-lg text-gray-600 font-bold">Days</span></h3>
                            </div>

                            {/* Total XP */}
                            <div className="bg-[#111] p-6 rounded-[2rem] border border-white/5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10"><Target size={80} /></div>
                                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Total XP</p>
                                <h3 className="text-4xl font-black text-white">{solvedProblems.length * 10} <span className="text-orange-500 text-sm">XP</span></h3>
                            </div>
                        </motion.div>

                        {/* Combined Heatmap + SolvedStats Container */}
                        {/* Combined Heatmap + SolvedStats Container */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ delay: 0.1 }} 
                            className="bg-[#111] rounded-[2.5rem] border border-white/5 p-10 shadow-2xl"
                        >
                            {/* CHANGED: Removed 'xl:flex-row' to force vertical stacking. Reduced gap slightly. */}
                            <div className="flex flex-col gap-10">
                                
                                {/* 1. The Heatmap (Top) */}
                                <div className="w-full overflow-hidden">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                                            <TrendingUp size={16} className="text-orange-500" /> Activity Log
                                        </h2>
                                        <span className="text-[10px] font-bold text-gray-600 bg-white/5 px-2 py-1 rounded-md">Last 365 Days</span>
                                    </div>
                                    <div className="overflow-x-auto pb-2 no-scrollbar">
                                        <div className="grid gap-1" style={{
                                            gridTemplateRows: 'repeat(7, 10px)', 
                                            gridAutoFlow: 'column',
                                            height: 'max-content',
                                            width: 'max-content'
                                        }}>
                                            {heatmapData.map((day, idx) => (
                                                <div 
                                                    key={idx} 
                                                    title={`${day.date}: ${day.count} solved`}
                                                    className={`w-[10px] h-[10px] rounded-[2px] transition-all hover:scale-125 ${
                                                        day.count === 0 ? 'bg-[#1a1a1a]' : 
                                                        day.count === 1 ? 'bg-orange-500/40' : 
                                                        day.count < 4 ? 'bg-orange-500/70' : 
                                                        'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]'
                                                    }`}
                                                ></div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* 2. SolvedStats Component (Bottom) */}
                                {/* CHANGED: 
                                    - Removed 'xl:w-72' (width restriction) 
                                    - Removed 'border-l' (vertical line)
                                    - Added 'border-t' (horizontal line) to separate them vertically 
                                    - Added 'items-start' or 'items-center' based on preference
                                */}
                                <div className="w-full border-t border-white/5 pt-8 flex flex-col justify-center">
                                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6">Statistics</h4>
                                    
                                    {/* You can wrap SolvedStats in a div to control its width/centering if needed */}
                                    <div className="w-full">
                                        <SolvedStats problems={allProblems} solvedProblems={solvedProblems} />
                                    </div>
                                </div>

                            </div>
                        </motion.div>

                        {/* Recent Activity */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#111] rounded-[2.5rem] border border-white/5 p-10">
                            <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-8">Recently Solved</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {loading ? (
                                    [1,2,3,4].map(i => <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse"></div>)
                                ) : solvedProblems.length > 0 ? (
                                    solvedProblems.slice(0, 6).map((prob) => (
                                        <div key={prob._id} onClick={() => navigate(`/problem/${prob._id}`)} className="group flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-orange-500/30 transition-all cursor-pointer">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                                                    prob.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-500' :
                                                    prob.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' :
                                                    'bg-red-500/10 text-red-500'
                                                }`}>
                                                    <Code size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-200 group-hover:text-orange-500 transition-colors line-clamp-1">{prob.title}</h4>
                                                    <span className={`text-[10px] font-black uppercase tracking-wider ${
                                                        prob.difficulty === 'Easy' ? 'text-emerald-500' :
                                                        prob.difficulty === 'Medium' ? 'text-yellow-500' :
                                                        'text-red-500'
                                                    }`}>{prob.difficulty}</span>
                                                </div>
                                            </div>
                                            <ExternalLink size={14} className="text-gray-700 group-hover:text-white transition-colors" />
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-2 text-center py-10">
                                        <p className="text-gray-500 text-sm">No problems solved yet.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;