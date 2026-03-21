import { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { SUBJECTS } from '@/types/ypt';
import { Plus, Trash2, ListTodo, CheckCircle2, Play, Timer, Pencil, Flag, X, Check, GripVertical, Clock } from 'lucide-react';

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

const PRIORITY_BG: Record<string, string> = {
  high: 'bg-red-500/10 text-red-500 border-red-500/20',
  normal: 'bg-muted text-muted-foreground border-border/30',
  low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

const TIME_OPTIONS = [
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '1 hr', value: 60 },
  { label: '1.5 hr', value: 90 },
  { label: '2 hr', value: 120 },
  { label: '3 hr', value: 180 },
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
    await (supabase as any)
      .from('ypt_todos')
      .update({ completed: !completed })
      .eq('id', id);
    fetchTodos();
  };

  const deleteTodo = async (id: string) => {
    await (supabase as any)
      .from('ypt_todos')
      .delete()
      .eq('id', id);
    fetchTodos();
  };

  const startEdit = (todo: any) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = async () => {
    if (!editingId || !editText.trim()) return;
    await (supabase as any)
      .from('ypt_todos')
      .update({ text: editText.trim() })
      .eq('id', editingId);
    setEditingId(null);
    setEditText('');
    fetchTodos();
  };

  const startStudyForTask = async (task: any) => {
    if (timer.isActive) return;
    const subject = task.subject || 'Physics';
    await timer.startSession(subject);
  };

  // Drag and drop handlers
  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (id !== draggedId) setDragOverId(id);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = async (targetId: string) => {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const incompleteTodos = todos.filter(t => !t.completed);
    const completedTodos = todos.filter(t => t.completed);

    const dragIdx = incompleteTodos.findIndex(t => t.id === draggedId);
    const dropIdx = incompleteTodos.findIndex(t => t.id === targetId);

    if (dragIdx === -1 || dropIdx === -1) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const reordered = [...incompleteTodos];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(dropIdx, 0, moved);

    // Update sort_order for all reordered items
    const updates = reordered.map((t, i) => ({ ...t, sort_order: i }));
    const allUpdated = [...updates, ...completedTodos.map((t, i) => ({ ...t, sort_order: updates.length + i }))];
    setTodos(allUpdated);

    // Persist to DB
    for (const item of updates) {
      await (supabase as any)
        .from('ypt_todos')
        .update({ sort_order: item.sort_order })
        .eq('id', item.id);
    }

    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const completedCount = todos.filter(t => t.completed).length;
  const totalCount = todos.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Sort: incomplete by sort_order, then completed
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
    <div className="space-y-6 pop-in">
      {/* Progress Header */}
      <Card className="p-5 border-border/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <ListTodo className="h-3.5 w-3.5" /> Today's Tasks
          </h3>
          {totalCount > 0 && (
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              {completedCount}/{totalCount} completed
            </span>
          )}
        </div>
        {totalCount > 0 && (
          <Progress value={progress} className="h-1.5" />
        )}
      </Card>

      {/* Add Task Button */}
      <Button
        onClick={() => setShowCreateDialog(true)}
        className="w-full h-12 text-sm font-medium btn-lift active:scale-[0.98] transition-transform"
      >
        <Plus className="h-4 w-4 mr-2" /> Create New Task
      </Button>

      {/* Drag hint */}
      {incompleteTasks.length > 1 && (
        <p className="text-[10px] text-muted-foreground/50 text-center">
          Drag tasks to reorder priority — top = highest
        </p>
      )}

      {/* Task List */}
      {sortedTodos.length === 0 ? (
        <Card className="p-8 text-center border-border/50">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <ListTodo className="h-8 w-8 opacity-30" />
            <p className="text-sm">No tasks for today. Create one above!</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {/* Incomplete tasks - draggable */}
          {incompleteTasks.map((t, i) => (
            <Card
              key={t.id}
              draggable
              onDragStart={() => handleDragStart(t.id)}
              onDragOver={(e) => handleDragOver(e, t.id)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(t.id)}
              onDragEnd={handleDragEnd}
              className={`p-3 sm:p-4 flex items-center gap-2 sm:gap-3 group border-border/30 card-glow pop-in transition-all duration-200 hover:shadow-sm cursor-grab active:cursor-grabbing ${
                draggedId === t.id ? 'opacity-40 scale-95' : ''
              } ${dragOverId === t.id ? 'border-primary/50 shadow-md' : ''}`}
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground/30 shrink-0 hidden sm:block" />

              <Checkbox
                checked={false}
                onCheckedChange={() => toggleTodo(t.id, t.completed)}
                className="shrink-0"
              />

              {editingId === t.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    className="h-8 text-sm"
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && saveEdit()}
                  />
                  <button onClick={saveEdit} className="p-1 text-primary hover:bg-primary/10 rounded">
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => setEditingId(null)} className="p-1 text-muted-foreground hover:bg-muted rounded">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium block truncate">{t.text}</span>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {t.subject && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                          {t.subject}
                        </span>
                      )}
                      {t.time_allotted && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" /> {formatTime(t.time_allotted)}
                        </span>
                      )}
                      {t.priority && t.priority !== 'normal' && (
                        <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${PRIORITY_BG[t.priority]}`}>
                          <Flag className="h-2 w-2" />
                          {t.priority}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Start study directly using task subject */}
                  {!timer.isActive && (
                    <button
                      onClick={() => startStudyForTask(t)}
                      className="opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-md hover:bg-primary/10 text-primary shrink-0"
                      title={`Start studying ${t.subject || ''}`}
                    >
                      <Play className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {timer.isActive && (
                    <Timer className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0" />
                  )}
                  <button
                    onClick={() => startEdit(t)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 shrink-0"
                  >
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                  </button>
                  <button
                    onClick={() => deleteTodo(t.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive transition-colors" />
                  </button>
                </>
              )}
            </Card>
          ))}

          {/* Completed tasks */}
          {completedTasks.length > 0 && (
            <>
              <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider pt-3 pl-1">
                Completed
              </p>
              {completedTasks.map((t, i) => (
                <Card
                  key={t.id}
                  className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3 border-border/20 opacity-50 pop-in"
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  <div className="w-4 hidden sm:block" />
                  <Checkbox
                    checked={true}
                    onCheckedChange={() => toggleTodo(t.id, t.completed)}
                    className="shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm line-through text-muted-foreground truncate block">{t.text}</span>
                    <div className="flex items-center gap-2 mt-1">
                      {t.subject && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {t.subject}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTodo(t.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive transition-colors" />
                  </button>
                </Card>
              ))}
            </>
          )}
        </div>
      )}

      {/* Create Task Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Create New Task</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Task Title</label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Solve 20 integration problems"
                className="h-10 text-sm"
                maxLength={100}
                autoFocus
              />
            </div>

            {/* Subject */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Subject</label>
              <Select value={newSubject} onValueChange={setNewSubject}>
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time Allotted */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Time Allotted (optional)</label>
              <div className="flex flex-wrap gap-2">
                {TIME_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setNewTime(prev => prev === String(opt.value) ? '' : String(opt.value))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      newTime === String(opt.value)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted/50 text-muted-foreground border-border/50 hover:border-border'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Priority</label>
              <div className="flex gap-2">
                {(['high', 'normal', 'low'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setNewPriority(p)}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                      newPriority === p
                        ? PRIORITY_BG[p]
                        : 'border-border/30 text-muted-foreground/50 hover:text-muted-foreground hover:border-border/50'
                    }`}
                  >
                    <Flag className="h-3 w-3" />
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              className="text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={addTodo}
              disabled={!newTitle.trim() || !newSubject}
              className="text-sm btn-lift active:scale-95 transition-transform"
            >
              <Plus className="h-4 w-4 mr-1" /> Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
