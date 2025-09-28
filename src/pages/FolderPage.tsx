import React, { useEffect, useState } from "react";
import api, { Folder } from "../api/folders";

interface FileItem {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
}

export default function FolderPage() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [showOptions, setShowOptions] = useState(false);

  // Fetch root folders initially
  useEffect(() => {
    setLoading(true);
    api
      .get<{ folders: Folder[] }>("/list")
      .then((res) => {
        setFolders(res.data.folders);
      })
      .catch((err) => console.error("Error fetching folders:", err))
      .finally(() => setLoading(false));
  }, []);

  // Fetch files for the selected folder
  const openFolder = (folder: Folder) => {
    setSelectedFolder(folder);
    setLoading(true);
    api
      .get<{ files: FileItem[] }>(`/files?folderId=${folder.id}`)
      .then((res) => setFiles(res.data.files))
      .catch((err) => console.error("Error fetching files:", err))
      .finally(() => setLoading(false));
  };

  // Handle file upload
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !selectedFolder) return;

    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    formData.append("folderId", selectedFolder.id);

    try {
      await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Refresh files
      openFolder(selectedFolder);
    } catch (error) {
      console.error("Upload failed", error);
    }
  };

  return (
    <div className="flex">
      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">
          {selectedFolder ? selectedFolder.name : "My Case Files"}
        </h1>

        {loading && <p className="text-slate-500">Loading...</p>}

        {!selectedFolder && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="border rounded-lg p-4 cursor-pointer hover:border-sky-400"
                onClick={() => openFolder(folder)}
              >
                <h2 className="font-bold text-lg text-sky-700 hover:underline">
                  {folder.name}
                </h2>
              </div>
            ))}
          </div>
        )}

        {selectedFolder && (
          <div>
            <button
              className="mb-4 text-sm text-sky-600 hover:underline"
              onClick={() => setSelectedFolder(null)}
            >
              ← Back to Case Files
            </button>

            {/* Upload Button */}
            <div className="mb-4">
              <label className="px-4 py-2 bg-sky-600 text-white rounded cursor-pointer">
                Upload File
                <input
                  type="file"
                  className="hidden"
                  onChange={handleUpload}
                />
              </label>
            </div>

            {/* Files List */}
            <ul className="space-y-2">
              {files.map((file) => (
                <li key={file.id} className="border p-3 rounded">
                  <a
                    href={file.webViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-700 hover:underline font-medium"
                  >
                    {file.name}
                  </a>
                  <p className="text-xs text-slate-500">{file.mimeType}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Side Options Slider */}
      <div
        className={`transition-all duration-300 w-64 bg-slate-50 border-l p-4 ${
          showOptions ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <h3 className="font-bold text-lg mb-4">Options</h3>
        <button className="block mb-2 text-sky-600 hover:underline">
          Share Folder
        </button>
        <button className="block mb-2 text-sky-600 hover:underline">
          Rename Folder
        </button>
        <button className="block mb-2 text-sky-600 hover:underline">
          Delete Folder
        </button>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="fixed top-1/2 right-0 bg-sky-600 text-white px-3 py-1 rounded-l"
      >
        {showOptions ? ">" : "<"}
      </button>
    </div>
  );
}
