import { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Users, Plus, LogOut, ArrowLeft, Crown, Trash2, MessageCircle, Send, AlertTriangle, BookOpen, Atom, FlaskConical, Calculator, Copy, Reply, X, BellOff, Bell, Ban, ShieldBan, Smile, ImagePlus, Loader2, Sparkles, AtSign, Lock, LockOpen, Settings } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import type { YPTUser } from '@/types/ypt';
import type { RoomSession } from '@/hooks/useRoomSession';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface TimerControls {
  isActive: boolean;
  isPaused: boolean;
  subject: string | null;
  startSession: (subject: string) => Promise<void>;
  endSession: () => Promise<void>;
  sessionId: string | null;
  [key: string]: any;
}

const ROOM_SUBJECTS = [
  { label: 'Self Study', value: 'Self Study', icon: BookOpen, color: 'text-blue-400' },
  { label: 'Physics', value: 'Physics', icon: Atom, color: 'text-orange-400' },
  { label: 'Chemistry', value: 'Chemistry', icon: FlaskConical, color: 'text-green-400' },
  { label: 'Mathematics', value: 'Mathematics', icon: Calculator, color: 'text-purple-400' },
] as const;

interface Props {
  currentUser: YPTUser;
  timer: TimerControls;
  roomSession: RoomSession;
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
  is_locked?: boolean;
  pin_hash?: string | null;
}

interface ChatMessage {
  id: string;
  room_id: string;
  ypt_user_id: string;
  message: string;
  created_at: string;
  user_name?: string;
}

const BLOCKED_WORDS = [
  'fuck','shit','ass','bitch','dick','bastard','damn','cunt','slut','whore',
  'nigger','nigga','fag','faggot','retard',
  'chutiya','chutiye','chutia','madarchod','madarchodd','maderchod','bhenchod','bhencho','bhenchoo',
  'bhosdike','bhosdiwale','bhosdiwala','gandu','gand','gaandu','lodu','laudu','laudey',
  'randi','randwa','harami','haramkhor','sala','saala','saale','kamina','kameena','kameene',
  'bc','mc','lund','gaand','chut','bsdk','mkc','bkl','lode','bhosda','bhosdika',
  'jhatu','jhaatu','tatto','tatton','kutte','kutta','kuttiya','suar','suwar',
  'teri maa','tera baap','maa ki','baap ka','maa ka','maaki','baapka','maaka',
  'ghatiya','nalayak','gadha','gadhe','ullu','bevkoof','bewkoof','pagal','pagla',
  'tharki','chakka','hijra','halkat','haraamzada','haraamzaade','haramzada','haramzade',
  'chodu','chodna','chod','chodumal','choduu',
  'porn','sex','nude','boob','penis','vagina','anal','dildo','orgasm',
  'hentai','xxx','xnxx','pornhub','onlyfans','tits','cock',
  'rape','molest',
];

function containsLink(text: string): boolean {
  return /https?:\/\/|www\.|\.com|\.in|\.org|\.net|\.io|\.co|\.me|t\.me|bit\.ly/i.test(text);
}

function containsProfanity(text: string): boolean {
  const lower = text.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  const noSpace = lower.replace(/\s/g, '');
  return BLOCKED_WORDS.some(word => {
    const clean = word.replace(/[^a-z0-9]/g, '');
    return noSpace.includes(clean) || lower.split(/\s+/).some(w => w === clean);
  });
}

function getBlockedUsers(): string[] {
  try { return JSON.parse(localStorage.getItem('ypt_blocked_users') || '[]'); } catch { return []; }
}
function setBlockedUsers(ids: string[]) {
  localStorage.setItem('ypt_blocked_users', JSON.stringify(ids));
}
function isChatMuted(): boolean {
  return localStorage.getItem('ypt_chat_muted') === 'true';
}
function setChatMuted(v: boolean) {
  localStorage.setItem('ypt_chat_muted', v ? 'true' : 'false');
}

export function V2RoomsTab({ currentUser, timer, roomSession }: Props) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newMax, setNewMax] = useState('');
  const [newLock, setNewLock] = useState(false);
  const [newPin, setNewPin] = useState('');
  // PIN prompt when joining a locked room
  const [pinPromptRoom, setPinPromptRoom] = useState<Room | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinChecking, setPinChecking] = useState(false);
  // Owner settings dialog inside an active room
  const [showRoomSettings, setShowRoomSettings] = useState(false);
  const [settingsLock, setSettingsLock] = useState(false);
  const [settingsPin, setSettingsPin] = useState('');
  const [settingsMax, setSettingsMax] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [roomView, setRoomView] = useState<'members' | 'chat'>('members');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const [showChatCaution, setShowChatCaution] = useState(false);
  const [chatCautionAccepted, setChatCautionAccepted] = useState<boolean>(() => {
    try {
      const ts = Number(localStorage.getItem('chat_disclaimer_seen_at') || '0');
      return ts > 0 && Date.now() - ts < 24 * 60 * 60 * 1000;
    } catch { return false; }
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedMsgId, setSelectedMsgId] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [muted, setMuted] = useState(() => isChatMuted());
  const [blockedUsersArr, setBlockedUsersState] = useState<string[]>(() => getBlockedUsers());
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [aiThinking, setAiThinking] = useState(false);
  const [mentionBanner, setMentionBanner] = useState<{ from: string; text: string } | null>(null);
  const mentionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const EMOJI_GROUPS: { label: string; emojis: string[] }[] = [
    { label: 'Smileys', emojis: ['😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🥳','🤩','🥺','😢','😭','😤','😡','🤬','🤯','😱','😨','😰','😥','😓'] },
    { label: 'Study', emojis: ['📚','📖','✏️','📝','📒','📓','📕','📗','📘','📙','📔','🖊️','🖋️','📐','📏','🧮','💡','🔬','🧪','🧠','⏰','⏱️','⌛','🎯','🔥','💯','✅','❌','📊','📈','📉','🏆','🥇','🥈','🥉','🎓','💪','🚀'] },
    { label: 'Hands', emojis: ['👍','👎','👌','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','👇','☝️','✋','🤚','🖐️','🖖','👋','🤝','🙏','👏','🙌','🫶','💪','🫡'] },
    { label: 'Hearts', emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','💌'] },
  ];
  const [emojiOpen, setEmojiOpen] = useState(false);

  const insertEmoji = (emoji: string) => {
    setChatInput(prev => prev + emoji);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleImageUpload = async (file: File) => {
    if (!activeRoomId || !file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5 MB');
      return;
    }
    setUploadingImage(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `${activeRoomId}/${currentUser.id}-${Date.now()}.${ext}`;
      const { error: upErr } = await (supabase as any).storage
        .from('room-images')
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;
      const { data: pub } = (supabase as any).storage.from('room-images').getPublicUrl(path);
      const url = pub?.publicUrl;
      if (!url) throw new Error('Could not resolve public URL');
      const msgPayload: any = {
        room_id: activeRoomId,
        ypt_user_id: currentUser.id,
        message: replyTo ? `[reply:${replyTo.user_name}] [image:${url}]` : `[image:${url}]`,
      };
      const { error } = await (supabase as any).from('room_messages').insert(msgPayload);
      if (error) throw error;
      setReplyTo(null);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to send image');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setChatMuted(next);
    toast.success(next ? 'Chat muted' : 'Chat unmuted');
  };

  const blockUser = (userId: string, userName: string) => {
    const updated = [...blockedUsersArr, userId];
    setBlockedUsersState(updated);
    setBlockedUsers(updated);
    setSelectedMsgId(null);
    toast.success(`${userName} blocked`);
  };

  const { activeRoomId, presenceMembers, roomOnlineCounts, joinRoom, leaveRoom } = roomSession;

  const fetchRooms = async () => {
    await (supabase as any).rpc('cleanup_inactive_rooms');
    const { data: roomsData } = await (supabase as any)
      .from('ypt_rooms')
      .select('id, name, description, emoji, is_permanent, max_participants, created_by, last_activity_at, created_at, is_locked')
      .order('is_permanent', { ascending: false })
      .order('created_at', { ascending: true });
    if (!roomsData) { setLoading(false); return; }
    setRooms(roomsData.map((r: any) => ({ ...r, memberCount: roomOnlineCounts[r.id] || 0 })));
    setLoading(false);
  };

  useEffect(() => {
    setRooms(prev => prev.map(r => ({ ...r, memberCount: roomOnlineCounts[r.id] || 0 })));
  }, [roomOnlineCounts]);

  const fetchMessages = useCallback(async (roomId: string) => {
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ypt_rooms' }, () => { fetchRooms(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Realtime chat
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
          const msgText = payload.new.message || '';
          const isAi = msgText.startsWith('[ai-ask]') || msgText.startsWith('[ai-reply]');
          // Strip our internal tags before profanity/link scanning
          const scanText = msgText
            .replace(/\[image:[^\]]+\]/g, '')
            .replace(/^\[reply:[^\]]+\]\s?/, '')
            .replace(/^\[ai-(ask|reply)\]\s?/, '');
          if (!isAi && (containsProfanity(scanText) || (scanText.trim() && containsLink(scanText)))) {
            await (supabase as any).from('room_messages').delete().eq('id', payload.new.id);
            if (payload.new.ypt_user_id === currentUser.id) {
              toast.error('⚠️ Message removed for violating guidelines.', { duration: 4000 });
            }
            return;
          }
          const { data: user } = await (supabase as any).from('ypt_users').select('name').eq('id', payload.new.ypt_user_id).single();
          const authorName = user?.name || 'Unknown';
          setMessages(prev => [...prev, { ...payload.new, user_name: authorName }]);
          // Mention detection: notify me if @myname appears (and it's not my own message)
          if (payload.new.ypt_user_id !== currentUser.id && !isChatMuted()) {
            const mentionRe = new RegExp(`@${currentUser.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
            if (mentionRe.test(scanText)) {
              if (mentionTimerRef.current) clearTimeout(mentionTimerRef.current);
              setMentionBanner({ from: authorName, text: scanText.slice(0, 90) });
              mentionTimerRef.current = setTimeout(() => setMentionBanner(null), 5000);
            }
          }
          if (roomView !== 'chat' && !isChatMuted()) setUnreadCount(prev => prev + 1);
        })();
      })
      .on('postgres_changes', {
        event: 'DELETE', schema: 'public', table: 'room_messages',
        filter: `room_id=eq.${activeRoomId}`
      }, () => { fetchMessages(activeRoomId); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeRoomId, fetchMessages, roomView]);

  // Scroll to bottom when messages change (only if near bottom)
  useEffect(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (isNearBottom || messages.length <= 5) {
      requestAnimationFrame(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }, [messages]);

  // Auto-cleanup interval
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

    // /ai command → route to Bookie AI
    if (text.toLowerCase().startsWith('/ai')) {
      const prompt = text.slice(3).trim();
      if (!prompt) {
        toast.error('Add a question after /ai');
        return;
      }
      if (containsProfanity(prompt)) {
        toast.error('Inappropriate content blocked.');
        setChatInput('');
        return;
      }
      setSendingChat(true);
      // 1) Post the user question so everyone sees the ask
      await (supabase as any).from('room_messages').insert({
        room_id: activeRoomId,
        ypt_user_id: currentUser.id,
        message: `[ai-ask] ${prompt}`,
      });
      setChatInput('');
      setSendingChat(false);
      inputRef.current?.focus();

      // 2) Ask Bookie AI (non-streaming — collect and post)
      setAiThinking(true);
      try {
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bookie-chat`;
        const resp = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [{ role: 'user', content: `${prompt}\n\n(Answer in ≤120 words, focused JEE mentor tone.)` }],
          }),
        });
        let full = '';
        if (resp.ok && resp.body) {
          const reader = resp.body.getReader();
          const decoder = new TextDecoder();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            for (const line of chunk.split('\n')) {
              const t = line.trim();
              if (!t.startsWith('data:')) continue;
              const payload = t.slice(5).trim();
              if (!payload || payload === '[DONE]') continue;
              try {
                const j = JSON.parse(payload);
                const delta = j.choices?.[0]?.delta?.content || j.choices?.[0]?.message?.content || '';
                if (delta) full += delta;
              } catch { /* skip non-JSON */ }
            }
          }
        }
        const clean = (full || 'I couldn’t reach the AI right now. Try again in a moment.').slice(0, 1400);
        await (supabase as any).from('room_messages').insert({
          room_id: activeRoomId,
          ypt_user_id: currentUser.id,
          message: `[ai-reply] ${clean}`,
        });
      } catch (e: any) {
        toast.error('Bookie AI is unavailable right now.');
      } finally {
        setAiThinking(false);
      }
      return;
    }

    if (containsProfanity(text)) {
      toast.error('Inappropriate language blocked.');
      setChatInput('');
      return;
    }
    if (containsLink(text)) {
      toast.error('Links are not allowed.');
      return;
    }
    if (text.length > 500) {
      toast.error('Message too long (max 500 chars)');
      return;
    }
    setSendingChat(true);
    const msgPayload: any = {
      room_id: activeRoomId,
      ypt_user_id: currentUser.id,
      message: replyTo ? `[reply:${replyTo.user_name}] ${text}` : text,
    };
    const { error } = await (supabase as any).from('room_messages').insert(msgPayload);
    if (error) toast.error('Failed to send');
    setChatInput('');
    setReplyTo(null);
    setSendingChat(false);
    // Keep focus on input
    inputRef.current?.focus();
  };

  const copyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied');
    setSelectedMsgId(null);
  };

  const deleteMessage = async (msgId: string) => {
    await (supabase as any).from('room_messages').delete().eq('id', msgId).eq('ypt_user_id', currentUser.id);
    setMessages(prev => prev.filter(m => m.id !== msgId));
    setSelectedMsgId(null);
    toast.success('Deleted');
  };

  const handleMsgLongPress = (msgId: string) => {
    longPressTimer.current = setTimeout(() => setSelectedMsgId(msgId), 400);
  };
  const cancelLongPress = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const handleChatTabClick = () => {
    if (!chatCautionAccepted) {
      setShowChatCaution(true);
    } else {
      setRoomView('chat');
      setUnreadCount(0);
    }
  };

  const acceptCaution = () => {
    setChatCautionAccepted(true);
    try { localStorage.setItem('chat_disclaimer_seen_at', String(Date.now())); } catch {}
    setShowChatCaution(false);
    setRoomView('chat');
    setUnreadCount(0);
  };

  const handleJoinRoom = async (room: Room) => {
    await joinRoom(room.id, room.name, room.emoji);
    setRoomView('members');
    // Preserve 24h persistence: re-derive from localStorage
    try {
      const ts = Number(localStorage.getItem('chat_disclaimer_seen_at') || '0');
      setChatCautionAccepted(ts > 0 && Date.now() - ts < 24 * 60 * 60 * 1000);
    } catch { setChatCautionAccepted(false); }
  };

  const handleLeaveRoom = async () => {
    const leftRoomId = activeRoomId;
    await leaveRoom();
    setMessages([]);
    setRoomView('members');
    setChatCautionAccepted(false);
    if (leftRoomId) {
      setRooms(prev => prev.map(r =>
        r.id === leftRoomId ? { ...r, memberCount: Math.max(0, r.memberCount - 1) } : r
      ));
    }
    setTimeout(() => fetchRooms(), 1500);
  };

  const switchSubject = async (newSubject: string) => {
    if (timer.subject === newSubject) return;
    if (timer.isActive) {
      try { await timer.endSession(); } catch {}
    }
    try {
      await timer.startSession(newSubject);
      toast.success(`Switched to ${newSubject}`);
    } catch {}
  };

  const createRoom = async () => {
    const name = newName.trim();
    if (!name || name.length > 40) return;
    if (containsProfanity(name) || containsProfanity(newDesc)) {
      toast.error('Inappropriate language in room name/description.');
      return;
    }
    if (newLock && newPin && !/^\d{4}$/.test(newPin)) {
      toast.error('PIN must be exactly 4 digits.');
      return;
    }
    const { data: created, error } = await (supabase as any).from('ypt_rooms').insert({
      name, description: newDesc.trim() || null, emoji: '💡',
      is_permanent: false, max_participants: newMax ? parseInt(newMax) : null, created_by: currentUser.id,
      is_locked: newLock,
    }).select().single();
    if (error) { toast.error('Failed to create room'); return; }
    if (newLock && newPin && created?.id) {
      await (supabase as any).rpc('set_room_lock', {
        _room_id: created.id, _creator: currentUser.id,
        _is_locked: true, _pin: newPin,
        _max: newMax ? parseInt(newMax) : null,
      });
    }
    setNewName(''); setNewDesc(''); setNewMax(''); setNewLock(false); setNewPin('');
    setShowCreate(false);
    fetchRooms();
  };

  const attemptJoin = async (room: Room) => {
    if (room.is_locked && room.created_by !== currentUser.id) {
      setPinPromptRoom(room);
      setPinInput('');
      return;
    }
    await handleJoinRoom(room);
  };

  const submitPin = async () => {
    if (!pinPromptRoom) return;
    if (!/^\d{4}$/.test(pinInput)) { toast.error('Enter the 4-digit PIN'); return; }
    setPinChecking(true);
    try {
      const { data, error } = await (supabase as any).rpc('verify_room_pin', {
        _room_id: pinPromptRoom.id, _pin: pinInput,
      });
      if (error) throw error;
      if (!data) { toast.error('Incorrect PIN'); return; }
      const room = pinPromptRoom;
      setPinPromptRoom(null); setPinInput('');
      await handleJoinRoom(room);
    } catch (e: any) {
      toast.error(e?.message || 'Could not verify PIN');
    } finally {
      setPinChecking(false);
    }
  };

  const openRoomSettings = () => {
    const r = rooms.find(x => x.id === activeRoomId);
    if (!r) return;
    setSettingsLock(!!r.is_locked);
    setSettingsPin('');
    setSettingsMax(r.max_participants?.toString() ?? '');
    setShowRoomSettings(true);
  };

  const saveRoomSettings = async () => {
    if (!activeRoomId) return;
    if (settingsLock && settingsPin && !/^\d{4}$/.test(settingsPin)) {
      toast.error('PIN must be exactly 4 digits.');
      return;
    }
    const maxNum = settingsMax ? parseInt(settingsMax) : null;
    if (maxNum !== null && (isNaN(maxNum) || maxNum < 2 || maxNum > 50)) {
      toast.error('Max participants must be 2–50.');
      return;
    }
    setSavingSettings(true);
    try {
      const { error } = await (supabase as any).rpc('set_room_lock', {
        _room_id: activeRoomId, _creator: currentUser.id,
        _is_locked: settingsLock,
        _pin: settingsLock ? (settingsPin || null) : null,
        _max: maxNum,
      });
      if (error) throw error;
      toast.success('Room settings updated');
      setShowRoomSettings(false);
      fetchRooms();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update');
    } finally {
      setSavingSettings(false);
    }
  };

  const deleteRoom = async (roomId: string) => {
    await (supabase as any).from('ypt_rooms').delete().eq('id', roomId);
    if (activeRoomId === roomId) { await handleLeaveRoom(); }
    fetchRooms();
  };

  const currentRoom = rooms.find(r => r.id === activeRoomId);

  // ═══════ ROOM DETAIL VIEW ═══════
  if (activeRoomId && currentRoom) {
    const filteredMessages = messages.filter(m => !blockedUsersArr.includes(m.ypt_user_id));

    return (
      <div className="flex flex-col pop-in" style={{ height: 'calc(100vh - 56px)', minHeight: '780px' }}>
        {/* Compact Header */}
        <div className="shrink-0 pb-3 space-y-3">
          {/* Top bar */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleLeaveRoom}
              className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xl">{currentRoom.emoji}</span>
                <h2 className="text-lg font-bold truncate">{currentRoom.name}</h2>
                {currentRoom.is_permanent && <Crown className="h-4 w-4 text-primary shrink-0" />}
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                {presenceMembers.length}
              </span>
              {currentRoom.created_by === currentUser.id && !currentRoom.is_permanent && (
                <Button
                  variant="ghost" size="sm"
                  onClick={openRoomSettings}
                  className="h-8 px-2.5 text-muted-foreground hover:text-foreground"
                  aria-label="Room settings"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost" size="sm"
                onClick={handleLeaveRoom}
                className="h-8 px-2.5 text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Subject Switcher - compact */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {ROOM_SUBJECTS.map(s => {
              const Icon = s.icon;
              const isActive = timer.subject === s.value;
              return (
                <button
                  key={s.value}
                  onClick={() => switchSubject(s.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {s.label}
                </button>
              );
            })}
          </div>

          {/* Tab switcher */}
          <div className="flex rounded-xl bg-muted/40 p-1 gap-1">
            <button
              onClick={() => setRoomView('members')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
                roomView === 'members'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Users className="h-4 w-4" />
              Online ({presenceMembers.length})
            </button>
            <button
              onClick={handleChatTabClick}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
                roomView === 'chat'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <MessageCircle className="h-4 w-4" />
              Chat
              {unreadCount > 0 && roomView !== 'chat' && (
                <span className="px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold min-w-[18px] text-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ═══ MAIN CONTENT AREA — fills remaining space ═══ */}
        <div className="flex-1 min-h-0 flex flex-col">
          {/* Members view */}
          {roomView === 'members' && (
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pr-1 ypt-scroll">
              <div className="space-y-2">
                {presenceMembers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Users className="h-10 w-10 mb-3 opacity-30" />
                    <p className="text-base font-medium">No one else here yet</p>
                    <p className="text-sm mt-1">Others can join this room from the rooms list.</p>
                  </div>
                ) : (
                  presenceMembers.map((m, i) => {
                    const isMe = m.user_id === currentUser.id;
                    return (
                      <div
                        key={m.user_id}
                        className={`flex items-center gap-3 p-3.5 rounded-xl transition-all pop-in ${
                          isMe
                            ? 'bg-primary/5 border border-primary/15'
                            : 'bg-muted/30 border border-border/20'
                        }`}
                        style={{ animationDelay: `${i * 0.04}s` }}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                          isMe ? 'bg-primary/15 text-primary' : 'bg-muted text-foreground/70'
                        }`}>
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[15px] font-semibold truncate ${isMe ? 'text-primary' : ''}`}>
                            {m.name} {isMe && <span className="text-xs text-muted-foreground font-normal">(you)</span>}
                          </p>
                          <p className="text-xs text-muted-foreground">{m.jee_focus_year}</p>
                        </div>
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shrink-0" />
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Chat view — full remaining space */}
          {roomView === 'chat' && (
            <div className="flex-1 min-h-0 flex flex-col">
              {/* Chat toolbar */}
              <div className="flex items-center justify-between px-2 py-1.5 border-b border-border/20 shrink-0">
                <p className="text-[11px] text-muted-foreground">Messages auto-delete after 24 hours</p>
                <div className="flex items-center gap-1">
                  {blockedUsersArr.length > 0 && (
                    <button
                      onClick={() => { setBlockedUsersState([]); setBlockedUsers([]); toast.success('All unblocked'); }}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                    >
                      <ShieldBan className="h-3 w-3" /> {blockedUsersArr.length}
                    </button>
                  )}
                  <button
                    onClick={toggleMute}
                    className={`p-1.5 rounded-lg transition-colors ${muted ? 'text-destructive bg-destructive/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'}`}
                  >
                    {muted ? <BellOff className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* Messages — scrollable, flex-grow, starts from bottom */}
              {mentionBanner && (
                <div className="mx-3 mt-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 border border-primary/25 text-xs pop-in">
                  <AtSign className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="flex-1 min-w-0 truncate"><span className="font-semibold text-primary">{mentionBanner.from}</span> mentioned you: <span className="text-muted-foreground">{mentionBanner.text}</span></span>
                  <button onClick={() => setMentionBanner(null)} className="text-muted-foreground hover:text-foreground shrink-0">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              <div
                ref={chatContainerRef}
                className="flex-1 min-h-0 overflow-y-auto overscroll-contain ypt-scroll"
              >
                <div className="flex flex-col justify-end min-h-full px-3 pt-4 pb-8 space-y-2">
                  {filteredMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                      <MessageCircle className="h-10 w-10 mb-3 opacity-30" />
                      <p className="text-base font-medium">No messages yet</p>
                      <p className="text-sm mt-1">Start the conversation!</p>
                    </div>
                  ) : (
                    filteredMessages.map((msg) => {
                      const isMe = msg.ypt_user_id === currentUser.id;
                      const isSelected = selectedMsgId === msg.id;
                      const isAiAsk = msg.message.startsWith('[ai-ask]');
                      const isAiReply = msg.message.startsWith('[ai-reply]');
                      const isReply = msg.message.startsWith('[reply:');
                      let replyAuthor = '';
                      let displayMsg = msg.message;
                      if (isReply) {
                        const match = msg.message.match(/^\[reply:(.+?)\]\s?(.*)/s);
                        if (match) { replyAuthor = match[1]; displayMsg = match[2]; }
                      }
                      if (isAiAsk) displayMsg = msg.message.replace(/^\[ai-ask\]\s?/, '');
                      if (isAiReply) displayMsg = msg.message.replace(/^\[ai-reply\]\s?/, '');
                      const imgMatch = displayMsg.match(/^\[image:([^\]]+)\]\s*(.*)$/s);
                      const imageUrl = imgMatch ? imgMatch[1] : null;
                      const textPart = imgMatch ? imgMatch[2] : displayMsg;
                      const initial = (msg.user_name || '?').charAt(0).toUpperCase();

                      if (isAiReply) {
                        return (
                          <div key={msg.id} className="flex items-start gap-2 pop-in">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground flex items-center justify-center shrink-0 shadow-sm">
                              <Sparkles className="h-4 w-4" />
                            </div>
                            <div className="flex-1 max-w-[85%] rounded-2xl rounded-tl-md px-3.5 py-2.5 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                              <p className="text-[11px] font-bold text-primary mb-1 flex items-center gap-1">
                                Bookie AI <span className="text-[9px] font-normal text-muted-foreground uppercase tracking-wider">Mentor</span>
                              </p>
                              <div className="text-[14px] leading-relaxed break-words prose prose-sm dark:prose-invert max-w-none [&>*]:my-1 [&_p]:my-1 [&_.katex]:text-[0.95em]">
                                <ReactMarkdown
                                  remarkPlugins={[remarkMath]}
                                  rehypePlugins={[rehypeKatex]}
                                >
                                  {textPart}
                                </ReactMarkdown>
                              </div>
                              <p className="text-[10px] mt-1 text-muted-foreground/70">
                                {new Date(msg.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        );
                      }

                      const renderTextWithMentions = (t: string) => {
                        if (!t) return null;
                        const parts = t.split(/(@[A-Za-z0-9_]+)/g);
                        return parts.map((p, i) => {
                          if (p.startsWith('@')) {
                            const isMeMention = p.slice(1).toLowerCase() === currentUser.name.toLowerCase();
                            return (
                              <span key={i} className={`font-semibold ${isMeMention ? 'text-primary bg-primary/15 px-1 rounded' : 'text-primary/80'}`}>
                                {p}
                              </span>
                            );
                          }
                          return <span key={i}>{p}</span>;
                        });
                      };

                      return (
                        <div
                          key={msg.id}
                          className={`relative flex items-end gap-1.5 ${isMe ? 'justify-end' : 'justify-start'} group`}
                          onContextMenu={e => { e.preventDefault(); setSelectedMsgId(isSelected ? null : msg.id); }}
                          onTouchStart={() => handleMsgLongPress(msg.id)}
                          onTouchEnd={cancelLongPress}
                          onTouchMove={cancelLongPress}
                        >
                          {!isMe && (
                            <div className="w-7 h-7 rounded-full bg-muted text-foreground/70 text-[11px] font-bold flex items-center justify-center shrink-0 mb-1">
                              {initial}
                            </div>
                          )}
                          {isMe && (
                            <button
                              onClick={() => deleteMessage(msg.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive mb-1 shrink-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                          <div className={`max-w-[78%] rounded-2xl px-3.5 py-2 transition-all ${
                            isMe
                              ? 'bg-primary text-primary-foreground rounded-br-md'
                              : 'bg-muted/60 rounded-bl-md'
                          } ${isSelected ? 'ring-2 ring-primary/40 scale-[1.02]' : ''}`}>
                            {!isMe && (
                              <p className="text-[11px] font-bold text-primary mb-0.5">{msg.user_name}</p>
                            )}
                            {isAiAsk && (
                              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1 opacity-70 inline-flex items-center gap-1">
                                <Sparkles className="h-3 w-3" /> Asking Bookie AI
                              </p>
                            )}
                            {isReply && replyAuthor && (
                              <div className={`text-[11px] px-2 py-1 rounded mb-1 border-l-2 ${
                                isMe ? 'bg-primary-foreground/10 border-primary-foreground/30' : 'bg-background/50 border-primary/40'
                              }`}>
                                <span className="font-semibold">↩ {replyAuthor}</span>
                              </div>
                            )}
                            {imageUrl && (
                              <button
                                type="button"
                                onClick={() => setLightboxUrl(imageUrl)}
                                className="block rounded-xl overflow-hidden mb-1 max-w-[260px] hover:opacity-90 transition-opacity"
                              >
                                <img
                                  src={imageUrl}
                                  alt="shared"
                                  loading="lazy"
                                  className="w-full h-auto max-h-[300px] object-cover"
                                />
                              </button>
                            )}
                            {textPart && (
                              <p className="text-[14px] leading-relaxed break-words whitespace-pre-wrap">{renderTextWithMentions(textPart)}</p>
                            )}
                            <p className={`text-[10px] mt-0.5 ${isMe ? 'text-primary-foreground/50' : 'text-muted-foreground/70'}`}>
                              {new Date(msg.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>

                          {/* Message actions popover */}
                          {isSelected && (
                            <div className={`absolute z-30 ${isMe ? 'right-0' : 'left-0'} -top-10 flex items-center gap-0.5 px-1.5 py-1 rounded-xl bg-background/95 border border-border/40 shadow-lg backdrop-blur-xl pop-in`}>
                              <button onClick={() => copyMessage(imageUrl || textPart || displayMsg)} className="p-1.5 rounded-lg hover:bg-muted text-foreground/70 hover:text-foreground transition-colors">
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => { setReplyTo(msg); setSelectedMsgId(null); }} className="p-1.5 rounded-lg hover:bg-muted text-foreground/70 hover:text-foreground transition-colors">
                                <Reply className="h-3.5 w-3.5" />
                              </button>
                              {isMe ? (
                                <button onClick={() => deleteMessage(msg.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive/70 hover:text-destructive transition-colors">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              ) : (
                                <button onClick={() => blockUser(msg.ypt_user_id, msg.user_name || 'User')} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive/70 hover:text-destructive transition-colors">
                                  <Ban className="h-3.5 w-3.5" />
                                </button>
                              )}
                              <button onClick={() => setSelectedMsgId(null)} className="p-1.5 rounded-lg hover:bg-muted text-foreground/40 hover:text-foreground transition-colors">
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                  {aiThinking && (
                    <div className="flex items-start gap-2 pop-in">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground flex items-center justify-center shrink-0">
                        <Sparkles className="h-4 w-4 animate-pulse" />
                      </div>
                      <div className="rounded-2xl rounded-tl-md px-3.5 py-2.5 bg-primary/10 border border-primary/20 text-sm text-muted-foreground">
                        Bookie AI is thinking…
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </div>

              {/* Reply bar */}
              {replyTo && (
                <div className="flex items-center gap-2 px-3 py-2 border-t border-border/20 bg-muted/20 shrink-0">
                  <Reply className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-primary truncate">Replying to {replyTo.user_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{replyTo.message.replace(/^\[reply:.+?\]\s?/, '')}</p>
                  </div>
                  <button onClick={() => setReplyTo(null)} className="p-1 rounded hover:bg-muted shrink-0">
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
              )}

              {/* Input bar */}
              <div className="flex gap-2 p-3 border-t border-border/20 shrink-0 bg-background/80 backdrop-blur-sm">
                <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-11 w-11 p-0 shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted/60 active:scale-95"
                      aria-label="Insert emoji"
                    >
                      <Smile className="h-5 w-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    side="top"
                    className="w-[300px] p-0 border-border/40 shadow-xl"
                  >
                    <div className="max-h-[260px] overflow-y-auto ypt-scroll p-2">
                      {EMOJI_GROUPS.map(group => (
                        <div key={group.label} className="mb-2 last:mb-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1 mb-1">
                            {group.label}
                          </p>
                          <div className="grid grid-cols-8 gap-0.5">
                            {group.emojis.map(e => (
                              <button
                                key={e}
                                onClick={() => insertEmoji(e)}
                                className="aspect-square flex items-center justify-center text-lg rounded-md hover:bg-muted active:scale-90 transition-all"
                              >
                                {e}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleImageUpload(f);
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="h-11 w-11 p-0 shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted/60 active:scale-95"
                  aria-label="Send image"
                >
                  {uploadingImage ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
                </Button>
                <Input
                  ref={inputRef}
                  placeholder={replyTo ? `Reply to ${replyTo.user_name}...` : "Type a message or use /ai to ask Bookie AI..."}
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  maxLength={500}
                  className="flex-1 h-11 text-sm bg-muted/30 border-border/30"
                  disabled={sendingChat}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!chatInput.trim() || sendingChat}
                  className="h-11 w-11 p-0 shrink-0 active:scale-95 transition-transform shine-card relative overflow-hidden"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

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
              <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <p className="font-semibold mb-2">⚠️ Rules</p>
                <ul className="space-y-1.5 text-muted-foreground text-[13px]">
                  <li>• No abusive or offensive language</li>
                  <li>• No spam, links, or irrelevant messages</li>
                  <li>• Be respectful to fellow students</li>
                  <li>• Images should be study-related only (max 5 MB)</li>
                  <li>• Messages auto-delete after 24 hours</li>
                  <li>• Violations are auto-blocked</li>
                </ul>
              </div>
              <Button onClick={acceptCaution} className="w-full h-11 text-sm font-semibold active:scale-95 transition-transform">
                I Understand, Open Chat
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Image lightbox */}
        <Dialog open={!!lightboxUrl} onOpenChange={(o) => !o && setLightboxUrl(null)}>
          <DialogContent className="max-w-3xl p-2 bg-background/95 backdrop-blur-xl border-border/40">
            <DialogHeader className="sr-only">
              <DialogTitle>Image</DialogTitle>
            </DialogHeader>
            {lightboxUrl && (
              <img src={lightboxUrl} alt="full" className="w-full h-auto max-h-[80vh] object-contain rounded-lg" />
            )}
          </DialogContent>
        </Dialog>

        {/* Room settings — creator only */}
        <Dialog open={showRoomSettings} onOpenChange={setShowRoomSettings}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-primary" /> Room settings
              </DialogTitle>
              <DialogDescription className="text-xs">
                Only you (the creator) can change these. Settings vanish with the room after 1 hr of inactivity.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <label className="flex items-center justify-between text-sm cursor-pointer rounded-xl border border-border/30 bg-muted/20 p-3">
                <span className="flex items-center gap-2 font-medium">
                  {settingsLock ? <Lock className="h-4 w-4 text-primary" /> : <LockOpen className="h-4 w-4 text-muted-foreground" />}
                  Lock this room
                </span>
                <input
                  type="checkbox"
                  checked={settingsLock}
                  onChange={e => setSettingsLock(e.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
              </label>
              {settingsLock && (
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Set / update 4-digit PIN (leave blank to keep current)</label>
                  <Input
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="• • • •"
                    value={settingsPin}
                    onChange={e => setSettingsPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="h-12 text-xl tracking-[0.5em] text-center"
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Max participants (2–50, blank = unlimited)</label>
                <Input
                  type="number"
                  min={2}
                  max={50}
                  placeholder="Unlimited"
                  value={settingsMax}
                  onChange={e => setSettingsMax(e.target.value)}
                  className="h-11"
                />
              </div>
              <Button onClick={saveRoomSettings} disabled={savingSettings} className="w-full h-11">
                {savingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ═══════ ROOMS LIST VIEW ═══════
  if (loading) {
    return (
      <div className="space-y-4 pop-in">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-muted/30 rounded-2xl animate-pulse" />
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
          <h3 className="text-base font-bold">Study Rooms</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Join a room to study together</p>
        </div>
        <Button
          variant="outline"
          className="active:scale-95 transition-transform h-10"
          onClick={() => setShowCreate(true)}
        >
          <Plus className="h-4 w-4 mr-2" /> Create
        </Button>
      </div>

      <div className="space-y-3">
        {permanentRooms.map((room, idx) => (
          <RoomCard key={room.id} room={room} index={idx} currentUserId={currentUser.id}
            onJoin={() => attemptJoin(room)} onDelete={undefined} />
        ))}
      </div>

      {customRooms.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Custom Rooms</h3>
          {customRooms.map((room, idx) => (
            <RoomCard key={room.id} room={room} index={idx + permanentRooms.length} currentUserId={currentUser.id}
              onJoin={() => attemptJoin(room)}
              onDelete={room.created_by === currentUser.id ? () => deleteRoom(room.id) : undefined}
            />
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Create Study Room</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input placeholder="Room name" value={newName} onChange={e => setNewName(e.target.value)} maxLength={40} className="h-12 text-base" />
            <Input placeholder="Description (optional)" value={newDesc} onChange={e => setNewDesc(e.target.value)} maxLength={100} className="h-12 text-base" />
            <Input placeholder="Max participants (optional)" type="number" value={newMax} onChange={e => setNewMax(e.target.value)} min={2} max={50} className="h-12 text-base" />
            <div className="rounded-xl border border-border/30 bg-muted/20 p-3 space-y-3">
              <label className="flex items-center justify-between text-sm cursor-pointer">
                <span className="flex items-center gap-2 font-medium">
                  <Lock className="h-4 w-4 text-primary" /> Lock room
                </span>
                <input
                  type="checkbox"
                  checked={newLock}
                  onChange={e => setNewLock(e.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
              </label>
              {newLock && (
                <Input
                  placeholder="Optional 4-digit PIN"
                  inputMode="numeric"
                  maxLength={4}
                  value={newPin}
                  onChange={e => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="h-11 text-base tracking-[0.4em] text-center"
                />
              )}
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Only you can change these later. Lock, PIN and member limit live inside this room and vanish when the room auto-deletes (1 hr inactivity). No history is kept.
              </p>
            </div>
            <p className="text-xs text-muted-foreground">Custom rooms auto-delete after 1hr of inactivity. Chats live for 24 hours.</p>
            <Button onClick={createRoom} disabled={!newName.trim()} className="w-full h-12 text-base active:scale-95 transition-transform">
              Create Room
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* PIN prompt when joining a locked room */}
      <Dialog open={!!pinPromptRoom} onOpenChange={(o) => { if (!o) { setPinPromptRoom(null); setPinInput(''); } }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" /> Enter room PIN
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{pinPromptRoom?.name}</span> is locked. Ask the creator for the 4-digit PIN.
            </p>
            <Input
              autoFocus
              inputMode="numeric"
              maxLength={4}
              placeholder="• • • •"
              value={pinInput}
              onChange={e => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
              onKeyDown={e => { if (e.key === 'Enter') submitPin(); }}
              className="h-14 text-2xl tracking-[0.5em] text-center"
            />
            <Button
              onClick={submitPin}
              disabled={pinChecking || pinInput.length !== 4}
              className="w-full h-11"
            >
              {pinChecking ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Unlock & Join'}
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
    <div
      className="group rounded-2xl border border-border/30 bg-card/50 hover:border-border/60 hover:shadow-md transition-all duration-300 overflow-hidden pop-in"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      <div className="p-4 sm:p-5 flex items-center gap-4">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/8 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform duration-300">
          {room.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-[15px] flex items-center gap-2">
            {room.name}
            {room.is_permanent && <Crown className="h-4 w-4 text-primary shrink-0" />}
            {room.is_locked && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wider">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Locked
              </span>
            )}
          </h4>
          <p className="text-sm text-muted-foreground truncate">
            {room.description || 'Open study room'}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {room.memberCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              {room.memberCount}
            </span>
          )}
          <Button
            variant={room.is_permanent ? 'default' : 'outline'}
            className="h-9 px-4 text-sm font-semibold active:scale-95 transition-transform"
            onClick={onJoin}
            disabled={isFull}
          >
            {isFull ? 'Full' : room.is_locked && room.created_by !== currentUserId ? 'Unlock' : 'Join'}
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
    </div>
  );
}
