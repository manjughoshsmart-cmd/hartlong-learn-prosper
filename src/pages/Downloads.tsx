import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Download } from "lucide-react";
import { Link } from "react-router-dom";

export default function Downloads() {
  const { user } = useAuth();
  const [downloads, setDownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("download_history")
      .select("id, downloaded_at, resource_id, resources(id, title, category, file_type)")
      .eq("user_id", user.id)
      .order("downloaded_at", { ascending: false })
      .then(({ data }) => {
        setDownloads(data || []);
        setLoading(false);
      });
  }, [user]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold mb-2"><span className="text-gradient-primary">Download History</span></h1>
          <p className="text-muted-foreground mb-8">Your previously downloaded resources</p>
        </motion.div>
        {loading ? (
          <div className="space-y-4">{[1,2,3].map(i => <Card key={i} className="glass-card animate-pulse"><CardContent className="p-6 h-20" /></Card>)}</div>
        ) : downloads.length === 0 ? (
          <Card className="glass-card"><CardContent className="p-12 text-center"><Download className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">No downloads yet.</p></CardContent></Card>
        ) : (
          <div className="space-y-3">
            {downloads.map((d, i) => (
              <motion.div key={d.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="glass-card">
                  <CardContent className="p-4">
                    <Link to={`/resources/${d.resource_id}`} className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold hover:text-primary transition-colors">{(d.resources as any)?.title || "Resource"}</p>
                        <p className="text-sm text-muted-foreground capitalize">{(d.resources as any)?.category?.replace("-", " ")} · {(d.resources as any)?.file_type}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{new Date(d.downloaded_at).toLocaleDateString()}</p>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
