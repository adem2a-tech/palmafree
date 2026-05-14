import { db, jobsTable, illegalOrgsTable, staffTable } from "../../lib/db/src/index";

async function seed() {
  console.log("Seeding jobs...");
  await db.insert(jobsTable).values([
    { name: "LSPD", category: "Service Public", available: true },
    { name: "BCSO", category: "Service Public", available: true },
    { name: "EMS", category: "Service Public", available: true },
    { name: "Gouvernement", category: "Service Public", available: false },
    { name: "Concessionnaire", category: "Entreprises Privées", available: true },
    { name: "Mécano", category: "Entreprises Privées", available: true },
    { name: "Vigneron", category: "Entreprises Privées", available: true },
    { name: "Taxi", category: "Entreprises Privées", available: true },
    { name: "Bûcheron", category: "Freelance", available: true },
    { name: "Livreur", category: "Freelance", available: true },
  ]).onConflictDoNothing();

  console.log("Seeding illegal orgs...");
  await db.insert(illegalOrgsTable).values([
    { name: "Cartel de Sinaloa", status: "Recrute", activities: ["Trafic d'armes", "Drogue", "Blanchiment"] },
    { name: "Ballas", status: "Complet", activities: ["Guerre de territoire", "Vente de drogue", "Vols"] },
    { name: "Vagos", status: "Recrute", activities: ["Vente de drogue", "Trafic de véhicules", "Braquages"] },
    { name: "Mafia Italienne", status: "Complet", activities: ["Racket", "Blanchiment", "Contrôle de clubs"] },
    { name: "Crew de Braqueurs", status: "Recrute", activities: ["Braquages de banques", "Vols de bijoux", "Courses-poursuites"] },
  ]).onConflictDoNothing();

  console.log("Seeding staff...");
  await db.insert(staffTable).values([
    { pseudo: "AdminPalma", role: "Fondateur", description: "Supervise le projet global", category: "Fondateur", sortOrder: 1 },
    { pseudo: "DevMaster", role: "Développeur Lead", description: "Gère les scripts et l'infra", category: "Développeurs", sortOrder: 2 },
    { pseudo: "ModoPro", role: "Responsable Modération", description: "Veille au respect des règles", category: "Modération", sortOrder: 3 },
    { pseudo: "HelperOne", role: "Support Joueurs", description: "Aide les nouveaux arrivants", category: "Support", sortOrder: 4 },
  ]).onConflictDoNothing();

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
