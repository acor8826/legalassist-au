import React from 'react';

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-white shadow-sm">
      <div className="text-lg font-bold text-sky-700">LegalAssist AU</div>
      <div className="flex gap-4 text-slate-600">
        <a href="#" className="hover:text-sky-700">Home</a>
        <a href="#" className="hover:text-sky-700">Documents</a>
        <a href="#" className="hover:text-sky-700">Upload</a>
        <a href="#" className="hover:text-sky-700">Support</a>
      </div>
    </nav>
  );
}
