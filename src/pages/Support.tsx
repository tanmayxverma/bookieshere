import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useSupportChat, type SupportMessage } from '@/hooks/useSupportChat';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Send, Paperclip, ShieldCheck, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import siteLogo from '@/assets/logo.jfif';

export default function SupportPage() {
  const navigate = useNavigate();
  const { chat, messages, loading, error, send, refetch } = useSupportChat();
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!image) { setPreview(null); return; }
    const u = URL.createObjectURL(image); setPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [image]);

  useEffect(() => {
    if (scrollerRef.current) scrollerRef.current.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  const canSend = chat && chat.status !== 'rejected';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = draft.trim();
    if (!v && !image) return;
    setBusy(true);
    try {
      let image_url: string | null = null;
      if (image) {
        const ext = image.name.split('.').pop() || 'jpg';
        const path = `support/${crypto.randomUUID()}.${ext}`;
        const up = await supabase.storage.from('room-images').upload(path, image, { upsert: false });
        if (up.error) throw up.error;
        image_url = supabase.storage.from('room-images').getPublicUrl(path).data.publicUrl;
      }
      await send(v, image_url);
      setDraft(''); setImage(null);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Could not send', description: err.message });
    } finally { setBusy(false); }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-8rem)] flex flex-col">
        {/* Bright blue header */}
        <header className="bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 py-3.5 flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="h-9 w-9 rounded-full hover:bg-white/10 flex items-center justify-center">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="h-10 w-10 rounded-full overflow-hidden bg-white/15 border border-white/25 flex items-center justify-center">
              <img src={siteLogo} alt="Bookie" className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0">
              <div className="font-semibold leading-tight">Owner</div>
              <div className="text-xs opacity-80">Direct line — replies as soon as possible</div>
            </div>
            {chat?.status === 'pending' && (
              <span className="ml-auto text-[10px] uppercase tracking-wider bg-white/15 rounded-full px-2 py-0.5 border border-white/25">Awaiting</span>
            )}
            {chat?.status === 'rejected' && (
              <span className="ml-auto text-[10px] uppercase tracking-wider bg-red-500/25 rounded-full px-2 py-0.5 border border-white/25">Closed</span>
            )}
          </div>
        </header>

        {/* Body */}
        <div ref={scrollerRef} className="flex-1 overflow-y-auto bg-muted/30">
          {loading ? (
            <div className="p-10 text-center text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin inline mr-2" />Loading…</div>
          ) : error ? (
            <div className="h-full min-h-[50vh] flex flex-col items-center justify-center gap-3 p-8 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <Button type="button" variant="outline" size="sm" onClick={refetch}>Retry</Button>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full min-h-[50vh] flex flex-col items-center justify-center p-8 text-center">
              <div className="h-14 w-14 rounded-2xl bg-primary/15 flex items-center justify-center mb-4">
                <ShieldCheck className="h-7 w-7 text-primary" />
              </div>
              <h2 className="font-bold text-lg">Start a private conversation</h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">Only you and the owner can read these messages.</p>
            </div>
          ) : (
            <div className="container mx-auto max-w-2xl px-4 py-4 space-y-2">
              {messages.map((m, i) => {
                const prev = messages[i-1];
                const showDate = !prev || !isSameDay(new Date(prev.created_at), new Date(m.created_at));
                return (
                  <div key={m.id}>
                    {showDate && (
                      <div className="text-center my-3">
                        <span className="text-[10px] uppercase tracking-wider bg-background/70 border border-border/40 rounded-full px-2.5 py-0.5 text-muted-foreground">
                          {format(new Date(m.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                    )}
                    <Bubble m={m} perspective="user" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Input bar */}
        <form onSubmit={submit} className="border-t border-border/50 bg-background">
          {preview && (
            <div className="container mx-auto max-w-2xl px-4 pt-2">
              <div className="relative inline-block rounded-lg overflow-hidden border border-border/40">
                <img src={preview} className="h-20 w-auto" alt="" />
                <button type="button" onClick={() => setImage(null)} className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/70 text-white flex items-center justify-center">
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
          <div className="container mx-auto max-w-2xl px-4 py-2.5 flex items-center gap-2">
            <button type="button" onClick={() => fileRef.current?.click()} disabled={!canSend}
              className="h-10 w-10 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition disabled:opacity-40">
              <Paperclip className="h-4 w-4" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => setImage(e.target.files?.[0] ?? null)} />
            <input value={draft} onChange={e => setDraft(e.target.value)} maxLength={4000} disabled={!canSend}
              placeholder={canSend ? "Write a message to the owner…" : "This conversation is closed"}
              className="flex-1 h-10 rounded-full bg-muted/60 px-4 text-sm outline-none border border-transparent focus:border-primary/30 focus:bg-background transition disabled:opacity-50" />
            <button type="submit" disabled={!canSend || busy || (!draft.trim() && !image)}
              className="h-10 w-10 shrink-0 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center transition disabled:opacity-40">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

function Bubble({ m, perspective }: { m: SupportMessage; perspective: 'user' | 'admin' }) {
  if (m.author_role === 'system') {
    return <div className="text-center my-2 text-[11px] italic text-muted-foreground">{m.body}</div>;
  }
  const isMine = perspective === 'user' ? m.author_role === 'user' : m.author_role === 'admin';
  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm ${
        isMine ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-background border border-border/50 rounded-bl-sm'
      }`}>
        {m.image_url && (
          <a href={m.image_url} target="_blank" rel="noreferrer" className="block mb-1.5 rounded-lg overflow-hidden">
            <img src={m.image_url} alt="" className="max-h-64 w-auto rounded-lg" />
          </a>
        )}
        {m.body && <div className="whitespace-pre-wrap break-words">{m.body}</div>}
        <div className={`text-[10px] mt-0.5 ${isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
          {format(new Date(m.created_at), 'h:mm a')}
        </div>
      </div>
    </div>
  );
}
