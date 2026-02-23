import { useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProfitLossCalculator() {
  const [buyPrice, setBuyPrice] = useState(100);
  const [sellPrice, setSellPrice] = useState(120);
  const [qty, setQty] = useState(10);

  const pl = (sellPrice - buyPrice) * qty;
  const pct = buyPrice > 0 ? ((sellPrice - buyPrice) / buyPrice) * 100 : 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold mb-2"><span className="text-gradient-primary">Profit/Loss Calculator</span></h1>
          <p className="text-muted-foreground mb-8">Calculate your trading profit or loss</p>
          <Card className="glass-card mb-6">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2"><Label>Buy Price (₹)</Label><Input type="number" value={buyPrice} onChange={(e) => setBuyPrice(Number(e.target.value))} /></div>
              <div className="space-y-2"><Label>Sell Price (₹)</Label><Input type="number" value={sellPrice} onChange={(e) => setSellPrice(Number(e.target.value))} /></div>
              <div className="space-y-2"><Label>Quantity</Label><Input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} min={1} /></div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className={`glass-card ${pl >= 0 ? "glow-primary" : ""}`}>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">{pl >= 0 ? "Profit" : "Loss"}</p>
                <p className={`font-display text-2xl font-bold ${pl >= 0 ? "text-primary" : "text-destructive"}`}>
                  {pl >= 0 ? "+" : ""}₹{Math.abs(pl).toLocaleString("en-IN")}
                </p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Return %</p>
                <p className={`font-display text-2xl font-bold ${pct >= 0 ? "text-primary" : "text-destructive"}`}>
                  {pct >= 0 ? "+" : ""}{pct.toFixed(2)}%
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
