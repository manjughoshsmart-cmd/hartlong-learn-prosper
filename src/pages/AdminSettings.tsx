import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import PasswordStrengthIndicator, { validatePasswordStrength } from "@/components/PasswordStrengthIndicator";
import { Settings, Lock, Palette, Eye, EyeOff, Save, Shield, ScrollText, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminSettings() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Branding
  const [branding, setBranding] = useState({ site_name: "", tagline: "", logo_url: "" });
  const [savingBranding, setSavingBranding] = useState(false);

  // Audit logs
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  useEffect(() => {
    loadBranding();
    loadAuditLogs();
  }, []);

  const loadBranding = async () => {
    const { data } = await supabase.from("site_settings").select("*").eq("key", "branding").maybeSingle();
    if (data?.value) {
      const v = data.value as any;
      setBranding({ site_name: v.site_name || "", tagline: v.tagline || "", logo_url: v.logo_url || "" });
    }
  };

  const loadAuditLogs = async () => {
    const { data } = await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(50);
    setAuditLogs(data || []);
    setLogsLoading(false);
  };

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword || !currentPassword) {
      toast({ title: "All fields required", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (!validatePasswordStrength(newPassword)) {
      toast({ title: "Password doesn't meet requirements", variant: "destructive" });
      return;
    }

    setChangingPassword(true);

    // Verify current password by re-signing in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user?.email || "",
      password: currentPassword,
    });

    if (signInError) {
      toast({ title: "Current password is incorrect", variant: "destructive" });
      setChangingPassword(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast({ title: "Failed to update password", description: error.message, variant: "destructive" });
    } else {
      // Log the action
      await supabase.from("audit_logs").insert({
        admin_id: user?.id,
        action: "password_changed",
        entity_type: "admin",
        entity_id: user?.id,
        details: { timestamp: new Date().toISOString() },
      });

      toast({ title: "Password updated successfully. You will be signed out." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      // Sign out all sessions
      setTimeout(() => signOut(), 2000);
    }
    setChangingPassword(false);
  };

  const handleSaveBranding = async () => {
    setSavingBranding(true);
    const { error } = await supabase.from("site_settings").update({
      value: branding,
      updated_by: user?.id,
      updated_at: new Date().toISOString(),
    }).eq("key", "branding");

    if (error) {
      toast({ title: "Failed to save", description: error.message, variant: "destructive" });
    } else {
      await supabase.from("audit_logs").insert({
        admin_id: user?.id,
        action: "branding_updated",
        entity_type: "site_settings",
        entity_id: "branding",
        details: branding,
      });
      toast({ title: "Branding saved!" });
    }
    setSavingBranding(false);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-6">
            <Link to="/admin/dashboard">
              <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
            </Link>
            <div>
              <h1 className="font-display text-3xl font-bold"><span className="text-gradient-primary">Settings</span></h1>
              <p className="text-muted-foreground">Platform configuration and security</p>
            </div>
          </div>

          <Tabs defaultValue="security" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="security" className="gap-2"><Lock className="h-4 w-4" /> Security</TabsTrigger>
              <TabsTrigger value="branding" className="gap-2"><Palette className="h-4 w-4" /> Branding</TabsTrigger>
              <TabsTrigger value="audit" className="gap-2"><ScrollText className="h-4 w-4" /> Audit Logs</TabsTrigger>
            </TabsList>

            {/* Security Tab */}
            <TabsContent value="security">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-2"><Shield className="h-5 w-5" /> Change Password</CardTitle>
                  <CardDescription>Update your admin password. You'll be signed out after changing.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <div className="relative">
                      <Input type={showCurrent ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                      <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <div className="relative">
                      <Input type={showNew ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                      <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {newPassword && <PasswordStrengthIndicator password={newPassword} />}
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm New Password</Label>
                    <div className="relative">
                      <Input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-destructive">Passwords don't match</p>
                    )}
                  </div>
                  <Button onClick={handlePasswordChange} disabled={changingPassword} className="w-full">
                    <Lock className="mr-2 h-4 w-4" /> {changingPassword ? "Updating..." : "Change Password"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Branding Tab */}
            <TabsContent value="branding">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-2"><Palette className="h-5 w-5" /> Branding</CardTitle>
                  <CardDescription>Configure your platform's identity</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Site Name</Label>
                    <Input value={branding.site_name} onChange={(e) => setBranding({ ...branding, site_name: e.target.value })} placeholder="HartLong" />
                  </div>
                  <div className="space-y-2">
                    <Label>Tagline</Label>
                    <Input value={branding.tagline} onChange={(e) => setBranding({ ...branding, tagline: e.target.value })} placeholder="Decode the Market" />
                  </div>
                  <div className="space-y-2">
                    <Label>Logo URL</Label>
                    <Input value={branding.logo_url} onChange={(e) => setBranding({ ...branding, logo_url: e.target.value })} placeholder="https://..." />
                  </div>
                  <Button onClick={handleSaveBranding} disabled={savingBranding} className="w-full">
                    <Save className="mr-2 h-4 w-4" /> {savingBranding ? "Saving..." : "Save Branding"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Audit Logs Tab */}
            <TabsContent value="audit">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-2"><ScrollText className="h-5 w-5" /> Audit Logs</CardTitle>
                  <CardDescription>Track all admin actions</CardDescription>
                </CardHeader>
                <CardContent>
                  {logsLoading ? (
                    <p className="text-muted-foreground text-center py-8">Loading logs...</p>
                  ) : auditLogs.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No audit logs yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-[500px] overflow-y-auto">
                      {auditLogs.map((log) => (
                        <div key={log.id} className="flex items-start justify-between p-3 rounded-lg bg-muted/50 text-sm">
                          <div>
                            <p className="font-medium capitalize">{log.action.replace(/_/g, " ")}</p>
                            <p className="text-xs text-muted-foreground">{log.entity_type} {log.entity_id ? `· ${log.entity_id.slice(0, 8)}` : ""}</p>
                          </div>
                          <p className="text-xs text-muted-foreground whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </Layout>
  );
}
