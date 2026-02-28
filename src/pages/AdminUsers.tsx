import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Users, Shield, Ban } from "lucide-react";

export default function AdminUsers() {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    const { data: roles } = await supabase.from("user_roles").select("*");
    const merged = (profiles || []).map(p => ({
      ...p,
      roles: (roles || []).filter(r => r.user_id === p.user_id).map(r => r.role),
    }));
    setUsers(merged);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const promoteToAdmin = async (userId: string) => {
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "User promoted to admin" }); load(); }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-3xl font-bold"><span className="text-gradient-primary">Manage Users</span></h1>
          <p className="text-muted-foreground">View and manage platform users</p>
        </motion.div>

        {loading ? (
          <div className="space-y-4">{[1,2,3].map(i => <Card key={i} className="glass-card animate-pulse"><CardContent className="p-6 h-20" /></Card>)}</div>
        ) : (
          <div className="space-y-3">
            {users.map((u, i) => (
              <motion.div key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                <Card className="glass-card">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{u.display_name}</p>
                      <div className="flex gap-2 mt-1">
                        {u.roles.map((r: string) => (
                          <span key={r} className={`text-xs px-2 py-0.5 rounded ${r === "admin" ? "bg-accent/20 text-accent" : "bg-primary/10 text-primary"}`}>
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                    {!u.roles.includes("admin") && (
                      <Button variant="outline" size="sm" onClick={() => promoteToAdmin(u.user_id)}>
                        <Shield className="mr-2 h-3 w-3" /> Make Admin
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
