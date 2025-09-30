import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FileText, Image, File, Video, Music, Archive, ChevronLeft, Upload, Grid, List, FolderPlus, Folder } from "lucide-react";
import api from "../api/folders";

interface FileItem {
  id: string;
  name: string;
  mime_type: string;
  drive_web_view_link: string;
}

export default function FolderPage() {
  const { folderId } = useParams<{ folderId: string }>();
  const navigate = useNavigate();

  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folderName, setFolderName] = useState('Folder Contents');

  useEffect(() => {
    console.log('FolderPage: folderId changed to:', folderId);
    if (!folderId) return;
    setLoading(true);

    api.get(`/contents-of-folder/${folderId}?page=1&per_page=50`)
      .then((res) => {
        console.log('API Response:', res.data);
        setFiles(res.data.documents || []);
        if (res.data.folderName) setFolderName(res.data.folderName);
      })
      .catch((err) => console.error(`Error fetching contents:`, err))
      .finally(() => setLoading(false));
  }, [folderId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !folderId) return;
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    formData.append("folderId", folderId);

    try {
      await api.post("/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
      const res = await api.get(`/contents-of-folder/${folderId}?page=1&per_page=50`);
      setFiles(res.data.documents || []);
    } catch (error) {
      console.error("Upload failed", error);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !folderId) return;
    try {
      await api.post("/create-folder", { name: newFolderName, parentId: folderId });
      const res = await api.get(`/contents-of-folder/${folderId}?page=1&per_page=50`);
      setFiles(res.data.documents || []);
      setNewFolderName('');
      setShowCreateFolder(false);
    } catch (error) {
      console.error("Create folder failed", error);
    }
  };

  const isFolder = (mimeType: string) => mimeType === 'application/vnd.google-apps.folder';

  const getFileIcon = (mimeType: string) => {
    if (isFolder(mimeType)) return <Folder className="w-5 h-5" />;
    if (mimeType.includes('image')) return <Image className="w-5 h-5" />;
    if (mimeType.includes('video')) return <Video className="w-5 h-5" />;
    if (mimeType.includes('audio')) return <Music className="w-5 h-5" />;
    if (mimeType.includes('pdf') || mimeType.includes('document')) return <FileText className="w-5 h-5" />;
    if (mimeType.includes('zip') || mimeType.includes('compressed')) return <Archive className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const getFileColor = (mimeType: string) => {
    if (isFolder(mimeType)) return 'text-yellow-600 bg-yellow-50';
    if (mimeType.includes('image')) return 'text-blue-600 bg-blue-50';
    if (mimeType.includes('video')) return 'text-purple-600 bg-purple-50';
    if (mimeType.includes('audio')) return 'text-pink-600 bg-pink-50';
    if (mimeType.includes('pdf')) return 'text-red-600 bg-red-50';
    if (mimeType.includes('document')) return 'text-sky-600 bg-sky-50';
    if (mimeType.includes('sheet')) return 'text-green-600 bg-green-50';
    return 'text-slate-600 bg-slate-50';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          {/* Mobile Header */}
          <div className="flex flex-col gap-3 md:hidden">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate(-1)}
                className="
                  flex items-center gap-2 px-3 py-2
                  text-slate-600 hover:text-slate-900 hover:bg-slate-100
                  rounded-lg transition-all active:bg-slate-200
                  min-h-[44px]
                "
                aria-label="Go back"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="font-medium">Back</span>
              </button>
              <div className="flex items-center bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`
                    p-2 rounded transition-colors
                    min-w-[40px] min-h-[40px] flex items-center justify-center
                    ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-slate-200 active:bg-slate-300'}
                  `}
                  aria-label="Grid view"
                >
                  <Grid className="w-4 h-4 text-slate-700" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`
                    p-2 rounded transition-colors
                    min-w-[40px] min-h-[40px] flex items-center justify-center
                    ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-slate-200 active:bg-slate-300'}
                  `}
                  aria-label="List view"
                >
                  <List className="w-4 h-4 text-slate-700" />
                </button>
              </div>
            </div>
            <h1 className="text-lg font-semibold text-slate-900 truncate">{folderName}</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateFolder(true)}
                className="
                  flex-1 flex items-center justify-center gap-2
                  px-4 py-2.5 bg-white hover:bg-slate-50 active:bg-slate-100
                  text-slate-700 border border-slate-300
                  rounded-lg transition-all shadow-sm
                  min-h-[44px]
                "
              >
                <FolderPlus className="w-4 h-4" />
                <span className="font-medium">New</span>
              </button>
              <label className="
                flex-1 flex items-center justify-center gap-2
                px-4 py-2.5 bg-sky-600 hover:bg-sky-700 active:bg-sky-800
                text-white rounded-lg cursor-pointer transition-colors shadow-sm
                min-h-[44px]
              ">
                <Upload className="w-4 h-4" />
                <span className="font-medium">Upload</span>
                <input type="file" className="hidden" onChange={handleUpload} />
              </label>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="
                  flex items-center gap-2 px-3 py-2
                  text-slate-600 hover:text-slate-900 hover:bg-slate-100
                  rounded-lg transition-all group
                  min-h-[44px]
                "
              >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                <span className="font-medium">Back</span>
              </button>
              <div className="h-6 w-px bg-slate-300"></div>
              <h1 className="text-xl font-semibold text-slate-900">{folderName}</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`
                    p-2 rounded transition-colors
                    min-w-[40px] min-h-[40px] flex items-center justify-center
                    ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'}
                  `}
                  aria-label="Grid view"
                >
                  <Grid className="w-4 h-4 text-slate-700" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`
                    p-2 rounded transition-colors
                    min-w-[40px] min-h-[40px] flex items-center justify-center
                    ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'}
                  `}
                  aria-label="List view"
                >
                  <List className="w-4 h-4 text-slate-700" />
                </button>
              </div>
              <button
                onClick={() => setShowCreateFolder(true)}
                className="
                  flex items-center gap-2 px-4 py-2
                  bg-white hover:bg-slate-50 text-slate-700
                  border border-slate-300 hover:border-slate-400
                  rounded-lg transition-all shadow-sm
                  min-h-[44px]
                "
              >
                <FolderPlus className="w-4 h-4" />
                <span className="font-medium">New Folder</span>
              </button>
              <label className="
                flex items-center gap-2 px-4 py-2
                bg-sky-600 hover:bg-sky-700 text-white
                rounded-lg cursor-pointer transition-colors shadow-sm
                min-h-[44px]
              ">
                <Upload className="w-4 h-4" />
                <span className="font-medium">Upload</span>
                <input type="file" className="hidden" onChange={handleUpload} />
              </label>
            </div>
          </div>
        </div>
      </div>

      {showCreateFolder && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCreateFolder(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Create New Folder</h2>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="
                w-full px-4 py-3 border border-slate-300 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent
                text-base min-h-[44px]
              "
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              autoFocus
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateFolder(false);
                  setNewFolderName('');
                }}
                className="
                  flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300
                  text-slate-700 rounded-lg font-medium transition-colors
                  min-h-[44px]
                "
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
                className="
                  flex-1 px-4 py-3 bg-sky-600 hover:bg-sky-700 active:bg-sky-800
                  text-white rounded-lg font-medium transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed
                  min-h-[44px]
                "
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-500 text-base">Loading files...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20 bg-white rounded-xl border-2 border-dashed border-slate-200 mx-2 sm:mx-0">
            <File className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 mb-4" />
            <p className="text-base sm:text-lg font-medium text-slate-700 mb-2">This folder is empty</p>
            <p className="text-sm text-slate-500">Upload files to get started</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {files.map((file) => isFolder(file.mime_type) ? (
              <Link
                key={file.id}
                to={`/folder/${file.id}`}
                className="
                  group bg-white rounded-xl border border-slate-200
                  hover:border-sky-300 active:border-sky-400
                  hover:shadow-lg active:shadow-md
                  transition-all duration-200 overflow-hidden
                  min-h-[140px] flex flex-col
                "
              >
                <div className={`p-6 flex items-center justify-center h-28 sm:h-32 ${getFileColor(file.mime_type)}`}>
                  <div className="transform group-hover:scale-110 group-active:scale-105 transition-transform duration-200">
                    {getFileIcon(file.mime_type)}
                  </div>
                </div>
                <div className="p-3 sm:p-4 border-t border-slate-100 flex-1">
                  <p className="font-medium text-sm sm:text-base text-slate-900 truncate group-hover:text-sky-600 transition-colors">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 truncate">Folder</p>
                </div>
              </Link>
            ) : (
              <a
                key={file.id}
                href={file.drive_web_view_link}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  group bg-white rounded-xl border border-slate-200
                  hover:border-sky-300 active:border-sky-400
                  hover:shadow-lg active:shadow-md
                  transition-all duration-200 overflow-hidden
                  min-h-[140px] flex flex-col
                "
              >
                <div className={`p-6 flex items-center justify-center h-28 sm:h-32 ${getFileColor(file.mime_type)}`}>
                  <div className="transform group-hover:scale-110 group-active:scale-105 transition-transform duration-200">
                    {getFileIcon(file.mime_type)}
                  </div>
                </div>
                <div className="p-3 sm:p-4 border-t border-slate-100 flex-1">
                  <p className="font-medium text-sm sm:text-base text-slate-900 truncate group-hover:text-sky-600 transition-colors">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 truncate">
                    {file.mime_type.split('/')[1]?.toUpperCase() || 'FILE'}
                  </p>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="divide-y divide-slate-100">
              {files.map((file) => isFolder(file.mime_type) ? (
                <Link
                  key={file.id}
                  to={`/folder/${file.id}`}
                  className="
                    flex items-center gap-3 sm:gap-4 p-3 sm:p-4
                    hover:bg-slate-50 active:bg-slate-100
                    transition-colors group
                    min-h-[60px]
                  "
                >
                  <div className={`p-2.5 sm:p-3 rounded-lg ${getFileColor(file.mime_type)} flex-shrink-0`}>
                    {getFileIcon(file.mime_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base text-slate-900 truncate group-hover:text-sky-600 transition-colors">
                      {file.name}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-500 truncate">Folder</p>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-slate-400 rotate-180 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </Link>
              ) : (
                <a
                  key={file.id}
                  href={file.drive_web_view_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    flex items-center gap-3 sm:gap-4 p-3 sm:p-4
                    hover:bg-slate-50 active:bg-slate-100
                    transition-colors group
                    min-h-[60px]
                  "
                >
                  <div className={`p-2.5 sm:p-3 rounded-lg ${getFileColor(file.mime_type)} flex-shrink-0`}>
                    {getFileIcon(file.mime_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base text-slate-900 truncate group-hover:text-sky-600 transition-colors">
                      {file.name}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-500 truncate">{file.mime_type}</p>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-slate-400 rotate-180 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}