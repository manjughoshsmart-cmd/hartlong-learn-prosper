import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function AdminAnalytics() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold mb-2"><span className="text-gradient-primary">Analytics</span></h1>
          <p className="text-muted-foreground mb-8">Platform engagement and usage statistics</p>
          <Card className="glass-card">
            <CardContent className="p-12 text-center">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Analytics dashboard with charts coming soon. Data is being collected.</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
