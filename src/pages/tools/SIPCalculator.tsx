import { useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";

export default function SIPCalculator() {
  const [monthly, setMonthly] = useState(5000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);

  const months = years * 12;
  const monthlyRate = rate / 100 / 12;
  const futureValue = monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
  const invested = monthly * months;
  const returns = futureValue - invested;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold mb-2"><span className="text-gradient-primary">SIP Calculator</span></h1>
          <p className="text-muted-foreground mb-8">Calculate your Systematic Investment Plan returns</p>

          <Card className="glass-card mb-6">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Monthly Investment (₹)</Label>
                <Input type="number" value={monthly} onChange={(e) => setMonthly(Number(e.target.value))} min={100} />
              </div>
              <div className="space-y-2">
                <Label>Expected Annual Return (%)</Label>
                <Input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} min={1} max={50} step={0.5} />
              </div>
              <div className="space-y-2">
                <Label>Time Period (Years)</Label>
                <Input type="number" value={years} onChange={(e) => setYears(Number(e.target.value))} min={1} max={40} />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="glass-card"><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Invested</p><p className="font-display text-xl font-bold text-foreground">₹{invested.toLocaleString("en-IN")}</p></CardContent></Card>
            <Card className="glass-card"><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Returns</p><p className="font-display text-xl font-bold text-primary">₹{Math.round(returns).toLocaleString("en-IN")}</p></CardContent></Card>
            <Card className="glass-card glow-primary"><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Total Value</p><p className="font-display text-xl font-bold text-primary">₹{Math.round(futureValue).toLocaleString("en-IN")}</p></CardContent></Card>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
