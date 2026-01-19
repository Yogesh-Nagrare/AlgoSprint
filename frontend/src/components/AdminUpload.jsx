import { useParams, useNavigate } from 'react-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import axiosClient from '../utils/axiosClient';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CloudUpload, 
  Video, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ChevronLeft, 
  FileVideo,
  Clock,
  Calendar
} from 'lucide-react';

function AdminUpload() {
  const { problemId } = useParams();
  const navigate = useNavigate();

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedVideo, setUploadedVideo] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setError,
    clearErrors
  } = useForm();

  const selectedFile = watch('videoFile')?.[0];

  const onSubmit = async (data) => {
    const file = data.videoFile[0];
    setUploading(true);
    setUploadProgress(0);
    clearErrors();

    try {
      const signatureResponse = await axiosClient.get(`/video/create/${problemId}`);
      const { signature, timestamp, public_id, api_key, cloud_name, upload_url } = signatureResponse.data;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp);
      formData.append('public_id', public_id);
      formData.append('api_key', api_key);

      const uploadResponse = await axios.post(upload_url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      const cloudinaryResult = uploadResponse.data;

      const metadataResponse = await axiosClient.post('/video/save', {
        problemId: problemId,
        cloudinaryPublicId: cloudinaryResult.public_id,
        secureUrl: cloudinaryResult.secure_url,
        duration: cloudinaryResult.duration,
      });

      setUploadedVideo(metadataResponse.data.videoSolution);
      reset();
    } catch (err) {
      console.error('Upload error:', err);
      setError('root', {
        type: 'manual',
        message: err.response?.data?.message || 'Upload failed. Please try again.'
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 pb-20 selection:bg-orange-500/30">
      <div className="max-w-xl mx-auto px-6 pt-12">
        
        {/* Navigation */}
        <button 
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-white transition-all mb-8"
        >
          <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Return to Assets
        </button>

        {/* Header */}
        <div className="mb-10 text-center">
            <div className="inline-flex p-4 bg-orange-500/10 rounded-3xl text-orange-500 mb-6">
                <Video size={32} />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter">Media <span className="text-orange-500">Gateway.</span></h1>
            <p className="text-gray-500 text-sm mt-2 font-medium">Attach video editorials for Problem ID: <span className="text-gray-300 font-mono">{problemId.slice(-8)}</span></p>
        </div>

        {/* Main Upload Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111] rounded-[2.5rem] border border-white/5 p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Progress Overlay Background */}
          {uploading && (
             <motion.div 
                initial={{ height: 0 }} 
                animate={{ height: `${uploadProgress}%` }} 
                className="absolute bottom-0 left-0 w-1 bg-orange-500/50 transition-all duration-300" 
             />
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Custom Styled File Input */}
            <div className="relative group">
              <input
                type="file"
                accept="video/*"
                {...register('videoFile', {
                  required: 'Please select a video file',
                  validate: {
                    isVideo: (files) => !files[0] || files[0].type.startsWith('video/') || 'Invalid video format',
                    fileSize: (files) => !files[0] || files[0].size <= 100 * 1024 * 1024 || 'Size limit 100MB'
                  }
                })}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              
              <div className={`
                border-2 border-dashed rounded-[2rem] p-12 text-center transition-all duration-300
                ${errors.videoFile ? 'border-red-500/50 bg-red-500/5' : 'border-white/5 bg-black/20 group-hover:border-orange-500/30 group-hover:bg-orange-500/5'}
                ${selectedFile ? 'border-emerald-500/30 bg-emerald-500/5' : ''}
              `}>
                <div className="flex flex-col items-center gap-4">
                  <div className={`p-4 rounded-2xl ${selectedFile ? 'text-emerald-500 bg-emerald-500/10' : 'text-gray-600 bg-white/5'}`}>
                    {selectedFile ? <FileVideo size={32} /> : <CloudUpload size={32} />}
                  </div>
                  {selectedFile ? (
                    <div>
                        <p className="text-sm font-bold text-white">{selectedFile.name}</p>
                        <p className="text-[10px] font-black uppercase text-gray-500 mt-1 tracking-widest">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  ) : (
                    <div>
                        <p className="text-sm font-bold text-gray-300">Click to browse or drag & drop</p>
                        <p className="text-[10px] font-medium text-gray-600 mt-1 uppercase tracking-tighter">MP4, WEBM or OGG (Max 100MB)</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {errors.videoFile && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-red-500 text-xs font-bold px-2">
                <AlertCircle size={14} /> {errors.videoFile.message}
              </motion.div>
            )}

            {/* Upload Progress */}
            <AnimatePresence>
                {uploading && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3">
                    <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">Transmitting Data...</span>
                        <span className="text-sm font-mono font-bold text-white">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <motion.div 
                            className="bg-orange-500 h-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                </motion.div>
                )}
            </AnimatePresence>

            {/* Success State */}
            <AnimatePresence>
                {uploadedVideo && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 space-y-4">
                    <div className="flex items-center gap-3 text-emerald-500">
                        <CheckCircle2 size={20} />
                        <span className="text-xs font-black uppercase tracking-widest">Upload Finalized</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                            <Clock size={14} className="text-gray-500" />
                            <div className="flex flex-col">
                                <span className="text-[9px] uppercase text-gray-600 font-bold">Duration</span>
                                <span className="text-xs font-bold text-white">{formatDuration(uploadedVideo.duration)}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Calendar size={14} className="text-gray-500" />
                            <div className="flex flex-col">
                                <span className="text-[9px] uppercase text-gray-600 font-bold">Timestamp</span>
                                <span className="text-xs font-bold text-white">Today</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
                )}
            </AnimatePresence>

            {/* Error Message */}
            {errors.root && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold flex items-center gap-3">
                <AlertCircle size={16} /> {errors.root.message}
              </div>
            )}

            {/* Action Button */}
            <button
              type="submit"
              disabled={uploading}
              className={`
                w-full py-4 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3
                ${uploading 
                  ? 'bg-white/5 text-gray-600 cursor-not-allowed' 
                  : 'bg-white text-black hover:bg-orange-500 hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]'}
              `}
            >
              {uploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Synchronizing
                </>
              ) : (
                <>
                  <CloudUpload size={16} />
                  Initiate Upload
                </>
              )}
            </button>
          </form>
        </motion.div>
        
        {/* Footer info */}
        <p className="text-center text-gray-600 text-[10px] mt-8 font-medium uppercase tracking-widest">
           Secure Encrypted Tunnel • Cloudinary Asset Management
        </p>
      </div>
    </div>
  );
}

export default AdminUpload;