import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Shirt, Sparkles, User, BookmarkCheck, Menu, X, Zap, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Wardrobe", page: "Wardrobe", icon: Shirt },
  { name: "Style Me", page: "StyleMe", icon: Sparkles },
  { name: "Quick Pick", page: "QuickStyle", icon: Zap },
  { name: "Shop", page: "ShopDiscover", icon: ShoppingBag },
  { name: "Saved", page: "SavedOutfits", icon: BookmarkCheck },
  { name: "Profile", page: "StyleProfilePage", icon: User },
];

export default function Layout({ children, currentPageName }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Nav */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-8 py-4">
          <Link to={createPageUrl("Wardrobe")} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-semibold tracking-tight">Atelier</span>
          </Link>
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.page} to={createPageUrl(item.page)}>
                <Button
                  variant={currentPageName === item.page ? "secondary" : "ghost"}
                  className="gap-2 text-sm font-medium"
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to={createPageUrl("Wardrobe")} className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-semibold">Atelier</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
        {mobileOpen && (
          <div className="px-4 pb-4 space-y-1 border-b border-border">
            {navItems.map((item) => (
              <Link key={item.page} to={createPageUrl(item.page)} onClick={() => setMobileOpen(false)}>
                <Button
                  variant={currentPageName === item.page ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2 text-sm font-medium"
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Button>
              </Link>
            ))}
          </div>
        )}
      </nav>

      <main className="pt-16 md:pt-20 min-h-screen">
        {children}
      </main>
    </div>
  );
}