import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function AdminSettings() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold mb-2"><span className="text-gradient-primary">Settings</span></h1>
          <p className="text-muted-foreground mb-8">Platform configuration and preferences</p>
          <Card className="glass-card">
            <CardContent className="p-12 text-center">
              <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Admin settings panel coming soon.</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
