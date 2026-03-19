import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { SUBJECTS } from '@/types/ypt';
import { Plus, Trash2, ListTodo, CheckCircle2, Play, Timer } from 'lucide-react';

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

export function V2TasksTab({ userId, timer }: Props) {
  const [todos, setTodos] = useState<any[]>([]);
  const [newText, setNewText] = useState('');
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);
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
      .insert({ ypt_user_id: userId, text, created_date: today });
    setNewText('');
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

  const startStudyForTask = (taskId: string) => {
    if (timer.isActive) return; // Already studying
    setPendingTaskId(taskId);
    setShowSubjectPicker(true);
  };

  const handleSubjectSelect = async (subject: string) => {
    setShowSubjectPicker(false);
    setPendingTaskId(null);
    await timer.startSession(subject);
  };

  const completedCount = todos.filter(t => t.completed).length;
  const totalCount = todos.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

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

      {/* Task List */}
      {todos.length === 0 ? (
        <Card className="p-8 text-center border-border/50">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <ListTodo className="h-8 w-8 opacity-30" />
            <p className="text-sm">No tasks for today. Add one above!</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {todos.map((t, i) => (
            <Card
              key={t.id}
              className={`p-4 flex items-center gap-3 group border-border/50 card-glow pop-in`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <Checkbox
                checked={t.completed}
                onCheckedChange={() => toggleTodo(t.id, t.completed)}
                className="shrink-0"
              />
              <span className={`flex-1 text-sm transition-all duration-200 ${t.completed ? 'line-through text-muted-foreground' : ''}`}>
                {t.text}
              </span>
              {/* Start study from task */}
              {!t.completed && !timer.isActive && (
                <button
                  onClick={() => startStudyForTask(t.id)}
                  className="opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-md hover:bg-primary/10 text-primary"
                  title="Start studying this task"
                >
                  <Play className="h-3.5 w-3.5" />
                </button>
              )}
              {/* Show timer indicator if studying */}
              {timer.isActive && !t.completed && (
                <Timer className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0" />
              )}
              <button
                onClick={() => deleteTodo(t.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
              >
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive transition-colors" />
              </button>
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
