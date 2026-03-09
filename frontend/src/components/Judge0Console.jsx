// components/Judge0Console.jsx
// ─── Props ────────────────────────────────────────────────────────────────────
//   result         - runCode API response   (null = not run yet)
//   submitResult   - submitCode response    (null = not submitted yet)
//   isRunning      - bool: Judge0 call in progress
//   isSubmitting   - bool
//   isSyntaxChecking - bool: local compiler check in progress (shows before Judge0)
//   syntaxErrors   - [{line, col, type, message}] from local compiler
//   isOpen         - bool
//   onToggle       - () => void
//   height         - string default "320px"

import { useState, useEffect, useRef } from "react";

// ─── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
    accepted:              { label: "Accepted",               color: "#00b8a3", bg: "#00b8a310", icon: "✓" },
    wrong:                 { label: "Wrong Answer",           color: "#ef4743", bg: "#ef474310", icon: "✗" },
    wrong_answer:          { label: "Wrong Answer",           color: "#ef4743", bg: "#ef474310", icon: "✗" },
    compilation_error:     { label: "Compilation Error",      color: "#ffa116", bg: "#ffa11610", icon: "⚠" },
    runtime_error:         { label: "Runtime Error",          color: "#ef4743", bg: "#ef474310", icon: "✗" },
    time_limit_exceeded:   { label: "Time Limit Exceeded",    color: "#ffa116", bg: "#ffa11610", icon: "⏱" },
    memory_limit_exceeded: { label: "Memory Limit Exceeded",  color: "#ffa116", bg: "#ffa11610", icon: "⚠" },
    error:                 { label: "Error",                  color: "#ef4743", bg: "#ef474310", icon: "✗" },
    pending:               { label: "Running…",               color: "#a8b3cf", bg: "#a8b3cf10", icon: "⋯" },
    passed:                { label: "Passed",                 color: "#00b8a3", bg: "#00b8a310", icon: "✓" },
    judge_unavailable:     { label: "Judge Unavailable",      color: "#ffa116", bg: "#ffa11610", icon: "⚡" },
    syntax_error:          { label: "Syntax Error",           color: "#ffa116", bg: "#ffa11610", icon: "⚠" },
};

const getStatus = (key) =>
    STATUS_CONFIG[key] || { label: key, color: "#a8b3cf", bg: "#a8b3cf10", icon: "?" };

// ─── Parse compiler output into [{line,col,type,message}] ─────────────────────
const parseErrorLines = (errorText = "") => {
    const items = [];
    const regex = /(?:line\s+)?(\d+)(?::(\d+))?:\s*(error|warning|note):\s*(.+)/gi;
    let m;
    while ((m = regex.exec(errorText)) !== null) {
        items.push({
            line: parseInt(m[1]),
            col:  m[2] ? parseInt(m[2]) : null,
            type: m[3].toLowerCase(),
            message: m[4].trim(),
        });
    }
    return items;
};

// ─── Sub-components ────────────────────────────────────────────────────────────
const Label = ({ children }) => (
    <p style={{
        margin: "0 0 8px", fontSize: 11, fontWeight: 700,
        color: "#6b7a9f", textTransform: "uppercase", letterSpacing: "0.08em",
        fontFamily: "monospace",
    }}>{children}</p>
);

const CodeBlock = ({ value, placeholder = "—", color }) => (
    <pre style={{
        margin: 0, padding: "12px 16px", borderRadius: 8,
        background: "#0d1117", fontFamily: "'JetBrains Mono', monospace",
        fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap",
        wordBreak: "break-all", minHeight: 40,
        color: color || (value ? "#e4e8f0" : "#3d4a63"),
    }}>{value || placeholder}</pre>
);

const StatChip = ({ label, value }) => (
    <div style={{
        display: "inline-flex", flexDirection: "column", alignItems: "center",
        background: "#0d1117", borderRadius: 8, padding: "8px 20px", minWidth: 100,
    }}>
        <span style={{ fontSize: 11, color: "#6b7a9f", fontFamily: "monospace" }}>{label}</span>
        <span style={{ fontSize: 16, fontWeight: 700, color: "#e4e8f0", fontFamily: "monospace" }}>{value}</span>
    </div>
);

const Skeleton = ({ label = "Running…" }) => (
    <div style={{ padding: "20px 16px" }}>
        <p style={{ margin: "0 0 14px", fontSize: 12, color: "#6b7a9f", fontFamily: "monospace" }}>
            <span style={{ marginRight: 8, animation: "blink 1s ease-in-out infinite", display: "inline-block" }}>●</span>
            {label}
        </p>
        {[75, 55, 85, 40].map((w, i) => (
            <div key={i} style={{
                height: 13, borderRadius: 6, marginBottom: 10, width: `${w}%`,
                background: "#1e2a3a", animation: "pulse 1.5s ease-in-out infinite",
                animationDelay: `${i * 0.12}s`,
            }} />
        ))}
        <style>{`
            @keyframes pulse{0%,100%{opacity:.35}50%{opacity:.9}}
            @keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}
        `}</style>
    </div>
);

// ─── Compiler error pill row ──────────────────────────────────────────────────
const ErrorPill = ({ item }) => (
    <div style={{
        display: "flex", gap: 10, alignItems: "flex-start",
        padding: "7px 12px", borderRadius: 6, marginBottom: 5,
        background: item.type === "error" ? "#ef474312" : "#ffa11612",
        borderLeft: `3px solid ${item.type === "error" ? "#ef4743" : "#ffa116"}`,
        fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
    }}>
        <span style={{
            color: item.type === "error" ? "#ef4743" : "#ffa116",
            fontWeight: 700, minWidth: 56, flexShrink: 0,
        }}>
            {item.type === "error" ? "Error" : "Warn"}{item.line ? ` L${item.line}${item.col ? `:${item.col}` : ""}` : ""}
        </span>
        <span style={{ color: "#e4e8f0" }}>{item.message}</span>
    </div>
);

const Tab = ({ label, active, onClick }) => (
    <button onClick={onClick} style={{
        background: "none", border: "none", cursor: "pointer",
        padding: "10px 16px", fontSize: 13, fontWeight: 600,
        fontFamily: "'JetBrains Mono', monospace",
        color: active ? "#e4e8f0" : "#6b7a9f",
        borderBottom: active ? "2px solid #00b8a3" : "2px solid transparent",
        transition: "all 0.15s",
    }}>{label}</button>
);

// ─── Main component ───────────────────────────────────────────────────────────
export default function Judge0Console({
    result           = null,
    submitResult     = null,
    isRunning        = false,
    isSubmitting     = false,
    isSyntaxChecking = false,   // ← NEW: local compiler check in progress
    syntaxErrors     = [],      // ← NEW: [{line,col,type,message}] from local compiler
    isOpen           = true,
    onToggle,
    height           = "320px",
}) {
    const [activeTab,  setActiveTab]  = useState("output");
    const [activeCase, setActiveCase] = useState(0);
    const scrollRef = useRef(null);

    const isJudgeRunning = isRunning || isSubmitting;
    const loading        = isSyntaxChecking || isJudgeRunning;

    // Separate the two phases
    const phase = isSyntaxChecking ? 'syntax'
                : isJudgeRunning   ? 'judge'
                : null;

    const hasSyntaxErrors = syntaxErrors.some(e => e.type === 'error');

    // Reset on new result
    useEffect(() => {
        if (result || submitResult) {
            setActiveCase(0);
            setActiveTab("output");
        }
    }, [result, submitResult]);

    // Auto-switch to errors tab when syntax errors arrive
    useEffect(() => {
        if (hasSyntaxErrors && !isJudgeRunning) setActiveTab("errors");
    }, [hasSyntaxErrors, isJudgeRunning]);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }, [result, submitResult, activeTab, activeCase, syntaxErrors]);

    const hasRunResult    = result && !isJudgeRunning;
    const hasSubmitResult = submitResult && !isJudgeRunning;
    const judgeUnavailable = result?.isJudgeUnavailable || submitResult?.isJudgeUnavailable;

    const overallStatus = hasSubmitResult
        ? submitResult.status
        : hasRunResult
        ? (result.success ? "accepted" : (result.testCases?.[0]?.testStatus || "error"))
        : hasSyntaxErrors && !loading
        ? "syntax_error"
        : null;

    const statusCfg = overallStatus ? getStatus(overallStatus) : null;
    const testCases = result?.testCases || [];
    const currentCase = testCases[activeCase] || null;

    const globalError =
        result?.errorMessage ||
        submitResult?.errorMessage ||
        (currentCase?.testStatus === "compilation_error" ? currentCase?.error : null);

    // Merge: syntax errors from local compiler + any from Judge0
    const allSyntaxErrors = syntaxErrors.length > 0
        ? syntaxErrors
        : parseErrorLines(globalError || "");

    const showErrorsTab = allSyntaxErrors.length > 0 || judgeUnavailable;

    return (
        <div style={{
            display: "flex", flexDirection: "column",
            background: "#111827", borderTop: "1px solid #1e2a3a",
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            height: isOpen ? height : "42px",
            overflow: "hidden", transition: "height 0.2s ease",
        }}>

            {/* ── Tab bar ─────────────────────────────────────────────────── */}
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                borderBottom: "1px solid #1e2a3a", minHeight: 42, flexShrink: 0,
                padding: "0 8px 0 0",
            }}>
                <div style={{ display: "flex" }}>
                    <Tab label="Output"   active={activeTab === "output"}   onClick={() => setActiveTab("output")} />
                    <Tab label="Expected" active={activeTab === "expected"} onClick={() => setActiveTab("expected")} />
                    <Tab label="Stdin"    active={activeTab === "stdin"}    onClick={() => setActiveTab("stdin")} />
                    {showErrorsTab && (
                        <Tab
                            label={`Errors${allSyntaxErrors.length ? ` (${allSyntaxErrors.filter(e=>e.type==='error').length})` : ''}`}
                            active={activeTab === "errors"}
                            onClick={() => setActiveTab("errors")}
                        />
                    )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {/* Phase indicator */}
                    {phase === 'syntax' && (
                        <span style={{ fontSize: 11, color: "#ffa116", display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ animation: "blink 0.8s ease-in-out infinite", display: "inline-block" }}>●</span>
                            Checking syntax…
                            <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.15}}`}</style>
                        </span>
                    )}
                    {phase === 'judge' && (
                        <span style={{ fontSize: 11, color: "#00b8a3", display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ animation: "blink 1s ease-in-out infinite", display: "inline-block" }}>●</span>
                            Running on Judge0…
                        </span>
                    )}

                    {/* Status badge */}
                    {statusCfg && !loading && (
                        <span style={{
                            fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                            color: statusCfg.color, background: statusCfg.bg,
                            border: `1px solid ${statusCfg.color}40`,
                        }}>
                            {statusCfg.icon} {statusCfg.label}
                        </span>
                    )}

                    <button onClick={onToggle} style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: "#6b7a9f", fontSize: 18, padding: "0 4px", lineHeight: 1,
                    }}>{isOpen ? "⌄" : "⌃"}</button>
                </div>
            </div>

            {/* ── Test case selector ───────────────────────────────────────── */}
            {isOpen && hasRunResult && testCases.length > 1 && (
                <div style={{
                    display: "flex", gap: 8, padding: "10px 16px 0",
                    borderBottom: "1px solid #1a2233", flexShrink: 0,
                }}>
                    {testCases.map((tc, i) => {
                        const passed = tc.testStatus === "passed";
                        const failed = !passed && tc.testStatus !== "pending";
                        return (
                            <button key={i} onClick={() => setActiveCase(i)} style={{
                                background: activeCase === i ? "#1e2a3a" : "transparent",
                                border: `1px solid ${activeCase === i ? "#2d3f57" : "#1e2a3a"}`,
                                borderRadius: 6, padding: "4px 14px", cursor: "pointer",
                                color: activeCase === i ? "#e4e8f0" : "#6b7a9f",
                                fontSize: 12, fontFamily: "monospace", position: "relative",
                            }}>
                                Case {i + 1}
                                <span style={{
                                    position: "absolute", top: -4, right: -4,
                                    width: 8, height: 8, borderRadius: "50%",
                                    background: passed ? "#00b8a3" : failed ? "#ef4743" : "#6b7a9f",
                                    border: "1px solid #111827",
                                }} />
                            </button>
                        );
                    })}
                </div>
            )}

            {/* ── Scrollable body ──────────────────────────────────────────── */}
            <div ref={scrollRef} style={{
                flex: 1, overflowY: "auto", padding: 16,
                scrollbarWidth: "thin", scrollbarColor: "#1e2a3a transparent",
            }}>

                {/* ── SYNTAX CHECKING ─────────────────────────────────────── */}
                {phase === 'syntax' && (
                    <Skeleton label="Checking syntax with local compiler…" />
                )}

                {/* ── SYNTAX ERRORS (stopped — no Judge0 called) ──────────── */}
                {!loading && hasSyntaxErrors && !hasRunResult && !hasSubmitResult && (
                    <div>
                        <div style={{
                            padding: "12px 14px", borderRadius: 8, marginBottom: 14,
                            background: "#ffa11608", border: "1px solid #ffa11630",
                        }}>
                            <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 700, color: "#ffa116" }}>
                                ⚠ Syntax errors detected — Judge0 not called
                            </p>
                            <p style={{ margin: 0, fontSize: 12, color: "#6b7a9f", lineHeight: 1.5 }}>
                                Fix the errors below, then click Run again.
                                No API quota was used.
                            </p>
                        </div>
                        {syntaxErrors.map((e, i) => <ErrorPill key={i} item={e} />)}
                    </div>
                )}

                {/* ── JUDGE0 RUNNING ───────────────────────────────────────── */}
                {phase === 'judge' && (
                    <Skeleton label="Submitting to Judge0…" />
                )}

                {/* ── JUDGE UNAVAILABLE ────────────────────────────────────── */}
                {!loading && judgeUnavailable && (
                    <div style={{
                        padding: 20, borderRadius: 10, background: "#ffa11610",
                        border: "1px solid #ffa11630", textAlign: "center",
                    }}>
                        <div style={{ fontSize: 28, marginBottom: 8 }}>⚡</div>
                        <div style={{ color: "#ffa116", fontWeight: 700, fontSize: 15, marginBottom: 6 }}>
                            Code Execution Unavailable
                        </div>
                        <div style={{ color: "#6b7a9f", fontSize: 13 }}>
                            {result?.errorMessage || submitResult?.errorMessage ||
                                "Judge0 API daily limit exceeded. Try again tomorrow."}
                        </div>
                    </div>
                )}

                {/* ── IDLE ─────────────────────────────────────────────────── */}
                {!loading && !hasRunResult && !hasSubmitResult && !judgeUnavailable && !hasSyntaxErrors && (
                    <div style={{ textAlign: "center", padding: "30px 0", color: "#3d4a63" }}>
                        <div style={{ fontSize: 32, marginBottom: 10 }}>▶</div>
                        <div style={{ fontSize: 13 }}>Run your code to see output here</div>
                    </div>
                )}

                {/* ── SUBMIT RESULT ─────────────────────────────────────────── */}
                {!loading && hasSubmitResult && !judgeUnavailable && (
                    <>
                        <div style={{
                            display: "flex", gap: 12, marginBottom: 20,
                            padding: "14px 16px", borderRadius: 10,
                            background: statusCfg?.bg || "#1e2a3a",
                            border: `1px solid ${statusCfg?.color || "#2d3f57"}30`,
                            alignItems: "center",
                        }}>
                            <span style={{ fontSize: 24 }}>{statusCfg?.icon}</span>
                            <div>
                                <div style={{ fontWeight: 700, color: statusCfg?.color, fontSize: 15 }}>
                                    {statusCfg?.label}
                                </div>
                                {submitResult.passedTestCases !== undefined && (
                                    <div style={{ fontSize: 12, color: "#6b7a9f", marginTop: 2 }}>
                                        {submitResult.passedTestCases} / {submitResult.totalTestCases} test cases passed
                                    </div>
                                )}
                            </div>
                            <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
                                {submitResult.runtime !== undefined && (
                                    <StatChip label="Runtime" value={`${(submitResult.runtime * 1000).toFixed(0)} ms`} />
                                )}
                                {submitResult.memory !== undefined && (
                                    <StatChip label="Memory" value={`${(submitResult.memory / 1024).toFixed(1)} MB`} />
                                )}
                            </div>
                        </div>
                        {submitResult.errorMessage && (
                            <>
                                <Label>Error Details</Label>
                                {allSyntaxErrors.length > 0
                                    ? allSyntaxErrors.map((e, i) => <ErrorPill key={i} item={e} />)
                                    : <CodeBlock value={submitResult.errorMessage} color="#ef4743" />
                                }
                            </>
                        )}
                    </>
                )}

                {/* ── RUN RESULT ────────────────────────────────────────────── */}
                {!loading && hasRunResult && !judgeUnavailable && currentCase && (() => {
                    const isCompile = currentCase.testStatus === "compilation_error";
                    const isRuntime = currentCase.testStatus === "runtime_error";
                    const isTLE     = currentCase.testStatus === "time_limit_exceeded";
                    const isWrong   = currentCase.testStatus === "wrong_answer";
                    const isPassed  = currentCase.testStatus === "passed";
                    const caseParsed = currentCase.error ? parseErrorLines(currentCase.error) : [];

                    return (
                        <>
                            {(currentCase.time || currentCase.memory) && (
                                <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                                    {currentCase.time   && <StatChip label="Runtime" value={`${(parseFloat(currentCase.time) * 1000).toFixed(0)} ms`} />}
                                    {currentCase.memory && <StatChip label="Memory"  value={`${(currentCase.memory / 1024).toFixed(1)} MB`} />}
                                </div>
                            )}

                            {/* Compile error from Judge0 */}
                            {isCompile && (
                                <div style={{ marginBottom: 14 }}>
                                    <Label>Compilation Error</Label>
                                    <div style={{
                                        padding: "12px 14px", borderRadius: 8, background: "#ffa11608",
                                        border: "1px solid #ffa11630", marginBottom: 8,
                                    }}>
                                        <p style={{ margin: "0 0 10px", fontSize: 12, color: "#ffa116" }}>
                                            ⚠ Your code failed to compile. Fix the errors below and try again.
                                        </p>
                                        {caseParsed.length > 0
                                            ? caseParsed.map((e, i) => <ErrorPill key={i} item={e} />)
                                            : <CodeBlock value={currentCase.error} color="#ef4743" />
                                        }
                                    </div>
                                </div>
                            )}

                            {isRuntime && (
                                <div style={{ marginBottom: 14 }}>
                                    <Label>Runtime Error</Label>
                                    <CodeBlock value={currentCase.error} color="#ef4743" />
                                </div>
                            )}

                            {isTLE && (
                                <div style={{
                                    marginBottom: 14, padding: 14, borderRadius: 8,
                                    background: "#ffa11610", border: "1px solid #ffa11640",
                                    color: "#ffa116", fontSize: 13,
                                }}>
                                    ⏱ Time Limit Exceeded — check for infinite loops or O(n²) bottlenecks.
                                </div>
                            )}

                            {!isCompile && (
                                <>
                                    {activeTab === "output" && (
                                        <>
                                            <Label>Your Output</Label>
                                            <CodeBlock
                                                value={currentCase.stdout}
                                                placeholder="(no output)"
                                                color={isPassed ? "#00b8a3" : isWrong ? "#ef4743" : undefined}
                                            />
                                            {isWrong && currentCase.error && (
                                                <p style={{ margin: "8px 0 0", fontSize: 12, color: "#6b7a9f" }}>
                                                    ✗ {currentCase.error}
                                                </p>
                                            )}
                                        </>
                                    )}
                                    {activeTab === "expected" && (
                                        <>
                                            <Label>Expected Output</Label>
                                            <CodeBlock value={currentCase.expected_output} color="#00b8a3" />
                                            {currentCase.explanation && (
                                                <>
                                                    <Label style={{ marginTop: 14 }}>Explanation</Label>
                                                    <p style={{ margin: "6px 0 0", fontSize: 13, color: "#a8b3cf", lineHeight: 1.6, fontFamily: "sans-serif" }}>
                                                        {currentCase.explanation}
                                                    </p>
                                                </>
                                            )}
                                        </>
                                    )}
                                    {activeTab === "stdin" && (
                                        <>
                                            <Label>Input (stdin)</Label>
                                            <CodeBlock value={currentCase.stdin} placeholder="(no input)" />
                                        </>
                                    )}
                                    {activeTab === "errors" && (
                                        <>
                                            <Label>Error Output</Label>
                                            {caseParsed.length > 0
                                                ? caseParsed.map((e, i) => <ErrorPill key={i} item={e} />)
                                                : <CodeBlock value={currentCase.error || globalError} color="#ef4743" placeholder="No errors" />
                                            }
                                        </>
                                    )}
                                </>
                            )}
                        </>
                    );
                })()}
            </div>
        </div>
    );
}