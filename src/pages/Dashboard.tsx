import { useEffect, useState, useCallback, useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import PageTransition from "@/components/PageTransition";
import { SkeletonDashboard } from "@/components/SkeletonCard";
import OnboardingTour from "@/components/OnboardingTour";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Bookmark,
  Download,
  TrendingUp,
  Bell,
  ArrowRight,
  Activity,
  RefreshCw,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
];

export default function Dashboard() {
  const { user } = useAuth();
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [downloadCount, setDownloadCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activityData, setActivityData] = useState<{ name: string; downloads: number; bookmarks: number }[]>([]);
  const [categoryData, setCategoryData] = useState<{ name: string; value: number }[]>([]);

  // Pull-to-refresh
  const pullY = useMotionValue(0);
  const pullOpacity = useTransform(pullY, [0, 60, 100], [0, 0.5, 1]);
  const pullRotation = useTransform(pullY, [0, 100], [0, 360]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPulling, setIsPulling] = useState(false);
  const startY = useRef(0);

  const loadData = useCallback(async () => {
    if (!user) return;
    const [bk, dl, nt, downloads, bookmarks] = await Promise.all([
      supabase.from("bookmarks").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("download_history").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("is_read", false),
      supabase.from("download_history").select("downloaded_at").eq("user_id", user.id).order("downloaded_at", { ascending: false }).limit(100),
      supabase.from("bookmarks").select("created_at, resource_id, resources(category)").eq("user_id", user.id).limit(100),
    ]);
    setBookmarkCount(bk.count || 0);
    setDownloadCount(dl.count || 0);
    setNotifCount(nt.count || 0);

    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split("T")[0];
    });
    setActivityData(days.map((day) => ({
      name: new Date(day).toLocaleDateString("en", { weekday: "short" }),
      downloads: (downloads.data || []).filter((r) => r.downloaded_at?.startsWith(day)).length,
      bookmarks: (bookmarks.data || []).filter((r) => r.created_at?.startsWith(day)).length,
    })));

    const cats: Record<string, number> = {};
    (bookmarks.data || []).forEach((b: any) => {
      const cat = b.resources?.category || "Other";
      cats[cat] = (cats[cat] || 0) + 1;
    });
    setCategoryData(Object.entries(cats).map(([name, value]) => ({ name, value })));
    setLoading(false);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("dashboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookmarks", filter: `user_id=eq.${user.id}` }, () => loadData())
      .on("postgres_changes", { event: "*", schema: "public", table: "download_history", filter: `user_id=eq.${user.id}` }, () => loadData())
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, () => loadData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, loadData]);

  // Pull-to-refresh touch handlers
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleTouchStart = (e: TouchEvent) => {
      if (el.scrollTop === 0) {
        startY.current = e.touches[0].clientY;
        setIsPulling(true);
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling) return;
      const dy = Math.max(0, e.touches[0].clientY - startY.current);
      pullY.set(Math.min(dy, 120));
      if (dy > 20) e.preventDefault();
    };
    const handleTouchEnd = async () => {
      if (pullY.get() > 80) {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
      }
      pullY.set(0);
      setIsPulling(false);
    };
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd);
    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isPulling, loadData, pullY]);

  if (loading) {
    return <Layout><SkeletonDashboard /></Layout>;
  }

  const cards = [
    { icon: Bookmark, title: "Bookmarks", value: bookmarkCount, path: "/dashboard/bookmarks", color: "text-primary" },
    { icon: Download, title: "Downloads", value: downloadCount, path: "/dashboard/downloads", color: "text-accent" },
    { icon: Bell, title: "Notifications", value: notifCount, path: "/dashboard", color: "text-chart-3" },
  ];

  return (
    <Layout>
      <OnboardingTour />
      <PageTransition>
        <div ref={containerRef} className="container mx-auto px-4 py-6 sm:py-8 relative">
          {/* Pull-to-refresh indicator */}
          <motion.div
            style={{ opacity: pullOpacity }}
            className="flex items-center justify-center py-3 lg:hidden"
          >
            <motion.div style={{ rotate: pullRotation }}>
              <RefreshCw className={`h-5 w-5 text-primary ${refreshing ? "animate-spin" : ""}`} />
            </motion.div>
            <span className="ml-2 text-xs text-muted-foreground">
              {refreshing ? "Refreshing..." : "Pull to refresh"}
            </span>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-2xl sm:text-3xl font-bold mb-1">
              Welcome back, <span className="text-gradient-primary">{user?.user_metadata?.display_name || "Trader"}</span>
            </h1>
            <p className="text-sm text-muted-foreground mb-6 sm:mb-8">Your learning dashboard</p>
          </motion.div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {cards.map((c, i) => (
              <motion.div key={c.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Link to={c.path}>
                  <Card className="glass-card hover:glow-primary transition-all cursor-pointer">
                    <CardContent className="p-4 sm:p-6 flex items-center gap-4">
                      <div className="rounded-full bg-primary/10 p-2.5 sm:p-3">
                        <c.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${c.color}`} />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground">{c.title}</p>
                        <p className="font-display text-xl sm:text-2xl font-bold">{c.value}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="glass-card">
                <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
                  <CardTitle className="font-display flex items-center gap-2 text-base sm:text-lg">
                    <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /> Weekly Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 sm:p-6 pt-0">
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={activityData}>
                      <defs>
                        <linearGradient id="colorDownloads" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorBookmarks" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} width={30} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.5rem", color: "hsl(var(--foreground))", fontSize: 12 }} />
                      <Area type="monotone" dataKey="downloads" stroke="hsl(var(--chart-1))" fill="url(#colorDownloads)" strokeWidth={2} />
                      <Area type="monotone" dataKey="bookmarks" stroke="hsl(var(--chart-2))" fill="url(#colorBookmarks)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {categoryData.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card className="glass-card">
                  <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
                    <CardTitle className="font-display flex items-center gap-2 text-base sm:text-lg">
                      <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-accent" /> Bookmarked Categories
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center p-2 sm:p-6 pt-0">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                          {categoryData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.5rem", color: "hsl(var(--foreground))", fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <Card className="glass-card">
              <CardHeader className="p-4 sm:p-6 pb-2">
                <CardTitle className="font-display flex items-center gap-2 text-base sm:text-lg">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /> Market Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-2 space-y-1">
                {[
                  { label: "Equity", path: "/equity" },
                  { label: "Options", path: "/option" },
                  { label: "Mutual Funds", path: "/mutual-fund" },
                  { label: "ETFs", path: "/etf" },
                ].map((l) => (
                  <Link key={l.path} to={l.path}>
                    <Button variant="ghost" size="sm" className="w-full justify-between text-sm">
                      {l.label} <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ))}
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="p-4 sm:p-6 pb-2">
                <CardTitle className="font-display flex items-center gap-2 text-base sm:text-lg">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-accent" /> Quick Access
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-2 space-y-1">
                {[
                  { label: "All Resources", path: "/resources" },
                  { label: "Trading Calculators", path: "/tools" },
                  { label: "My Bookmarks", path: "/dashboard/bookmarks" },
                  { label: "Download History", path: "/dashboard/downloads" },
                ].map((l) => (
                  <Link key={l.path} to={l.path}>
                    <Button variant="ghost" size="sm" className="w-full justify-between text-sm">
                      {l.label} <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </PageTransition>
    </Layout>
  );
}
