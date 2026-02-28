import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, BookOpen, Upload, RotateCcw, AlertTriangle, Eye, EyeOff, Clock, FileText, History } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = [
  "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/png", "image/jpeg", "image/gif", "image/webp", "video/mp4", "video/webm",
];

interface ResourceForm {
  title: string; description: string; category: string; file_type: string;
  file_url: string; is_featured: boolean; is_published: boolean;
  visibility: string; expires_at: string;
}

const emptyForm: ResourceForm = {
  title: "", description: "", category: "equity", file_type: "article",
  file_url: "", is_featured: false, is_published: true,
  visibility: "public", expires_at: "",
};

export default function AdminResources() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [resources, setResources] = useState<any[]>([]);
  const [deletedResources, setDeletedResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<ResourceForm>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; permanent: boolean } | null>(null);
  const [versionHistory, setVersionHistory] = useState<any[]>([]);
  const [versionDialogOpen, setVersionDialogOpen] = useState(false);

  const load = async () => {
    const [active, deleted] = await Promise.all([
      supabase.from("resources").select("*").eq("is_deleted", false).order("created_at", { ascending: false }),
      supabase.from("resources").select("*").eq("is_deleted", true).order("deleted_at", { ascending: false }),
    ]);
    setResources(active.data || []);
    setDeletedResources(deleted.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({ title: "Unsupported file type", description: "Allowed: PDF, DOCX, PPT, XLSX, images, videos", variant: "destructive" });
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast({ title: "File too large", description: "Maximum 50MB allowed", variant: "destructive" });
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const filePath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage.from("resources").upload(filePath, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("resources").getPublicUrl(filePath);
    setForm((f) => ({ ...f, file_url: urlData.publicUrl }));

    // Auto-detect file type
    if (file.type.startsWith("image/")) setForm((f) => ({ ...f, file_type: "image" }));
    else if (file.type.startsWith("video/")) setForm((f) => ({ ...f, file_type: "video" }));
    else setForm((f) => ({ ...f, file_type: "pdf" }));

    setUploading(false);
    toast({ title: "File uploaded!" });
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast({ title: "Title required", variant: "destructive" }); return; }

    const payload: any = {
      title: form.title, description: form.description, category: form.category,
      file_type: form.file_type, file_url: form.file_url, is_featured: form.is_featured,
      is_published: form.is_published, visibility: form.visibility,
      expires_at: form.expires_at || null,
    };

    if (editId) {
      await supabase.from("resources").update(payload).eq("id", editId);
      // Create version entry
      await supabase.from("resource_versions").insert({
        resource_id: editId, file_url: form.file_url, uploaded_by: user?.id,
        version_number: Date.now(), // We'll use timestamp as version
      });
      await logAction("resource_updated", "resource", editId);
      toast({ title: "Resource updated" });
    } else {
      const { data } = await supabase.from("resources").insert({ ...payload, created_by: user?.id }).select().single();
      if (data) {
        await supabase.from("resource_versions").insert({
          resource_id: data.id, file_url: form.file_url, uploaded_by: user?.id, version_number: 1,
        });
        await logAction("resource_created", "resource", data.id);
      }
      toast({ title: "Resource created" });
    }
    closeDialog();
    load();
  };

  const logAction = async (action: string, entity_type: string, entity_id?: string) => {
    await supabase.from("audit_logs").insert({ admin_id: user?.id, action, entity_type, entity_id });
  };

  const handleEdit = (r: any) => {
    setForm({
      title: r.title, description: r.description || "", category: r.category,
      file_type: r.file_type, file_url: r.file_url || "", is_featured: r.is_featured,
      is_published: r.is_published, visibility: r.visibility || "public",
      expires_at: r.expires_at ? r.expires_at.split("T")[0] : "",
    });
    setEditId(r.id);
    setDialogOpen(true);
  };

  const handleSoftDelete = async (id: string) => {
    await supabase.from("resources").update({ is_deleted: true, deleted_at: new Date().toISOString() }).eq("id", id);
    await logAction("resource_soft_deleted", "resource", id);
    toast({ title: "Resource moved to trash" });
    setDeleteConfirm(null);
    load();
  };

  const handleRestore = async (id: string) => {
    await supabase.from("resources").update({ is_deleted: false, deleted_at: null }).eq("id", id);
    await logAction("resource_restored", "resource", id);
    toast({ title: "Resource restored" });
    load();
  };

  const handlePermanentDelete = async (id: string) => {
    await supabase.from("resources").delete().eq("id", id);
    await logAction("resource_permanently_deleted", "resource", id);
    toast({ title: "Resource permanently deleted" });
    setDeleteConfirm(null);
    load();
  };

  const showVersionHistory = async (resourceId: string) => {
    const { data } = await supabase.from("resource_versions").select("*").eq("resource_id", resourceId).order("created_at", { ascending: false });
    setVersionHistory(data || []);
    setVersionDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditId(null);
    setForm({ ...emptyForm });
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold"><span className="text-gradient-primary">Manage Resources</span></h1>
            <p className="text-muted-foreground">Create, edit, and manage educational content</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) closeDialog(); else setDialogOpen(true); }}>
            <DialogTrigger asChild>
              <Button className="glow-primary"><Plus className="mr-2 h-4 w-4" /> Add Resource</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display">{editId ? "Edit" : "Create"} Resource</DialogTitle>
                <DialogDescription>Fill in the resource details below</DialogDescription>
              </DialogHeader>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Visibility</Label>
                    <Select value={form.visibility} onValueChange={(v) => setForm({ ...form, visibility: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public"><div className="flex items-center gap-2"><Eye className="h-3 w-3" /> Public</div></SelectItem>
                        <SelectItem value="admin"><div className="flex items-center gap-2"><EyeOff className="h-3 w-3" /> Admin Only</div></SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Expiry Date (optional)</Label>
                    <Input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
                  </div>
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <Label>Upload File</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                    <input type="file" id="resource-file" className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp,.mp4,.webm" />
                    <label htmlFor="resource-file" className="cursor-pointer flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{uploading ? "Uploading..." : "Click to upload (max 50MB)"}</span>
                      <span className="text-xs text-muted-foreground">PDF, DOCX, PPT, XLSX, Images, Videos</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2"><Label>File URL</Label><Input value={form.file_url} onChange={(e) => setForm({ ...form, file_url: e.target.value })} placeholder="https://... or uploaded automatically" /></div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} /> Featured</label>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} /> Published</label>
                </div>
                <Button onClick={handleSave} className="w-full" disabled={uploading}>{editId ? "Update" : "Create"} Resource</Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active" className="gap-2"><FileText className="h-4 w-4" /> Active ({resources.length})</TabsTrigger>
            <TabsTrigger value="trash" className="gap-2"><Trash2 className="h-4 w-4" /> Trash ({deletedResources.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {loading ? (
              <div className="space-y-4">{[1,2,3].map(i => <Card key={i} className="glass-card animate-pulse"><CardContent className="p-6 h-20" /></Card>)}</div>
            ) : resources.length === 0 ? (
              <Card className="glass-card"><CardContent className="p-12 text-center"><BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">No resources yet.</p></CardContent></Card>
            ) : (
              <div className="space-y-3">
                {resources.map((r, i) => (
                  <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                    <Card className="glass-card">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold truncate">{r.title}</p>
                            {r.is_featured && <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded">Featured</span>}
                            {!r.is_published && <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded">Draft</span>}
                            {r.visibility === "admin" && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">Admin Only</span>}
                            {r.expires_at && new Date(r.expires_at) < new Date() && <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded flex items-center gap-1"><Clock className="h-3 w-3" /> Expired</span>}
                          </div>
                          <p className="text-sm text-muted-foreground capitalize">{r.category.replace("-", " ")} · {r.file_type}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => showVersionHistory(r.id)} title="Version history"><History className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(r)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm({ id: r.id, permanent: false })}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="trash">
            {deletedResources.length === 0 ? (
              <Card className="glass-card"><CardContent className="p-12 text-center"><Trash2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">Trash is empty.</p></CardContent></Card>
            ) : (
              <div className="space-y-3">
                {deletedResources.map((r) => (
                  <Card key={r.id} className="glass-card opacity-75">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{r.title}</p>
                        <p className="text-sm text-muted-foreground">Deleted {r.deleted_at ? new Date(r.deleted_at).toLocaleDateString() : ""}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleRestore(r.id)}><RotateCcw className="mr-1 h-3 w-3" /> Restore</Button>
                        <Button variant="destructive" size="sm" onClick={() => setDeleteConfirm({ id: r.id, permanent: true })}><Trash2 className="mr-1 h-3 w-3" /> Delete Forever</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteConfirm} onOpenChange={(o) => !o && setDeleteConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /> {deleteConfirm?.permanent ? "Permanently Delete?" : "Move to Trash?"}</AlertDialogTitle>
              <AlertDialogDescription>
                {deleteConfirm?.permanent ? "This action cannot be undone. The resource will be permanently removed." : "The resource will be moved to trash and can be restored later."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteConfirm?.permanent ? handlePermanentDelete(deleteConfirm.id) : handleSoftDelete(deleteConfirm!.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {deleteConfirm?.permanent ? "Delete Forever" : "Move to Trash"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Version History Dialog */}
        <Dialog open={versionDialogOpen} onOpenChange={setVersionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">Version History</DialogTitle>
              <DialogDescription>Track changes to this resource</DialogDescription>
            </DialogHeader>
            {versionHistory.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No version history.</p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {versionHistory.map((v) => (
                  <div key={v.id} className="p-3 rounded-lg bg-muted/50 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Version {v.version_number}</span>
                      <span className="text-xs text-muted-foreground">{new Date(v.created_at).toLocaleString()}</span>
                    </div>
                    {v.file_url && <p className="text-xs text-muted-foreground truncate mt-1">{v.file_url}</p>}
                  </div>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
