import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, FileText, Video, Image, Bookmark, BookmarkCheck, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

import { supabase } from "@/integrations/supabase/client";

interface Resource {
  id: string;
  title: string;
  description: string | null;
  category: string;
  file_type: string;
  file_url?: string | null;
  file_name?: string | null;
  created_at: string;
}

const typeIcons: Record<string, typeof BookOpen> = {
  video: Video,
  pdf: FileText,
  image: Image,
  article: BookOpen,
};

interface Props {
  resource: Resource;
  index: number;
  isBookmarked?: boolean;
  onBookmarkToggle?: (resourceId: string, bookmarked: boolean) => void;
}

export default function SwipeResourceCard({ resource, index, isBookmarked = false, onBookmarkToggle }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [swiping, setSwiping] = useState(false);
  const x = useMotionValue(0);
  const bgOpacity = useTransform(x, [-120, -60, 0], [1, 0.5, 0]);
  const iconScale = useTransform(x, [-120, -60, 0], [1.2, 0.8, 0]);
  const Icon = typeIcons[resource.file_type] || BookOpen;

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!resource.file_url) return;
    try {
      if (user) {
        await supabase.from("download_history").insert({ user_id: user.id, resource_id: resource.id });
      }
      const response = await fetch(resource.file_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = resource.file_name || resource.title || "download";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast({ title: "Download started!" });
    } catch {
      window.open(resource.file_url, "_blank");
      toast({ title: "Download opened in new tab" });
    }
  };
  const Icon = typeIcons[resource.file_type] || BookOpen;

  const handleDragEnd = async (_: any, info: PanInfo) => {
    setSwiping(false);
    if (info.offset.x < -80 && user) {
      const newState = !bookmarked;
      setBookmarked(newState);
      if (newState) {
        await supabase.from("bookmarks").insert({ user_id: user.id, resource_id: resource.id });
        toast({ title: "Bookmarked!", description: resource.title });
      } else {
        await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("resource_id", resource.id);
        toast({ title: "Removed bookmark", description: resource.title });
      }
      onBookmarkToggle?.(resource.id, newState);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="relative overflow-hidden rounded-xl"
    >
      {/* Swipe reveal background */}
      <motion.div
        style={{ opacity: bgOpacity }}
        className="absolute inset-0 flex items-center justify-end pr-6 bg-primary/20 rounded-xl"
      >
        <motion.div style={{ scale: iconScale }}>
          {bookmarked ? (
            <BookmarkCheck className="h-6 w-6 text-primary" />
          ) : (
            <Bookmark className="h-6 w-6 text-primary" />
          )}
        </motion.div>
      </motion.div>

      <motion.div
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -120, right: 0 }}
        dragElastic={0.1}
        onDragStart={() => setSwiping(true)}
        onDragEnd={handleDragEnd}
        className="relative z-10"
      >
        <Link to={`/resources/${resource.id}`} onClick={(e) => swiping && e.preventDefault()}>
          <Card className="glass-card hover:glow-primary transition-all cursor-pointer h-full group">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-semibold text-sm sm:text-base mb-1 truncate group-hover:text-primary transition-colors flex-1">
                      {resource.title}
                    </h3>
                    {bookmarked && <BookmarkCheck className="h-4 w-4 text-primary shrink-0" />}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{resource.description}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[10px] sm:text-xs bg-primary/10 text-primary px-2 py-0.5 rounded capitalize">
                      {resource.category.replace("-", " ")}
                    </span>
                    <span className="text-[10px] sm:text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded capitalize">
                      {resource.file_type}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    </motion.div>
  );
}
