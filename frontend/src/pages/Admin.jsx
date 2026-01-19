import React from 'react';
import { Plus, Edit, Trash2, Home, Video, ChevronRight, LayoutGrid, Layers } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router';
import { motion } from 'framer-motion';

function Admin() {
  const navigate = useNavigate();

  const adminOptions = [
    {
      id: 'create',
      title: 'Create Problem',
      description: 'Architect a new challenge with test cases and constraints.',
      icon: Plus,
      accent: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/10',
      route: '/admin/create'
    },
    {
      id: 'update',
      title: 'Update Problem',
      description: 'Refine details, adjust difficulty, or fix problem statements.',
      icon: Edit,
      accent: 'from-orange-400 to-orange-600',
      shadow: 'shadow-orange-500/10',
      route: '/admin/update'
    },
    {
      id: 'delete',
      title: 'Delete Problem',
      description: 'Permanently remove inactive or deprecated problems.',
      icon: Trash2,
      accent: 'from-red-500 to-rose-600',
      shadow: 'shadow-red-500/10',
      route: '/admin/delete'
    },
    {
      id: 'video',
      title: 'Video Problem',
      description: 'Manage video editorials and visual solution guides.',
      icon: Video,
      accent: 'from-blue-500 to-indigo-600',
      shadow: 'shadow-blue-500/10',
      route: '/admin/video'
    },
    {
      id: 'sheet',
      title: 'Create Sheet',
      description: 'Build curated DSA sheets with topics and problem collections.',
      icon: Layers,
      accent: 'from-purple-500 to-violet-600',
      shadow: 'shadow-purple-500/10',
      route: '/admin/sheet'
    },
    // ... existing imports
    {
      id: 'update-sheet',
      title: 'Update Sheet',
      description: 'Modify existing DSA sheets, add topics, or reorder problems.',
      icon: Edit, // Use Lucide Edit icon
      accent: 'from-blue-500 to-cyan-600',
      shadow: 'shadow-blue-500/10',
      route: '/admin/sheets/manage' // Navigate to a list of sheets first
    },
    {
      id: 'delete-sheet',
      title: 'Delete Sheet',
      description: 'Remove outdated or incorrect DSA sheets from the platform.',
      icon: Trash2,
      accent: 'from-pink-500 to-red-600',
      shadow: 'shadow-red-500/10',
      route: '/admin/sheets/manage'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 selection:bg-orange-500/30 overflow-hidden relative">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-orange-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="container mx-auto px-6 py-12 relative z-10">
        
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-16">
          <button 
            onClick={() => navigate('/')}
            className="group flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-colors"
          >
            <div className="p-2 rounded-lg bg-white/5 border border-white/5 group-hover:border-white/20 transition-all">
               <Home size={14} />
            </div>
            Back to Dashboard
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">Systems Active</span>
          </div>
        </div>

        {/* Hero Section */}
        <header className="max-w-3xl mb-16">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tighter"
          >
            Control <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Center.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg leading-relaxed border-l-2 border-white/10 pl-6"
          >
            Manage the CodeMaster ecosystem. Monitor problem sets, 
            update algorithmic challenges, and maintain content quality.
          </motion.p>
        </header>

        {/* Options Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {adminOptions.map((option) => (
            <motion.div
              key={option.id}
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
              className={`group relative bg-[#111] rounded-[2rem] border border-white/5 p-1 overflow-hidden transition-all hover:border-white/10 ${option.shadow}`}
            >
              <NavLink to={option.route} className="flex items-center p-8 h-full">
                {/* Icon Box */}
                <div className={`mr-8 p-5 rounded-2xl bg-gradient-to-br ${option.accent} text-black transform group-hover:rotate-12 transition-transform duration-500`}>
                  <option.icon size={28} strokeWidth={2.5} />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-orange-400 transition-colors">
                    {option.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-[250px]">
                    {option.description}
                  </p>
                </div>

                {/* Arrow Icon */}
                <div className="opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all text-orange-500">
                  <ChevronRight size={24} />
                </div>
              </NavLink>

              {/* Decorative Background Element */}
              <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br ${option.accent} opacity-[0.03] rounded-full blur-2xl group-hover:opacity-10 transition-opacity`}></div>
            </motion.div>
          ))}
        </motion.div>

        {/* System Stats Footer Area */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-20 pt-8 border-t border-white/5 flex flex-wrap gap-12"
        >
           <div className="flex flex-col">
              <span className="text-[10px] uppercase font-black tracking-widest text-gray-600 mb-1">Total Problems</span>
              <span className="text-2xl font-mono font-bold text-white">1,284</span>
           </div>
           <div className="flex flex-col">
              <span className="text-[10px] uppercase font-black tracking-widest text-gray-600 mb-1">Active Videos</span>
              <span className="text-2xl font-mono font-bold text-white">412</span>
           </div>
           <div className="flex flex-col">
              <span className="text-[10px] uppercase font-black tracking-widest text-gray-600 mb-1">Last Update</span>
              <span className="text-2xl font-mono font-bold text-white">02:14 PM</span>
           </div>
        </motion.div>

      </div>
    </div>
  );
}

export default Admin;