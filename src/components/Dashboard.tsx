import React from 'react';
import DocumentCard from './DocumentCard';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-2">Welcome back. Let's work on your case — your AI assistant is here to help.</h2>
        <p className="text-slate-600">Upload, organise, and understand your legal documents with AI assistance powered by ChatGPT and Claude.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition">
          <h3 className="font-semibold text-sky-700 mb-1">Upload a Court Form</h3>
          <p className="text-sm text-slate-600">Drag and drop or browse files. We'll suggest tags and next steps.</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition">
          <h3 className="font-semibold text-sky-700 mb-1">Ask AI About My Case</h3>
          <p className="text-sm text-slate-600">Get plain-English explanations and action plans.</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition">
          <h3 className="font-semibold text-sky-700 mb-1">Check Deadlines</h3>
          <p className="text-sm text-slate-600">Track filings and reminders. Never miss a due date.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Recent documents</h3>
        {/* Single DocumentCard component that fetches and displays Google Drive folders */}
        <DocumentCard />
      </div>
    </div>
  );
}