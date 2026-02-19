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
import MobileProblemPage, { useIsMobile } from '../pages/MobileProblemPage';
import { useNavigate } from 'react-router';
import ProblemDescription from '../components/Problemdescription';
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
    Pause,
    AlertCircle,
    AlertTriangle,
    Rocket,
    X
} from 'lucide-react';
import SubmissionResultOverlay from '../components/SubmissionResultOverlay';
const langMap = {
    cpp: 'C++',
    java: 'Java',
    javascript: 'JavaScript'
};

const ProblemPage = () => {
    const dispatch = useDispatch();
    const { problemId } = useParams();
    const [problemStatus, setProblemStatus] = useState('untouched');
    const [copiedId, setCopiedId] = useState(null);
    const editorState = useSelector((state) => state.editor) || {};
    const userCode = editorState.userCode || {};
    const lastSelectedLanguage = editorState.lastSelectedLanguage || {};
    const [notification, setNotification] = useState(null);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false); // <--- ADD THIS
    const [showSubmitOverlay, setShowSubmitOverlay] = useState(false);
    // ✨ AI REVIEW STATE (NEW)
    const [aiReview, setAIReview] = useState(null);
    const [showAIOverlay, setShowAIOverlay] = useState(false); // ← ADD THIS

    // --- RESIZING LOGIC START ---
    const [leftWidth, setLeftWidth] = useState(50);
    const isResizing = useRef(false);
    // --- VERTICAL RESIZING (editor/console split) ---
    const [consoleHeight, setConsoleHeight] = useState(35); // % of right panel
    const isResizingConsole = useRef(false);

    const startResizingConsole = useCallback(() => {
        isResizingConsole.current = true;
        document.body.style.cursor = 'row-resize';
        document.body.style.userSelect = 'none';
    }, []);

    const stopResizingConsole = useCallback(() => {
        isResizingConsole.current = false;
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
    }, []);

    const resizeConsole = useCallback((e) => {
        if (!isResizingConsole.current) return;
        const rightPanel = document.getElementById('right-panel');
        if (!rightPanel) return;
        const rect = rightPanel.getBoundingClientRect();
        const newHeightPx = rect.bottom - e.clientY;
        const newHeightPct = (newHeightPx / rect.height) * 100;
        if (newHeightPct > 10 && newHeightPct < 95) {
            setConsoleHeight(newHeightPct);
        }
    }, []);

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
    const navigate = useNavigate();

    // useEffect(() => {
    //     window.addEventListener('mousemove', resize);
    //     window.addEventListener('mouseup', stopResizing);
    //     return () => {
    //         window.removeEventListener('mousemove', resize);
    //         window.removeEventListener('mouseup', stopResizing);
    //     };
    // }, [resize, stopResizing]);
    // // --- RESIZING LOGIC END ---
    
    useEffect(() => {
        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResizing);
        window.addEventListener('mousemove', resizeConsole);
        window.addEventListener('mouseup', stopResizingConsole);
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
            window.removeEventListener('mousemove', resizeConsole);
            window.removeEventListener('mouseup', stopResizingConsole);
        };
    }, [resize, stopResizing, resizeConsole, stopResizingConsole]);

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
    const selectedLanguageRef = useRef(selectedLanguage); // ✅ ADD THIS
    const [runLimitWarning, setRunLimitWarning] = useState(false);
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
    useEffect(() => {
    localStorage.setItem('editor_settings', JSON.stringify(settings));
    }, [settings]);

    // ✅ ADD THIS RIGHT BELOW
    useEffect(() => {
        selectedLanguageRef.current = selectedLanguage;
    }, [selectedLanguage]);
    
    // --- TIMER LOGIC START ---
    useEffect(() => {
        const startKey = `leetcode_timer_start_${problemId}`;
        const runningKey = `leetcode_timer_running_${problemId}`;
        const savedElapsedKey = `leetcode_timer_elapsed_${problemId}`;

        const isRunning = localStorage.getItem(runningKey) !== 'false';
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
            localStorage.setItem(runningKey, 'false');
            localStorage.setItem(savedElapsedKey, elapsedTime.toString());
            setIsTimerRunning(false);
        } else {
            const newStartTime = Date.now() - (elapsedTime * 1000);
            localStorage.setItem(startKey, newStartTime.toString());
            localStorage.setItem(runningKey, 'true');
            setIsTimerRunning(true);
        }
    };

    const handleResetTimer = () => {
        const startKey = `leetcode_timer_start_${problemId}`;
        const savedElapsedKey = `leetcode_timer_elapsed_${problemId}`;
        
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

    const showNotice = (msg, detail) => {
        setNotification({ msg, detail });
        setTimeout(() => setNotification(null), 10000);
    };

    const [quota, setQuota] = useState({ runsLeft: 1, submitsLeft: 1 });
    // const isMobile = useIsMobile(); // detects viewport < 768 px

    const fetchQuota = async () => {
        try {
            const response = await axiosClient.get(`/submission/quota/${problemId}`);
            setQuota(response.data);
        } catch (error) {
            console.error('Failed to fetch quota:', error);
        }
    };

    useEffect(() => {
        fetchQuota();
    }, [problemId]);

    // ✨✨✨ MODIFIED handleRun WITH AI FALLBACK ✨✨✨
    const handleRun = async () => {
        setLoading(true);
        setRunResult(null);
        setAIReview(null); // Clear previous AI review
        setShowAIOverlay(false); // ← ADD THIS
        setSelectedTestCaseIndex(0);
        setIsConsoleOpen(true);
        setActiveRightTab('testcase');
        setRunLimitWarning(false); // ← ADD THIS

        
        
        try {
            // Try normal run first
            const response = await axiosClient.post(`/submission/run/${problemId}`, {
                code,
                // language: selectedLanguage
                language: selectedLanguageRef.current, // ✅ use ref, not state
            });

            // ✨ CHECK IF QUOTA EXHAUSTED
            if (response.data.quotaExhausted) {
                console.log("🚫 Quota exhausted - Calling AI review");

                // Automatically call AI review endpoint
                const aiResponse = await axiosClient.post(`/submission/ai-review/${problemId}`, {
                    code,
                    language: selectedLanguage
                });

                // Set AI review and switch to AI tab
                setAIReview(aiResponse.data.aiReview);
                setShowAIOverlay(true);   // ← opens overlay on left panel
                setQuota(prev => ({ ...prev, runsLeft: 0 }));
                setRunLimitWarning(true);

            } else {
                // Normal execution result
                setRunResult(response.data);
                await fetchQuota();
            }

        } catch (error) {
            if (error.response?.status === 429) {
                setQuota(prev => ({ ...prev, runsLeft: 0 }));
                setRunLimitWarning(true);            } else {
                setRunResult({ success: false, error: 'Internal server error' });
            }
        } finally {
            setLoading(false);
        }
    };

    // const handleSubmitCode = async () => {
    //     setLoading(true);
    //     setSubmitResult(null);
    //     setIsConsoleOpen(true); 
    //     setActiveRightTab('result'); 
    //     try {
    //         const response = await axiosClient.post(`/submission/submit/${problemId}`, {
    //             code,
    //             language: selectedLanguage
    //         });
    //         setSubmitResult(response.data);
    //         setQuota(prev => ({ ...prev, submitsLeft: 0 }));
    //         if (response.data.problemStatus) setProblemStatus(response.data.problemStatus);
    //     } catch (error) {
    //         if (error.response?.status === 429) {
    //             setQuota(prev => ({ ...prev, submitsLeft: 0 }));
    //             showNotice("Daily Submission Limit Reached", error.response.data.detail);
    //         }
    //     } finally {
    //         setLoading(false);
    //     }
    // };
    // 1. Function to trigger the warning modal
    const handleInitialSubmitClick = () => {
        if (quota.submitsLeft > 0) {
            setIsSubmitModalOpen(true);
        } else {
            // If already 0, call directly so the 429/AI logic runs
            executeFinalSubmit();
        }
    };

    // 2. The actual API call logic
    const executeFinalSubmit = async () => {
        // setIsSubmitModalOpen(false); // Close the modal
        // setLoading(true);
        // setSubmitResult(null);
        // setAIReview(null);
        // setIsConsoleOpen(true); 
        // setActiveRightTab('result'); 
        // try {
        //     const response = await axiosClient.post(`/submission/submit/${problemId}`, {
        //         code,
        //         language: selectedLanguage
        //     });
            
        //     // Check if backend returned AI analysis fallback
        //     if (response.data.isAIAnalysis) {
        //         setAIReview(response.data.aiReview);
        //         setActiveRightTab('ai-review');
        //     } else {
        //         setSubmitResult(response.data);
        //         if (response.data.problemStatus) setProblemStatus(response.data.problemStatus);
        //     }
        //     await fetchQuota();
            setIsSubmitModalOpen(false);
    setLoading(true);
    setSubmitResult(null);
    setAIReview(null);
    // We keep the console logic but we will trigger the slide over the left panel
    try {
        const response = await axiosClient.post(`/submission/submit/${problemId}`, {
            code,
            // language: selectedLanguage
            language: selectedLanguageRef.current, // ✅ use ref, not state
        });
        
        if (response.data.isAIAnalysis) {
            setAIReview(response.data.aiReview);
            setActiveRightTab('ai-review');
            setIsConsoleOpen(true);
        } else {
            setSubmitResult(response.data);
            setShowSubmitOverlay(true); // <--- OPEN THE SLIDE OVER
            setActiveRightTab('result'); // Switch console to "Run Result"
            setIsConsoleOpen(true);      // Make sure the console is open
            if (response.data.problemStatus) setProblemStatus(response.data.problemStatus);
        }
        await fetchQuota();
        } catch (error) {
            if (error.response?.status === 429) {
                setQuota(prev => ({ ...prev, submitsLeft: 0 }));
                setRunLimitWarning(true);
            }
        } finally {
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
    const isMobile = useIsMobile();
if (isMobile) {
  return (
    <MobileProblemPage
      // ── problem ──
      problem={problem}
      problemId={problemId}
      problemStatus={problemStatus}
      loading={loading}

      // ── code / language ──
      code={code}
      selectedLanguage={selectedLanguage}
      settings={settings}
      editorRef={editorRef}
      handleEditorChange={handleEditorChange}
      handleEditorDidMount={handleEditorDidMount}
      handleLanguageChange={handleLanguageChange}
      handleResetCode={handleResetCode}
      setSettings={setSettings}

      // ── run / submit ──
      handleRun={handleRun}
      handleInitialSubmitClick={handleInitialSubmitClick}
      runResult={runResult}
      submitResult={submitResult}
      quota={quota}

      // ── console / tabs ──
      activeRightTab={activeRightTab}
      setActiveRightTab={setActiveRightTab}
      selectedTestCaseIndex={selectedTestCaseIndex}
      setSelectedTestCaseIndex={setSelectedTestCaseIndex}
      aiReview={aiReview}

      // ── timer ──
      elapsedTime={elapsedTime}
      isTimerRunning={isTimerRunning}
      toggleTimer={toggleTimer}
      handleResetTimer={handleResetTimer}
      formatTime={formatTime}

      // ── modals ──
      notification={notification}
      setNotification={setNotification}
      isSubmitModalOpen={isSubmitModalOpen}
      setIsSubmitModalOpen={setIsSubmitModalOpen}
      executeFinalSubmit={executeFinalSubmit}
      showSubmitOverlay={showSubmitOverlay}
      setShowSubmitOverlay={setShowSubmitOverlay}
      showAIOverlay={showAIOverlay}
        setShowAIOverlay={setShowAIOverlay}
        runLimitWarning={runLimitWarning}
        setRunLimitWarning={setRunLimitWarning}
      // ── misc ──
      copiedId={copiedId}
      handleCopy={handleCopy}
      getDifficultyColor={getDifficultyColor}
      getStatusBadge={getStatusBadge}
      solutionLang={solutionLang}
      setSolutionLang={setSolutionLang}

      // ── child components rendered as JSX ──
      // Pass the rendered components so MobileProblemPage doesn't need
      // to import them itself (they already receive their own props inside ProblemPage).
      SubmissionHistoryComponent={<SubmissionHistory problemId={problemId} />}
      ChatAiComponent={<ChatAi problem={problem} />}
      EditorialComponent={
        <Editorial
          secureUrl={problem?.secureUrl}
          thumbnailUrl={problem?.thumbnailUrl}
          duration={problem?.duration}
        />
      }
      SubmissionResultOverlayComponent={
        <SubmissionResultOverlay
          result={submitResult}
          isVisible={showSubmitOverlay}
          onClose={() => setShowSubmitOverlay(false)}
        />
      }
    />
  );
}
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
                <div className="flex items-center gap-2">

                {/* RUN */}
                <button
                    onClick={handleRun}
                    disabled={loading}
                    className="group flex items-center gap-2 px-5 py-2 rounded-xl bg-[#2a2a2a] hover:bg-[#333] border border-white/[0.09] hover:border-white/[0.17] text-[#bbb] hover:text-white text-[13px] font-semibold transition-all duration-150 disabled:opacity-45 disabled:cursor-not-allowed active:scale-[0.96]"
                >
                    <Play
                    size={12}
                    fill="#4ade80"
                    className="group-hover:scale-110 transition-transform duration-150"
                    />
                    {loading ? 'Running...' : 'Run'}
                </button>

                {/* SUBMIT */}
                <button
                    onClick={handleInitialSubmitClick}
                    disabled={loading}
                    className="group relative flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white text-[13px] font-bold border-none shadow-[0_0_16px_rgba(249,115,22,0.3),inset_0_1px_0_rgba(255,255,255,0.12)] hover:shadow-[0_0_28px_rgba(249,115,22,0.5),inset_0_1px_0_rgba(255,255,255,0.15)] hover:-translate-y-px transition-all duration-150 disabled:opacity-45 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none active:scale-[0.96] overflow-hidden"
                >
                    {/* shimmer sweep */}
                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-500 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

                    <Send
                    size={13}
                    className="group-hover:translate-x-px group-hover:-translate-y-px transition-transform duration-150"
                    />
                    {loading ? 'Processing...' : (quota.submitsLeft > 0 ? 'Submit' : 'AI Analysis')}
                </button>

                </div>
                
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white/5 pl-3 pr-2 py-1.5 rounded-lg border border-white/5 shadow-inner">
                        <TimerIcon size={14} className={isTimerRunning ? "text-orange-500" : "text-gray-500"} />
                        <span className={`text-sm font-mono font-medium min-w-[50px] text-center ${isTimerRunning ? "text-gray-200" : "text-gray-500"}`}>
                            {formatTime(elapsedTime)}
                        </span>
                        
                        <div className="w-[1px] h-4 bg-white/10 mx-1"></div>
                        
                        <button 
                            onClick={toggleTimer}
                            className="p-1.5 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors"
                            title={isTimerRunning ? "Pause Timer" : "Resume Timer"}
                        >
                            {isTimerRunning ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
                        </button>

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

            <div className="relative overflow-hidden px-6 py-2 bg-[#1a1610] border-b border-amber-500/20 flex items-center justify-between shrink-0 group">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>

                <div className="flex items-center gap-4 relative z-10">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                        <AlertCircle size={16} className="text-amber-500 animate-pulse" />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">
                                Daily Quota
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[11px] text-gray-400 font-medium">Run:</span>
                                <span className={`text-[12px] font-bold px-2 py-0.5 rounded border transition-all ${
                                    quota.runsLeft > 0 
                                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                                        : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                                }`}>
                                    {quota.runsLeft}
                                </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                                <span className="text-[11px] text-gray-400 font-medium">Submit:</span>
                                <span className={`text-[12px] font-bold px-2 py-0.5 rounded border transition-all ${
                                    quota.submitsLeft > 0 
                                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                                        : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                                }`}>
                                    {quota.submitsLeft}
                                </span>
                            </div>
                        </div>

                        <div className="hidden lg:flex items-center gap-2 ml-2 pl-4 border-l border-white/10">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_#f59e0b]"></div>
                            
                            <p className="text-[11px] font-bold italic tracking-tight animate-caution-blink">
                                <span className="text-amber-500 uppercase mr-1.5">Caution:</span>
                                <span className="text-amber-200/80">
                                    Limited attempts available. Verify your logic thoroughly before execution!
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                <button     onClick={() => navigate('/subscription')} className="relative z-10 flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500 transition-all duration-300 group/btn">
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 group-hover/btn:text-black">
                        Get Unlimited Access
                    </span>
                    <div className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center group-hover/btn:bg-black/20">
                        <ChevronDown size={10} className="-rotate-90 text-amber-500 group-hover/btn:text-black" />
                    </div>
                </button>
            </div>

            <style jsx="true">{`
                @keyframes caution-blink {
                    0%, 100% { opacity: 1; text-shadow: 0 0 8px rgba(245, 158, 11, 0.6); }
                    50% { opacity: 0.4; text-shadow: none; }
                }
                .animate-caution-blink {
                    animation: caution-blink 2s infinite ease-in-out;
                }
            `}</style>

            {notification && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-black/70 backdrop-blur-md animate-in fade-in duration-300" 
                        onClick={() => setNotification(null)}
                    />
                    
                    <div className="relative bg-[#1a1a1a] border border-orange-500/30 rounded-2xl shadow-[0_0_50px_rgba(249,115,22,0.15)] p-8 max-w-sm w-full text-center animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Rocket className="text-orange-500" size={40} />
                        </div>
                        
                        <h3 className="text-xl font-bold text-white mb-2">{notification.msg}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed mb-8">
                            {notification.detail}
                        </p>
                        
                        <div className="flex flex-col gap-3">
                            <button className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95">
                                Upgrade to Premium
                            </button>
                            <button 
                                onClick={() => setNotification(null)}
                                className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-400 font-medium rounded-xl transition-all"
                            >
                                Maybe Later
                            </button>
                        </div>

                        <button 
                            onClick={() => setNotification(null)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            )}
            {/* --- SUBMIT CONFIRMATION MODAL --- */}
            {isSubmitModalOpen && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsSubmitModalOpen(false)} />
                    <div className="relative bg-[#1a1a1a] border border-orange-500/30 rounded-2xl shadow-[0_0_50px_rgba(249,115,22,0.2)] max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="h-2 w-full bg-gradient-to-r from-orange-600 via-amber-400 to-orange-600 animate-pulse"></div>
                        <div className="p-8">
                            <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-orange-500/20">
                                <AlertTriangle className="text-orange-500" size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-white text-center mb-2 tracking-tight">Final Submission?</h3>
                            <p className="text-gray-400 text-center text-sm leading-relaxed mb-6">
                                You have <span className="text-white font-bold">only 1 attempt</span> daily. Hidden test cases are execution-heavy. Are you sure?
                            </p>
                            <div className="bg-white/5 rounded-xl p-4 border border-white/5 mb-8">
                                <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-3">Recommended Steps:</p>
                                <ul className="space-y-2">
                                    <li className="flex items-center gap-2 text-xs text-gray-300"><div className="w-1 h-1 rounded-full bg-orange-500"></div>Use <span className="text-orange-400 font-bold">Run</span> to test visible cases.</li>
                                    <li className="flex items-center gap-2 text-xs text-gray-300"><div className="w-1 h-1 rounded-full bg-orange-500"></div>Verify logic to save your daily chance.</li>
                                </ul>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setIsSubmitModalOpen(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-300 font-bold rounded-xl transition-all border border-white/10">Go Back</button>
                                <button onClick={executeFinalSubmit} className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl transition-all shadow-[0_0_20px_rgba(249,115,22,0.4)] active:scale-95">Submit Now</button>
                            </div>
                        </div>
                        <button onClick={() => setIsSubmitModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20} /></button>
                    </div>
                </div>
            )}

            <div className="flex-1 flex p-3 overflow-hidden gap-0">
                {/* LEFT PANEL */}
                <div 
                    style={{ width: `${leftWidth}%` }}
                    className="relative flex flex-col bg-[#1e1e1e] rounded-xl border border-white/10 overflow-hidden shadow-2xl min-w-[150px]"
                >
                    {/* LEFT PANEL */}
                    <SubmissionResultOverlay 
                        result={submitResult} 
                        isVisible={showSubmitOverlay} 
                        onClose={() => setShowSubmitOverlay(false)} 
                    />
                    {showAIOverlay && aiReview && (
                    <div className="absolute inset-0 z-50 flex flex-col bg-[#0d0d0d] animate-in fade-in slide-in-from-bottom-4 duration-400 font-mono">
                        <div className="flex items-center justify-between px-4 py-2.5 bg-[#1a1a1a] border-b border-white/10 shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]"></div>
                                <div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]"></div>
                                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]"></div>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-0.5 bg-black/30 rounded-md border border-white/5">
                                <Terminal size={11} className="text-gray-500" />
                                <span className="text-[11px] text-gray-400 tracking-wider font-mono">judge — static-analysis</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                                    
                                    <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest font-sans">AI Mode</span>
                                </div>
                                <button onClick={() => setShowAIOverlay(false)} className="p-1 rounded-md hover:bg-white/10 text-gray-500 hover:text-white transition-colors">
                                    <X size={15} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-emerald-400 text-xs">judge@AlogoSprint</span>
                                <span className="text-gray-600 text-xs">:</span>
                                <span className="text-blue-400 text-xs">~/submissions</span>
                                <span className="text-gray-600 text-xs">$</span>
                                <span className="text-gray-300 text-xs ml-1">run --static-analysis --ai</span>
                            </div>
                            <div className="border-t border-white/5 mb-4"></div>
                            <pre className="whitespace-pre-wrap text-xs leading-[1.9] text-gray-300 font-mono selection:bg-orange-500/20">
                                {aiReview.split('\n').map((line, i) => {
                                    if (line.startsWith('$ ')) return <span key={i} className="text-emerald-400 block">{line}</span>;
                                    if (line.includes('[COMPILE ERROR]') || line.includes('FAIL')) return <span key={i} className="text-rose-400 block">{line}</span>;
                                    if (line.includes('[COMPILE OK]') || line.includes('PASS') || line.includes('Likely Correct')) return <span key={i} className="text-emerald-400 block">{line}</span>;
                                    if (line.includes('[RUNNING') || line.includes('[VERDICT]')) return <span key={i} className="text-amber-400 font-bold block">{line}</span>;
                                    if (line.includes('RuntimeError') || line.includes('TypeError') || line.includes('error:') || line.includes('TLE')) return <span key={i} className="text-rose-300 block">{line}</span>;
                                    if (line.includes('[COMPLEXITY ANALYSIS]') || line.includes('[NOTE]')) return <span key={i} className="text-blue-400 block">{line}</span>;
                                    if (line.includes('Time:') || line.includes('Space:')) return <span key={i} className="text-purple-400 block">{line}</span>;
                                    if (line.includes('⚠')) return <span key={i} className="text-amber-300 block">{line}</span>;
                                    return <span key={i} className="block">{line}</span>;
                                })}
                            </pre>
                            <div className="flex items-center gap-1 mt-3">
                                <span className="text-emerald-400 text-xs">judge@AlogoSprint</span>
                                <span className="text-gray-600 text-xs">:</span>
                                <span className="text-blue-400 text-xs">~/submissions</span>
                                <span className="text-gray-600 text-xs">$</span>
                                <span className="inline-block w-2 h-3.5 bg-gray-300 ml-1 animate-[blink_1s_step-end_infinite]"></span>
                            </div>
                        </div>

                        <div className="shrink-0 px-5 pb-4 pt-3 border-t border-white/5 bg-[#111] space-y-3">
                            <div className="flex gap-2 font-sans">
                                <button onClick={() => setShowAIOverlay(false)} className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold border border-white/5 text-gray-300">
                                    <X size={12} /> Close
                                </button>
                                <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg text-xs font-bold text-white">
                                    <Rocket size={12} /> Unlock Real Execution
                                </button>
                            </div>
                            <p className="text-center text-[10px] text-gray-600 font-sans">
                                ⚡ Static analysis only · Quota resets midnight UTC ·
                                <span className="text-blue-500/70"> AI powered by Gemini 2.5 Flash</span>
                            </p>
                        </div>
                    </div>
                )}
                    {/* ✨ AI TERMINAL OVERLAY — covers left panel on run quota exhausted */}
                    {showAIOverlay && aiReview && (
                        <div className="absolute inset-0 z-50 flex flex-col bg-[#0d0d0d] animate-in fade-in slide-in-from-bottom-4 duration-400 font-mono">
                            {/* Header bar */}
                            <div className="flex items-center justify-between px-4 py-2.5 bg-[#1a1a1a] border-b border-white/10 shrink-0">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]"></div>
                                    <div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]"></div>
                                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]"></div>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-0.5 bg-black/30 rounded-md border border-white/5">
                                    <Terminal size={11} className="text-gray-500" />
                                    <span className="text-[11px] text-gray-400 tracking-wider font-mono">judge — static-analysis</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button     onClick={() => navigate('/subscription')} className="relative z-10 flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500 transition-all duration-300 group/btn">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 group-hover/btn:text-black">
                                            Get Unlimited Access
                                        </span>
                                        <div className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center group-hover/btn:bg-black/20">
                                            <ChevronDown size={10} className="-rotate-90 text-amber-500 group-hover/btn:text-black" />
                                        </div>
                                    </button>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                                        <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest font-sans">AI Mode</span>
                                    </div>
                                    <button
                                        onClick={() => setShowAIOverlay(false)}
                                        className="p-1 rounded-md hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
                                        title="Close AI Review"
                                    >
                                        <X size={15} />
                                    </button>
                                </div>
                            </div>

                            {/* Terminal body — scrollable */}
                            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                                {/* Prompt line */}
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-emerald-400 text-xs">judge@AlogoSprint</span>
                                    <span className="text-gray-600 text-xs">:</span>
                                    <span className="text-blue-400 text-xs">~/submissions</span>
                                    <span className="text-gray-600 text-xs">$</span>
                                    <span className="text-gray-300 text-xs ml-1">run --static-analysis --ai</span>
                                </div>
                                <div className="border-t border-white/5 mb-4"></div>

                                {/* Colored output */}
                                <pre className="whitespace-pre-wrap text-xs leading-[1.9] text-gray-300 font-mono selection:bg-orange-500/20">
                                    {aiReview.split('\n').map((line, i) => {
                                        if (line.startsWith('$ '))
                                            return <span key={i} className="text-emerald-400 block">{line}</span>;
                                        if (line.includes('[COMPILE ERROR]') || line.includes('[BUILD FAILED]') || line.includes('FAIL'))
                                            return <span key={i} className="text-rose-400 block">{line}</span>;
                                        if (line.includes('[COMPILE OK]') || line.includes('PASS') || line.includes('Likely Correct'))
                                            return <span key={i} className="text-emerald-400 block">{line}</span>;
                                        if (line.includes('[RUNNING') || line.includes('[VERDICT]'))
                                            return <span key={i} className="text-amber-400 font-bold block">{line}</span>;
                                        if (line.includes('[STDERR]') || line.includes('RuntimeError') || line.includes('TypeError') || line.includes('Exception') || line.includes('error:') || line.includes('SIGSEGV') || line.includes('TLE'))
                                            return <span key={i} className="text-rose-300 block">{line}</span>;
                                        if (line.includes('[COMPLEXITY ANALYSIS]') || line.includes('[NOTE]'))
                                            return <span key={i} className="text-blue-400 block">{line}</span>;
                                        if (line.includes('Time:') || line.includes('Space:'))
                                            return <span key={i} className="text-purple-400 block">{line}</span>;
                                        if (line.includes('├─') || line.includes('└─'))
                                            return <span key={i} className="text-gray-400 block">{line}</span>;
                                        if (line.startsWith('━') || line.startsWith('─'))
                                            return <span key={i} className="text-white/10 block">{line}</span>;
                                        if (line.includes('stdin:') || line.includes('expected:') || line.includes('got:'))
                                            return <span key={i} className="text-cyan-400 block">{line}</span>;
                                        if (line.includes('⚠'))
                                            return <span key={i} className="text-amber-300 block">{line}</span>;
                                        return <span key={i} className="block">{line}</span>;
                                    })}
                                </pre>

                                {/* Blinking cursor */}
                                <div className="flex items-center gap-1 mt-3">
                                    <span className="text-emerald-400 text-xs">judge@AlogoSprint</span>
                                    <span className="text-gray-600 text-xs">:</span>
                                    <span className="text-blue-400 text-xs">~/submissions</span>
                                    <span className="text-gray-600 text-xs">$</span>
                                    <span className="inline-block w-2 h-3.5 bg-gray-300 ml-1 animate-[blink_1s_step-end_infinite]"></span>
                                </div>
                            </div>

                            {/* Footer actions */}
                            <div className="shrink-0 px-5 pb-4 pt-3 border-t border-white/5 bg-[#111] space-y-3">
                                <div className="flex gap-2 font-sans">
                                    <button
                                        onClick={() => setShowAIOverlay(false)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-all border border-white/5 hover:border-white/10 text-gray-300"
                                    >
                                        <X size={12} />
                                        Close
                                    </button>
                                     <button     onClick={() => navigate('/subscription')} className="relative z-10 flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500 transition-all duration-300 group/btn">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 group-hover/btn:text-black">
                                            Get Unlimited Access
                                        </span>
                                        <div className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center group-hover/btn:bg-black/20">
                                            <ChevronDown size={10} className="-rotate-90 text-amber-500 group-hover/btn:text-black" />
                                        </div>
                                    </button>
                                </div>
                                <p className="text-center text-[10px] text-gray-600 font-sans">
                                    ⚡ Static analysis only &nbsp;·&nbsp; Quota resets midnight UTC &nbsp;·&nbsp;
                                    <span className="text-blue-500/70">AI powered by Gemini 2.5 Flash</span>
                                </p>
                            </div>
                        </div>
                    )}
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
                                <ProblemDescription problem={problem} getStatusBadge={getStatusBadge} />
                                )}
                                {activeLeftTab === 'editorial' && <Editorial secureUrl={problem.secureUrl} thumbnailUrl={problem.thumbnailUrl} duration={problem.duration}/>}
                                {activeLeftTab === 'submissions' && <SubmissionHistory problemId={problemId} />}
                                {activeLeftTab === 'chatAI' && <ChatAi problem={problem} />}
                                
                                {activeLeftTab === 'solutions' && (
                                    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="flex items-center justify-between mb-6 shrink-0 sticky top-0 bg-[#1e1e1e] z-10 py-2 border-b border-white/5">
                                            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
                                                <Code2 size={16} className="text-orange-500"/>
                                                Solutions
                                            </h2>
                                            
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

                                        <div className="space-y-8 pb-10">
                                            {problem.referenceSolution
                                                ?.filter(sol => solutionLang === 'all' || sol.language === solutionLang)
                                                .map((sol, i) => {
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
                                                            <div className={`absolute -inset-1 bg-gradient-to-r ${style.glow} to-transparent opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500`}></div>
                                                            
                                                            <div className="relative bg-[#141414] rounded-xl border border-white/10 overflow-hidden shadow-xl transition-all hover:border-white/20">
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

                                                                <div className="relative bg-[#0a0a0a] group/code">
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

                <div 
                    onMouseDown={startResizing}
                    className="w-1.5 h-full cursor-col-resize hover:bg-orange-500/30 transition-colors flex items-center justify-center group shrink-0"
                >
                    <div className="w-[1px] h-10 bg-white/10 group-hover:bg-orange-500 group-active:h-full transition-all" />
                </div>

                {/* RIGHT PANEL */}
                <div 
                    id="right-panel"
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
                            <div style={{ height: isConsoleOpen ? `${100 - consoleHeight}%` : '100%' }} className="w-full transition-none">                            <Editor
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
                        
            {isConsoleOpen && (
                <>
                    {/* ── VERTICAL DRAG HANDLE ── */}
                    <div
                        onMouseDown={startResizingConsole}
                        className="h-2 w-full cursor-row-resize flex items-center justify-center group shrink-0 hover:bg-orange-500/20 transition-colors"
                    >
                        <div className="w-16 h-[3px] rounded-full bg-white/10 group-hover:bg-orange-500 group-hover:w-24 group-active:w-full transition-all duration-150" />
                    </div>

                    <div
                        style={{ height: `${consoleHeight}%` }}
                        className="flex flex-col border-t border-white/10 bg-[#141414]"
                    >
                        {/* ✨✨✨ CONSOLE TABS WITH AI REVIEW TAB ✨✨✨ */}
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
                                {aiReview && (
                                    <button 
                                        onClick={() => setActiveRightTab('ai-review')}
                                        className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider h-full border-b-2 transition-colors ${activeRightTab === 'ai-review' ? 'text-white border-blue-500' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
                                    >
                                        <MessageSquare size={12} /> AI Review
                                    </button>
                                )}
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

                            {/* ✨✨✨ AI REVIEW TAB CONTENT ✨✨✨ */}
                            {activeRightTab === 'ai-review' && aiReview && (
                                <div className="space-y-3 font-mono">
                                    
                                    {/* Terminal Header Bar */}
                                    <div className="bg-[#1a1a1a] rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                                        {/* macOS-style title bar */}
                                        <div className="flex items-center justify-between px-4 py-2.5 bg-[#252525] border-b border-white/5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]"></div>
                                                <div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]"></div>
                                                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]"></div>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-0.5 bg-black/30 rounded-md border border-white/5">
                                                <Terminal size={11} className="text-gray-500" />
                                                <span className="text-[11px] text-gray-400 tracking-wider">judge — static-analysis</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                                                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">AI Mode</span>
                                            </div>
                                        </div>

                                        {/* Terminal Body */}
                                        <div className="p-4 bg-[#0d0d0d] min-h-[200px]">
                                            {/* Prompt line */}
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-emerald-400 text-xs">judge@AlogoSprint</span>
                                                <span className="text-gray-600 text-xs">:</span>
                                                <span className="text-blue-400 text-xs">~/submissions</span>
                                                <span className="text-gray-600 text-xs">$</span>
                                                <span className="text-gray-300 text-xs ml-1 animate-pulse">run --static-analysis --ai</span>
                                            </div>

                                            {/* Divider */}
                                            <div className="border-t border-white/5 mb-3"></div>

                                            {/* AI Output */}
                                            <pre className="whitespace-pre-wrap text-xs leading-[1.8] text-gray-300 font-mono
                                                [&>*]:block
                                                selection:bg-orange-500/20"
                                                style={{
                                                    // Syntax-highlight key terminal tokens via CSS-in-JS
                                                    // We'll handle coloring via a render function below
                                                }}
                                            >
                                                {aiReview.split('\n').map((line, i) => {
                                                    // Color rules matching terminal output patterns
                                                    if (line.startsWith('$ '))
                                                        return <span key={i} className="text-emerald-400 block">{line}</span>;
                                                    if (line.includes('[COMPILE ERROR]') || line.includes('[BUILD FAILED]') || line.includes('FAIL'))
                                                        return <span key={i} className="text-rose-400 block">{line}</span>;
                                                    if (line.includes('[COMPILE OK]') || line.includes('PASS') || line.includes('Likely Correct'))
                                                        return <span key={i} className="text-emerald-400 block">{line}</span>;
                                                    if (line.includes('[RUNNING') || line.includes('[VERDICT]'))
                                                        return <span key={i} className="text-amber-400 font-bold block">{line}</span>;
                                                    if (line.includes('[STDERR]') || line.includes('RuntimeError') || line.includes('TypeError') || line.includes('Exception') || line.includes('error:') || line.includes('SIGSEGV') || line.includes('TLE'))
                                                        return <span key={i} className="text-rose-300 block">{line}</span>;
                                                    if (line.includes('[COMPLEXITY ANALYSIS]') || line.includes('[NOTE]'))
                                                        return <span key={i} className="text-blue-400 block">{line}</span>;
                                                    if (line.includes('Time:') || line.includes('Space:'))
                                                        return <span key={i} className="text-purple-400 block">{line}</span>;
                                                    if (line.includes('├─') || line.includes('└─'))
                                                        return <span key={i} className="text-gray-400 block">{line}</span>;
                                                    if (line.startsWith('━') || line.startsWith('─'))
                                                        return <span key={i} className="text-white/10 block">{line}</span>;
                                                    if (line.includes('stdin:') || line.includes('expected:') || line.includes('got:'))
                                                        return <span key={i} className="text-cyan-400 block">{line}</span>;
                                                    if (line.includes('⚠'))
                                                        return <span key={i} className="text-amber-300 block">{line}</span>;
                                                    return <span key={i} className="block">{line}</span>;
                                                })}
                                            </pre>

                                            {/* Blinking cursor */}
                                            <div className="flex items-center gap-1 mt-3">
                                                <span className="text-emerald-400 text-xs">judge@AlogoSprint</span>
                                                <span className="text-gray-600 text-xs">:</span>
                                                <span className="text-blue-400 text-xs">~/submissions</span>
                                                <span className="text-gray-600 text-xs">$</span>
                                                <span className="inline-block w-2 h-3.5 bg-gray-300 ml-1 animate-[blink_1s_step-end_infinite]"></span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Row */}
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setActiveRightTab('testcase')}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-all border border-white/5 hover:border-white/10 font-sans"
                                        >
                                            <CheckCircle2 size={12} className="text-gray-400"/>
                                            View Test Cases
                                        </button>
                                        <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-lg text-xs font-bold shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all font-sans">
                                            <Rocket size={12}/>
                                            Unlock Real Execution
                                        </button>
                                    </div>

                                    {/* Footer */}
                                    <p className="text-center text-[10px] text-gray-600 font-sans">
                                        ⚡ Static analysis only &nbsp;·&nbsp; Quota resets midnight UTC &nbsp;·&nbsp; 
                                        <span className="text-blue-500/70">AI powered by Gemini 2.5 Flash</span>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
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
                         {/* ✨ RUN LIMIT WARNING — sits between left buttons and run/submit
                        {runLimitWarning && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/25 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <AlertTriangle size={13} className="text-amber-400 shrink-0" />
                                <span className="text-[11px] text-amber-300 font-medium">
                                    Run limit reached — showing AI analysis
                                </span>
                                <button
                                    onClick={() => setRunLimitWarning(false)}
                                    className="ml-1 text-amber-500/60 hover:text-amber-300 transition-colors"
                                >
                                    <X size={11} />
                                </button>
                            </div>
                        )} */}
                        {runLimitWarning && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/25 animate-in fade-in duration-300">
                                <AlertTriangle size={13} className="text-amber-400 shrink-0" />
                                <span className="text-[11px] text-amber-300 font-medium">
                                    Run limit reached — showing AI analysis
                                </span>
                                <button
                                    onClick={() => setRunLimitWarning(false)}
                                    className="ml-1 text-amber-500/60 hover:text-amber-300 transition-colors"
                                >
                                    <X size={11} />
                                </button>
                            </div>
                        )}
                        <div className="flex gap-3">
                            <button onClick={handleRun} disabled={loading} className="flex items-center gap-2 px-6 py-2 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 active:scale-95">
                                <Play size={14} fill="currentColor" />
                                {loading ? 'Running...' : 'Run'}
                            </button>
                            {/* <button onClick={handleSubmitCode} disabled={loading} className="flex items-center gap-2 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-lg transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] disabled:opacity-50 active:scale-95">
                                <Send size={14} />
                                {loading ? 'Submitting...' : 'Submit'}
                            </button> */}
                            <button 
                                onClick={handleInitialSubmitClick} // <--- UPDATE THIS LINE
                                disabled={loading} 
                                className="flex items-center gap-2 px-6 py-2 bg-orange-500 hover:bg-orange-600 ..."
                            >
                                <Send size={14} />
                                {loading ? 'Processing...' : (quota.submitsLeft > 0 ? 'Submit' : 'AI Analysis')}
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
                @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
            `}</style>
            
        </div>
    );
};

export default ProblemPage;