import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Video, Image, Search } from "lucide-react";

interface Resource {
  id: string;
  title: string;
  description: string | null;
  category: string;
  file_type: string;
  created_at: string;
}

const typeIcons: Record<string, typeof BookOpen> = { video: Video, pdf: FileText, image: Image, article: BookOpen };
const categories = ["all", "equity", "option", "mutual-fund", "etf", "general"];
const fileTypes = ["all", "video", "pdf", "image", "article"];

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    let q = supabase
      .from("resources")
      .select("id, title, description, category, file_type, created_at")
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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-3xl lg:text-4xl font-bold mb-2">
            <span className="text-gradient-primary">Resources</span>
          </h1>
          <p className="text-muted-foreground">Browse all trading education materials</p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search resources..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((c) => (
              <Button key={c} variant={catFilter === c ? "default" : "outline"} size="sm" onClick={() => setCatFilter(c)} className="capitalize">
                {c === "all" ? "All Categories" : c.replace("-", " ")}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 flex-wrap mb-6">
          {fileTypes.map((t) => (
            <Button key={t} variant={typeFilter === t ? "secondary" : "ghost"} size="sm" onClick={() => setTypeFilter(t)} className="capitalize">
              {t === "all" ? "All Types" : t}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <Card key={i} className="glass-card animate-pulse"><CardContent className="p-6 h-32" /></Card>)}
          </div>
        ) : resources.length === 0 ? (
          <Card className="glass-card"><CardContent className="p-12 text-center"><BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">No resources found.</p></CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((r, i) => {
              const Icon = typeIcons[r.file_type] || BookOpen;
              return (
                <motion.div key={r.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Link to={`/resources/${r.id}`}>
                    <Card className="glass-card hover:glow-primary transition-all cursor-pointer h-full group">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-3">
                          <div className="rounded-lg bg-primary/10 p-2"><Icon className="h-5 w-5 text-primary" /></div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-display font-semibold mb-1 truncate group-hover:text-primary transition-colors">{r.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">{r.description}</p>
                            <div className="flex gap-2 mt-2">
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded capitalize">{r.category.replace("-", " ")}</span>
                              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded capitalize">{r.file_type}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
