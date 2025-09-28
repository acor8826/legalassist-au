import { useEffect, useState } from "react";
import { getList, Folder } from "../api/folders";
import { buildFolderTree, FolderTree } from "../api/helpers/folderTree";
import DocumentCard from "./DocumentCard";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";

export default function FolderList() {
  const [trees, setTrees] = useState<FolderTree[]>([]);

  useEffect(() => {
    getList().then((data) => setTrees(buildFolderTree(data)));
  }, []);

  const handleDragEnd = (result: DropResult, parentIndex: number) => {
    if (!result.destination) return;

    // ✅ only reorder inside same parent
    if (result.source.droppableId !== result.destination.droppableId) return;

    const updatedTrees = [...trees];
    const items = Array.from(updatedTrees[parentIndex].children);

    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);

    updatedTrees[parentIndex].children = items;
    setTrees(updatedTrees);
  };

  return (
    <div>
      {trees.map((tree, parentIndex) => (
        <div key={tree.parent.id} className="mb-6">
          <h2 className="font-bold text-lg">{tree.parent.name}</h2>

          <DragDropContext
            onDragEnd={(result) => handleDragEnd(result, parentIndex)}
          >
            <Droppable droppableId={tree.parent.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="ml-4 space-y-2"
                >
                  {tree.children.map((child: Folder, index: number) => (
                    <Draggable
                      key={child.id}
                      draggableId={child.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <DocumentCard
                            doc={{
                              title: child.name,
                              type: "Folder",
                              date: "",
                              suggestion: child.webViewLink,
                            }}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      ))}
    </div>
  );
}
