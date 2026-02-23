import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  TrendingUp,
  BarChart3,
  PieChart,
  LineChart,
  BookOpen,
  Calculator,
  Shield,
  Users,
  ArrowRight,
  Zap,
  Target,
  Award,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const },
  }),
};

const categories = [
  { icon: TrendingUp, title: "Equity", desc: "Master stock market fundamentals and trading strategies", path: "/equity", color: "text-primary" },
  { icon: BarChart3, title: "Options", desc: "Learn options trading from basic to advanced strategies", path: "/option", color: "text-accent" },
  { icon: PieChart, title: "Mutual Funds", desc: "Smart investment strategies for wealth building", path: "/mutual-fund", color: "text-chart-3" },
  { icon: LineChart, title: "ETFs", desc: "Diversify your portfolio with exchange-traded funds", path: "/etf", color: "text-chart-4" },
];

const features = [
  { icon: BookOpen, title: "Expert Content", desc: "Curated videos, PDFs, and articles from industry professionals" },
  { icon: Calculator, title: "Smart Tools", desc: "SIP, compound interest, P&L, and brokerage calculators" },
  { icon: Shield, title: "Secure Platform", desc: "Enterprise-grade security for your learning journey" },
  { icon: Users, title: "Community", desc: "Engage with fellow traders through comments and discussions" },
];

const stats = [
  { value: "10K+", label: "Active Learners" },
  { value: "500+", label: "Resources" },
  { value: "50+", label: "Expert Videos" },
  { value: "98%", label: "Satisfaction" },
];

export default function Index() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="h-4 w-4" /> Premium Trading Education Platform
            </motion.div>
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6"
            >
              Master the Art of{" "}
              <span className="text-gradient-primary">Smart Trading</span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Learn equity, options, mutual funds and ETFs with expert-curated content,
              interactive tools, and a thriving community of traders.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="glow-primary text-lg px-8">
                <Link to="/register">
                  Start Learning Free <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8">
                <Link to="/resources">Browse Resources</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="font-display text-3xl lg:text-4xl font-bold text-gradient-primary">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
              What Would You Like to <span className="text-gradient-primary">Learn?</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose from our comprehensive trading categories, each packed with expert content.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={cat.path}>
                  <Card className="group glass-card hover:glow-primary transition-all duration-300 cursor-pointer h-full">
                    <CardContent className="p-6">
                      <cat.icon className={`h-10 w-10 ${cat.color} mb-4 group-hover:scale-110 transition-transform`} />
                      <h3 className="font-display text-xl font-semibold mb-2">{cat.title}</h3>
                      <p className="text-sm text-muted-foreground">{cat.desc}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
              Why <span className="text-gradient-primary">HartLong?</span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="glass-card h-full text-center">
                  <CardContent className="p-6 flex flex-col items-center">
                    <div className="rounded-full bg-primary/10 p-3 mb-4">
                      <f.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-display font-semibold mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 border p-8 lg:p-16 text-center"
          >
            <Target className="h-12 w-12 mx-auto text-primary mb-6" />
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
              Ready to Start Your Trading Journey?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Join thousands of learners mastering the markets with expert guidance and powerful tools.
            </p>
            <Button size="lg" asChild className="glow-primary">
              <Link to="/register">
                <Award className="mr-2 h-5 w-5" /> Create Free Account
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
