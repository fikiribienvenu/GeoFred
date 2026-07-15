'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/components/providers/AuthProvider';
import { formatDate } from '@/lib/utils';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';

interface Conversation {
  userId: string;
  name: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
}

interface Message {
  _id: string;
  senderId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [newMsg, setNewMsg] = useState('');
  const [search, setSearch] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load conversations
    api.get('/api/messages/conversations')
      .then(({ data }) => setConversations(data.conversations || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!activeConv) return;
    api.get(`/api/messages?with=${activeConv.userId}`)
      .then(({ data }) => setMessages(data.messages || []))
      .catch(() => {});
  }, [activeConv]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMsg.trim() || !activeConv) return;
    setSending(true);
    const optimistic: Message = {
      _id: Date.now().toString(),
      senderId: user?.id || '',
      content: newMsg,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setMessages(prev => [...prev, optimistic]);
    setNewMsg('');
    try {
      await api.post('/api/messages', { receiverId: activeConv.userId, content: newMsg });
    } catch { /* ignore optimistic */ }
    setSending(false);
  };

  const filtered = conversations.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black">Messages</h1>
        <p className="text-muted-foreground text-sm">Chat with your assigned agents</p>
      </div>

      <div className="flex gap-4 h-[calc(100vh-240px)] min-h-[500px]">
        {/* Conversations List */}
        <div className="w-72 flex-shrink-0 flex flex-col border border-border rounded-xl overflow-hidden bg-white dark:bg-gray-800">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Search conversations..." className="pl-8 h-8 text-xs"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="text-center py-10">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                <p className="text-xs text-muted-foreground">No conversations yet</p>
                <p className="text-xs text-muted-foreground mt-1">Messages with your agents will appear here</p>
              </div>
            ) : (
              filtered.map(conv => (
                <button key={conv.userId} onClick={() => setActiveConv(conv)}
                  className={cn('w-full text-left p-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0',
                    activeConv?.userId === conv.userId && 'bg-primary/10')}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                      {conv.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm truncate">{conv.name}</span>
                        {conv.unread > 0 && (
                          <span className="w-5 h-5 bg-primary rounded-full text-white text-xs flex items-center justify-center flex-shrink-0">
                            {conv.unread}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col border border-border rounded-xl overflow-hidden bg-white dark:bg-gray-800">
          {!activeConv ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-muted-foreground text-sm">Select a conversation to start chatting</p>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-4 border-b border-border flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                  {activeConv.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-sm">{activeConv.name}</div>
                  <div className="text-xs text-green-500">Online</div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <AnimatePresence>
                  {messages.map(msg => {
                    const isMine = msg.senderId === user?.id;
                    return (
                      <motion.div key={msg._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={cn('max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm',
                          isMine
                            ? 'terra-gradient text-white rounded-br-sm'
                            : 'bg-gray-100 dark:bg-gray-700 rounded-bl-sm')}>
                          <p>{msg.content}</p>
                          <p className={cn('text-xs mt-1', isMine ? 'text-white/70' : 'text-muted-foreground')}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-border flex gap-2">
                <Input value={newMsg} onChange={e => setNewMsg(e.target.value)}
                  placeholder="Type a message..." className="flex-1"
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} />
                <Button variant="terra" size="icon" onClick={sendMessage} disabled={!newMsg.trim() || sending}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
