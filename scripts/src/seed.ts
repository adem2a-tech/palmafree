import { db, loreTable } from "../../lib/db/src/index";

async function seed() {
  console.log("Réinitialisation puis seed lore (exemples)...");
  await db.delete(loreTable);
  await db.insert(loreTable).values([
    {
      title: "Histoire de la ville",
      summary:
        "Découvrez les origines de Palma, une île autrefois paradisiaque devenue le centre de tous les trafics.",
      sortOrder: 1,
    },
    {
      title: "Gouvernement & corruption",
      summary:
        "Le pouvoir est entre les mains de quelques-uns. Serez-vous un citoyen modèle ou profiterez-vous du système ?",
      sortOrder: 2,
    },
    {
      title: "Criminalité et gangs",
      summary:
        "Les quartiers chauds sont contrôlés par des factions impitoyables. Choisissez votre camp.",
      sortOrder: 3,
    },
    {
      title: "Forces de l'ordre",
      summary:
        "Le LSPD et le BCSO tentent de maintenir un semblant d'ordre face au chaos grandissant.",
      sortOrder: 4,
    },
    {
      title: "Économie",
      summary:
        "De l'argent sale à l'argent propre, l'économie de Palma est dynamique et impitoyable.",
      sortOrder: 5,
    },
  ]);

  console.log(
    "Seed lore terminé. Métiers / illégal / équipe : à gérer depuis le panneau admin (/admin).",
  );
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
