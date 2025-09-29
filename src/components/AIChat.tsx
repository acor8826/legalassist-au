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

const BotIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("chat_messages");
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      setMessages([
        { role: 'ai', text: "G'day! I'm your AI assistant. How can I help with your documents today?" }
      ]);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chat_messages", JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

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
      setMessages(prev => [...prev, { role: "user", text: `Uploaded file: ${data.filename}` }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: "ai", text: `Error: ${err.message}` }]);
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
          user_id: "alex",
          message: userMessage,
          file_ids: fileIds,
        }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();

      setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
      setFileIds([]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'ai', text: err.message || 'Error talking to AI service' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="flex-1 overflow-y-auto pb-40">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {messages.map((m, i) => (
            <div key={i} className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                m.role === 'ai' ? 'bg-sky-100 text-sky-700' : 'bg-slate-200 text-slate-700'
              }`}>
                {m.role === 'ai' ? <BotIcon /> : <UserIcon />}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-900">
                    {m.role === 'ai' ? 'AI Assistant' : 'You'}
                  </span>
                </div>
                <div className="prose prose-slate max-w-none">
                  <p className="leading-relaxed whitespace-pre-wrap text-slate-700">{m.text}</p>
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center">
                <BotIcon />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-sm text-slate-900">AI Assistant</span>
                </div>
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="relative bg-white border border-slate-300 rounded-2xl shadow-lg focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100 transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your case..."
              rows={1}
              className="w-full px-4 py-3 pr-24 resize-none focus:outline-none text-slate-900 placeholder-slate-400 bg-transparent rounded-2xl"
              style={{ maxHeight: '200px' }}
            />
            <div className="absolute right-2 bottom-2 flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                <UploadIcon />
              </button>
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className={`p-2.5 rounded-xl transition-all ${
                  input.trim()
                    ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-md hover:shadow-lg'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
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
          <p className="text-xs text-slate-500 mt-2 text-center">
            Press Enter to send, Shift + Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}