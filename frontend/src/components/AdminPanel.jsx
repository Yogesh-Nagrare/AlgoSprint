import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../utils/axiosClient';
import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Code2, Beaker, FileText, ChevronLeft, Save } from 'lucide-react';

const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.enum(['array', 'linkedList', 'graph', 'dp']),
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
  const { register, control, reset, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      title: '', description: '', difficulty: 'easy', tags: 'array',
      visibleTestCases: [{ input: '', output: '', explanation: '' }],
      hiddenTestCases: [{ input: '', output: '' }],
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

  useEffect(() => {
    if (!defaultProblem) return;
    reset(defaultProblem);
    if (defaultProblem.visibleTestCases) replaceVisible(defaultProblem.visibleTestCases);
    if (defaultProblem.hiddenTestCases) replaceHidden(defaultProblem.hiddenTestCases);
  }, [defaultProblem, reset, replaceVisible, replaceHidden]);

const onSubmit = async (data) => {
  //  LOG 1: See the raw data from the form
  console.log("1. Form Data:", data);

  const { _id, __v, createdAt, updatedAt, ...cleanData } = data;
  
  //  LOG 2: See the cleaned data actually being sent
  console.log("2. Sending to Server:", cleanData);

  try {
    const isUpdate = !!defaultProblem?._id;
    const endpoint = isUpdate ? `/problem/update/${defaultProblem._id}` : '/problem/create';
    const method = isUpdate ? 'put' : 'post';

    await axiosClient[method](endpoint, cleanData);
    alert('Success!');
    navigate('/admin');
  } catch (error) {
    // 🔴 LOG 3: See the full error object from the server
    console.error("3. Server Error Object:", error.response);
    console.log("4. Server Error Data:", error.response?.data);
    
    alert("Check the browser console (F12) for the full error logs.");
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
              onClick={handleSubmit(onSubmit)}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-black px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-orange-500/20"
            >
              <Save size={18} /> {defaultProblem ? "Save Changes" : "Publish Problem"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6">
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
                  <option value="array">Arrays</option>
                  <option value="linkedList">Linked List</option>
                  <option value="graph">Graphs</option>
                  <option value="dp">Dynamic Programming</option>
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
                          placeholder="Input: Use [1,2,3] or plain text like '3\n1 2 3'" 
                          className="bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm font-mono h-24 resize-none" 
                          onKeyDown={(e) => e.stopPropagation()} 
                        />
                        <textarea 
                          {...register(`visibleTestCases.${index}.output`)} 
                          placeholder="Expected Output" 
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


          {/* SECTION 3: CODE TEMPLATES */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#111] rounded-[2.5rem] border border-white/5 p-10">
            <SectionHeader icon={Code2} title="Code Templates" subtitle="Polyglot Boilerplate & Solutions" />
            
            <div className="space-y-12">
              {[0, 1, 2].map((index) => {
                const lang = index === 0 ? 'C++' : index === 1 ? 'Java' : 'JavaScript';
                return (
                  <div key={index} className="space-y-6 border-l-2 border-white/5 pl-8 ml-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black text-orange-500">{lang[0]}</div>
                      <h3 className="font-black text-white uppercase tracking-[0.2em] text-xs">{lang} Configuration</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 ml-1">STARTING TEMPLATE</label>
                        <textarea {...register(`startCode.${index}.initialCode`)} className="w-full bg-black border border-white/10 rounded-2xl p-6 font-mono text-xs leading-relaxed h-64 focus:border-orange-500/50 outline-none text-emerald-400" placeholder={`// ${lang} initial code here...`} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 ml-1">REFERENCE SOLUTION</label>
                        <textarea {...register(`referenceSolution.${index}.completeCode`)} className="w-full bg-black border border-white/10 rounded-2xl p-6 font-mono text-xs leading-relaxed h-64 focus:border-orange-500/50 outline-none text-blue-400" placeholder={`// ${lang} complete solution...`} />
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
              onClick={handleSubmit(onSubmit)}
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