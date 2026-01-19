import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Trash2, ArrowLeft, Save, ChevronDown, ChevronRight, Globe, Search, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosClient from '../utils/axiosClient';

function AdminSheet() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [allProblems, setAllProblems] = useState([]);
  const [expandedTopics, setExpandedTopics] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [sheetData, setSheetData] = useState({
    title: '',
    slug: '',
    description: '',
    topics: []
  });

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await axiosClient.get('/problem/getAllProblem');
        setAllProblems(response.data);
      } catch (error) {
        console.error('Error fetching problems:', error);
      }
    };
    fetchProblems();
  }, []);

  const addTopic = () => {
    setSheetData({
      ...sheetData,
      topics: [...sheetData.topics, { title: '', subtopics: [] }]
    });
    setExpandedTopics([...expandedTopics, sheetData.topics.length]);
  };

  const addSubtopic = (topicIndex) => {
    const newTopics = [...sheetData.topics];
    newTopics[topicIndex].subtopics.push({ title: '', problems: [] });
    setSheetData({ ...sheetData, topics: newTopics });
  };

  // Improved Problem Toggling for Internal Problems
  const toggleInternalProblem = (topicIndex, subtopicIndex, problemId) => {
    const newTopics = [...sheetData.topics];
    const problems = newTopics[topicIndex].subtopics[subtopicIndex].problems;
    
    const existingIndex = problems.findIndex(p => p.type === 'internal' && p.problemId === problemId);
    
    if (existingIndex > -1) {
      problems.splice(existingIndex, 1);
    } else {
      problems.push({
        type: 'internal',
        problemId: problemId,
        leetcodeLink: '',
        gfgLink: '',
        interviewbitLink: ''
      });
    }
    
    setSheetData({ ...sheetData, topics: newTopics });
  };

  // Update specific fields for internal or external problems
  const updateProblemField = (topicIdx, subIdx, probIdx, field, value) => {
    const newTopics = [...sheetData.topics];
    newTopics[topicIdx].subtopics[subIdx].problems[probIdx][field] = value;
    setSheetData({ ...sheetData, topics: newTopics });
  };

  const addExternalProblem = (topicIndex, subtopicIndex) => {
    const newTopics = [...sheetData.topics];
    newTopics[topicIndex].subtopics[subtopicIndex].problems.push({
      type: 'external',
      title: '',
      link: '',
      difficulty: 'Easy',
      platform: 'leetcode'
    });
    setSheetData({ ...sheetData, topics: newTopics });
  };

  const generateSlug = (title) => {
    return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  const handleSubmit = async () => {
    if (!sheetData.title || sheetData.topics.length === 0) {
      alert('Please provide a title and at least one topic');
      return;
    }
    setLoading(true);
    try {
      await axiosClient.post('/problem/sheet/create', sheetData);
      alert('Sheet created successfully!');
      navigate('/admin');
    } catch (error) {
      alert('Failed to create sheet: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredProblems = allProblems.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#070707] text-gray-200 p-4 md:p-10">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/admin')} className="p-2 hover:bg-white/5 rounded-xl border border-white/5 transition-all text-gray-400 hover:text-white">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-black text-white tracking-tight">Create DSA Sheet</h1>
        </div>

        {/* Sheet Info */}
        <div className="bg-[#111] border border-white/5 rounded-2xl p-8 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Sheet Title</label>
              <input
                type="text"
                value={sheetData.title}
                onChange={(e) => setSheetData({...sheetData, title: e.target.value, slug: generateSlug(e.target.value)})}
                placeholder="e.g., Striver SDE Sheet"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Slug</label>
              <input type="text" value={sheetData.slug} readOnly className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-gray-500 font-mono" />
            </div>
          </div>
        </div>

        {/* Topics Accordion */}
        <div className="space-y-4">
          {sheetData.topics.map((topic, tIdx) => (
            <div key={tIdx} className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/5 flex items-center gap-4">
                <button onClick={() => setExpandedTopics(prev => prev.includes(tIdx) ? prev.filter(i => i !== tIdx) : [...prev, tIdx])}>
                   {expandedTopics.includes(tIdx) ? <ChevronDown /> : <ChevronRight />}
                </button>
                <input 
                  className="bg-transparent border-b border-white/10 outline-none flex-1 font-bold text-orange-500" 
                  value={topic.title} 
                  onChange={(e) => {
                    const nt = [...sheetData.topics];
                    nt[tIdx].title = e.target.value;
                    setSheetData({...sheetData, topics: nt});
                  }}
                  placeholder="Topic Title (e.g. Arrays)"
                />
                <button onClick={() => addSubtopic(tIdx)} className="text-[10px] font-black uppercase bg-blue-500/10 text-blue-500 px-3 py-1 rounded-lg">Add Subtopic</button>
                <button onClick={() => {
                   const nt = sheetData.topics.filter((_, i) => i !== tIdx);
                   setSheetData({...sheetData, topics: nt});
                }} className="text-red-500"><Trash2 size={18}/></button>
              </div>

              <AnimatePresence>
                {expandedTopics.includes(tIdx) && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden bg-black/20 p-6 space-y-6">
                    {topic.subtopics.map((sub, sIdx) => (
                      <div key={sIdx} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                        <div className="flex items-center gap-4 mb-6">
                           <input 
                            className="bg-transparent text-lg font-bold outline-none flex-1 border-b border-white/5" 
                            value={sub.title} 
                            onChange={(e) => {
                              const nt = [...sheetData.topics];
                              nt[tIdx].subtopics[sIdx].title = e.target.value;
                              setSheetData({...sheetData, topics: nt});
                            }}
                            placeholder="Subtopic Title"
                           />
                           <button onClick={() => {
                             const nt = [...sheetData.topics];
                             nt[tIdx].subtopics.splice(sIdx, 1);
                             setSheetData({...sheetData, topics: nt});
                           }} className="text-gray-500"><Trash2 size={18}/></button>
                        </div>

                        {/* Internal Problems Search/Picker */}
                        <div className="mb-8">
                          <div className="flex items-center justify-between mb-3 px-2">
                             <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Pick Global Problems</h4>
                             <div className="relative w-48">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={12} />
                                <input 
                                  type="text" placeholder="Filter DB..." 
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                  className="w-full bg-black border border-white/5 rounded-full py-1.5 pl-8 pr-4 text-[10px] outline-none"
                                />
                             </div>
                          </div>
                          <div className="max-h-56 overflow-y-auto bg-black/40 rounded-2xl border border-white/5 p-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                              {filteredProblems.map(p => {
                                const isSelected = sub.problems.some(sp => sp.type === 'internal' && sp.problemId === p._id);
                                return (
                                  <div 
                                    key={p._id} 
                                    onClick={() => toggleInternalProblem(tIdx, sIdx, p._id)}
                                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${isSelected ? 'bg-orange-500/10 border border-orange-500/20' : 'hover:bg-white/5 border border-transparent'}`}
                                  >
                                    <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${isSelected ? 'bg-orange-500 border-orange-500' : 'border-white/10'}`}>
                                      {isSelected && <CheckCircle2 size={10} className="text-black" strokeWidth={4} />}
                                    </div>
                                    <span className="text-xs font-bold">{p.title}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Configuration Area for Added Problems */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between px-2">
                             <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Configured List</h4>
                             <button onClick={() => addExternalProblem(tIdx, sIdx)} className="flex items-center gap-1 text-[10px] font-black text-blue-500 uppercase"><Plus size={12}/> Add External</button>
                          </div>
                          
                          {sub.problems.map((prob, pIdx) => {
                            const dbProb = prob.type === 'internal' ? allProblems.find(ap => ap._id === prob.problemId) : null;
                            
                            return (
                              <div key={pIdx} className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${prob.type === 'internal' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'}`}>{prob.type}</span>
                                    <span className="text-sm font-bold">{prob.type === 'internal' ? dbProb?.title : prob.title || 'New External'}</span>
                                  </div>
                                  <button onClick={() => {
                                    const nt = [...sheetData.topics];
                                    nt[tIdx].subtopics[sIdx].problems.splice(pIdx, 1);
                                    setSheetData({...sheetData, topics: nt});
                                  }}><Trash2 size={16} className="text-gray-600 hover:text-red-500"/></button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  {prob.type === 'internal' ? (
                                    <>
                                      <div className="space-y-1">
                                        <label className="text-[8px] uppercase text-gray-600 font-bold ml-1">LeetCode Link</label>
                                        <input className="w-full bg-black/40 border border-white/5 rounded-lg p-2 text-[10px] outline-none" value={prob.leetcodeLink} onChange={(e) => updateProblemField(tIdx, sIdx, pIdx, 'leetcodeLink', e.target.value)} placeholder="URL..." />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="text-[8px] uppercase text-gray-600 font-bold ml-1">GFG Link</label>
                                        <input className="w-full bg-black/40 border border-white/5 rounded-lg p-2 text-[10px] outline-none" value={prob.gfgLink} onChange={(e) => updateProblemField(tIdx, sIdx, pIdx, 'gfgLink', e.target.value)} placeholder="URL..." />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="text-[8px] uppercase text-gray-600 font-bold ml-1">InterviewBit Link</label>
                                        <input className="w-full bg-black/40 border border-white/5 rounded-lg p-2 text-[10px] outline-none" value={prob.interviewbitLink} onChange={(e) => updateProblemField(tIdx, sIdx, pIdx, 'interviewbitLink', e.target.value)} placeholder="URL..." />
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <input className="bg-black/40 border border-white/5 rounded-lg p-2 text-[10px]" value={prob.title} onChange={(e) => updateProblemField(tIdx, sIdx, pIdx, 'title', e.target.value)} placeholder="Custom Title" />
                                      <input className="bg-black/40 border border-white/5 rounded-lg p-2 text-[10px]" value={prob.link} onChange={(e) => updateProblemField(tIdx, sIdx, pIdx, 'link', e.target.value)} placeholder="Main URL" />
                                      <select className="bg-black border border-white/5 rounded-lg p-2 text-[10px]" value={prob.platform} onChange={(e) => updateProblemField(tIdx, sIdx, pIdx, 'platform', e.target.value)}>
                                        <option value="leetcode">LeetCode</option>
                                        <option value="gfg">GFG</option>
                                        <option value="interviewbit">InterviewBit</option>
                                        <option value="codeforces">Codeforces</option>
                                      </select>
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          <button onClick={addTopic} className="w-full py-10 border-2 border-dashed border-white/5 rounded-2xl text-gray-500 hover:text-orange-500 transition-all font-bold">+ ADD TOPIC BLOCK</button>
        </div>

        {/* Action Bar */}
        <div className="mt-10 flex justify-end">
           <button onClick={handleSubmit} disabled={loading} className="bg-orange-600 hover:bg-orange-700 text-black px-10 py-3 rounded-xl font-black flex items-center gap-2 shadow-lg shadow-orange-600/20">
             {loading ? <Plus className="animate-spin" /> : <Save size={18} />} SAVE SHEET
           </button>
        </div>

      </div>
    </div>
  );
}

export default AdminSheet;