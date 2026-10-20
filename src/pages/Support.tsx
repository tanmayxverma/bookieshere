import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useSupportChat, type SupportMessage } from '@/hooks/useSupportChat';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Send, Paperclip, ShieldCheck, X, Loader2, Search,
  CheckCheck, RefreshCw, Bug, BookOpen, HelpCircle,
  Sparkles, ExternalLink, Coffee, Clock, Terminal, Zap, Check
} from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { cn, safeRandomUUID } from '@/lib/utils';

const MATH_SYMBOLS = ['θ', 'π', 'μ', 'λ', 'α', 'β', 'Δ', '∫', 'Σ', '→', '∞', '≈'];

export default function SupportPage() {
  const navigate = useNavigate();
  const { chat, messages, loading, error, send, refetch } = useSupportChat();
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSymbolBar, setShowSymbolBar] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!image) { setPreview(null); return; }
    const u = URL.createObjectURL(image);
    setPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [image]);

  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages.length]);

  const canSend = !chat || chat.status !== 'rejected';

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          if (file.size > 5 * 1024 * 1024) {
            toast({ variant: 'destructive', description: 'Image size must be under 5MB.' });
            return;
          }
          setImage(file);
          toast({ description: 'Image attached from clipboard!' });
          break;
        }
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ variant: 'destructive', description: 'Image size must be under 5MB.' });
        return;
      }
      setImage(file);
      toast({ description: 'Image dropped and attached!' });
    }
  };

  const submit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const v = draft.trim();
    if (!v && !image) return;
    setBusy(true);
    try {
      let image_url: string | null = null;
      if (image) {
        const ext = image.name.split('.').pop() || 'jpg';
        const path = `support/${safeRandomUUID()}.${ext}`;
        const up = await supabase.storage.from('room-images').upload(path, image, { upsert: false });
        if (up.error) throw up.error;
        image_url = supabase.storage.from('room-images').getPublicUrl(path).data.publicUrl;
      }
      await send(v, image_url);
      setDraft('');
      setImage(null);
      if (inputRef.current) inputRef.current.focus();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Could not send', description: err.message });
    } finally {
      setBusy(false);
    }
  };

  const handleQuickTopic = (prefix: string) => {
    setDraft(prefix);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const insertSymbol = (sym: string) => {
    setDraft((prev) => prev + sym);
    if (inputRef.current) inputRef.current.focus();
  };

  const filteredMessages = searchQuery.trim()
    ? messages.filter((m) => (m.body || '').toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  return (
    <Layout>
      <div className="min-h-screen bg-academic-grid text-foreground flex flex-col pb-24">
        {/* Contextual Candidate Sub-header Bar (Stitch Screen 11) */}
        <div className="w-full border-b border-border/80 bg-background/60 py-2.5 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-mono text-muted-foreground">
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              <span className="uppercase tracking-wider font-semibold text-foreground">Direct Dispatch</span>
              <span className="text-muted-foreground/40">/</span>
              <span className="text-muted-foreground">JEE Target Line</span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="hidden sm:inline">Encrypted P2P Line</span>
              <span className="hidden sm:inline text-muted-foreground/40">•</span>
              <span className="text-foreground font-semibold">Solo Architect Desk</span>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
          {/* Hero Dossier Intro (Stitch Screen 11) */}
          <div className="max-w-3xl mb-8 pt-2">
            <div className="font-mono text-xs uppercase tracking-widest text-primary font-semibold mb-2">
              Direct Correspondence • Archival 1v1
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight">
              Aspirant Direct <span className="font-serif italic font-normal text-primary">Desk.</span>
            </h1>
            <p className="font-sans text-sm sm:text-base text-muted-foreground mt-3 leading-relaxed max-w-2xl">
              A direct, private line with the site architect. Flag broken mirrors, submit missing chapter notes, challenge key discrepancies, or request specialized academic tooling without ticketing friction.
            </p>
          </div>

          {/* Two-Column Disciplined Layout Frame (Stitch Screen 11) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ───── LEFT COLUMN: SIDEBAR DOSSIER (4 Cols) ───── */}
            <aside className="lg:col-span-4 space-y-5">
              {/* Card 1: Private Channel & Search */}
              <div className="bg-card rounded-2xl border border-border/80 p-5 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-border/80">
                  <div>
                    <span className="font-mono text-[10px] uppercase font-semibold tracking-wider text-primary block mb-0.5">
                      Private Channel
                    </span>
                    <h2 className="font-serif text-base font-bold text-foreground">Aspirant Dispatch</h2>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono text-muted-foreground bg-muted/60 border border-border/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Recess Active
                  </span>
                </div>
                <div className="mt-4 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search past correspondence..."
                    className="w-full text-xs font-sans pl-9 pr-14 py-2.5 bg-background rounded-xl border border-border/80 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all"
                  />
                  {searchQuery ? (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
                      <kbd className="font-mono text-[10px] text-muted-foreground bg-muted border border-border/80 px-1.5 py-0.5 rounded shadow-2xs">⌘K</kbd>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 2: Solo Dev & Aspirant Manifesto */}
              <div className="bg-card rounded-2xl border border-border/80 p-5 sm:p-6 shadow-xs">
                <div className="flex items-center gap-3 mb-3.5">
                  <div className="w-9 h-9 rounded-xl bg-muted border border-border/80 flex items-center justify-center text-foreground font-serif font-bold text-xs">
                    BA
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-foreground leading-tight">
                      Solo Dev & Aspirant
                    </h3>
                    <p className="font-mono text-[11px] text-muted-foreground">
                      Non-corporate • Personal Terminal
                    </p>
                  </div>
                </div>
                <p className="font-sans text-xs text-muted-foreground leading-relaxed">
                  Built independently alongside daily mock routines. Messages land directly in my study terminal and are replied to during recess. Zero automated bot filtering.
                </p>
                <div className="mt-4 pt-3.5 border-t border-border/80 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                  <span>TLS 1.3 Verified</span>
                  <button
                    onClick={() => navigate('/donate')}
                    className="text-foreground hover:text-primary transition-colors flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <span>Archival Sustenance</span>
                    <span className="text-xs">☕</span>
                  </button>
                </div>
              </div>

              {/* Card 3: Dispatch Categories */}
              <div className="bg-card rounded-2xl border border-border/80 p-5 sm:p-6 shadow-xs">
                <div className="font-mono text-[10px] uppercase font-semibold tracking-wider text-muted-foreground mb-3.5">
                  Dispatch Categories
                </div>
                <div className="space-y-1.5">
                  {[
                    { num: "01", label: "Broken Mirror or Link Error", prefix: "[Broken Link]: " },
                    { num: "02", label: "Curated Coaching Material", prefix: "[Material Request]: " },
                    { num: "03", label: "Key Discrepancy & Doubt", prefix: "[Doubt / Key Issue]: " },
                    { num: "04", label: "Tool & Platform Proposal", prefix: "[Platform Suggestion]: " },
                  ].map((cat) => (
                    <button
                      key={cat.num}
                      type="button"
                      onClick={() => handleQuickTopic(cat.prefix)}
                      className="w-full text-left py-2.5 px-3 rounded-xl border border-transparent hover:border-border/80 hover:bg-muted/40 transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs text-muted-foreground font-mono">{cat.num}</span>
                        <span className="font-sans text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                          {cat.label}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-muted-foreground/60 group-hover:text-primary transition-colors">
                        →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* ───── RIGHT COLUMN: 1v1 DIRECT DISPATCH TERMINAL (8 Cols) ───── */}
            <section
              className={cn(
                "lg:col-span-8 bg-card rounded-2xl border border-border/80 shadow-xs flex flex-col h-[740px] overflow-hidden relative transition-all",
                isDragging && "border-primary ring-2 ring-primary/20"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {isDragging && (
                <div className="absolute inset-0 z-50 bg-background/85 backdrop-blur-xs flex flex-col items-center justify-center pointer-events-none border-2 border-dashed border-primary m-3 rounded-xl">
                  <Paperclip className="w-8 h-8 text-primary animate-bounce mb-2" />
                  <p className="text-sm font-serif font-bold text-foreground">Drop image to attach</p>
                  <p className="text-[11px] text-muted-foreground font-mono mt-0.5">Will be uploaded to secure support thread</p>
                </div>
              )}

              {/* Terminal Header (Stitch Screen 11) */}
              <div className="px-6 py-4 border-b border-border/80 bg-background/50 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-muted border border-border/80 flex items-center justify-center text-foreground font-serif font-bold text-sm">
                      BK
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-card"></span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-sm text-foreground">Lead Architect Desk</span>
                      <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-muted text-muted-foreground border border-border/80">
                        SECURE 1V1
                      </span>
                    </div>
                    <div className="font-mono text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <span>Direct Aspirant Terminal</span>
                      <span>•</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">Turnaround 2–4 hrs</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigate('/donate')}
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer"
                  >
                    <span>Chai</span>
                    <span>☕</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => refetch()}
                    className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg border border-border/80 hover:bg-muted transition-colors cursor-pointer"
                    title="Refresh connection"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Confidentiality notice sub-strip */}
              <div className="px-6 py-2.5 bg-muted/30 border-b border-border/80 flex items-center justify-between text-xs font-mono text-muted-foreground">
                <span>Direct peer-to-peer line — Confidential & unmoderated by third parties.</span>
                <span className="hidden sm:inline text-primary text-[11px] font-semibold">Strict Academic Privacy</span>
              </div>

              {/* Thread Messages Feed */}
              <div ref={scrollerRef} className="flex-1 p-6 md:p-8 overflow-y-auto space-y-4 bg-card">
                {loading ? (
                  <div className="h-full flex items-center justify-center p-10 text-xs font-mono text-muted-foreground gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span>Connecting to Direct Terminal Line…</span>
                  </div>
                ) : error ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3 p-8 text-center max-w-md mx-auto">
                    <div className="bg-destructive/10 text-destructive border border-destructive/30 p-4 rounded-xl text-xs font-mono">
                      {error}
                    </div>
                    <button
                      onClick={() => refetch()}
                      className="px-4 py-2 bg-foreground text-background rounded-xl text-xs font-semibold font-mono"
                    >
                      Retry Connection
                    </button>
                  </div>
                ) : filteredMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-foreground tracking-tight">
                        Direct 1v1 Archival Desk
                      </h3>
                      <p className="font-sans text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                        Engineered by an aspirant for serious candidates. Dispatch broken mirrors, submit verified high-yield notes, or request analytical tooling directly.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-lg pt-2">
                      <button
                        type="button"
                        onClick={() => handleQuickTopic('PW Varun Advanced Test #04 mirror reports 404 error')}
                        className="w-full sm:w-1/2 p-3.5 rounded-xl border border-border/80 bg-background hover:border-primary text-left transition-all group cursor-pointer shadow-xs"
                      >
                        <div className="font-mono text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          Broken Mirror Prompt
                        </div>
                        <p className="font-sans text-xs text-foreground group-hover:text-primary leading-snug">
                          "PW Varun Advanced Test #04 mirror reports 404 error"
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickTopic('Deconstructed 2024 JEE Adv rotational notes request')}
                        className="w-full sm:w-1/2 p-3.5 rounded-xl border border-border/80 bg-background hover:border-primary text-left transition-all group cursor-pointer shadow-xs"
                      >
                        <div className="font-mono text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          Archival Request
                        </div>
                        <p className="font-sans text-xs text-foreground group-hover:text-primary leading-snug">
                          "Deconstructed 2024 JEE Adv rotational notes"
                        </p>
                      </button>
                    </div>

                    <div className="pt-2 font-mono text-[11px] text-muted-foreground flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>Awaiting candidate dispatch • Queue index: <span className="font-semibold text-foreground">#01 (Immediate)</span></span>
                    </div>
                  </div>
                ) : (
                  filteredMessages.map((m, idx) => {
                    const prev = filteredMessages[idx - 1];
                    const showDate = !prev || !isSameDay(new Date(prev.created_at), new Date(m.created_at));
                    const isMine = m.author_role === 'user';
                    
                    return (
                      <div key={m.id} className="space-y-2">
                        {showDate && (
                          <div className="text-center my-3">
                            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider bg-muted/60 border border-border/80 rounded px-2.5 py-0.5 text-muted-foreground">
                              {format(new Date(m.created_at), 'MMM d, yyyy')}
                            </span>
                          </div>
                        )}
                        
                        <div className={cn("flex items-end gap-2 max-w-[85%] sm:max-w-[75%]", isMine ? "ml-auto justify-end" : "justify-start")}>
                          {!isMine && (
                            <div className="w-6 h-6 rounded-lg border border-border/80 bg-muted text-primary flex items-center justify-center text-[9px] font-mono font-bold shrink-0 mb-1">
                              DEV
                            </div>
                          )}
                          
                          <div className="space-y-1">
                            <div className={cn(
                              "p-3 rounded-2xl text-xs sm:text-sm leading-relaxed border shadow-xs",
                              isMine
                                ? "bg-primary text-primary-foreground border-primary rounded-br-none"
                                : "bg-card border-border/80 text-foreground rounded-bl-none"
                            )}>
                              {m.image_url && (
                                <a
                                  href={m.image_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="block mb-2 rounded-xl overflow-hidden border border-border/80 bg-muted max-w-sm group"
                                >
                                  <img src={m.image_url} alt="Attachment" className="max-h-52 w-auto object-cover group-hover:opacity-90" />
                                </a>
                              )}
                              <p className="whitespace-pre-wrap break-words font-sans">{m.body}</p>
                            </div>
                            <div className={cn("flex items-center gap-1 text-[10px] font-mono text-muted-foreground px-1", isMine ? "justify-end" : "justify-start")}>
                              <span>{format(new Date(m.created_at), 'h:mm a')}</span>
                              {isMine && <CheckCheck className="w-3 h-3 text-primary" />}
                            </div>
                          </div>

                          {isMine && (
                            <div className="w-6 h-6 rounded-lg border border-border/80 bg-muted/60 text-foreground flex items-center justify-center text-[9px] font-mono font-bold shrink-0 mb-1">
                              YOU
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Enhanced Rich Input Bar (Stitch Screen 11) */}
              <footer className="p-4 sm:p-5 border-t border-border/80 bg-background/50 shrink-0">
                {/* Math Symbol Helper Ribbon */}
                {showSymbolBar && (
                  <div className="flex items-center gap-1 pb-2 overflow-x-auto scrollbar-none animate-in fade-in duration-100">
                    <span className="text-[10px] font-mono font-semibold text-muted-foreground uppercase pr-1">Symbols:</span>
                    {MATH_SYMBOLS.map((sym) => (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => insertSymbol(sym)}
                        className="px-1.5 py-0.5 rounded bg-muted hover:bg-card text-xs font-mono font-bold border border-border/80 text-foreground transition-colors cursor-pointer"
                      >
                        {sym}
                      </button>
                    ))}
                  </div>
                )}

                {/* Preview Thumbnail */}
                {preview && (
                  <div className="relative inline-block mb-2 rounded-xl overflow-hidden border border-border/80 bg-muted p-1">
                    <img src={preview} className="h-14 w-auto rounded-lg" alt="Upload Preview" />
                    <button
                      type="button"
                      onClick={() => setImage(null)}
                      className="absolute top-1 right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}

                <div className="rounded-xl border border-border/80 bg-card shadow-xs focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                  <textarea
                    ref={inputRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onPaste={handlePaste}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        submit();
                      }
                    }}
                    maxLength={4000}
                    disabled={!canSend}
                    placeholder={canSend ? "Draft your dispatch directly to the site architect (doubts, broken mirrors, PYQ requests)..." : "Conversation closed"}
                    className="w-full border-0 focus:ring-0 text-xs sm:text-sm font-sans placeholder:text-muted-foreground text-foreground p-3.5 resize-none bg-transparent focus:outline-none"
                    rows={2}
                  />

                  <div className="px-3.5 py-2 border-t border-border/60 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        disabled={!canSend}
                        className="p-1.5 rounded-lg hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
                        title="Attach question screenshot or notes"
                      >
                        <Paperclip className="w-4 h-4" />
                      </button>
                      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => setImage(e.target.files?.[0] ?? null)} />

                      <button
                        type="button"
                        onClick={() => handleQuickTopic('Formula query: ')}
                        className="p-1.5 rounded-lg hover:text-foreground hover:bg-muted/60 transition-colors font-serif font-semibold text-xs cursor-pointer"
                        title="Formula notation"
                      >
                        fx
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowSymbolBar(!showSymbolBar)}
                        className={cn(
                          "p-1.5 rounded-lg transition-colors font-mono text-xs cursor-pointer",
                          showSymbolBar ? "bg-primary text-primary-foreground" : "hover:text-foreground hover:bg-muted/60"
                        )}
                        title="Toggle symbols"
                      >
                        Ω
                      </button>

                      <span className="text-muted-foreground/30 mx-1">|</span>
                      <span className="text-[11px] font-mono text-muted-foreground hidden sm:inline">
                        Markdown & Math supported
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => submit()}
                      disabled={!canSend || busy || (!draft.trim() && !image)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold tracking-wide transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                      {busy ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          <span>Send Dispatch</span>
                          <Send className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-2.5 px-1 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                  <span>Encrypted TLS 1.3 • Direct Terminal Dispatch</span>
                  <span className="hidden sm:inline">Non-commercial • Pure academic utility</span>
                </div>
              </footer>
            </section>
          </div>
        </main>
      </div>
    </Layout>
  );
}
