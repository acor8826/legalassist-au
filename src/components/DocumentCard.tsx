import React, { useEffect, useState, useMemo } from "react";
import { getList, Folder } from "../api/folders";
import { buildFolderTree, FolderTree } from "../api/helpers/folderTree";

// Global flag to prevent multiple API calls across all component instances
let isApiCallInProgress = false;
let cachedFolders: Folder[] | null = null;

export default function DocumentCard() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  // Memoize the tree building to prevent unnecessary recalculations
  const trees = useMemo(() => {
    if (folders.length === 0) return [];
    const result = buildFolderTree(folders);
    console.log('Trees built:', result.length, result.map(t => t.parent.name));
    return result;
  }, [folders]);

  useEffect(() => {
    console.log('DocumentCard: useEffect running, isApiCallInProgress:', isApiCallInProgress);
    
    // If we already have cached data, use it
    if (cachedFolders) {
      console.log('DocumentCard: Using cached data');
      setFolders(cachedFolders);
      setLoading(false);
      return;
    }

    // If API call is already in progress, wait for it
    if (isApiCallInProgress) {
      console.log('DocumentCard: API call already in progress, waiting...');
      // Check every 100ms if the API call completed
      const checkInterval = setInterval(() => {
        if (cachedFolders) {
          console.log('DocumentCard: API call completed, using cached data');
          setFolders(cachedFolders);
          setLoading(false);
          clearInterval(checkInterval);
        }
      }, 100);
      
      // Cleanup interval after 10 seconds max
      setTimeout(() => clearInterval(checkInterval), 10000);
      return;
    }

    // Start the API call
    isApiCallInProgress = true;
    let isMounted = true;

    getList()
      .then((data: Folder[]) => {
        console.log('DocumentCard: API returned', data.length, 'folders');
        cachedFolders = data; // Cache the result
        if (isMounted) {
          setFolders(data);
        }
      })
      .catch((error) => {
        console.error('DocumentCard: API error', error);
      })
      .finally(() => {
        isApiCallInProgress = false;
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <p className="text-slate-500">Loading folders...</p>;
  }

  console.log('DocumentCard: Rendering', trees.length, 'trees');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {trees.map((tree, index) => (
        <div
          key={tree.parent.id} // Use just the parent ID as key since each parent should be unique
          className="border border-slate-200 rounded-lg p-6 hover:border-sky-300 transition"
        >
          {/* Parent folder title */}
          <h2 className="font-bold text-lg mb-4">{tree.parent.name}</h2>

          {/* Children list */}
          <div className="space-y-4">
            {tree.children.map((child: Folder) => (
              <div key={child.id} className="border-t pt-3">
                <h4 className="font-medium text-slate-800">{child.name}</h4>
                <p className="text-sm text-slate-500">Folder</p>

                {/* Drive link */}
                <a
                  href={child.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-sky-700 hover:underline block truncate"
                >
                  {child.webViewLink}
                </a>

                {/* Preview button */}
                <a
                  href={child.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-xs mt-2 text-sky-600 hover:underline"
                >
                  Preview
                </a>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}