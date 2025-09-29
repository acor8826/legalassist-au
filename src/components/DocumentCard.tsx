import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Folder as FolderIcon } from "lucide-react";
import { getList, Folder } from "../api/folders";
import { buildFolderTree } from "../api/helpers/folderTree";

// Global flag to prevent multiple API calls across all component instances
let isApiCallInProgress = false;
let cachedFolders: Folder[] | null = null;

export default function DocumentCard() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  const trees = useMemo(() => {
    if (folders.length === 0) return [];
    const result = buildFolderTree(folders);
    console.log("Trees built:", result.length, result.map((t: any) => t.parent.name));
    return result;
  }, [folders]);

  useEffect(() => {
    console.log("DocumentCard: useEffect running, isApiCallInProgress:", isApiCallInProgress);

    if (cachedFolders) {
      console.log("DocumentCard: Using cached data");
      setFolders(cachedFolders);
      setLoading(false);
      return;
    }

    if (isApiCallInProgress) {
      console.log("DocumentCard: API call already in progress, waiting...");
      const checkInterval = setInterval(() => {
        if (cachedFolders) {
          console.log("DocumentCard: API call completed, using cached data");
          setFolders(cachedFolders);
          setLoading(false);
          clearInterval(checkInterval);
        }
      }, 100);
      setTimeout(() => clearInterval(checkInterval), 10000);
      return;
    }

    isApiCallInProgress = true;
    let isMounted = true;

    getList()
      .then((data: Folder[]) => {
        console.log("DocumentCard: API returned", data.length, "folders");
        cachedFolders = data;
        if (isMounted) setFolders(data);
      })
      .catch((error) => {
        console.error("DocumentCard: API error", error);
      })
      .finally(() => {
        isApiCallInProgress = false;
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
        <p className="ml-3 text-slate-500">Loading folders...</p>
      </div>
    );
  }

  console.log("DocumentCard: Rendering", trees.length, "trees");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {trees.map((tree: any) => (
        <div
          key={tree.parent.id}
          className="bg-white border border-slate-200 rounded-xl p-6 hover:border-sky-300 hover:shadow-lg transition-all"
        >
          {/* Parent folder - links to folder page */}
          <Link
            to={`/folder/${tree.parent.id}`}
            className="flex items-center gap-3 mb-4 group"
          >
            <div className="p-2 bg-sky-100 rounded-lg group-hover:bg-sky-200 transition-colors">
              <FolderIcon className="w-6 h-6 text-sky-600" />
            </div>
            <h2 className="font-bold text-lg text-slate-900 group-hover:text-sky-600 transition-colors">
              {tree.parent.name}
            </h2>
          </Link>

          {/* Children folders - also link to folder page */}
          <div className="space-y-2">
            {tree.children.length > 0 ? (
              tree.children.map((child: Folder) => (
                <Link
                  key={child.id}
                  to={`/folder/${child.id}`}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 transition-colors group"
                >
                  <FolderIcon className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-slate-700 truncate group-hover:text-sky-600 transition-colors">
                      {child.name}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-slate-500 italic">No subfolders</p>
            )}
          </div>

          {/* Optional: External Drive link */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <a
              href={tree.parent.webViewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-500 hover:text-sky-600 transition-colors"
            >
              View in Google Drive →
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}