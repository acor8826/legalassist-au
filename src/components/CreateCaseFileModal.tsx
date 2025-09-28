import React, { useState } from "react";

interface CreateCaseFileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateCaseFileModal({ isOpen, onClose }: CreateCaseFileModalProps) {
  const [path, setPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!path.trim()) return;

    try {
      setLoading(true);
      setMessage(null);

      const res = await fetch(`https://api.bespoke-apothecaries.com.au/create?path=${encodeURIComponent(path)}`, {
        method: "POST",
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json",
          "x-tenant-id": "your-tenant-id-here", // TODO: wire in dynamically
          "x-case-id": "your-case-id-here",     // TODO: wire in dynamically
        },
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ Folder created: ${data.path}`);
        setPath("");
      } else {
        setMessage(`❌ Error: ${data.detail || "Unknown error"}`);
      }
    } catch (err) {
      setMessage(`❌ Unexpected error: ${String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Create New Case File</h2>

        <label className="block text-sm text-slate-600 mb-1">Case Path</label>
        <input
          type="text"
          placeholder="e.g. Case001/Discovery/Scans"
          value={path}
          onChange={(e) => setPath(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />

        {message && (
          <div className="text-sm mb-3">{message}</div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-slate-300 hover:bg-slate-100"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm rounded-lg bg-sky-600 text-white hover:bg-sky-700 focus:ring-2 focus:ring-sky-400 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
