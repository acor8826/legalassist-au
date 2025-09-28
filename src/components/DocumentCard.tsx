import React from 'react';

export default function DocumentCard({ doc }: { doc: any }) {
  return (
    <div className="border border-slate-200 rounded-lg p-4 hover:border-sky-300 transition">
      <h4 className="font-medium text-slate-800">{doc.title}</h4>
      <p className="text-sm text-slate-500">{doc.type} • {doc.date}</p>
      <p className="text-sm text-sky-700 mt-1 italic">{doc.suggestion}</p>
      <button className="text-xs mt-2 text-sky-600 hover:underline">Preview</button>
    </div>
  );
}
