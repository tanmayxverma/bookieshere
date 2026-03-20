import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { SUBJECTS } from '@/types/ypt';
import { Plus, Trash2, ListTodo, CheckCircle2, Play, Timer, Pencil, Flag, X, Check } from 'lucide-react';

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

const PRIORITY_COLORS: Record<string, string> = {
  high: 'text-red-500',
  normal: 'text-muted-foreground',
  low: 'text-blue-400',
};

const PRIORITY_BG: Record<string, string> = {
  high: 'bg-red-500/10 text-red-500 border-red-500/20',
  normal: 'bg-muted text-muted-foreground border-border/30',
  low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

export function V2TasksTab({ userId, timer }: Props) {
  const [todos, setTodos] = useState<any[]>([]);
  const [newText, setNewText] = useState('');
  const [newPriority, setNewPriority] = useState('normal');
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const today = new Date().toISOString().split('T')[0];

  const fetchTodos = async () => {
    const { data } = await (supabase as any)
      .from('ypt_todos')
      .select('*')
      .eq('ypt_user_id', userId)
      .eq('created_date', today)
      .order('created_at', { ascending: true });
    setTodos(data || []);
  };

  useEffect(() => { fetchTodos(); }, [userId]);

  const addTodo = async () => {
    const text = newText.trim();
    if (!text || text.length > 100) return;
    await (supabase as any)
      .from('ypt_todos')
      .insert({ ypt_user_id: userId, text, created_date: today, priority: newPriority });
    setNewText('');
    setNewPriority('normal');
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

  const startStudyForTask = () => {
    if (timer.isActive) return;
    setShowSubjectPicker(true);
  };

  const handleSubjectSelect = async (subject: string) => {
    setShowSubjectPicker(false);
    await timer.startSession(subject);
  };

  const completedCount = todos.filter(t => t.completed).length;
  const totalCount = todos.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Sort: incomplete first (high > normal > low), then completed
  const sortedTodos = [...todos].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const prio = { high: 0, normal: 1, low: 2 } as Record<string, number>;
    return (prio[a.priority] ?? 1) - (prio[b.priority] ?? 1);
  });

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

      {/* Add Task */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Add a new task..."
            className="h-10 text-sm"
            onKeyDown={(e) => e.key === 'Enter' && addTodo()}
            maxLength={100}
          />
          <Button size="sm" onClick={addTodo} className="h-10 px-4 shrink-0 btn-lift active:scale-95 transition-transform">
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
        <div className="flex gap-2 pl-1">
          {(['high', 'normal', 'low'] as const).map(p => (
            <button
              key={p}
              onClick={() => setNewPriority(p)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all ${
                newPriority === p
                  ? PRIORITY_BG[p]
                  : 'border-transparent text-muted-foreground/50 hover:text-muted-foreground'
              }`}
            >
              <Flag className="h-2.5 w-2.5" />
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      {sortedTodos.length === 0 ? (
        <Card className="p-8 text-center border-border/50">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <ListTodo className="h-8 w-8 opacity-30" />
            <p className="text-sm">No tasks for today. Add one above!</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {sortedTodos.map((t, i) => (
            <Card
              key={t.id}
              className={`p-4 flex items-center gap-3 group border-border/30 card-glow pop-in transition-all duration-200 hover:shadow-sm ${
                t.completed ? 'opacity-60' : ''
              }`}
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <Checkbox
                checked={t.completed}
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
                    <span className={`text-sm transition-all duration-200 ${t.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {t.text}
                    </span>
                  </div>

                  {/* Priority badge */}
                  {t.priority && t.priority !== 'normal' && !t.completed && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${PRIORITY_BG[t.priority]}`}>
                      <Flag className="h-2.5 w-2.5" />
                      {t.priority}
                    </span>
                  )}

                  {/* Action buttons */}
                  {!t.completed && !timer.isActive && (
                    <button
                      onClick={startStudyForTask}
                      className="opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-md hover:bg-primary/10 text-primary"
                      title="Start studying"
                    >
                      <Play className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {timer.isActive && !t.completed && (
                    <Timer className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0" />
                  )}
                  {!t.completed && (
                    <button
                      onClick={() => startEdit(t)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    >
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteTodo(t.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive transition-colors" />
                  </button>
                </>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Subject picker for task-initiated study */}
      <Dialog open={showSubjectPicker} onOpenChange={setShowSubjectPicker}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>What subject for this task?</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 pt-2">
            {SUBJECTS.map((s) => (
              <Button
                key={s}
                variant="outline"
                className="h-16 text-base font-medium card-glow active:scale-95 transition-transform"
                onClick={() => handleSubjectSelect(s)}
              >
                {s}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
