import { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Users, Plus, LogOut, ArrowLeft, Crown, Trash2, MessageCircle, Send, AlertTriangle, Copy } from 'lucide-react';
import { toast } from 'sonner';
import type { YPTUser } from '@/types/ypt';

interface TimerControls {
  isActive: boolean;
  isPaused: boolean;
  subject: string | null;
  startSession: (subject: string) => Promise<void>;
  [key: string]: any;
}

interface Props {
  currentUser: YPTUser;
  timer: TimerControls;
}

interface Room {
  id: string;
  name: string;
  description: string | null;
  emoji: string;
  is_permanent: boolean;
  max_participants: number | null;
  created_by: string | null;
  last_activity_at: string;
  memberCount: number;
}

interface RoomMember {
  ypt_user_id: string;
  name: string;
  jee_focus_year: string;
  joined_at: string;
}

interface ChatMessage {
  id: string;
  room_id: string;
  ypt_user_id: string;
  message: string;
  created_at: string;
  user_name?: string;
}

// Profanity filter - common slurs and bad words
const BLOCKED_WORDS = [
  'fuck','shit','ass','bitch','dick','bastard','damn','cunt','slut','whore',
  'nigger','nigga','fag','faggot','retard','chutiya','madarchod','bhenchod',
  'bhosdike','gandu','lodu','randi','harami','sala','saala','kamina','kameena',
  'bc','mc','lund','gaand','chut','bsdk','mkc','bkl',
];

function containsProfanity(text: string): boolean {
  const lower = text.toLowerCase().replace(/[^a-z0-9]/g, '');
  return BLOCKED_WORDS.some(word => lower.includes(word.replace(/[^a-z0-9]/g, '')));
}

export function V2RoomsTab({ currentUser, timer }: Props) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [roomMembers, setRoomMembers] = useState<RoomMember[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newMax, setNewMax] = useState('');
  const [loading, setLoading] = useState(true);
  const [roomTab, setRoomTab] = useState<'members' | 'chat'>('members');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const [showChatCaution, setShowChatCaution] = useState(false);
  const [chatCautionAccepted, setChatCautionAccepted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchRooms = async () => {
    await (supabase as any).rpc('cleanup_inactive_rooms');
    const { data: roomsData } = await (supabase as any)
      .from('ypt_rooms').select('*')
      .order('is_permanent', { ascending: false })
      .order('created_at', { ascending: true });
    if (!roomsData) { setLoading(false); return; }
    const { data: members } = await (supabase as any).from('ypt_room_members').select('room_id');
    const countMap: Record<string, number> = {};
    (members || []).forEach((m: any) => { countMap[m.room_id] = (countMap[m.room_id] || 0) + 1; });
    setRooms(roomsData.map((r: any) => ({ ...r, memberCount: countMap[r.id] || 0 })));
    setLoading(false);
  };

  const fetchRoomMembers = async (roomId: string) => {
    const { data } = await (supabase as any)
      .from('ypt_room_members')
      .select('ypt_user_id, joined_at, ypt_users(name, jee_focus_year)')
      .eq('room_id', roomId);
    if (data) {
      setRoomMembers(data.map((m: any) => ({
        ypt_user_id: m.ypt_user_id,
        name: m.ypt_users?.name || 'Unknown',
        jee_focus_year: m.ypt_users?.jee_focus_year || '',
        joined_at: m.joined_at,
      })));
    }
  };

  const fetchMessages = useCallback(async (roomId: string) => {
    // Clean old messages first
    await (supabase as any).rpc('cleanup_old_messages');
    const { data } = await (supabase as any)
      .from('room_messages')
      .select('*, ypt_users(name)')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(200);
    if (data) {
      setMessages(data.map((m: any) => ({
        ...m,
        user_name: m.ypt_users?.name || 'Unknown',
      })));
    }
  }, []);

  useEffect(() => {
    fetchRooms();
    const channel = supabase
      .channel('ypt_rooms_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ypt_room_members' }, () => {
        fetchRooms();
        if (activeRoomId) fetchRoomMembers(activeRoomId);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ypt_rooms' }, () => { fetchRooms(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeRoomId]);

  // Realtime chat subscription
  useEffect(() => {
    if (!activeRoomId) return;
    fetchMessages(activeRoomId);
    const channel = supabase
      .channel(`room_chat_${activeRoomId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'room_messages',
        filter: `room_id=eq.${activeRoomId}`
      }, (payload: any) => {
        (async () => {
          const { data: user } = await (supabase as any).from('ypt_users').select('name').eq('id', payload.new.ypt_user_id).single();
          setMessages(prev => [...prev, { ...payload.new, user_name: user?.name || 'Unknown' }]);
          // Increment unread if not viewing chat
          setUnreadCount(prev => prev + 1);
        })();
      })
      .on('postgres_changes', {
        event: 'DELETE', schema: 'public', table: 'room_messages',
        filter: `room_id=eq.${activeRoomId}`
      }, () => {
        fetchMessages(activeRoomId);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeRoomId, fetchMessages]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-cleanup old messages every 5 min
  useEffect(() => {
    if (!activeRoomId) return;
    const interval = setInterval(() => {
      (supabase as any).rpc('cleanup_old_messages');
      fetchMessages(activeRoomId);
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [activeRoomId, fetchMessages]);

  const sendMessage = async () => {
    const text = chatInput.trim();
    if (!text || sendingChat) return;

    if (containsProfanity(text)) {
      toast.error('Message contains inappropriate language and was blocked.');
      setChatInput('');
      return;
    }

    if (text.length > 500) {
      toast.error('Message too long (max 500 characters)');
      return;
    }

    setSendingChat(true);
    const { error } = await (supabase as any).from('room_messages').insert({
      room_id: activeRoomId,
      ypt_user_id: currentUser.id,
      message: text,
    });
    if (error) {
      toast.error('Failed to send message');
    }
    setChatInput('');
    setSendingChat(false);
  };

  const handleChatTabClick = () => {
    if (!chatCautionAccepted) {
      setShowChatCaution(true);
    } else {
      setRoomTab('chat');
    }
  };

  const acceptCaution = () => {
    setChatCautionAccepted(true);
    setShowChatCaution(false);
    setRoomTab('chat');
  };

  const joinRoom = async (roomId: string) => {
    await (supabase as any).from('ypt_room_members').delete().eq('ypt_user_id', currentUser.id);
    await (supabase as any).from('ypt_room_members').insert({ room_id: roomId, ypt_user_id: currentUser.id });
    await (supabase as any).from('ypt_rooms').update({ last_activity_at: new Date().toISOString() }).eq('id', roomId);
    setActiveRoomId(roomId);
    setRoomTab('members');
    setChatCautionAccepted(false);
    fetchRoomMembers(roomId);
    fetchRooms();
  };

  const leaveRoom = async () => {
    await (supabase as any).from('ypt_room_members').delete().eq('ypt_user_id', currentUser.id);
    setActiveRoomId(null);
    setRoomMembers([]);
    setMessages([]);
    setRoomTab('members');
    setChatCautionAccepted(false);
    fetchRooms();
  };

  const createRoom = async () => {
    const name = newName.trim();
    if (!name || name.length > 40) return;
    if (containsProfanity(name) || containsProfanity(newDesc)) {
      toast.error('Room name or description contains inappropriate language.');
      return;
    }
    await (supabase as any).from('ypt_rooms').insert({
      name, description: newDesc.trim() || null, emoji: '💡',
      is_permanent: false, max_participants: newMax ? parseInt(newMax) : null, created_by: currentUser.id,
    });
    setNewName(''); setNewDesc(''); setNewMax('');
    setShowCreate(false);
    fetchRooms();
  };

  const deleteRoom = async (roomId: string) => {
    await (supabase as any).from('ypt_rooms').delete().eq('id', roomId);
    if (activeRoomId === roomId) { setActiveRoomId(null); setRoomMembers([]); setMessages([]); }
    fetchRooms();
  };

  const currentRoom = rooms.find(r => r.id === activeRoomId);

  // Room detail view
  if (activeRoomId && currentRoom) {
    return (
      <div className="space-y-4 pop-in">
        <button
          onClick={leaveRoom}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" /> Back to Rooms
        </button>

        <Card className="p-5 border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                {currentRoom.emoji}
              </div>
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  {currentRoom.name}
                  {currentRoom.is_permanent && <Crown className="h-4 w-4 text-primary" />}
                </h2>
                {currentRoom.description && (
                  <p className="text-sm text-muted-foreground">{currentRoom.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                <Users className="h-4 w-4" />
                {roomMembers.length}
              </div>
              <Button
                variant="outline" size="sm"
                onClick={leaveRoom}
                className="text-destructive border-destructive/20 hover:bg-destructive/10 active:scale-95 transition-transform"
              >
                <LogOut className="h-4 w-4 mr-1" /> Leave
              </Button>
            </div>
          </div>
        </Card>

        {/* Tab switcher: Members / Chat */}
        <div className="flex gap-2">
          <Button
            variant={roomTab === 'members' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRoomTab('members')}
            className="flex-1 h-10 text-sm font-semibold active:scale-95 transition-transform"
          >
            <Users className="h-4 w-4 mr-2" /> Members ({roomMembers.length})
          </Button>
          <Button
            variant={roomTab === 'chat' ? 'default' : 'outline'}
            size="sm"
            onClick={handleChatTabClick}
            className="flex-1 h-10 text-sm font-semibold active:scale-95 transition-transform"
          >
            <MessageCircle className="h-4 w-4 mr-2" /> Chat
            {messages.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-primary/20 text-[11px] font-bold">
                {messages.length}
              </span>
            )}
          </Button>
        </div>

        {/* Members Tab */}
        {roomTab === 'members' && (
          <ScrollArea className="max-h-[50vh]">
            <div className="space-y-2 pr-2">
              {roomMembers.length === 0 ? (
                <Card className="p-8 text-center border-border/50 text-muted-foreground text-base">
                  No one else is here yet. Share this room!
                </Card>
              ) : (
                roomMembers.map((m, i) => {
                  const isMe = m.ypt_user_id === currentUser.id;
                  return (
                    <Card
                      key={m.ypt_user_id}
                      className={`p-3.5 flex items-center gap-3 border-border/30 card-glow pop-in ${isMe ? 'border-primary/20 bg-primary/5' : ''}`}
                      style={{ animationDelay: `${i * 0.04}s` }}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                        isMe ? 'bg-primary/15 text-primary' : 'bg-muted text-foreground/70'
                      }`}>
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-base font-semibold truncate ${isMe ? 'text-primary' : ''}`}>
                          {m.name} {isMe && <span className="text-xs text-muted-foreground">(you)</span>}
                        </p>
                        <p className="text-sm text-muted-foreground">{m.jee_focus_year}</p>
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shrink-0" />
                    </Card>
                  );
                })
              )}
            </div>
          </ScrollArea>
        )}

        {/* Chat Tab */}
        {roomTab === 'chat' && (
          <div className="flex flex-col" style={{ height: 'calc(50vh)' }}>
            <ScrollArea className="flex-1 pr-2">
              <div className="space-y-2 p-2">
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground text-sm">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    No messages yet. Start the conversation!
                    <p className="text-xs mt-1 opacity-60">Messages auto-delete after 1 hour</p>
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isMe = msg.ypt_user_id === currentUser.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'} pop-in`}
                        style={{ animationDelay: `${Math.min(i * 0.02, 0.3)}s` }}
                      >
                        <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${
                          isMe
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : 'bg-muted rounded-bl-md'
                        }`}>
                          {!isMe && (
                            <p className="text-[11px] font-semibold text-primary mb-0.5">{msg.user_name}</p>
                          )}
                          <p className="text-sm leading-relaxed break-words">{msg.message}</p>
                          <p className={`text-[10px] mt-1 ${isMe ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                            {new Date(msg.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>
            </ScrollArea>

            {/* Chat input */}
            <div className="flex gap-2 pt-3 border-t border-border/30">
              <Input
                placeholder="Type a message..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                maxLength={500}
                className="flex-1 h-11 text-sm"
                disabled={sendingChat}
              />
              <Button
                onClick={sendMessage}
                disabled={!chatInput.trim() || sendingChat}
                className="h-11 px-4 active:scale-95 transition-transform"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Chat Caution Dialog */}
        <Dialog open={showChatCaution} onOpenChange={setShowChatCaution}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Chat Guidelines
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Please read before chatting
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 pt-2 text-sm">
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-foreground">
                <p className="font-semibold mb-2">⚠️ Rules</p>
                <ul className="space-y-1.5 text-muted-foreground">
                  <li>• No abusive, vulgar, or offensive language</li>
                  <li>• No spam or irrelevant messages</li>
                  <li>• Be respectful to fellow students</li>
                  <li>• Messages auto-delete after 1 hour</li>
                  <li>• Inappropriate messages are auto-blocked</li>
                </ul>
              </div>
              <p className="text-xs text-muted-foreground">
                Violating these rules may result in your messages being removed automatically.
              </p>
              <Button onClick={acceptCaution} className="w-full h-11 text-sm font-semibold active:scale-95 transition-transform">
                I Understand, Open Chat
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Rooms list view
  if (loading) {
    return (
      <div className="space-y-4 pop-in">
        {[1, 2, 3].map(i => (
          <Card key={i} className="p-6 border-border/50 animate-pulse">
            <div className="h-14 bg-muted rounded-xl" />
          </Card>
        ))}
      </div>
    );
  }

  const permanentRooms = rooms.filter(r => r.is_permanent);
  const customRooms = rooms.filter(r => !r.is_permanent);

  return (
    <div className="space-y-5 pop-in">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Study Rooms</h3>
          <p className="text-sm text-muted-foreground mt-1">Join a room to study with others</p>
        </div>
        <Button
          variant="outline"
          className="active:scale-95 transition-transform h-10"
          onClick={() => setShowCreate(true)}
        >
          <Plus className="h-4 w-4 mr-2" /> Create Room
        </Button>
      </div>

      <div className="space-y-3">
        {permanentRooms.map((room, idx) => (
          <RoomCard key={room.id} room={room} index={idx} currentUserId={currentUser.id} onJoin={() => joinRoom(room.id)} onDelete={undefined} />
        ))}
      </div>

      {customRooms.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Custom Rooms</h3>
          {customRooms.map((room, idx) => (
            <RoomCard key={room.id} room={room} index={idx + permanentRooms.length} currentUserId={currentUser.id}
              onJoin={() => joinRoom(room.id)}
              onDelete={room.created_by === currentUser.id ? () => deleteRoom(room.id) : undefined}
            />
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Create a Study Room</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input placeholder="Room name" value={newName} onChange={e => setNewName(e.target.value)} maxLength={40} className="h-12 text-base" />
            <Input placeholder="Description (optional)" value={newDesc} onChange={e => setNewDesc(e.target.value)} maxLength={100} className="h-12 text-base" />
            <Input placeholder="Max participants (optional)" type="number" value={newMax} onChange={e => setNewMax(e.target.value)} min={2} max={50} className="h-12 text-base" />
            <p className="text-xs text-muted-foreground">Custom rooms auto-delete after 1 hour of inactivity.</p>
            <Button onClick={createRoom} disabled={!newName.trim()} className="w-full h-12 text-base active:scale-95 transition-transform">
              Create Room
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RoomCard({ room, index, currentUserId, onJoin, onDelete }: {
  room: Room; index: number; currentUserId: string; onJoin: () => void; onDelete?: () => void;
}) {
  const isFull = room.max_participants ? room.memberCount >= room.max_participants : false;

  return (
    <Card
      className="group border-border/30 overflow-hidden hover:border-border/60 hover:shadow-md transition-all duration-300 card-glow pop-in"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className="p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/8 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform duration-300">
          {room.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-base flex items-center gap-2">
            {room.name}
            {room.is_permanent && <Crown className="h-4 w-4 text-primary" />}
          </h4>
          <p className="text-sm text-muted-foreground truncate">
            {room.description || 'Open study room'}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {room.memberCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 text-green-500 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {room.memberCount}
            </span>
          )}
          {room.max_participants && (
            <span className="text-xs text-muted-foreground font-medium">
              {room.memberCount}/{room.max_participants}
            </span>
          )}
          <Button
            variant={room.is_permanent ? 'default' : 'outline'}
            className="h-10 px-5 text-sm font-semibold active:scale-95 transition-transform"
            onClick={onJoin}
            disabled={isFull}
          >
            {isFull ? 'Full' : 'Join'}
          </Button>
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
