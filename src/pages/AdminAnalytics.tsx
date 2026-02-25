import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, BookOpen, Download, TrendingUp, Eye } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(142, 60%, 40%)", "hsl(45, 93%, 47%)", "hsl(220, 70%, 50%)", "hsl(280, 60%, 50%)", "hsl(340, 60%, 50%)"];

export default function AdminAnalytics() {
  const [stats, setStats] = useState({ users: 0, resources: 0, downloads: 0, comments: 0 });
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [recentDownloads, setRecentDownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [u, r, d, c, res, dl] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("resources").select("id", { count: "exact", head: true }),
        supabase.from("download_history").select("id", { count: "exact", head: true }),
        supabase.from("comments").select("id", { count: "exact", head: true }),
        supabase.from("resources").select("category"),
        supabase.from("download_history").select("downloaded_at, resource_id").order("downloaded_at", { ascending: false }).limit(100),
      ]);

      setStats({ users: u.count || 0, resources: r.count || 0, downloads: d.count || 0, comments: c.count || 0 });

      // Category distribution
      const catMap: Record<string, number> = {};
      (res.data || []).forEach((r: any) => { catMap[r.category] = (catMap[r.category] || 0) + 1; });
      setCategoryData(Object.entries(catMap).map(([name, value]) => ({ name: name.replace("-", " "), value })));

      // Downloads over last 7 days
      const days: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        days[d.toISOString().split("T")[0]] = 0;
      }
      (dl.data || []).forEach((d: any) => {
        const day = d.downloaded_at.split("T")[0];
        if (days[day] !== undefined) days[day]++;
      });
      setRecentDownloads(Object.entries(days).map(([date, count]) => ({
        date: new Date(date).toLocaleDateString("en", { weekday: "short" }), count,
      })));

      setLoading(false);
    };
    load();
  }, []);

  const statCards = [
    { icon: Users, title: "Total Users", value: stats.users },
    { icon: BookOpen, title: "Resources", value: stats.resources },
    { icon: Download, title: "Downloads", value: stats.downloads },
    { icon: TrendingUp, title: "Comments", value: stats.comments },
  ];

  if (loading) {
    return <Layout><div className="min-h-[80vh] flex items-center justify-center"><p className="text-muted-foreground">Loading analytics...</p></div></Layout>;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold mb-2"><span className="text-gradient-primary">Analytics</span></h1>
          <p className="text-muted-foreground mb-8">Platform engagement and usage statistics</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((c, i) => (
            <motion.div key={c.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="glass-card">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2"><c.icon className="h-5 w-5 text-primary" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground">{c.title}</p>
                    <p className="font-display text-xl font-bold">{c.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="glass-card">
              <CardHeader><CardTitle className="font-display text-lg">Downloads (Last 7 Days)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={recentDownloads}>
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(142, 60%, 40%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="glass-card">
              <CardHeader><CardTitle className="font-display text-lg">Resources by Category</CardTitle></CardHeader>
              <CardContent>
                {categoryData.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No data yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name} (${value})`}>
                        {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
