import React from "react";
import { SiDiscord, SiTiktok, SiYoutube, SiInstagram, SiX, SiTwitch } from "react-icons/si";

export function Footer() {
  return (
    <footer className="bg-background border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                <path d="M12 22C12 22 11 16 11 12C11 8 13 4 13 4C13 4 10.5 7 10.5 10C10.5 13 12 18 12 22Z" fill="currentColor" />
                <path d="M12 12C14 10 17 8 19 8C19 8 16 11 14 13C12.5 14.5 12 12 12 12Z" fill="var(--color-secondary)" />
                <path d="M12 12C10 10 7 8 5 8C5 8 8 11 10 13C11.5 14.5 12 12 12 12Z" fill="var(--color-secondary)" />
                <path d="M12 10C15 7 18 4 21 4C21 4 17 7 14 10C12.5 11.5 12 10 12 10Z" fill="var(--color-secondary)" />
                <path d="M12 10C9 7 6 4 3 4C3 4 7 7 10 10C11.5 11.5 12 10 12 10Z" fill="var(--color-secondary)" />
              </svg>
              <span className="font-sans font-bold text-xl tracking-wide text-foreground">PALMA <span className="text-primary">FA</span></span>
            </div>
            <p className="text-muted-foreground max-w-sm">
              Plongez dans l'univers de Palma FA, un serveur GTA RP unique où la chaleur tropicale rencontre l'adrénaline des rues. Forgez votre propre destinée.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Liens Rapides</h4>
            <ul className="space-y-2">
              <li><a href="#home" className="text-muted-foreground hover:text-primary transition-colors">Accueil</a></li>
              <li><a href="#lore" className="text-muted-foreground hover:text-primary transition-colors">Lore</a></li>
              <li><a href="#jobs" className="text-muted-foreground hover:text-primary transition-colors">Métiers</a></li>
              <li><a href="https://wiki.palma-fa.fr" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">Wiki</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Légal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Règlement</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Mentions Légales</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Conditions d'utilisation</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Boutique</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border">
          <p className="text-muted-foreground text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Palma FA. Tous droits réservés.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-muted-foreground hover:text-[#5865F2] transition-colors p-2 bg-card rounded-full hover:bg-card/80"><SiDiscord size={18} /></a>
            <a href="#" className="text-muted-foreground hover:text-[#000000] dark:hover:text-white transition-colors p-2 bg-card rounded-full hover:bg-card/80"><SiX size={18} /></a>
            <a href="#" className="text-muted-foreground hover:text-[#E1306C] transition-colors p-2 bg-card rounded-full hover:bg-card/80"><SiInstagram size={18} /></a>
            <a href="#" className="text-muted-foreground hover:text-[#FF0000] transition-colors p-2 bg-card rounded-full hover:bg-card/80"><SiYoutube size={18} /></a>
            <a href="#" className="text-muted-foreground hover:text-[#00f2fe] transition-colors p-2 bg-card rounded-full hover:bg-card/80"><SiTiktok size={18} /></a>
            <a href="#" className="text-muted-foreground hover:text-[#9146FF] transition-colors p-2 bg-card rounded-full hover:bg-card/80"><SiTwitch size={18} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
