import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { SUBJECTS } from '@/types/ypt';
import { Plus, Trash2, ListTodo, CheckCircle2, Play, Timer, Pencil, Flag, X, Check, GripVertical, Clock, Target } from 'lucide-react';

interface TimerControls {
  isActive: boolean;
  isPaused: boolean;
  subject: string | null;
  elapsedSeconds: number;
  startSession: (subject: string) => Promise<void>;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: () => Promise<void>;
  showInactivityModal: boolean;
  inactivityCountdown: number;
  dismissInactivity: () => void;
}

interface Props {
  userId: string;
  timer: TimerControls;
}

const PRIORITY_CONFIG: Record<string, { bg: string; label: string; color: string }> = {
  high: { bg: 'bg-red-500/15 border-red-500/30', label: 'High', color: 'text-red-400' },
  normal: { bg: 'bg-muted/60 border-border/40', label: 'Normal', color: 'text-muted-foreground' },
  low: { bg: 'bg-blue-500/15 border-blue-500/30', label: 'Low', color: 'text-blue-400' },
};

const TIME_OPTIONS = [
  { label: '15m', value: 15 },
  { label: '30m', value: 30 },
  { label: '45m', value: 45 },
  { label: '1h', value: 60 },
  { label: '1.5h', value: 90 },
  { label: '2h', value: 120 },
  { label: '3h', value: 180 },
];

export function V2TasksTab({ userId, timer }: Props) {
  const [todos, setTodos] = useState<any[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newTime, setNewTime] = useState<string>('');
  const [newPriority, setNewPriority] = useState('normal');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const today = new Date().toISOString().split('T')[0];

  const fetchTodos = async () => {
    const { data } = await (supabase as any)
      .from('ypt_todos')
      .select('*')
      .eq('ypt_user_id', userId)
      .eq('created_date', today)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });
    setTodos(data || []);
  };

  useEffect(() => { fetchTodos(); }, [userId]);

  const addTodo = async () => {
    const title = newTitle.trim();
    if (!title || title.length > 100 || !newSubject) return;
    const maxOrder = todos.length > 0 ? Math.max(...todos.map(t => t.sort_order ?? 0)) + 1 : 0;
    await (supabase as any)
      .from('ypt_todos')
      .insert({
        ypt_user_id: userId,
        text: title,
        created_date: today,
        priority: newPriority,
        subject: newSubject,
        time_allotted: newTime ? parseInt(newTime) : null,
        sort_order: maxOrder,
      });
    setNewTitle('');
    setNewSubject('');
    setNewTime('');
    setNewPriority('normal');
    setShowCreateDialog(false);
    fetchTodos();
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    await (supabase as any).from('ypt_todos').update({ completed: !completed }).eq('id', id);
    fetchTodos();
  };

  const deleteTodo = async (id: string) => {
    await (supabase as any).from('ypt_todos').delete().eq('id', id);
    fetchTodos();
  };

  const startEdit = (todo: any) => { setEditingId(todo.id); setEditText(todo.text); };

  const saveEdit = async () => {
    if (!editingId || !editText.trim()) return;
    await (supabase as any).from('ypt_todos').update({ text: editText.trim() }).eq('id', editingId);
    setEditingId(null);
    setEditText('');
    fetchTodos();
  };

  const startStudyForTask = async (task: any) => {
    if (timer.isActive) return;
    await timer.startSession(task.subject || 'Physics');
  };

  const handleDragStart = (id: string) => setDraggedId(id);
  const handleDragOver = (e: React.DragEvent, id: string) => { e.preventDefault(); if (id !== draggedId) setDragOverId(id); };
  const handleDragLeave = () => setDragOverId(null);
  const handleDrop = async (targetId: string) => {
    if (!draggedId || draggedId === targetId) { setDraggedId(null); setDragOverId(null); return; }
    const incomplete = todos.filter(t => !t.completed);
    const completed = todos.filter(t => t.completed);
    const dragIdx = incomplete.findIndex(t => t.id === draggedId);
    const dropIdx = incomplete.findIndex(t => t.id === targetId);
    if (dragIdx === -1 || dropIdx === -1) { setDraggedId(null); setDragOverId(null); return; }
    const reordered = [...incomplete];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(dropIdx, 0, moved);
    const updates = reordered.map((t, i) => ({ ...t, sort_order: i }));
    setTodos([...updates, ...completed.map((t, i) => ({ ...t, sort_order: updates.length + i }))]);
    for (const item of updates) {
      await (supabase as any).from('ypt_todos').update({ sort_order: item.sort_order }).eq('id', item.id);
    }
    setDraggedId(null);
    setDragOverId(null);
  };
  const handleDragEnd = () => { setDraggedId(null); setDragOverId(null); };

  const completedCount = todos.filter(t => t.completed).length;
  const totalCount = todos.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const sortedTodos = [...todos].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return (a.sort_order ?? 0) - (b.sort_order ?? 0);
  });
  const incompleteTasks = sortedTodos.filter(t => !t.completed);
  const completedTasks = sortedTodos.filter(t => t.completed);

  const formatTime = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <div className="space-y-4 pop-in">
      {/* Progress Header */}
      <Card className="p-5 border-border/50 bg-card/80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Today's Tasks</h3>
              <p className="text-sm text-muted-foreground">
                {totalCount === 0 ? 'No tasks yet' : `${completedCount} of ${totalCount} completed`}
              </p>
            </div>
          </div>
          {totalCount > 0 && (
            <span className="text-3xl font-bold text-foreground">{Math.round(progress)}%</span>
          )}
        </div>
        {totalCount > 0 && <Progress value={progress} className="h-2.5" />}
      </Card>

      {/* Add Task Button */}
      <Button
        onClick={() => setShowCreateDialog(true)}
        className="w-full h-14 text-base font-semibold btn-lift active:scale-[0.98] transition-transform gap-2.5"
      >
        <Plus className="h-5 w-5" /> Create New Task
      </Button>

      {/* Drag hint */}
      {incompleteTasks.length > 1 && (
        <p className="text-xs text-muted-foreground/60 text-center flex items-center justify-center gap-1.5">
          <GripVertical className="h-3.5 w-3.5" /> Drag to reorder priority
        </p>
      )}

      {/* Task List — scrollable */}
      {sortedTodos.length === 0 ? (
        <Card className="p-10 text-center border-border/50 bg-card/50">
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center">
              <ListTodo className="h-8 w-8 opacity-40" />
            </div>
            <div>
              <p className="text-lg font-medium text-foreground/70">No tasks for today</p>
              <p className="text-sm text-muted-foreground mt-1">Tap the button above to start</p>
            </div>
          </div>
        </Card>
      ) : (
        <ScrollArea className="max-h-[55vh]">
          <div className="space-y-2.5 pr-2">
            {/* Incomplete Tasks */}
            {incompleteTasks.map((t, i) => (
              <Card
                key={t.id}
                draggable
                onDragStart={() => handleDragStart(t.id)}
                onDragOver={(e) => handleDragOver(e, t.id)}
                onDragLeave={handleDragLeave}
                onDrop={() => handleDrop(t.id)}
                onDragEnd={handleDragEnd}
                className={`p-4 border-border/40 card-glow pop-in transition-all duration-200 cursor-grab active:cursor-grabbing ${
                  draggedId === t.id ? 'opacity-40 scale-95' : ''
                } ${dragOverId === t.id ? 'border-primary/50 shadow-lg scale-[1.01]' : ''}`}
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                {editingId === t.id ? (
                  <div className="flex items-center gap-3">
                    <Input
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      className="h-12 text-base flex-1"
                      autoFocus
                      onKeyDown={e => e.key === 'Enter' && saveEdit()}
                    />
                    <Button size="icon" onClick={saveEdit} className="h-10 w-10">
                      <Check className="h-5 w-5" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setEditingId(null)} className="h-10 w-10">
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    {/* Drag Handle + Checkbox */}
                    <div className="flex items-center gap-2 pt-1 shrink-0">
                      <GripVertical className="h-5 w-5 text-muted-foreground/30 hidden sm:block" />
                      <Checkbox
                        checked={false}
                        onCheckedChange={() => toggleTodo(t.id, t.completed)}
                        className="h-6 w-6 rounded-md"
                      />
                    </div>

                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-foreground leading-snug">{t.text}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {t.subject && (
                          <span className="text-xs px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-medium border border-primary/20">
                            {t.subject}
                          </span>
                        )}
                        {t.time_allotted && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1 bg-muted/50 px-2.5 py-1 rounded-lg">
                            <Clock className="h-3.5 w-3.5" /> {formatTime(t.time_allotted)}
                          </span>
                        )}
                        {t.priority && t.priority !== 'normal' && (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border ${PRIORITY_CONFIG[t.priority].bg} ${PRIORITY_CONFIG[t.priority].color}`}>
                            <Flag className="h-3 w-3" />
                            {PRIORITY_CONFIG[t.priority].label}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {!timer.isActive ? (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => startStudyForTask(t)}
                          className="h-10 w-10 text-primary hover:bg-primary/10"
                          title={`Start studying ${t.subject || ''}`}
                        >
                          <Play className="h-5 w-5" />
                        </Button>
                      ) : (
                        <div className="h-10 w-10 flex items-center justify-center">
                          <Timer className="h-5 w-5 text-muted-foreground/40" />
                        </div>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => startEdit(t)}
                        className="h-10 w-10 text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-4.5 w-4.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteTodo(t.id)}
                        className="h-10 w-10 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <div className="pt-3 space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <CheckCircle2 className="h-4.5 w-4.5 text-primary/50" />
                  <p className="text-sm font-medium text-muted-foreground/60 uppercase tracking-wider">
                    Completed ({completedTasks.length})
                  </p>
                </div>
                {completedTasks.map((t, i) => (
                  <Card
                    key={t.id}
                    className="p-4 flex items-center gap-3 border-border/20 opacity-50 hover:opacity-70 transition-opacity pop-in"
                    style={{ animationDelay: `${i * 0.04}s` }}
                  >
                    <Checkbox
                      checked={true}
                      onCheckedChange={() => toggleTodo(t.id, t.completed)}
                      className="h-6 w-6 rounded-md shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-through text-muted-foreground">{t.text}</p>
                      {t.subject && (
                        <span className="text-xs text-muted-foreground/60 mt-1 block">{t.subject}</span>
                      )}
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteTodo(t.id)}
                      className="h-9 w-9 text-muted-foreground hover:text-destructive shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      )}

      {/* Create Task Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Create New Task</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Task Title</label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Solve 20 integration problems"
                className="h-12 text-base"
                maxLength={100}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Subject</label>
              <Select value={newSubject} onValueChange={setNewSubject}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((s) => (
                    <SelectItem key={s} value={s} className="text-base py-2.5">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Time <span className="text-muted-foreground font-normal">(optional)</span></label>
              <div className="grid grid-cols-4 gap-2">
                {TIME_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setNewTime(prev => prev === String(opt.value) ? '' : String(opt.value))}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      newTime === String(opt.value)
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-muted/40 text-muted-foreground border-border/50 hover:border-border hover:bg-muted/60'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Priority</label>
              <div className="grid grid-cols-3 gap-2">
                {(['high', 'normal', 'low'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setNewPriority(p)}
                    className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-medium border transition-all ${
                      newPriority === p
                        ? `${PRIORITY_CONFIG[p].bg} ${PRIORITY_CONFIG[p].color}`
                        : 'border-border/30 text-muted-foreground/60 hover:text-muted-foreground hover:border-border/50'
                    }`}
                  >
                    <Flag className="h-4 w-4" />
                    {PRIORITY_CONFIG[p].label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 gap-2">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="h-12 text-sm px-5">
              Cancel
            </Button>
            <Button
              onClick={addTodo}
              disabled={!newTitle.trim() || !newSubject}
              className="h-12 text-sm px-6 btn-lift active:scale-95 transition-transform"
            >
              <Plus className="h-4 w-4 mr-1.5" /> Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
