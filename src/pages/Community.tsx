import React, { useState, useMemo, useRef, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  useCommunity,
  useComments,
  type ReactionKey,
  type CommunityPost,
} from "@/hooks/useCommunity";
import { useProfile } from "@/hooks/useProfile";
import { moderate } from "@/lib/moderation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  BadgeCheck,
  MessageCircle,
  Plus,
  Send,
  X,
  Image as ImageIcon,
  Loader2,
  Trash2,
  Search,
  Bookmark,
  BookmarkCheck,
  Share2,
  Flame,
  Clock,
  TrendingUp,
  ExternalLink,
  Maximize2,
  Users,
  ShieldCheck,
  Lightbulb,
  Smile,
  BookOpen,
  Award,
  Compass,
  Heart,
  Rocket,
  Zap,
  ThumbsUp,
  Tag,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { cn, safeRandomUUID } from "@/lib/utils";
import { UpgradeModal } from "@/components/Auth/UpgradeModal";
import { GuestUpgradeBanner } from "@/components/Auth/GuestUpgradeBanner";

const REACTION_ORDER: ReactionKey[] = ["heart", "fire", "rocket", "hundred", "celeb", "laugh", "like"];

const REACTION_ICONS: Record<ReactionKey, { icon: React.ElementType; label: string }> = {
  heart: { icon: Heart, label: "Helpful" },
  fire: { icon: Flame, label: "Fire" },
  rocket: { icon: Rocket, label: "Boost" },
  hundred: { icon: Zap, label: "Solid" },
  celeb: { icon: Award, label: "Congrats" },
  laugh: { icon: Smile, label: "Meme" },
  like: { icon: ThumbsUp, label: "Agree" },
};

const MATH_SYMBOLS = ["θ", "π", "μ", "λ", "α", "β", "Δ", "∫", "Σ", "→", "∞", "≈", "√", "±"];

export type CommunityCategory =
  | "all"
  | "discussion"
  | "strategy"
  | "memes"
  | "grind"
  | "mocks"
  | "resources"
  | "colleges"
  | "physics"
  | "math"
  | "chemistry";

export interface CategoryDef {
  id: CommunityCategory;
  label: string;
  code: string;
  tag: string;
  desc: string;
  badge: string;
}

export const CATEGORIES: CategoryDef[] = [
  {
    id: "all",
    label: "All Feeds",
    code: "ALL",
    tag: "",
    desc: "Browse every discussion, strategy, meme, doubt & resource across the community",
    badge: "border-border bg-muted text-foreground",
  },
  {
    id: "discussion",
    label: "General & Rants",
    code: "DISC",
    tag: "[Discussion]",
    desc: "Aspirant daily talk, rants, study confessions, opinions & general conversations",
    badge: "border-border bg-card text-foreground",
  },
  {
    id: "strategy",
    label: "Strategy & Roadmaps",
    code: "STRAT",
    tag: "[Strategy]",
    desc: "Backlogs clearing, revision roadmaps, time management & faculty recommendations",
    badge: "border-primary/40 bg-primary/10 text-primary",
  },
  {
    id: "memes",
    label: "Humor & Relatable",
    code: "MEME",
    tag: "[Meme]",
    desc: "Coaching memes, relatable JEE/NEET humor, jokes & stress relief",
    badge: "border-border bg-muted text-foreground",
  },
  {
    id: "grind",
    label: "Daily Grind & YPT",
    code: "GRIND",
    tag: "[Grind]",
    desc: "Study hour check-ins, study desk setups, streaks & peer accountability",
    badge: "border-primary/40 bg-primary/10 text-primary",
  },
  {
    id: "mocks",
    label: "Mocks & Marks",
    code: "MOCKS",
    tag: "[Mocks]",
    desc: "Mock test score reviews, percentiles, test series analysis & reality checks",
    badge: "border-border bg-card text-foreground",
  },
  {
    id: "resources",
    label: "Books & Notes",
    code: "NOTES",
    tag: "[Resources]",
    desc: "Module comparisons, formula sheets, short notes & recommended books",
    badge: "border-border bg-muted text-foreground",
  },
  {
    id: "colleges",
    label: "College & Cutoffs",
    code: "CAMPUS",
    tag: "[Colleges]",
    desc: "IIT/NIT campus reviews, branch comparisons, counselling queries & cutoffs",
    badge: "border-border bg-card text-foreground",
  },
  {
    id: "physics",
    label: "Physics Doubts",
    code: "PHY",
    tag: "[Physics]",
    desc: "Mechanics, Electrodynamics, Optics, Thermodynamics & concept clarifications",
    badge: "border-primary/30 bg-primary/10 text-primary",
  },
  {
    id: "math",
    label: "Math Doubts",
    code: "MATH",
    tag: "[Math]",
    desc: "Calculus, Algebra, Coordinate Geometry, Vectors & problem solving",
    badge: "border-primary/30 bg-primary/10 text-primary",
  },
  {
    id: "chemistry",
    label: "Chemistry Doubts",
    code: "CHEM",
    tag: "[Chemistry]",
    desc: "Organic mechanisms, Inorganic trends, Physical calculations & shortcuts",
    badge: "border-primary/30 bg-primary/10 text-primary",
  },
];

export function detectCategory(title?: string | null, categoryId?: string | null): CategoryDef {
  if (categoryId) {
    const found = CATEGORIES.find(c => c.id === categoryId);
    if (found) return found;
  }
  const lower = (title ?? "").toString().toLowerCase();
  if (!lower) return CATEGORIES[0];
  if (lower.includes("[meme") || lower.includes("meme") || lower.includes("funny") || lower.includes("humor") || lower.includes("joke")) return CATEGORIES[3];
  if (lower.includes("[strategy]") || lower.includes("strategy") || lower.includes("roadmap") || lower.includes("backlog") || lower.includes("routine") || lower.includes("timetable") || lower.includes("teacher")) return CATEGORIES[2];
  if (lower.includes("[college") || lower.includes("college") || lower.includes("iit bombay") || lower.includes("iit delhi") || lower.includes("nit") || lower.includes("bits") || lower.includes("cutoff") || lower.includes("branch") || lower.includes("campus")) return CATEGORIES[7];
  if (lower.includes("[physics]") || lower.includes("physics") || lower.includes("mechanics") || lower.includes("optics") || lower.includes("electro") || lower.includes("kinematics") || lower.includes("thermodynamics")) return CATEGORIES[8];
  if (lower.includes("[math]") || lower.includes("math") || lower.includes("calculus") || lower.includes("algebra") || lower.includes("integration") || lower.includes("probability") || lower.includes("trigo")) return CATEGORIES[9];
  if (lower.includes("[chem") || lower.includes("organic") || lower.includes("inorganic") || lower.includes("physical chem") || lower.includes("reaction") || lower.includes("periodic")) return CATEGORIES[10];
  if (lower.includes("[mocks]") || lower.includes("mock") || lower.includes("score") || lower.includes("test series") || lower.includes("percentile") || lower.includes("marks")) return CATEGORIES[5];
  if (lower.includes("[grind]") || lower.includes("grind") || lower.includes("study hours") || lower.includes("ypt") || lower.includes("streak") || lower.includes("pomodoro") || lower.includes("focus")) return CATEGORIES[4];
  if (lower.includes("[resources]") || lower.includes("book") || lower.includes("notes") || lower.includes("pdf") || lower.includes("cengage") || lower.includes("formula") || lower.includes("module")) return CATEGORIES[6];
  if (lower.includes("[discussion]") || lower.includes("rant") || lower.includes("opinion") || lower.includes("advice") || lower.includes("feel") || lower.includes("anyone") || lower.includes("thoughts")) return CATEGORIES[1];
  return CATEGORIES[0];
}

export default function Community() {
  const { posts, loading, createPost, toggleReaction, deletePost } = useCommunity();
  const { profile, user, deviceId } = useProfile();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState<CommunityCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"hot" | "new" | "top">("hot");
  const [filterMode, setFilterMode] = useState<"all" | "bookmarks" | "mine">("all");
  const [bookmarks, setBookmarks] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("community_bookmarks") || "[]"));
    } catch {
      return new Set();
    }
  });

  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [preselectedCategory, setPreselectedCategory] = useState<CommunityCategory>("discussion");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const toggleBookmark = (postId: string) => {
    setBookmarks(prev => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
        toast({ description: "Removed from bookmarks" });
      } else {
        next.add(postId);
        toast({ description: "Saved to bookmarks" });
      }
      localStorage.setItem("community_bookmarks", JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const categoryCounts = useMemo(() => {
    const map = new Map<CommunityCategory, number>();
    posts.forEach(p => {
      const cat = detectCategory(p.title || p.subject, p.category_id).id;
      map.set(cat, (map.get(cat) || 0) + 1);
    });
    return map;
  }, [posts]);

  const filteredPosts = useMemo(() => {
    let result = [...posts];

    if (activeCategory !== "all") {
      result = result.filter(p => detectCategory(p.title || p.subject, p.category_id).id === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        (p.title || p.subject || "").toLowerCase().includes(q) ||
        (p.content || p.body || "").toLowerCase().includes(q) ||
        (p.author_name || p.author?.display_name || "").toLowerCase().includes(q)
      );
    }

    if (filterMode === "bookmarks") {
      result = result.filter(p => bookmarks.has(p.id));
    } else if (filterMode === "mine" && profile?.id) {
      result = result.filter(p => p.user_id === profile.id);
    }

    const getEngagementScore = (p: CommunityPost) => {
      const rxCount = Object.values(p.reactions || {}).reduce((acc, curr) => acc + (Array.isArray(curr) ? curr.length : Number(curr) || 0), 0);
      const comments = p.comments_count || p.comment_count || 0;
      return rxCount * 2 + comments * 3;
    };

    if (sortBy === "hot") {
      const dayMs = 48 * 60 * 60 * 1000;
      result.sort((a, b) => {
        const ageA = Math.max(1, (Date.now() - new Date(a.created_at).getTime()) / dayMs);
        const ageB = Math.max(1, (Date.now() - new Date(b.created_at).getTime()) / dayMs);
        const scoreA = (getEngagementScore(a) + 1) / Math.pow(ageA, 1.2);
        const scoreB = (getEngagementScore(b) + 1) / Math.pow(ageB, 1.2);
        return scoreB - scoreA;
      });
    } else if (sortBy === "top") {
      result.sort((a, b) => getEngagementScore(b) - getEngagementScore(a));
    } else {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return result;
  }, [posts, activeCategory, searchQuery, sortBy, filterMode, bookmarks, profile?.id]);

  const openNewPostWithCat = (catId: CommunityCategory) => {
    if (!user || profile?.account_type === "guest") {
      setUpgradeModalOpen(true);
      return;
    }
    setPreselectedCategory(catId === "all" ? "discussion" : catId);
    setIsNewPostOpen(true);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background pb-24 text-foreground">
        {/* Main Content Layout Container */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full pt-6 pb-12">
          
          {/* Hero Dossier Banner (Matching Screen 10) */}
          <section className="mb-6 pb-5 border-b border-border/80" data-purpose="lounge-hero">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="font-mono text-xs uppercase tracking-wider font-semibold text-primary flex items-center gap-2 mb-1.5">
                  <span>Archival Peer Codex // r/Bookieshere</span>
                  <span className="text-muted-foreground/40">•</span>
                  <span className="text-muted-foreground">Zero Fluff // High-Yield Discourse</span>
                </div>
                <h1 className="font-serif text-3xl sm:text-4xl font-normal text-foreground tracking-tight">
                  Aspirant Lounge <span className="font-serif italic text-primary">&amp;</span> Peer Codex
                </h1>
                <p className="font-mono text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                  High-yield problem deconstruction, verified strategy logs, and anti-burnout discourse engineered for serious JEE Advanced &amp; NEET-UG scholars.
                </p>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  onClick={() => setFilterMode(prev => (prev === "bookmarks" ? "all" : "bookmarks"))}
                  variant={filterMode === "bookmarks" ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "gap-1.5 font-mono text-xs h-9 rounded-lg border shadow-xs cursor-pointer",
                    filterMode === "bookmarks" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border/80 hover:bg-muted/50"
                  )}
                >
                  {filterMode === "bookmarks" ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
                  <span>Saved</span>
                  {bookmarks.size > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.2 text-[10px] rounded border border-current font-mono font-semibold">
                      {bookmarks.size}
                    </span>
                  )}
                </Button>

                <Button
                  onClick={() => openNewPostWithCat(activeCategory)}
                  size="sm"
                  className="rounded-lg gap-1.5 px-4 h-9 font-mono text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Initiate Discourse</span>
                </Button>
              </div>
            </div>
          </section>

          {/* Three-Column Architecture Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: Communities, Syllabi & Dossier Channels (3 cols) */}
            <aside aria-label="Sidebar Channels" className="lg:col-span-3 space-y-4 sticky top-20">
              <div className="bg-card rounded-2xl border border-border/80 p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-3">
                  <span className="font-mono text-[11px] uppercase tracking-wider font-semibold text-foreground">
                    Communities &amp; Syllabi
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">{CATEGORIES.length} Topics</span>
                </div>
                <nav aria-label="Discussion Topics" className="space-y-1">
                  {CATEGORIES.map(cat => {
                    const isActive = activeCategory === cat.id;
                    const count = cat.id === "all" ? posts.length : (categoryCounts.get(cat.id) || 0);
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setActiveCategory(cat.id);
                          setFilterMode("all");
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 rounded-xl font-mono text-xs font-medium transition-all text-left border cursor-pointer",
                          isActive
                            ? "bg-primary text-primary-foreground border-primary shadow-xs"
                            : "border-transparent text-foreground hover:bg-muted/50 hover:border-border/60"
                        )}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-[10px] opacity-70">[{cat.code}]</span>
                          <span className="truncate">{cat.label}</span>
                        </div>
                        {count > 0 && (
                          <span className={cn(
                            "text-[10px] px-1.5 py-0.2 rounded border",
                            isActive ? "bg-white/20 text-white border-white/30" : "bg-muted/50 border-border/60 text-muted-foreground"
                          )}>
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Quick Dossier Views Box */}
              <div className="bg-card rounded-2xl border border-border/80 p-4 shadow-xs space-y-2">
                <h4 className="font-mono text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2">
                  Dossier Filters
                </h4>
                <div className="space-y-1">
                  <button
                    onClick={() => setFilterMode("all")}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-xs transition-colors border cursor-pointer",
                      filterMode === "all"
                        ? "bg-muted/60 text-foreground font-semibold border-border/80"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    )}
                  >
                    <Compass className="h-3.5 w-3.5 text-primary" />
                    <span>All Feeds</span>
                  </button>
                  <button
                    onClick={() => setFilterMode("bookmarks")}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-1.5 rounded-lg font-mono text-xs transition-colors border cursor-pointer",
                      filterMode === "bookmarks"
                        ? "bg-muted/60 text-foreground font-semibold border-border/80"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Bookmark className="h-3.5 w-3.5 text-primary" />
                      <span>Saved Bookmarks</span>
                    </div>
                    {bookmarks.size > 0 && (
                      <span className="font-mono text-[10px] px-1.5 py-0.2 rounded border border-border/60">
                        {bookmarks.size}
                      </span>
                    )}
                  </button>
                  {profile && (
                    <button
                      onClick={() => setFilterMode("mine")}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-xs transition-colors border cursor-pointer",
                        filterMode === "mine"
                          ? "bg-muted/60 text-foreground font-semibold border-border/80"
                          : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
                      )}
                    >
                      <Award className="h-3.5 w-3.5 text-primary" />
                      <span>My Discussions</span>
                    </button>
                  )}
                </div>
              </div>
            </aside>

            {/* CENTER COLUMN: Discussion Stream & Post Composer (6 cols) */}
            <main className="lg:col-span-6 space-y-4">
              <GuestUpgradeBanner feature="community" />

              {/* Refined Scholar Composer Box (Screen 10) */}
              <div className="bg-card rounded-2xl border border-border/80 p-3.5 shadow-xs flex items-center gap-3">
                <Avatar className="h-8 w-8 border border-border/70 shrink-0">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-muted text-foreground font-mono font-bold text-xs">
                    {((profile?.display_name || "A")?.[0] || "A").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <input
                  readOnly
                  onClick={() => openNewPostWithCat(activeCategory)}
                  className="flex-grow text-xs font-mono text-foreground placeholder-muted-foreground bg-muted/30 hover:bg-muted/50 border border-border/70 rounded-xl px-3.5 py-2.5 cursor-pointer transition"
                  placeholder="Deconstruct a problem, log a mock score, or share a peer inquiry..."
                  type="text"
                />
                <button
                  onClick={() => openNewPostWithCat(activeCategory)}
                  className="shrink-0 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-mono font-semibold transition flex items-center gap-1 shadow-xs cursor-pointer"
                  type="button"
                >
                  <span>Post</span>
                </button>
              </div>

              {/* Filter & Search Toolbar Strip */}
              <div className="bg-card/80 rounded-xl border border-border/80 px-3 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-xs">
                {/* Feed Order Tabs */}
                <div className="flex items-center space-x-1 w-full sm:w-auto">
                  <button
                    onClick={() => setSortBy("hot")}
                    className={cn(
                      "px-2.5 py-1 rounded-lg font-mono text-[11px] font-medium transition cursor-pointer",
                      sortBy === "hot" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                    type="button"
                  >
                    Curated High-Yield
                  </button>
                  <button
                    onClick={() => setSortBy("new")}
                    className={cn(
                      "px-2.5 py-1 rounded-lg font-mono text-[11px] font-medium transition cursor-pointer",
                      sortBy === "new" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                    type="button"
                  >
                    Chronological
                  </button>
                  <button
                    onClick={() => setSortBy("top")}
                    className={cn(
                      "px-2.5 py-1 rounded-lg font-mono text-[11px] font-medium transition cursor-pointer",
                      sortBy === "top" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                    type="button"
                  >
                    Top Ranked
                  </button>
                </div>
                {/* Quick Search */}
                <div className="relative w-full sm:w-56">
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full text-[11px] font-mono bg-muted/30 border border-border/70 rounded-lg px-2.5 py-1 pl-7 placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
                    placeholder="Search derivations... [Ctrl+K]"
                    type="text"
                  />
                  <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2 top-2" />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1.5 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Feed Content List */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-border/80 space-y-3 shadow-xs">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  <p className="font-mono text-xs text-muted-foreground">Loading peer codex ledger...</p>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-16 px-4 bg-card rounded-2xl border border-border/80 space-y-3 shadow-xs">
                  <MessageCircle className="w-10 h-10 text-muted-foreground/40 mx-auto" />
                  <h3 className="font-serif font-medium text-base text-foreground">
                    {searchQuery ? "No discussions match your query" : "No entries in this channel yet"}
                  </h3>
                  <p className="font-mono text-xs text-muted-foreground max-w-sm mx-auto">
                    {searchQuery
                      ? "Try searching for a different keyword or reset active filters."
                      : "Be the first scholar to initiate discourse! Pose a question or log a derivation."}
                  </p>
                  <Button
                    onClick={() => {
                      if (searchQuery) setSearchQuery("");
                      else openNewPostWithCat(activeCategory);
                    }}
                    size="sm"
                    className="mt-2 text-xs font-mono font-semibold rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs cursor-pointer"
                  >
                    {searchQuery ? "Clear Search" : "Initiate First Entry"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPosts.map(post => (
                    <PostCard
                      key={post.id}
                      post={post}
                      profile={profile}
                      user={user}
                      deviceId={deviceId}
                      onToggleReaction={toggleReaction}
                      onDeletePost={deletePost}
                      isBookmarked={bookmarks.has(post.id)}
                      onToggleBookmark={() => toggleBookmark(post.id)}
                      onImageClick={url => setLightboxImage(url)}
                      onRequireUpgrade={() => setUpgradeModalOpen(true)}
                    />
                  ))}
                </div>
              )}
            </main>

            {/* RIGHT COLUMN: Chamber Telemetry & Guidelines (3 cols - Screen 10) */}
            <aside aria-label="Lounge Telemetry" className="hidden lg:block lg:col-span-3 space-y-4 sticky top-20">
              {/* Telemetry Strip */}
              <div className="bg-card rounded-2xl border border-border/80 p-4 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-[11px] uppercase tracking-wider font-semibold text-foreground">
                    Active Carrels
                  </span>
                </div>
                <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md font-semibold">
                  142 Online
                </span>
              </div>

              {/* Bookie Codex Box (Screen 10) */}
              <div className="bg-card rounded-2xl border border-border/80 p-5 shadow-xs space-y-3">
                <div className="pb-3 border-b border-border/60 flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-wider font-bold text-foreground">
                    Bookie Codex
                  </span>
                  <span className="font-mono text-[10px] text-primary font-semibold">STANDARDS</span>
                </div>
                <ol className="space-y-3 font-mono text-xs text-muted-foreground leading-relaxed">
                  <li className="flex items-start gap-2.5">
                    <span className="font-semibold text-foreground shrink-0 text-[11px]">01.</span>
                    <span><strong>Zero Promotional Fluff:</strong> Coaching leaks, paid spam, and non-academic rants are removed on sight.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="font-semibold text-foreground shrink-0 text-[11px]">02.</span>
                    <span><strong>Structured Tagging:</strong> Identify exam year, subject, and chapter for archival retention.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="font-semibold text-foreground shrink-0 text-[11px]">03.</span>
                    <span><strong>Rigorous Peer Critique:</strong> Objective problem deconstruction without ego or hostility.</span>
                  </li>
                </ol>
              </div>

              {/* Guest Upgrade Card */}
              {(!user || profile?.account_type === "guest") && (
                <div className="bg-card rounded-2xl border border-border/80 p-5 shadow-xs space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-mono font-bold border border-primary/20">
                      [ACC]
                    </span>
                    <h4 className="font-mono text-xs font-bold text-foreground uppercase tracking-wider">
                      Full Peer Access
                    </h4>
                  </div>
                  <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                    You're browsing in read-only mode. Upgrade to Google (1-Click) to post questions, solve doubts, and preserve your study progress.
                  </p>
                  <Button
                    size="sm"
                    onClick={() => setUpgradeModalOpen(true)}
                    className="w-full text-xs font-mono font-semibold rounded-lg h-9 gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs cursor-pointer"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    <span>Upgrade with Google</span>
                  </Button>
                </div>
              )}

              {/* Quick Navigation Links */}
              <div className="space-y-2">
                <Link
                  to="/ypt"
                  className="p-3.5 rounded-xl border border-border/80 bg-card hover:border-primary/40 shadow-xs transition-all flex items-center gap-3 group"
                >
                  <div className="p-1.5 rounded-lg border border-border/60 bg-muted/40 text-primary shrink-0">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-serif text-xs font-semibold text-foreground flex items-center gap-1 group-hover:text-primary transition-colors">
                      <span>YPT Study Carrels</span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </h4>
                    <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                      Live timer study sessions with peer telemetry
                    </p>
                  </div>
                </Link>

                <a
                  href="https://t.me/bookieshere"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3.5 rounded-xl border border-border/80 bg-card hover:border-primary/40 shadow-xs transition-all flex items-center gap-3 group"
                >
                  <div className="p-1.5 rounded-lg border border-border/60 bg-muted/40 text-primary shrink-0">
                    <Send className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-serif text-xs font-semibold text-foreground flex items-center gap-1 group-hover:text-primary transition-colors">
                      <span>Telegram Dispatch</span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </h4>
                    <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                      Free PDF notes, formula sheets & bulletins
                    </p>
                  </div>
                </a>
              </div>
            </aside>
          </div>
        </div>

        {/* Create Post Dialog */}
        <NewPostDialog
          isOpen={isNewPostOpen}
          setIsOpen={setIsNewPostOpen}
          onCreatePost={createPost}
          profile={profile}
          defaultCategory={preselectedCategory}
        />

        {/* Image Lightbox Modal */}
        {lightboxImage && (
          <div
            className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center p-4 animate-in fade-in duration-150"
            onClick={() => setLightboxImage(null)}
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 p-2 rounded-lg border border-border/80 bg-card text-foreground shadow-xs hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={lightboxImage}
              alt="Enlarged content"
              className="max-w-full max-h-[85vh] object-contain rounded-xl border border-border/80 shadow-md"
              onClick={e => e.stopPropagation()}
            />
          </div>
        )}

        <UpgradeModal
          isOpen={upgradeModalOpen}
          onOpenChange={setUpgradeModalOpen}
          feature="community"
        />
      </div>
    </Layout>
  );
}

// ----------------------------------------------------------------------
// POST CARD COMPONENT
// ----------------------------------------------------------------------
interface PostCardProps {
  post: CommunityPost;
  profile: any;
  user?: any;
  deviceId?: string;
  onToggleReaction: (postId: string, reaction: ReactionKey) => void;
  onDeletePost: (postId: string) => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onImageClick: (url: string) => void;
  onRequireUpgrade?: () => void;
}

function PostCard({
  post,
  profile,
  user,
  deviceId,
  onToggleReaction,
  onDeletePost,
  isBookmarked,
  onToggleBookmark,
  onImageClick,
  onRequireUpgrade,
}: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const { comments, loading: commentsLoading, addComment, deleteComment } = useComments(post.id);
  const { toast } = useToast();

  const category = detectCategory(post.title || post.subject, post.category_id);
  const myId = user?.id || profile?.user_id || profile?.id || deviceId;
  const isOwner = Boolean(
    (profile?.id && post.profile_id === profile.id) ||
    (myId && post.user_id === myId) ||
    (user?.id && post.user_id === user.id) ||
    (profile?.user_id && post.user_id === profile.user_id)
  );
  const isMod = profile?.is_admin || profile?.role === "admin";

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin + "/community#" + post.id);
      toast({ description: "Post link copied to clipboard!" });
    }
  };

  return (
    <article id={post.id} className="bg-card rounded-2xl border border-border/80 p-5 shadow-xs hover:border-primary/40 transition-all duration-200 space-y-3.5">
      {/* Post Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-8 w-8 border border-border/70 shrink-0">
            <AvatarImage src={post.author_avatar || post.author?.avatar_url || ""} />
            <AvatarFallback className="bg-muted text-foreground font-mono font-bold text-xs">
              {((post.author_name || post.author?.display_name || "A")?.[0] || "A").toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-sans font-semibold text-xs sm:text-sm text-foreground truncate">
                {post.author_name || post.author?.display_name || "Anonymous Aspirant"}
              </span>
              {post.user_id && (
                <BadgeCheck className="h-3.5 w-3.5 text-primary inline-block shrink-0" />
              )}
              <span className={cn("font-mono text-[10px] px-2 py-0.5 rounded-md border ml-0.5 font-semibold", category.badge)}>
                [{category.code}] {category.label}
              </span>
            </div>
            <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            onClick={onToggleBookmark}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"
            title="Bookmark post"
          >
            {isBookmarked ? (
              <BookmarkCheck className="h-4 w-4 text-primary fill-primary/20" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>

          <Button
            onClick={handleShare}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"
            title="Share post"
          >
            <Share2 className="h-4 w-4" />
          </Button>

          {(isOwner || isMod) && (
            <Button
              onClick={() => onDeletePost(post.id)}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer"
              title="Delete post"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Post Body Title & Content */}
      <div className="space-y-1.5">
        <h2 className="font-serif text-base sm:text-lg font-medium text-foreground leading-snug tracking-tight hover:text-primary cursor-pointer transition-colors">
          {post.title || post.subject || "Untitled Discussion"}
        </h2>
        <p className="font-mono text-xs sm:text-[13px] text-foreground/90 whitespace-pre-wrap leading-relaxed">
          {post.content || post.body || ""}
        </p>

        {post.image_url && (
          <div className="pt-2">
            <div
              onClick={() => onImageClick(post.image_url!)}
              className="relative group rounded-xl overflow-hidden border border-border/80 max-h-96 bg-muted cursor-pointer shadow-xs"
            >
              <img
                src={post.image_url}
                alt="Post attachment"
                className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-200"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 font-mono text-xs">
                <Maximize2 className="h-4 w-4" />
                <span>Expand Image</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Post Reactions Bar & Comments Counter */}
      <div className="pt-2.5 border-t border-border/60 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {REACTION_ORDER.map(rk => {
            const users = post.reactions?.[rk];
            const count = Array.isArray(users) ? users.length : 0;
            const hasReacted =
              post.my_reaction === rk ||
              (Array.isArray(users) &&
                Boolean(
                  (myId && users.includes(myId)) ||
                  (user?.id && users.includes(user.id)) ||
                  (profile?.id && users.includes(profile.id)) ||
                  (profile?.user_id && users.includes(profile.user_id)) ||
                  (deviceId && users.includes(deviceId))
                ));

            const ReactionIcon = REACTION_ICONS[rk].icon;

            return (
              <button
                key={rk}
                onClick={() => onToggleReaction(post.id, rk)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all select-none cursor-pointer border shadow-2xs",
                  hasReacted
                    ? "bg-primary text-primary-foreground border-primary font-semibold"
                    : "bg-muted/40 border-border/60 text-foreground hover:bg-muted/70"
                )}
              >
                <ReactionIcon className="w-3.5 h-3.5" />
                <span className="font-mono text-[11px]">{REACTION_ICONS[rk].label}</span>
                {count > 0 && <span className="font-mono text-[11px] font-bold">({count})</span>}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setShowComments(!showComments)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono text-xs font-medium transition-colors ml-auto border shadow-2xs cursor-pointer",
            showComments
              ? "bg-foreground text-background border-foreground font-semibold"
              : "border-border/70 bg-card text-foreground hover:bg-muted/50"
          )}
        >
          <MessageCircle className="h-3.5 w-3.5" />
          <span>{post.comments_count || post.comment_count || 0} Replies</span>
        </button>
      </div>

      {/* Collapsible Comments Section */}
      {showComments && (
        <CommentsSection
          comments={comments}
          loading={commentsLoading}
          profile={profile}
          user={user}
          onAddComment={addComment}
          onDeleteComment={deleteComment}
          onRequireUpgrade={onRequireUpgrade}
        />
      )}
    </article>
  );
}

// ----------------------------------------------------------------------
// COMMENTS SECTION
// ----------------------------------------------------------------------
interface CommentsSectionProps {
  comments: any[];
  loading: boolean;
  profile: any;
  user?: any;
  onAddComment: (body: string) => Promise<any>;
  onDeleteComment: (id: string) => Promise<any>;
  onRequireUpgrade?: () => void;
}

function CommentsSection({
  comments,
  loading,
  profile,
  user,
  onAddComment,
  onDeleteComment,
  onRequireUpgrade,
}: CommentsSectionProps) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const isGuest = !user || profile?.account_type === "guest";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) {
      onRequireUpgrade?.();
      return;
    }
    if (!text.trim()) return;

    const modResult = moderate(text);
    if (modResult.flagged) {
      toast({ description: "Comment contains flagged language. Keep it kind." });
      return;
    }

    setSubmitting(true);
    try {
      await onAddComment(text.trim());
      setText("");
      toast({ description: "Reply recorded in thread!" });
    } catch (err: any) {
      toast({ description: err.message || "Failed to post comment." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-3 mt-3 border-t border-border/60 space-y-3">
      {/* Reply input card */}
      <form onSubmit={handleSubmit} className="flex items-start gap-2.5 bg-muted/30 p-2.5 rounded-xl border border-border/70">
        <Avatar className="h-7 w-7 border border-border/60 shrink-0 mt-0.5">
          <AvatarImage src={profile?.avatar_url || ""} />
          <AvatarFallback className="bg-muted text-foreground font-mono font-bold text-[10px]">
            {((profile?.display_name || "A")?.[0] || "A").toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <Input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={
              isGuest
                ? "Guest account (read-only) — Upgrade to reply..."
                : "Write a constructive reply..."
            }
            onClick={() => {
              if (isGuest) onRequireUpgrade?.();
            }}
            readOnly={isGuest}
            className={cn(
              "text-xs bg-background border-border/70 rounded-lg h-9 px-3 font-mono",
              isGuest && "cursor-pointer"
            )}
          />
        </div>
        <Button
          type="submit"
          size="sm"
          disabled={submitting || (!isGuest && !text.trim())}
          className="rounded-lg px-3.5 h-9 shrink-0 font-mono text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs cursor-pointer"
        >
          {submitting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
        </Button>
      </form>

      {/* List of existing comments */}
      {loading ? (
        <div className="flex justify-center items-center py-4 gap-2 text-muted-foreground font-mono text-xs">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          <span>Retrieving replies...</span>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-4 px-3 bg-muted/20 rounded-lg border border-dashed border-border/60 font-mono text-xs text-muted-foreground">
          No replies yet. Be the first to add to the thread.
        </div>
      ) : (
        <div className="space-y-2">
          {comments.map(c => {
            const isCommentOwner = Boolean(
              (profile?.id && c.profile_id === profile.id) ||
              (user?.id && c.user_id === user.id) ||
              (profile?.user_id && c.user_id === profile.user_id)
            );
            const isMod = profile?.is_admin || profile?.role === "admin";
            const targetCat = c.target_category || c.author?.target_category;

            return (
              <div
                key={c.id}
                className="group flex gap-2.5 text-xs bg-card p-3 rounded-xl border border-border/70 shadow-2xs"
              >
                <Avatar className="h-7 w-7 shrink-0 border border-border/60 mt-0.5">
                  <AvatarImage src={c.author_avatar || c.author?.avatar_url || ""} />
                  <AvatarFallback className="bg-muted text-foreground font-mono font-bold text-[10px]">
                    {((c.author_name || c.author?.display_name || "A")?.[0] || "A").toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                      <span className="font-sans font-semibold text-xs text-foreground truncate">
                        {c.author_name || c.author?.display_name || "Aspirant"}
                      </span>
                      {targetCat && (
                        <span className="font-mono text-[9px] px-1.5 py-0.2 rounded border border-border/60 bg-muted/40 text-muted-foreground">
                          {targetCat}
                        </span>
                      )}
                      <span className="font-mono text-[10px] text-muted-foreground">
                        • {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                      </span>
                    </div>

                    {(isCommentOwner || isMod) && (
                      <button
                        onClick={() => onDeleteComment(c.id)}
                        className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors shrink-0 cursor-pointer"
                        title="Delete comment"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  <p className="font-mono text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">
                    {c.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// NEW POST DIALOG
// ----------------------------------------------------------------------
interface NewPostDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onCreatePost: (
    title: string,
    content: string,
    category?: string,
    imageUrl?: string
  ) => Promise<any>;
  profile: any;
  defaultCategory?: CommunityCategory;
}

function NewPostDialog({
  isOpen,
  setIsOpen,
  onCreatePost,
  profile,
  defaultCategory = "discussion",
}: NewPostDialogProps) {
  const [selectedCat, setSelectedCat] = useState<CommunityCategory>(defaultCategory);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (defaultCategory && defaultCategory !== "all") {
      setSelectedCat(defaultCategory);
    }
  }, [defaultCategory]);

  const processImageFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ description: "Please upload an image file (PNG, JPG, WebP)." });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ description: "Image size must be less than 5MB" });
      return;
    }

    setIsUploadingImage(true);
    try {
      const ext = file.name ? file.name.split(".").pop() || "jpg" : "jpg";
      const path = `community/${safeRandomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("room-images")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("room-images").getPublicUrl(path);
      setImageUrl(data.publicUrl);
      toast({ description: "Image attached successfully!" });
    } catch (err: any) {
      toast({ description: err.message || "Failed to upload image." });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          processImageFile(file);
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
    if (file) {
      processImageFile(file);
    }
  };

  const insertSymbol = (sym: string) => {
    if (!textareaRef.current) {
      setContent(prev => prev + " " + sym);
      return;
    }
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const next = content.substring(0, start) + sym + content.substring(end);
    setContent(next);
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(start + sym.length, start + sym.length);
    }, 50);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast({ description: "Please enter both a title and content for your post." });
      return;
    }

    const modResult = moderate(title + " " + content);
    if (modResult.flagged) {
      toast({ description: "Post contains flagged language. Please keep discussions polite." });
      return;
    }

    setIsSubmitting(true);
    const catDef = CATEGORIES.find(c => c.id === selectedCat);
    const finalTitle = catDef?.tag ? `${catDef.tag} ${title.trim()}` : title.trim();

    try {
      const result = await onCreatePost(finalTitle, content.trim(), selectedCat, imageUrl.trim() || undefined);
      if (result) {
        toast({ description: "Post published to community!" });
        setTitle("");
        setContent("");
        setImageUrl("");
        setIsOpen(false);
      }
    } catch (err: any) {
      toast({ description: err.message || "Failed to create post." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-lg bg-card border border-border/80 rounded-2xl p-6 shadow-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg font-medium text-foreground flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span>Initiate Discussion Entry</span>
          </DialogTitle>
          <DialogDescription className="font-mono text-xs text-muted-foreground">
            Share problem deconstructions, strategies, mock analysis, doubts or resources.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          onPaste={handlePaste}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn("space-y-4 mt-2 transition-colors rounded-xl", isDragging && "border border-dashed border-primary bg-primary/5 p-2")}
        >
          {/* Category Selector Pills */}
          <div>
            <label className="font-mono text-xs font-semibold text-foreground block mb-1.5">
              Select Channel Flair
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
              {CATEGORIES.filter(c => c.id !== "all").map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCat(c.id)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-mono transition-all border cursor-pointer",
                    selectedCat === c.id
                      ? "bg-primary text-primary-foreground border-primary font-semibold shadow-xs"
                      : "bg-muted/40 border-border/60 text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                  )}
                >
                  <span>[{c.code}]</span> {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="font-mono text-xs font-semibold text-foreground block mb-1">
              Entry Title
            </label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Cleared Physics Mechanics backlog in 3 weeks (Exact routine)"
              className="font-mono text-xs bg-background border border-border/80 rounded-lg focus-visible:ring-1 focus-visible:ring-primary"
              required
            />
          </div>

          {/* Content Textarea with Math Keyboard */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-mono text-xs font-semibold text-foreground">
                Deconstruction / Query
              </label>
            </div>

            {/* Quick Math Symbols Toolbar */}
            <div className="flex items-center gap-1 flex-wrap p-1.5 mb-1.5 bg-muted/30 rounded-lg border border-border/60">
              <span className="font-mono text-[10px] font-semibold text-muted-foreground px-1">Symbols:</span>
              {MATH_SYMBOLS.map(sym => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => insertSymbol(sym)}
                  className="px-1.5 py-0.5 text-xs font-mono bg-card border border-border/60 rounded hover:bg-muted text-foreground transition-colors cursor-pointer"
                >
                  {sym}
                </button>
              ))}
            </div>

            <Textarea
              ref={textareaRef}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Write your advice, meme explanation, rant or doubt clearly (or paste image with Ctrl+V)..."
              rows={4}
              className="font-mono text-xs bg-background border border-border/80 rounded-lg leading-relaxed resize-none focus-visible:ring-1 focus-visible:ring-primary"
              required
            />
          </div>

          {/* Image Upload Area */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />

            {imageUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-border/80 max-h-48 bg-muted shadow-xs">
                <img
                  src={imageUrl}
                  alt="Attached preview"
                  className="w-full h-full object-contain max-h-48"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute top-2 right-2 p-1.5 rounded-md border border-border/70 bg-card text-foreground shadow-xs hover:bg-muted transition-colors cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "cursor-pointer border border-dashed rounded-xl p-3 text-center transition-all flex flex-col items-center justify-center gap-1",
                  isDragging
                    ? "border-primary bg-primary/10"
                    : "border-border/80 hover:border-primary/50 hover:bg-muted/40"
                )}
              >
                {isUploadingImage ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground py-1 font-mono">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                    <span>Uploading Image...</span>
                  </div>
                ) : (
                  <>
                    <div className="p-1.5 rounded-lg border border-border/60 bg-card text-primary shadow-2xs">
                      <ImageIcon className="h-4 w-4" />
                    </div>
                    <p className="font-mono text-xs font-semibold text-foreground">
                      Attach Image (Drag & Drop or <kbd className="px-1 py-0.2 text-[10px] font-mono bg-muted/60 rounded border border-border/60">Ctrl+V</kbd>)
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      Screenshots, JPG, PNG, WebP up to 5MB
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="rounded-lg text-xs font-mono border-border/70 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isUploadingImage || !title.trim() || !content.trim()}
              className="rounded-lg text-xs font-mono font-semibold gap-1.5 px-4 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs cursor-pointer"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Publish Entry</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
