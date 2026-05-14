export const PATCH_NOTES = [
  {
    version: "v2.1.0",
    date: "12 Octobre 2023",
    category: "Ajouts",
    changes: ["Nouveau système de braquage de banque", "Nouvelle concession automobile premium", "Ajout de 15 nouveaux véhicules custom"]
  },
  {
    version: "v2.0.5",
    date: "05 Octobre 2023",
    category: "Corrections",
    changes: ["Correction d'un bug avec l'inventaire", "Fix des tenues EMS", "Résolution du problème de collision au LSPD"]
  },
  {
    version: "v2.0.0",
    date: "01 Octobre 2023",
    category: "Optimisation",
    changes: ["Amélioration des FPS en centre-ville", "Réduction du poids des textures custom", "Optimisation de la base de données"]
  }
];

export const LORE = [
  { title: "Histoire de la ville", summary: "Découvrez les origines de Palma, une île autrefois paradisiaque devenue le centre de tous les trafics." },
  { title: "Gouvernement & corruption", summary: "Le pouvoir est entre les mains de quelques-uns. Serez-vous un citoyen modèle ou profiterez-vous du système ?" },
  { title: "Criminalité et gangs", summary: "Les quartiers chauds sont contrôlés par des factions impitoyables. Choisissez votre camp." },
  { title: "Forces de l'ordre", summary: "Le LSPD et le BCSO tentent de maintenir un semblant d'ordre face au chaos grandissant." },
  { title: "Économie", summary: "De l'argent sale à l'argent propre, l'économie de Palma est dynamique et impitoyable." }
];

export const JOBS = [
  { name: "LSPD", category: "Service Public", status: "Disponible" },
  { name: "BCSO", category: "Service Public", status: "Disponible" },
  { name: "EMS", category: "Service Public", status: "Disponible" },
  { name: "Gouvernement", category: "Service Public", status: "Indisponible" },
  { name: "Concessionnaire", category: "Entreprises Privées", status: "Disponible" },
  { name: "Mécano", category: "Entreprises Privées", status: "Disponible" },
  { name: "Vigneron", category: "Entreprises Privées", status: "Disponible" },
  { name: "Taxi", category: "Entreprises Privées", status: "Disponible" },
  { name: "Bûcheron", category: "Freelance", status: "Disponible" },
  { name: "Livreur", category: "Freelance", status: "Disponible" },
];

export const ILLEGAL = [
  { name: "Cartel de Sinaloa", status: "Recrute", activities: ["Trafic d'armes", "Drogue", "Blanchiment"] },
  { name: "Ballas", status: "Complet", activities: ["Guerre de territoire", "Vente de drogue", "Vols"] },
  { name: "Vagos", status: "Recrute", activities: ["Vente de drogue", "Trafic de véhicules", "Braquages"] },
  { name: "Mafia Italienne", status: "Complet", activities: ["Racket", "Blanchiment", "Contrôle de clubs"] },
  { name: "Crew de Braqueurs", status: "Recrute", activities: ["Braquages de banques", "Vols de bijoux", "Courses-poursuites"] }
];

export const STAFF = [
  { pseudo: "AdminPalma", role: "Fondateur", description: "Supervise le projet global", category: "Fondateur" },
  { pseudo: "DevMaster", role: "Développeur Lead", description: "Gère les scripts et l'infra", category: "Développeurs" },
  { pseudo: "ModoPro", role: "Responsable Modération", description: "Veille au respect des règles", category: "Modération" },
  { pseudo: "HelperOne", role: "Support Joueurs", description: "Aide les nouveaux arrivants", category: "Support" }
];

export const FEATURES = [
  { title: "Système économique avancé", icon: "DollarSign" },
  { title: "Entreprises RP", icon: "Briefcase" },
  { title: "Système de craft", icon: "Hammer" },
  { title: "Système de drogue", icon: "Pill" },
  { title: "Système d'armes", icon: "Crosshair" },
  { title: "Système de braquage", icon: "Vault" },
  { title: "Système de véhicules custom", icon: "Car" },
  { title: "Système immobilier", icon: "Home" },
  { title: "Système judiciaire", icon: "Scale" },
  { title: "Téléphone RP", icon: "Smartphone" },
  { title: "UI moderne", icon: "Monitor" }
];
