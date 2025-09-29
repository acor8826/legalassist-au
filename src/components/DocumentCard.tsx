import React, { useEffect, useMemo, useState } from "react";
import { getList, Folder } from "../api/folders";
import { buildFolderTree } from "../api/helpers/folderTree";
import { Link } from "react-router-dom";  // ✅ React Router

let isApiCallInProgress = false;
let cachedFolders: Folder[] | null = null;

export default function DocumentCard() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  const trees = useMemo(() => {
    if (folders.length === 0) return [];
    return buildFolderTree(folders);
  }, [folders]);

  useEffect(() => {
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
    let isMounted = true;

    getList()
      .then((data: Folder[]) => {
        cachedFolders = data;
        if (isMounted) setFolders(data);
      })
      .catch((error) => console.error("DocumentCard API error", error))
      .finally(() => {
        isApiCallInProgress = false;
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return <p className="text-slate-500">Loading folders...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {trees.map((tree: any) => (
        <div
          key={tree.parent.id}
          className="border border-slate-200 rounded-lg p-6 hover:border-sky-300 transition"
        >
          {/* ✅ Link parent folder name to our FolderPage */}
          <h2 className="font-bold text-lg mb-4">
            <Link
              to={`/folder/${tree.parent.id}`}   // Pass folderId in URL
              className="text-sky-700 hover:underline"
            >
              {tree.parent.name}
            </Link>
          </h2>

          <div className="space-y-4">
            {tree.children.map((child: Folder) => (
              <div key={child.id} className="border-t pt-3">
                <h4 className="font-medium text-slate-800">{child.name}</h4>
                <p className="text-sm text-slate-500">Folder</p>
                <a
                  href={child.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-sky-700 hover:underline block truncate"
                >
                  {child.webViewLink}
                </a>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
