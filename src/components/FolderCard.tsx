import React, { useEffect, useState } from "react";
import { listAllFolders } from "../api/folders";
import FolderCard from "./FolderCard";

interface Folder {
  id: string;
  name: string;
  parents?: string[];
  webViewLink?: string;
  children?: Folder[];
}

const Folders: React.FC = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const data = await listAllFolders();
        const flatFolders: Folder[] = data.folders || [];

        // Create a map for lookup
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

  if (loading) return <p>Loading folders...</p>;

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
