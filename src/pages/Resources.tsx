import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, FileText, Video, Image, Search } from "lucide-react";
import SwipeResourceCard from "@/components/SwipeResourceCard";

interface Resource {
  id: string;
  title: string;
  description: string | null;
  category: string;
  file_type: string;
  file_url: string | null;
  file_name: string | null;
  created_at: string;
  thumbnail_url?: string | null;
}

const categories = ["all", "equity", "option", "mutual-fund", "etf", "general"];
const fileTypes = ["all", "video", "pdf", "image", "article"];

export default function Resources() {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  const loadBookmarks = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("bookmarks").select("resource_id").eq("user_id", user.id);
    setBookmarkedIds(new Set((data || []).map((b) => b.resource_id)));
  }, [user]);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  useEffect(() => {
    setLoading(true);
    let q = supabase
      .from("resources")
      .select("id, title, description, category, file_type, file_url, file_name, thumbnail_url, created_at")
      .eq("is_published", true)
      .order("created_at", { ascending: false });
    if (catFilter !== "all") q = q.eq("category", catFilter);
    if (typeFilter !== "all") q = q.eq("file_type", typeFilter);
    if (search) q = q.ilike("title", `%${search}%`);
    q.then(({ data }) => {
      setResources((data as Resource[]) || []);
      setLoading(false);
    });
  }, [search, catFilter, typeFilter]);

  const handleBookmarkToggle = (resourceId: string, bookmarked: boolean) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      bookmarked ? next.add(resourceId) : next.delete(resourceId);
      return next;
    });
  };

  return (
    <Layout>
      <SEOHead
        title="Trading Resources – Free PDFs, Videos & Articles"
        description="Browse free trading resources including PDFs, videos, and articles on equity, options, mutual funds, and ETFs. Learn to trade smarter with HartLong."
        canonical="/resources"
      />
      <div className="container mx-auto px-4 py-6 sm:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">
            <span className="text-gradient-primary">Resources</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">Browse all trading education materials</p>
        </motion.div>

        <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search resources..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((c) => (
              <Button key={c} variant={catFilter === c ? "default" : "outline"} size="sm" onClick={() => setCatFilter(c)} className="capitalize whitespace-nowrap text-xs sm:text-sm">
                {c === "all" ? "All" : c.replace("-", " ")}
              </Button>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {fileTypes.map((t) => (
              <Button key={t} variant={typeFilter === t ? "secondary" : "ghost"} size="sm" onClick={() => setTypeFilter(t)} className="capitalize whitespace-nowrap text-xs sm:text-sm">
                {t === "all" ? "All Types" : t}
              </Button>
            ))}
          </div>
        </div>

        {user && (
          <p className="text-xs text-muted-foreground mb-4 lg:hidden">
            ← Swipe left on a card to bookmark
          </p>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="glass-card animate-pulse">
                <CardContent className="p-6 h-28" />
              </Card>
            ))}
          </div>
        ) : resources.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="p-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No resources found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {resources.map((r, i) => (
              <SwipeResourceCard
                key={r.id}
                resource={r}
                index={i}
                isBookmarked={bookmarkedIds.has(r.id)}
                onBookmarkToggle={handleBookmarkToggle}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
