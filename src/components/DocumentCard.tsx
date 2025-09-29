import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Folder as FolderIcon, ChevronDown, ChevronRight, Home } from "lucide-react";
import { getList, Folder } from "../api/folders";
import { buildFolderTree } from "../api/helpers/folderTree";
import api from "../api/folders";

let isApiCallInProgress = false;
let cachedFolders: Folder[] | null = null;

interface DocumentCardProps {
  folderId?: string | null;
}

export default function DocumentCard({ folderId }: DocumentCardProps) {
  const navigate = useNavigate();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{id: string, name: string}>>([]);

  const trees = useMemo(() => {
    if (folders.length === 0) return [];
    return buildFolderTree(folders);
  }, [folders]);

  useEffect(() => {
    setLoading(true);

    if (folderId) {
      api.get(`/contents-of-folder/${folderId}?page=1&per_page=50`)
        .then((res) => {
          setFiles(res.data.documents || []);
          // TODO: Set breadcrumbs from API response
        })
        .catch((err) => console.error('Error fetching folder contents:', err))
        .finally(() => setLoading(false));
    } else {
      if (cachedFolders) {
        setFolders(cachedFolders);
        setLoading(false);
        return;
      }

      if (isApiCallInProgress) {
        const checkInterval = setInterval(() => {
          if (cachedFolders) {
            setFolders(cachedFolders);
            setLoading(false);
            clearInterval(checkInterval);
          }
        }, 100);
        setTimeout(() => clearInterval(checkInterval), 10000);
        return;
      }

      isApiCallInProgress = true;
      getList()
        .then((data: Folder[]) => {
          cachedFolders = data;
          setFolders(data);
        })
        .catch((error) => console.error("DocumentCard: API error", error))
        .finally(() => {
          isApiCallInProgress = false;
          setLoading(false);
        });
    }
  }, [folderId]);

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const isFolder = (mimeType: string) => {
    return mimeType === 'application/vnd.google-apps.folder';
  };

  const handleItemClick = (file: any) => {
    if (isFolder(file.mime_type)) {
      navigate(`/folder/${file.id}`);
    } else {
      window.open(file.drive_web_view_link, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
        <p className="ml-3 text-slate-500">Loading...</p>
      </div>
    );
  }

  // Viewing a specific folder
  if (folderId && files.length >= 0) {
    return (
      <div className="space-y-3">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-sky-600 hover:text-sky-700 font-medium"
        >
          <Home className="w-4 h-4" />
          All Cases
        </button>

        {/* Folder contents */}
        {files.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">This folder is empty</p>
        ) : (
          <div className="space-y-2">
            {files.map((file) => (
              <div key={file.id} className="border border-slate-200 rounded-lg bg-white overflow-hidden hover:border-sky-300 transition-colors">
                <button
                  onClick={() => handleItemClick(file)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className={`p-2 rounded-lg flex-shrink-0 ${
                    isFolder(file.mime_type) 
                      ? 'bg-yellow-50' 
                      : 'bg-blue-50'
                  }`}>
                    <FolderIcon className={`w-5 h-5 ${
                      isFolder(file.mime_type) 
                        ? 'text-yellow-600' 
                        : 'text-blue-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-900 truncate">
                      {file.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {isFolder(file.mime_type) ? 'Folder' : file.mime_type.split('/')[1]?.toUpperCase()}
                    </p>
                  </div>
                  {isFolder(file.mime_type) && (
                    <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Top-level case folders with accordion
  return (
    <div className="space-y-2">
      {trees.map((tree: any) => {
        const isExpanded = expandedFolders.has(tree.parent.id);
        const hasChildren = tree.children.length > 0;

        return (
          <div key={tree.parent.id} className="border border-slate-200 rounded-lg bg-white overflow-hidden">
            <div className="flex items-center">
              <button
                onClick={() => navigate(`/folder/${tree.parent.id}`)}
                className="flex-1 flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="p-2 bg-yellow-50 rounded-lg">
                  <FolderIcon className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">
                    {tree.parent.name}
                  </h3>
                  {hasChildren && (
                    <p className="text-xs text-slate-500">{tree.children.length} item{tree.children.length !== 1 ? 's' : ''}</p>
                  )}
                </div>
              </button>
              
              {hasChildren && (
                <button
                  onClick={() => toggleFolder(tree.parent.id)}
                  className="p-3 hover:bg-slate-100 transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-slate-600" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                  )}
                </button>
              )}
            </div>

            {hasChildren && isExpanded && (
              <div className="border-t border-slate-200 bg-slate-50">
                {tree.children.map((child: Folder) => (
                  <button
                    key={child.id}
                    onClick={() => navigate(`/folder/${child.id}`)}
                    className="w-full flex items-center gap-3 p-3 pl-12 hover:bg-white transition-colors border-b border-slate-100 last:border-b-0 text-left"
                  >
                    <FolderIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="text-sm text-slate-700 truncate flex-1">
                      {child.name}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}