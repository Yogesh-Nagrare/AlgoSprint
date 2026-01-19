import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { 
  ChevronDown, ChevronRight, PlayCircle, FileText, 
  Star, PlusCircle, Search, Filter, CheckCircle2,
  ArrowLeft, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosClient from '../utils/axiosClient';

// Platform Logo Component with clickable link
const PlatformLink = ({ platform, link }) => {
  const logos = {
    leetcode: {
      bg: 'bg-[#000000]',
      img: 'https://miro.medium.com/max/2400/1*IC0JXUE3UEAfDfQnFyGtGA.jpeg'
    },
    gfg: {
      bg: 'bg-[#ffffff]',
      img: 'https://repository-images.githubusercontent.com/594709571/9a22d4cd-9ac8-48c4-9548-29c9f43f65fb'
    },
    interviewbit: {
      bg: 'bg-[#1C3A5F]',
      text: 'IB'
    },
    codechef: {
      bg: 'bg-[#5B4638]',
      text: 'CC'
    },
    codeforces: {
      bg: 'bg-[#1F8ACB]',
      text: 'CF'
    }
  };

  const config = logos[platform.toLowerCase()] || { bg: 'bg-gray-600', text: '?' };

  if (!link) return null;

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={`w-10 h-10 ${config.bg} rounded flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-pointer overflow-hidden`}
      onClick={(e) => e.stopPropagation()}
      title={`Open on ${platform}`}
    >
      {config.img ? (
        <img src={config.img} alt={platform} className="w-full h-full object-cover" />
      ) : (
        <span className="text-[8px] font-black text-white">{config.text}</span>
      )}
    </a>
  );
};

const TopicSheet = () => {
  const { sheetId } = useParams();
  const navigate = useNavigate();
  
  const [topics, setTopics] = useState([]);
  const [sheetInfo, setSheetInfo] = useState({ title: '', progress: 0, total: 0, solved: 0 });
  const [loading, setLoading] = useState(true);
  const [expandedTopics, setExpandedTopics] = useState([]);
  const [expandedSubTopics, setExpandedSubTopics] = useState([]);

  useEffect(() => {
    fetchSheetData();
  }, [sheetId]);

  const fetchSheetData = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get(`/problem/sheets/getById/${sheetId}`);
      
      console.log('Full Response:', response.data);
      
      setTopics(response.data.topics || []);
      setSheetInfo({
        title: response.data.title,
        solved: response.data.solvedCount || 0,
        total: response.data.totalProblems || 0,
        progress: Math.round((response.data.solvedCount / response.data.totalProblems) * 100) || 0,
      });
      
      if (response.data.topics?.length > 0) {
        setExpandedTopics([response.data.topics[0]._id]);
      }
    } catch (error) {
      console.error("Error fetching sheet:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTopic = (id) => {
    setExpandedTopics(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSubTopic = (id) => {
    setExpandedSubTopics(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

const handleProblemClick = (problem) => {
    if (problem.type === 'external') {
        window.open(problem.link, '_blank', 'noopener,noreferrer');
    } else {
        navigate(`/problem/${problem.globalProblemId}`); 
    }
};

  const toggleSolved = async (e, problem) => {
    e.stopPropagation();
    
    try {
      if (problem.isSolved) {
        await axiosClient.post('/problem/sheets/unmark-solved', { problemId: problem._id });
      } else {
        await axiosClient.post('/problem/sheets/mark-solved', { problemId: problem._id });
      }
      
      fetchSheetData();
    } catch (error) {
      console.error('Error toggling solved status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070707]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
          <p className="text-gray-500 font-black text-xs uppercase tracking-widest">Loading Sheet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070707] text-gray-200 p-4 md:p-10 font-sans selection:bg-orange-500/30">
      <div className="max-w-6xl mx-auto">
        
        {/* Top Navigation */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <button 
            onClick={() => navigate('/')}
            className="p-2 hover:bg-white/5 rounded-xl border border-white/5 transition-all text-gray-400 hover:text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter">
            {sheetInfo.title}
          </h1>
          
          <div className="flex items-center gap-2 ml-auto">
            <div className="flex bg-[#1a1a1a] p-1 rounded-xl border border-white/5">
              <button className="px-4 py-1.5 bg-[#252525] rounded-lg text-[10px] font-black uppercase text-white shadow-xl">All Problems</button>
              <button className="px-4 py-1.5 text-[10px] font-black uppercase text-gray-500 hover:text-white transition-all">Revision</button>
            </div>
            <button className="p-2.5 bg-[#1a1a1a] border border-white/5 rounded-xl text-gray-500 hover:text-white"><Search size={16} /></button>
            <button className="p-2.5 bg-[#1a1a1a] border border-white/5 rounded-xl text-gray-500 hover:text-white"><Filter size={16} /></button>
          </div>
        </div>

        {/* Progress Stats Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#16110e] border border-orange-900/20 rounded-[32px] p-6 md:p-8 mb-10 flex flex-col md:flex-row items-center gap-10 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-32 h-32 bg-orange-500/5 blur-[50px] pointer-events-none" />

          <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
             <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                <motion.circle 
                  initial={{ strokeDashoffset: 264 }}
                  animate={{ strokeDashoffset: 264 - (264 * sheetInfo.progress) / 100 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" 
                  strokeDasharray={264} className="text-orange-500" strokeLinecap="round" 
                />
             </svg>
             <span className="absolute text-xl font-black italic text-white">{sheetInfo.progress}%</span>
          </div>

          <div className="text-center md:text-left">
             <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">Overall Progress</h3>
             <p className="text-4xl font-black text-white tabular-nums tracking-tighter">
               {sheetInfo.solved} <span className="text-gray-600 text-lg">/ {sheetInfo.total}</span>
             </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 ml-auto">
            {(() => {
              const stats = { easy: { solved: 0, total: 0 }, medium: { solved: 0, total: 0 }, hard: { solved: 0, total: 0 } };
              
              topics.forEach(topic => {
                topic.subtopics?.forEach(sub => {
                  sub.problems?.forEach(prob => {
                    const diff = prob.difficulty?.toLowerCase();
                    if (stats[diff]) {
                      stats[diff].total++;
                      if (prob.isSolved) stats[diff].solved++;
                    }
                  });
                });
              });

              return [
                { label: 'Easy', color: 'bg-emerald-500', ...stats.easy },
                { label: 'Medium', color: 'bg-orange-500', ...stats.medium },
                { label: 'Hard', color: 'bg-red-500', ...stats.hard },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center md:items-start gap-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${stat.color} shadow-[0_0_8px_rgba(0,0,0,0.5)]`} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{stat.label}</span>
                  </div>
                  <p className="text-sm font-bold text-white tracking-tight">
                    {stat.solved}<span className="text-gray-600">/{stat.total}</span>
                  </p>
                </div>
              ));
            })()}
          </div>
        </motion.div>

        {/* Topics Accordion */}
        <div className="space-y-3">
          {topics.map((topic) => (
            <div key={topic._id} className="bg-[#0f0f0f]/50 rounded-[24px] border border-white/5 overflow-hidden transition-all hover:border-white/10">
              <button 
                onClick={() => toggleTopic(topic._id)}
                className="w-full flex items-center justify-between p-5 md:p-6 group"
              >
                <div className="flex items-center gap-4">
                  <div className={`transition-transform duration-300 ${expandedTopics.includes(topic._id) ? 'rotate-180 text-orange-500' : 'text-gray-600'}`}>
                    <ChevronDown size={22} />
                  </div>
                  <span className={`text-base md:text-lg font-bold tracking-tight text-left transition-colors ${expandedTopics.includes(topic._id) ? 'text-orange-500' : 'text-gray-300'}`}>
                    {topic.title}
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden hidden sm:block">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(topic.solvedCount / topic.totalCount) * 100}%` }}
                        className="h-full bg-orange-600 shadow-[0_0_10px_rgba(234,88,12,0.3)]" 
                      />
                  </div>
                  <span className="text-xs font-black text-gray-500 tabular-nums">{topic.solvedCount}/{topic.totalCount}</span>
                </div>
              </button>

              <AnimatePresence>
                {expandedTopics.includes(topic._id) && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-black/20"
                  >
                    <div className="p-2 pt-0 space-y-2">
                      {topic.subtopics?.map(sub => (
                        <div key={sub._id} className="mx-2 md:mx-4">
                          <button 
                            onClick={() => toggleSubTopic(sub._id)}
                            className={`w-full flex items-center justify-between py-3.5 px-5 rounded-2xl transition-all border ${expandedSubTopics.includes(sub._id) ? 'bg-white/5 border-white/10 shadow-inner' : 'bg-transparent border-transparent hover:bg-white/[0.02]'}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`transition-colors ${expandedSubTopics.includes(sub._id) ? 'text-white' : 'text-gray-600'}`}>
                                {expandedSubTopics.includes(sub._id) ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                              </div>
                              <span className={`text-sm font-bold ${expandedSubTopics.includes(sub._id) ? 'text-white' : 'text-gray-400'}`}>{sub.title}</span>
                            </div>
                            <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden hidden sm:block">
                               <div className="h-full bg-orange-500/40" style={{ width: `${(sub.solvedCount/sub.totalCount)*100}%` }} />
                            </div>
                          </button>

                          <AnimatePresence>
                            {expandedSubTopics.includes(sub._id) && (
                              <motion.div 
                                initial={{ height: 0 }} 
                                animate={{ height: 'auto' }} 
                                exit={{ height: 0 }} 
                                className="overflow-x-auto px-4 pb-6"
                              >
                                <table className="w-full mt-4 text-left">
                                  <thead>
                                    <tr className="text-[10px] font-black uppercase text-gray-600 tracking-[0.2em] border-b border-white/5">
                                      <th className="pb-4 px-4 w-16">Status</th>
                                      <th className="pb-4 px-4">Problem Name</th>
                                      <th className="pb-4 px-4 text-center">Difficulty</th>
                                      <th className="pb-4 px-4 text-center">Platforms</th>
                                      <th className="pb-4 px-4 text-center">Resource</th>
                                      <th className="pb-4 px-4 text-center">Notes</th>
                                      <th className="pb-4 px-4 text-center">Revise</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-white/[0.03]">
                                    {sub.problems?.map(prob => (
                                      <tr key={prob._id} className="group hover:bg-white/[0.01] transition-all">
                                        <td className="py-4 px-4">
                                          <div 
                                            onClick={(e) => toggleSolved(e, prob)}
                                            className={`w-5 h-5 rounded flex items-center justify-center cursor-pointer transition-all ${
                                              prob.isSolved 
                                                ? 'bg-orange-500 text-black' 
                                                : 'border border-white/10 group-hover:border-white/30'
                                            }`}
                                          >
                                            {prob.isSolved && <CheckCircle2 size={14} strokeWidth={3} />}
                                          </div>
                                        </td>
                                        <td className="py-4 px-4">
                                          <div className="flex items-center gap-2">
                                            <span 
                                              className="text-sm font-bold text-gray-300 group-hover:text-orange-500 transition-colors cursor-pointer"
                                              onClick={() => handleProblemClick(prob)}
                                            >
                                              {prob.title}
                                            </span>
                                            {prob.type === 'internal' && (
                                              <div className="w-5 h-5 bg-gradient-to-br from-orange-500 to-orange-600 rounded flex items-center justify-center shadow-md">
                                                <span className="text-[8px] font-black text-white">AS</span>
                                              </div>
                                            )}
                                          </div>
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                                            prob.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                            prob.difficulty === 'Medium' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                                            'bg-red-500/10 text-red-500 border border-red-500/20'
                                          }`}>
                                            {prob.difficulty}
                                          </span>
                                        </td>
                                        <td className="py-4 px-4">
                                          <div className="flex items-center justify-center gap-2">
                                            {prob.type === 'external' ? (
                                              <PlatformLink platform={prob.platform} link={prob.link} />
                                            ) : (
                                              <>
                                                {prob.externalLinks?.leetcode && <PlatformLink platform="leetcode" link={prob.externalLinks.leetcode} />}
                                                {prob.externalLinks?.gfg && <PlatformLink platform="gfg" link={prob.externalLinks.gfg} />}
                                                {prob.externalLinks?.interviewbit && <PlatformLink platform="interviewbit" link={prob.externalLinks.interviewbit} />}
                                                {!prob.externalLinks?.leetcode && !prob.externalLinks?.gfg && !prob.externalLinks?.interviewbit && (
                                                  <span className="text-gray-700 text-xs">---</span>
                                                )}
                                              </>
                                            )}
                                          </div>
                                        </td>
                                        <td className="py-4 px-4">
                                          <div className="flex items-center justify-center gap-3">
                                            <PlayCircle size={18} className="text-red-500/70 hover:text-red-500 cursor-pointer transition-colors" />
                                            <FileText size={18} className="text-blue-500/70 hover:text-blue-500 cursor-pointer transition-colors" />
                                          </div>
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                          <PlusCircle size={18} className="text-gray-700 hover:text-gray-400 cursor-pointer inline-block transition-colors" />
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                          <Star size={18} className="text-gray-700 hover:text-yellow-500 cursor-pointer inline-block transition-colors" />
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopicSheet;