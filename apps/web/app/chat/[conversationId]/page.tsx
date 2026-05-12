'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { io as socketIO, Socket } from 'socket.io-client';
import { formatChatTime, SOCKET_EVENTS } from '@coolcliq/shared';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  sentAt: string;
  isRead: boolean;
}

interface Conversation {
  id: string;
  otherUser: { id: string; alias: string; avatarSeed: string; gender: string };
  tableReveal?: { user1Consented: boolean; user2Consented: boolean; revealedAt?: string; tableLabel?: string };
}

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const conversationId = params.conversationId as string;
  const token = typeof window !== 'undefined' ? localStorage.getItem('cc_token') || '' : '';
  const currentUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('cc_user') || '{}') : {};

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [revealStatus, setRevealStatus] = useState<any>(null);
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load conversation + messages
    const loadData = async () => {
      try {
        const [convRes, msgsRes, revealRes] = await Promise.all([
          axios.get(`${API}/conversations/${conversationId}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API}/messages/${conversationId}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API}/reveal/status/${conversationId}`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setConversation(convRes.data.data);
        setMessages(msgsRes.data.data);
        setRevealStatus(revealRes.data.data);
      } catch {
        // Demo conversation
        setConversation({
          id: conversationId,
          otherUser: { id: 'u2', alias: 'NeonWolf', avatarSeed: 'wolf7', gender: 'FEMALE' },
        });
        setMessages([
          { id: 'm1', conversationId, senderId: 'u2', content: 'Hey! I noticed you\'re here at the café 👋', sentAt: new Date(Date.now() - 60000).toISOString(), isRead: true },
          { id: 'm2', conversationId, senderId: currentUser.id, content: 'Hi! Yeah, been here for a while ☕', sentAt: new Date(Date.now() - 30000).toISOString(), isRead: true },
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [conversationId, token, currentUser.id]);

  useEffect(() => {
    // Connect Socket.IO
    const socket = socketIO(WS_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    socket.emit('join_conversation', { conversationId });

    socket.on(SOCKET_EVENTS.RECEIVE_MESSAGE, (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on(SOCKET_EVENTS.REVEAL_CONFIRMED, (data: any) => {
      setRevealStatus((prev: any) => ({ ...prev, ...data, user1Consented: true, user2Consented: true }));
    });

    socket.on(SOCKET_EVENTS.USER_BLOCKED, () => {
      router.back();
    });

    socketRef.current = socket;
    return () => { socket.disconnect(); };
  }, [conversationId, token, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || sending) return;
    const content = input.trim();
    setInput('');
    setSending(true);

    // Optimistic update
    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      conversationId,
      senderId: currentUser.id,
      content,
      sentAt: new Date().toISOString(),
      isRead: false,
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      socketRef.current?.emit(SOCKET_EVENTS.SEND_MESSAGE, { conversationId, content });
    } catch {
      // Fallback HTTP
      await axios.post(`${API}/messages`, { conversationId, content }, { headers: { Authorization: `Bearer ${token}` } });
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }, [input, sending, conversationId, currentUser.id, token]);

  const handleBlock = async () => {
    if (!conversation?.otherUser) return;
    await axios.post(`${API}/safety/block`, { blockedId: conversation.otherUser.id }, { headers: { Authorization: `Bearer ${token}` } });
    router.back();
  };

  const revealConsented = revealStatus?.user1Consented || revealStatus?.user2Consented;
  const revealComplete = revealStatus?.revealedAt;

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="screen-header border-b border-dark-border shrink-0">
        <button onClick={() => router.back()} className="btn-icon w-10 h-10">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>

        {/* Other user info */}
        <div className="flex items-center gap-2 flex-1 justify-center">
          <div className="avatar w-8 h-8">
            <img
              src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(conversation?.otherUser?.avatarSeed || 'default')}&backgroundColor=6C63FF`}
              alt={conversation?.otherUser?.alias}
              className="w-full h-full"
            />
          </div>
          <div>
            <p className="font-heading font-semibold text-white text-sm">{conversation?.otherUser?.alias || '...'}</p>
            <p className="text-text-muted text-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green inline-block" />
              At same venue
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1">
          {!revealComplete && (
            <button
              id="btn-reveal-table"
              onClick={() => router.push(`/chat/${conversationId}/reveal`)}
              className="btn-icon"
              title="Reveal table"
            >
              <span className="text-lg">🍽️</span>
            </button>
          )}
          <button id="btn-block-user" onClick={handleBlock} className="btn-icon" title="Block user">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF4D6D" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          </button>
        </div>
      </div>

      {/* Reveal banner */}
      {revealComplete && (
        <div
          className="mx-4 mt-3 rounded-2xl p-3 flex items-center gap-2 animate-scale-in"
          style={{ background: 'linear-gradient(135deg, rgba(52,211,153,0.15) 0%, rgba(34,211,238,0.15) 100%)', border: '1px solid rgba(52,211,153,0.3)' }}
        >
          <span className="text-xl">🍽️</span>
          <div>
            <p className="text-accent-green font-semibold text-sm">Table Revealed!</p>
            <p className="text-text-muted text-xs">{revealStatus.tableLabel}</p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <svg className="animate-spin h-6 w-6 text-accent-blue" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.senderId === currentUser.id;
            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[80%]">
                  <div className={isMine ? 'msg-bubble-sent' : 'msg-bubble-received'}>
                    {msg.content}
                  </div>
                  <p className={`text-[10px] text-text-muted mt-1 ${isMine ? 'text-right' : 'text-left'}`}>
                    {formatChatTime(msg.sentAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div
        className="shrink-0 border-t border-dark-border px-4 py-3 flex gap-2 items-center"
        style={{ background: 'rgba(13,13,20,0.95)', backdropFilter: 'blur(20px)', paddingBottom: 'max(env(safe-area-inset-bottom), 12px)' }}
      >
        <input
          ref={inputRef}
          id="chat-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Say something..."
          className="input-field flex-1 py-3 text-sm"
          maxLength={500}
        />
        <button
          id="btn-send-message"
          onClick={sendMessage}
          disabled={!input.trim() || sending}
          className="w-11 h-11 rounded-xl flex items-center justify-center disabled:opacity-40 transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #6C63FF 0%, #A78BFA 100%)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
