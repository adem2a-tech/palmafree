import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NavLinks = [
  { name: "Accueil", href: "#home" },
  { name: "Nouveautés", href: "#patch-notes" },
  { name: "Lore", href: "#lore" },
  { name: "Métiers", href: "#jobs" },
  { name: "Illégal", href: "#illegal" },
  { name: "Équipe", href: "#staff" },
  { name: "Réseaux", href: "#socials" },
  { name: "Fonctionnalités", href: "#features" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    e.preventDefault();
    const element = document.querySelector(target);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/90 backdrop-blur-md border-b border-border shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="#home" onClick={(e) => handleScrollTo(e, "#home")} className="flex items-center gap-3 group">
            <motion.img
              src="/palmier.png"
              alt="Palma FA logo"
              width={48}
              height={48}
              className="object-contain drop-shadow-[0_0_8px_rgba(74,222,128,0.4)] group-hover:drop-shadow-[0_0_14px_rgba(74,222,128,0.7)] transition-all"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="font-sans font-bold text-2xl tracking-wide text-foreground">PALMA <span className="text-primary">FA</span></span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {NavLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleScrollTo(e, link.href)}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <a href="https://wiki.palma-fa.fr" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Wiki
            </a>
            <a
              href="https://discord.gg/palmafa"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-md bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold text-sm hover:shadow-[0_0_20px_rgba(253,224,71,0.3)] transition-all transform hover:-translate-y-0.5"
            >
              Rejoindre Discord
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 text-foreground hover:text-primary transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background/95 backdrop-blur-lg border-b border-border overflow-hidden"
          >
            <div className="flex flex-col py-4 px-6 gap-4">
              {NavLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleScrollTo(e, link.href)}
                  className="text-base font-medium text-foreground hover:text-primary"
                >
                  {link.name}
                </a>
              ))}
              <div className="h-px bg-border my-2" />
              <a href="https://wiki.palma-fa.fr" className="text-base font-medium text-foreground hover:text-primary">
                Wiki
              </a>
              <a
                href="https://discord.gg/palmafa"
                className="w-full text-center px-5 py-3 rounded-md bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold"
              >
                Rejoindre Discord
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
