import { useState } from "react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Target } from "lucide-react";

export default function RiskRewardCalculator() {
  const [entry, setEntry] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [target, setTarget] = useState("");
  const [result, setResult] = useState<{ risk: number; reward: number; ratio: number } | null>(null);

  const calculate = () => {
    const e = parseFloat(entry);
    const sl = parseFloat(stopLoss);
    const tp = parseFloat(target);
    if (isNaN(e) || isNaN(sl) || isNaN(tp) || e <= sl || tp <= e) return;
    const risk = e - sl;
    const reward = tp - e;
    const ratio = reward / risk;
    setResult({ risk, reward, ratio });
  };

  return (
    <Layout>
      <SEOHead
        title="Risk-Reward Calculator – Evaluate Your Trades"
        description="Instantly calculate risk-reward ratio for any trade. Know if a trade is worth taking before you enter. Free tool by HartLong."
        canonical="/tools/risk-reward"
      />
      <div className="container mx-auto px-4 py-12 max-w-lg">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Target className="h-4 w-4" /> Risk : Reward
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">Risk-Reward Calculator</h1>
          <p className="text-muted-foreground">Evaluate if a trade is worth taking based on the risk-reward ratio.</p>
        </motion.div>

        <Card className="glass-card">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="entry">Entry Price (₹)</Label>
              <Input id="entry" type="number" placeholder="e.g. 500" value={entry} onChange={e => setEntry(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sl">Stop Loss (₹)</Label>
              <Input id="sl" type="number" placeholder="e.g. 480" value={stopLoss} onChange={e => setStopLoss(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target">Target Price (₹)</Label>
              <Input id="target" type="number" placeholder="e.g. 550" value={target} onChange={e => setTarget(e.target.value)} />
            </div>
            <Button onClick={calculate} className="w-full">Calculate</Button>

            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 rounded-lg border p-5 space-y-3"
                style={{
                  backgroundColor: result.ratio >= 2 ? "hsl(var(--primary) / 0.08)" : "hsl(var(--destructive) / 0.08)",
                  borderColor: result.ratio >= 2 ? "hsl(var(--primary) / 0.25)" : "hsl(var(--destructive) / 0.25)",
                }}
              >
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">Risk</span>
                  <span className="font-display font-bold text-lg">₹{result.risk.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">Reward</span>
                  <span className="font-display font-bold text-lg">₹{result.reward.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <span className="text-muted-foreground text-sm">Ratio</span>
                  <span
                    className="font-display font-bold text-xl"
                    style={{ color: result.ratio >= 2 ? "hsl(var(--primary))" : "hsl(var(--destructive))" }}
                  >
                    1 : {result.ratio.toFixed(1)}
                  </span>
                </div>
                <p className="text-xs text-center" style={{ color: result.ratio >= 2 ? "hsl(var(--primary))" : "hsl(var(--destructive))" }}>
                  {result.ratio >= 2 ? "✅ Favorable trade setup" : "⚠️ Risk-reward is below 1:2"}
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
