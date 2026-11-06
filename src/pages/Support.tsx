import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useSupportChat, type SupportMessage } from '@/hooks/useSupportChat';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Send, Paperclip, ShieldCheck, X, Loader2, Search,
  CheckCheck, RefreshCw, Bug, BookOpen, HelpCircle,
  Sparkles, ExternalLink, ChevronUp, Coffee
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
      <div className="min-h-screen bg-background blueprint-grid text-on-surface flex flex-col">
        

        {/* Main Content Area */}
        <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-4 lg:p-5 flex flex-col">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 flex-1 items-stretch bg-surface-container-lowest border-2 border-slate-900 rounded-3xl shadow-[4px_4px_0px_0px_rgba(15,23,42,0.95)] overflow-hidden min-h-[560px] lg:h-[calc(100dvh-10.5rem)] lg:max-h-[840px]">
            
            {/* ───── LEFT SIDEBAR: INBOX & DIRECT LINE INFO ───── */}
            <aside className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/70 dark:bg-slate-900/50">
              
              {/* Header: SLA Status & Direct Line Tag */}
              <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white font-display">
                      DIRECT INBOX
                    </span>
                    <span className="bg-blue-100 dark:bg-blue-950 text-brand-blue text-[11px] font-bold px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-900 font-mono">
                      1v1
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Replies in Free Time
                  </span>
                </div>

                {/* Search Bar */}
                <div className="relative flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700 focus-within:border-brand-blue focus-within:bg-white dark:focus-within:bg-slate-900 transition-all">
                  <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search messages or doubts..."
                    className="bg-transparent border-none text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none w-full p-0"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600 text-xs">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Sidebar Cards Area */}
              <div className="p-3 flex-1 overflow-y-auto space-y-2.5">
                {/* Card 1: Solo Dev & Fellow Aspirant */}
                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-brand-blue text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                      B
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white truncate font-display">
                        Solo Dev &amp; Fellow Aspirant
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-medium truncate">
                        Not a 24/7 corporate team
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    Hey! I build and run BOOKIE alone alongside my own studies. I'm not always online, but I read every single message and reply during study breaks and free time. Drop your message below!
                  </p>
                </div>

                {/* Card 2: Buy Me a Chai (Encouraging banner) */}
                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base leading-none">☕</span>
                      <h4 className="text-xs font-black text-slate-900 dark:text-amber-100 font-display">
                        Buy Me a Chai
                      </h4>
                    </div>
                    <span className="text-[9px] font-mono font-black tracking-wider uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      SUPPORT
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    BOOKIE is 100% free with zero ads. If the notes, mock tools, or YPT timer help your prep, buying a cup of chai keeps the servers alive and fuels late-night coding!
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/donate')}
                    className="w-full py-2 px-3 bg-brand-blue hover:bg-blue-600 active:scale-[0.99] text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer font-display"
                  >
                    <span>☕ Buy Me a Chai</span>
                  </button>
                </div>

                {/* Card 3: Quick Topic Starters */}
                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      QUICK TOPIC STARTERS
                    </span>
                    <span className="text-slate-400 text-[10px]">▲</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickTopic('[Broken Link]: ')}
                      className="text-xs font-medium p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-brand-blue dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 transition-all text-left flex items-center gap-1.5"
                    >
                      <span className="truncate">Broken Link</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickTopic('[Book Request]: ')}
                      className="text-xs font-medium p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-brand-blue dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 transition-all text-left flex items-center gap-1.5"
                    >
                      <span className="truncate">Book Request</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickTopic('[Study Doubt]: ')}
                      className="text-xs font-medium p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-brand-blue dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 transition-all text-left flex items-center gap-1.5"
                    >
                      <span className="truncate">Study Doubt</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickTopic('[Suggest Idea]: ')}
                      className="text-xs font-medium p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-brand-blue dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 transition-all text-left flex items-center gap-1.5"
                    >
                      <span className="truncate">Suggest Idea</span>
                    </button>
                  </div>
                </div>
              </div>
            </aside>

            {/* ───── RIGHT MAIN CHAT CONVERSATION CANVAS ───── */}
            <section
              className={cn("lg:col-span-8 flex flex-col h-full bg-white dark:bg-slate-950 relative transition-all", isDragging && "ring-2 ring-brand-blue ring-inset")}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {isDragging && (
                <div className="absolute inset-0 z-50 bg-blue-900/40 backdrop-blur-xs flex flex-col items-center justify-center pointer-events-none border-2 border-dashed border-white m-3 rounded-2xl">
                  <div className="p-4 bg-slate-900/90 text-white rounded-2xl flex items-center gap-3 shadow-2xl border border-blue-500/40">
                    <Paperclip className="w-6 h-6 text-brand-blue animate-bounce" />
                    <div>
                      <p className="text-sm font-bold font-display">Drop image here to attach</p>
                      <p className="text-[11px] text-slate-300 font-mono">Will be sent directly to site owner</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Chat Canvas Header */}
              <div className="bg-white dark:bg-slate-900 px-4 py-2.5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-brand-blue flex items-center justify-center font-bold text-white">
                      B
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white font-display">
                        Site Owner (Solo Creator)
                      </h3>
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-[9px] px-2 py-0.5 rounded font-mono uppercase tracking-wide flex items-center gap-1">
                        <span>REPLIES IN FREE TIME</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Direct 1v1 Aspirant Inbox • Real Human Reply
                    </p>
                  </div>
                </div>

                {/* Right actions: Buy Me a Chai + Refresh */}
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => refetch()}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Refresh chat"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sub-header Ribbon */}
              <div className="bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 px-4 py-1.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                  <span>Direct 1v1 thread with Site Owner — No middleman, no bots.</span>
                </div>
                <span className="text-slate-500 dark:text-slate-400 font-mono text-xs font-medium">
                  Replies during study breaks
                </span>
              </div>

              {/* Messages Thread Feed */}
              <div ref={scrollerRef} className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50 dark:bg-slate-950/50">
                {loading ? (
                  <div className="h-full flex items-center justify-center p-10 text-sm font-mono text-slate-500 gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-brand-blue" />
                    <span>Connecting to Direct Line…</span>
                  </div>
                ) : error ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3 p-8 text-center max-w-md mx-auto">
                    <div className="bg-rose-50 text-rose-700 border border-rose-200 p-4 rounded-2xl text-xs font-mono">
                      {error}
                    </div>
                    <button
                      onClick={() => refetch()}
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold font-mono"
                    >
                      Retry Connection
                    </button>
                  </div>
                ) : filteredMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-md mx-auto space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 text-brand-blue flex items-center justify-center shadow-xs border border-blue-200 dark:border-blue-900 dark:bg-blue-950/80">
                      <ShieldCheck className="w-6 h-6 text-brand-blue" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase font-display tracking-wider">
                        DIRECT 1v1 WITH SITE OWNER
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        Solo project run by an aspirant for aspirants. Drop your doubt, bug report, or book request directly. No formal "hi/hello" needed.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => handleQuickTopic('Check broken test link: ')}
                        className="text-xs font-mono px-3.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full hover:border-brand-blue text-slate-700 dark:text-slate-300 shadow-xs transition-colors"
                      >
                        "Check broken test link"
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickTopic('Request Coaching Notes: ')}
                        className="text-xs font-mono px-3.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full hover:border-brand-blue text-slate-700 dark:text-slate-300 shadow-xs transition-colors"
                      >
                        "Request Coaching Notes"
                      </button>
                    </div>
                    <div className="pt-4 mt-1 border-t border-slate-100 dark:border-slate-800 w-full">
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Bookie is free, with no ads. If it helps your prep, you can{" "}
                        <button
                          type="button"
                          onClick={() => navigate('/donate')}
                          className="text-brand-blue font-semibold hover:underline underline-offset-2"
                        >
                          support it with a chai
                        </button>
                        .
                      </p>
                    </div>
                  </div>
                ) : (
                  filteredMessages.map((m, idx) => {
                    const prev = filteredMessages[idx - 1];
                    const showDate = !prev || !isSameDay(new Date(prev.created_at), new Date(m.created_at));
                    const isMine = m.author_role === 'user';
                    
                    return (
                      <div key={m.id} className="space-y-3">
                        {showDate && (
                          <div className="text-center my-4">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-3 py-1 text-slate-500 shadow-xs">
                              {format(new Date(m.created_at), 'MMM d, yyyy')}
                            </span>
                          </div>
                        )}
                        
                        <div className={cn("flex items-end gap-2.5 max-w-[85%] sm:max-w-[78%]", isMine ? "ml-auto justify-end" : "justify-start")}>
                          {!isMine && (
                            <div className="w-7 h-7 rounded-lg bg-brand-blue text-white flex items-center justify-center text-[10px] font-black shrink-0 mb-1 font-mono shadow-xs">
                              DEV
                            </div>
                          )}
                          
                          <div className="space-y-1">
                            <div className={cn(
                              "p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm",
                              isMine
                                ? "bg-brand-blue text-white rounded-br-sm shadow-blue-500/10"
                                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm"
                            )}>
                              {m.image_url && (
                                <a
                                  href={m.image_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="block mb-2 rounded-xl overflow-hidden border border-white/20 bg-slate-950/20 max-w-sm group"
                                >
                                  <img src={m.image_url} alt="Attachment" className="max-h-56 w-auto object-cover group-hover:opacity-90" />
                                </a>
                              )}
                              <p className="whitespace-pre-wrap break-words font-medium">{m.body}</p>
                            </div>
                            <div className={cn("flex items-center gap-1 text-[10px] font-mono text-slate-400 px-1", isMine ? "justify-end" : "justify-start")}>
                              <span>{format(new Date(m.created_at), 'h:mm a')}</span>
                              {isMine && <CheckCheck className="w-3 h-3 text-brand-blue" />}
                            </div>
                          </div>

                          {isMine && (
                            <div className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center text-[10px] font-black shrink-0 mb-1 font-mono shadow-xs">
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
              <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-3 shrink-0">
                
                {/* Math Symbol Helper Ribbon */}
                {showSymbolBar && (
                  <div className="flex items-center gap-1.5 pb-2.5 overflow-x-auto scrollbar-none animate-in fade-in duration-150">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase pr-1">JEE Symbols:</span>
                    {MATH_SYMBOLS.map((sym) => (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => insertSymbol(sym)}
                        className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 hover:text-brand-blue text-xs font-mono font-bold border border-slate-200 dark:border-slate-700 transition-colors"
                      >
                        {sym}
                      </button>
                    ))}
                  </div>
                )}

                {/* Preview Thumbnail if image chosen */}
                {preview && (
                  <div className="relative inline-block mb-2 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-100 p-1">
                    <img src={preview} className="h-16 w-auto rounded-lg" alt="Upload Preview" />
                    <button
                      type="button"
                      onClick={() => setImage(null)}
                      className="absolute top-1 right-1 h-5 w-5 rounded-full bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}

                <form onSubmit={submit} onPaste={handlePaste} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-2xl px-3 py-2 border border-slate-200 dark:border-slate-700 focus-within:border-brand-blue focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-brand-blue/20 transition-all">
                  <div className="flex items-center gap-1 text-slate-500">
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={!canSend}
                      className="p-1.5 hover:text-brand-blue hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      title="Attach question screenshot (or drag & drop / Ctrl+V)"
                    >
                      <Paperclip className="w-4 h-4 transform -rotate-45" />
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => setImage(e.target.files?.[0] ?? null)} />

                    <button
                      type="button"
                      onClick={() => handleQuickTopic('Formula verification: ')}
                      className="p-1.5 hover:text-brand-blue hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors font-mono text-xs font-bold"
                      title="Insert Formula Note"
                    >
                      fx
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowSymbolBar(!showSymbolBar)}
                      className={cn(
                        "p-1.5 rounded-lg transition-colors text-xs font-mono font-bold",
                        showSymbolBar ? "bg-blue-100 text-brand-blue" : "hover:text-brand-blue hover:bg-slate-200 dark:hover:bg-slate-700"
                      )}
                      title="Toggle Math / Physics Symbols (θ, π, μ, λ)"
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
                    placeholder={canSend ? "Message the site owner directly (doubts, broken links, book requests)..." : "This conversation is closed"}
                    className="flex-1 bg-transparent border-none text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-0 px-2 py-1"
                  />

                  <button
                    type="submit"
                    disabled={!canSend || busy || (!draft.trim() && !image)}
                    className="bg-brand-blue hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 text-xs font-bold cursor-pointer shrink-0"
                  >
                    {busy ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Send</span>
                        <Send className="w-3.5 h-3.5 ml-0.5" />
                      </>
                    )}
                  </button>
                </form>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-2 px-1">
                  <span>Press Enter ↵ to send • Shift + Enter for new line</span>
                  <span className="hidden sm:inline">100% Solo Aspirant Built &amp; Maintained • Zero Bots</span>
                </div>
              </footer>
            </section>

          </div>
        </main>
      </div>
    </Layout>
  );
}
