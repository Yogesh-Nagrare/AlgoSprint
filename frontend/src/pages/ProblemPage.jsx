import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import Editor from '@monaco-editor/react';
import { useParams, NavLink } from 'react-router'; 
import { useDispatch, useSelector } from 'react-redux';
import { updateCode, setPersistedLanguage } from '../redux/editorSlice'; 
import axiosClient from "../utils/axiosClient";
import SubmissionHistory from "../components/SubmissionHistory";
import ChatAi from '../components/ChatAi';
import Editorial from '../components/Editorial';
import { 
    ChevronDown, 
    Play, 
    Send, 
    Code2, 
    FileText, 
    History, 
    Lightbulb, 
    MessageSquare, 
    Terminal,
    CheckCircle2,
    XCircle,
    RotateCcw,
    Info,
    Copy,
    Settings as SettingsIcon,
    ChevronUp, 
    ChevronDown as ChevronDownIcon,
    Filter,
    Check,
    Timer as TimerIcon,
    Pause, // Added Pause Icon
    AlertCircle // <--- ADD THIS

} from 'lucide-react';

const langMap = {
    cpp: 'C++',
    java: 'Java',
    javascript: 'JavaScript'
};

const ProblemPage = () => {
    const dispatch = useDispatch();
    const { problemId } = useParams();
    const [problemStatus, setProblemStatus] = useState('untouched'); // <--- ADD THIS
    const [copiedId, setCopiedId] = useState(null);
    const editorState = useSelector((state) => state.editor) || {};
    const userCode = editorState.userCode || {};
    const lastSelectedLanguage = editorState.lastSelectedLanguage || {};
    
    // --- RESIZING LOGIC START ---
    const [leftWidth, setLeftWidth] = useState(50);
    const isResizing = useRef(false);

    const startResizing = useCallback(() => {
        isResizing.current = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }, []);

    const stopResizing = useCallback(() => {
        isResizing.current = false;
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
    }, []);

    const resize = useCallback((e) => {
        if (!isResizing.current) return;
        const newWidth = (e.clientX / window.innerWidth) * 100;
        if (newWidth > 20 && newWidth < 80) setLeftWidth(newWidth);
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResizing);
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [resize, stopResizing]);
    // --- RESIZING LOGIC END ---

    const [selectedTestCaseIndex, setSelectedTestCaseIndex] = useState(0);
    const [problem, setProblem] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState(
        lastSelectedLanguage?.[problemId] || 'javascript' 
    );
    
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [runResult, setRunResult] = useState(null);
    const [submitResult, setSubmitResult] = useState(null);
    const [activeLeftTab, setActiveLeftTab] = useState('description');
    
    // --- UI STATES ---
    const [activeRightTab, setActiveRightTab] = useState('testcase');
    const [isConsoleOpen, setIsConsoleOpen] = useState(true); 
    const [solutionLang, setSolutionLang] = useState('all'); 
    
    // --- TIMER STATE ---
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(true);

    const editorRef = useRef(null);

    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('editor_settings');
        return saved ? JSON.parse(saved) : {
            fontSize: 14,
            theme: 'vs-dark',
            tabSize: 4,
            minimap: false,
            wordWrap: 'on'
        };
    });

    useEffect(() => {
        localStorage.setItem('editor_settings', JSON.stringify(settings));
    }, [settings]);
    
    // --- TIMER LOGIC START ---
    useEffect(() => {
        const startKey = `leetcode_timer_start_${problemId}`;
        const runningKey = `leetcode_timer_running_${problemId}`;
        const savedElapsedKey = `leetcode_timer_elapsed_${problemId}`;

        // Initialize state from local storage
        const isRunning = localStorage.getItem(runningKey) !== 'false'; // Default true
        setIsTimerRunning(isRunning);

        if (isRunning) {
            let startTime = localStorage.getItem(startKey);
            if (!startTime) {
                startTime = Date.now().toString();
                localStorage.setItem(startKey, startTime);
            }
            setElapsedTime(Math.floor((Date.now() - parseInt(startTime)) / 1000));
        } else {
            const savedTime = parseInt(localStorage.getItem(savedElapsedKey) || '0');
            setElapsedTime(savedTime);
        }
    }, [problemId]);

    useEffect(() => {
        let intervalId;
        const startKey = `leetcode_timer_start_${problemId}`;

        if (isTimerRunning) {
            intervalId = setInterval(() => {
                const start = parseInt(localStorage.getItem(startKey) || Date.now().toString());
                setElapsedTime(Math.floor((Date.now() - start) / 1000));
            }, 1000);
        }

        return () => clearInterval(intervalId);
    }, [isTimerRunning, problemId]);

    const toggleTimer = () => {
        const startKey = `leetcode_timer_start_${problemId}`;
        const runningKey = `leetcode_timer_running_${problemId}`;
        const savedElapsedKey = `leetcode_timer_elapsed_${problemId}`;

        if (isTimerRunning) {
            // PAUSE: Save current elapsed time and stop
            localStorage.setItem(runningKey, 'false');
            localStorage.setItem(savedElapsedKey, elapsedTime.toString());
            setIsTimerRunning(false);
        } else {
            // RESUME: Calculate new start time so math works (Now - NewStart = SavedElapsed)
            // NewStart = Now - SavedElapsed
            const newStartTime = Date.now() - (elapsedTime * 1000);
            localStorage.setItem(startKey, newStartTime.toString());
            localStorage.setItem(runningKey, 'true');
            setIsTimerRunning(true);
        }
    };

    const handleResetTimer = () => {
        const startKey = `leetcode_timer_start_${problemId}`;
        const savedElapsedKey = `leetcode_timer_elapsed_${problemId}`;
        
        // Reset to 0 and keep current running state
        if (isTimerRunning) {
            localStorage.setItem(startKey, Date.now().toString());
        } else {
            localStorage.setItem(savedElapsedKey, '0');
        }
        setElapsedTime(0);
    };

    const formatTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };
    // --- TIMER LOGIC END ---

    useEffect(() => {
        const fetchProblem = async () => {
            setLoading(true);
            try {
                const response = await axiosClient.get(`/problem/problemById/${problemId}`);
                setProblem(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching problem:', error);
                setLoading(false);
            }
        };
        fetchProblem();
    }, [problemId]);

    useEffect(() => {
        if (problem) {
            const savedCode = userCode?.[problemId]?.[selectedLanguage];
            if (savedCode) {
                setCode(savedCode);
            } else {
                const defaultInitial = problem.startCode.find(
                    (sc) => sc.language === langMap[selectedLanguage]
                )?.initialCode;
                setCode(defaultInitial || '');
            }
        }
    }, [selectedLanguage, problem, problemId]); 
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response = await axiosClient.get(`/problem/status/${problemId}`);
                setProblemStatus(response.data.status);
            } catch (error) {
                console.error('Error fetching status:', error);
            }
        };
        fetchStatus();
    }, [problemId]);
    const handleResetCode = () => {
        if (!problem) return;
        const defaultInitial = problem.startCode.find(
            (sc) => sc.language === langMap[selectedLanguage]
        )?.initialCode || '';
        if (editorRef.current) {
            editorRef.current.setValue(defaultInitial);
        }
        setCode(defaultInitial);
        dispatch(updateCode({ problemId, language: selectedLanguage, code: defaultInitial }));
    };

    const handleEditorChange = (value) => {
        const newCode = value || '';
        setCode(newCode); 
        dispatch(updateCode({ problemId, language: selectedLanguage, code: newCode }));
    };

    const handleLanguageChange = (language) => {
        setSelectedLanguage(language);
        dispatch(setPersistedLanguage({ problemId, language }));
    };

    const handleEditorDidMount = (editor) => { editorRef.current = editor; };

    const handleRun = async () => {
        setLoading(true);
        setRunResult(null);
        setSelectedTestCaseIndex(0);
        setIsConsoleOpen(true); 
        setActiveRightTab('testcase'); 
        try {
            const response = await axiosClient.post(`/submission/run/${problemId}`, { code, language: selectedLanguage });
            setRunResult(response.data);
            setLoading(false);
        } catch (error) {
            setRunResult({ success: false, error: 'Internal server error' });
            setLoading(false);
        }
    };

    const handleSubmitCode = async () => {
        setLoading(true);
        setSubmitResult(null);
        setIsConsoleOpen(true); 
        setActiveRightTab('result'); 
        try {
            const response = await axiosClient.post(`/submission/submit/${problemId}`, { code, language: selectedLanguage });
            setSubmitResult(response.data);
            if (response.data.problemStatus) {
            setProblemStatus(response.data.problemStatus);
        }
            setLoading(false);
        } catch (error) {
            setLoading(false);
        }
    };

    const handleCopy = async (text, id) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Failed to copy!', err);
        }
    };
    const getStatusBadge = () => {
    if (problemStatus === 'solved') {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400 uppercase">Solved</span>
            </div>
        );
    }
    // else if (problemStatus === 'attempted') {
    //     return (
    //         <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30">
    //             <AlertCircle size={14} className="text-amber-400" />
    //             <span className="text-xs font-bold text-amber-400 uppercase">Attempted</span>
    //         </div>
    //     );
    // }
    return null;
};
    const getDifficultyColor = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            case 'hard': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
            default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
    };

    if (loading && !problem) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-[#0a0a0a]">
                <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400 animate-pulse font-medium">Preparing your workspace...</p>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-[#0f0f0f] text-gray-200 overflow-hidden font-sans">
            <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-[#1a1a1a] shadow-xl z-20 shrink-0">
                <div className="flex items-center gap-3">
                    <NavLink to="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-all group">
                        <div className="p-1.5 rounded-md group-hover:bg-white/10">
                            <Code2 size={18} />
                        </div>
                        <span className="text-sm font-medium">Problems</span>
                    </NavLink>
                    <span className="text-gray-700">/</span>
                    <span className="font-semibold text-gray-100 tracking-tight">{problem?.title}</span>
                </div>
                
                {/* --- HEADER RIGHT SECTION --- */}
                <div className="flex items-center gap-4">
                    {/* Timer Component */}
                    <div className="flex items-center gap-2 bg-white/5 pl-3 pr-2 py-1.5 rounded-lg border border-white/5 shadow-inner">
                        <TimerIcon size={14} className={isTimerRunning ? "text-orange-500" : "text-gray-500"} />
                        <span className={`text-sm font-mono font-medium min-w-[50px] text-center ${isTimerRunning ? "text-gray-200" : "text-gray-500"}`}>
                            {formatTime(elapsedTime)}
                        </span>
                        
                        <div className="w-[1px] h-4 bg-white/10 mx-1"></div>
                        
                        {/* Play/Pause Button */}
                        <button 
                            onClick={toggleTimer}
                            className="p-1.5 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors"
                            title={isTimerRunning ? "Pause Timer" : "Resume Timer"}
                        >
                            {isTimerRunning ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
                        </button>

                        {/* Reset Button */}
                        <button 
                            onClick={handleResetTimer}
                            className="p-1.5 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors"
                            title="Reset Timer"
                        >
                            <RotateCcw size={12} />
                        </button>
                    </div>

                    <div className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 text-[11px] text-gray-400 uppercase tracking-widest font-bold">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        Server Online
                    </div>
                </div>
            </div>

            <div className="flex-1 flex p-3 overflow-hidden gap-0">
                {/* LEFT PANEL */}
                <div 
                    style={{ width: `${leftWidth}%` }}
                    className="flex flex-col bg-[#1e1e1e] rounded-xl border border-white/10 overflow-hidden shadow-2xl min-w-[150px]"
                >
                    <div className="flex items-center bg-[#252525] border-b border-white/5 px-2 overflow-x-auto whitespace-nowrap custom-scrollbar shrink-0">
                        {[
                            { id: 'description', label: 'Description', icon: <FileText size={14}/> },
                            { id: 'editorial', label: 'Editorial', icon: <Lightbulb size={14}/> },
                            { id: 'solutions', label: 'Solutions', icon: <Info size={14}/> },
                            { id: 'submissions', label: 'History', icon: <History size={14}/> },
                            { id: 'chatAI', label: 'AI Help', icon: <MessageSquare size={14}/> }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveLeftTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-3 text-[13px] font-medium transition-all relative shrink-0 ${
                                    activeLeftTab === tab.id ? 'text-orange-500 bg-white/5' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                                }`}
                            >
                                {tab.icon}
                                {tab.label}
                                {activeLeftTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]"></div>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar scroll-smooth">
                        {problem && (
                            <div className="max-w-3xl mx-auto h-full">
                                {activeLeftTab === 'description' && (
                                    <div className="animate-in fade-in slide-in-from-left-4 duration-500">
{/* Title row with Status Badge on the far right */}
<div className="flex items-center justify-between mb-4">
    <h1 className="text-3xl font-bold text-white tracking-tight">
        {problem.title}
    </h1>
    <div>{getStatusBadge()}</div>
</div>

{/* Metadata row (Difficulty and Submissions) */}
<div className="flex items-center gap-3 mb-8">
    <span className={`px-4 py-1 rounded-full text-xs font-bold border ${getDifficultyColor(problem.difficulty)}`}>
        {problem.difficulty}
    </span>
    <span className="text-gray-500 text-xs flex items-center gap-1">
        <History size={12} /> 1.2k Submissions
    </span>
</div>
                                        <div className="text-gray-300 leading-relaxed text-[16px] space-y-6 mb-12 font-normal">
                                            {problem.description.split('\n').map((para, i) => (
                                                <p key={i}>{para}</p>
                                            ))}
                                        </div>
                                        <div className="space-y-10">
                                            {problem.visibleTestCases.map((example, index) => (
                                                <div key={index} className="group">
                                                    <h3 className="text-gray-100 font-bold text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
                                                        <span className="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-[10px] text-orange-500 border border-white/10">0{index + 1}</span>
                                                        Example {index + 1}
                                                    </h3>
                                                    <div className="bg-[#141414] border border-white/5 p-5 rounded-xl font-mono text-[13px] leading-7 group-hover:border-white/10 transition-colors">
                                                        <div className="flex gap-4"><span className="text-orange-500/70 w-16 shrink-0">Input:</span> <span className="text-gray-200">{example.input}</span></div>
                                                        <div className="flex gap-4"><span className="text-emerald-500/70 w-16 shrink-0">Output:</span> <span className="text-gray-200">{example.output}</span></div>
                                                        <div className="flex gap-4"><span className="text-emerald-500/70 w-16 shrink-0">Expanation:</span> <span className="text-gray-200">{example.explanation}</span></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {activeLeftTab === 'editorial' && <Editorial secureUrl={problem.secureUrl} thumbnailUrl={problem.thumbnailUrl} duration={problem.duration}/>}
                                {activeLeftTab === 'submissions' && <SubmissionHistory problemId={problemId} />}
                                {activeLeftTab === 'chatAI' && <ChatAi problem={problem} />}
                                
                                {/* --- NEW BEAUTIFUL SOLUTIONS TAB --- */}
                                {activeLeftTab === 'solutions' && (
                                    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        
                                        {/* Sticky Header with Dropdown Filter */}
                                        <div className="flex items-center justify-between mb-6 shrink-0 sticky top-0 bg-[#1e1e1e] z-10 py-2 border-b border-white/5">
                                            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
                                                <Code2 size={16} className="text-orange-500"/>
                                                Solutions
                                            </h2>
                                            
                                            {/* Dropdown Component */}
                                            <div className="relative group">
                                                <button className="flex items-center gap-2 px-3 py-1.5 bg-[#252525] hover:bg-[#333] border border-white/10 rounded-lg text-xs font-medium text-gray-200 transition-all shadow-lg">
                                                    <Filter size={12} className="text-gray-400"/>
                                                    {solutionLang === 'all' ? 'All Languages' : solutionLang}
                                                    <ChevronDown size={14} className="ml-1 opacity-50"/>
                                                </button>
                                                
                                                <div className="absolute right-0 top-full mt-2 w-48 bg-[#252525] border border-white/10 rounded-xl shadow-2xl overflow-hidden hidden group-hover:block z-50 animate-in fade-in zoom-in-95 duration-150">
                                                    <div className="p-1">
                                                        {['all', ...new Set(problem.referenceSolution?.map(s => s.language))].map((lang) => (
                                                            <button
                                                                key={lang}
                                                                onClick={() => setSolutionLang(lang)}
                                                                className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 ${
                                                                    solutionLang === lang 
                                                                        ? 'bg-orange-500/20 text-orange-400' 
                                                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                                                }`}
                                                            >
                                                                {lang === 'all' ? 'Show All' : lang}
                                                                {solutionLang === lang && <Check size={12} className="ml-auto"/>}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Solutions List */}
                                        <div className="space-y-8 pb-10">
                                            {problem.referenceSolution
                                                ?.filter(sol => solutionLang === 'all' || sol.language === solutionLang)
                                                .map((sol, i) => {
                                                    // Styling config based on language
                                                    const getStyle = (l) => {
                                                        const lang = l.toLowerCase();
                                                        if (lang.includes('java') && !lang.includes('script')) return { accent: 'bg-orange-500', text: 'text-orange-400', border: 'border-orange-500/30', glow: 'from-orange-500/10' };
                                                        if (lang.includes('script')) return { accent: 'bg-yellow-400', text: 'text-yellow-400', border: 'border-yellow-400/30', glow: 'from-yellow-400/10' };
                                                        if (lang.includes('cpp')) return { accent: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500/30', glow: 'from-blue-500/10' };
                                                        return { accent: 'bg-gray-500', text: 'text-gray-400', border: 'border-gray-500/30', glow: 'from-gray-500/10' };
                                                    };
                                                    const style = getStyle(sol.language);

                                                    return (
                                                        <div key={i} className="group relative">
                                                            {/* Background Glow */}
                                                            <div className={`absolute -inset-1 bg-gradient-to-r ${style.glow} to-transparent opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500`}></div>
                                                            
                                                            <div className="relative bg-[#141414] rounded-xl border border-white/10 overflow-hidden shadow-xl transition-all hover:border-white/20">
                                                                {/* Card Header */}
                                                                <div className="flex items-center justify-between px-4 py-3 bg-[#1a1a1a] border-b border-white/5">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className={`w-1.5 h-6 rounded-full ${style.accent}`}></div>
                                                                        <span className={`text-xs font-bold uppercase tracking-wider ${style.text}`}>
                                                                            {sol.language}
                                                                        </span>
                                                                    </div>
                                                                    <button 
                                                                        onClick={() => handleCopy(sol.completeCode, i)}
                                                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                                                                            copiedId === i 
                                                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                                                                : 'bg-white/5 text-gray-400 border-transparent hover:bg-white/10 hover:text-white'
                                                                        }`}
                                                                    >
                                                                        {copiedId === i ? <Check size={12}/> : <Copy size={12}/>}
                                                                        {copiedId === i ? 'Copied' : 'Copy'}
                                                                    </button>
                                                                </div>

                                                                {/* Code Block */}
                                                                <div className="relative bg-[#0a0a0a] group/code">
                                                                    {/* Visual Line Number Gutter */}
                                                                    <div className="absolute left-0 top-0 bottom-0 w-8 border-r border-white/5 bg-[#111] z-10 hidden sm:block"></div>
                                                                    
                                                                    <pre className="p-4 sm:pl-12 font-mono text-[13px] leading-relaxed text-gray-300 overflow-x-auto custom-scrollbar">
                                                                        <code className="selection:bg-white/20">{sol.completeCode}</code>
                                                                    </pre>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            
                                            {(!problem.referenceSolution || problem.referenceSolution.length === 0) && (
                                                <div className="flex flex-col items-center justify-center py-20 opacity-50">
                                                    <Code2 size={48} className="mb-4 text-gray-600"/>
                                                    <p className="text-gray-500 text-sm">No solutions available yet.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* --- RESIZE DIVIDER --- */}
                <div 
                    onMouseDown={startResizing}
                    className="w-1.5 h-full cursor-col-resize hover:bg-orange-500/30 transition-colors flex items-center justify-center group shrink-0"
                >
                    <div className="w-[1px] h-10 bg-white/10 group-hover:bg-orange-500 group-active:h-full transition-all" />
                </div>

                {/* RIGHT PANEL (EDITOR + CONSOLE) */}
                <div 
                    style={{ width: `${100 - leftWidth}%` }}
                    className="flex flex-col bg-[#1e1e1e] rounded-xl border border-white/10 overflow-hidden shadow-2xl min-w-[150px]"
                >
                    <div className="flex items-center justify-between bg-[#252525] border-b border-white/5 px-4 h-12 shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="dropdown relative group">
                                <label tabIndex={0} className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-white/5 text-gray-300 cursor-pointer transition-colors text-xs font-semibold">
                                    <Code2 size={14} className="text-orange-500"/>
                                    {langMap[selectedLanguage]} 
                                    <ChevronDown size={14} />
                                </label>
                                <ul tabIndex={0} className="dropdown-content absolute left-0 top-full mt-1 z-[100] menu p-1.5 shadow-2xl bg-[#2a2a2a] border border-white/10 rounded-lg w-44 backdrop-blur-xl">
                                    {['javascript', 'java', 'cpp'].map(lang => (
                                        <li key={lang}>
                                            <button 
                                                onClick={() => handleLanguageChange(lang)} 
                                                className={`w-full text-left px-3 py-2 rounded-md text-xs transition-colors ${selectedLanguage === lang ? 'bg-orange-500/10 text-orange-500' : 'hover:bg-white/5 text-gray-400'}`}
                                            >
                                                {langMap[lang]}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                             <button onClick={handleResetCode} className="p-1.5 text-gray-500 hover:text-white transition-colors flex items-center gap-1 group" title="Reset to default code">
                                <RotateCcw size={14} className="group-hover:rotate-[-45deg] transition-transform"/>
                                <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Reset</span>
                             </button>
                            <button onClick={() => handleCopy(code, 'main-editor')} className="p-1.5 text-gray-500 hover:text-white transition-colors flex items-center gap-1 group" title="Copy current code">
                                {copiedId === 'main-editor' ? (
                                    <CheckCircle2 size={14} className="text-emerald-400 animate-in zoom-in" />
                                ) : (
                                    <Copy size={14} className="group-hover:scale-110 transition-transform" />
                                )}
                                <span className={`text-[10px] font-bold uppercase tracking-wider hidden sm:inline ${copiedId === 'main-editor' ? 'text-emerald-400' : ''}`}>
                                    {copiedId === 'main-editor' ? 'Copied!' : 'Copy'}
                                </span>
                            </button>
                            <div className="dropdown dropdown-end relative group">
                                <label tabIndex={0} className="p-1.5 text-gray-500 hover:text-white transition-colors cursor-pointer flex items-center">
                                    <SettingsIcon size={14} />
                                </label>
                                <div tabIndex={0} className="dropdown-content absolute right-0 top-full mt-2 z-[110] p-4 shadow-2xl bg-[#2a2a2a] border border-white/10 rounded-xl w-64 backdrop-blur-xl">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Editor Settings</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-300">Font Size</span>
                                            <select value={settings.fontSize} onChange={(e) => setSettings({...settings, fontSize: Number(e.target.value)})} className="bg-[#1e1e1e] text-[11px] px-2 py-1 rounded border border-white/10 outline-none">
                                                {[12, 14, 16, 18, 20].map(size => <option key={size} value={size}>{size}px</option>)}
                                            </select>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-300">Tab Size</span>
                                            <div className="flex gap-1">
                                                {[2, 4].map(size => (
                                                    <button key={size} onClick={() => setSettings({...settings, tabSize: size})} className={`px-2 py-1 text-[10px] rounded ${settings.tabSize === size ? 'bg-orange-500 text-white' : 'bg-white/5 text-gray-400'}`}>
                                                        {size}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-300">Word Wrap</span>
                                            <button onClick={() => setSettings({...settings, wordWrap: settings.wordWrap === 'on' ? 'off' : 'on'})} className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all ${settings.wordWrap === 'on' ? 'text-orange-500 bg-orange-500/10' : 'text-gray-500 bg-white/5'}`}>
                                                {settings.wordWrap === 'on' ? 'Enabled' : 'Disabled'}
                                            </button>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-300">Minimap</span>
                                            <input type="checkbox" checked={settings.minimap} onChange={(e) => setSettings({...settings, minimap: e.target.checked})} className="checkbox checkbox-xs checkbox-warning border-white/20"/>
                                        </div>
                                        <div className="pt-2 border-t border-white/5">
                                            <span className="text-[10px] text-gray-500 font-bold uppercase block mb-2">Theme</span>
                                            <div className="grid grid-cols-2 gap-2">
                                                {['vs-dark', 'light'].map(t => (
                                                    <button key={t} onClick={() => setSettings({...settings, theme: t})} className={`py-1.5 rounded text-[10px] border ${settings.theme === t ? 'border-orange-500 text-orange-500' : 'border-white/5 text-gray-400'}`}>
                                                        {t === 'vs-dark' ? 'Dark' : 'Light'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>                        
                        </div>
                    </div>

                    <div className="flex-1 relative flex flex-col overflow-hidden bg-[#1e1e1e]">
                        {/* 1. EDITOR AREA */}
                        <div className={`w-full transition-all duration-300 ${isConsoleOpen ? 'h-[60%]' : 'h-full'}`}>
                            <Editor
                                height="100%"
                                key={`${problemId}-${selectedLanguage}`}
                                language={selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage}
                                defaultValue={code}
                                onChange={handleEditorChange}
                                onMount={handleEditorDidMount}
                                theme={settings.theme}
                                options={{ 
                                    fontSize: settings.fontSize,
                                    minimap: { enabled: settings.minimap },
                                    tabSize: settings.tabSize,
                                    wordWrap: settings.wordWrap,
                                    padding: { top: 20 },
                                    lineNumbersMinChars: 3,
                                    smoothScrolling: true,
                                    cursorSmoothCaretAnimation: "on",
                                    fontFamily: "'Fira Code', monospace",
                                    automaticLayout: true,
                                }}
                            />
                        </div>
                        
                        {/* 2. BOTTOM PANEL (CONSOLE) */}
                        {isConsoleOpen && (
                            <div className="h-[40%] flex flex-col border-t border-white/10 bg-[#141414] animate-in slide-in-from-bottom-5 duration-300">
                                {/* Console Header / Tabs */}
                                <div className="flex items-center justify-between px-4 h-10 bg-[#1a1a1a] border-b border-white/5 shrink-0">
                                    <div className="flex gap-4 h-full">
                                        <button 
                                            onClick={() => setActiveRightTab('testcase')}
                                            className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider h-full border-b-2 transition-colors ${activeRightTab === 'testcase' ? 'text-white border-orange-500' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
                                        >
                                            <CheckCircle2 size={12} /> Testcase
                                        </button>
                                        <button 
                                            onClick={() => setActiveRightTab('result')}
                                            className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider h-full border-b-2 transition-colors ${activeRightTab === 'result' ? 'text-white border-orange-500' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
                                        >
                                            <Terminal size={12} /> Run Result
                                        </button>
                                    </div>
                                    <button onClick={() => setIsConsoleOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                                        <ChevronDownIcon size={16} />
                                    </button>
                                </div>

                                {/* Console Body */}
                                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                    {activeRightTab === 'testcase' && (
                                        <div className="space-y-4">
                                            <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                                                {(runResult?.testCases || problem?.visibleTestCases || []).map((tc, index) => {
                                                    let statusColor = 'bg-gray-600'; 
                                                    if (runResult) {
                                                        statusColor = tc.status_id === 3 ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]';
                                                    }

                                                    return (
                                                        <button
                                                            key={index}
                                                            onClick={() => setSelectedTestCaseIndex(index)}
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border shrink-0 flex items-center gap-2 ${
                                                                selectedTestCaseIndex === index
                                                                    ? 'bg-white/10 border-white/20 text-white'
                                                                    : 'bg-transparent border-transparent text-gray-500 hover:bg-white/5'
                                                            }`}
                                                        >
                                                            {runResult && (
                                                                <span className={`w-1.5 h-1.5 rounded-full ${statusColor}`}></span>
                                                            )}
                                                            Case {index + 1}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {(() => {
                                                const currentCase = runResult 
                                                    ? runResult.testCases?.[selectedTestCaseIndex] 
                                                    : problem?.visibleTestCases?.[selectedTestCaseIndex];
                                                
                                                if (!currentCase) return <div className="text-gray-500 text-xs">No test case selected</div>;

                                                return (
                                                    <div className="space-y-3 animate-in fade-in duration-200">
                                                        {runResult && (
                                                            <div className={`text-xs font-bold mb-2 ${currentCase.status_id === 3 ? 'text-emerald-400' : 'text-rose-500'}`}>
                                                                {currentCase.status_id === 3 ? 'Passed' : 'Runtime Error / Wrong Answer'}
                                                            </div>
                                                        )}

                                                        <div className="space-y-1">
                                                            <div className="text-[10px] font-bold uppercase text-gray-500">Input</div>
                                                            <div className="bg-[#1e1e1e] p-3 rounded-lg text-gray-300 font-mono text-xs border border-white/5">
                                                                {currentCase.stdin || currentCase.input}
                                                            </div>
                                                        </div>

                                                        {runResult && (
                                                            <div className="space-y-1">
                                                                <div className="text-[10px] font-bold uppercase text-gray-500">Output</div>
                                                                <div className={`p-3 rounded-lg font-mono text-xs border border-white/5 ${currentCase.stdout ? 'bg-[#1e1e1e] text-white' : 'bg-rose-500/10 text-rose-400'}`}>
                                                                    {currentCase.stdout || 'No output (Error)'}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="space-y-1">
                                                            <div className="text-[10px] font-bold uppercase text-gray-500">Expected Output</div>
                                                            <div className="bg-[#1e1e1e] p-3 rounded-lg text-gray-300 font-mono text-xs border border-white/5">
                                                                {currentCase.expected_output || currentCase.output}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}

                                    {activeRightTab === 'result' && (
                                        <div>
                                            {submitResult ? (
                                                 <div className={`p-4 rounded-xl border ${submitResult.accepted ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                                                    <div className={`text-xl font-bold mb-4 flex items-center gap-2 ${submitResult.accepted ? 'text-emerald-400' : 'text-rose-500'}`}>
                                                        {submitResult.accepted ? <CheckCircle2 size={20}/> : <XCircle size={20}/>}
                                                        {submitResult.accepted ? 'Accepted' : 'Wrong Answer'}
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                                        <div className="bg-white/5 p-3 rounded-lg">
                                                            <span className="text-gray-500 block mb-1">Runtime</span>
                                                            <span className="text-white font-mono">{submitResult.runtime} ms</span>
                                                        </div>
                                                        <div className="bg-white/5 p-3 rounded-lg">
                                                            <span className="text-gray-500 block mb-1">Memory</span>
                                                            <span className="text-white font-mono">{submitResult.memory} KB</span>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <div className="flex justify-between text-gray-400 mb-1">
                                                                <span>Test Cases</span>
                                                                <span>{submitResult.passedTestCases} / {submitResult.totalTestCases}</span>
                                                            </div>
                                                            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                                                <div 
                                                                    className={`h-full ${submitResult.accepted ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                                                    style={{ width: `${(submitResult.passedTestCases / submitResult.totalTestCases) * 100}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2 mt-8">
                                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                                                        <Send size={20} />
                                                    </div>
                                                    <p className="text-xs">Submit your code to see results here</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="h-16 bg-[#252525] border-t border-white/5 flex items-center justify-between px-6 shrink-0">
                        <div className="flex items-center gap-2">
                            <button onClick={() => setIsConsoleOpen(!isConsoleOpen)} className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg transition-all group">
                                <Terminal size={14} className="text-orange-500 group-hover:scale-110 transition-transform" />
                                Console
                                {isConsoleOpen ? <ChevronDownIcon size={12}/> : <ChevronUp size={12}/>}
                            </button>
                            <button onClick={() => setActiveLeftTab('chatAI')} className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-all group">
                                <MessageSquare size={16} className="text-orange-500 group-hover:scale-110 transition-transform" />
                                AI Tutor
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleRun} disabled={loading} className="flex items-center gap-2 px-6 py-2 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 active:scale-95">
                                <Play size={14} fill="currentColor" />
                                {loading ? 'Running...' : 'Run'}
                            </button>
                            <button onClick={handleSubmitCode} disabled={loading} className="flex items-center gap-2 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-lg transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] disabled:opacity-50 active:scale-95">
                                <Send size={14} />
                                {loading ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx="true">{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #444; }
                .dropdown-content { visibility: hidden; opacity: 0; transform: translateY(-10px); transition: all 0.2s; }
                .dropdown:focus-within .dropdown-content { visibility: visible; opacity: 1; transform: translateY(0); }
                .whitespace-nowrap::-webkit-scrollbar { display: none; }
                .whitespace-nowrap { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default ProblemPage;