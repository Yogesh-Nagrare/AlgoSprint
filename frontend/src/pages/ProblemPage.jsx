import { useState, useEffect, useRef, useCallback } from 'react'; // Added useCallback
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
    Settings as SettingsIcon, // Renamed for clarity vs component
} from 'lucide-react';

const langMap = {
    cpp: 'C++',
    java: 'Java',
    javascript: 'JavaScript'
};

const ProblemPage = () => {
    const dispatch = useDispatch();
    const { problemId } = useParams();
    const [copiedId, setCopiedId] = useState(null);
    const editorState = useSelector((state) => state.editor) || {};
    const userCode = editorState.userCode || {};
    const lastSelectedLanguage = editorState.lastSelectedLanguage || {};
    
    // --- RESIZING LOGIC START ---
    const [leftWidth, setLeftWidth] = useState(50); // percentage
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
        if (newWidth > 20 && newWidth < 80) { // Constraints
            setLeftWidth(newWidth);
        }
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
    const [activeRightTab, setActiveRightTab] = useState('code');
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
    
    const { handleSubmit } = useForm();

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
        try {
            const response = await axiosClient.post(`/submission/run/${problemId}`, { code, language: selectedLanguage });
            setRunResult(response.data);
            setLoading(false);
            setActiveRightTab('testcase');
        } catch (error) {
            setRunResult({ success: false, error: 'Internal server error' });
            setLoading(false);
            setActiveRightTab('testcase');
        }
    };

    const handleSubmitCode = async () => {
        setLoading(true);
        setSubmitResult(null);
        try {
            const response = await axiosClient.post(`/submission/submit/${problemId}`, { code, language: selectedLanguage });
            setSubmitResult(response.data);
            setLoading(false);
            setActiveRightTab('result');
        } catch (error) {
            setLoading(false);
            setActiveRightTab('result');
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
                <div className="flex items-center gap-4">
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
                    {/* HORIZONTALLY SCROLLABLE TABS CONTAINER */}
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

                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar scroll-smooth">
                        {problem && (
                            <div className="max-w-3xl mx-auto">
                                {activeLeftTab === 'description' && (
                                    <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                                        <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">{problem.title}</h1>
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
                                {activeLeftTab === 'solutions' && (
                                <div className="space-y-6 animate-in fade-in duration-500">
                                    {problem.referenceSolution?.map((sol, i) => (
                                        <div key={i} className="bg-[#141414] rounded-xl border border-white/10 overflow-hidden">
                                            <div className="bg-white/5 px-4 py-2 text-[11px] font-bold text-orange-400 uppercase tracking-widest flex justify-between items-center">
                                                <span className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                                                    {sol.language}
                                                </span>
                                                <button 
                                                    onClick={() => handleCopy(sol.completeCode, i)}
                                                    className={`transition-all duration-200 flex items-center gap-1 ${
                                                        copiedId === i ? 'text-emerald-400' : 'text-gray-400 hover:text-white'
                                                    }`}
                                                >
                                                    {copiedId === i ? (
                                                        <><CheckCircle2 size={12} /> Copied!</>
                                                    ) : (
                                                        'Copy'
                                                    )}
                                                </button>
                                            </div>
                                            <pre className="p-5 text-[13px] font-mono text-gray-300 overflow-x-auto selection:bg-orange-500/30">
                                                <code>{sol.completeCode}</code>
                                            </pre>
                                        </div>
                                    ))}
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

                {/* RIGHT PANEL (EDITOR) */}
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
                        {activeRightTab === 'code' ? (
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
                        ) : (
                            <div className="flex-1 p-8 bg-[#141414] overflow-y-auto custom-scrollbar animate-in slide-in-from-right-4 duration-300">
                                <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                                    <div className="flex items-center gap-2">
                                        <Terminal size={18} className="text-orange-500" />
                                        <h3 className="text-white font-bold tracking-tight">
                                            {activeRightTab === 'testcase' ? 'Execution Results' : 'Submission Summary'}
                                        </h3>
                                    </div>
                                    <button onClick={() => setActiveRightTab('code')} className="text-[11px] font-bold uppercase tracking-widest text-gray-500 hover:text-white bg-white/5 px-3 py-1.5 rounded-md transition-all">
                                        Close Console
                                    </button>
                                </div>

                                {activeRightTab === 'testcase' && runResult && (
                                    <div className="space-y-6">
                                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-lg ${runResult.success ? 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20' : 'text-rose-500 bg-rose-500/10 border border-rose-500/20'}`}>
                                            {runResult.success ? <CheckCircle2 size={20}/> : <XCircle size={20}/>}
                                            {runResult.success ? 'Accepted' : 'Runtime Error'}
                                        </div>
                                        <div className="flex gap-3 mb-6 overflow-x-auto pb-2 custom-scrollbar">
                                            {runResult.testCases?.map((tc, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setSelectedTestCaseIndex(index)}
                                                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border shrink-0 ${
                                                        selectedTestCaseIndex === index
                                                            ? 'bg-white/10 border-white/20 text-white shadow-lg'
                                                            : 'bg-transparent border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                                    }`}
                                                >
                                                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${tc.status_id === 3 ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'}`}></span>
                                                    Case {index + 1}
                                                </button>
                                            ))}
                                        </div>
                                        {runResult.testCases?.[selectedTestCaseIndex] && (
                                            <div className="grid gap-4 animate-in fade-in zoom-in-95 duration-300">
                                                {[
                                                    { label: 'Input', value: runResult.testCases[selectedTestCaseIndex].stdin, color: 'text-gray-400' },
                                                    { label: 'Output', value: runResult.testCases[selectedTestCaseIndex].stdout || 'null', color: 'text-emerald-400' },
                                                    { label: 'Expected', value: runResult.testCases[selectedTestCaseIndex].expected_output, color: 'text-orange-400' }
                                                ].map((item, i) => (
                                                    <div key={i} className="space-y-2">
                                                        <div className={`text-[10px] font-bold uppercase tracking-[0.2em] ${item.color}`}>{item.label}</div>
                                                        <pre className="bg-[#1e1e1e] p-4 rounded-xl text-gray-200 border border-white/5 font-mono text-[13px] shadow-inner">{item.value}</pre>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeRightTab === 'result' && submitResult && (
                                    <div className={`p-8 rounded-2xl border transition-all ${submitResult.accepted ? 'bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.05)]' : 'bg-rose-500/5 border-rose-500/20 shadow-[0_0_40px_rgba(244,63,94,0.05)]'}`}>
                                        <div className={`text-3xl font-black mb-6 flex items-center gap-3 ${submitResult.accepted ? 'text-emerald-400' : 'text-rose-500'}`}>
                                            {submitResult.accepted ? <CheckCircle2 size={32}/> : <XCircle size={32}/>}
                                            {submitResult.accepted ? 'Accepted' : 'Wrong Answer'}
                                        </div>
                                        <div className="grid grid-cols-2 gap-8 text-sm">
                                            <div className="bg-white/5 p-4 rounded-xl">
                                                <div className="text-gray-500 text-[10px] font-bold uppercase mb-1">Runtime</div>
                                                <div className="text-white font-mono text-lg">{submitResult.runtime} <span className="text-xs text-gray-500">ms</span></div>
                                            </div>
                                            <div className="bg-white/5 p-4 rounded-xl">
                                                <div className="text-gray-500 text-[10px] font-bold uppercase mb-1">Memory</div>
                                                <div className="text-white font-mono text-lg">{submitResult.memory} <span className="text-xs text-gray-500">KB</span></div>
                                            </div>
                                            <div className="col-span-2 bg-white/5 p-4 rounded-xl border border-white/5">
                                                <div className="text-gray-500 text-[10px] font-bold uppercase mb-2">Progress</div>
                                                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full transition-all duration-1000 ${submitResult.accepted ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                                        style={{ width: `${(submitResult.passedTestCases / submitResult.totalTestCases) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <div className="mt-2 text-white font-medium flex justify-between items-center">
                                                    <span>Test Cases Passed</span>
                                                    <span>{submitResult.passedTestCases} / {submitResult.totalTestCases}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="h-16 bg-[#252525] border-t border-white/5 flex items-center justify-between px-6 shrink-0">
                        <button onClick={() => setActiveLeftTab('chatAI')} className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-all group">
                            <MessageSquare size={16} className="text-orange-500 group-hover:scale-110 transition-transform" />
                            AI Tutor
                        </button>
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
                /* Hide scrollbar for Chrome, Safari and Opera */
                .whitespace-nowrap::-webkit-scrollbar { display: none; }
                /* Hide scrollbar for IE, Edge and Firefox */
                .whitespace-nowrap { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

const Settings = ({size}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);

export default ProblemPage;