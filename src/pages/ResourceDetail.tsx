import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Bookmark, BookmarkCheck, Download, MessageSquare, Send, ThumbsUp } from "lucide-react";

export default function ResourceDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [resource, setResource] = useState<any>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const { data: r } = await supabase.from("resources").select("*").eq("id", id).single();
      setResource(r);
      const { data: c } = await supabase.from("comments").select("*, profiles(display_name)").eq("resource_id", id).order("created_at", { ascending: true });
      setComments(c || []);
      if (user) {
        const { data: bk } = await supabase.from("bookmarks").select("id").eq("user_id", user.id).eq("resource_id", id).maybeSingle();
        setIsBookmarked(!!bk);
      }
      setLoading(false);
    };
    load();
  }, [id, user]);

  const toggleBookmark = async () => {
    if (!user || !id) return;
    if (isBookmarked) {
      await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("resource_id", id);
      setIsBookmarked(false);
      toast({ title: "Bookmark removed" });
    } else {
      await supabase.from("bookmarks").insert({ user_id: user.id, resource_id: id });
      setIsBookmarked(true);
      toast({ title: "Bookmarked!" });
    }
  };

  const trackDownload = async () => {
    if (!user || !id) return;
    await supabase.from("download_history").insert({ user_id: user.id, resource_id: id });
    if (resource?.file_url) window.open(resource.file_url, "_blank");
    toast({ title: "Download tracked" });
  };

  const addComment = async () => {
    if (!user || !id || !newComment.trim()) return;
    await supabase.from("comments").insert({ user_id: user.id, resource_id: id, content: newComment.trim() });
    setNewComment("");
    const { data: c } = await supabase.from("comments").select("*, profiles(display_name)").eq("resource_id", id).order("created_at", { ascending: true });
    setComments(c || []);
    toast({ title: "Comment added" });
  };

  if (loading) return <Layout><div className="flex min-h-[60vh] items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div></Layout>;
  if (!resource) return <Layout><div className="container mx-auto px-4 py-12 text-center"><p className="text-muted-foreground">Resource not found.</p></div></Layout>;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex gap-2 mb-4">
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded capitalize">{resource.category.replace("-", " ")}</span>
            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded capitalize">{resource.file_type}</span>
            {resource.is_featured && <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded">Featured</span>}
          </div>
          <h1 className="font-display text-3xl font-bold mb-4">{resource.title}</h1>
          <p className="text-muted-foreground mb-6">{resource.description}</p>

          {user && (
            <div className="flex gap-3 mb-8">
              <Button variant="outline" onClick={toggleBookmark}>
                {isBookmarked ? <BookmarkCheck className="mr-2 h-4 w-4 text-primary" /> : <Bookmark className="mr-2 h-4 w-4" />}
                {isBookmarked ? "Bookmarked" : "Bookmark"}
              </Button>
              {resource.file_url && (
                <Button onClick={trackDownload}>
                  <Download className="mr-2 h-4 w-4" /> Download
                </Button>
              )}
            </div>
          )}

          {/* Comments */}
          <div className="border-t pt-8">
            <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" /> Comments ({comments.length})
            </h2>
            {user && (
              <div className="flex gap-2 mb-6">
                <Textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment..." className="flex-1" rows={2} />
                <Button onClick={addComment} size="icon" className="self-end"><Send className="h-4 w-4" /></Button>
              </div>
            )}
            <div className="space-y-3">
              {comments.map((c) => (
                <Card key={c.id} className="glass-card">
                  <CardContent className="p-4">
                    <p className="text-sm font-semibold mb-1">{(c.profiles as any)?.display_name || "User"}</p>
                    <p className="text-sm text-muted-foreground">{c.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">{new Date(c.created_at).toLocaleString()}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
