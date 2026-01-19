import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Plus, Trash2, Save, ArrowLeft, Loader2, Globe, Search, CheckCircle2, Link2 } from 'lucide-react';
import axiosClient from '../utils/axiosClient';

const SheetForm = () => {
    const { sheetId } = useParams();
    const isEdit = Boolean(sheetId);
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(false);
    const [allProblems, setAllProblems] = useState([]); 
    const [searchTerm, setSearchTerm] = useState("");
    
    const [sheet, setSheet] = useState({
        title: '',
        slug: '',
        description: '',
        topics: [{ title: '', subtopics: [{ title: '', problems: [] }] }]
    });

    const generateSlug = (text) => text.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const probRes = await axiosClient.get('/problem/getAllProblem');
                setAllProblems(probRes.data);

                if (isEdit) {
                    const res = await axiosClient.get(`/problem/sheets/getById/${sheetId}`);
                    const data = res.data;
                    
                    const formattedTopics = data.topics.map(t => ({
                        title: t.title,
                        subtopics: t.subtopics.map(s => ({
                            title: s.title,
                            problems: s.problems.map(p => {
                                if (p.type === 'internal') {
                                    return { 
                                        type: 'internal', 
                                        problemId: p.globalProblemId, 
                                        leetcodeLink: p.externalLinks?.leetcode || '',
                                        gfgLink: p.externalLinks?.gfg || '',
                                        interviewbitLink: p.externalLinks?.interviewbit || '',
                                        solvedBy: p.solvedBy || [] 
                                    };
                                }
                                return { ...p, solvedBy: p.solvedBy || [] };
                            })
                        }))
                    }));

                    setSheet({ 
                        title: data.title, 
                        slug: data.slug || '', 
                        description: data.description || '', 
                        topics: formattedTopics 
                    });
                }
            } catch (err) { console.error("Initialization Error:", err); }
        };
        fetchData();
    }, [sheetId, isEdit]);

    const handleTitleChange = (val) => {
        setSheet(prev => ({ ...prev, title: val, slug: isEdit ? prev.slug : generateSlug(val) }));
    };

    const toggleInternalProblem = (tIdx, sIdx, problemId) => {
        const newTopics = [...sheet.topics];
        const problems = newTopics[tIdx].subtopics[sIdx].problems;
        const existingIdx = problems.findIndex(p => p.type === 'internal' && p.problemId === problemId);
        
        if (existingIdx > -1) {
            problems.splice(existingIdx, 1);
        } else {
            problems.push({ 
                type: 'internal', 
                problemId,
                leetcodeLink: '', 
                gfgLink: '', 
                interviewbitLink: '' 
            });
        }
        setSheet({ ...sheet, topics: newTopics });
    };

    const updateProblemField = (tIdx, sIdx, pIdx, field, val) => {
        const newTopics = [...sheet.topics];
        newTopics[tIdx].subtopics[sIdx].problems[pIdx][field] = val;
        setSheet({ ...sheet, topics: newTopics });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEdit) {
                await axiosClient.put(`/problem/sheet/update/${sheetId}`, sheet);
            } else {
                await axiosClient.post('/problem/sheet/create', sheet);
            }
            navigate('/admin/sheets/manage');
        } catch (err) {
            alert(err.response?.data?.error || "Error saving sheet");
        } finally {
            setLoading(false);
        }
    };

    const filteredProblems = allProblems.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="min-h-screen bg-[#070707] text-white p-6 md:p-12 pb-40">
            <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors font-bold uppercase tracking-widest text-xs">
                        <ArrowLeft size={16}/> Back
                    </button>
                    <button disabled={loading} className="bg-orange-600 hover:bg-orange-700 px-8 py-3 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-orange-600/20 transition-all active:scale-95">
                        {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                        {isEdit ? 'UPDATE ECOSYSTEM' : 'INITIALIZE SHEET'}
                    </button>
                </div>

                <div className="bg-[#111] p-8 md:p-12 rounded-[2.5rem] border border-white/5 mb-10">
                    <input 
                        className="w-full bg-transparent text-4xl md:text-5xl font-black outline-none border-b border-white/10 pb-4 focus:border-orange-500 transition-all placeholder:text-white/5"
                        placeholder="Sheet Title"
                        value={sheet.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        required
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                        <input 
                            className="bg-black/40 border border-white/5 p-4 rounded-2xl outline-none focus:border-orange-500/50 font-mono text-sm"
                            placeholder="url-slug"
                            value={sheet.slug}
                            onChange={(e) => setSheet({...sheet, slug: e.target.value})}
                            required
                        />
                        <input 
                            className="bg-black/40 border border-white/5 p-4 rounded-2xl outline-none focus:border-orange-500/50 text-sm"
                            placeholder="Description..."
                            value={sheet.description}
                            onChange={(e) => setSheet({...sheet, description: e.target.value})}
                        />
                    </div>
                </div>

                <div className="space-y-8">
                    {sheet.topics.map((topic, tIdx) => (
                        <div key={tIdx} className="bg-[#111] rounded-[2.5rem] border border-white/5 p-6 md:p-10">
                            <div className="flex justify-between items-center mb-8 gap-4">
                                <input 
                                    className="bg-transparent text-2xl font-black outline-none text-white flex-1"
                                    placeholder="Topic title..."
                                    value={topic.title}
                                    onChange={(e) => {
                                        const nt = [...sheet.topics];
                                        nt[tIdx].title = e.target.value;
                                        setSheet({...sheet, topics: nt});
                                    }}
                                    required
                                />
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => {
                                        const nt = [...sheet.topics];
                                        nt[tIdx].subtopics.push({ title: '', problems: [] });
                                        setSheet({...sheet, topics: nt});
                                    }} className="bg-blue-500/10 text-blue-500 p-3 rounded-xl hover:bg-blue-500 hover:text-white"><Plus size={20}/></button>
                                    <button type="button" onClick={() => {
                                        const nt = [...sheet.topics];
                                        nt.splice(tIdx, 1);
                                        setSheet({...sheet, topics: nt});
                                    }} className="bg-red-500/10 text-red-500 p-3 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={20}/></button>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {topic.subtopics.map((sub, sIdx) => (
                                    <div key={sIdx} className="bg-black/40 rounded-[2rem] border border-white/5 p-6">
                                        <input 
                                            className="bg-transparent font-bold text-lg text-gray-300 outline-none mb-6 border-b border-white/5 w-full"
                                            placeholder="Subtopic title..."
                                            value={sub.title}
                                            onChange={(e) => {
                                                const nt = [...sheet.topics];
                                                nt[tIdx].subtopics[sIdx].title = e.target.value;
                                                setSheet({...sheet, topics: nt});
                                            }}
                                            required
                                        />

                                        {/* 1. SELECTION AREA */}
                                        <div className="mb-8">
                                            <div className="flex items-center justify-between mb-3 px-2">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Search & Select Global Problems</h4>
                                                <div className="relative w-48">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={12} />
                                                    <input 
                                                        type="text" placeholder="Filter problems..." 
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        className="w-full bg-black border border-white/5 rounded-full py-1.5 pl-8 pr-4 text-[10px] outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div className="max-h-56 overflow-y-auto bg-black/40 rounded-2xl border border-white/5 p-2 custom-scrollbar">
                                                <div className="grid grid-cols-1 gap-1">
                                                    {filteredProblems.map(p => {
                                                        const isSelected = sub.problems.some(sp => sp.type === 'internal' && sp.problemId === p._id);
                                                        return (
                                                            <div 
                                                                key={p._id} 
                                                                onClick={() => toggleInternalProblem(tIdx, sIdx, p._id)}
                                                                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${isSelected ? 'bg-orange-500/10 border border-orange-500/20' : 'hover:bg-white/5 border border-transparent'}`}
                                                            >
                                                                <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${isSelected ? 'bg-orange-500 border-orange-500' : 'border-white/10'}`}>
                                                                    {isSelected && <CheckCircle2 size={12} className="text-black" strokeWidth={3} />}
                                                                </div>
                                                                <span className="text-xs font-bold">{p.title}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        {/* 2. CONFIGURATION AREA (Link Options) */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between px-2">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Configured Problems (Internal & External)</h4>
                                                <button type="button" onClick={() => {
                                                    const nt = [...sheet.topics];
                                                    nt[tIdx].subtopics[sIdx].problems.push({ type: 'external', title: '', link: '', difficulty: 'Medium', platform: 'leetcode' });
                                                    setSheet({...sheet, topics: nt});
                                                }} className="flex items-center gap-1 text-[10px] font-black text-blue-500 hover:text-blue-400 transition-colors uppercase tracking-widest">
                                                    <Globe size={12}/> Add Manual External
                                                </button>
                                            </div>

                                            {sub.problems.map((prob, pIdx) => {
                                                const dbProblem = prob.type === 'internal' ? allProblems.find(ap => ap._id === prob.problemId) : null;
                                                
                                                return (
                                                    <div key={pIdx} className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${prob.type === 'internal' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                                                    {prob.type}
                                                                </span>
                                                                <span className="text-sm font-bold text-gray-200">
                                                                    {prob.type === 'internal' ? dbProblem?.title || 'Loading...' : prob.title || 'New External Problem'}
                                                                </span>
                                                            </div>
                                                            <button type="button" onClick={() => {
                                                                const nt = [...sheet.topics];
                                                                nt[tIdx].subtopics[sIdx].problems.splice(pIdx, 1);
                                                                setSheet({...sheet, topics: nt});
                                                            }} className="text-gray-600 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                                                        </div>

                                                        {/* Link Inputs Grid */}
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                            {prob.type === 'internal' ? (
                                                                <>
                                                                    <div className="space-y-1">
                                                                        <label className="text-[8px] uppercase text-gray-500 font-bold ml-1">LeetCode Link</label>
                                                                        <input 
                                                                            className="w-full bg-black/40 p-2 rounded-lg text-[10px] outline-none border border-white/5 focus:border-orange-500/50"
                                                                            placeholder="URL..." value={prob.leetcodeLink || ''}
                                                                            onChange={(e) => updateProblemField(tIdx, sIdx, pIdx, 'leetcodeLink', e.target.value)}
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <label className="text-[8px] uppercase text-gray-500 font-bold ml-1">GFG Link</label>
                                                                        <input 
                                                                            className="w-full bg-black/40 p-2 rounded-lg text-[10px] outline-none border border-white/5 focus:border-green-500/50"
                                                                            placeholder="URL..." value={prob.gfgLink || ''}
                                                                            onChange={(e) => updateProblemField(tIdx, sIdx, pIdx, 'gfgLink', e.target.value)}
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <label className="text-[8px] uppercase text-gray-500 font-bold ml-1">InterviewBit Link</label>
                                                                        <input 
                                                                            className="w-full bg-black/40 p-2 rounded-lg text-[10px] outline-none border border-white/5 focus:border-blue-500/50"
                                                                            placeholder="URL..." value={prob.interviewbitLink || ''}
                                                                            onChange={(e) => updateProblemField(tIdx, sIdx, pIdx, 'interviewbitLink', e.target.value)}
                                                                        />
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <input 
                                                                        className="bg-black/40 p-2 rounded-lg text-[10px] outline-none border border-white/5"
                                                                        placeholder="Custom Title" value={prob.title}
                                                                        onChange={(e) => updateProblemField(tIdx, sIdx, pIdx, 'title', e.target.value)}
                                                                    />
                                                                    <input 
                                                                        className="bg-black/40 p-2 rounded-lg text-[10px] outline-none border border-white/5"
                                                                        placeholder="Main URL" value={prob.link}
                                                                        onChange={(e) => updateProblemField(tIdx, sIdx, pIdx, 'link', e.target.value)}
                                                                    />
                                                                    <div className="flex gap-2">
                                                                        <select 
                                                                            className="flex-1 bg-black text-[10px] p-2 rounded-lg border border-white/5 outline-none"
                                                                            value={prob.platform} onChange={(e) => updateProblemField(tIdx, sIdx, pIdx, 'platform', e.target.value)}
                                                                        >
                                                                            <option value="leetcode">LeetCode</option><option value="gfg">GFG</option><option value="interviewbit">InterviewBit</option><option value="codeforces">Codeforces</option>
                                                                        </select>
                                                                        <select 
                                                                            className="flex-1 bg-black text-[10px] p-2 rounded-lg border border-white/5 outline-none"
                                                                            value={prob.difficulty} onChange={(e) => updateProblemField(tIdx, sIdx, pIdx, 'difficulty', e.target.value)}
                                                                        >
                                                                            <option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option>
                                                                        </select>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    <button type="button" onClick={() => setSheet({...sheet, topics: [...sheet.topics, { title: '', subtopics: [{ title: '', problems: [] }] }]})} className="w-full py-16 border-2 border-dashed border-white/5 rounded-[3rem] text-gray-600 hover:border-orange-500 transition-all font-black flex flex-col items-center gap-3">
                        <Plus size={32} />
                        ADD TOPIC BLOCK
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SheetForm;