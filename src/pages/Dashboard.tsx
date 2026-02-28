import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import PageTransition from "@/components/PageTransition";
import { SkeletonDashboard } from "@/components/SkeletonCard";
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
  "hsl(142, 60%, 45%)",
  "hsl(45, 93%, 50%)",
  "hsl(220, 70%, 55%)",
  "hsl(280, 60%, 55%)",
];

export default function Dashboard() {
  const { user } = useAuth();
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [downloadCount, setDownloadCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activityData, setActivityData] = useState<{ name: string; downloads: number; bookmarks: number }[]>([]);
  const [categoryData, setCategoryData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
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

      // Build activity data (last 7 days)
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split("T")[0];
      });
      const activity = days.map((day) => ({
        name: new Date(day).toLocaleDateString("en", { weekday: "short" }),
        downloads: (downloads.data || []).filter((r) => r.downloaded_at?.startsWith(day)).length,
        bookmarks: (bookmarks.data || []).filter((r) => r.created_at?.startsWith(day)).length,
      }));
      setActivityData(activity);

      // Build category breakdown from bookmarks
      const cats: Record<string, number> = {};
      (bookmarks.data || []).forEach((b: any) => {
        const cat = b.resources?.category || "Other";
        cats[cat] = (cats[cat] || 0) + 1;
      });
      setCategoryData(Object.entries(cats).map(([name, value]) => ({ name, value })));

      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) {
    return (
      <Layout>
        <SkeletonDashboard />
      </Layout>
    );
  }

  const cards = [
    { icon: Bookmark, title: "Bookmarks", value: bookmarkCount, path: "/dashboard/bookmarks", color: "text-primary" },
    { icon: Download, title: "Downloads", value: downloadCount, path: "/dashboard/downloads", color: "text-accent" },
    { icon: Bell, title: "Notifications", value: notifCount, path: "/dashboard", color: "text-chart-3" },
  ];

  return (
    <Layout>
      <PageTransition>
        <div className="container mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-3xl font-bold mb-2">
              Welcome back, <span className="text-gradient-primary">{user?.user_metadata?.display_name || "Trader"}</span>
            </h1>
            <p className="text-muted-foreground mb-8">Your learning dashboard</p>
          </motion.div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {cards.map((c, i) => (
              <motion.div key={c.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Link to={c.path}>
                  <Card className="glass-card hover:glow-primary transition-all cursor-pointer">
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className="rounded-full bg-primary/10 p-3">
                        <c.icon className={`h-6 w-6 ${c.color}`} />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{c.title}</p>
                        <p className="font-display text-2xl font-bold">{c.value}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-2 text-lg">
                    <Activity className="h-5 w-5 text-primary" /> Weekly Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={activityData}>
                      <defs>
                        <linearGradient id="colorDownloads" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(142, 60%, 45%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(142, 60%, 45%)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorBookmarks" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(45, 93%, 50%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(45, 93%, 50%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "0.5rem",
                          color: "hsl(var(--foreground))",
                        }}
                      />
                      <Area type="monotone" dataKey="downloads" stroke="hsl(142, 60%, 45%)" fill="url(#colorDownloads)" strokeWidth={2} />
                      <Area type="monotone" dataKey="bookmarks" stroke="hsl(45, 93%, 50%)" fill="url(#colorBookmarks)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {categoryData.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="font-display flex items-center gap-2 text-lg">
                      <BookOpen className="h-5 w-5 text-accent" /> Bookmarked Categories
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                          {categoryData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "0.5rem",
                            color: "hsl(var(--foreground))",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" /> Market Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { label: "Equity", path: "/equity" },
                  { label: "Options", path: "/option" },
                  { label: "Mutual Funds", path: "/mutual-fund" },
                  { label: "ETFs", path: "/etf" },
                ].map((l) => (
                  <Link key={l.path} to={l.path}>
                    <Button variant="ghost" className="w-full justify-between">
                      {l.label} <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ))}
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-accent" /> Quick Access
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { label: "All Resources", path: "/resources" },
                  { label: "Trading Calculators", path: "/tools" },
                  { label: "My Bookmarks", path: "/dashboard/bookmarks" },
                  { label: "Download History", path: "/dashboard/downloads" },
                ].map((l) => (
                  <Link key={l.path} to={l.path}>
                    <Button variant="ghost" className="w-full justify-between">
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
