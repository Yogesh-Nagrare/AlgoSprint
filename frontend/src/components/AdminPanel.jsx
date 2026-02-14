// import { useForm, useFieldArray } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import axiosClient from '../utils/axiosClient';
// import { useNavigate } from 'react-router';
// // Added useState and axios for the AI Generator logic
// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Plus, Trash2, Code2, Beaker, FileText, ChevronLeft, Save, Signature, Sparkles, Loader2 } from 'lucide-react';

// const problemSchema = z.object({
//   title: z.string().min(1, 'Title is required'),
//   description: z.string().min(1, 'Description is required'),
//   difficulty: z.enum(['easy', 'medium', 'hard']),
//   tags: z.enum(['array', 'linkedList', 'graph','Sliding Window', 'Greedy Algorithm', 'Binary Search', 'Tree', 'Backtracking', 'Sorting', 'Recursion', 'Hash Table', 'Stack', 'Queue', 'Heap', 'Bit Manipulation', 'Math', 'Two Pointers', 'Graph Traversal', 'Trie', 'Union Find', 'Segment Tree', 'Matrix', 'String','Binary Tree', 'Depth-First Search', 'Breadth-First Search']),
//   visibleTestCases: z.array(
//     z.object({
//       input: z.string().min(1, 'Input is required'),
//       output: z.string().min(1, 'Output is required'),
//       explanation: z.string().min(1, 'Explanation is required')
//     })
//   ).min(1, 'At least one visible test case required'),
//   hiddenTestCases: z.array(
//     z.object({
//       input: z.string().min(1, 'Input is required'),
//       output: z.string().min(1, 'Output is required')
//     })
//   ).min(1, 'At least one hidden test case required'),
//   // NEW: Function Signature field
//   functionSignature: z.array(
//     z.object({
//       language: z.enum(['C++', 'Java', 'JavaScript']),
//       signature: z.string().min(1, 'Function signature is required')
//     })
//   ).length(3),
//   startCode: z.array(
//     z.object({
//       language: z.enum(['C++', 'Java', 'JavaScript']),
//       initialCode: z.string().min(1, 'Initial code is required')
//     })
//   ).length(3),
//   referenceSolution: z.array(
//     z.object({
//       language: z.enum(['C++', 'Java', 'JavaScript']),
//       completeCode: z.string().min(1, 'Complete code is required')
//     })
//   ).length(3)
// });

// function AdminPanel({ defaultProblem }) {
//   const navigate = useNavigate();

//   // --- AI GENERATOR STATE ---
//   const [aiLoading, setAiLoading] = useState(false);
//   const [aiConfig, setAiConfig] = useState({ topic: '', difficulty: 'medium', focus: '' });
//   const topicSuggestions = ['array', 'linkedList', 'graph', 'Binary Search', 'Dynamic Programming', 'String', 'Tree'];

//   const { register, control, reset, handleSubmit, watch, formState: { errors } } = useForm({
//     resolver: zodResolver(problemSchema),
//     defaultValues: {
//       title: '', description: '', difficulty: 'easy', tags: 'array',
//       visibleTestCases: [{ input: '', output: '', explanation: '' }],
//       hiddenTestCases: [{ input: '', output: '' }],
//       functionSignature: [
//         { language: 'C++', signature: '' },
//         { language: 'Java', signature: '' },
//         { language: 'JavaScript', signature: '' }
//       ],
//       startCode: [
//         { language: 'C++', initialCode: '' },
//         { language: 'Java', initialCode: '' },
//         { language: 'JavaScript', initialCode: '' }
//       ],
//       referenceSolution: [
//         { language: 'C++', completeCode: '' },
//         { language: 'Java', completeCode: '' },
//         { language: 'JavaScript', completeCode: '' }
//       ]
//     }
//   });

//   const { fields: visibleFields, append: appendVisible, remove: removeVisible, replace: replaceVisible } = useFieldArray({ control, name: 'visibleTestCases' });
//   const { fields: hiddenFields, append: appendHidden, remove: removeHidden, replace: replaceHidden } = useFieldArray({ control, name: 'hiddenTestCases' });

//   // --- AI GENERATOR HANDLER ---
// const handleAIGenerate = async () => {
//   // Check validation based on mode
//   if (aiConfig.mode === 'leetcode') {
//     if (!aiConfig.problemName) return alert("Please enter a LeetCode problem name or number");
//   } else {
//     if (!aiConfig.topic) return alert("Please enter a topic");
//   }

//   setAiLoading(true);
//   try {
//     const token = localStorage.getItem('adminToken');
//     const response = await axiosClient.post('/problem/ai/generate', aiConfig, {
//       headers: { 'Authorization': `Bearer ${token}` }
//     });

//     if (response.data.success) {
//       const prob = response.data.problem;
      
//       const mappedData = {
//         title: prob.title,
//         description: prob.description,
//         difficulty: prob.difficulty,
//         tags: prob.tags?.[0] || 'array',
//         visibleTestCases: prob.visibleTestCases,
//         hiddenTestCases: prob.hiddenTestCases,
//         functionSignature: prob.functionSignature.map(sig => ({
//           language: sig.language === 'cpp' ? 'C++' : sig.language === 'java' ? 'Java' : 'JavaScript',
//           signature: sig.signature
//         })),
//         startCode: prob.startCode.map(sc => ({
//           language: sc.language === 'cpp' ? 'C++' : sc.language === 'java' ? 'Java' : 'JavaScript',
//           initialCode: sc.code
//         })),
//         referenceSolution: prob.referenceSolution.map(rs => ({
//           language: rs.language === 'cpp' ? 'C++' : rs.language === 'java' ? 'Java' : 'JavaScript',
//           completeCode: rs.completeCode
//         }))
//       };
      
//       reset(mappedData);
//       alert("AI Problem Generated! Review the fields below.");
//     }
//   } catch (err) {
//     console.error(err);
//     alert("Failed to generate AI problem.");
//   } finally {
//     setAiLoading(false);
//   }
// };
//   useEffect(() => {
//     if (!defaultProblem) return;
//     reset(defaultProblem);
//     if (defaultProblem.visibleTestCases) replaceVisible(defaultProblem.visibleTestCases);
//     if (defaultProblem.hiddenTestCases) replaceHidden(defaultProblem.hiddenTestCases);
//   }, [defaultProblem, reset, replaceVisible, replaceHidden]);

//   const onSubmit = async (data) => {
//     console.log("1. Form Data:", data);

//     const { _id, __v, createdAt, updatedAt, ...cleanData } = data;
    
//     console.log("2. Sending to Server:", cleanData);

//     try {
//       const isUpdate = !!defaultProblem?._id;
//       const endpoint = isUpdate ? `/problem/update/${defaultProblem._id}` : '/problem/create';
//       const method = isUpdate ? 'put' : 'post';

//       await axiosClient[method](endpoint, cleanData);
//       alert('Success!');
//       navigate('/admin');
//     } catch (error) {
//       console.error("3. Server Error Object:", error.response);
//       console.log("4. Server Error Data:", error.response?.data);
      
//       alert("Check the browser console (F12) for the full error logs.");
//     }
//   };

//   const SectionHeader = ({ icon: Icon, title, subtitle }) => (
//     <div className="flex items-center gap-4 mb-8">
//       <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-500">
//         <Icon size={24} />
//       </div>
//       <div>
//         <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
//         <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">{subtitle}</p>
//       </div>
//     </div>
//   );

//   const getSignatureTemplates = (lang) => {
//     const templates = {
//       'C++': [
//         'void rotate(vector<int>& nums, int k)',
//         'vector<int> twoSum(vector<int>& nums, int target)',
//         'int maxProfit(vector<int>& prices)',
//         'bool isPalindrome(string s)'
//       ],
//       'Java': [
//         'void rotate(int[] nums, int k)',
//         'int[] twoSum(int[] nums, int target)',
//         'int maxProfit(int[] prices)',
//         'boolean isPalindrome(String s)'
//       ],
//       'JavaScript': [
//         'rotate(nums: number[], k: number): void',
//         'twoSum(nums: number[], target: number): number[]',
//         'maxProfit(prices: number[]): number',
//         'isPalindrome(s: string): boolean'
//       ]
//     };
//     return templates[lang] || [];
//   };

//   return (
//     <div className="min-h-screen bg-[#0a0a0a] text-gray-200 pb-20">
//       {/* Top Bar */}
//       <div className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5 mb-8">
//         <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
//           <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-bold">
//             <ChevronLeft size={18} /> BACK TO PANEL
//           </button>
//           <div className="flex items-center gap-4">
//             <span className="text-xs font-mono text-gray-500">MODE: {defaultProblem ? 'UPDATE_EXISTING' : 'CREATE_NEW'}</span>
//             <button 
//               onClick={handleSubmit(onSubmit)}
//               className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-black px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-orange-500/20"
//             >
//               <Save size={18} /> {defaultProblem ? "Save Changes" : "Publish Problem"}
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-5xl mx-auto px-6">
//         {/* NEW: AI GENERATOR SECTION */}
// <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-orange-500/5 rounded-[2.5rem] border border-orange-500/10 p-10 mb-12">
//             <div className="flex items-center justify-between mb-8">
//                 <SectionHeader icon={Sparkles} title="AI Problem Generator" subtitle="Generate content instantly" />
//                 {aiLoading && <Loader2 className="animate-spin text-orange-500" />}
//             </div>
            
//             {/* Mode Toggle */}
//             <div className="flex gap-2 mb-6">
//                 <button
//                     type="button"
//                     onClick={() => setAiConfig({...aiConfig, mode: 'original'})}
//                     className={`px-6 py-3 rounded-2xl font-bold text-xs uppercase transition-all ${
//                         aiConfig.mode === 'original' 
//                             ? 'bg-orange-500 text-black' 
//                             : 'bg-black/40 text-gray-400 border border-white/10'
//                     }`}
//                 >
//                     Original Problem
//                 </button>
//                 <button
//                     type="button"
//                     onClick={() => setAiConfig({...aiConfig, mode: 'leetcode'})}
//                     className={`px-6 py-3 rounded-2xl font-bold text-xs uppercase transition-all ${
//                         aiConfig.mode === 'leetcode' 
//                             ? 'bg-orange-500 text-black' 
//                             : 'bg-black/40 text-gray-400 border border-white/10'
//                     }`}
//                 >
//                     LeetCode Problem
//                 </button>
//             </div>

//             {/* Original Mode Form */}
//             {aiConfig.mode === 'original' && (
//                 <>
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                         <div className="space-y-2">
//                             <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Topic</label>
//                             <input 
//                                 value={aiConfig.topic}
//                                 onChange={(e) => setAiConfig({...aiConfig, topic: e.target.value})}
//                                 placeholder="e.g. Sliding Window" 
//                                 className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none text-white font-bold"
//                             />
//                         </div>
//                         <div className="space-y-2">
//                             <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Difficulty</label>
//                             <select 
//                                 value={aiConfig.difficulty}
//                                 onChange={(e) => setAiConfig({...aiConfig, difficulty: e.target.value})}
//                                 className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none text-white font-bold"
//                             >
//                                 <option value="easy">Easy</option>
//                                 <option value="medium">Medium</option>
//                                 <option value="hard">Hard</option>
//                             </select>
//                         </div>
//                         <div className="flex items-end">
//                             <button 
//                                 type="button"
//                                 onClick={handleAIGenerate}
//                                 disabled={aiLoading}
//                                 className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-black py-4 rounded-2xl font-black uppercase text-xs transition-all"
//                             >
//                                 {aiLoading ? "Generating..." : "Generate with AI"}
//                             </button>
//                         </div>
//                     </div>
//                     <div className="flex flex-wrap gap-2 mt-4">
//                         {topicSuggestions.map(t => (
//                             <button 
//                                 key={t} 
//                                 type="button" 
//                                 onClick={() => setAiConfig({...aiConfig, topic: t})} 
//                                 className="text-[10px] px-3 py-1 bg-white/5 hover:bg-orange-500/20 rounded-full border border-white/5 transition-colors"
//                             >
//                                 {t}
//                             </button>
//                         ))}
//                     </div>
//                 </>
//             )}

//             {/* LeetCode Mode Form */}
//             {aiConfig.mode === 'leetcode' && (
//                 <>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         <div className="space-y-2">
//                             <label className="text-[10px] font-black uppercase text-gray-500 ml-1">
//                                 Problem Name or Number
//                             </label>
//                             <input 
//                                 value={aiConfig.problemName || ''}
//                                 onChange={(e) => setAiConfig({...aiConfig, problemName: e.target.value})}
//                                 placeholder='e.g. "Two Sum" or "1"' 
//                                 className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none text-white font-bold"
//                             />
//                             <p className="text-[10px] text-gray-500 ml-1 mt-1">
//                                 Enter LeetCode problem number (1, 20, 121) or name (Two Sum, Valid Parentheses)
//                             </p>
//                         </div>
//                         <div className="flex items-end">
//                             <button 
//                                 type="button"
//                                 onClick={handleAIGenerate}
//                                 disabled={aiLoading || !aiConfig.problemName}
//                                 className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-black py-4 rounded-2xl font-black uppercase text-xs transition-all"
//                             >
//                                 {aiLoading ? "Fetching..." : "Fetch Problem"}
//                             </button>
//                         </div>
//                     </div>
//                     <div className="flex flex-wrap gap-2 mt-4">
//                         <span className="text-[10px] font-bold text-gray-500 uppercase px-2 py-1">Popular:</span>
//                         {[
//                             { num: "1", name: "Two Sum" },
//                             { num: "20", name: "Valid Parentheses" },
//                             { num: "121", name: "Best Time to Buy" },
//                             { num: "206", name: "Reverse Linked List" },
//                             { num: "3", name: "Longest Substring" }
//                         ].map(problem => (
//                             <button 
//                                 key={problem.num} 
//                                 type="button" 
//                                 onClick={() => setAiConfig({...aiConfig, problemName: problem.num})} 
//                                 className="text-[10px] px-3 py-1 bg-white/5 hover:bg-orange-500/20 rounded-full border border-white/5 transition-colors"
//                             >
//                                 #{problem.num} {problem.name}
//                             </button>
//                         ))}
//                     </div>
//                 </>
//             )}
//         </motion.section>

//         <form className="space-y-12">
          
//           {/* SECTION 1: METADATA */}
//           <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111] rounded-[2.5rem] border border-white/5 p-10">
//             <SectionHeader icon={FileText} title="Problem Metadata" subtitle="Identity & Classification" />
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//               <div className="space-y-6 md:col-span-2">
//                 <div className="flex flex-col gap-2">
//                   <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Title</label>
//                   <input {...register('title')} placeholder="e.g. Two Sum Optimized" className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 focus:ring-1 focus:ring-orange-500 outline-none transition-all text-white placeholder:text-gray-700 font-bold" />
//                   {errors.title && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.title.message}</p>}
//                 </div>
                
//                 <div className="flex flex-col gap-2">
//                   <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Problem Description</label>
//                   <textarea {...register('description')} rows={5} placeholder="Describe the challenge..." className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 focus:ring-1 focus:ring-orange-500 outline-none transition-all text-gray-300 placeholder:text-gray-700 resize-none font-medium leading-relaxed" />
//                 </div>
//               </div>

//               <div className="flex flex-col gap-2">
//                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Difficulty Level</label>
//                 <select {...register('difficulty')} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 focus:ring-1 focus:ring-orange-500 outline-none text-white font-bold appearance-none cursor-pointer">
//                   <option value="easy">Easy (Green)</option>
//                   <option value="medium">Medium (Yellow)</option>
//                   <option value="hard">Hard (Red)</option>
//                 </select>
//               </div>

//               <div className="flex flex-col gap-2">
//                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Topic Category</label>
//                 <select {...register('tags')} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 focus:ring-1 focus:ring-orange-500 outline-none text-white font-bold appearance-none cursor-pointer">
//                   <option value="dp">Dynamic Programming</option>
//                   <option value="array">Array</option>
//                   <option value="linkedList">Linked List</option>
//                   <option value="graph">Graph</option>
//                   <option value="Sliding Window">Sliding Window</option>
//                   <option value="Greedy Algorithm">Greedy Algorithm</option>
//                   <option value="Binary Search">Binary Search</option>
//                   <option value="Tree">Tree</option>
//                   <option value="Backtracking">Backtracking</option>
//                   <option value="Sorting">Sorting</option>
//                   <option value="Recursion">Recursion</option>
//                   <option value="Hash Table">Hash Table</option>
//                   <option value="Stack">Stack</option>
//                   <option value="Queue">Queue</option>
//                   <option value="Heap">Heap</option>
//                   <option value="Bit Manipulation">Bit Manipulation</option>
//                   <option value="Math">Math</option>
//                   <option value="Two Pointers">Two Pointers</option>
//                   <option value="Graph Traversal">Graph Traversal</option>
//                   <option value="Trie">Trie</option>
//                   <option value="Union Find">Union Find</option>
//                   <option value="Segment Tree">Segment Tree</option>
//                   <option value="Matrix">Matrix</option>
//                   <option value="String">String</option>
//                   <option value="Binary Tree">Binary Tree</option>
//                   <option value="Depth-First Search">Depth-First Search</option>
//                   <option value="Breadth-First Search">Breadth-First Search</option>
//                 </select>
//               </div>
//             </div>
//           </motion.section>

//           {/* SECTION 2: TEST CASES */}
//           <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#111] rounded-[2.5rem] border border-white/5 p-10">
//             <SectionHeader icon={Beaker} title="Logical Validation" subtitle="Visible & Hidden Test Cases" />
            
//             <div className="space-y-10">
//               {/* Visible Cases */}
//               <div className="space-y-6">
//                 <div className="flex items-center justify-between border-b border-white/5 pb-4">
//                   <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Visible Cases</h3>
//                   <button type="button" onClick={() => appendVisible({ input: '', output: '', explanation: '' })} className="text-orange-500 text-xs font-black">
//                     + ADD EXAMPLE
//                   </button>
//                 </div>
                
//                 <div className="grid grid-cols-1 gap-6">
//                   {visibleFields.map((field, index) => (
//                     <div key={field.id} className="relative bg-black/20 border border-white/5 p-6 rounded-3xl group">
//                       <button type="button" onClick={() => removeVisible(index)} className="absolute top-4 right-4 text-gray-600 hover:text-red-500">
//                         <Trash2 size={18} />
//                       </button>
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <textarea 
//                           {...register(`visibleTestCases.${index}.input`)} 
//                           placeholder="Input: nums = [1,2,3,4,5], k = 2" 
//                           className="bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm font-mono h-24 resize-none" 
//                           onKeyDown={(e) => e.stopPropagation()} 
//                         />
//                         <textarea 
//                           {...register(`visibleTestCases.${index}.output`)} 
//                           placeholder="Output: [4,5,1,2,3]" 
//                           className="bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm font-mono h-24 resize-none" 
//                           onKeyDown={(e) => e.stopPropagation()}
//                         />
//                         <textarea {...register(`visibleTestCases.${index}.explanation`)} placeholder="Explanation..." className="md:col-span-2 bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm h-20 resize-none" />
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Hidden Cases */}
//               <div className="space-y-6">
//                 <div className="flex items-center justify-between border-b border-white/5 pb-4">
//                   <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Hidden Validation</h3>
//                   <button type="button" onClick={() => appendHidden({ input: '', output: '' })} className="text-orange-500 text-xs font-black">
//                     + ADD SYSTEM CASE
//                   </button>
//                 </div>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   {hiddenFields.map((field, index) => (
//                     <div key={field.id} className="bg-black/20 p-4 rounded-2xl border border-white/5 space-y-3 relative">
//                       <button type="button" onClick={() => removeHidden(index)} className="absolute top-2 right-2 text-gray-600"><Trash2 size={14}/></button>
//                       <textarea {...register(`hiddenTestCases.${index}.input`)} placeholder="Input" className="w-full bg-white/5 rounded-lg px-3 py-2 text-xs font-mono h-20 resize-none" />
//                       <textarea {...register(`hiddenTestCases.${index}.output`)} placeholder="Output" className="w-full bg-white/5 rounded-lg px-3 py-2 text-xs font-mono h-16 resize-none" />
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </motion.section>

//           {/* SECTION 3: CODE TEMPLATES & FUNCTION SIGNATURES */}
//           <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#111] rounded-[2.5rem] border border-white/5 p-10">
//             <SectionHeader icon={Code2} title="Code Templates" subtitle="LeetCode-Style Function Signatures & Solutions" />
            
//             <div className="space-y-12">
//               {[0, 1, 2].map((index) => {
//                 const lang = index === 0 ? 'C++' : index === 1 ? 'Java' : 'JavaScript';
//                 const templates = getSignatureTemplates(lang);
                
//                 return (
//                   <div key={index} className="space-y-6 border-l-2 border-white/5 pl-8 ml-2">
//                     <div className="flex items-center gap-3">
//                       <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black text-orange-500">{lang[0]}</div>
//                       <h3 className="font-black text-white uppercase tracking-[0.2em] text-xs">{lang} Configuration</h3>
//                     </div>
                    
//                     {/* NEW: Function Signature Field */}
//                     <div className="space-y-2 bg-black/20 border border-orange-500/20 rounded-2xl p-6">
//                       <div className="flex items-center gap-2 mb-3">
//                         <Signature size={16} className="text-orange-500" />
//                         <label className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">Function Signature (Required)</label>
//                       </div>
                      
//                       <input 
//                         {...register(`functionSignature.${index}.signature`)} 
//                         className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-cyan-400 focus:border-orange-500/50 outline-none" 
//                         placeholder={templates[0] || `e.g., void rotate(vector<int>& nums, int k)`}
//                       />
                      
//                       {errors.functionSignature?.[index]?.signature && (
//                         <p className="text-red-500 text-[10px] font-bold mt-1">{errors.functionSignature[index].signature.message}</p>
//                       )}
                      
//                       {/* Quick Templates */}
//                       <div className="flex flex-wrap gap-2 mt-3">
//                         <span className="text-[9px] text-gray-600 uppercase tracking-wider mr-2">Quick:</span>
//                         {templates.map((template, idx) => (
//                           <button
//                             key={idx}
//                             type="button"
//                             onClick={() => {
//                               const currentValues = watch('functionSignature');
//                               currentValues[index].signature = template;
//                               reset({ ...watch(), functionSignature: currentValues });
//                             }}
//                             className="text-[9px] px-2 py-1 bg-white/5 hover:bg-white/10 rounded-md text-gray-400 hover:text-orange-500 transition-colors"
//                           >
//                             {template.split('(')[0]}
//                           </button>
//                         ))}
//                       </div>
//                     </div>
                    
//                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                       <div className="space-y-2">
//                         <label className="text-[10px] font-bold text-gray-500 ml-1">STARTING TEMPLATE (LeetCode-style class)</label>
//                         <textarea 
//                           {...register(`startCode.${index}.initialCode`)} 
//                           className="w-full bg-black border border-white/10 rounded-2xl p-6 font-mono text-xs leading-relaxed h-64 focus:border-orange-500/50 outline-none text-emerald-400" 
//                           placeholder={lang === 'C++' ? `class Solution {\npublic:\n    void rotate(vector<int>& nums, int k) {\n        \n    }\n};` : 
//                                      lang === 'Java' ? `class Solution {\n    public void rotate(int[] nums, int k) {\n        \n    }\n}` :
//                                      `class Solution {\n    rotate(nums: number[], k: number): void {\n        \n    }\n}`}
//                         />
//                       </div>
//                       <div className="space-y-2">
//                         <label className="text-[10px] font-bold text-gray-500 ml-1">REFERENCE SOLUTION (Complete LeetCode-style class)</label>
//                         <textarea 
//                           {...register(`referenceSolution.${index}.completeCode`)} 
//                           className="w-full bg-black border border-white/10 rounded-2xl p-6 font-mono text-xs leading-relaxed h-64 focus:border-orange-500/50 outline-none text-blue-400" 
//                           placeholder={`// ${lang} complete solution in class format...`}
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </motion.section>

//           <div className="pt-10">
//             <button 
//               type="button" 
//               onClick={handleSubmit(onSubmit, (err) => console.log(err))}              className="w-full bg-white hover:bg-orange-500 text-black py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] transition-all text-sm shadow-2xl hover:shadow-orange-500/20"
//             >
//               {defaultProblem ? "Finalize Update" : "Confirm & Deploy Problem"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default AdminPanel;
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../utils/axiosClient';
import { useNavigate } from 'react-router';
// Added useState and axios for the AI Generator logic
import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Code2, Beaker, FileText, ChevronLeft, Save, Signature, Sparkles, Loader2 } from 'lucide-react';

const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  // FIXED: Added 'dp' to match the select option value
  tags: z.enum(['dp', 'array', 'linkedList', 'graph','Sliding Window', 'Greedy Algorithm', 'Binary Search', 'Tree', 'Backtracking', 'Sorting', 'Recursion', 'Hash Table', 'Stack', 'Queue', 'Heap', 'Bit Manipulation', 'Math', 'Two Pointers', 'Graph Traversal', 'Trie', 'Union Find', 'Segment Tree', 'Matrix', 'String','Binary Tree', 'Depth-First Search', 'Breadth-First Search']),
  visibleTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required'),
      explanation: z.string().min(1, 'Explanation is required')
    })
  ).min(1, 'At least one visible test case required'),
  hiddenTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required')
    })
  ).min(1, 'At least one hidden test case required'),
  // NEW: Function Signature field
  functionSignature: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      signature: z.string().min(1, 'Function signature is required')
    })
  ).length(3),
  startCode: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      initialCode: z.string().min(1, 'Initial code is required')
    })
  ).length(3),
  referenceSolution: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      completeCode: z.string().min(1, 'Complete code is required')
    })
  ).length(3)
});

function AdminPanel({ defaultProblem }) {
  const navigate = useNavigate();

  // --- AI GENERATOR STATE ---
  // FIXED: Added 'mode' and 'problemName' to initial state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiConfig, setAiConfig] = useState({ topic: '', difficulty: 'medium', focus: '', mode: 'original', problemName: '' });
  const topicSuggestions = ['array', 'linkedList', 'graph', 'Binary Search', 'Dynamic Programming', 'String', 'Tree'];

  const { register, control, reset, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      title: '', description: '', difficulty: 'easy', tags: 'array',
      visibleTestCases: [{ input: '', output: '', explanation: '' }],
      hiddenTestCases: [{ input: '', output: '' }],
      functionSignature: [
        { language: 'C++', signature: '' },
        { language: 'Java', signature: '' },
        { language: 'JavaScript', signature: '' }
      ],
      startCode: [
        { language: 'C++', initialCode: '' },
        { language: 'Java', initialCode: '' },
        { language: 'JavaScript', initialCode: '' }
      ],
      referenceSolution: [
        { language: 'C++', completeCode: '' },
        { language: 'Java', completeCode: '' },
        { language: 'JavaScript', completeCode: '' }
      ]
    }
  });

  const { fields: visibleFields, append: appendVisible, remove: removeVisible, replace: replaceVisible } = useFieldArray({ control, name: 'visibleTestCases' });
  const { fields: hiddenFields, append: appendHidden, remove: removeHidden, replace: replaceHidden } = useFieldArray({ control, name: 'hiddenTestCases' });

  // --- AI GENERATOR HANDLER ---
const handleAIGenerate = async () => {
  // Check validation based on mode
  if (aiConfig.mode === 'leetcode') {
    if (!aiConfig.problemName) return alert("Please enter a LeetCode problem name or number");
  } else {
    if (!aiConfig.topic) return alert("Please enter a topic");
  }

  setAiLoading(true);
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axiosClient.post('/problem/ai/generate', aiConfig, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.data.success) {
      const prob = response.data.problem;
      
      const mappedData = {
        title: prob.title,
        description: prob.description,
        difficulty: prob.difficulty,
        tags: prob.tags?.[0] || 'array',
        visibleTestCases: prob.visibleTestCases,
        hiddenTestCases: prob.hiddenTestCases,
        functionSignature: prob.functionSignature.map(sig => ({
          language: sig.language === 'cpp' ? 'C++' : sig.language === 'java' ? 'Java' : 'JavaScript',
          signature: sig.signature
        })),
        startCode: prob.startCode.map(sc => ({
          language: sc.language === 'cpp' ? 'C++' : sc.language === 'java' ? 'Java' : 'JavaScript',
          initialCode: sc.code
        })),
        referenceSolution: prob.referenceSolution.map(rs => ({
          language: rs.language === 'cpp' ? 'C++' : rs.language === 'java' ? 'Java' : 'JavaScript',
          completeCode: rs.completeCode
        }))
      };
      
      reset(mappedData);
      alert("AI Problem Generated! Review the fields below.");
    }
  } catch (err) {
    console.error(err);
    alert("Failed to generate AI problem.");
  } finally {
    setAiLoading(false);
  }
};
  useEffect(() => {
    if (!defaultProblem) return;

    // FIXED: Normalize data to ensure old problems meet new schema requirements (3 items in arrays)
    const normalizeLang = (lang) => {
        const l = lang.toLowerCase();
        if (l === 'cpp' || l === 'c++') return 'C++';
        if (l === 'java') return 'Java';
        return 'JavaScript';
    };

    const ensureThreeLangs = (arr, keyName) => {
        const targetLangs = ['C++', 'Java', 'JavaScript'];
        return targetLangs.map(lang => {
            const existing = arr?.find(item => normalizeLang(item.language) === lang);
            return existing ? { ...existing, language: lang } : { language: lang, [keyName]: '' };
        });
    };

    const preparedData = {
      ...defaultProblem,
      // Ensure functionSignature, startCode, and referenceSolution have exactly 3 entries for Zod
      functionSignature: ensureThreeLangs(defaultProblem.functionSignature || [], 'signature'),
      startCode: ensureThreeLangs(defaultProblem.startCode || [], 'initialCode'),
      referenceSolution: ensureThreeLangs(defaultProblem.referenceSolution || [], 'completeCode'),
    };

    reset(preparedData);
    if (defaultProblem.visibleTestCases) replaceVisible(defaultProblem.visibleTestCases);
    if (defaultProblem.hiddenTestCases) replaceHidden(defaultProblem.hiddenTestCases);
  }, [defaultProblem, reset, replaceVisible, replaceHidden]);

  const onSubmit = async (data) => {
    console.log("1. Form Data:", data);

    const { _id, __v, createdAt, updatedAt, ...cleanData } = data;
    
    console.log("2. Sending to Server:", cleanData);

    try {
      const isUpdate = !!defaultProblem?._id;
      const endpoint = isUpdate ? `/problem/update/${defaultProblem._id}` : '/problem/create';
      const method = isUpdate ? 'put' : 'post';

      await axiosClient[method](endpoint, cleanData);
      alert('Success!');
      navigate('/admin');
    } catch (error) {
      console.error("3. Server Error Object:", error.response);
      console.log("4. Server Error Data:", error.response?.data);
      
      alert(error.response?.data?.message || "Check the browser console (F12) for the full error logs.");
    }
  };

  const SectionHeader = ({ icon: Icon, title, subtitle }) => (
    <div className="flex items-center gap-4 mb-8">
      <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-500">
        <Icon size={24} />
      </div>
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">{subtitle}</p>
      </div>
    </div>
  );

  const getSignatureTemplates = (lang) => {
    const templates = {
      'C++': [
        'void rotate(vector<int>& nums, int k)',
        'vector<int> twoSum(vector<int>& nums, int target)',
        'int maxProfit(vector<int>& prices)',
        'bool isPalindrome(string s)'
      ],
      'Java': [
        'void rotate(int[] nums, int k)',
        'int[] twoSum(int[] nums, int target)',
        'int maxProfit(int[] prices)',
        'boolean isPalindrome(String s)'
      ],
      'JavaScript': [
        'rotate(nums: number[], k: number): void',
        'twoSum(nums: number[], target: number): number[]',
        'maxProfit(prices: number[]): number',
        'isPalindrome(s: string): boolean'
      ]
    };
    return templates[lang] || [];
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 pb-20">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5 mb-8">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-bold">
            <ChevronLeft size={18} /> BACK TO PANEL
          </button>
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-gray-500">MODE: {defaultProblem ? 'UPDATE_EXISTING' : 'CREATE_NEW'}</span>
            <button 
              onClick={handleSubmit(onSubmit, (err) => console.log("Validation Errors:", err))}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-black px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-orange-500/20"
            >
              <Save size={18} /> {defaultProblem ? "Save Changes" : "Publish Problem"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6">
        {/* NEW: AI GENERATOR SECTION */}
<motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-orange-500/5 rounded-[2.5rem] border border-orange-500/10 p-10 mb-12">
            <div className="flex items-center justify-between mb-8">
                <SectionHeader icon={Sparkles} title="AI Problem Generator" subtitle="Generate content instantly" />
                {aiLoading && <Loader2 className="animate-spin text-orange-500" />}
            </div>
            
            {/* Mode Toggle */}
            <div className="flex gap-2 mb-6">
                <button
                    type="button"
                    onClick={() => setAiConfig({...aiConfig, mode: 'original'})}
                    className={`px-6 py-3 rounded-2xl font-bold text-xs uppercase transition-all ${
                        aiConfig.mode === 'original' 
                            ? 'bg-orange-500 text-black' 
                            : 'bg-black/40 text-gray-400 border border-white/10'
                    }`}
                >
                    Original Problem
                </button>
                <button
                    type="button"
                    onClick={() => setAiConfig({...aiConfig, mode: 'leetcode'})}
                    className={`px-6 py-3 rounded-2xl font-bold text-xs uppercase transition-all ${
                        aiConfig.mode === 'leetcode' 
                            ? 'bg-orange-500 text-black' 
                            : 'bg-black/40 text-gray-400 border border-white/10'
                    }`}
                >
                    LeetCode Problem
                </button>
            </div>

            {/* Original Mode Form */}
            {aiConfig.mode === 'original' && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Topic</label>
                            <input 
                                value={aiConfig.topic}
                                onChange={(e) => setAiConfig({...aiConfig, topic: e.target.value})}
                                placeholder="e.g. Sliding Window" 
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none text-white font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Difficulty</label>
                            <select 
                                value={aiConfig.difficulty}
                                onChange={(e) => setAiConfig({...aiConfig, difficulty: e.target.value})}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none text-white font-bold"
                            >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button 
                                type="button"
                                onClick={handleAIGenerate}
                                disabled={aiLoading}
                                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-black py-4 rounded-2xl font-black uppercase text-xs transition-all"
                            >
                                {aiLoading ? "Generating..." : "Generate with AI"}
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                        {topicSuggestions.map(t => (
                            <button 
                                key={t} 
                                type="button" 
                                onClick={() => setAiConfig({...aiConfig, topic: t})} 
                                className="text-[10px] px-3 py-1 bg-white/5 hover:bg-orange-500/20 rounded-full border border-white/5 transition-colors"
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </>
            )}

            {/* LeetCode Mode Form */}
            {aiConfig.mode === 'leetcode' && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-500 ml-1">
                                Problem Name or Number
                            </label>
                            <input 
                                value={aiConfig.problemName || ''}
                                onChange={(e) => setAiConfig({...aiConfig, problemName: e.target.value})}
                                placeholder='e.g. "Two Sum" or "1"' 
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none text-white font-bold"
                            />
                            <p className="text-[10px] text-gray-500 ml-1 mt-1">
                                Enter LeetCode problem number (1, 20, 121) or name (Two Sum, Valid Parentheses)
                            </p>
                        </div>
                        <div className="flex items-end">
                            <button 
                                type="button"
                                onClick={handleAIGenerate}
                                disabled={aiLoading || !aiConfig.problemName}
                                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-black py-4 rounded-2xl font-black uppercase text-xs transition-all"
                            >
                                {aiLoading ? "Fetching..." : "Fetch Problem"}
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                        <span className="text-[10px] font-bold text-gray-500 uppercase px-2 py-1">Popular:</span>
                        {[
                            { num: "1", name: "Two Sum" },
                            { num: "20", name: "Valid Parentheses" },
                            { num: "121", name: "Best Time to Buy" },
                            { num: "206", name: "Reverse Linked List" },
                            { num: "3", name: "Longest Substring" }
                        ].map(problem => (
                            <button 
                                key={problem.num} 
                                type="button" 
                                onClick={() => setAiConfig({...aiConfig, problemName: problem.num})} 
                                className="text-[10px] px-3 py-1 bg-white/5 hover:bg-orange-500/20 rounded-full border border-white/5 transition-colors"
                            >
                                #{problem.num} {problem.name}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </motion.section>

        <form className="space-y-12">
          
          {/* SECTION 1: METADATA */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111] rounded-[2.5rem] border border-white/5 p-10">
            <SectionHeader icon={FileText} title="Problem Metadata" subtitle="Identity & Classification" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6 md:col-span-2">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Title</label>
                  <input {...register('title')} placeholder="e.g. Two Sum Optimized" className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 focus:ring-1 focus:ring-orange-500 outline-none transition-all text-white placeholder:text-gray-700 font-bold" />
                  {errors.title && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.title.message}</p>}
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Problem Description</label>
                  <textarea {...register('description')} rows={5} placeholder="Describe the challenge..." className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 focus:ring-1 focus:ring-orange-500 outline-none transition-all text-gray-300 placeholder:text-gray-700 resize-none font-medium leading-relaxed" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Difficulty Level</label>
                <select {...register('difficulty')} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 focus:ring-1 focus:ring-orange-500 outline-none text-white font-bold appearance-none cursor-pointer">
                  <option value="easy">Easy (Green)</option>
                  <option value="medium">Medium (Yellow)</option>
                  <option value="hard">Hard (Red)</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Topic Category</label>
                <select {...register('tags')} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 focus:ring-1 focus:ring-orange-500 outline-none text-white font-bold appearance-none cursor-pointer">
                  <option value="dp">Dynamic Programming</option>
                  <option value="array">Array</option>
                  <option value="linkedList">Linked List</option>
                  <option value="graph">Graph</option>
                  <option value="Sliding Window">Sliding Window</option>
                  <option value="Greedy Algorithm">Greedy Algorithm</option>
                  <option value="Binary Search">Binary Search</option>
                  <option value="Tree">Tree</option>
                  <option value="Backtracking">Backtracking</option>
                  <option value="Sorting">Sorting</option>
                  <option value="Recursion">Recursion</option>
                  <option value="Hash Table">Hash Table</option>
                  <option value="Stack">Stack</option>
                  <option value="Queue">Queue</option>
                  <option value="Heap">Heap</option>
                  <option value="Bit Manipulation">Bit Manipulation</option>
                  <option value="Math">Math</option>
                  <option value="Two Pointers">Two Pointers</option>
                  <option value="Graph Traversal">Graph Traversal</option>
                  <option value="Trie">Trie</option>
                  <option value="Union Find">Union Find</option>
                  <option value="Segment Tree">Segment Tree</option>
                  <option value="Matrix">Matrix</option>
                  <option value="String">String</option>
                  <option value="Binary Tree">Binary Tree</option>
                  <option value="Depth-First Search">Depth-First Search</option>
                  <option value="Breadth-First Search">Breadth-First Search</option>
                </select>
              </div>
            </div>
          </motion.section>

          {/* SECTION 2: TEST CASES */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#111] rounded-[2.5rem] border border-white/5 p-10">
            <SectionHeader icon={Beaker} title="Logical Validation" subtitle="Visible & Hidden Test Cases" />
            
            <div className="space-y-10">
              {/* Visible Cases */}
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Visible Cases</h3>
                  <button type="button" onClick={() => appendVisible({ input: '', output: '', explanation: '' })} className="text-orange-500 text-xs font-black">
                    + ADD EXAMPLE
                  </button>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  {visibleFields.map((field, index) => (
                    <div key={field.id} className="relative bg-black/20 border border-white/5 p-6 rounded-3xl group">
                      <button type="button" onClick={() => removeVisible(index)} className="absolute top-4 right-4 text-gray-600 hover:text-red-500">
                        <Trash2 size={18} />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <textarea 
                          {...register(`visibleTestCases.${index}.input`)} 
                          placeholder="Input: nums = [1,2,3,4,5], k = 2" 
                          className="bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm font-mono h-24 resize-none" 
                          onKeyDown={(e) => e.stopPropagation()} 
                        />
                        <textarea 
                          {...register(`visibleTestCases.${index}.output`)} 
                          placeholder="Output: [4,5,1,2,3]" 
                          className="bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm font-mono h-24 resize-none" 
                          onKeyDown={(e) => e.stopPropagation()}
                        />
                        <textarea {...register(`visibleTestCases.${index}.explanation`)} placeholder="Explanation..." className="md:col-span-2 bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm h-20 resize-none" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hidden Cases */}
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Hidden Validation</h3>
                  <button type="button" onClick={() => appendHidden({ input: '', output: '' })} className="text-orange-500 text-xs font-black">
                    + ADD SYSTEM CASE
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {hiddenFields.map((field, index) => (
                    <div key={field.id} className="bg-black/20 p-4 rounded-2xl border border-white/5 space-y-3 relative">
                      <button type="button" onClick={() => removeHidden(index)} className="absolute top-2 right-2 text-gray-600"><Trash2 size={14}/></button>
                      <textarea {...register(`hiddenTestCases.${index}.input`)} placeholder="Input" className="w-full bg-white/5 rounded-lg px-3 py-2 text-xs font-mono h-20 resize-none" />
                      <textarea {...register(`hiddenTestCases.${index}.output`)} placeholder="Output" className="w-full bg-white/5 rounded-lg px-3 py-2 text-xs font-mono h-16 resize-none" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>

          {/* SECTION 3: CODE TEMPLATES & FUNCTION SIGNATURES */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#111] rounded-[2.5rem] border border-white/5 p-10">
            <SectionHeader icon={Code2} title="Code Templates" subtitle="LeetCode-Style Function Signatures & Solutions" />
            
            <div className="space-y-12">
              {[0, 1, 2].map((index) => {
                const lang = index === 0 ? 'C++' : index === 1 ? 'Java' : 'JavaScript';
                const templates = getSignatureTemplates(lang);
                
                return (
                  <div key={index} className="space-y-6 border-l-2 border-white/5 pl-8 ml-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black text-orange-500">{lang[0]}</div>
                      <h3 className="font-black text-white uppercase tracking-[0.2em] text-xs">{lang} Configuration</h3>
                    </div>
                    
                    {/* NEW: Function Signature Field */}
                    <div className="space-y-2 bg-black/20 border border-orange-500/20 rounded-2xl p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Signature size={16} className="text-orange-500" />
                        <label className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">Function Signature (Required)</label>
                      </div>
                      
                      <input 
                        {...register(`functionSignature.${index}.signature`)} 
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-cyan-400 focus:border-orange-500/50 outline-none" 
                        placeholder={templates[0] || `e.g., void rotate(vector<int>& nums, int k)`}
                      />
                      
                      {errors.functionSignature?.[index]?.signature && (
                        <p className="text-red-500 text-[10px] font-bold mt-1">{errors.functionSignature[index].signature.message}</p>
                      )}
                      
                      {/* Quick Templates */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="text-[9px] text-gray-600 uppercase tracking-wider mr-2">Quick:</span>
                        {templates.map((template, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              const currentValues = watch('functionSignature');
                              currentValues[index].signature = template;
                              reset({ ...watch(), functionSignature: currentValues });
                            }}
                            className="text-[9px] px-2 py-1 bg-white/5 hover:bg-white/10 rounded-md text-gray-400 hover:text-orange-500 transition-colors"
                          >
                            {template.split('(')[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 ml-1">STARTING TEMPLATE (LeetCode-style class)</label>
                        <textarea 
                          {...register(`startCode.${index}.initialCode`)} 
                          className="w-full bg-black border border-white/10 rounded-2xl p-6 font-mono text-xs leading-relaxed h-64 focus:border-orange-500/50 outline-none text-emerald-400" 
                          placeholder={lang === 'C++' ? `class Solution {\npublic:\n    void rotate(vector<int>& nums, int k) {\n        \n    }\n};` : 
                                     lang === 'Java' ? `class Solution {\n    public void rotate(int[] nums, int k) {\n        \n    }\n}` :
                                     `class Solution {\n    rotate(nums: number[], k: number): void {\n        \n    }\n}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 ml-1">REFERENCE SOLUTION (Complete LeetCode-style class)</label>
                        <textarea 
                          {...register(`referenceSolution.${index}.completeCode`)} 
                          className="w-full bg-black border border-white/10 rounded-2xl p-6 font-mono text-xs leading-relaxed h-64 focus:border-orange-500/50 outline-none text-blue-400" 
                          placeholder={`// ${lang} complete solution in class format...`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.section>

          <div className="pt-10">
            <button 
              type="button" 
              onClick={handleSubmit(onSubmit, (err) => console.log("Form Errors:", err))}
              className="w-full bg-white hover:bg-orange-500 text-black py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] transition-all text-sm shadow-2xl hover:shadow-orange-500/20"
            >
              {defaultProblem ? "Finalize Update" : "Confirm & Deploy Problem"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminPanel;