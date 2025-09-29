import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/folders";

interface FileItem {
  id: number;
  name: string;
  mime_type: string;
  drive_web_view_link: string;
}

export default function FolderPage() {
  const { folderId } = useParams<{ folderId: string }>(); // ✅ Get folderId from URL
  const navigate = useNavigate();

  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch files when folderId changes
  useEffect(() => {
    if (!folderId) return;
    setLoading(true);

    api
      .get(`/contents-of-folder/${folderId}?page=1&per_page=50`)
      .then((res) => {
        setFiles(res.data.documents || []);
      })
      .catch((err) =>
        console.error(`Error fetching contents of folder ${folderId}:`, err)
      )
      .finally(() => setLoading(false));
  }, [folderId]);

  // Handle file upload
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !folderId) return;

    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    formData.append("folderId", folderId);

    try {
      await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Refresh files after upload
      const res = await api.get(`/contents-of-folder/${folderId}?page=1&per_page=50`);
      setFiles(res.data.documents || []);
    } catch (error) {
      console.error("Upload failed", error);
    }
  };

  return (
    <div className="p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-sm text-sky-600 hover:underline"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-4">Folder Contents</h1>

      {/* Upload Button */}
      <div className="mb-4">
        <label className="px-4 py-2 bg-sky-600 text-white rounded cursor-pointer">
          Upload File
          <input type="file" className="hidden" onChange={handleUpload} />
        </label>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading files...</p>
      ) : files.length === 0 ? (
        <p className="text-slate-500">No files in this folder.</p>
      ) : (
        <ul className="space-y-2">
          {files.map((file) => (
            <li key={file.id} className="border p-3 rounded">
              <a
                href={file.drive_web_view_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-700 hover:underline font-medium"
              >
                {file.name}
              </a>
              <p className="text-xs text-slate-500">{file.mime_type}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
