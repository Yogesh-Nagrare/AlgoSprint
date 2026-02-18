/**
 * MobileProblemPage.jsx
 *
 * Drop-in responsive wrapper for ProblemPage.
 * Usage in ProblemPage.jsx:
 *
 *   import MobileProblemPage from './MobileProblemPage';
 *
 *   // At the TOP of ProblemPage's return block, BEFORE the desktop <div>:
 *   const isMobile = useIsMobile();   // hook exported from this file
 *   if (isMobile) return <MobileProblemPage { ...all the props/state you already have } />;
 *
 * Props mirror all state + handlers from ProblemPage so nothing is duplicated.
 */

import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import ProblemDescription from '../components/Problemdescription';
import {
    Play, Send, Code2, FileText, History, Lightbulb,
    MessageSquare, Terminal, CheckCircle2, XCircle,
    RotateCcw, Copy, Settings as SettingsIcon,
    ChevronDown, Filter, Check,
    Timer as TimerIcon, Pause, AlertCircle, AlertTriangle,
    Rocket, X, Info
} from 'lucide-react';

// ─────────────────────────────────────────────
// Tiny hook — detects mobile breakpoint
// ─────────────────────────────────────────────
export function useIsMobile(breakpoint = 768) {
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint);
    useEffect(() => {
        const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
        const handler = (e) => setIsMobile(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, [breakpoint]);
    return isMobile;
}

const langMap = { cpp: 'C++', java: 'Java', javascript: 'JavaScript' };

// ─────────────────────────────────────────────
// Main mobile layout
// ─────────────────────────────────────────────
const MobileProblemPage = ({
    // ── Problem data ──
    problem,
    problemId,
    problemStatus,
    loading,

    // ── Code / language ──
    code,
    selectedLanguage,
    settings,
    editorRef,
    handleEditorChange,
    handleEditorDidMount,
    handleLanguageChange,
    handleResetCode,
    setSettings,

    // ── Run / Submit ──
    handleRun,
    handleInitialSubmitClick,
    runResult,
    submitResult,
    quota,

    // ── Console / tabs ──
    activeRightTab,
    setActiveRightTab,
    selectedTestCaseIndex,
    setSelectedTestCaseIndex,
    aiReview,
    showAIOverlay,
    setShowAIOverlay,
    runLimitWarning,
    setRunLimitWarning,

    // ── Timer ──
    elapsedTime,
    isTimerRunning,
    toggleTimer,
    handleResetTimer,
    formatTime,

    // ── Modals / overlays ──
    notification,
    setNotification,
    isSubmitModalOpen,
    setIsSubmitModalOpen,
    executeFinalSubmit,
    showSubmitOverlay,
    setShowSubmitOverlay,

    // ── Misc ──
    copiedId,
    handleCopy,
    getDifficultyColor,
    getStatusBadge,
    solutionLang,
    setSolutionLang,

    // ── Child components (passed as JSX) ──
    SubmissionHistoryComponent,
    ChatAiComponent,
    EditorialComponent,
    SubmissionResultOverlayComponent,
}) => {
    // Mobile uses a bottom-nav model: "problem" | "code" | "console"
    const [mobileTab, setMobileTab] = useState('problem');
    const [activeLeftTab, setActiveLeftTab] = useState('description');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const bottomTabs = [
        { id: 'problem', label: 'Problem', icon: <FileText size={25} /> },
        { id: 'code',    label: 'Code',    icon: <Code2    size={25} /> },
        { id: 'console', label: 'Console', icon: <Terminal size={25} /> },
    ];

    const leftTabs = [
        { id: 'description', label: 'Description', icon: <FileText      size={13}/> },
        { id: 'editorial',   label: 'Editorial',   icon: <Lightbulb     size={13}/> },
        { id: 'solutions',   label: 'Solutions',   icon: <Info          size={13}/> },
        { id: 'submissions', label: 'History',     icon: <History       size={13}/> },
        { id: 'chatAI',      label: 'AI Help',     icon: <MessageSquare size={13}/> },
    ];

    const consoleTabs = [
        { id: 'testcase', label: 'Testcase',   icon: <CheckCircle2  size={12}/> },
        { id: 'result',   label: 'Run Result', icon: <Terminal      size={12}/> },
        ...(aiReview ? [{ id: 'ai-review', label: 'AI Review', icon: <MessageSquare size={12}/> }] : []),
    ];

    return (
        <div className="flex flex-col h-screen bg-[#0f0f0f] text-gray-200 overflow-hidden font-sans">

            {/* ── TOP BAR ── */}
            <header className="flex items-center justify-between px-4 py-2 bg-[#1a1a1a] border-b border-white/5 shrink-0 z-20">
                <div className="flex items-center gap-2 min-w-0">
                    <a href="/" className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors shrink-0">
                        <ChevronDown size={16} className="rotate-90" />
                    </a>
                    <span className="font-semibold text-gray-100 text-sm truncate">{problem?.title}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {/* Timer pill */}
                    <div className="flex items-center gap-1.5 bg-white/5 pl-2 pr-1.5 py-1 rounded-lg border border-white/5">
                        <TimerIcon size={12} className={isTimerRunning ? 'text-orange-500' : 'text-gray-500'} />
                        <span className={`text-xs font-mono min-w-[42px] text-center ${isTimerRunning ? 'text-gray-200' : 'text-gray-500'}`}>
                            {formatTime(elapsedTime)}
                        </span>
                        <button onClick={toggleTimer} className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors">
                            {isTimerRunning ? <Pause size={10} fill="currentColor"/> : <Play size={10} fill="currentColor"/>}
                        </button>
                        <button onClick={handleResetTimer} className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors">
                            <RotateCcw size={10} />
                        </button>
                    </div>

                    {/* Server status */}
                    <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-white/5 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        Online
                    </div>
                </div>
            </header>

            {/* ── QUOTA BANNER ── */}
            <div className="flex items-center justify-between px-4 py-1.5 bg-[#1a1610] border-b border-amber-500/20 shrink-0">
                <div className="flex items-center gap-3">
                    <AlertCircle size={13} className="text-amber-500 shrink-0" />
                    <div className="flex items-center gap-2 text-[11px]">
                        <span className="text-amber-500 font-black uppercase tracking-wider">Quota</span>
                        <span className={`font-bold px-1.5 py-0.5 rounded border text-[10px] ${quota.runsLeft > 0 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border-rose-500/20'}`}>
                            Run: {quota.runsLeft}
                        </span>
                        <span className={`font-bold px-1.5 py-0.5 rounded border text-[10px] ${quota.submitsLeft > 0 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border-rose-500/20'}`}>
                            Submit: {quota.submitsLeft}
                        </span>
                    </div>
                </div>
                <button className="text-[10px] font-black uppercase tracking-wider text-amber-500 border border-amber-500/30 px-2 py-1 rounded-full hover:bg-amber-500 hover:text-black transition-all">
                    Upgrade
                </button>
            </div>

            {/* ── MAIN SCROLLABLE AREA ── */}
            <div className="flex-1 overflow-hidden relative">

                {/* PROBLEM PANEL */}
                <div className={`absolute inset-0 flex flex-col overflow-hidden transition-all duration-300 ${mobileTab === 'problem' ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none translate-y-4'}`}>
                    {/* Left tab bar */}
                    <div className="flex bg-[#252525] border-b border-white/5 overflow-x-auto scrollbar-hide shrink-0">
                        {leftTabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveLeftTab(tab.id)}
                                className={`flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-medium transition-all relative shrink-0 ${activeLeftTab === tab.id ? 'text-orange-500' : 'text-gray-400 hover:text-gray-200'}`}
                            >
                                {tab.icon}
                                {tab.label}
                                {activeLeftTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-orange-500" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 pb-safe">
                        {problem && (
                            <>
                                {activeLeftTab === 'description' && (
                                <ProblemDescription problem={problem} getStatusBadge={getStatusBadge} />
                                )}

                                {activeLeftTab === 'editorial'   && EditorialComponent}
                                {activeLeftTab === 'submissions' && SubmissionHistoryComponent}
                                {activeLeftTab === 'chatAI'      && ChatAiComponent}

                                {activeLeftTab === 'solutions' && (
                                    <div className="space-y-6 pb-8">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-xs font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
                                                <Code2 size={14} className="text-orange-500"/> Solutions
                                            </h2>
                                            <div className="relative group">
                                                <button className="flex items-center gap-1.5 px-2 py-1 bg-[#252525] border border-white/10 rounded-lg text-xs text-gray-300">
                                                    <Filter size={11}/> {solutionLang === 'all' ? 'All' : solutionLang} <ChevronDown size={11}/>
                                                </button>
                                                <div className="absolute right-0 top-full mt-1 w-40 bg-[#252525] border border-white/10 rounded-xl shadow-2xl overflow-hidden hidden group-hover:block z-50">
                                                    {['all', ...new Set(problem.referenceSolution?.map(s => s.language))].map(lang => (
                                                        <button key={lang} onClick={() => setSolutionLang(lang)}
                                                            className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 ${solutionLang === lang ? 'bg-orange-500/20 text-orange-400' : 'text-gray-400 hover:bg-white/5'}`}>
                                                            {lang === 'all' ? 'Show All' : lang}
                                                            {solutionLang === lang && <Check size={11} className="ml-auto"/>}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        {problem.referenceSolution?.filter(s => solutionLang === 'all' || s.language === solutionLang).map((sol, i) => (
                                            <div key={i} className="bg-[#141414] rounded-xl border border-white/10 overflow-hidden">
                                                <div className="flex items-center justify-between px-3 py-2 bg-[#1a1a1a] border-b border-white/5">
                                                    <span className="text-xs font-bold text-orange-400 uppercase">{sol.language}</span>
                                                    <button onClick={() => handleCopy(sol.completeCode, i)}
                                                        className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold border transition-all ${copiedId === i ? 'text-emerald-400 border-emerald-500/20' : 'text-gray-400 border-white/10 hover:text-white'}`}>
                                                        {copiedId === i ? <><Check size={10}/> Copied</> : <><Copy size={10}/> Copy</>}
                                                    </button>
                                                </div>
                                                <pre className="p-3 font-mono text-xs text-gray-300 overflow-x-auto"><code>{sol.completeCode}</code></pre>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* ── CODE PANEL ── */}
                <div className={`absolute inset-0 flex flex-col transition-all duration-300 ${mobileTab === 'code' ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none translate-y-4'}`}>
                    {/* Code top bar */}
                    <div className="flex items-center justify-between bg-[#252525] border-b border-white/5 px-3 py-2 shrink-0">
                        <div className="relative group">
                            <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-white/5 text-gray-300 text-xs font-semibold">
                                <Code2 size={13} className="text-orange-500"/>
                                {langMap[selectedLanguage]}
                                <ChevronDown size={12}/>
                            </button>
                            <ul className="absolute left-0 top-full mt-1 z-50 bg-[#2a2a2a] border border-white/10 rounded-lg shadow-2xl overflow-hidden hidden group-hover:block w-36">
                                {['javascript', 'java', 'cpp'].map(lang => (
                                    <li key={lang}>
                                        <button onClick={() => handleLanguageChange(lang)}
                                            className={`w-full text-left px-3 py-2 text-xs transition-colors ${selectedLanguage === lang ? 'bg-orange-500/10 text-orange-500' : 'hover:bg-white/5 text-gray-400'}`}>
                                            {langMap[lang]}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex items-center gap-1">
                            <button onClick={handleResetCode} className="p-1.5 text-gray-500 hover:text-white flex items-center gap-1">
                                <RotateCcw size={13}/>
                                <span className="text-[10px] font-bold uppercase hidden sm:inline">Reset</span>
                            </button>
                            <button onClick={() => handleCopy(code, 'main-editor')} className="p-1.5 text-gray-500 hover:text-white">
                                {copiedId === 'main-editor' ? <CheckCircle2 size={13} className="text-emerald-400"/> : <Copy size={13}/>}
                            </button>
                            <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className="p-1.5 text-gray-500 hover:text-white">
                                <SettingsIcon size={13}/>
                            </button>
                        </div>
                    </div>

                    {/* Settings drawer */}
                    {isSettingsOpen && (
                        <div className="bg-[#2a2a2a] border-b border-white/10 p-4 shrink-0 z-40">
                            <div className="grid grid-cols-2 gap-4 max-w-sm">
                                <div>
                                    <span className="text-[10px] text-gray-400 block mb-1">Font Size</span>
                                    <select value={settings.fontSize} onChange={e => setSettings({...settings, fontSize: Number(e.target.value)})}
                                        className="bg-[#1e1e1e] text-xs px-2 py-1 rounded border border-white/10 outline-none w-full">
                                        {[12,14,16,18,20].map(s => <option key={s} value={s}>{s}px</option>)}
                                    </select>
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-400 block mb-1">Tab Size</span>
                                    <div className="flex gap-1">
                                        {[2,4].map(s => (
                                            <button key={s} onClick={() => setSettings({...settings, tabSize: s})}
                                                className={`px-3 py-1 text-xs rounded ${settings.tabSize === s ? 'bg-orange-500 text-white' : 'bg-white/5 text-gray-400'}`}>
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-400 block mb-1">Word Wrap</span>
                                    <button onClick={() => setSettings({...settings, wordWrap: settings.wordWrap === 'on' ? 'off' : 'on'})}
                                        className={`px-3 py-1 text-xs rounded font-bold ${settings.wordWrap === 'on' ? 'text-orange-500 bg-orange-500/10' : 'text-gray-500 bg-white/5'}`}>
                                        {settings.wordWrap === 'on' ? 'On' : 'Off'}
                                    </button>
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-400 block mb-1">Theme</span>
                                    <div className="flex gap-1">
                                        {['vs-dark','light'].map(t => (
                                            <button key={t} onClick={() => setSettings({...settings, theme: t})}
                                                className={`px-2 py-1 text-[10px] rounded border ${settings.theme === t ? 'border-orange-500 text-orange-500' : 'border-white/5 text-gray-400'}`}>
                                                {t === 'vs-dark' ? 'Dark' : 'Light'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Monaco editor */}
                    <div className="flex-1 overflow-hidden">
                        <Editor
                            height="100%"
                            key={`mobile-${problemId}-${selectedLanguage}`}
                            language={selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage}
                            defaultValue={code}
                            onChange={handleEditorChange}
                            onMount={handleEditorDidMount}
                            theme={settings.theme}
                            options={{
                                fontSize: settings.fontSize,
                                minimap: { enabled: false },
                                tabSize: settings.tabSize,
                                wordWrap: settings.wordWrap,
                                padding: { top: 12 },
                                lineNumbersMinChars: 3,
                                smoothScrolling: true,
                                cursorSmoothCaretAnimation: 'on',
                                fontFamily: "'Fira Code', monospace",
                                automaticLayout: true,
                            }}
                        />
                    </div>

                    {/* ── RUN LIMIT WARNING + Run/Submit action bar ── */}
                    <div className="flex flex-col bg-[#252525] border-t border-white/5 shrink-0">
                        {/* Inline warning strip — only shows when run limit hit */}
                        {runLimitWarning && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <AlertTriangle size={12} className="text-amber-400 shrink-0" />
                                <span className="text-[11px] text-amber-300 font-medium flex-1">
                                    Run limit reached — showing AI analysis
                                </span>
                                <button
                                    onClick={() => setRunLimitWarning(false)}
                                    className="text-amber-500/60 hover:text-amber-300 transition-colors p-0.5"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        )}

                        {/* Run / Submit buttons */}
                        <div className="flex items-center justify-end gap-3 px-4 py-3">
                            <button
                                onClick={handleRun}
                                disabled={loading}
                                className="flex items-center gap-2 px-5 py-2 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 active:scale-95"
                            >
                                <Play size={13} fill="currentColor"/>
                                {loading ? 'Running…' : 'Run'}
                            </button>
                            <button
                                onClick={handleInitialSubmitClick}
                                disabled={loading}
                                className="flex items-center gap-2 px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-lg transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] disabled:opacity-50 active:scale-95"
                            >
                                <Send size={13}/>
                                {loading ? 'Processing…' : (quota.submitsLeft > 0 ? 'Submit' : 'AI Analysis')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── CONSOLE PANEL ── */}
                <div className={`absolute inset-0 flex flex-col bg-[#141414] transition-all duration-300 ${mobileTab === 'console' ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none translate-y-4'}`}>
                    {/* Console sub-tabs */}
                    <div className="flex items-center bg-[#1a1a1a] border-b border-white/5 px-2 shrink-0 overflow-x-auto scrollbar-hide">
                        {consoleTabs.map(tab => (
                            <button key={tab.id} onClick={() => setActiveRightTab(tab.id)}
                                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors relative shrink-0 ${activeRightTab === tab.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                                {tab.icon} {tab.label}
                                {activeRightTab === tab.id && (
                                    <div className={`absolute bottom-0 left-0 w-full h-[2px] ${tab.id === 'ai-review' ? 'bg-blue-500' : 'bg-orange-500'}`}/>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Console body */}
                    <div className="flex-1 overflow-y-auto p-4">

                        {/* TESTCASE */}
                        {activeRightTab === 'testcase' && (
                            <div className="space-y-4">
                                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                    {(runResult?.testCases || problem?.visibleTestCases || []).map((tc, idx) => {
                                        const statusColor = runResult
                                            ? (tc.status_id === 3 ? 'bg-emerald-500' : 'bg-rose-500')
                                            : 'bg-gray-600';
                                        return (
                                            <button key={idx} onClick={() => setSelectedTestCaseIndex(idx)}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border shrink-0 ${selectedTestCaseIndex === idx ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-transparent text-gray-500 hover:bg-white/5'}`}>
                                                {runResult && <span className={`w-1.5 h-1.5 rounded-full ${statusColor}`}/>}
                                                Case {idx + 1}
                                            </button>
                                        );
                                    })}
                                </div>
                                {(() => {
                                    const cur = runResult
                                        ? runResult.testCases?.[selectedTestCaseIndex]
                                        : problem?.visibleTestCases?.[selectedTestCaseIndex];
                                    if (!cur) return <p className="text-gray-500 text-xs">No test case selected</p>;
                                    return (
                                        <div className="space-y-3">
                                            {runResult && (
                                                <p className={`text-xs font-bold ${cur.status_id === 3 ? 'text-emerald-400' : 'text-rose-500'}`}>
                                                    {cur.status_id === 3 ? '✓ Passed' : '✗ Wrong Answer / Runtime Error'}
                                                </p>
                                            )}
                                            {[
                                                ['Input',    cur.stdin || cur.input],
                                                runResult && ['Output', cur.stdout || 'No output (Error)'],
                                                ['Expected', cur.expected_output || cur.output]
                                            ].filter(Boolean).map(([label, val]) => (
                                                <div key={label} className="space-y-1">
                                                    <p className="text-[10px] font-bold uppercase text-gray-500">{label}</p>
                                                    <div className={`p-3 rounded-lg font-mono text-xs border border-white/5 break-all ${label === 'Output' && !cur.stdout ? 'bg-rose-500/10 text-rose-400' : 'bg-[#1e1e1e] text-gray-300'}`}>
                                                        {val}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                        {/* RESULT */}
                        {activeRightTab === 'result' && (
                            <div>
                                {submitResult ? (
                                    <div className={`p-4 rounded-xl border ${submitResult.accepted ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                                        <p className={`text-lg font-bold mb-4 flex items-center gap-2 ${submitResult.accepted ? 'text-emerald-400' : 'text-rose-500'}`}>
                                            {submitResult.accepted ? <CheckCircle2 size={18}/> : <XCircle size={18}/>}
                                            {submitResult.accepted ? 'Accepted' : 'Wrong Answer'}
                                        </p>
                                        <div className="grid grid-cols-2 gap-3 text-xs">
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
                                                    <div className={`h-full ${submitResult.accepted ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                                        style={{ width: `${(submitResult.passedTestCases / submitResult.totalTestCases) * 100}%` }}/>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-40 text-gray-500 gap-2">
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                                            <Send size={18}/>
                                        </div>
                                        <p className="text-xs">Submit your code to see results</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* AI REVIEW tab (simple fallback inside console) */}
                        {activeRightTab === 'ai-review' && aiReview && (
                            <div className="space-y-4">
                                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-1.5 bg-blue-500/20 rounded-lg shrink-0">
                                            <AlertCircle className="text-blue-400" size={16}/>
                                        </div>
                                        <div>
                                            <p className="font-bold text-blue-400 text-sm mb-1">🤖 AI Code Review</p>
                                            <p className="text-xs text-gray-400 leading-relaxed">Your daily quota is exhausted. This is AI-powered static analysis.</p>
                                            <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded mt-2">
                                                <AlertTriangle size={11} className="text-amber-400"/>
                                                <span className="text-[10px] text-amber-400">NOT execution — AI reviewing your logic</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Re-open terminal overlay button */}
                                <button
                                    onClick={() => setShowAIOverlay(true)}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl text-xs font-bold text-blue-400 transition-all"
                                >
                                    <Terminal size={13}/>
                                    Open AI Terminal View
                                </button>

                                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4">
                                    <div className="whitespace-pre-wrap text-gray-300 text-sm leading-relaxed font-mono">{aiReview}</div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setActiveRightTab('testcase')}
                                        className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium">
                                        View Test Cases
                                    </button>
                                    <button className="flex-1 py-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg text-xs font-bold text-white">
                                        Upgrade
                                    </button>
                                </div>
                                <p className="text-center text-[10px] text-gray-500">Quota resets at midnight UTC</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── AI TERMINAL OVERLAY — covers full main area on mobile ── */}
                {showAIOverlay && aiReview && (
                    <div className="absolute inset-0 z-40 flex flex-col bg-[#0d0d0d] animate-in fade-in slide-in-from-bottom-4 duration-300 font-mono">

                        {/* macOS-style title bar */}
                        <div className="flex items-center justify-between px-4 py-3 bg-[#1a1a1a] border-b border-white/10 shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]"></div>
                                <div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]"></div>
                                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]"></div>
                            </div>
                            <div className="flex items-center gap-2 px-2.5 py-0.5 bg-black/30 rounded-md border border-white/5">
                                <Terminal size={10} className="text-gray-500" />
                                <span className="text-[10px] text-gray-400 tracking-wider">judge — static-analysis</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                                    <span className="text-[10px] text-blue-400 font-bold uppercase font-sans">AI Mode</span>
                                </div>
                                <button
                                    onClick={() => setShowAIOverlay(false)}
                                    className="p-1.5 rounded-md hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Terminal body */}
                        <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
                            {/* Prompt line */}
                            <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                                <span className="text-emerald-400 text-xs">judge@leetclone</span>
                                <span className="text-gray-600 text-xs">:</span>
                                <span className="text-blue-400 text-xs">~/submissions</span>
                                <span className="text-gray-600 text-xs">$</span>
                                <span className="text-gray-300 text-xs ml-1">run --static-analysis --ai</span>
                            </div>
                            <div className="border-t border-white/5 mb-4"></div>

                            {/* Colored AI output */}
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
                            <div className="flex items-center gap-1 mt-4">
                                <span className="text-emerald-400 text-xs">judge@leetclone</span>
                                <span className="text-gray-600 text-xs">:</span>
                                <span className="text-blue-400 text-xs">~/submissions</span>
                                <span className="text-gray-600 text-xs">$</span>
                                <span className="inline-block w-2 h-3.5 bg-gray-300 ml-1 animate-[blink_1s_step-end_infinite]"></span>
                            </div>
                        </div>

                        {/* Footer actions */}
                        <div
                            className="shrink-0 px-4 pt-3 border-t border-white/5 bg-[#111] space-y-3"
                            style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
                        >
                            <div className="flex gap-2 font-sans">
                                <button
                                    onClick={() => setShowAIOverlay(false)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold border border-white/5 text-gray-300 transition-all"
                                >
                                    <X size={12} /> Close
                                </button>
                                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl text-xs font-bold shadow-[0_0_15px_rgba(249,115,22,0.3)] text-white transition-all">
                                    <Rocket size={12} /> Unlock Real Execution
                                </button>
                            </div>
                            <p className="text-center text-[10px] text-gray-600">
                                ⚡ Static analysis only · Resets midnight UTC ·{' '}
                                <span className="text-blue-500/70">Gemini 2.5 Flash</span>
                            </p>
                        </div>
                    </div>
                )}

            </div>{/* end MAIN SCROLLABLE AREA */}

            {/* ── BOTTOM NAV ── */}
            <nav
                className="flex bg-[#1a1a1a] border-t border-white/10 shrink-0 z-30 h-25"
                style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
                {bottomTabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setMobileTab(tab.id)}
                        className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors ${mobileTab === tab.id ? 'text-orange-500' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        {tab.icon}
                        <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
                        {mobileTab === tab.id && <div className="w-4 h-[2px] bg-orange-500 rounded-full"/>}
                    </button>
                ))}
            </nav>

            {/* ── MODALS ── */}

            {/* Notification modal */}
            {notification && (
                <div className="fixed inset-0 z-[1000] flex items-end justify-center p-4 sm:items-center">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setNotification(null)}/>
                    <div className="relative bg-[#1a1a1a] border border-orange-500/30 rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center animate-in slide-in-from-bottom-4 duration-300 sm:zoom-in-95">
                        <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Rocket className="text-orange-500" size={32}/>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">{notification.msg}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">{notification.detail}</p>
                        <div className="flex flex-col gap-2">
                            <button className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl">Upgrade to Premium</button>
                            <button onClick={() => setNotification(null)} className="w-full py-2.5 bg-white/5 text-gray-400 rounded-xl text-sm">Maybe Later</button>
                        </div>
                        <button onClick={() => setNotification(null)} className="absolute top-3 right-3 text-gray-500 hover:text-white"><X size={18}/></button>
                    </div>
                </div>
            )}

            {/* Submit confirmation modal */}
            {isSubmitModalOpen && (
                <div className="fixed inset-0 z-[1100] flex items-end justify-center p-4 sm:items-center">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsSubmitModalOpen(false)}/>
                    <div className="relative bg-[#1a1a1a] border border-orange-500/30 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom-4 duration-200 sm:zoom-in-95">
                        <div className="h-1.5 w-full bg-gradient-to-r from-orange-600 via-amber-400 to-orange-600 animate-pulse"/>
                        <div className="p-6">
                            <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-500/20">
                                <AlertTriangle className="text-orange-500" size={24}/>
                            </div>
                            <h3 className="text-xl font-black text-white text-center mb-2">Final Submission?</h3>
                            <p className="text-gray-400 text-center text-sm leading-relaxed mb-4">
                                You have <span className="text-white font-bold">only 1 attempt</span> daily. Are you sure?
                            </p>
                            <div className="bg-white/5 rounded-xl p-3 border border-white/5 mb-5">
                                <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-2">Recommended:</p>
                                <ul className="space-y-1.5">
                                    <li className="flex items-center gap-2 text-xs text-gray-300">
                                        <div className="w-1 h-1 rounded-full bg-orange-500"/>
                                        <span>Use <span className="text-orange-400 font-bold">Run</span> to test visible cases first.</span>
                                    </li>
                                    <li className="flex items-center gap-2 text-xs text-gray-300">
                                        <div className="w-1 h-1 rounded-full bg-orange-500"/>
                                        Verify your logic before submitting.
                                    </li>
                                </ul>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setIsSubmitModalOpen(false)} className="flex-1 py-2.5 bg-white/5 text-gray-300 font-bold rounded-xl border border-white/10 text-sm">Go Back</button>
                                <button onClick={executeFinalSubmit} className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl text-sm shadow-[0_0_20px_rgba(249,115,22,0.4)] active:scale-95">Submit Now</button>
                            </div>
                        </div>
                        <button onClick={() => setIsSubmitModalOpen(false)} className="absolute top-3 right-3 text-gray-500 hover:text-white"><X size={18}/></button>
                    </div>
                </div>
            )}

            {/* Submission result overlay (pass-through from ProblemPage) */}
            {SubmissionResultOverlayComponent}

            <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
            `}</style>
        </div>
    );
};

export default MobileProblemPage;