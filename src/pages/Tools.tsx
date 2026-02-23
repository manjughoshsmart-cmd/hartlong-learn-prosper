import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, TrendingUp, Percent, DollarSign, BarChart3 } from "lucide-react";

const tools = [
  { title: "SIP Calculator", desc: "Calculate returns on Systematic Investment Plans", path: "/tools/sip", icon: TrendingUp },
  { title: "Compound Interest", desc: "See the power of compounding on your investments", path: "/tools/compound", icon: Percent },
  { title: "Profit/Loss", desc: "Calculate your trading profit or loss instantly", path: "/tools/profit-loss", icon: DollarSign },
  { title: "Brokerage Calculator", desc: "Estimate brokerage fees for your trades", path: "/tools/brokerage", icon: BarChart3 },
];

export default function Tools() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Calculator className="h-4 w-4" /> Trading Calculators
          </div>
          <h1 className="font-display text-3xl lg:text-4xl font-bold mb-2">
            Smart <span className="text-gradient-primary">Trading Tools</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">Make informed decisions with our suite of financial calculators.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {tools.map((t, i) => (
            <motion.div key={t.path} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Link to={t.path}>
                <Card className="glass-card hover:glow-primary transition-all cursor-pointer h-full group">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="rounded-full bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
                      <t.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold group-hover:text-primary transition-colors">{t.title}</h3>
                      <p className="text-sm text-muted-foreground">{t.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
