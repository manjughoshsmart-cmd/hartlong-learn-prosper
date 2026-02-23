import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function Bookmarks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("bookmarks")
      .select("id, created_at, resource_id, resources(id, title, category, file_type)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setBookmarks(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const remove = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id);
    toast({ title: "Bookmark removed" });
    load();
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold mb-2"><span className="text-gradient-primary">My Bookmarks</span></h1>
          <p className="text-muted-foreground mb-8">Your saved learning resources</p>
        </motion.div>
        {loading ? (
          <div className="space-y-4">{[1,2,3].map(i => <Card key={i} className="glass-card animate-pulse"><CardContent className="p-6 h-20" /></Card>)}</div>
        ) : bookmarks.length === 0 ? (
          <Card className="glass-card"><CardContent className="p-12 text-center"><Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">No bookmarks yet. Save resources to find them here.</p></CardContent></Card>
        ) : (
          <div className="space-y-3">
            {bookmarks.map((b, i) => (
              <motion.div key={b.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="glass-card">
                  <CardContent className="p-4 flex items-center justify-between">
                    <Link to={`/resources/${b.resource_id}`} className="flex-1">
                      <p className="font-semibold hover:text-primary transition-colors">{(b.resources as any)?.title || "Resource"}</p>
                      <p className="text-sm text-muted-foreground capitalize">{(b.resources as any)?.category?.replace("-", " ")} · {(b.resources as any)?.file_type}</p>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => remove(b.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
