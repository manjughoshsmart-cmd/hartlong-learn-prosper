import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";

const ADMIN_SECRET = "SUBHAJIT_GOD";

export default function AdminRegister() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secretCode, setSecretCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (secretCode !== ADMIN_SECRET) {
      toast({ title: "Invalid secret code", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    
    // Use edge function for secure admin registration
    const { data, error } = await supabase.functions.invoke("register-admin", {
      body: { email, password, secretCode },
    });
    
    setLoading(false);
    if (error || data?.error) {
      toast({ title: "Registration failed", description: data?.error || error?.message, variant: "destructive" });
    } else {
      toast({ title: "Admin account created!", description: "Check your email for verification." });
      navigate("/admin/login");
    }
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Card className="glass-card border-accent/30">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 rounded-full bg-accent/10 p-3 w-fit">
                <Shield className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="font-display text-2xl">Admin Registration</CardTitle>
              <CardDescription>Create an admin account with authorization</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm Password</Label>
                  <Input id="confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secret">Secret Code</Label>
                  <Input id="secret" type="password" value={secretCode} onChange={(e) => setSecretCode(e.target.value)} required placeholder="Enter admin authorization code" />
                </div>
                <Button type="submit" className="w-full glow-gold bg-accent text-accent-foreground hover:bg-accent/90" disabled={loading}>
                  <Shield className="mr-2 h-4 w-4" /> {loading ? "Creating..." : "Register as Admin"}
                </Button>
              </form>
              <p className="text-sm text-muted-foreground text-center mt-4">
                Already an admin? <Link to="/admin/login" className="text-accent hover:underline">Admin Login</Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
