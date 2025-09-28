import React, { useState } from 'react';

export default function AIChat() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: "G'day! I'm your AI assistant. How can I help with your documents today?" }
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: 'user', text: input }, { role: 'ai', text: `I understand you're asking about "${input}".` }]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow p-4">
      <div className="flex-1 overflow-y-auto space-y-2 mb-2">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'ai' ? 'text-sky-700' : 'text-slate-800 font-medium'}>
            {m.text}
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your case..."
          className="flex-1 border border-slate-300 rounded-l px-2 py-1 text-sm"
        />
        <button onClick={sendMessage} className="bg-sky-600 text-white px-3 rounded-r">Send</button>
      </div>
    </div>
  );
}
