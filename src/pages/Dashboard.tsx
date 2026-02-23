import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
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
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [downloadCount, setDownloadCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [bk, dl, nt] = await Promise.all([
        supabase.from("bookmarks").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("download_history").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("is_read", false),
      ]);
      setBookmarkCount(bk.count || 0);
      setDownloadCount(dl.count || 0);
      setNotifCount(nt.count || 0);
    };
    load();
  }, [user]);

  const cards = [
    { icon: Bookmark, title: "Bookmarks", value: bookmarkCount, path: "/dashboard/bookmarks", color: "text-primary" },
    { icon: Download, title: "Downloads", value: downloadCount, path: "/dashboard/downloads", color: "text-accent" },
    { icon: Bell, title: "Notifications", value: notifCount, path: "/dashboard", color: "text-chart-3" },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold mb-2">
            Welcome back, <span className="text-gradient-primary">{user?.user_metadata?.display_name || "Trader"}</span>
          </h1>
          <p className="text-muted-foreground mb-8">Your learning dashboard</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {cards.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
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
    </Layout>
  );
}
