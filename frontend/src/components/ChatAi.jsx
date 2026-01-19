import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import { Send, Bot, User, Sparkles, Trash2, Command } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

function ChatAi({ problem }) {
    const [messages, setMessages] = useState([
        { role: 'model', parts: [{ text: "Hi! I'm your AI coding assistant. How can I help you with this problem today?" }] },
    ]);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
    const messageValue = watch("message");
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const onSubmit = async (data) => {
        const userMessage = data.message;
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
                parts: [{ text: "⚠️ **System Error:** I couldn't reach the brain. Please check your connection." }]
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        if (window.confirm("Clear conversation?")) {
            setMessages([{ role: 'model', parts: [{ text: "Chat cleared. How can I help you now?" }] }]);
        }
    };

    return (
        <div className="flex flex-col h-screen max-h-[85vh] min-h-[500px] bg-base-100 rounded-3xl border border-base-300 shadow-2xl overflow-hidden relative">
            
            {/* --- Glassmorphism Header --- */}
            <div className="px-6 py-4 border-b bg-base-200/80 backdrop-blur-xl flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="p-2.5 bg-primary/15 rounded-xl text-primary ring-1 ring-primary/20">
                            <Bot size={22} />
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-success border-2 border-base-100 rounded-full animate-pulse"></span>
                    </div>
                    <div>
                        <h3 className="font-bold text-sm tracking-tight">Logic Pilot</h3>
                        <div className="flex items-center gap-2">
                            <Sparkles size={12} className="text-warning" />
                            <span className="text-[10px] font-semibold opacity-50 uppercase tracking-[0.1em]">
                                {problem?.title || "General Assistant"}
                            </span>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={clearChat}
                    className="btn btn-ghost btn-circle btn-sm opacity-50 hover:opacity-100 transition-opacity"
                    title="Clear Conversation"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            {/* --- Message Area --- */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-dot-pattern">
                {messages.map((msg, index) => (
                    <div 
                        key={index} 
                        className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"} animate-in fade-in slide-in-from-bottom-4 duration-500`}
                    >
                        {/* Avatar */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${
                            msg.role === "user" ? "bg-secondary text-secondary-content" : "bg-base-300 text-base-content"
                        }`}>
                            {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                        </div>

                        {/* Bubble */}
                        <div className={`flex flex-col max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                            <div className={`px-4 py-3 rounded-2xl shadow-sm leading-relaxed text-[13.5px] ${
                                msg.role === "user" 
                                    ? "bg-primary text-primary-content rounded-tr-none" 
                                    : "bg-base-200 text-base-content rounded-tl-none border border-base-300/50"
                            }`}>
                                <ReactMarkdown
                                    components={{
                                        code({ node, inline, className, children, ...props }) {
                                            const match = /language-(\w+)/.exec(className || '');
                                            return !inline && match ? (
                                                <div className="my-4 rounded-lg overflow-hidden text-xs">
                                                    <SyntaxHighlighter
                                                        style={atomDark}
                                                        language={match[1]}
                                                        PreTag="div"
                                                        {...props}
                                                    >
                                                        {String(children).replace(/\n$/, '')}
                                                    </SyntaxHighlighter>
                                                </div>
                                            ) : (
                                                <code className="bg-base-300 px-1 rounded text-secondary" {...props}>
                                                    {children}
                                                </code>
                                            );
                                        }
                                    }}
                                >
                                    {msg.parts[0].text}
                                </ReactMarkdown>
                            </div>
                            <span className="text-[10px] mt-1.5 opacity-40 font-medium px-1">
                                {msg.role === "user" ? "Sent" : "AI Assistant"}
                            </span>
                        </div>
                    </div>
                ))}

                {/* --- Loading State --- */}
                {isLoading && (
                    <div className="flex gap-4 animate-pulse">
                        <div className="w-8 h-8 rounded-lg bg-base-300 flex items-center justify-center">
                            <Bot size={16} className="opacity-50" />
                        </div>
                        <div className="bg-base-200 px-5 py-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
                            <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                            <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* --- Floating Input Form --- */}
            <div className="p-4 bg-gradient-to-t from-base-100 via-base-100 to-transparent">
                <form 
                    onSubmit={handleSubmit(onSubmit)} 
                    className="relative max-w-3xl mx-auto group"
                >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
                    
                    <div className="relative flex items-center">
                        <input 
                            placeholder="Ask about logic, complexity, or bugs..." 
                            className={`input input-bordered w-full h-14 pl-6 pr-16 rounded-2xl bg-base-100 border-base-300 focus:outline-none focus:border-primary transition-all shadow-xl ${
                                errors.message ? 'border-error' : ''
                            }`}
                            {...register("message", { required: true, minLength: 1 })}
                            autoComplete="off"
                            disabled={isLoading}
                        />
                        <div className="absolute right-3 flex items-center gap-2">
                            {messageValue?.length > 0 && (
                                <kbd className="kbd kbd-sm bg-base-200 border-none opacity-50 hidden md:flex">
                                    <Command size={10} className="mr-1"/> Enter
                                </kbd>
                            )}
                            <button 
                                type="submit" 
                                className={`btn btn-circle btn-sm h-10 w-10 ${
                                    !messageValue || isLoading 
                                        ? "btn-ghost opacity-30" 
                                        : "btn-primary shadow-lg shadow-primary/30"
                                }`}
                                disabled={!messageValue || isLoading}
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </form>
                <p className="text-center text-[10px] opacity-40 mt-3 font-medium">
                    AI can make mistakes. Verify important logic.
                </p>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: hsl(var(--bc) / 0.1);
                    border-radius: 10px;
                }
                .bg-dot-pattern {
                    background-image: radial-gradient(hsl(var(--bc) / 0.08) 1px, transparent 1px);
                    background-size: 24px 24px;
                }
                :global(.prose pre) {
                    background: transparent !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }
            `}</style>
        </div>
    );
}

export default ChatAi;