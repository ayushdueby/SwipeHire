'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/lib/api';
import { BackButton } from '@/components/ui/BackButton';

interface Msg { id: string; matchId: string; senderId: string; body: string; ts: string; }
interface MatchPreview { id: string; ts: string; other?: { userId: string; name?: string; title?: string; avatarUrl?: string } }

export default function MessagesPage() {
  const api = useApi();
  const [matchId, setMatchId] = useState('');
  const [list, setList] = useState<MatchPreview[]>([]);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');

  const load = async () => {
    if (!matchId) return;
    const res = await api.get(`/messages`, { params: { matchId, limit: 50 } });
    setMessages(res.data.messages || []);
  };

  const loadList = async () => {
    const res = await api.get('/matches');
    setList(res.data.matches || []);
    if (!matchId && res.data.matches?.length) setMatchId(res.data.matches[0].id);
  };

  const send = async () => {
    if (!matchId || !input.trim()) return;
    await api.post(`/messages`, { matchId, body: input.trim() });
    setInput('');
    load();
  };

  useEffect(() => { loadList(); }, []);
  useEffect(() => { if (matchId) load(); }, [matchId]);

  return (
    <div className="container py-8">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <h1 className="page-title">Messages</h1>
          <BackButton />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 card">
          <div className="card-body p-0">
            <ul className="divide-y divide-gray-800">
              {list.map(m => (
                <li key={m.id} className={`p-4 cursor-pointer hover:bg-gray-800 ${matchId===m.id?'bg-gray-900':''}`} onClick={() => setMatchId(m.id)}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-800">
                      {m.other?.avatarUrl ? <img src={m.other.avatarUrl} className="w-full h-full object-cover" /> : null}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-100 truncate">{m.other?.name || m.other?.title || 'Match'}</p>
                      <p className="text-xs text-gray-500">{new Date(m.ts).toLocaleString()}</p>
                    </div>
                    <div className="ml-auto">
                      <button className="btn-danger btn-xs" onClick={async (e) => { e.stopPropagation(); await api.delete(`/matches/${m.id}`); loadList(); if (matchId===m.id) { setMatchId(''); setMessages([]);} }}>Unmatch</button>
                    </div>
                  </div>
                </li>
              ))}
              {list.length===0 && <li className="p-4 text-gray-500">No matches yet.</li>}
            </ul>
          </div>
        </div>
        <div className="lg:col-span-2 card">
          <div className="card-body space-y-4">
            <div className="h-96 overflow-y-auto space-y-2 border border-gray-800 rounded-lg p-3">
              {messages.map(m => (
                <div key={m.id} className="text-sm text-gray-100"><span className="text-gray-500">[{new Date(m.ts).toLocaleTimeString()}]</span> {m.body}</div>
              ))}
              {messages.length===0 && <p className="text-gray-500">Select a match to chat.</p>}
            </div>
            <div className="flex gap-2">
              <input className="form-input flex-1" placeholder="Type a message" value={input} onChange={e => setInput(e.target.value)} />
              <button className="btn-primary btn-sm" onClick={send}>Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


