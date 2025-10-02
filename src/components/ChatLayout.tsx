import React, { useRef } from "react";
import AIChat, { AIChatHandle } from "./AIChat";
import DocumentCard, { FileObject } from "./DocumentCard"; // ✅ import FileObject

export default function ChatLayout() {
  const chatRef = useRef<AIChatHandle>(null);

  const handleAddToChat = (file: FileObject) => {
    if (chatRef.current) {
      chatRef.current.addFileToChat(file);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <div className="flex-1 flex flex-col">
        <AIChat ref={chatRef} />
      </div>

      <div className="w-80 xl:w-96 border-l border-slate-200 bg-white overflow-y-auto">
        <div className="p-4 border-b border-slate-200 sticky top-0 bg-white z-10">
          <h2 className="font-semibold text-slate-900">My Documents</h2>
        </div>
        <div className="p-4">
          <DocumentCard onAddToChat={handleAddToChat} />
        </div>
      </div>
    </div>
  );
}
