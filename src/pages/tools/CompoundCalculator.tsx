import { useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CompoundCalculator() {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(10);
  const [years, setYears] = useState(5);
  const [freq, setFreq] = useState(4);

  const amount = principal * Math.pow(1 + rate / 100 / freq, freq * years);
  const interest = amount - principal;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold mb-2"><span className="text-gradient-primary">Compound Interest</span></h1>
          <p className="text-muted-foreground mb-8">See the power of compounding</p>
          <Card className="glass-card mb-6">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2"><Label>Principal (₹)</Label><Input type="number" value={principal} onChange={(e) => setPrincipal(Number(e.target.value))} min={1} /></div>
              <div className="space-y-2"><Label>Annual Rate (%)</Label><Input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} min={0.1} step={0.5} /></div>
              <div className="space-y-2"><Label>Time (Years)</Label><Input type="number" value={years} onChange={(e) => setYears(Number(e.target.value))} min={1} /></div>
              <div className="space-y-2"><Label>Compounding Frequency (per year)</Label><Input type="number" value={freq} onChange={(e) => setFreq(Number(e.target.value))} min={1} max={365} /></div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="glass-card"><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Principal</p><p className="font-display text-xl font-bold">₹{principal.toLocaleString("en-IN")}</p></CardContent></Card>
            <Card className="glass-card"><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Interest Earned</p><p className="font-display text-xl font-bold text-primary">₹{Math.round(interest).toLocaleString("en-IN")}</p></CardContent></Card>
            <Card className="glass-card glow-primary"><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Total Amount</p><p className="font-display text-xl font-bold text-primary">₹{Math.round(amount).toLocaleString("en-IN")}</p></CardContent></Card>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
