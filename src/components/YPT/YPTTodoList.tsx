import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Trash2, ListTodo } from 'lucide-react';

interface Props {
  userId: string;
}

export function YPTTodoList({ userId }: Props) {
  const [todos, setTodos] = useState<any[]>([]);
  const [newText, setNewText] = useState('');
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

  useEffect(() => {
    fetchTodos();
  }, [userId]);

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

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <ListTodo className="h-4 w-4 text-primary" /> Today's Tasks
      </h3>
      <div className="space-y-2 mb-3">
        {todos.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">No tasks yet. Add one below.</p>
        )}
        {todos.map((t) => (
          <div key={t.id} className="flex items-center gap-2 group">
            <Checkbox
              checked={t.completed}
              onCheckedChange={() => toggleTodo(t.id, t.completed)}
            />
            <span className={`flex-1 text-sm ${t.completed ? 'line-through text-muted-foreground' : ''}`}>
              {t.text}
            </span>
            <button
              onClick={() => deleteTodo(t.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
            >
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive transition-colors" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Add a task..."
          className="h-8 text-sm"
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
          maxLength={100}
        />
        <Button size="sm" variant="ghost" onClick={addTodo} className="h-8 px-2 shrink-0">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
