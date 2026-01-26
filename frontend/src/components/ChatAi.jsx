import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import { 
    Send, 
    Bot, 
    User, 
    Sparkles, 
    Trash2, 
    Zap, 
    Copy, 
    Check, 
    Terminal,
    StopCircle,
    Loader2 // Added Loader icon
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

function ChatAi({ problem }) {
    const [messages, setMessages] = useState([
        { role: 'model', parts: [{ text: "Hello! I'm your algorithmic assistant. Ask me about the logic, time complexity, or for a hint to get started." }] },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [copiedCodeId, setCopiedCodeId] = useState(null);

    const { register, handleSubmit, reset, watch, setValue } = useForm();
    const messageValue = watch("message");
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    // Quick Prompts for the user
    const suggestions = [
        "Explain the approach",
        "Analyze Time Complexity",
        "Give me a small hint",
        "Check for edge cases"
    ];

    const handleSuggestionClick = (text) => {
        setValue("message", text);
        inputRef.current?.focus();
    };

    const onSubmit = async (data) => {
        const userMessage = data.message;
        if (!userMessage.trim()) return;

        const newMessages = [...messages, { role: 'user', parts: [{ text: userMessage }] }];
        
        setMessages(newMessages);
        reset();
        setIsLoading(true);

        try {
            const response = await axiosClient.post("/ai/chat", {
                messages: newMessages,
                title: problem?.title,
                description: problem?.description,
                testCases: problem?.visibleTestCases,
                startCode: problem?.startCode
            });

            setMessages(prev => [...prev, {
                role: 'model',
                parts: [{ text: response.data.message }]
            }]);
        } catch (error) {
            console.error("API Error:", error);
            setMessages(prev => [...prev, {
                role: 'model',
                parts: [{ text: "⚠️ **Connection Error:** I couldn't reach the server. Please check your network." }]
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([{ role: 'model', parts: [{ text: "Chat cleared. Ready for a new logic challenge!" }] }]);
    };

    const handleCopy = (code, id) => {
        navigator.clipboard.writeText(code);
        setCopiedCodeId(id);
        setTimeout(() => setCopiedCodeId(null), 2000);
    };

    // Custom Code Block Renderer for ReactMarkdown
    const CodeBlock = ({ node, inline, className, children, ...props }) => {
        const match = /language-(\w+)/.exec(className || '');
        const codeText = String(children).replace(/\n$/, '');
        const id = Math.random().toString(36).substr(2, 9);

        return !inline && match ? (
            <div className="my-4 rounded-lg overflow-hidden border border-white/10 bg-[#1e1e1e] shadow-lg">
                <div className="flex items-center justify-between px-3 py-1.5 bg-[#252525] border-b border-white/5">
                    <span className="text-[10px] font-mono text-gray-400 uppercase">{match[1]}</span>
                    <button 
                        onClick={() => handleCopy(codeText, id)}
                        className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
                    >
                        {copiedCodeId === id ? <Check size={12} className="text-emerald-400"/> : <Copy size={12}/>}
                        <span className="text-[10px] font-medium">{copiedCodeId === id ? 'Copied' : 'Copy'}</span>
                    </button>
                </div>
                <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    customStyle={{ margin: 0, padding: '1rem', background: '#1e1e1e', fontSize: '12px' }}
                    {...props}
                >
                    {codeText}
                </SyntaxHighlighter>
            </div>
        ) : (
            <code className="bg-white/10 text-orange-200 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                {children}
            </code>
        );
    };

    return (
        <div className="flex flex-col h-full bg-[#141414] text-gray-300 font-sans relative overflow-hidden">
            
            {/* --- Header --- */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#1a1a1a] shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                            <Bot size={18} className="text-orange-500" />
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#1a1a1a] rounded-full"></span>
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-gray-100 leading-tight">AI Tutor</h3>
                        <div className="flex items-center gap-1.5 opacity-60">
                            <Sparkles size={10} className="text-yellow-500"/>
                            <span className="text-[10px] uppercase tracking-wider font-semibold">
                                {problem?.title ? 'Context Aware' : 'General'}
                            </span>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={clearChat}
                    className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-rose-400 transition-colors"
                    title="Clear Chat"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            {/* --- Chat Area --- */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar scroll-smooth">
                {messages.map((msg, index) => (
                    <div 
                        key={index} 
                        className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    >
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                            msg.role === "user" 
                                ? "bg-[#2a2a2a] border-white/10" 
                                : "bg-gradient-to-br from-orange-500 to-amber-600 border-transparent shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                        }`}>
                            {msg.role === "user" ? <User size={14} className="text-gray-400"/> : <Bot size={14} className="text-white"/>}
                        </div>

                        {/* Message Bubble */}
                        <div className={`max-w-[85%] text-sm leading-relaxed ${msg.role === "user" ? "items-end flex flex-col" : ""}`}>
                            <div className={`px-4 py-3 shadow-md ${
                                msg.role === "user" 
                                    ? "bg-[#2a2a2a] text-gray-100 rounded-2xl rounded-tr-sm border border-white/5" 
                                    : "bg-transparent text-gray-300"
                            }`}>
                                <ReactMarkdown components={{ code: CodeBlock }}>
                                    {msg.parts[0].text}
                                </ReactMarkdown>
                            </div>
                            
                            {msg.role === "user" && (
                                <span className="text-[10px] text-gray-600 mt-1 mr-1">You</span>
                            )}
                        </div>
                    </div>
                ))}

                {/* --- Thinking Indicator --- */}
                {isLoading && (
                    <div className="flex gap-3 animate-in fade-in duration-300">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shrink-0">
                            <Bot size={14} className="text-white animate-pulse"/>
                        </div>
                        <div className="flex items-center gap-3 bg-[#2a2a2a] px-4 py-3 rounded-2xl rounded-tl-sm border border-white/5">
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce"></span>
                            </div>
                            <span className="text-xs font-mono text-gray-400 animate-pulse">AI is thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* --- Input Area --- */}
            <div className="p-4 bg-[#1a1a1a] border-t border-white/5 relative z-20">
                {/* Suggestions Pills */}
                {!isLoading && messages.length < 3 && (
                    <div className="flex gap-2 mb-3 overflow-x-auto pb-1 custom-scrollbar no-scrollbar">
                        {suggestions.map((text, i) => (
                            <button
                                key={i}
                                onClick={() => handleSuggestionClick(text)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#252525] hover:bg-[#333] border border-white/10 rounded-full text-xs text-gray-400 hover:text-orange-400 hover:border-orange-500/30 transition-all whitespace-nowrap"
                            >
                                <Zap size={10} />
                                {text}
                            </button>
                        ))}
                    </div>
                )}

                <form 
                    onSubmit={handleSubmit(onSubmit)} 
                    className="relative group"
                >
                    <input 
                        ref={inputRef}
                        placeholder="Ask a follow-up..." 
                        className="w-full bg-[#0a0a0a] text-gray-200 text-sm rounded-xl pl-4 pr-12 py-3.5 border border-white/10 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 focus:outline-none transition-all placeholder:text-gray-600 shadow-inner"
                        {...register("message", { required: true })}
                        autoComplete="off"
                        disabled={isLoading}
                    />
                    <button 
                        type="submit" 
                        disabled={!messageValue?.trim() || isLoading}
                        className={`absolute right-2 top-1.5 p-2 rounded-lg transition-all ${
                            !messageValue?.trim() || isLoading
                                ? "text-gray-600 cursor-not-allowed" 
                                : "bg-orange-500 text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 transform active:scale-95"
                        }`}
                    >
                        {isLoading ? <Loader2 size={16} className="animate-spin"/> : <Send size={16} />}
                    </button>
                </form>
                
                <div className="text-center mt-2">
                    <p className="text-[10px] text-gray-600 font-medium">
                        AI-generated responses can be inaccurate.
                    </p>
                </div>
            </div>

            <style jsx="true">{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #444; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                
                /* Markdown Styles Override */
                p { margin-bottom: 0.75rem; }
                p:last-child { margin-bottom: 0; }
                ul { list-style-type: disc; margin-left: 1.25rem; margin-bottom: 0.75rem; color: #d1d5db; }
                ol { list-style-type: decimal; margin-left: 1.25rem; margin-bottom: 0.75rem; color: #d1d5db; }
                strong { color: #fff; font-weight: 600; }
            `}</style>
        </div>
    );
}

export default ChatAi;