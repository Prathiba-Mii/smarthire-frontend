import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'https://smarthire-backend-8hgc.onrender.com';

function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [status, setStatus] = useState('Applied');
  const [jobUrl, setJobUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [aiJob, setAiJob] = useState({ company: '', position: '', skills: '', experience: '', notes: '' });
  const [coverLetter, setCoverLetter] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${API}/api/jobs`, { headers: getHeaders() });
      setJobs(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const addJob = async () => {
    try {
      await axios.post(`${API}/api/jobs`,
        { company, position, status, jobUrl, notes },
        { headers: getHeaders() }
      );
      setCompany(''); setPosition(''); setStatus('Applied');
      setJobUrl(''); setNotes(''); setShowForm(false);
      fetchJobs();
    } catch (err) {
      console.log(err);
    }
  };

  const deleteJob = async (id) => {
    try {
      await axios.delete(`${API}/api/jobs/${id}`, { headers: getHeaders() });
      fetchJobs();
    } catch (err) {
      console.log(err);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`${API}/api/jobs/${id}`,
        { status: newStatus },
        { headers: getHeaders() }
      );
      fetchJobs();
    } catch (err) {
      console.log(err);
    }
  };

  const generateCoverLetter = async () => {
    try {
      setAiLoading(true);
      const res = await axios.post(`${API}/api/ai/cover-letter`,
        { company: aiJob.company, position: aiJob.position, skills: aiJob.skills, experience: aiJob.experience, notes: aiJob.notes },
        { headers: getHeaders() }
      );
      setCoverLetter(res.data.coverLetter);
    } catch (err) {
      console.log(err);
      alert('AI error! Check backend.');
    } finally {
      setAiLoading(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const statusColor = {
    'Applied': 'bg-blue-100 text-blue-700',
    'Interview': 'bg-yellow-100 text-yellow-700',
    'Offer': 'bg-green-100 text-green-700',
    'Rejected': 'bg-red-100 text-red-700'
  };

  const counts = {
    Applied: jobs.filter(j => j.status === 'Applied').length,
    Interview: jobs.filter(j => j.status === 'Interview').length,
    Offer: jobs.filter(j => j.status === 'Offer').length,
    Rejected: jobs.filter(j => j.status === 'Rejected').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">SmartHire 🎯</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">Hi, {user.name}!</span>
          <button onClick={logout} className="bg-white text-indigo-600 px-4 py-1 rounded-lg text-sm font-semibold hover:bg-gray-100">
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-4 gap-4 mb-8">
          {Object.entries(counts).map(([key, val]) => (
            <div key={key} className="bg-white rounded-xl p-4 shadow-sm text-center">
              <p className="text-3xl font-bold text-indigo-600">{val}</p>
              <p className="text-gray-500 text-sm mt-1">{key}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-700">My Applications ({jobs.length})</h2>
          <div className="flex gap-3">
            <button
              onClick={() => { setShowAI(!showAI); setCoverLetter(''); }}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700"
            >
              ✨ AI Cover Letter
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700"
            >
              + Add Job
            </button>
          </div>
        </div>

        {showAI && (
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6 border-l-4 border-purple-500">
            <h3 className="text-lg font-bold text-purple-700 mb-4">✨ AI Cover Letter Generator</h3>
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="Company Name" value={aiJob.company}
                onChange={e => setAiJob({ ...aiJob, company: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500" />
              <input placeholder="Position" value={aiJob.position}
                onChange={e => setAiJob({ ...aiJob, position: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500" />
              <input placeholder="Your Skills (e.g. React, Node.js, MongoDB)" value={aiJob.skills}
                onChange={e => setAiJob({ ...aiJob, skills: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500 col-span-2" />
              <input placeholder="Your Experience (e.g. 1 year Frontend Developer at XYZ)" value={aiJob.experience}
                onChange={e => setAiJob({ ...aiJob, experience: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500 col-span-2" />
              <input placeholder="Any extra info? (optional)" value={aiJob.notes}
                onChange={e => setAiJob({ ...aiJob, notes: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500 col-span-2" />
            </div>
            <button onClick={generateCoverLetter} disabled={aiLoading}
              className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50">
              {aiLoading ? '✨ Generating...' : '✨ Generate Cover Letter'}
            </button>
            {coverLetter && (
              <div className="mt-4">
                <div className="bg-purple-50 rounded-lg p-4 text-gray-700 text-sm whitespace-pre-wrap">{coverLetter}</div>
                <button onClick={() => navigator.clipboard.writeText(coverLetter)}
                  className="mt-2 bg-gray-200 text-gray-700 px-4 py-1 rounded-lg text-sm hover:bg-gray-300">
                  📋 Copy to Clipboard
                </button>
              </div>
            )}
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <h3 className="text-lg font-bold text-gray-700 mb-4">Add New Application</h3>
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="Company Name" value={company} onChange={e => setCompany(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500" />
              <input placeholder="Position" value={position} onChange={e => setPosition(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500" />
              <select value={status} onChange={e => setStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500">
                <option>Applied</option>
                <option>Interview</option>
                <option>Offer</option>
                <option>Rejected</option>
              </select>
              <input placeholder="Job URL (optional)" value={jobUrl} onChange={e => setJobUrl(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500" />
              <input placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 col-span-2" />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={addJob} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700">Save</button>
              <button onClick={() => setShowForm(false)} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300">Cancel</button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {jobs.length === 0 && (
            <div className="bg-white rounded-xl p-8 shadow-sm text-center text-gray-400">
              No applications yet! Click "+ Add Job" to start tracking.
            </div>
          )}
          {jobs.map(job => (
            <div key={job._id} className="bg-white rounded-xl p-5 shadow-sm flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{job.position}</h3>
                <p className="text-gray-500">{job.company}</p>
                {job.notes && <p className="text-gray-400 text-sm mt-1">{job.notes}</p>}
                <p className="text-gray-300 text-xs mt-1">{new Date(job.appliedDate).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <select value={job.status} onChange={e => updateStatus(job._id, e.target.value)}
                  className={`px-3 py-1 rounded-full text-sm font-semibold border-0 ${statusColor[job.status]}`}>
                  <option>Applied</option>
                  <option>Interview</option>
                  <option>Offer</option>
                  <option>Rejected</option>
                </select>
                <button onClick={() => deleteJob(job._id)} className="text-red-400 hover:text-red-600 text-sm font-semibold">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;