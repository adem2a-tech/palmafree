import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import {
  Copy,
  Check,
  ChevronRight,
  MapPin,
  Skull,
  Shield,
  DollarSign,
  Briefcase,
  Hammer,
  Pill,
  Crosshair,
  Vault,
  Car,
  Home as HomeIcon,
  Scale,
  Smartphone,
  Monitor,
  Calendar,
  Wrench,
  Info,
  BookOpen,
  Image as ImageIcon,
} from "lucide-react";
import { SiDiscord, SiTiktok, SiYoutube, SiInstagram, SiX, SiTwitch } from "react-icons/si";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FEATURES } from "@/data";
import { useToast } from "@/hooks/use-toast";
import {
  useListJobs,
  useListIllegalOrgs,
  useListStaff,
  useListLore,
  useListPatchNotes,
  useListGallery,
  type Job,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import palmaPTabLogo from "@/assets/palma-p-tab.png";

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

function IllegalOrgCardBanner({ imageUrl }: { imageUrl: string | null | undefined }) {
  const [imgFailed, setImgFailed] = useState(false);
  const url = imageUrl?.trim() ?? "";
  const showRemote = Boolean(url) && !imgFailed;

  useEffect(() => {
    setImgFailed(false);
  }, [url]);

  return (
    <div className="relative aspect-[2/1] w-full shrink-0 bg-black">
      {showRemote ? (
        <img
          src={url}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-black">
          <img
            src={palmaPTabLogo}
            alt=""
            width={80}
            height={80}
            className="h-[72px] w-[72px] object-contain opacity-95 drop-shadow-[0_0_24px_rgba(74,222,128,0.25)] md:h-20 md:w-20"
            loading="lazy"
            decoding="async"
          />
        </div>
      )}
    </div>
  );
}

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
  const [loreSelectedIndex, setLoreSelectedIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const { data: jobs, isLoading: isJobsLoading } = useListJobs();
  const { data: illegalOrgs, isLoading: isIllegalLoading } = useListIllegalOrgs();
  const { data: staff, isLoading: isStaffLoading } = useListStaff();
  const { data: loreRows, isLoading: isLoreLoading } = useListLore();
  const { data: patchNotesData, isLoading: isPatchNotesLoading } = useListPatchNotes();
  const { data: galleryData, isLoading: isGalleryLoading } = useListGallery();

  const jobsList = Array.isArray(jobs) ? jobs : [];
  const staffList = Array.isArray(staff) ? staff : [];
  const illegalOrgsList = Array.isArray(illegalOrgs) ? illegalOrgs : [];
  const ILLEGAL_SEGMENT_ORDER = ["Gang", "Organisation", "Indépendant"] as const;
  type IllegalSeg = (typeof ILLEGAL_SEGMENT_ORDER)[number];
  const ILLEGAL_SEGMENT_TITLES: Record<IllegalSeg, string> = {
    Gang: "Gangs",
    Organisation: "Organisations",
    Indépendant: "Indépendants",
  };
  const normalizeIllegalSegmentHome = (s: string | undefined): IllegalSeg => {
    const t = (s ?? "").trim();
    return (ILLEGAL_SEGMENT_ORDER as readonly string[]).includes(t) ? (t as IllegalSeg) : "Organisation";
  };
  const illegalGroups = ILLEGAL_SEGMENT_ORDER.map((seg) => ({
    segment: seg,
    title: ILLEGAL_SEGMENT_TITLES[seg],
    orgs: illegalOrgsList.filter((o) => normalizeIllegalSegmentHome(o.segment) === seg),
  }));
  const loreList = Array.isArray(loreRows)
    ? [...loreRows].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)
    : [];

  const patchNotesList = Array.isArray(patchNotesData)
    ? [...patchNotesData].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)
    : [];

  const galleryList = Array.isArray(galleryData)
    ? [...galleryData].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)
    : [];

  useEffect(() => {
    if (loreList.length === 0) return;
    if (loreSelectedIndex >= loreList.length) setLoreSelectedIndex(0);
  }, [loreList.length, loreSelectedIndex]);

  const loreSafeIndex =
    loreList.length > 0 ? Math.min(loreSelectedIndex, loreList.length - 1) : 0;
  const selectedLore = loreList[loreSafeIndex];
  const loreHeroSrc =
    selectedLore?.imageUrl?.trim() || SLIDES[loreSafeIndex % SLIDES.length];

  const groupedJobs = jobsList.reduce<Record<string, Job[]>>((acc, job) => {
    if (!acc[job.category]) acc[job.category] = [];
    acc[job.category]!.push(job);
    return acc;
  }, {});

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
    ? patchNotesList 
    : patchNotesList.filter((p) => p.category === activePatchFilter);

  const patchCategories = ["Tous", ...Array.from(new Set(patchNotesList.map((p) => p.category)))];

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
            {/* Bottom fade to site background + marque P */}
            <div className="absolute bottom-0 left-0 right-0 z-10 h-48 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
              <div className="absolute bottom-14 left-1/2 flex -translate-x-1/2 justify-center md:bottom-16">
                <img
                  src={palmaPTabLogo}
                  alt=""
                  width={36}
                  height={36}
                  className="h-8 w-8 object-contain opacity-90 drop-shadow-[0_2px_16px_rgba(0,0,0,0.55)] md:h-9 md:w-9"
                  aria-hidden
                  decoding="async"
                />
              </div>
            </div>
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
                href="https://discord.gg/rxvfFQvxV"
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

        {/* NOUVEAUTÉS — timeline style */}
        <section id="patch-notes" className="relative overflow-hidden bg-gradient-to-b from-[hsl(158_9%_4.8%)] via-[hsl(160_10%_5.4%)] to-[hsl(158_12%_6.4%)] py-20 text-zinc-100 md:py-28">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary) / 0.06),transparent)]" />
          <div className="container relative mx-auto max-w-3xl px-4 md:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeUp}
            >
              <header className="mb-12 text-center md:mb-16">
                <div className="mb-6 flex justify-center md:mb-8">
                  <img
                    src={palmaPTabLogo}
                    alt=""
                    width={72}
                    height={72}
                    className="h-16 w-16 object-contain opacity-95 drop-shadow-[0_0_32px_rgba(253,224,71,0.22)] md:h-[72px] md:w-[72px]"
                    decoding="async"
                    draggable={false}
                  />
                </div>
                <h2 className="mb-4 text-4xl font-black tracking-tight md:text-5xl lg:text-6xl">
                  <span className="bg-gradient-to-r from-primary via-yellow-200 to-amber-400 bg-clip-text text-transparent">
                    Nouveautés
                  </span>
                  <span className="text-white"> &amp; patch notes</span>
                </h2>
                <p className="mx-auto max-w-2xl text-base text-zinc-400 md:text-lg">
                  Restez informé des dernières mises à jour, corrections et événements du serveur.
                </p>
              </header>

              <div className="mb-12 flex flex-wrap justify-center gap-2">
                {patchCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActivePatchFilter(cat)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                      activePatchFilter === cat
                        ? "border-primary bg-primary/20 text-white shadow-[0_0_24px_-8px_hsl(var(--primary) / 0.45)]"
                        : "border-white/[0.08] bg-[hsl(160_8%_6.8%)]/45 text-zinc-400 hover:border-primary/35 hover:text-zinc-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative pl-2 md:pl-0">
                <div
                  className="absolute left-[15px] top-2 bottom-8 w-px bg-gradient-to-b from-primary/80 via-primary/40 to-[hsl(158_8%_4.5%)] md:left-1/2 md:-translate-x-1/2"
                  aria-hidden
                />

                {filteredPatchNotes.length === 0 ? (
                  <p className="py-12 text-center text-zinc-500">
                    {isPatchNotesLoading ? "Chargement des nouveautés…" : "Aucun patch pour ce filtre."}
                  </p>
                ) : (
                  filteredPatchNotes.map((note, i) => (
                    <div key={note.id} className="relative pb-14 last:pb-4">
                      <div className="absolute left-[15px] top-3 z-10 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-primary/90 bg-primary shadow-[0_0_14px_hsl(var(--primary) / 0.85)] ring-4 ring-[hsl(158_9%_4.8%)] md:left-1/2" />

                      <div className="pl-10 md:mx-auto md:max-w-xl md:pl-0 md:pr-[calc(50%+1.5rem)]">
                        <motion.div
                          initial={{ opacity: 0, y: 16 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.06 }}
                          className="rounded-2xl border border-white/[0.08] bg-[hsl(160_9%_6.2%)]/90 p-6 shadow-[0_0_40px_-12px_hsl(var(--primary) / 0.15)] backdrop-blur-sm md:text-left"
                        >
                          <div className="mb-4 flex flex-col-reverse items-start justify-between gap-3 sm:flex-row sm:items-start">
                            <h3 className="text-xl font-bold text-white md:text-2xl">Mise à jour du serveur</h3>
                            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-100">
                              <Wrench className="h-3.5 w-3.5" strokeWidth={2.5} />
                              Patch {note.version}
                            </span>
                          </div>
                          <div className="mb-4 flex items-center gap-2 text-sm text-zinc-400">
                            <Calendar className="h-4 w-4 text-primary" />
                            {note.date}
                          </div>
                          <p className="mb-6 text-sm leading-relaxed text-zinc-300">
                            Voici les derniers changements appliqués sur le serveur ({note.category}).
                          </p>
                          <p className="mb-3 text-sm font-semibold tracking-wide text-white">Changements :</p>
                          <ul className="mb-8 space-y-2.5">
                            {note.changes.map((change, j) => (
                              <li key={j} className="flex gap-3 text-sm text-zinc-300">
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                <span>{change}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="flex gap-3 rounded-xl border border-secondary/35 bg-secondary/10 p-4">
                            <Info className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                            <div>
                              <p className="mb-1 text-sm font-semibold text-secondary">Note</p>
                              <p className="text-xs leading-relaxed text-zinc-400">
                                Catégorie « {note.category} » — en cas de doute sur une mécanique RP, vérifiez le règlement ou demandez sur Discord.
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* LORE — chapitres + carte */}
        <section id="lore" className="relative bg-gradient-to-b from-[hsl(158_9%_4.8%)] via-[hsl(160_10%_5.4%)] to-[hsl(158_12%_6.4%)] py-20 text-zinc-100 md:py-28">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_0%,hsl(var(--primary) / 0.05),transparent)]" />
          <div className="container relative mx-auto max-w-4xl px-4 md:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={fadeUp}
            >
              <header className="mb-10 text-center md:mb-14">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-primary/45 bg-primary/15 text-primary">
                  <BookOpen className="h-8 w-8" strokeWidth={1.75} />
                </div>
                <h2 className="mb-4 text-4xl font-black tracking-tight text-white md:text-5xl">
                  L&apos;univers de{" "}
                  <span className="bg-gradient-to-r from-primary to-amber-300 bg-clip-text text-transparent">
                    Palma
                  </span>
                </h2>
                <p className="mx-auto max-w-2xl text-lg italic leading-relaxed text-zinc-400">
                  « Chaque rue raconte une histoire. Découvrez le lore officiel du serveur Palma FA. »
                </p>
              </header>

              {isLoreLoading ? (
                <div className="space-y-4">
                  <Skeleton className="mx-auto h-11 max-w-2xl rounded-full bg-[hsl(160_8%_8%)]" />
                  <Skeleton className="h-[420px] w-full rounded-2xl bg-[hsl(160_9%_7%)]" />
                </div>
              ) : loreList.length === 0 ? (
                <p className="rounded-2xl border border-white/[0.08] bg-[hsl(160_9%_6.2%)]/80 py-14 text-center text-zinc-500">
                  Le lore sera affiché ici une fois ajouté depuis le panneau admin.
                </p>
              ) : (
                <>
                  <div className="mb-8 flex flex-wrap justify-center gap-2 md:gap-3">
                    {loreList.map((entry, idx) => (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => setLoreSelectedIndex(idx)}
                        className={`max-w-[min(100%,280px)] rounded-full border px-4 py-2.5 text-left text-sm font-medium transition-all ${
                          loreSafeIndex === idx
                            ? "border-primary bg-primary/20 text-white shadow-[0_0_24px_-8px_hsl(var(--primary) / 0.4)]"
                            : "border-white/[0.08] bg-[hsl(160_8%_6.8%)]/45 text-zinc-400 hover:border-primary/35 hover:text-zinc-200"
                        }`}
                      >
                        <span className="mr-2 font-mono text-primary">{idx + 1}</span>
                        <span className="line-clamp-1">{entry.title}</span>
                      </button>
                    ))}
                  </div>

                  {selectedLore && (
                    <motion.div
                      key={selectedLore.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35 }}
                      className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[hsl(160_9%_6.2%)]/90 shadow-[0_0_50px_-15px_hsl(var(--primary) / 0.18)] backdrop-blur-sm"
                    >
                      <div className="aspect-[21/9] max-h-[320px] w-full overflow-hidden bg-[hsl(162_8%_5%)] md:aspect-video">
                        <img
                          src={loreHeroSrc}
                          alt=""
                          className="h-full w-full object-cover opacity-95"
                        />
                      </div>
                      <div className="p-6 md:p-10">
                        <span className="mb-4 inline-block rounded-full border border-primary/40 bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                          Chapitre {loreSafeIndex + 1}
                        </span>
                        <h3 className="mb-4 text-2xl font-bold text-white md:text-3xl">{selectedLore.title}</h3>
                        <p className="whitespace-pre-wrap leading-relaxed text-zinc-300">{selectedLore.summary}</p>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </motion.div>
          </div>
        </section>

        {/* GALERIE — images + descriptions (admin) */}
        <section id="galerie" className="relative border-y border-border/60 bg-background py-20 md:py-28">
          <div className="container relative mx-auto max-w-6xl px-4 md:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={fadeUp}
            >
              <header className="mb-12 text-center md:mb-16">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-primary/45 bg-primary/15 text-primary">
                  <ImageIcon className="h-8 w-8" strokeWidth={1.75} />
                </div>
                <h2 className="mb-4 text-4xl font-black tracking-tight md:text-5xl">
                  <span className="bg-gradient-to-r from-primary to-amber-300 bg-clip-text text-transparent">Galerie</span>
                </h2>
                <p className="mx-auto max-w-2xl text-muted-foreground md:text-lg">
                  Visuels et textes gérés depuis le panneau admin — parfait pour événements, screenshots ou affiches du serveur.
                </p>
              </header>

              {isGalleryLoading ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="aspect-video w-full rounded-2xl" />
                  ))}
                </div>
              ) : galleryList.length === 0 ? (
                <p className="rounded-2xl border border-border bg-card/50 py-14 text-center text-muted-foreground">
                  Aucune image pour le moment — ajoute-en depuis l&apos;onglet « Galerie » du panneau admin.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {galleryList.map((item, i) => (
                    <motion.article
                      key={item.id}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
                    >
                      <div className="aspect-video w-full overflow-hidden bg-muted">
                        <img src={item.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                      </div>
                      <div className="p-5">
                        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{item.description}</p>
                      </div>
                    </motion.article>
                  ))}
                </div>
              )}
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
                ) : Object.keys(groupedJobs).length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Aucun métier pour le moment — ajoutez-en depuis le panneau admin.
                  </p>
                ) : (
                  Object.entries(groupedJobs).map(([category, categoryJobs]) => (
                    <div key={category}>
                      <h3 className="text-2xl font-bold mb-6 text-foreground/80 border-b border-border pb-4">{category}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {categoryJobs.map((job) => (
                          <div
                            key={job.id}
                            className="overflow-hidden rounded-xl bg-card border border-border flex flex-col min-h-[140px]"
                          >
                            <div className="relative aspect-[2/1] w-full shrink-0 bg-muted">
                              {job.imageUrl?.trim() ? (
                                <img src={job.imageUrl.trim()} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 to-muted text-primary/40">
                                  <Briefcase className="h-10 w-10" strokeWidth={1.25} />
                                </div>
                              )}
                            </div>
                            <div className="flex flex-1 flex-col p-5 pt-4">
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
                <h2 className="text-4xl md:text-5xl font-bold">Illégal</h2>
              </div>

              {isIllegalLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-[200px] rounded-2xl" />
                  ))}
                </div>
              ) : illegalOrgsList.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Aucune fiche illégale — ajoutez-en depuis le panneau admin (Gangs, Organisations ou Indépendants).
                </p>
              ) : (
                <div className="space-y-14 md:space-y-16">
                  {illegalGroups.map(({ segment, title, orgs }) =>
                    orgs.length === 0 ? null : (
                      <div key={segment}>
                        <h3 className="mb-6 border-b border-destructive/30 pb-3 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                          {title}
                        </h3>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                          {orgs.map((org) => (
                    <motion.div 
                      key={org.id}
                      whileHover={{ scale: 1.02 }}
                      className="rounded-2xl bg-card/80 backdrop-blur border border-destructive/20 hover:border-destructive/50 transition-all shadow-[0_0_0_rgba(220,38,38,0)] hover:shadow-[0_0_20px_rgba(220,38,38,0.1)] relative overflow-hidden group flex flex-col"
                    >
                      <IllegalOrgCardBanner imageUrl={org.imageUrl} />
                      <div className="relative p-6 flex flex-col flex-1">
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
                      </div>
                    </motion.div>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
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
                ) : staffList.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8 col-span-full">
                    Aucun membre d&apos;équipe — ajoutez-en depuis le panneau admin.
                  </p>
                ) : (
                  staffList.map((member) => (
                    <div key={member.id} className="p-6 rounded-2xl bg-card border border-border text-center flex flex-col items-center group hover:border-primary/30 transition-all">
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
                  { icon: <SiDiscord size={32} />, label: "Discord", color: "hover:bg-[#5865F2] hover:border-[#5865F2]", href: "https://discord.gg/rxvfFQvxV" },
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
