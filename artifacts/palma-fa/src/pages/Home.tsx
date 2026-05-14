import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import { Copy, Check, ChevronRight, Play, Server, Skull, Users, Shield, MapPin, DollarSign, Briefcase, Hammer, Pill, Crosshair, Vault, Car, Home as HomeIcon, Scale, Smartphone, Monitor } from "lucide-react";
import { SiDiscord, SiTiktok, SiYoutube, SiInstagram, SiX, SiTwitch } from "react-icons/si";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PATCH_NOTES, LORE, FEATURES } from "@/data";
import { useToast } from "@/hooks/use-toast";
import { useListJobs, useListIllegalOrgs, useListStaff } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";

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

const SLIDES = [
  "/slide1.png",
  "/slide2.png",
  "/slide3.png",
  "/slide4.png",
  "/slide5.png",
];

export default function Home() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [activePatchFilter, setActivePatchFilter] = useState<string>("Tous");
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const { data: jobs, isLoading: isJobsLoading } = useListJobs();
  const { data: illegalOrgs, isLoading: isIllegalLoading } = useListIllegalOrgs();
  const { data: staff, isLoading: isStaffLoading } = useListStaff();

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

  type Job = NonNullable<typeof jobs>[number];
  type StaffMember = NonNullable<typeof staff>[number];

  const groupedJobs = (jobs ?? []).reduce<Record<string, Job[]>>((acc, job) => {
    if (!acc[job.category]) acc[job.category] = [];
    acc[job.category]!.push(job);
    return acc;
  }, {});

  const groupedStaff = (staff ?? []).reduce<Record<string, StaffMember[]>>((acc, member) => {
    if (!acc[member.category]) acc[member.category] = [];
    acc[member.category]!.push(member);
    return acc;
  }, {});

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section id="home" className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-black">
          {/* Sliding background images */}
          <div className="absolute inset-0 z-0">
            <AnimatePresence mode="sync">
              <motion.div
                key={slideIndex}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
              >
                <img
                  src={SLIDES[slideIndex]}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </AnimatePresence>
            {/* Dark overlay for readability */}
            <div className="absolute inset-0 bg-black/60 z-10"></div>
            {/* Bottom fade to site background */}
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent z-10"></div>
          </div>

          {/* Slide indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlideIndex(i)}
                className={`h-1 rounded-full transition-all duration-500 ${i === slideIndex ? "w-8 bg-primary" : "w-2 bg-white/30"}`}
              />
            ))}
          </div>

          <div className="container relative z-20 mx-auto px-4 md:px-6 flex flex-col items-center text-center">
            {/* Small floating logo icon */}
            <motion.img
              src="/palmier.png"
              alt="Palmier Palma FA"
              className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-[0_0_20px_rgba(74,222,128,0.8)] mb-5"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
              transition={{ opacity: { duration: 0.8 }, scale: { duration: 0.8 }, y: { duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 } }}
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="relative mb-4"
            >
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-widest drop-shadow-[0_4px_32px_rgba(0,0,0,0.8)]">
                <span className="text-white">PALMA</span>
                <span className="text-primary drop-shadow-[0_0_30px_rgba(253,224,71,0.7)]"> FA</span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="text-base md:text-lg text-muted-foreground max-w-xl mb-8"
            >
              Plongez dans une expérience roleplay immersive et unique. Construisez votre histoire dans une ville vivante où chaque décision compte.
            </motion.p>

            {/* CFX connection box */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mb-6"
            >
              <button
                onClick={handleCopyIP}
                data-testid="button-copy-ip"
                className="group flex items-center gap-3 px-5 py-3 rounded-lg bg-black/50 border border-white/10 hover:border-primary/40 transition-all hover:shadow-[0_0_20px_rgba(253,224,71,0.1)]"
              >
                <span className="text-muted-foreground text-sm font-medium">Connexion :</span>
                <span className="text-foreground font-mono font-semibold text-sm">cfx.re/join/palmafa</span>
                <div className="ml-2 text-muted-foreground group-hover:text-primary transition-colors">
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </div>
              </button>
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="flex flex-col sm:flex-row items-center gap-4"
            >
              <a
                href="https://discord.gg/palmafa"
                data-testid="link-discord-hero"
                className="flex items-center gap-2 px-7 py-3 rounded-lg bg-primary text-primary-foreground font-bold text-base hover:shadow-[0_0_25px_rgba(253,224,71,0.4)] transition-all transform hover:-translate-y-0.5"
              >
                <SiDiscord size={20} />
                Rejoindre Discord
              </a>
              <a
                href="#features"
                data-testid="link-features-hero"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector("#features")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-7 py-3 rounded-lg border border-white/15 text-foreground font-bold text-base hover:border-primary/40 hover:text-primary transition-all"
              >
                Découvrir les fonctionnalités
              </a>
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
                {isJobsLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-[140px] rounded-xl" />)}
                  </div>
                ) : (
                  Object.entries(groupedJobs!).map(([category, categoryJobs], idx) => (
                    <div key={category}>
                      <h3 className="text-2xl font-bold mb-6 text-foreground/80 border-b border-border pb-4">{category}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {categoryJobs.map((job, i) => (
                          <div key={i} className="p-5 rounded-xl bg-card border border-border flex flex-col items-start justify-between min-h-[140px]">
                            <div className="w-full flex justify-between items-start mb-4">
                              <h4 className="text-lg font-bold">{job.name}</h4>
                              <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                                job.available ? "bg-secondary/10 text-secondary" : "bg-destructive/10 text-destructive"
                              }`}>
                                {job.available ? "Disponible" : "Indisponible"}
                              </span>
                            </div>
                            <div className="flex w-full gap-2 mt-auto">
                              <button 
                                className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                                  job.available 
                                    ? "bg-primary/10 text-primary hover:bg-primary/20" 
                                    : "bg-muted text-muted-foreground cursor-not-allowed"
                                }`}
                                disabled={!job.available}
                              >
                                Rejoindre
                              </button>
                              {job.discordLink && (
                                <a 
                                  href={job.discordLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-center w-10 bg-[#5865F2]/10 text-[#5865F2] hover:bg-[#5865F2]/20 rounded-lg transition-colors"
                                >
                                  <SiDiscord size={18} />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
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
                {isIllegalLoading ? (
                  [...Array(3)].map((_, i) => <Skeleton key={i} className="h-[200px] rounded-2xl" />)
                ) : (
                  illegalOrgs?.map((org, i) => (
                    <motion.div 
                      key={i}
                      whileHover={{ scale: 1.02 }}
                      className="p-6 rounded-2xl bg-card/80 backdrop-blur border border-destructive/20 hover:border-destructive/50 transition-all shadow-[0_0_0_rgba(220,38,38,0)] hover:shadow-[0_0_20px_rgba(220,38,38,0.1)] relative overflow-hidden group"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/10 rounded-bl-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
                      <div className="flex justify-between items-start mb-6 relative z-10">
                        <h3 className="text-2xl font-black text-foreground">{org.name}</h3>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                            org.status === "Recrute" ? "bg-secondary/20 text-secondary" : "bg-muted text-muted-foreground"
                          }`}>
                            {org.status}
                          </span>
                          {org.discordLink && (
                            <a href={org.discordLink} target="_blank" rel="noopener noreferrer" className="text-[#5865F2] bg-[#5865F2]/10 p-1.5 rounded-md hover:bg-[#5865F2]/20">
                              <SiDiscord size={14} />
                            </a>
                          )}
                        </div>
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
                  ))
                )}
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
                {isStaffLoading ? (
                  [...Array(4)].map((_, i) => <Skeleton key={i} className="h-[240px] rounded-2xl" />)
                ) : (
                  staff?.map((member, i) => (
                    <div key={i} className="p-6 rounded-2xl bg-card border border-border text-center flex flex-col items-center group hover:border-primary/30 transition-all">
                      <div className="w-24 h-24 rounded-full bg-muted mb-4 overflow-hidden border-2 border-transparent group-hover:border-primary transition-all flex items-center justify-center">
                        {member.avatarUrl ? (
                          <img src={member.avatarUrl} alt={member.pseudo} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl font-bold text-muted-foreground">{member.pseudo.substring(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold mb-1">{member.pseudo}</h3>
                      <span className="text-primary font-medium text-sm mb-3">{member.role}</span>
                      <p className="text-muted-foreground text-sm leading-relaxed">{member.description}</p>
                    </div>
                  ))
                )}
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
