import React, { useState, useRef, useEffect } from 'react';

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

interface Message {
  role: 'ai' | 'user';
  text: string;
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [fileIds, setFileIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ✅ Load messages from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("chat_messages");
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      // Default greeting if no history
      setMessages([
        { role: 'ai', text: "G'day! I'm your AI assistant. How can I help with your documents today?" }
      ]);
    }
  }, []);

  // ✅ Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chat_messages", JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      setFileIds(prev => [...prev, data.file_id]);
      setMessages(prev => [
        ...prev,
        { role: "user", text: `📎 Uploaded file: ${data.filename}` }
      ]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: "ai", text: `⚠️ ${err.message}` }]);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() && fileIds.length === 0) return;

    const userMessage = input.trim();
    if (userMessage) {
      setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    }
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch("https://api.bespoke-apothecaries.com.au/chat", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: "alex",   // 👈 Replace with dynamic user/session ID later
          message: userMessage,
          file_ids: fileIds,
        }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();

      setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
      setFileIds([]); // clear after use
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        { role: 'ai', text: err.message || '⚠️ Error talking to AI service' }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto pb-40">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {messages.map((m, i) => (
            <div key={i} className="flex gap-4">
              <div>{m.role === 'ai' ? "🤖" : "🧑"}</div>
              <div>{m.text}</div>
            </div>
          ))}
          {isTyping && <div>🤖 Typing...</div>}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4 flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300"
          >
            <UploadIcon />
          </button>
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
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = `${Math.min(el.scrollHeight, 200)}px`; // auto-grow up to 200px
            }}
            placeholder="Ask about your case..."
            rows={1}
            className="flex-1 px-4 py-3 border rounded-2xl resize-none overflow-hidden"
          />
          <button
            onClick={sendMessage}
            className="p-2 rounded-xl bg-sky-600 text-white"
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
