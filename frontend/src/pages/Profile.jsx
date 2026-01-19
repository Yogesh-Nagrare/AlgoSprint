import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, Mail, Shield, Calendar, Code, ChevronLeft, 
    ExternalLink, Camera, Loader2, Github, Linkedin, 
    Globe, Flame, Award, Info, Save, X, Edit3
} from 'lucide-react';
import axios from 'axios'; 
import axiosClient from '../utils/axiosClient';
import SolvedStats from '../components/SolvedStats';
import { updateUserProfilePic } from '../authSlice';

function Profile() {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [solvedProblems, setSolvedProblems] = useState([]);
    const [allProblems, setAllProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    
    // --- SOCIAL LINKS STATE (Logic: Load from LocalStorage) ---
    const [isEditing, setIsEditing] = useState(false);
    const [socials, setSocials] = useState(() => {
        // Check if links exist in browser storage first
        const savedLinks = localStorage.getItem('user_social_links');
        if (savedLinks) return JSON.parse(savedLinks);
        
        // Default to empty or user object
        return {
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

    const activityData = useMemo(() => {
        const today = new Date();
        const data = [];
        const solMap = {};
        solvedProblems.forEach(prob => {
            const dateKey = new Date(prob.updatedAt || new Date()).toDateString();
            solMap[dateKey] = (solMap[dateKey] || 0) + 1;
        });
        for (let i = 364; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateStr = d.toDateString();
            data.push({ date: dateStr, count: solMap[dateStr] || 0 });
        }
        return data;
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
            alert("Profile picture updated!");
        } catch (err) {
            alert("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    // --- SAVE SOCIAL LINKS LOGIC (Frontend Only) ---
    const handleSaveSocials = () => {
        setIsSaving(true);
        
        // Simulating a small delay for better UX feel
        setTimeout(() => {
            localStorage.setItem('user_social_links', JSON.stringify(socials));
            setIsSaving(false);
            setIsEditing(false);
            alert("Social links saved successfully in your browser!");
        }, 500);
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-200 pb-20 selection:bg-orange-500/30 font-sans">
            <div className="max-w-7xl mx-auto px-6 pt-10">
                <button onClick={() => navigate('/')} className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-white transition-all mb-10">
                    <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Problems
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* LEFT COLUMN */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1 space-y-6">
                        <div className="bg-[#111] rounded-[2.5rem] border border-white/5 p-10 relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[50px] rounded-full -mr-16 -mt-16"></div>
                            
                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="relative group cursor-pointer mb-6">
                                    <div className="w-24 h-24 rounded-full overflow-hidden bg-[#111] border-2 border-orange-500">
                                        {uploading ? (
                                            <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-orange-500" /></div>
                                        ) : (
                                            <img src={user?.profilePic || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=f97316&color=fff`} className="w-full h-full object-cover" alt="Profile" />
                                        )}
                                    </div>
                                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                                        <Camera size={20} className="text-white" />
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                    </label>
                                </div>

                                <h1 className="text-3xl font-black text-white tracking-tight mb-1">{user.firstName} {user.lastName}</h1>

                                {/* ICONS: These now use the state updated by localStorage */}
                                <div className="flex gap-3 mt-4 mb-6">
                                    <a href={socials.github || '#'} target="_blank" rel="noreferrer" className={`p-2 bg-white/5 rounded-xl transition-all border border-white/5 ${socials.github ? 'hover:bg-orange-500/20 hover:text-orange-500 border-orange-500/50' : 'opacity-20 cursor-default'}`} title="GitHub">
                                        <Github size={18} />
                                    </a>
                                    <a href={socials.linkedin || '#'} target="_blank" rel="noreferrer" className={`p-2 bg-white/5 rounded-xl transition-all border border-white/5 ${socials.linkedin ? 'hover:bg-blue-500/20 hover:text-blue-400 border-blue-500/50' : 'opacity-20 cursor-default'}`} title="LinkedIn">
                                        <Linkedin size={18} />
                                    </a>
                                    <a href={socials.portfolio || '#'} target="_blank" rel="noreferrer" className={`p-2 bg-white/5 rounded-xl transition-all border border-white/5 ${socials.portfolio ? 'hover:bg-emerald-500/20 hover:text-emerald-400 border-emerald-500/50' : 'opacity-20 cursor-default'}`} title="Portfolio">
                                        <Globe size={18} />
                                    </a>
                                </div>

                                <p className="text-orange-500 text-xs font-bold uppercase tracking-widest mb-8">{user.role} Member</p>

                                <div className="w-full space-y-4 text-left border-t border-white/5 pt-8">
                                    <AnimatePresence mode='wait'>
                                        {!isEditing ? (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key="display" className="space-y-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 bg-white/5 rounded-lg text-gray-400"><Mail size={16} /></div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] uppercase font-black text-gray-600 tracking-widest">Email</span>
                                                        <span className="text-sm font-medium text-gray-300">{user.emailId}</span>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => setIsEditing(true)}
                                                    className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                                                >
                                                    <Edit3 size={14} /> Edit Links
                                                </button>
                                            </motion.div>
                                        ) : (
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} key="edit" className="space-y-4">
                                                <div className="space-y-2 text-left">
                                                    <label className="text-[9px] font-black text-gray-500 uppercase ml-1">GitHub URL</label>
                                                    <input value={socials.github} onChange={(e) => setSocials({...socials, github: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2 text-xs focus:border-orange-500 outline-none" placeholder="https://github.com/..." />
                                                </div>
                                                <div className="space-y-2 text-left">
                                                    <label className="text-[9px] font-black text-gray-500 uppercase ml-1">LinkedIn URL</label>
                                                    <input value={socials.linkedin} onChange={(e) => setSocials({...socials, linkedin: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2 text-xs focus:border-orange-500 outline-none" placeholder="https://linkedin.com/in/..." />
                                                </div>
                                                <div className="space-y-2 text-left">
                                                    <label className="text-[9px] font-black text-gray-500 uppercase ml-1">Portfolio URL</label>
                                                    <input value={socials.portfolio} onChange={(e) => setSocials({...socials, portfolio: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2 text-xs focus:border-orange-500 outline-none" placeholder="https://..." />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={handleSaveSocials} disabled={isSaving} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all">
                                                        {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
                                                    </button>
                                                    <button onClick={() => setIsEditing(false)} className="bg-white/5 hover:bg-white/10 p-2 rounded-xl border border-white/10">
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* RIGHT COLUMN (Kept exactly as per your current UI) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Stats Dashboard */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111] rounded-[2.5rem] border border-white/5 p-10 shadow-2xl">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-500">
                                    <Code size={20} />
                                </div>
                                <h2 className="text-xl font-bold text-white tracking-tight">Solved Overview</h2>
                            </div>
                            <div className="flex flex-col xl:flex-row gap-10 items-start">
                                <div className="w-full xl:flex-1 min-w-0">
                                    <SolvedStats problems={allProblems} solvedProblems={solvedProblems} />
                                </div>
                                <div className="w-full xl:w-72 space-y-4 shrink-0">
                                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Points</p>
                                        <p className="text-3xl font-black text-white">{solvedProblems.length * 10} <span className="text-orange-500 text-sm italic">XP</span></p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Heatmap */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111] rounded-[2.5rem] border border-white/5 p-10 shadow-2xl">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <Calendar size={18} className="text-orange-500" />
                                    <h2 className="text-sm font-black text-white uppercase tracking-[0.2em]">Activity Grid</h2>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {activityData.map((day, idx) => (
                                    <div key={idx} title={`${day.date}: ${day.count} solved`} className={`w-3 h-3 rounded-sm transition-all duration-500 ${day.count === 0 ? 'bg-white/5' : day.count === 1 ? 'bg-orange-500/30' : 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]'}`}></div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Recent Activity */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#111] rounded-[2.5rem] border border-white/5 p-10">
                            <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-8">Recently Solved</h2>
                            <div className="space-y-4">
                                {loading ? (
                                    [1,2,3].map(i => <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse"></div>)
                                ) : solvedProblems.length > 0 ? (
                                    solvedProblems.slice(0, 5).map((prob) => (
                                        <div key={prob._id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all group cursor-pointer" onClick={() => navigate(`/problem/${prob._id}`)}>
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500"><Code size={18} /></div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-200">{prob.title}</h4>
                                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">{prob.difficulty}</span>
                                                </div>
                                            </div>
                                            <ExternalLink size={14} className="text-gray-700 group-hover:text-orange-500 transition-colors" />
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-500 text-sm py-10">No problems solved yet.</p>
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