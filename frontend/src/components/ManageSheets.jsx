import React, { useEffect, useState } from 'react';
import { Edit, Trash2, ArrowLeft, Loader2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router';
import axiosClient from '../utils/axiosClient';

function ManageSheets() {
    const [sheets, setSheets] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchSheets = async () => {
        try {
            const res = await axiosClient.get('/problem/sheets/all');
            setSheets(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSheets(); }, []);

    const handleDelete = async (sheetId) => {
        if (!window.confirm("Are you sure? This will delete the sheet and all user progress within it.")) return;
        try {
            await axiosClient.delete(`/problem/sheet/delete/${sheetId}`);
            setSheets(sheets.filter(s => s._id !== sheetId));
        } catch (err) {
            alert("Error deleting sheet: " + err.message);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
            <Loader2 className="animate-spin text-orange-500" size={40} />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft size={18} /> Back to Admin
                    </button>
                    <button 
                        onClick={() => navigate('/admin/sheet/create')}
                        className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-xl font-bold transition-all"
                    >
                        <Plus size={18} /> Create New Sheet
                    </button>
                </div>

                <h1 className="text-4xl font-black mb-8 tracking-tighter">Manage <span className="text-orange-500">Sheets.</span></h1>
                
                <div className="grid gap-4">
                    {sheets.map(sheet => (
                        <div key={sheet._id} className="bg-[#111] border border-white/5 p-6 rounded-[2rem] flex items-center justify-between group hover:border-orange-500/30 transition-all">
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors">{sheet.title}</h3>
                                <div className="flex gap-4 mt-1 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    <span>{sheet.totalProblems} Problems</span>
                                    <span>Slug: {sheet.slug}</span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => navigate(`/admin/sheet/edit/${sheet._id}`)}
                                    className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl hover:bg-blue-500 hover:text-white transition-all"
                                >
                                    <Edit size={20} />
                                </button>
                                <button 
                                    onClick={() => handleDelete(sheet._id)}
                                    className="p-3 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {sheets.length === 0 && <p className="text-center text-gray-600 py-20">No sheets found.</p>}
                </div>
            </div>
        </div>
    );
}

export default ManageSheets;