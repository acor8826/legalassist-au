import React from "react";

export default function Footer() {
  console.log('[Footer] Rendered - Window width:', window.innerWidth);
  console.log('[Footer] Should be visible on mobile:', window.innerWidth >= 768);

  return (
    <footer className="hidden md:block p-4 text-xs text-center text-slate-500 border-t border-slate-200 flex-shrink-0 bg-white">
      Your documents are securely stored in Australia. AI assistance is provided by ChatGPT, Claude, and other trusted systems.
      <div className="mt-1">
        <a href="#" className="underline hover:text-slate-700">Privacy Policy</a>
        {" | "}
        <a href="#" className="underline hover:text-slate-700">Accessibility</a>
        {" | "}
        <a href="#" className="underline hover:text-slate-700">Legal Aid Resources</a>
      </div>
    </footer>
  );
}