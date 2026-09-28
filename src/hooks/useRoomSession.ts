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
      const countedUsersPerRoom: Record<string, Set<string>> = {};
      Object.values(state).forEach((presences: any) => {
        presences.forEach((p: any) => {
          if (p.room_id) {
            const uid = p.user_id || 'anon';
            if (!countedUsersPerRoom[p.room_id]) {
              countedUsersPerRoom[p.room_id] = new Set();
            }
            if (!countedUsersPerRoom[p.room_id].has(uid)) {
              countedUsersPerRoom[p.room_id].add(uid);
              counts[p.room_id] = (counts[p.room_id] || 0) + 1;
            }
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

  // Re-track on global channel whenever activeRoomId changes
  useEffect(() => {
    if (!currentUser || !globalChannelRef.current) return;
    try {
      globalChannelRef.current.track({
        user_id: currentUser.id,
        name: currentUser.name,
        room_id: activeRoomId || null,
      });
    } catch {}
  }, [activeRoomId, currentUser?.id, currentUser?.name]);

  // Room-specific presence
  useEffect(() => {
    if (!activeRoomId || !currentUser) {
      setPresenceMembers([]);
      return;
    }

    // Immediately ensure current user is listed in presence
    setPresenceMembers(prev => {
      if (prev.some(m => m.user_id === currentUser.id)) return prev;
      return [{
        user_id: currentUser.id,
        name: currentUser.name,
        jee_focus_year: currentUser.jee_focus_year || '2026',
      }, ...prev];
    });

    // Query active members from DB to instantly populate room list while realtime presence syncs
    (supabase as any)
      .from('ypt_room_members')
      .select('ypt_user_id, ypt_users(id, name, jee_focus_year)')
      .eq('room_id', activeRoomId)
      .then(({ data }: any) => {
        if (data && data.length > 0) {
          const dbMembers: PresenceMember[] = data
            .filter((d: any) => d.ypt_users?.name)
            .map((d: any) => ({
              user_id: d.ypt_users.id || d.ypt_user_id,
              name: d.ypt_users.name,
              jee_focus_year: d.ypt_users.jee_focus_year || '2026',
            }));
          setPresenceMembers(prev => {
            const seen = new Set<string>();
            const merged: PresenceMember[] = [];
            seen.add(currentUser.id);
            merged.push({
              user_id: currentUser.id,
              name: currentUser.name,
              jee_focus_year: currentUser.jee_focus_year || '2026',
            });
            [...prev, ...dbMembers].forEach(m => {
              if (!seen.has(m.user_id)) {
                seen.add(m.user_id);
                merged.push(m);
              }
            });
            return merged;
          });
        }
      })
      .catch(() => {});

    const channel = supabase.channel(`room_presence_${activeRoomId}`, {
      config: { presence: { key: currentUser.id } },
    });
    roomPresenceRef.current = channel;

    const syncMembers = () => {
      const state = channel.presenceState();
      const members: PresenceMember[] = [];
      const seen = new Set<string>();

      // Always guarantee currentUser is in room
      seen.add(currentUser.id);
      members.push({
        user_id: currentUser.id,
        name: currentUser.name,
        jee_focus_year: currentUser.jee_focus_year || '2026',
      });

      Object.values(state).forEach((presences: any) => {
        presences.forEach((p: any) => {
          if (p.user_id && !seen.has(p.user_id)) {
            seen.add(p.user_id);
            members.push({
              user_id: p.user_id,
              name: p.name || 'Aspirant',
              jee_focus_year: p.jee_focus_year || '2026',
            });
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
          try {
            await channel.track({
              user_id: currentUser.id,
              name: currentUser.name,
              jee_focus_year: currentUser.jee_focus_year,
              room_id: activeRoomId,
            });
          } catch {}

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

    return () => {
      supabase.removeChannel(channel);
      roomPresenceRef.current = null;
    };
  }, [activeRoomId, currentUser?.id, currentUser?.name, currentUser?.jee_focus_year]);

  // Anti-cheat: cleanup on tab close
  useEffect(() => {
    if (!currentUser) return;

    const handleBeforeUnload = () => {
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
          setActiveRoomId(null);
          setActiveRoomName(null);
          setActiveRoomEmoji(null);
          localStorage.removeItem(ROOM_STORAGE_KEY);
        }
      })
      .catch(() => {});
  }, []);

  const joinRoom = useCallback(async (roomId: string, roomName: string, roomEmoji: string) => {
    if (!currentUser) return;

    // 1. Optimistic immediate state update (0ms perceived latency)
    setActiveRoomId(roomId);
    setActiveRoomName(roomName);
    setActiveRoomEmoji(roomEmoji);
    setPresenceMembers(prev => {
      if (prev.some(m => m.user_id === currentUser.id)) return prev;
      return [{
        user_id: currentUser.id,
        name: currentUser.name,
        jee_focus_year: currentUser.jee_focus_year || '2026',
      }, ...prev];
    });

    // 2. Perform DB operations asynchronously in background
    (async () => {
      try {
        await (supabase as any).from('ypt_room_members').delete().eq('ypt_user_id', currentUser.id);
        await (supabase as any).from('ypt_room_members').insert({ room_id: roomId, ypt_user_id: currentUser.id });
        await (supabase as any).from('ypt_rooms').update({ last_activity_at: new Date().toISOString() }).eq('id', roomId);
      } catch (err) {
        console.warn('Room join background sync error:', err);
      }
    })();

    // 3. Auto-start study session if not active
    if (!isTimerActiveRef.current) {
      try { await startSession('Self Study'); } catch {}
    }
  }, [currentUser?.id, currentUser?.name, currentUser?.jee_focus_year, startSession]);

  const leaveRoom = useCallback(async () => {
    if (!currentUser) return;
    const leavingUserId = currentUser.id;
    const leavingName = currentUser.name;

    // 1. Optimistically clear local state immediately for instant navigation
    setActiveRoomId(null);
    setActiveRoomName(null);
    setActiveRoomEmoji(null);
    setPresenceMembers([]);

    // 2. Teardown presence, timer, and DB records in parallel/background
    (async () => {
      if (isTimerActiveRef.current) {
        try { await endSessionRef.current(); } catch {}
      }

      if (roomPresenceRef.current) {
        try { await roomPresenceRef.current.untrack(); } catch {}
      }

      if (globalChannelRef.current) {
        try {
          await globalChannelRef.current.track({
            user_id: leavingUserId,
            name: leavingName,
            room_id: null,
          });
        } catch {}
      }

      try {
        await (supabase as any).from('ypt_room_members').delete().eq('ypt_user_id', leavingUserId);
      } catch {}
    })();
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
