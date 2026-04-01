import { useState } from "react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";

export default function PositionSizeCalculator() {
  const [balance, setBalance] = useState("");
  const [riskPct, setRiskPct] = useState("");
  const [entry, setEntry] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [result, setResult] = useState<{ riskAmount: number; positionSize: number } | null>(null);

  const calculate = () => {
    const b = parseFloat(balance);
    const r = parseFloat(riskPct);
    const e = parseFloat(entry);
    const sl = parseFloat(stopLoss);
    if (isNaN(b) || isNaN(r) || isNaN(e) || isNaN(sl) || e <= sl) return;
    const riskAmount = b * (r / 100);
    const positionSize = riskAmount / (e - sl);
    setResult({ riskAmount, positionSize });
  };

  return (
    <Layout>
      <SEOHead
        title="Position Size Calculator – Smart Risk Management"
        description="Calculate your ideal position size based on account balance, risk percentage, entry price, and stop loss. Trade smarter with HartLong."
        canonical="/tools/position-size"
      />
      <div className="container mx-auto px-4 py-12 max-w-lg">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Shield className="h-4 w-4" /> Position Size
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">Position Size Calculator</h1>
          <p className="text-muted-foreground">Calculate how many shares to buy based on your risk tolerance.</p>
        </motion.div>

        <Card className="glass-card">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="balance">Account Balance (₹)</Label>
              <Input id="balance" type="number" placeholder="e.g. 100000" value={balance} onChange={e => setBalance(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="risk">Risk Percentage (%)</Label>
              <Input id="risk" type="number" placeholder="e.g. 2" value={riskPct} onChange={e => setRiskPct(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="entry">Entry Price (₹)</Label>
              <Input id="entry" type="number" placeholder="e.g. 500" value={entry} onChange={e => setEntry(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sl">Stop Loss Price (₹)</Label>
              <Input id="sl" type="number" placeholder="e.g. 480" value={stopLoss} onChange={e => setStopLoss(e.target.value)} />
            </div>
            <Button onClick={calculate} className="w-full">Calculate</Button>

            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 rounded-lg bg-primary/10 border border-primary/20 p-5 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">Risk Amount</span>
                  <span className="font-display font-bold text-lg text-primary">₹{result.riskAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">Position Size</span>
                  <span className="font-display font-bold text-lg text-primary">{Math.floor(result.positionSize)} shares</span>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
