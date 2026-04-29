import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Shield, ShieldOff, Trash2, Eye, Search, User as UserIcon, Bookmark, Download as DownloadIcon, MessageSquare, Mail, Calendar, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UserRow {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
  roles: string[];
}

export default function AdminUsers() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<UserRow | null>(null);
  const [detailUser, setDetailUser] = useState<UserRow | null>(null);
  const [detailData, setDetailData] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    const { data: roles } = await supabase.from("user_roles").select("*");
    const merged: UserRow[] = (profiles || []).map((p: any) => ({
      ...p,
      roles: (roles || []).filter((r: any) => r.user_id === p.user_id).map((r: any) => r.role),
    }));
    setUsers(merged);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const callAction = async (action: "promote" | "demote" | "delete" | "details", target_user_id: string) => {
    const { data, error } = await supabase.functions.invoke("admin-manage-user", {
      body: { action, target_user_id },
    });
    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error);
    return data;
  };

  const promote = async (u: UserRow) => {
    setBusyId(u.user_id);
    try { await callAction("promote", u.user_id); toast({ title: `${u.display_name} promoted to admin` }); await load(); }
    catch (e: any) { toast({ title: "Promotion failed", description: e.message, variant: "destructive" }); }
    finally { setBusyId(null); }
  };

  const demote = async (u: UserRow) => {
    setBusyId(u.user_id);
    try { await callAction("demote", u.user_id); toast({ title: `${u.display_name} demoted to user` }); await load(); }
    catch (e: any) { toast({ title: "Demotion failed", description: e.message, variant: "destructive" }); }
    finally { setBusyId(null); }
  };

  const removeUser = async (u: UserRow) => {
    setBusyId(u.user_id);
    try { await callAction("delete", u.user_id); toast({ title: `${u.display_name} deleted` }); setConfirmDelete(null); await load(); }
    catch (e: any) { toast({ title: "Delete failed", description: e.message, variant: "destructive" }); }
    finally { setBusyId(null); }
  };

  const openDetails = async (u: UserRow) => {
    setDetailUser(u);
    setDetailLoading(true);
    setDetailData(null);
    try {
      const data = await callAction("details", u.user_id);
      setDetailData(data);
    } catch (e: any) {
      toast({ title: "Failed to load profile", description: e.message, variant: "destructive" });
    } finally {
      setDetailLoading(false);
    }
  };

  const filtered = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (u.display_name || "").toLowerCase().includes(q) || u.user_id.toLowerCase().includes(q);
  });

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="font-display text-3xl font-bold"><span className="text-gradient-primary">Manage Users</span></h1>
          <p className="text-muted-foreground">View, promote, demote, and remove platform users</p>
        </motion.div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or ID..." className="pl-9" />
        </div>

        {loading ? (
          <div className="space-y-4">{[1,2,3].map(i => <Card key={i} className="glass-card animate-pulse"><CardContent className="p-6 h-20" /></Card>)}</div>
        ) : filtered.length === 0 ? (
          <Card className="glass-card"><CardContent className="p-12 text-center text-muted-foreground">No users found.</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((u, i) => {
              const isAdmin = u.roles.includes("admin");
              const isSelf = currentUser?.id === u.user_id;
              const busy = busyId === u.user_id;
              return (
                <motion.div key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                  <Card className="glass-card">
                    <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={u.avatar_url || undefined} />
                          <AvatarFallback>{(u.display_name || "?").slice(0, 1).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{u.display_name || "Unnamed"} {isSelf && <span className="text-xs text-muted-foreground">(you)</span>}</p>
                          <div className="flex gap-2 mt-1 flex-wrap">
                            {u.roles.map((r) => (
                              <span key={r} className={`text-xs px-2 py-0.5 rounded ${r === "admin" ? "bg-accent/20 text-accent" : "bg-primary/10 text-primary"}`}>
                                {r}
                              </span>
                            ))}
                            <span className="text-xs text-muted-foreground">Joined {new Date(u.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Button variant="outline" size="sm" onClick={() => openDetails(u)} disabled={busy}>
                          <Eye className="mr-1 h-3 w-3" /> View
                        </Button>
                        {isAdmin ? (
                          <Button variant="outline" size="sm" onClick={() => demote(u)} disabled={busy || isSelf} title={isSelf ? "You cannot demote yourself" : ""}>
                            <ShieldOff className="mr-1 h-3 w-3" /> Demote
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => promote(u)} disabled={busy}>
                            <Shield className="mr-1 h-3 w-3" /> Make Admin
                          </Button>
                        )}
                        <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(u)} disabled={busy || isSelf} title={isSelf ? "You cannot delete yourself" : ""}>
                          <Trash2 className="mr-1 h-3 w-3" /> Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Delete confirm */}
        <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Permanently delete this user?</AlertDialogTitle>
              <AlertDialogDescription>
                This removes <strong>{confirmDelete?.display_name}</strong> along with all their bookmarks, comments, downloads, notifications, avatar, and roles. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => confirmDelete && removeUser(confirmDelete)}
              >
                Delete user
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Details dialog */}
        <Dialog open={!!detailUser} onOpenChange={(o) => { if (!o) { setDetailUser(null); setDetailData(null); } }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw]">
            <DialogHeader>
              <DialogTitle className="font-display flex items-center gap-2"><UserIcon className="h-5 w-5" /> User Profile</DialogTitle>
              <DialogDescription>Detailed activity and account information</DialogDescription>
            </DialogHeader>
            {detailLoading || !detailData ? (
              <p className="text-muted-foreground text-center py-8">{detailLoading ? "Loading profile..." : "No data."}</p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={detailData.profile?.avatar_url || undefined} />
                    <AvatarFallback>{(detailData.profile?.display_name || "?").slice(0,1).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-lg">{detailData.profile?.display_name || "Unnamed"}</p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {(detailData.roles || []).map((r: string) => (
                        <span key={r} className={`text-xs px-2 py-0.5 rounded ${r === "admin" ? "bg-accent/20 text-accent" : "bg-primary/10 text-primary"}`}>{r}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/40"><Mail className="h-4 w-4 text-muted-foreground" /><span className="truncate">{detailData.email || "—"}</span></div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/40"><Calendar className="h-4 w-4 text-muted-foreground" /><span>Joined {detailData.created_at ? new Date(detailData.created_at).toLocaleDateString() : "—"}</span></div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/40 sm:col-span-2"><Clock className="h-4 w-4 text-muted-foreground" /><span>Last sign-in: {detailData.last_sign_in_at ? new Date(detailData.last_sign_in_at).toLocaleString() : "Never"}</span></div>
                </div>
                <Tabs defaultValue="downloads" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="downloads" className="gap-1"><DownloadIcon className="h-3 w-3" /> Downloads ({detailData.downloads?.length || 0})</TabsTrigger>
                    <TabsTrigger value="bookmarks" className="gap-1"><Bookmark className="h-3 w-3" /> Bookmarks ({detailData.bookmarks?.length || 0})</TabsTrigger>
                    <TabsTrigger value="comments" className="gap-1"><MessageSquare className="h-3 w-3" /> Comments ({detailData.comments?.length || 0})</TabsTrigger>
                  </TabsList>
                  <TabsContent value="downloads">
                    <ActivityList items={detailData.downloads} dateKey="downloaded_at" emptyText="No downloads yet." />
                  </TabsContent>
                  <TabsContent value="bookmarks">
                    <ActivityList items={detailData.bookmarks} dateKey="created_at" emptyText="No bookmarks yet." />
                  </TabsContent>
                  <TabsContent value="comments">
                    <ActivityList items={detailData.comments} dateKey="created_at" emptyText="No comments yet." showContent />
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

function ActivityList({ items, dateKey, emptyText, showContent }: { items: any[]; dateKey: string; emptyText: string; showContent?: boolean }) {
  if (!items || items.length === 0) {
    return <p className="text-muted-foreground text-center py-6 text-sm">{emptyText}</p>;
  }
  return (
    <div className="space-y-2 max-h-[300px] overflow-y-auto mt-2">
      {items.map((it) => (
        <div key={it.id} className="p-3 rounded-lg bg-muted/40 text-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium truncate">{it.title}</p>
            <p className="text-xs text-muted-foreground whitespace-nowrap">{new Date(it[dateKey]).toLocaleDateString()}</p>
          </div>
          {showContent && it.content && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{it.content}</p>}
        </div>
      ))}
    </div>
  );
}
