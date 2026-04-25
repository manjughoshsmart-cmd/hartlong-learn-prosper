import { ReactNode } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import MobileBottomNav from "./MobileBottomNav";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-[60] bg-background/95 backdrop-blur-xl border-b">
        <div className="container mx-auto px-4 py-2 flex justify-center">
          <Link to="/" aria-label="HartLong Trading home">
            <h1 className="text-2xl md:text-4xl font-display font-bold text-gradient-primary text-center leading-tight">
              HartLong Trading
            </h1>
          </Link>
        </div>
        <Navbar />
      </header>
      <main className="flex-1 pt-[7.5rem] md:pt-[8.5rem] pb-16 lg:pb-0">{children}</main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
