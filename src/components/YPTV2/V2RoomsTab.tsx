import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Users, Plus, LogOut, ArrowLeft, Crown, Trash2 } from 'lucide-react';
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

export function V2RoomsTab({ currentUser, timer }: Props) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [roomMembers, setRoomMembers] = useState<RoomMember[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newMax, setNewMax] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchRooms = async () => {
    // Clean up stale custom rooms
    await (supabase as any).rpc('cleanup_inactive_rooms');

    const { data: roomsData } = await (supabase as any)
      .from('ypt_rooms')
      .select('*')
      .order('is_permanent', { ascending: false })
      .order('created_at', { ascending: true });

    if (!roomsData) { setLoading(false); return; }

    // Get member counts
    const { data: members } = await (supabase as any)
      .from('ypt_room_members')
      .select('room_id');

    const countMap: Record<string, number> = {};
    (members || []).forEach((m: any) => {
      countMap[m.room_id] = (countMap[m.room_id] || 0) + 1;
    });

    setRooms(roomsData.map((r: any) => ({
      ...r,
      memberCount: countMap[r.id] || 0,
    })));
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

  useEffect(() => {
    fetchRooms();

    // Realtime subscription for room members
    const channel = supabase
      .channel('ypt_rooms_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ypt_room_members' }, () => {
        fetchRooms();
        if (activeRoomId) fetchRoomMembers(activeRoomId);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ypt_rooms' }, () => {
        fetchRooms();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeRoomId]);

  const joinRoom = async (roomId: string) => {
    // Leave any current room first
    await (supabase as any)
      .from('ypt_room_members')
      .delete()
      .eq('ypt_user_id', currentUser.id);

    // Join new room
    await (supabase as any)
      .from('ypt_room_members')
      .insert({ room_id: roomId, ypt_user_id: currentUser.id });

    // Update room activity
    await (supabase as any)
      .from('ypt_rooms')
      .update({ last_activity_at: new Date().toISOString() })
      .eq('id', roomId);

    setActiveRoomId(roomId);
    fetchRoomMembers(roomId);
    fetchRooms();
  };

  const leaveRoom = async () => {
    await (supabase as any)
      .from('ypt_room_members')
      .delete()
      .eq('ypt_user_id', currentUser.id);

    setActiveRoomId(null);
    setRoomMembers([]);
    fetchRooms();
  };

  const createRoom = async () => {
    const name = newName.trim();
    if (!name || name.length > 40) return;

    await (supabase as any)
      .from('ypt_rooms')
      .insert({
        name,
        description: newDesc.trim() || null,
        emoji: '💡',
        is_permanent: false,
        max_participants: newMax ? parseInt(newMax) : null,
        created_by: currentUser.id,
      });

    setNewName('');
    setNewDesc('');
    setNewMax('');
    setShowCreate(false);
    fetchRooms();
  };

  const deleteRoom = async (roomId: string) => {
    await (supabase as any).from('ypt_rooms').delete().eq('id', roomId);
    if (activeRoomId === roomId) {
      setActiveRoomId(null);
      setRoomMembers([]);
    }
    fetchRooms();
  };

  // Check if current user is in any room
  const currentRoom = rooms.find(r => r.id === activeRoomId);
  const isInAnyRoom = !!activeRoomId;

  // Room detail view
  if (activeRoomId && currentRoom) {
    return (
      <div className="space-y-6 pop-in">
        {/* Back button */}
        <button
          onClick={leaveRoom}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Rooms
        </button>

        {/* Room Header */}
        <Card className="p-6 border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl">
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
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Users className="h-3.5 w-3.5" />
                {roomMembers.length}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={leaveRoom}
                className="text-destructive border-destructive/20 hover:bg-destructive/10 active:scale-95 transition-transform"
              >
                <LogOut className="h-3.5 w-3.5 mr-1.5" /> Leave
              </Button>
            </div>
          </div>
        </Card>

        {/* Members List */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
            Members ({roomMembers.length})
          </h3>
          {roomMembers.length === 0 ? (
            <Card className="p-6 text-center border-border/50 text-muted-foreground text-sm">
              No one else is here yet. Share this room!
            </Card>
          ) : (
            roomMembers.map((m, i) => {
              const isMe = m.ypt_user_id === currentUser.id;
              return (
                <Card
                  key={m.ypt_user_id}
                  className={`p-4 flex items-center gap-3 border-border/30 card-glow pop-in ${isMe ? 'border-primary/20 bg-primary/5' : ''}`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isMe ? 'bg-primary/15 text-primary' : 'bg-muted text-foreground/70'
                  }`}>
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isMe ? 'text-primary' : ''}`}>
                      {m.name} {isMe && <span className="text-[10px] text-muted-foreground">(you)</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">{m.jee_focus_year}</p>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
                </Card>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // Rooms list view
  if (loading) {
    return (
      <div className="space-y-4 pop-in">
        {[1, 2, 3].map(i => (
          <Card key={i} className="p-6 border-border/50 animate-pulse">
            <div className="h-12 bg-muted rounded-xl" />
          </Card>
        ))}
      </div>
    );
  }

  const permanentRooms = rooms.filter(r => r.is_permanent);
  const customRooms = rooms.filter(r => !r.is_permanent);

  return (
    <div className="space-y-6 pop-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Study Rooms</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Join a room to study with others
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="active:scale-95 transition-transform"
          onClick={() => setShowCreate(true)}
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" /> Create Room
        </Button>
      </div>

      {/* Permanent Rooms */}
      <div className="space-y-3">
        {permanentRooms.map((room, idx) => (
          <RoomCard
            key={room.id}
            room={room}
            index={idx}
            currentUserId={currentUser.id}
            onJoin={() => joinRoom(room.id)}
            onDelete={undefined}
          />
        ))}
      </div>

      {/* Custom Rooms */}
      {customRooms.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Custom Rooms</h3>
          {customRooms.map((room, idx) => (
            <RoomCard
              key={room.id}
              room={room}
              index={idx + permanentRooms.length}
              currentUserId={currentUser.id}
              onJoin={() => joinRoom(room.id)}
              onDelete={room.created_by === currentUser.id ? () => deleteRoom(room.id) : undefined}
            />
          ))}
        </div>
      )}

      {/* Create Room Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Create a Study Room</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              placeholder="Room name"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              maxLength={40}
              className="h-11"
            />
            <Input
              placeholder="Description (optional)"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              maxLength={100}
              className="h-11"
            />
            <Input
              placeholder="Max participants (optional)"
              type="number"
              value={newMax}
              onChange={e => setNewMax(e.target.value)}
              min={2}
              max={50}
              className="h-11"
            />
            <p className="text-xs text-muted-foreground">
              Custom rooms auto-delete after 1 hour of inactivity.
            </p>
            <Button
              onClick={createRoom}
              disabled={!newName.trim()}
              className="w-full active:scale-95 transition-transform"
            >
              Create Room
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RoomCard({ room, index, currentUserId, onJoin, onDelete }: {
  room: Room;
  index: number;
  currentUserId: string;
  onJoin: () => void;
  onDelete?: () => void;
}) {
  const isFull = room.max_participants ? room.memberCount >= room.max_participants : false;

  return (
    <Card
      className="group border-border/30 overflow-hidden hover:border-border/60 hover:shadow-md transition-all duration-300 card-glow pop-in"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className="p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/8 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform duration-300">
          {room.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            {room.name}
            {room.is_permanent && <Crown className="h-3.5 w-3.5 text-primary" />}
          </h4>
          <p className="text-xs text-muted-foreground truncate">
            {room.description || 'Open study room'}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {room.memberCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              {room.memberCount} studying
            </span>
          )}
          {room.max_participants && (
            <span className="text-[10px] text-muted-foreground">
              {room.memberCount}/{room.max_participants}
            </span>
          )}
          <Button
            size="sm"
            variant={room.is_permanent ? 'default' : 'outline'}
            className="h-8 text-xs active:scale-95 transition-transform"
            onClick={onJoin}
            disabled={isFull}
          >
            {isFull ? 'Full' : 'Join'}
          </Button>
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
