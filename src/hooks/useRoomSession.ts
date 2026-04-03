import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { YPTUser } from '@/types/ypt';

// Use refs to avoid stale closures in callbacks

const ROOM_STORAGE_KEY = 'ypt_active_room';

interface RoomState {
  roomId: string;
  roomName: string;
  roomEmoji: string;
}

export interface RoomSession {
  activeRoomId: string | null;
  activeRoomName: string | null;
  activeRoomEmoji: string | null;
  presenceMembers: PresenceMember[];
  roomOnlineCounts: Record<string, number>;
  joinRoom: (roomId: string, roomName: string, roomEmoji: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
}

export interface PresenceMember {
  user_id: string;
  name: string;
  jee_focus_year: string;
}

function getSavedRoom(): RoomState | null {
  try {
    const raw = localStorage.getItem(ROOM_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function useRoomSession(
  currentUser: YPTUser | null,
  startSession: (subject: string) => Promise<void>,
  endSession: () => Promise<void>,
  isTimerActive: boolean,
) {
  const saved = getSavedRoom();
  const [activeRoomId, setActiveRoomId] = useState<string | null>(saved?.roomId || null);
  const [activeRoomName, setActiveRoomName] = useState<string | null>(saved?.roomName || null);
  const [activeRoomEmoji, setActiveRoomEmoji] = useState<string | null>(saved?.roomEmoji || null);
  const [presenceMembers, setPresenceMembers] = useState<PresenceMember[]>([]);
  const [roomOnlineCounts, setRoomOnlineCounts] = useState<Record<string, number>>({});
  const roomPresenceRef = useRef<any>(null);
  const globalChannelRef = useRef<any>(null);
  const isTimerActiveRef = useRef(isTimerActive);
  const endSessionRef = useRef(endSession);

  // Keep refs fresh
  useEffect(() => { isTimerActiveRef.current = isTimerActive; }, [isTimerActive]);
  useEffect(() => { endSessionRef.current = endSession; }, [endSession]);

  // Save/clear room state in localStorage
  useEffect(() => {
    if (activeRoomId && activeRoomName) {
      localStorage.setItem(ROOM_STORAGE_KEY, JSON.stringify({
        roomId: activeRoomId,
        roomName: activeRoomName,
        roomEmoji: activeRoomEmoji || '📖',
      }));
    } else {
      localStorage.removeItem(ROOM_STORAGE_KEY);
    }
  }, [activeRoomId, activeRoomName, activeRoomEmoji]);

  // Global presence channel for room listing counts
  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase.channel('rooms_global_presence', {
      config: { presence: { key: currentUser.id } },
    });
    globalChannelRef.current = channel;

    const updateCounts = () => {
      const state = channel.presenceState();
      const counts: Record<string, number> = {};
      Object.values(state).forEach((presences: any) => {
        presences.forEach((p: any) => {
          if (p.room_id) {
            counts[p.room_id] = (counts[p.room_id] || 0) + 1;
          }
        });
      });
      setRoomOnlineCounts(counts);
    };

    channel
      .on('presence', { event: 'sync' }, updateCounts)
      .on('presence', { event: 'join' }, updateCounts)
      .on('presence', { event: 'leave' }, updateCounts)
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && activeRoomId) {
          await channel.track({
            user_id: currentUser.id,
            name: currentUser.name,
            room_id: activeRoomId,
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
      globalChannelRef.current = null;
    };
  }, [currentUser?.id]);

  // Room-specific presence
  useEffect(() => {
    if (!activeRoomId || !currentUser) {
      setPresenceMembers([]);
      return;
    }

    const channel = supabase.channel(`room_presence_${activeRoomId}`, {
      config: { presence: { key: currentUser.id } },
    });
    roomPresenceRef.current = channel;

    const syncMembers = () => {
      const state = channel.presenceState();
      const members: PresenceMember[] = [];
      const seen = new Set<string>();
      Object.values(state).forEach((presences: any) => {
        presences.forEach((p: any) => {
          if (!seen.has(p.user_id)) {
            seen.add(p.user_id);
            members.push({ user_id: p.user_id, name: p.name, jee_focus_year: p.jee_focus_year });
          }
        });
      });
      setPresenceMembers(members);
    };

    channel
      .on('presence', { event: 'sync' }, syncMembers)
      .on('presence', { event: 'join' }, syncMembers)
      .on('presence', { event: 'leave' }, syncMembers)
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: currentUser.id,
            name: currentUser.name,
            jee_focus_year: currentUser.jee_focus_year,
            room_id: activeRoomId,
          });
          // Also update global channel
          if (globalChannelRef.current) {
            try {
              await globalChannelRef.current.track({
                user_id: currentUser.id,
                name: currentUser.name,
                room_id: activeRoomId,
              });
            } catch {}
          }
        }
      });

    // Don't remove channel on cleanup — leaveRoom handles untrack explicitly
    // Only remove if activeRoomId changes (switching rooms) or unmount
    return () => {
      // Channel removal triggers implicit untrack on server side
      supabase.removeChannel(channel);
      roomPresenceRef.current = null;
    };
  }, [activeRoomId, currentUser?.id, currentUser?.name, currentUser?.jee_focus_year]);

  // Anti-cheat: cleanup on tab close
  useEffect(() => {
    if (!currentUser) return;

    const handleBeforeUnload = () => {
      // Use sendBeacon to remove from room_members
      if (activeRoomId) {
        const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/ypt_room_members?ypt_user_id=eq.${currentUser.id}`;
        navigator.sendBeacon(url, new Blob([], { type: 'application/json' }));
        localStorage.removeItem(ROOM_STORAGE_KEY);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentUser?.id, activeRoomId]);

  // On mount: verify saved room still exists
  useEffect(() => {
    if (!activeRoomId || !currentUser) return;
    (supabase as any)
      .from('ypt_rooms')
      .select('id, name, emoji')
      .eq('id', activeRoomId)
      .maybeSingle()
      .then(({ data }: any) => {
        if (!data) {
          // Room was deleted
          setActiveRoomId(null);
          setActiveRoomName(null);
          setActiveRoomEmoji(null);
          localStorage.removeItem(ROOM_STORAGE_KEY);
        }
      });
  }, []);

  const joinRoom = useCallback(async (roomId: string, roomName: string, roomEmoji: string) => {
    if (!currentUser) return;
    // DB record
    await (supabase as any).from('ypt_room_members').delete().eq('ypt_user_id', currentUser.id);
    await (supabase as any).from('ypt_room_members').insert({ room_id: roomId, ypt_user_id: currentUser.id });
    await (supabase as any).from('ypt_rooms').update({ last_activity_at: new Date().toISOString() }).eq('id', roomId);
    
    setActiveRoomId(roomId);
    setActiveRoomName(roomName);
    setActiveRoomEmoji(roomEmoji);

    // Auto-start session if not active
    if (!isTimerActive) {
      try { await startSession('Self Study'); } catch {}
    }
  }, [currentUser?.id, isTimerActive, startSession]);

  const leaveRoom = useCallback(async () => {
    if (!currentUser) return;
    
    // 1. Stop the study timer FIRST (use ref for fresh value)
    if (isTimerActiveRef.current) {
      try { await endSessionRef.current(); } catch {}
    }

    // 2. Untrack from room presence (triggers leave event for other users)
    if (roomPresenceRef.current) {
      try { await roomPresenceRef.current.untrack(); } catch {}
    }
    
    // 3. Clear global room association
    if (globalChannelRef.current) {
      try {
        await globalChannelRef.current.track({
          user_id: currentUser.id,
          name: currentUser.name,
          room_id: null,
        });
      } catch {}
    }
    
    // 4. Remove DB record
    await (supabase as any).from('ypt_room_members').delete().eq('ypt_user_id', currentUser.id);

    // 5. Clear local state (this triggers the presence useEffect cleanup which removes the channel)
    setActiveRoomId(null);
    setActiveRoomName(null);
    setActiveRoomEmoji(null);
    setPresenceMembers([]);
  }, [currentUser?.id, currentUser?.name]);

  return {
    activeRoomId,
    activeRoomName,
    activeRoomEmoji,
    presenceMembers,
    roomOnlineCounts,
    joinRoom,
    leaveRoom,
  };
}
