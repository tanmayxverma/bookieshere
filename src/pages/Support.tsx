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
  const inputRef = useRef<HTMLInputElement>(null);
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
      <div className="min-h-screen bg-background text-foreground flex flex-col pb-24">
        {/* Status Banner Ticker */}
        <aside className="bg-muted text-foreground border-b-2 border-border py-1.5 px-4 sm:px-8 shrink-0">
          <div className="max-w-7xl mx-auto flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="font-bold tracking-wider uppercase">DIRECT CREATOR DESK</span>
              <span className="text-muted-foreground hidden sm:inline">• Direct 1v1 dispatch with site maintainer</span>
            </div>
            <div className="hidden md:flex items-center gap-4 text-muted-foreground text-[10px] font-mono tracking-wider">
              <span>ZERO BOTS</span>
              <span>·</span>
              <span>100% PRIVATE</span>
              <span>·</span>
              <span className="text-foreground font-bold">REPLIES IN FREE TIME</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 flex-1 items-stretch bg-card border-2 border-border rounded-2xl shadow-[6px_6px_0px_var(--desk-border)] overflow-hidden min-h-[640px]">
            {/* ───── LEFT SIDEBAR: INBOX & DIRECT LINE INFO ───── */}
            <aside className="lg:col-span-4 border-b lg:border-b-0 lg:border-r-2 border-border flex flex-col bg-muted/30">
              {/* Header: SLA Status & Direct Line Tag */}
              <div className="p-4 border-b border-border bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground font-mono">
                      DIRECT INBOX
                    </span>
                    <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded border border-primary/30 font-mono">
                      1v1
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border font-bold flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-primary" />
                    Replies in Free Time
                  </span>
                </div>

                {/* Search Bar */}
                <div className="relative flex items-center bg-background rounded-lg px-3 py-1.5 border-2 border-border focus-within:border-primary transition-all">
                  <Search className="w-3.5 h-3.5 text-muted-foreground mr-2 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search thread messages..."
                    className="bg-transparent border-none text-xs text-foreground placeholder:text-muted-foreground focus:outline-none w-full p-0 font-sans"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="text-muted-foreground hover:text-foreground text-xs">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Sidebar Cards Area */}
              <div className="p-3.5 flex-1 overflow-y-auto space-y-3">
                {/* Card 1: Solo Dev & Fellow Aspirant */}
                <div className="p-3.5 bg-card border-2 border-border rounded-xl shadow-[2px_2px_0px_var(--desk-border)] space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg border border-border bg-muted text-primary flex items-center justify-center font-bold text-xs shrink-0">
                      <Terminal className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-foreground truncate font-display">
                        Solo Dev & Fellow Aspirant
                      </h4>
                      <p className="text-[10px] text-muted-foreground font-mono truncate">
                        Aspirant-built platform
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                    I build and run BOOKIE alone alongside studies. I read every message and reply during study breaks. Feel free to leave doubts or notes requests!
                  </p>
                </div>

                {/* Card 2: Buy Me a Chai */}
                <div className="p-3.5 bg-muted/50 border-2 border-border rounded-xl shadow-[2px_2px_0px_var(--desk-border)] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Coffee className="w-3.5 h-3.5 text-primary" />
                      <h4 className="text-xs font-bold text-foreground font-display">
                        Server Support Fund
                      </h4>
                    </div>
                    <span className="text-[9px] font-mono font-bold tracking-wider uppercase px-1.5 py-0.2 rounded border border-border bg-card text-muted-foreground">
                      UPI
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                    BOOKIE is 100% free with zero ads. Buying a chai helps offset server hosting and API costs.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/donate')}
                    className="w-full py-2 px-3 bg-primary text-primary-foreground font-sans font-bold text-xs rounded-lg border-2 border-border shadow-[2px_2px_0px_var(--desk-border)] flex items-center justify-center gap-1.5 hover:bg-primary/90 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                  >
                    <Coffee className="w-3.5 h-3.5" />
                    <span>Support with a Chai</span>
                  </button>
                </div>

                {/* Card 3: Quick Topic Starters */}
                <div className="p-3.5 bg-card border-2 border-border rounded-xl shadow-[2px_2px_0px_var(--desk-border)] space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                    QUICK TOPIC STARTERS
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleQuickTopic('[Broken Link]: ')}
                      className="text-xs font-sans p-2 rounded-lg bg-muted/50 hover:bg-muted text-foreground border border-border transition-all text-left flex items-center gap-1.5"
                    >
                      <Bug className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">Broken Link</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickTopic('[Book Request]: ')}
                      className="text-xs font-sans p-2 rounded-lg bg-muted/50 hover:bg-muted text-foreground border border-border transition-all text-left flex items-center gap-1.5"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">Book Request</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickTopic('[Study Doubt]: ')}
                      className="text-xs font-sans p-2 rounded-lg bg-muted/50 hover:bg-muted text-foreground border border-border transition-all text-left flex items-center gap-1.5"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">Study Doubt</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickTopic('[Suggest Idea]: ')}
                      className="text-xs font-sans p-2 rounded-lg bg-muted/50 hover:bg-muted text-foreground border border-border transition-all text-left flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">Suggest Idea</span>
                    </button>
                  </div>
                </div>
              </div>
            </aside>

            {/* ───── RIGHT MAIN CHAT CONVERSATION CANVAS ───── */}
            <section
              className={cn("lg:col-span-8 flex flex-col h-full bg-card relative transition-all", isDragging && "border-2 border-dashed border-primary")}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {isDragging && (
                <div className="absolute inset-0 z-50 bg-background/80 flex flex-col items-center justify-center pointer-events-none border-2 border-dashed border-primary m-3 rounded-xl">
                  <div className="p-4 bg-card text-foreground rounded-xl flex items-center gap-3 shadow-xl border-2 border-border">
                    <Paperclip className="w-6 h-6 text-primary animate-bounce" />
                    <div>
                      <p className="text-sm font-bold font-display">Drop image to attach</p>
                      <p className="text-[11px] text-muted-foreground font-mono">Will be sent directly to maintainer</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Chat Canvas Header */}
              <div className="bg-card text-foreground px-5 py-3 flex items-center justify-between border-b-2 border-border shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg border-2 border-border bg-muted flex items-center justify-center font-bold text-primary shadow-[1px_1px_0px_var(--desk-border)]">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm tracking-tight text-foreground font-display">
                        Site Maintainer Desk
                      </h3>
                      <span className="bg-muted text-foreground font-mono font-bold text-[9px] px-1.5 py-0.2 rounded border border-border uppercase tracking-wide flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 text-primary" />
                        <span>BREAK REPLIES</span>
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      Direct 1v1 Thread • Honest Human Response
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigate('/donate')}
                    className="border-2 border-border bg-card hover:bg-muted text-foreground font-sans font-bold text-xs px-3 py-1.5 rounded-lg shadow-[2px_2px_0px_var(--desk-border)] flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Coffee className="w-3.5 h-3.5 text-primary" />
                    <span className="hidden sm:inline">Chai Break</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => refetch()}
                    className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg border border-border hover:bg-muted transition-colors"
                    title="Refresh chat"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Messages Thread Feed */}
              <div ref={scrollerRef} className="flex-1 p-5 overflow-y-auto space-y-4 bg-background">
                {loading ? (
                  <div className="h-full flex items-center justify-center p-10 text-xs font-mono text-muted-foreground gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span>Connecting to Direct Line…</span>
                  </div>
                ) : error ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3 p-8 text-center max-w-md mx-auto">
                    <div className="bg-destructive/10 text-destructive border border-destructive/40 p-4 rounded-xl text-xs font-mono">
                      {error}
                    </div>
                    <button
                      onClick={() => refetch()}
                      className="px-4 py-2 bg-foreground text-background rounded-lg text-xs font-bold font-mono"
                    >
                      Retry Connection
                    </button>
                  </div>
                ) : filteredMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto space-y-3">
                    <div className="w-11 h-11 rounded-xl bg-muted text-primary flex items-center justify-center border-2 border-border shadow-[2px_2px_0px_var(--desk-border)]">
                      <ShieldCheck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground uppercase font-display tracking-wider">
                        DIRECT 1v1 MAINTAINER DESK
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed font-sans">
                        Run by an aspirant for aspirants. Drop your doubt, bug report, or book request directly. No formal preamble required.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => handleQuickTopic('Check broken test link: ')}
                        className="text-xs font-mono px-3 py-1 bg-card border-2 border-border rounded-lg hover:border-primary text-foreground shadow-[2px_2px_0px_var(--desk-border)] transition-colors"
                      >
                        [Check broken link]
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickTopic('Request Coaching Notes: ')}
                        className="text-xs font-mono px-3 py-1 bg-card border-2 border-border rounded-lg hover:border-primary text-foreground shadow-[2px_2px_0px_var(--desk-border)] transition-colors"
                      >
                        [Request Notes]
                      </button>
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
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-card border border-border rounded px-2.5 py-0.5 text-muted-foreground">
                              {format(new Date(m.created_at), 'MMM d, yyyy')}
                            </span>
                          </div>
                        )}
                        
                        <div className={cn("flex items-end gap-2 max-w-[85%] sm:max-w-[75%]", isMine ? "ml-auto justify-end" : "justify-start")}>
                          {!isMine && (
                            <div className="w-6 h-6 rounded border border-border bg-muted text-primary flex items-center justify-center text-[9px] font-mono font-bold shrink-0 mb-1">
                              DEV
                            </div>
                          )}
                          
                          <div className="space-y-1">
                            <div className={cn(
                              "p-3 rounded-xl text-xs sm:text-sm leading-relaxed border-2 shadow-[2px_2px_0px_var(--desk-border)]",
                              isMine
                                ? "bg-primary text-primary-foreground border-border rounded-br-none"
                                : "bg-card border-border text-foreground rounded-bl-none"
                            )}>
                              {m.image_url && (
                                <a
                                  href={m.image_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="block mb-2 rounded-lg overflow-hidden border border-border bg-muted max-w-sm group"
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
                            <div className="w-6 h-6 rounded border border-border bg-card text-foreground flex items-center justify-center text-[9px] font-mono font-bold shrink-0 mb-1">
                              YOU
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Enhanced Rich Input Bar */}
              <footer className="bg-card border-t-2 border-border p-3 sm:p-4 shrink-0">
                {/* Math Symbol Helper Ribbon */}
                {showSymbolBar && (
                  <div className="flex items-center gap-1 pb-2 overflow-x-auto scrollbar-none animate-in fade-in duration-100">
                    <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase pr-1">Symbols:</span>
                    {MATH_SYMBOLS.map((sym) => (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => insertSymbol(sym)}
                        className="px-1.5 py-0.5 rounded bg-muted hover:bg-card text-xs font-mono font-bold border border-border text-foreground transition-colors"
                      >
                        {sym}
                      </button>
                    ))}
                  </div>
                )}

                {/* Preview Thumbnail */}
                {preview && (
                  <div className="relative inline-block mb-2 rounded-lg overflow-hidden border-2 border-border bg-muted p-1">
                    <img src={preview} className="h-14 w-auto rounded" alt="Upload Preview" />
                    <button
                      type="button"
                      onClick={() => setImage(null)}
                      className="absolute top-1 right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:opacity-90 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}

                <form onSubmit={submit} onPaste={handlePaste} className="flex items-center gap-2 bg-background rounded-xl px-3 py-1.5 border-2 border-border focus-within:border-primary transition-all">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={!canSend}
                      className="p-1 hover:text-foreground rounded transition-colors"
                      title="Attach question screenshot"
                    >
                      <Paperclip className="w-4 h-4 transform -rotate-45" />
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => setImage(e.target.files?.[0] ?? null)} />

                    <button
                      type="button"
                      onClick={() => handleQuickTopic('Formula query: ')}
                      className="p-1 hover:text-foreground rounded transition-colors font-mono text-xs font-bold"
                      title="Insert Formula Note"
                    >
                      fx
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowSymbolBar(!showSymbolBar)}
                      className={cn(
                        "p-1 rounded transition-colors text-xs font-mono font-bold",
                        showSymbolBar ? "bg-primary text-primary-foreground" : "hover:text-foreground"
                      )}
                      title="Toggle Math Symbols"
                    >
                      Ω
                    </button>
                  </div>

                  <input
                    ref={inputRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onPaste={handlePaste}
                    maxLength={4000}
                    disabled={!canSend}
                    placeholder={canSend ? "Message maintainer directly (doubts, broken links, book requests)..." : "Conversation closed"}
                    className="flex-1 bg-transparent border-none text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 px-2 py-1 font-sans"
                  />

                  <button
                    type="submit"
                    disabled={!canSend || busy || (!draft.trim() && !image)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 px-3.5 py-1.5 rounded-lg border-2 border-border shadow-[2px_2px_0px_var(--desk-border)] flex items-center gap-1 text-xs font-bold cursor-pointer shrink-0 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                  >
                    {busy ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <span>Send</span>
                        <Send className="w-3 h-3 ml-0.5" />
                      </>
                    )}
                  </button>
                </form>

                <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono mt-2 px-1">
                  <span>Enter to send • Shift + Enter for new line</span>
                  <span className="hidden sm:inline">Solo Aspirant Maintained • Direct Thread</span>
                </div>
              </footer>
            </section>
          </div>
        </main>
      </div>
    </Layout>
  );
}
