import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, BookOpen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AdminResources() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "equity", file_type: "article", file_url: "", is_featured: false, is_published: true });
  const [editId, setEditId] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from("resources").select("*").order("created_at", { ascending: false });
    setResources(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.title.trim()) { toast({ title: "Title required", variant: "destructive" }); return; }
    if (editId) {
      await supabase.from("resources").update(form).eq("id", editId);
      toast({ title: "Resource updated" });
    } else {
      await supabase.from("resources").insert({ ...form, created_by: user?.id });
      toast({ title: "Resource created" });
    }
    setDialogOpen(false);
    setEditId(null);
    setForm({ title: "", description: "", category: "equity", file_type: "article", file_url: "", is_featured: false, is_published: true });
    load();
  };

  const handleEdit = (r: any) => {
    setForm({ title: r.title, description: r.description || "", category: r.category, file_type: r.file_type, file_url: r.file_url || "", is_featured: r.is_featured, is_published: r.is_published });
    setEditId(r.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("resources").delete().eq("id", id);
    toast({ title: "Resource deleted" });
    load();
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold"><span className="text-gradient-primary">Manage Resources</span></h1>
            <p className="text-muted-foreground">Create, edit, and manage educational content</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditId(null); setForm({ title: "", description: "", category: "equity", file_type: "article", file_url: "", is_featured: false, is_published: true }); }}}>
            <DialogTrigger asChild>
              <Button className="glow-primary"><Plus className="mr-2 h-4 w-4" /> Add Resource</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-display">{editId ? "Edit" : "Create"} Resource</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["equity", "option", "mutual-fund", "etf", "general"].map(c => <SelectItem key={c} value={c} className="capitalize">{c.replace("-", " ")}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={form.file_type} onValueChange={(v) => setForm({ ...form, file_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["video", "pdf", "image", "article"].map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2"><Label>File URL</Label><Input value={form.file_url} onChange={(e) => setForm({ ...form, file_url: e.target.value })} placeholder="https://..." /></div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} /> Featured</label>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} /> Published</label>
                </div>
                <Button onClick={handleSave} className="w-full">{editId ? "Update" : "Create"} Resource</Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {loading ? (
          <div className="space-y-4">{[1,2,3].map(i => <Card key={i} className="glass-card animate-pulse"><CardContent className="p-6 h-20" /></Card>)}</div>
        ) : resources.length === 0 ? (
          <Card className="glass-card"><CardContent className="p-12 text-center"><BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">No resources yet. Create your first one!</p></CardContent></Card>
        ) : (
          <div className="space-y-3">
            {resources.map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                <Card className="glass-card">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold truncate">{r.title}</p>
                        {r.is_featured && <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded">Featured</span>}
                        {!r.is_published && <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded">Draft</span>}
                      </div>
                      <p className="text-sm text-muted-foreground capitalize">{r.category.replace("-", " ")} · {r.file_type}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(r)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
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
