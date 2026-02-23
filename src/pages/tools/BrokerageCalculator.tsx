import { useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function BrokerageCalculator() {
  const [buyPrice, setBuyPrice] = useState(500);
  const [sellPrice, setSellPrice] = useState(520);
  const [qty, setQty] = useState(100);
  const [brokerageRate, setBrokerageRate] = useState(0.03);

  const turnover = (buyPrice + sellPrice) * qty;
  const brokerage = turnover * (brokerageRate / 100);
  const stt = sellPrice * qty * 0.001;
  const transCharges = turnover * 0.0000345;
  const gst = (brokerage + transCharges) * 0.18;
  const sebi = turnover * 0.000001;
  const stampDuty = buyPrice * qty * 0.00015;
  const totalCharges = brokerage + stt + transCharges + gst + sebi + stampDuty;
  const netPL = (sellPrice - buyPrice) * qty - totalCharges;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold mb-2"><span className="text-gradient-primary">Brokerage Calculator</span></h1>
          <p className="text-muted-foreground mb-8">Estimate trading costs and net returns</p>
          <Card className="glass-card mb-6">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2"><Label>Buy Price (₹)</Label><Input type="number" value={buyPrice} onChange={(e) => setBuyPrice(Number(e.target.value))} /></div>
              <div className="space-y-2"><Label>Sell Price (₹)</Label><Input type="number" value={sellPrice} onChange={(e) => setSellPrice(Number(e.target.value))} /></div>
              <div className="space-y-2"><Label>Quantity</Label><Input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} min={1} /></div>
              <div className="space-y-2"><Label>Brokerage Rate (%)</Label><Input type="number" value={brokerageRate} onChange={(e) => setBrokerageRate(Number(e.target.value))} step={0.01} /></div>
            </CardContent>
          </Card>
          <div className="space-y-3">
            {[
              { label: "Brokerage", value: brokerage },
              { label: "STT", value: stt },
              { label: "Transaction Charges", value: transCharges },
              { label: "GST", value: gst },
              { label: "SEBI Charges", value: sebi },
              { label: "Stamp Duty", value: stampDuty },
            ].map((item) => (
              <div key={item.label} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <span>₹{item.value.toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-3 flex justify-between font-semibold">
              <span>Total Charges</span>
              <span className="text-destructive">₹{totalCharges.toFixed(2)}</span>
            </div>
            <Card className={`glass-card ${netPL >= 0 ? "glow-primary" : ""}`}>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Net P&L</p>
                <p className={`font-display text-2xl font-bold ${netPL >= 0 ? "text-primary" : "text-destructive"}`}>
                  {netPL >= 0 ? "+" : ""}₹{Math.abs(netPL).toFixed(2)}
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
