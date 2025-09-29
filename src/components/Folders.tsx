import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Folder as FolderIcon } from "lucide-react";
import { getList } from "../api/folders"; // Import your API function

interface Folder {
  id: string;
  name: string;
  parents?: string[];
  webViewLink?: string;
  children?: Folder[];
}

// FolderCard component
const FolderCard: React.FC<{ folder: Folder }> = ({ folder }) => {
  return (
    <div className="border border-slate-200 rounded-lg p-4 hover:border-sky-300 transition">
      <Link
        to={`/folder/${folder.id}`}
        className="flex items-center gap-3 group"
      >
        <FolderIcon className="w-6 h-6 text-yellow-600" />
        <div>
          <h3 className="font-semibold text-slate-900 group-hover:text-sky-600">
            {folder.name}
          </h3>
          {folder.children && folder.children.length > 0 && (
            <p className="text-sm text-slate-500">
              {folder.children.length} subfolder{folder.children.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </Link>

      {folder.children && folder.children.length > 0 && (
        <div className="ml-9 mt-2 space-y-2">
          {folder.children.map((child) => (
            <FolderCard key={child.id} folder={child} />
          ))}
        </div>
      )}
    </div>
  );
};

const Folders: React.FC = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const data = await getList(); // Use your existing getList function
        const flatFolders: Folder[] = data || [];

        // Group into parent → children tree
        const folderMap: Record<string, Folder> = {};
        flatFolders.forEach((f) => (folderMap[f.id] = { ...f, children: [] }));

        const roots: Folder[] = [];
        flatFolders.forEach((f) => {
          if (f.parents && f.parents.length > 0 && folderMap[f.parents[0]]) {
            folderMap[f.parents[0]].children?.push(folderMap[f.id]);
          } else {
            roots.push(folderMap[f.id]);
          }
        });

        setFolders(roots);
      } catch (err) {
        console.error("Error loading folders", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFolders();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4">
        <div className="w-6 h-6 border-3 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
        <p className="text-slate-500">Loading folders...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Google Drive Folders</h2>
      <div className="grid gap-4">
        {folders.map((folder) => (
          <FolderCard key={folder.id} folder={folder} />
        ))}
      </div>
    </div>
  );
};

export default Folders;