// ─────────────────────────────────────────────────────────────
//  Drop-in replacement for the 'description' tab in the left panel
//  Props consumed from parent: problem, getStatusBadge, getDifficultyColor
// ─────────────────────────────────────────────────────────────
import React, { useState } from "react";
import {
  History,
  Tag,
  Zap,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Bookmark,
  CheckCircle2,
  Clock,
  BarChart2,
} from "lucide-react";

/* ── helpers ─────────────────────────────────────────────── */

// Highlights words/phrases surrounded by **…** or `…`
function HighlightedText({ text }) {
  if (!text) return null;

  // Split on **bold** or `code` markers
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <span key={i} className="text-white font-semibold">
              {part.slice(2, -2)}
            </span>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={i}
              className="px-1.5 py-0.5 rounded bg-[#2a2a2a] border border-white/10 text-orange-300 font-mono text-[13px]"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

// Auto-detect and highlight key constraint keywords
function SmartParagraph({ text }) {
  // We highlight numeric patterns, keywords, and technical terms
  const enhanced = text
    .replace(/\b(\d[\d,]*)\b/g, "**$1**") // numbers
    .replace(
      /\b(return|array|string|integer|boolean|null|true|false|index|length|sorted|unique|distinct|subarray|substring|element|node|tree|graph|matrix|O\([^)]+\))\b/gi,
      "`$1`"
    );
  return (
    <p className="text-gray-300 leading-[1.85] text-[15px] font-normal">
      <HighlightedText text={enhanced} />
    </p>
  );
}

/* ── difficulty config ───────────────────────────────────── */
const DIFF_CONFIG = {
  Easy: {
    label: "Easy",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    dot: "bg-emerald-400",
    glow: "shadow-[0_0_12px_rgba(52,211,153,0.25)]",
  },
  Medium: {
    label: "Medium",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
    dot: "bg-amber-400",
    glow: "shadow-[0_0_12px_rgba(251,191,36,0.25)]",
  },
  Hard: {
    label: "Hard",
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    border: "border-rose-500/30",
    dot: "bg-rose-400",
    glow: "shadow-[0_0_12px_rgba(251,113,133,0.25)]",
  },
};

/* ── Example Card ────────────────────────────────────────── */
function ExampleCard({ example, index }) {
  return (
    <div className="group relative">
      {/* Glow accent on hover */}
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-orange-500/0 via-orange-500/0 to-orange-500/0 group-hover:from-orange-500/10 group-hover:via-transparent group-hover:to-transparent transition-all duration-500 pointer-events-none" />

      <div className="relative bg-[#141414] border border-white/8 rounded-2xl overflow-hidden hover:border-white/15 transition-all duration-300">
        {/* Card header */}
        <div className="flex items-center gap-3 px-5 py-3 bg-[#1a1a1a] border-b border-white/6">
          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-orange-500/15 border border-orange-500/25 text-orange-400 text-[11px] font-black">
            {index + 1}
          </div>
          <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-gray-400">
            Example {index + 1}
          </span>
          <div className="ml-auto h-px flex-1 bg-white/5" />
        </div>

        {/* Input / Output / Explanation rows */}
        <div className="p-5 space-y-3 font-mono text-[13px]">
          <ExampleRow label="Input" value={example.input} color="orange" />
          <ExampleRow label="Output" value={example.output} color="emerald" />
          {example.explanation && (
            <ExampleRow
              label="Explain"
              value={example.explanation}
              color="blue"
              mono={false}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ExampleRow({ label, value, color, mono = true }) {
  const colors = {
    orange: { label: "text-orange-400/80", val: "text-orange-100", bg: "bg-orange-500/6" },
    emerald: { label: "text-emerald-400/80", val: "text-emerald-100", bg: "bg-emerald-500/6" },
    blue: { label: "text-blue-400/80", val: "text-gray-300", bg: "bg-blue-500/6" },
  };
  const c = colors[color];

  return (
    <div className={`flex gap-0 rounded-xl overflow-hidden border border-white/5`}>
      <div
        className={`flex items-start px-3 py-2.5 ${c.bg} border-r border-white/6 shrink-0`}
      >
        <span className={`text-[11px] font-bold uppercase tracking-wider ${c.label} w-14`}>
          {label}
        </span>
      </div>
      <div className="flex-1 px-4 py-2.5 bg-black/20">
        <span
          className={`${mono ? "font-mono" : "font-sans text-[13px] leading-relaxed"} ${c.val}`}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

/* ── Constraints Block ───────────────────────────────────── */
function ConstraintsBlock({ constraints }) {
  const [open, setOpen] = useState(true);
  if (!constraints || constraints.length === 0) return null;

  return (
    <div className="rounded-2xl border border-white/8 overflow-hidden bg-[#141414]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-3.5 bg-[#1a1a1a] border-b border-white/6 hover:bg-[#202020] transition-colors"
      >
        <Zap size={13} className="text-yellow-400" />
        <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-gray-400 flex-1 text-left">
          Constraints
        </span>
        {open ? (
          <ChevronUp size={14} className="text-gray-600" />
        ) : (
          <ChevronDown size={14} className="text-gray-600" />
        )}
      </button>
      {open && (
        <ul className="px-5 py-4 space-y-2.5">
          {constraints.map((c, i) => (
            <li key={i} className="flex items-start gap-3 text-[13px]">
              <span className="mt-[5px] w-1.5 h-1.5 rounded-full bg-orange-500/60 shrink-0" />
              <code className="font-mono text-gray-300 leading-relaxed">
                <HighlightedText text={c} />
              </code>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── Tags / Topics ───────────────────────────────────────── */
function TopicsBlock({ topics }) {
  if (!topics || topics.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {topics.map((t, i) => (
        <span
          key={i}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#252525] border border-white/8 text-[11px] text-gray-400 font-medium hover:border-white/20 hover:text-gray-200 transition-colors cursor-default"
        >
          <Tag size={10} className="text-orange-400/70" />
          {t}
        </span>
      ))}
    </div>
  );
}

/* ── Stats Row ───────────────────────────────────────────── */
function StatsRow({ problem }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        {
          icon: <CheckCircle2 size={14} className="text-emerald-400" />,
          label: "Accepted",
          value: problem.acceptedCount ?? "1.2k",
          sub: `${problem.acceptanceRate ?? "62.4"}%`,
        },
        {
          icon: <BarChart2 size={14} className="text-blue-400" />,
          label: "Submissions",
          value: problem.totalSubmissions ?? "1.9k",
        },
        {
          icon: <Clock size={14} className="text-purple-400" />,
          label: "Avg. Time",
          value: problem.avgTime ?? "~15 min",
        },
      ].map((s, i) => (
        <div
          key={i}
          className="flex flex-col gap-1 px-4 py-3 rounded-xl bg-[#141414] border border-white/6 hover:border-white/12 transition-colors"
        >
          <div className="flex items-center gap-1.5">
            {s.icon}
            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500">
              {s.label}
            </span>
          </div>
          <span className="text-[15px] font-bold text-white">{s.value}</span>
          {s.sub && (
            <span className="text-[11px] text-emerald-400 font-medium">{s.sub}</span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Main Export ─────────────────────────────────────────── */
export default function ProblemDescription({ problem, getStatusBadge }) {
  const diff = DIFF_CONFIG[problem?.difficulty] ?? DIFF_CONFIG["Medium"];

  if (!problem) return null;

  return (
    <div className="animate-in fade-in slide-in-from-left-4 duration-500 space-y-8 pb-16">

      {/* ── TITLE BLOCK ─────────────────────────────────── */}
      <div className="space-y-4">
        {/* Problem number + status */}
        <div className="flex items-center gap-3">
          <span className="text-[12px] font-bold text-gray-600 tracking-widest uppercase">
            #{problem.id ?? "42"}
          </span>
          <div className="h-3 w-px bg-white/10" />
          {getStatusBadge && getStatusBadge()}
        </div>

        {/* Title */}
        <h1 className="text-[28px] font-extrabold text-white tracking-tight leading-[1.2]">
          {problem.title}
        </h1>

        {/* Difficulty + tags row */}
        <div className="flex items-center gap-3 flex-wrap">
          <span
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-bold border ${diff.bg} ${diff.text} ${diff.border} ${diff.glow}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
            {diff.label}
          </span>
          <span className="flex items-center gap-1.5 text-gray-500 text-[12px]">
            <History size={12} />
            1.2k Submissions
          </span>
          <span className="flex items-center gap-1.5 text-gray-500 text-[12px]">
            <ThumbsUp size={12} />
            {problem.likes ?? "94%"} Likes
          </span>
        </div>
      </div>

      {/* ── DIVIDER ─────────────────────────────────────── */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* ── DESCRIPTION BLOCK ───────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen size={14} className="text-orange-400" />
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500">
            Problem Statement
          </span>
        </div>

        <div className="space-y-4 pl-1">
          {problem.description.split("\n").map((para, i) =>
            para.trim() ? <SmartParagraph key={i} text={para} /> : null
          )}
        </div>
      </div>


      {/* ── DIVIDER ─────────────────────────────────────── */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* ── EXAMPLES ────────────────────────────────────── */}
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500">
            Examples
          </span>
          <div className="flex-1 h-px bg-white/6" />
        </div>
        {problem.visibleTestCases.map((ex, idx) => (
          <ExampleCard key={idx} example={ex} index={idx} />
        ))}
      </div>

      {/* ── CONSTRAINTS ─────────────────────────────────── */}
      {problem.constraints && (
        <ConstraintsBlock constraints={problem.constraints} />
      )}

      {/* ── TOPICS ──────────────────────────────────────── */}
      {problem.topics && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500">
              Related Topics
            </span>
            <div className="flex-1 h-px bg-white/6" />
          </div>
          <TopicsBlock topics={problem.topics} />
        </div>
      )}

      {/* ── BOTTOM GLOW ─────────────────────────────────── */}
      {/* <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#1e1e1e] to-transparent pointer-events-none" /> */}
              {/* Action buttons */}
        <div className="flex items-center gap-2 pt-1">
          {[
            { icon: <ThumbsUp size={13} />, label: "Like" },
            { icon: <ThumbsDown size={13} />, label: "Dislike" },
            { icon: <Bookmark size={13} />, label: "Save" },
            { icon: <Share2 size={13} />, label: "Share" },
          ].map(({ icon, label }) => (
            <button
              key={label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/6 hover:border-white/15 text-gray-400 hover:text-gray-200 text-[11px] font-medium transition-all"
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
              {/* ── STATS ROW ───────────────────────────────────── */}
      <StatsRow problem={problem} />
    </div>
  );
}