import { useState, useMemo, useRef, useEffect } from "react";
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
  REACTION_EMOJIS,
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
  Sparkles,
  TrendingUp,
  ExternalLink,
  Maximize2,
  Users,
  ShieldCheck,
  Lightbulb,
  Laugh,
  BookOpen,
  Award,
  HelpCircle,
  Compass,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { cn, safeRandomUUID } from "@/lib/utils";
import { UpgradeModal } from "@/components/Auth/UpgradeModal";
import { GuestUpgradeBanner } from "@/components/Auth/GuestUpgradeBanner";

const REACTION_ORDER: ReactionKey[] = ["heart", "fire", "rocket", "hundred", "celeb", "laugh", "like"];
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
  icon: string;
  tag: string;
  desc: string;
  badge: string;
  color: string;
}

export const CATEGORIES: CategoryDef[] = [
  {
    id: "all",
    label: "All Feeds",
    icon: "🌐",
    tag: "",
    desc: "Browse every discussion, strategy, meme, doubt & resource across the community",
    badge: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    color: "text-slate-900 dark:text-white",
  },
  {
    id: "discussion",
    label: "General & Rants",
    icon: "💬",
    tag: "[Discussion]",
    desc: "Aspirant daily talk, rants, study confessions, opinions & general conversations",
    badge: "bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800",
    color: "text-sky-600 dark:text-sky-400",
  },
  {
    id: "strategy",
    label: "Strategy & Tips",
    icon: "💡",
    tag: "[Strategy]",
    desc: "Backlogs clearing, revision roadmaps, time management & faculty recommendations",
    badge: "bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    color: "text-amber-600 dark:text-amber-400",
  },
  {
    id: "memes",
    label: "Memes & Humor",
    icon: "🎭",
    tag: "[Meme]",
    desc: "Coaching memes, relatable JEE/NEET humor, jokes & stress relief",
    badge: "bg-pink-50 dark:bg-pink-950/80 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800",
    color: "text-pink-600 dark:text-pink-400",
  },
  {
    id: "grind",
    label: "Daily Grind & YPT",
    icon: "🔥",
    tag: "[Grind]",
    desc: "Study hour check-ins, study desk setups, streaks & peer accountability",
    badge: "bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    color: "text-rose-600 dark:text-rose-400",
  },
  {
    id: "mocks",
    label: "Mocks & Marks",
    icon: "📊",
    tag: "[Mocks]",
    desc: "Mock test score reviews, percentiles, test series analysis & reality checks",
    badge: "bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    color: "text-purple-600 dark:text-purple-400",
  },
  {
    id: "resources",
    label: "Books & Notes",
    icon: "📚",
    tag: "[Resources]",
    desc: "Module comparisons, formula sheets, short notes & recommended books",
    badge: "bg-cyan-50 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
    color: "text-cyan-600 dark:text-cyan-400",
  },
  {
    id: "colleges",
    label: "College & Cutoffs",
    icon: "🎓",
    tag: "[Colleges]",
    desc: "IIT/NIT campus reviews, branch comparisons, counselling queries & cutoffs",
    badge: "bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
    color: "text-indigo-600 dark:text-indigo-400",
  },
  {
    id: "physics",
    label: "Physics Doubts",
    icon: "⚛️",
    tag: "[Physics]",
    desc: "Mechanics, Electrodynamics, Optics, Thermodynamics & concept clarifications",
    badge: "bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    color: "text-blue-600 dark:text-blue-400",
  },
  {
    id: "math",
    label: "Math Doubts",
    icon: "📐",
    tag: "[Math]",
    desc: "Calculus, Algebra, Coordinate Geometry, Vectors & problem solving",
    badge: "bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    color: "text-amber-600 dark:text-amber-400",
  },
  {
    id: "chemistry",
    label: "Chemistry Doubts",
    icon: "🧪",
    tag: "[Chemistry]",
    desc: "Organic mechanisms, Inorganic trends, Physical calculations & shortcuts",
    badge: "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    color: "text-emerald-600 dark:text-emerald-400",
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

  // Category counts
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

  const activeCategoryDef = useMemo(() => {
    return CATEGORIES.find(c => c.id === activeCategory) || CATEGORIES[0];
  }, [activeCategory]);

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
      <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 pb-20 transition-colors">
        {/* Top Community Navigation Header */}
        <div className="border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 -ml-1 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white"
                onClick={() => navigate(-1)}
                title="Go back"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg md:text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Aspirant Lounge</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-primary/10 text-primary border border-primary/20">
                      r/Bookieshere
                    </span>
                  </h1>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Connect, share memes, compare mock tests, study grind & roadmaps
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto">
              <Button
                onClick={() => setFilterMode(prev => (prev === "bookmarks" ? "all" : "bookmarks"))}
                variant={filterMode === "bookmarks" ? "default" : "outline"}
                size="sm"
                className="gap-1.5 text-xs h-9 rounded-xl border-slate-200 dark:border-slate-800"
              >
                {filterMode === "bookmarks" ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
                <span>Saved</span>
                {bookmarks.size > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 text-[10px] rounded-full bg-primary-foreground/20 font-bold">
                    {bookmarks.size}
                  </span>
                )}
              </Button>

              <Button
                onClick={() => openNewPostWithCat(activeCategory)}
                size="sm"
                className="rounded-xl gap-1.5 px-4 h-9 shadow-sm font-semibold"
              >
                <Plus className="h-4 w-4" />
                <span>Create Post</span>
              </Button>
            </div>
          </div>

          {/* Mobile Horizontal Sub-community Chips */}
          <div className="lg:hidden border-t border-slate-100 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70 overflow-x-auto no-scrollbar">
            <div className="px-4 py-2 flex items-center gap-1.5">
              {CATEGORIES.map(cat => {
                const isActive = activeCategory === cat.id;
                const count = cat.id === "all" ? posts.length : (categoryCounts.get(cat.id) || 0);
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all shrink-0",
                      isActive
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 shadow-xs"
                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                    )}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                    {count > 0 && (
                      <span className={cn(
                        "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                        isActive ? "bg-white/20 text-white dark:text-slate-900 dark:bg-slate-900/20" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                      )}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3-Column Reddit Style Layout */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Sidebar: Sub-Community Directory (Desktop) */}
            <aside className="hidden lg:block lg:col-span-3 sticky top-24 space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-3.5 shadow-xs">
                <div className="flex items-center justify-between px-2.5 py-1.5 mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Communities & Flairs
                  </span>
                  <Compass className="h-3.5 w-3.5 text-slate-400" />
                </div>

                <div className="space-y-1">
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
                          "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left",
                          isActive
                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white"
                        )}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="text-base">{cat.icon}</span>
                          <span className="truncate">{cat.label}</span>
                        </div>
                        {count > 0 && (
                          <span className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full font-bold",
                            isActive ? "bg-white/20 text-white dark:text-slate-900 dark:bg-slate-900/20" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                          )}>
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Navigation Cards */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Quick Filters
                </h4>
                <div className="space-y-1.5">
                  <button
                    onClick={() => setFilterMode("all")}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-left transition-colors",
                      filterMode === "all" ? "bg-primary/10 text-primary font-bold" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                  >
                    <Compass className="h-4 w-4" />
                    <span>All Feed Topics</span>
                  </button>
                  <button
                    onClick={() => setFilterMode("bookmarks")}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-left transition-colors",
                      filterMode === "bookmarks" ? "bg-primary/10 text-primary font-bold" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Bookmark className="h-4 w-4" />
                      <span>Saved Bookmarks</span>
                    </div>
                    {bookmarks.size > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-primary/10 text-primary">
                        {bookmarks.size}
                      </span>
                    )}
                  </button>
                  {profile && (
                    <button
                      onClick={() => setFilterMode("mine")}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-left transition-colors",
                        filterMode === "mine" ? "bg-primary/10 text-primary font-bold" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      )}
                    >
                      <Award className="h-4 w-4" />
                      <span>My Discussions</span>
                    </button>
                  )}
                </div>
              </div>
            </aside>

            {/* Center Column: Main Community Stream (lg:col-span-6) */}
            <main className="lg:col-span-6 space-y-4">
              {/* Guest Upgrade Encouragement Banner */}
              <GuestUpgradeBanner feature="community" />

              {/* Quick Post Composer Input Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-xs">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-800 shrink-0">
                    <AvatarImage src={profile?.avatar_url || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                      {((profile?.display_name || "A")?.[0] || "A").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={() => openNewPostWithCat(activeCategory)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-left px-4 py-2.5 rounded-full text-xs text-slate-500 dark:text-slate-400 transition-colors border border-transparent hover:border-slate-300 dark:hover:border-slate-700 truncate"
                  >
                    Share a strategy, ask a doubt, post a meme or mock score...
                  </button>
                  <Button
                    onClick={() => openNewPostWithCat(activeCategory)}
                    size="sm"
                    className="rounded-full gap-1.5 px-4 h-9 shadow-xs shrink-0 font-bold"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Post</span>
                  </Button>
                </div>

                {/* Quick Shortcuts */}
                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-1 overflow-x-auto text-xs text-slate-500">
                  <button
                    onClick={() => openNewPostWithCat("memes")}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                  >
                    <Laugh className="h-3.5 w-3.5 text-pink-500" />
                    <span>Meme / Joke</span>
                  </button>
                  <button
                    onClick={() => openNewPostWithCat("strategy")}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                  >
                    <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                    <span>Study Strategy</span>
                  </button>
                  <button
                    onClick={() => openNewPostWithCat("mocks")}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                  >
                    <TrendingUp className="h-3.5 w-3.5 text-purple-500" />
                    <span>Mock Scores</span>
                  </button>
                  <button
                    onClick={() => openNewPostWithCat("physics")}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                  >
                    <HelpCircle className="h-3.5 w-3.5 text-blue-500" />
                    <span>Ask Doubt</span>
                  </button>
                </div>
              </div>

              {/* Reddit-Style Feed Controls: Sort Tabs + Search */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-2.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl w-full sm:w-auto">
                  <button
                    onClick={() => setSortBy("hot")}
                    className={cn(
                      "flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                      sortBy === "hot"
                        ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    <Flame className={cn("h-3.5 w-3.5", sortBy === "hot" ? "text-rose-500" : "")} />
                    <span>Hot</span>
                  </button>

                  <button
                    onClick={() => setSortBy("new")}
                    className={cn(
                      "flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                      sortBy === "new"
                        ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    <Clock className={cn("h-3.5 w-3.5", sortBy === "new" ? "text-blue-500" : "")} />
                    <span>New</span>
                  </button>

                  <button
                    onClick={() => setSortBy("top")}
                    className={cn(
                      "flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                      sortBy === "top"
                        ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    <TrendingUp className={cn("h-3.5 w-3.5", sortBy === "top" ? "text-amber-500" : "")} />
                    <span>Top</span>
                  </button>
                </div>

                {/* Search in topic */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search posts..."
                    className="pl-9 pr-7 h-8 text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Feed Content List */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-3">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  <p className="text-xs text-slate-500 font-medium">Loading community feed...</p>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-2xl">
                    💬
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {searchQuery ? "No discussions match your query" : "No posts in this channel yet"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    {searchQuery
                      ? "Try searching for a different keyword or reset active filters."
                      : "Be the first aspirant to start the conversation! Ask a question or share a thought."}
                  </p>
                  <Button
                    onClick={() => {
                      if (searchQuery) setSearchQuery("");
                      else openNewPostWithCat(activeCategory);
                    }}
                    size="sm"
                    className="mt-2 text-xs rounded-xl"
                  >
                    {searchQuery ? "Clear Search" : "Create First Post"}
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

            {/* Right Sidebar: About Lounge & Rules (lg:col-span-3 Desktop) */}
            <aside className="hidden lg:block lg:col-span-3 sticky top-24 space-y-4">
              {/* Guest Upgrade Widget in Lounge Sidebar */}
              {(!user || profile?.account_type === "guest") && (
                <div className="bg-gradient-to-br from-blue-600/10 via-indigo-600/10 to-primary/10 rounded-2xl border-2 border-blue-500/30 p-4 shadow-xs space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-blue-500 text-white text-xs font-bold">⚡</span>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-display">
                      Unlock Full Community
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    You're browsing as Guest. Upgrade to Google (1-Click) to post questions, solve doubts, earn flairs, and preserve your study progress.
                  </p>
                  <Button
                    size="sm"
                    onClick={() => setUpgradeModalOpen(true)}
                    className="w-full text-xs font-bold rounded-xl h-8 gap-1.5"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                    <span>Upgrade to Google</span>
                  </Button>
                </div>
              )}

              {/* About Box */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-xs space-y-3.5">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary font-bold">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">About the Lounge</h3>
                    <p className="text-[11px] text-slate-500">Aspirant Community Hub</p>
                  </div>
                  <p className="text-[11px] font-mono text-slate-500 font-bold">
                    ⚡ Aspirants Only • Zero Fluff
                  </p>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  The unfiltered home for JEE & NEET warriors. Free from toxic coaching PR, built for real students sharing strategies, mock marks, memes & support.
                </p>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
                    <div className="text-base font-extrabold text-slate-900 dark:text-white">{posts.length}</div>
                    <div className="text-[10px] text-slate-500 font-medium">Discussions</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
                    <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Online</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">Peers Live</div>
                  </div>
                </div>

                <Button
                  onClick={() => openNewPostWithCat(activeCategory)}
                  className="w-full text-xs font-bold rounded-xl h-9"
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" /> Start Discussion
                </Button>
              </div>

              {/* Community Rules Box */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>Community Rules</span>
                </div>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 leading-relaxed">
                  <li className="flex items-start gap-1.5">
                    <span className="font-bold text-slate-900 dark:text-white">1.</span>
                    <span>Be polite & helpful to fellow aspirants preparing for exams.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="font-bold text-slate-900 dark:text-white">2.</span>
                    <span>Use relevant flairs so questions reach the right peers.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="font-bold text-slate-900 dark:text-white">3.</span>
                    <span>No promotion of paid leaks, abuse, or spam links.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="font-bold text-slate-900 dark:text-white">4.</span>
                    <span>Protect your mental health — take breaks from the screen.</span>
                  </li>
                </ul>
              </div>

              {/* Quick Links & Study Rooms */}
              <div className="space-y-2">
                <Link
                  to="/ypt"
                  className="group p-3.5 rounded-2xl border border-blue-200/80 dark:border-blue-900/60 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/20 hover:border-blue-300 dark:hover:border-blue-800 transition-all flex items-center gap-3"
                >
                  <div className="p-2 rounded-xl bg-blue-500 text-white shrink-0 group-hover:scale-105 transition-transform">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                      <span>YPT Virtual Rooms</span>
                      <ExternalLink className="h-3 w-3 text-slate-400" />
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Live timer study sessions with fellow aspirants
                    </p>
                  </div>
                </Link>

                <a
                  href="https://t.me/bookieshere"
                  target="_blank"
                  rel="noreferrer"
                  className="group p-3.5 rounded-2xl border border-sky-200/80 dark:border-sky-900/60 bg-gradient-to-br from-sky-50/50 to-cyan-50/30 dark:from-sky-950/20 dark:to-cyan-950/20 hover:border-sky-300 dark:hover:border-sky-800 transition-all flex items-center gap-3"
                >
                  <div className="p-2 rounded-xl bg-sky-500 text-white shrink-0 group-hover:scale-105 transition-transform">
                    <Send className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                      <span>Official Telegram</span>
                      <ExternalLink className="h-3 w-3 text-slate-400" />
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Daily free PDF notes, formula sheets & updates
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
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setLightboxImage(null)}
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={lightboxImage}
              alt="Enlarged content"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={e => e.stopPropagation()}
            />
          </div>
        )}
        {/* Guest Upgrade Dialog */}
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
// REDDIT-STYLE POST CARD COMPONENT
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
    <article id={post.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-3.5">
      {/* Post Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-800 shrink-0">
            <AvatarImage src={post.author_avatar || post.author?.avatar_url || ""} />
            <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs">
              {((post.author_name || post.author?.display_name || "A")?.[0] || "A").toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                {post.author_name || post.author?.display_name || "Anonymous Aspirant"}
              </span>
              {post.user_id && (
                <BadgeCheck className="h-3.5 w-3.5 text-blue-500 inline-block shrink-0" />
              )}
              <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold border ml-0.5", category.badge)}>
                {category.icon} {category.label}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          <Button
            onClick={onToggleBookmark}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full"
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
            className="h-8 w-8 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full"
            title="Share post"
          >
            <Share2 className="h-4 w-4" />
          </Button>

          {(isOwner || isMod) && (
            <Button
              onClick={() => onDeletePost(post.id)}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-full"
              title="Delete post"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Post Body Title & Content */}
      <div className="space-y-1.5">
        <h2 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
          {post.title || post.subject || "Untitled Discussion"}
        </h2>
        <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
          {post.content || post.body || ""}
        </p>

        {/* Media Preview if attached */}
        {post.image_url && (
          <div className="pt-2">
            <div
              onClick={() => onImageClick(post.image_url!)}
              className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-96 bg-slate-950 cursor-pointer"
            >
              <img
                src={post.image_url}
                alt="Post attachment"
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 font-medium text-xs">
                <Maximize2 className="h-4 w-4" />
                <span>Click to expand</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Post Reactions Bar & Comments Counter */}
      <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
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

            return (
              <button
                key={rk}
                onClick={() => {
                  onToggleReaction(post.id, rk);
                }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all select-none cursor-pointer border",
                  hasReacted
                    ? "bg-blue-500/10 dark:bg-blue-500/20 border-blue-500/50 text-blue-600 dark:text-blue-400 font-bold scale-[1.04] shadow-xs ring-1 ring-blue-500/20"
                    : "bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <span className="text-sm leading-none">{REACTION_EMOJIS[rk]}</span>
                {count > 0 && <span className="text-xs font-bold font-mono">{count}</span>}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setShowComments(!showComments)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ml-auto border",
            showComments
              ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700"
              : "text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <MessageCircle className="h-3.5 w-3.5 text-slate-400" />
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
      toast({ description: "Reply added!" });
    } catch (err: any) {
      toast({ description: err.message || "Failed to post comment." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-4 animate-in fade-in duration-200">
      {/* Reply input card */}
      <form onSubmit={handleSubmit} className="flex items-start gap-3 bg-slate-50/80 dark:bg-slate-950/60 p-3 rounded-2xl border border-slate-200/70 dark:border-slate-800">
        <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-800 shrink-0 mt-0.5">
          <AvatarImage src={profile?.avatar_url || ""} />
          <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
            {((profile?.display_name || "A")?.[0] || "A").toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <Input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={
              isGuest
                ? "Guest account (read-only) — Click to unlock reply perks with Google..."
                : "Write a helpful, constructive reply..."
            }
            onClick={() => {
              if (isGuest) onRequireUpgrade?.();
            }}
            readOnly={isGuest}
            className={cn(
              "text-xs md:text-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-primary h-10 px-3.5",
              isGuest && "cursor-pointer hover:border-primary/50"
            )}
          />
        </div>
        <Button
          type="submit"
          size="sm"
          disabled={submitting || (!isGuest && !text.trim())}
          className="rounded-xl px-4 h-10 shrink-0 font-semibold gap-1.5 shadow-xs"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reply</span>
            </>
          )}
        </Button>
      </form>

      {/* List of existing comments */}
      {loading ? (
        <div className="flex justify-center items-center py-6 gap-2 text-slate-400 text-xs">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>Loading comments...</span>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-6 px-4 bg-slate-50/50 dark:bg-slate-950/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <MessageCircle className="h-6 w-6 text-slate-300 dark:text-slate-600 mx-auto mb-1.5" />
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">No replies yet</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Be the first to share your thoughts or answer questions!</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {comments.map(c => {
            const isCommentOwner = Boolean(
              (profile?.id && c.profile_id === profile.id) ||
              (myId && c.user_id === myId) ||
              (user?.id && c.user_id === user.id) ||
              (profile?.user_id && c.user_id === profile.user_id)
            );
            const isMod = profile?.is_admin || profile?.role === "admin";
            const targetCat = c.target_category || c.author?.target_category;

            return (
              <div
                key={c.id}
                className="group flex gap-3 text-xs bg-slate-50/90 dark:bg-slate-950/70 p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all shadow-xs"
              >
                <Avatar className="h-8 w-8 shrink-0 border border-slate-200 dark:border-slate-800 mt-0.5">
                  <AvatarImage src={c.author_avatar || c.author?.avatar_url || ""} />
                  <AvatarFallback className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
                    {((c.author_name || c.author?.display_name || "A")?.[0] || "A").toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                      <span className="font-bold text-[13px] text-slate-900 dark:text-slate-100 truncate">
                        {c.author_name || c.author?.display_name || "Aspirant"}
                      </span>
                      {targetCat && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/60 shrink-0">
                          {targetCat}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 shrink-0 font-medium">
                        • {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                      </span>
                    </div>

                    {(isCommentOwner || isMod) && (
                      <button
                        onClick={() => onDeleteComment(c.id)}
                        className="text-slate-400 hover:text-rose-500 opacity-60 group-hover:opacity-100 p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all shrink-0 cursor-pointer"
                        title="Delete comment"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <p className="text-[13.5px] text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-normal select-text">
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
      toast({ description: "Please upload an image file (PNG, JPG, WebP, etc.)." });
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
      <DialogContent className="max-w-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>Create Discussion Post</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Share study strategies, memes, mock test results, doubts or resources with fellow aspirants.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          onPaste={handlePaste}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn("space-y-4 mt-2 transition-colors rounded-xl", isDragging && "ring-2 ring-primary/60 bg-primary/5 p-2")}
        >
          {/* Category Selector Pills */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Select Flair / Channel
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
              {CATEGORIES.filter(c => c.id !== "all").map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCat(c.id)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-semibold transition-all border flex items-center gap-1",
                    selectedCat === c.id
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 font-bold shadow-xs scale-105"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400"
                  )}
                >
                  <span>{c.icon}</span>
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Post Title
            </label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Cleared 2024 Physics backlog using Eduniti in 3 weeks (My exact routine)"
              className="text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl"
              required
            />
          </div>

          {/* Content Textarea with Math Keyboard */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Post Content
              </label>
            </div>

            {/* Quick Math Symbols Toolbar */}
            <div className="flex items-center gap-1 flex-wrap p-1.5 mb-1.5 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
              <span className="text-[10px] font-bold text-slate-400 px-1">Symbols:</span>
              {MATH_SYMBOLS.map(sym => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => insertSymbol(sym)}
                  className="px-1.5 py-0.5 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors"
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
              className="text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl leading-relaxed resize-none"
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
              <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-48 bg-slate-950">
                <img
                  src={imageUrl}
                  alt="Attached preview"
                  className="w-full h-full object-contain max-h-48 bg-black/40"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "cursor-pointer border-2 border-dashed rounded-xl p-4 text-center transition-all flex flex-col items-center justify-center gap-1.5",
                  isDragging
                    ? "border-primary bg-primary/10 scale-[1.01]"
                    : "border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-850"
                )}
              >
                {isUploadingImage ? (
                  <div className="flex items-center gap-2 text-xs text-slate-500 py-1">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span>Uploading Image...</span>
                  </div>
                ) : (
                  <>
                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                      <ImageIcon className="h-4 w-4" />
                    </div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Attach Image (Drag & Drop or <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-200 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700">Ctrl+V</kbd>)
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Supports screenshots, JPG, PNG, WebP up to 5MB
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isUploadingImage || !title.trim() || !content.trim()}
              className="rounded-xl text-xs gap-1.5 px-5 font-bold"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Post to Community</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
