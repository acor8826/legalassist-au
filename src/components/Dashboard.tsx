import React, { useState } from "react";
import CreateCaseFileModal from "./CreateCaseFileModal";
import DocumentCard from "./DocumentCard";

export default function Dashboard() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Welcome message */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-2">
          Welcome back. Let's work on your case — your AI assistant is here to help.
        </h2>
        <p className="text-slate-600">
          Upload, organise, and understand your legal documents with AI assistance powered by ChatGPT and Claude.
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition">
          <h3 className="font-semibold text-sky-700 mb-1">Upload a Court Form</h3>
          <p className="text-sm text-slate-600">
            Drag and drop or browse files. We'll suggest tags and next steps.
          </p>
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

      {/* Case files section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">My Case Files</h3>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-sky-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-sky-700 transition"
          >
            + New Case File
          </button>
        </div>

        {/* DocumentCard: shows Google Drive folders/files */}
        <DocumentCard />

        {/* Modal for creating a new case file */}
        <CreateCaseFileModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </div>
    </div>
  );
}
