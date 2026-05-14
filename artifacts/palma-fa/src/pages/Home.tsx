import React, { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, ChevronRight, Play, Server, Skull, Users, Shield, MapPin, DollarSign, Briefcase, Hammer, Pill, Crosshair, Vault, Car, Home as HomeIcon, Scale, Smartphone, Monitor } from "lucide-react";
import { SiDiscord, SiTiktok, SiYoutube, SiInstagram, SiX, SiTwitch } from "react-icons/si";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PATCH_NOTES, LORE, JOBS, ILLEGAL, STAFF, FEATURES } from "@/data";
import { useToast } from "@/hooks/use-toast";

const iconMap: Record<string, React.ReactNode> = {
  DollarSign: <DollarSign className="text-primary w-8 h-8" />,
  Briefcase: <Briefcase className="text-primary w-8 h-8" />,
  Hammer: <Hammer className="text-primary w-8 h-8" />,
  Pill: <Pill className="text-primary w-8 h-8" />,
  Crosshair: <Crosshair className="text-primary w-8 h-8" />,
  Vault: <Vault className="text-primary w-8 h-8" />,
  Car: <Car className="text-primary w-8 h-8" />,
  Home: <HomeIcon className="text-primary w-8 h-8" />,
  Scale: <Scale className="text-primary w-8 h-8" />,
  Smartphone: <Smartphone className="text-primary w-8 h-8" />,
  Monitor: <Monitor className="text-primary w-8 h-8" />,
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function Home() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [activePatchFilter, setActivePatchFilter] = useState<string>("Tous");

  const handleCopyIP = () => {
    navigator.clipboard.writeText("cfx.re/join/palmafa");
    setCopied(true);
    toast({
      title: "IP Copiée",
      description: "L'adresse du serveur a été copiée dans le presse-papier.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredPatchNotes = activePatchFilter === "Tous" 
    ? PATCH_NOTES 
    : PATCH_NOTES.filter(p => p.category === activePatchFilter);

  const patchCategories = ["Tous", ...Array.from(new Set(PATCH_NOTES.map(p => p.category)))];

  const groupedJobs = JOBS.reduce((acc, job) => {
    if (!acc[job.category]) acc[job.category] = [];
    acc[job.category].push(job);
    return acc;
  }, {} as Record<string, typeof JOBS>);

  const groupedStaff = STAFF.reduce((acc, member) => {
    if (!acc[member.category]) acc[member.category] = [];
    acc[member.category].push(member);
    return acc;
  }, {} as Record<string, typeof STAFF>);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section id="home" className="relative min-h-[100dvh] flex items-center justify-center pt-20">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
            <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px]"></div>
          </div>
          
          <div className="container relative z-10 mx-auto px-4 md:px-6 flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="mb-6 relative"
            >
              <div className="absolute -inset-10 bg-primary/20 blur-[100px] rounded-full"></div>
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-primary/80 to-primary drop-shadow-[0_0_15px_rgba(253,224,71,0.5)]">
                PALMA FA
              </h1>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-10 font-medium"
            >
              Bienvenue sous les tropiques. Bâtissez votre empire, respectez la loi ou choisissez l'ombre. Votre histoire commence ici.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center gap-4 mb-16"
            >
              <button 
                onClick={handleCopyIP}
                className="group flex items-center gap-3 px-6 py-4 rounded-xl bg-card border border-primary/20 hover:border-primary/50 transition-all hover:shadow-[0_0_20px_rgba(253,224,71,0.15)]"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                  <Play size={20} className="ml-1" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">IP Serveur</span>
                  <span className="text-foreground font-mono font-bold tracking-tight">cfx.re/join/palmafa</span>
                </div>
                <div className="ml-4 pl-4 border-l border-border text-muted-foreground group-hover:text-primary transition-colors">
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                </div>
              </button>

              <div className="flex items-center gap-4">
                <a 
                  href="https://discord.gg/palmafa"
                  className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:shadow-[0_0_30px_rgba(253,224,71,0.4)] transition-all transform hover:-translate-y-1 flex items-center gap-2"
                >
                  <SiDiscord size={24} />
                  Rejoindre Discord
                </a>
                <a 
                  href="#features"
                  onClick={(e) => {
                    e.preventDefault();
                    document.querySelector("#features")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-6 py-4 rounded-xl bg-secondary/10 text-secondary font-bold text-lg hover:bg-secondary/20 transition-all"
                >
                  Fonctionnalités
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* NOUVEAUTÉS */}
        <section id="patch-notes" className="py-24 bg-card/30">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}>
              <div className="flex items-center gap-4 mb-12">
                <div className="p-3 rounded-xl bg-primary/10 text-primary"><Server size={28} /></div>
                <h2 className="text-4xl md:text-5xl font-bold">Nouveautés</h2>
              </div>
              
              <div className="flex flex-wrap gap-3 mb-10">
                {patchCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActivePatchFilter(cat)}
                    className={`px-5 py-2 rounded-full font-medium transition-all ${
                      activePatchFilter === cat 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-card border border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPatchNotes.map((note, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Server size={80} />
                    </div>
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div>
                        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">{note.category}</span>
                        <h3 className="text-2xl font-bold">{note.version}</h3>
                      </div>
                      <span className="text-sm text-muted-foreground font-mono">{note.date}</span>
                    </div>
                    <ul className="space-y-3 relative z-10">
                      {note.changes.map((change, j) => (
                        <li key={j} className="flex items-start gap-2 text-muted-foreground">
                          <ChevronRight className="w-5 h-5 text-secondary shrink-0" />
                          <span>{change}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* LORE */}
        <section id="lore" className="py-24">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <div className="flex items-center gap-4 mb-12">
                <div className="p-3 rounded-xl bg-secondary/10 text-secondary"><MapPin size={28} /></div>
                <h2 className="text-4xl md:text-5xl font-bold">Le Lore</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {LORE.map((item, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ y: -5 }}
                    className="p-8 rounded-2xl bg-gradient-to-br from-card to-background border border-border hover:border-secondary/30 transition-all flex flex-col"
                  >
                    <h3 className="text-2xl font-bold mb-4 text-foreground">{item.title}</h3>
                    <p className="text-muted-foreground mb-8 flex-1 leading-relaxed">{item.summary}</p>
                    <button className="self-start px-5 py-2.5 rounded-lg bg-secondary/10 text-secondary font-medium hover:bg-secondary/20 transition-colors flex items-center gap-2">
                      Lire plus <ChevronRight size={18} />
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* METIERS */}
        <section id="jobs" className="py-24 bg-card/30">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <div className="flex items-center gap-4 mb-12">
                <div className="p-3 rounded-xl bg-primary/10 text-primary"><Briefcase size={28} /></div>
                <h2 className="text-4xl md:text-5xl font-bold">Métiers Légal</h2>
              </div>

              <div className="space-y-16">
                {Object.entries(groupedJobs).map(([category, jobs], idx) => (
                  <div key={category}>
                    <h3 className="text-2xl font-bold mb-6 text-foreground/80 border-b border-border pb-4">{category}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {jobs.map((job, i) => (
                        <div key={i} className="p-5 rounded-xl bg-card border border-border flex flex-col items-start justify-between min-h-[140px]">
                          <div className="w-full flex justify-between items-start mb-4">
                            <h4 className="text-lg font-bold">{job.name}</h4>
                            <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                              job.status === "Disponible" ? "bg-secondary/10 text-secondary" : "bg-destructive/10 text-destructive"
                            }`}>
                              {job.status}
                            </span>
                          </div>
                          <button 
                            className={`w-full py-2.5 rounded-lg font-medium text-sm transition-colors ${
                              job.status === "Disponible" 
                                ? "bg-primary/10 text-primary hover:bg-primary/20" 
                                : "bg-muted text-muted-foreground cursor-not-allowed"
                            }`}
                            disabled={job.status !== "Disponible"}
                          >
                            Rejoindre
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ILLEGAL */}
        <section id="illegal" className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-red-900/5 z-0"></div>
          <div className="container relative z-10 mx-auto px-4 md:px-6">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <div className="flex items-center gap-4 mb-12">
                <div className="p-3 rounded-xl bg-destructive/10 text-destructive"><Skull size={28} /></div>
                <h2 className="text-4xl md:text-5xl font-bold">L'Ombre de Palma</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ILLEGAL.map((org, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    className="p-6 rounded-2xl bg-card/80 backdrop-blur border border-destructive/20 hover:border-destructive/50 transition-all shadow-[0_0_0_rgba(220,38,38,0)] hover:shadow-[0_0_20px_rgba(220,38,38,0.1)] relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/10 rounded-bl-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <h3 className="text-2xl font-black text-foreground">{org.name}</h3>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        org.status === "Recrute" ? "bg-secondary/20 text-secondary" : "bg-muted text-muted-foreground"
                      }`}>
                        {org.status}
                      </span>
                    </div>
                    <div className="space-y-2 relative z-10">
                      {org.activities.map((act, j) => (
                        <div key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-destructive/50"></div>
                          {act}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* EQUIPE */}
        <section id="staff" className="py-24 bg-card/30">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <div className="flex items-center gap-4 mb-12">
                <div className="p-3 rounded-xl bg-primary/10 text-primary"><Shield size={28} /></div>
                <h2 className="text-4xl md:text-5xl font-bold">L'Équipe</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {STAFF.map((member, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-card border border-border text-center flex flex-col items-center group hover:border-primary/30 transition-all">
                    <div className="w-24 h-24 rounded-full bg-muted mb-4 overflow-hidden border-2 border-transparent group-hover:border-primary transition-all flex items-center justify-center">
                      <Users size={40} className="text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold mb-1">{member.pseudo}</h3>
                    <span className="text-primary font-medium text-sm mb-3">{member.role}</span>
                    <p className="text-muted-foreground text-sm leading-relaxed">{member.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* FONCTIONNALITES */}
        <section id="features" className="py-24">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <div className="flex items-center gap-4 mb-12">
                <div className="p-3 rounded-xl bg-secondary/10 text-secondary"><Monitor size={28} /></div>
                <h2 className="text-4xl md:text-5xl font-bold">Fonctionnalités</h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {FEATURES.map((feat, i) => (
                  <div key={i} className="p-6 rounded-xl bg-card border border-border flex flex-col items-center text-center gap-4 hover:bg-card/80 transition-colors">
                    <div className="p-4 rounded-full bg-primary/10">
                      {iconMap[feat.icon] || <Monitor className="text-primary w-8 h-8" />}
                    </div>
                    <span className="font-bold text-foreground">{feat.title}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* RESEAUX */}
        <section id="socials" className="py-24 bg-card/30 border-y border-border">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Rejoignez la communauté</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
                Restez informés des dernières nouveautés, participez aux événements et échangez avec les autres joueurs.
              </p>

              <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                {[
                  { icon: <SiDiscord size={32} />, label: "Discord", color: "hover:bg-[#5865F2] hover:border-[#5865F2]", href: "https://discord.gg/palmafa" },
                  { icon: <SiTiktok size={32} />, label: "TikTok", color: "hover:bg-[#00f2fe] hover:border-[#00f2fe]", href: "#" },
                  { icon: <SiYoutube size={32} />, label: "YouTube", color: "hover:bg-[#FF0000] hover:border-[#FF0000]", href: "#" },
                  { icon: <SiInstagram size={32} />, label: "Instagram", color: "hover:bg-[#E1306C] hover:border-[#E1306C]", href: "#" },
                  { icon: <SiX size={32} />, label: "X", color: "hover:bg-white hover:text-black hover:border-white", href: "#" },
                  { icon: <SiTwitch size={32} />, label: "Twitch", color: "hover:bg-[#9146FF] hover:border-[#9146FF]", href: "#" }
                ].map((social, i) => (
                  <a 
                    key={i}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex flex-col items-center justify-center gap-4 w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-card border border-border transition-all duration-300 ${social.color} hover:text-white group`}
                  >
                    <div className="text-muted-foreground group-hover:text-inherit transition-colors">
                      {social.icon}
                    </div>
                    <span className="font-bold">{social.label}</span>
                  </a>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
