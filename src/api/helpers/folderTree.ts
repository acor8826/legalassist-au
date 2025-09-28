import { Folder } from "../folders";

export interface FolderTree {
  parent: Folder;
  children: Folder[];
}

export function buildFolderTree(folders: Folder[]): FolderTree[] {
  // Remove duplicates first
  const uniqueFolders = folders.filter((folder, index, self) => 
    index === self.findIndex(f => f.id === folder.id)
  );

  const folderMap: Record<string, Folder> = {};
  uniqueFolders.forEach((f) => {
    folderMap[f.id] = f;
  });

  const trees: FolderTree[] = [];
  const usedAsChild = new Set<string>();

  // First pass: identify which folders are children of other folders in our dataset
  uniqueFolders.forEach((folder) => {
    const parentId = folder.parents?.[0];
    if (parentId && folderMap[parentId]) {
      usedAsChild.add(folder.id);
    }
  });

  // Second pass: create trees for folders that are NOT children of other folders in our dataset
  uniqueFolders.forEach((folder) => {
    if (!usedAsChild.has(folder.id)) {
      // This is a root folder - find its children
      const children = uniqueFolders.filter(child => 
        child.parents?.[0] === folder.id && child.id !== folder.id
      );
      
      trees.push({ parent: folder, children });
    }
  });

  // Debug logging
  console.log('Total folders:', uniqueFolders.length);
  console.log('Trees created:', trees.length);
  console.log('Tree details:', trees.map(t => ({ 
    parent: t.parent.name, 
    childCount: t.children.length 
  })));

  return trees;
}