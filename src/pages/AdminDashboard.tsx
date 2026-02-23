import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, Download, TrendingUp, BarChart3, Shield } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ users: 0, resources: 0, downloads: 0 });

  useEffect(() => {
    const load = async () => {
      const [u, r, d] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("resources").select("id", { count: "exact", head: true }),
        supabase.from("download_history").select("id", { count: "exact", head: true }),
      ]);
      setStats({ users: u.count || 0, resources: r.count || 0, downloads: d.count || 0 });
    };
    load();
  }, []);

  const statCards = [
    { icon: Users, title: "Total Users", value: stats.users, color: "text-primary" },
    { icon: BookOpen, title: "Total Resources", value: stats.resources, color: "text-accent" },
    { icon: Download, title: "Total Downloads", value: stats.downloads, color: "text-chart-3" },
  ];

  const adminLinks = [
    { label: "Manage Users", path: "/admin/users", icon: Users },
    { label: "Manage Resources", path: "/admin/resources", icon: BookOpen },
    { label: "Analytics", path: "/admin/analytics", icon: BarChart3 },
    { label: "Settings", path: "/admin/settings", icon: Shield },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-6 w-6 text-accent" />
            <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground mb-8">Platform overview and management</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statCards.map((c, i) => (
            <motion.div key={c.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="glass-card">
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
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {adminLinks.map((l, i) => (
            <motion.div key={l.path} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}>
              <Link to={l.path}>
                <Card className="glass-card hover:glow-primary transition-all cursor-pointer h-full">
                  <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                    <l.icon className="h-8 w-8 text-primary" />
                    <p className="font-display font-semibold">{l.label}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
