import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Paperclip,
  FileText,
  FileSpreadsheet,
  Presentation,
  FileArchive,
  FileCode,
  Image as ImageIcon,
  X,
} from "lucide-react";
import DocumentViewerModal from "./DocumentViewerModal";
import { FileObject } from "./DocumentCard"; // ✅ reuse type

// ✅ Full SVG Icons
const SendIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const UploadIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12V4m0 8l-4-4m4 4l4-4" />
  </svg>
);

const LegalIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

interface Message {
  role: "ai" | "user";
  text: string;
}

export interface AIChatHandle {
  addFileToChat: (file: FileObject) => void;
}

// ✅ Guess MIME type helper
const guessMimeType = (filename: string): string => {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return "application/pdf";
    case "doc":
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "xls":
    case "xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case "ppt":
    case "pptx":
      return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    case "csv":
      return "text/csv";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    case "zip":
      return "application/zip";
    case "rar":
      return "application/vnd.rar";
    case "txt":
      return "text/plain";
    case "json":
      return "application/json";
    default:
      return "application/octet-stream";
  }
};

const AIChat = forwardRef<AIChatHandle>(function AIChat(_, ref) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [fileIds, setFileIds] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<FileObject[]>([]);
  const [previewFile, setPreviewFile] = useState<FileObject | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("chat_messages");
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      setMessages([
        { role: "ai", text: "G'day! I'm your artificial Senior Counsel. How can I help with your legal documents and case matters today?" },
      ]);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chat_messages", JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  // File icon picker
  const getFileIcon = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "pdf": return <FileText className="w-4 h-4 text-red-600" />;
      case "doc":
      case "docx": return <FileText className="w-4 h-4 text-blue-600" />;
      case "xls":
      case "xlsx":
      case "csv": return <FileSpreadsheet className="w-4 h-4 text-green-600" />;
      case "ppt":
      case "pptx": return <Presentation className="w-4 h-4 text-orange-600" />;
      case "zip":
      case "rar": return <FileArchive className="w-4 h-4 text-yellow-600" />;
      case "js":
      case "ts":
      case "tsx":
      case "json": return <FileCode className="w-4 h-4 text-indigo-600" />;
      case "png":
      case "jpg":
      case "jpeg":
      case "gif": return <ImageIcon className="w-4 h-4 text-purple-600" />;
      default: return <Paperclip className="w-4 h-4 text-slate-500" />;
    }
  };

  const getFileBadge = (file: FileObject) => {
    const ext = file.name.split(".").pop()?.toUpperCase();
    return ext ? `[${ext}]` : "";
  };

  // Allow external components to add files
  useImperativeHandle(ref, () => ({
    addFileToChat: (file: FileObject) => {
      const safeFile: FileObject = {
        ...file,
        mime_type: file.mime_type || guessMimeType(file.name),
      };
      setFileIds((prev) => [...prev, safeFile.id]);
      setAttachments((prev) => [...prev, safeFile]);
    },
  }));

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("https://api.bespoke-apothecaries.com.au/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      const data = await res.json();
      setFileIds((prev) => [...prev, data.file_id]);
      setAttachments((prev) => [
        ...prev,
        {
          id: data.file_id,
          name: data.filename,
          mime_type: data.mime_type || guessMimeType(data.filename),
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [...prev, { role: "ai", text: `Error: ${err.message}` }]);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() && fileIds.length === 0) return;

    const userMessage = input.trim();
    if (userMessage) {
      setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    }
    if (attachments.length > 0) {
      setMessages((prev) => [
        ...prev,
        { role: "user", text: `📎 Attached: ${attachments.map((f) => f.name).join(", ")}` },
      ]);
    }

    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("https://api.bespoke-apothecaries.com.au/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: "alex",
          message: userMessage,
          file_ids: fileIds,
        }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();

      setMessages((prev) => [...prev, { role: "ai", text: data.reply }]);
      setFileIds([]);
      setAttachments([]);
    } catch (err: any) {
      setMessages((prev) => [...prev, { role: "ai", text: err.message || "Error talking to AI service" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((f) => f.id !== id));
    setFileIds((prev) => prev.filter((fid) => fid !== id));
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto pb-40">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {messages.map((m, i) => (
            <div key={i} className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${m.role === "ai" ? "bg-amber-100 text-amber-800" : "bg-slate-200 text-slate-700"}`}>
                {m.role === "ai" ? <LegalIcon /> : <UserIcon />}
              </div>
              <div className="flex-1 space-y-2">
                <span className="font-semibold text-sm text-slate-900">
                  {m.role === "ai" ? "Senior Counsel" : "You"}
                </span>
                <p className="leading-relaxed whitespace-pre-wrap text-slate-700">{m.text}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
                <LegalIcon />
              </div>
              <div className="flex-1">
                <span className="font-semibold text-sm text-slate-900">Senior Counsel</span>
                <div className="flex gap-1 mt-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-300"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input + Attachments */}
      <div className="border-t border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {attachments.map((file) => (
                <div key={file.id} className="relative flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm">
                  {getFileIcon(file.name)}
                  <span
                    onClick={() => setPreviewFile(file)}
                    className="truncate max-w-[120px] cursor-pointer hover:underline"
                  >
                    {file.name} <span className="ml-1 text-xs text-slate-500">{getFileBadge(file)}</span>
                  </span>
                  <button onClick={() => removeAttachment(file.id)} className="text-slate-500 hover:text-slate-800">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="relative bg-white border border-slate-300 rounded-2xl shadow-lg">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your case..."
              rows={1}
              className="w-full px-4 py-3 pr-24 resize-none focus:outline-none text-slate-900 placeholder-slate-400 bg-transparent rounded-2xl"
              style={{ maxHeight: "200px" }}
            />
            <div className="absolute right-2 bottom-2 flex gap-2">
              <button onClick={() => fileInputRef.current?.click()} className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700">
                <UploadIcon />
              </button>
              <button
                onClick={sendMessage}
                disabled={!input.trim() && fileIds.length === 0}
                className={`p-2.5 rounded-xl ${!input.trim() && fileIds.length === 0 ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-amber-700 hover:bg-amber-800 text-white shadow-md hover:shadow-lg"}`}
              >
                <SendIcon />
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  uploadFile(e.target.files[0]);
                }
              }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2 text-center">Press Enter to send, Shift + Enter for new line</p>
        </div>
      </div>

      {/* ✅ Preview any file */}
      {previewFile && <DocumentViewerModal file={previewFile} onClose={() => setPreviewFile(null)} />}
    </div>
  );
});

export default AIChat;
