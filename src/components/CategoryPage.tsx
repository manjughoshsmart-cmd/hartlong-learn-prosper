import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Video, Image, ArrowRight } from "lucide-react";

interface Resource {
  id: string;
  title: string;
  description: string | null;
  category: string;
  file_type: string;
  thumbnail_url: string | null;
  created_at: string;
}

const typeIcons: Record<string, typeof BookOpen> = {
  video: Video,
  pdf: FileText,
  image: Image,
  article: BookOpen,
};

export default function CategoryPage({ category, title, description }: { category: string; title: string; description: string }) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("resources")
      .select("id, title, description, category, file_type, thumbnail_url, created_at")
      .eq("category", category)
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setResources((data as Resource[]) || []);
        setLoading(false);
      });
  }, [category]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-3xl lg:text-4xl font-bold mb-2">
            <span className="text-gradient-primary">{title}</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl">{description}</p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="glass-card animate-pulse">
                <CardContent className="p-6 h-40" />
              </Card>
            ))}
          </div>
        ) : resources.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="p-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">No resources yet</h3>
              <p className="text-muted-foreground">Content is being prepared. Check back soon!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((r, i) => {
              const Icon = typeIcons[r.file_type] || BookOpen;
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link to={`/resources/${r.id}`}>
                    <Card className="glass-card hover:glow-primary transition-all cursor-pointer h-full group">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-3">
                          <div className="rounded-lg bg-primary/10 p-2">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-display font-semibold mb-1 truncate group-hover:text-primary transition-colors">{r.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">{r.description}</p>
                            <p className="text-xs text-muted-foreground mt-2">{new Date(r.created_at).toLocaleDateString()}</p>
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
