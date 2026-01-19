import { useState, useEffect } from 'react';
import axiosClient from '../utils/axiosClient';

const SubmissionHistory = ({ problemId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get(`/problem/submittedProblem/${problemId}`);
        setSubmissions(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch submission history');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [problemId]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'badge-success text-success-content';
      case 'wrong': return 'badge-error text-error-content';
      case 'error': return 'badge-warning text-warning-content';
      case 'pending': return 'badge-info text-info-content';
      default: return 'badge-neutral';
    }
  };

  const formatMemory = (memory) => {
    if (memory < 1024) return `${memory} kB`;
    return `${(memory / 1024).toFixed(2)} MB`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-80 gap-4">
        <span className="loading loading-ring loading-lg text-primary"></span>
        <p className="text-sm font-medium animate-pulse text-base-content/60">Retrieving submissions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error shadow-lg max-w-2xl mx-auto my-8 border-none bg-red-50 text-red-800">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-medium">{error}</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Submission History</h2>
          <p className="text-base-content/60 mt-1">Review your previous attempts and performance metrics.</p>
        </div>
        <div className="stat bg-base-100 border border-base-300 rounded-box py-2 px-6 shadow-sm w-fit">
          <div className="stat-title text-xs font-bold uppercase">Total Attempts</div>
          <div className="stat-value text-2xl text-primary">{submissions.length}</div>
        </div>
      </div>
      
      {submissions.length === 0 ? (
        <div className="bg-base-200/50 rounded-3xl p-12 text-center border-2 border-dashed border-base-300">
          <div className="bg-base-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold">No submissions yet</h3>
          <p className="text-base-content/60 max-w-xs mx-auto mt-2">Start solving the problem to see your history here.</p>
        </div>
      ) : (
        <div className="bg-base-100 border border-base-200 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-md w-full">
              <thead className="bg-base-200/50 text-base-content/70">
                <tr>
                  <th className="rounded-none">Status</th>
                  <th>Language</th>
                  <th>Runtime</th>
                  <th>Memory</th>
                  <th>Pass Rate</th>
                  <th>Submitted At</th>
                  <th className="text-right rounded-none px-6">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-200">
                {submissions.map((sub) => (
                  <tr key={sub._id} className="hover:bg-base-200/30 transition-colors group">
                    <td>
                      <div className={`badge badge-sm font-bold uppercase tracking-wider py-3 px-3 ${getStatusColor(sub.status)}`}>
                        {sub.status}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-ghost font-mono text-xs uppercase tracking-widest">{sub.language}</span>
                    </td>
                    <td className="font-mono text-sm">{sub.runtime}s</td>
                    <td className="font-mono text-sm">{formatMemory(sub.memory)}</td>
                    <td>
                      <div className="flex flex-col gap-1 w-24">
                        <div className="flex justify-between text-[10px] font-bold opacity-70">
                          <span>{Math.round((sub.testCasesPassed / sub.testCasesTotal) * 100)}%</span>
                          <span>{sub.testCasesPassed}/{sub.testCasesTotal}</span>
                        </div>
                        <progress 
                          className={`progress w-full h-1.5 ${sub.status === 'accepted' ? 'progress-success' : 'progress-primary'}`} 
                          value={sub.testCasesPassed} 
                          max={sub.testCasesTotal}
                        ></progress>
                      </div>
                    </td>
                    <td className="text-sm opacity-70 italic">{formatDate(sub.createdAt)}</td>
                    <td className="text-right px-6">
                      <button 
                        className="btn btn-sm btn-ghost group-hover:btn-primary border-base-300"
                        onClick={() => setSelectedSubmission(sub)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        Code
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Code View Modal */}
      {selectedSubmission && (
        <div className="modal modal-open backdrop-blur-sm bg-base-900/30">
          <div className="modal-box w-11/12 max-w-5xl p-0 overflow-hidden border border-base-300 shadow-2xl bg-base-100">
            {/* Modal Header */}
            <div className="bg-base-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-base-300">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-base-100 shadow-inner`}>
                   <div className={`w-3 h-3 rounded-full animate-pulse ${selectedSubmission.status === 'accepted' ? 'bg-success' : 'bg-error'}`}></div>
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-none">Submission Details</h3>
                  <p className="text-xs opacity-60 font-mono mt-1 uppercase tracking-widest">{selectedSubmission.language} • {formatDate(selectedSubmission.createdAt)}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="badge badge-outline border-base-300 font-mono text-xs py-3">Runtime: {selectedSubmission.runtime}s</div>
                <div className="badge badge-outline border-base-300 font-mono text-xs py-3">Memory: {formatMemory(selectedSubmission.memory)}</div>
              </div>
            </div>
            
            <div className="p-6">
              {selectedSubmission.errorMessage && (
                <div className="alert alert-error mb-4 py-3 rounded-xl bg-red-50 text-red-700 border-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-sm font-mono whitespace-pre-wrap">{selectedSubmission.errorMessage}</span>
                </div>
              )}

              <div className="relative group">
                <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <kbd className="kbd kbd-sm bg-base-100 text-xs">SOURCE CODE</kbd>
                </div>
                <div className="rounded-xl overflow-hidden bg-[#1e1e1e] border border-white/10 shadow-inner">
                  <div className="flex gap-1.5 px-4 py-3 bg-white/5 border-b border-white/5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                  </div>
                  <pre className="p-6 text-sm font-mono text-blue-100 overflow-x-auto leading-relaxed scrollbar-thin scrollbar-thumb-white/10">
                    <code>{selectedSubmission.code}</code>
                  </pre>
                </div>
              </div>
            </div>
            
            <div className="modal-action px-6 py-4 bg-base-200/50 border-t border-base-300">
              <button 
                className="btn btn-outline btn-sm px-6 hover:bg-base-content hover:text-base-100"
                onClick={() => setSelectedSubmission(null)}
              >
                Close Window
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setSelectedSubmission(null)}></div>
        </div>
      )}
    </div>
  );
};

export default SubmissionHistory;