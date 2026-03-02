import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Bookmark, Download, TrendingUp, Search, Wrench, X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";

const TOUR_KEY = "hartlong_onboarding_done";

const steps = [
  {
    icon: Sparkles,
    title: "Welcome to HartLong!",
    description: "Let's take a quick tour of your trading education dashboard.",
    color: "text-primary",
  },
  {
    icon: TrendingUp,
    title: "Market Categories",
    description: "Explore Equity, Options, Mutual Funds, and ETFs with curated resources for each.",
    color: "text-primary",
  },
  {
    icon: Bookmark,
    title: "Bookmark & Download",
    description: "Save resources to your bookmarks and download them for offline access anytime.",
    color: "text-accent",
  },
  {
    icon: Search,
    title: "Quick Search",
    description: "Press ⌘K (or Ctrl+K) to instantly search and navigate anywhere in the app.",
    color: "text-chart-3",
  },
  {
    icon: Wrench,
    title: "Trading Tools",
    description: "Use SIP, Compound, Profit/Loss, and Brokerage calculators to plan your trades.",
    color: "text-chart-4",
  },
  {
    icon: Download,
    title: "You're All Set!",
    description: "Start exploring resources and level up your trading knowledge. Happy learning!",
    color: "text-primary",
  },
];

export default function OnboardingTour() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem(TOUR_KEY)) {
      const t = setTimeout(() => setShow(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const finish = useCallback(() => {
    localStorage.setItem(TOUR_KEY, "1");
    setShow(false);
  }, []);

  const next = () => {
    if (step < steps.length - 1) setStep((s) => s + 1);
    else finish();
  };

  const prev = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  if (!show) return null;

  const current = steps[step];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-sm px-4"
          onClick={(e) => e.target === e.currentTarget && finish()}
        >
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="glass-card rounded-2xl p-6 sm:p-8 max-w-sm w-full relative overflow-hidden"
          >
            {/* Glow background */}
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-primary/10 blur-3xl" />

            <button onClick={finish} className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted transition-colors">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>

            <motion.div
              key={`icon-${step}`}
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
              className="mb-4 inline-flex rounded-2xl bg-primary/10 p-3"
            >
              <current.icon className={`h-7 w-7 ${current.color}`} />
            </motion.div>

            <motion.h3
              key={`title-${step}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="font-display text-xl font-bold mb-2"
            >
              {current.title}
            </motion.h3>

            <motion.p
              key={`desc-${step}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-muted-foreground leading-relaxed mb-6"
            >
              {current.description}
            </motion.p>

            {/* Progress dots */}
            <div className="flex items-center gap-1.5 mb-5">
              {steps.map((_, i) => (
                <motion.div
                  key={i}
                  className={`h-1.5 rounded-full transition-colors ${i === step ? "bg-primary" : "bg-muted"}`}
                  animate={{ width: i === step ? 24 : 8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              ))}
            </div>

            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={prev} disabled={step === 0} className="text-xs">
                <ChevronLeft className="h-3 w-3 mr-1" /> Back
              </Button>
              <Button size="sm" onClick={next} className="glow-primary text-xs">
                {step === steps.length - 1 ? "Get Started" : "Next"} <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
