/**
 * API Palma simulée dans le navigateur (localStorage + sessionStorage).
 * Permet un panneau admin et le site utilisables sans backend.
 */
import type {
  AdminMe,
  HealthStatus,
  IllegalOrg,
  IllegalOrgInput,
  IllegalOrgUpdate,
  Job,
  JobInput,
  JobUpdate,
  LoreEntry,
  LoreInput,
  LoreUpdate,
  PatchNote,
  PatchNoteInput,
  PatchNoteUpdate,
  GalleryItem,
  GalleryItemInput,
  GalleryItemUpdate,
  Staff,
  StaffInput,
  StaffUpdate,
} from "./generated/api.schemas";

const LS_KEY = "palma-mock-db-v2";
const SESSION_KEY = "palma-mock-admin-session";
const MOCK_ADMIN_PASSWORD = "2715";

const ILLEGAL_SEGMENTS = ["Gang", "Organisation", "Indépendant"] as const;
type IllegalSegment = (typeof ILLEGAL_SEGMENTS)[number];

function normalizeIllegalSegment(raw: string | undefined | null): IllegalSegment {
  const t = (raw ?? "").trim();
  return (ILLEGAL_SEGMENTS as readonly string[]).includes(t) ? (t as IllegalSegment) : "Organisation";
}

type Db = {
  jobs: Job[];
  illegal: IllegalOrg[];
  lore: LoreEntry[];
  staff: Staff[];
  patchNotes: PatchNote[];
  galleryItems: GalleryItem[];
};

function defaultDb(): Db {
  return {
    jobs: [
      {
        id: 1,
        name: "Police municipale",
        category: "Service Public",
        available: true,
        discordLink: null,
        imageUrl: null,
      },
      {
        id: 2,
        name: "SAMU",
        category: "Urgences",
        available: true,
        discordLink: null,
        imageUrl: null,
      },
    ],
    illegal: [
      {
        id: 1,
        name: "Réseau démo",
        status: "Recrute",
        activities: ["Contrebande", "Recel"],
        discordLink: null,
        imageUrl: null,
        segment: "Organisation",
      },
    ],
    lore: [
      {
        id: 1,
        title: "Bienvenue à Palma",
        summary: "Ceci est un extrait de lore d’exemple. Modifie-le depuis le panneau admin.",
        sortOrder: 0,
        imageUrl: null,
      },
    ],
    staff: [
      {
        id: 1,
        pseudo: "Admin démo",
        role: "Fondateur",
        description: "Membre d’exemple — remplace par ta vraie équipe.",
        category: "Fondateur",
        avatarUrl: null,
        sortOrder: 0,
      },
    ],
    patchNotes: [
      {
        id: 1,
        version: "v2.1.0",
        date: "12 Octobre 2023",
        category: "Ajouts",
        changes: [
          "Nouveau système de braquage de banque",
          "Nouvelle concession automobile premium",
          "Ajout de 15 nouveaux véhicules custom",
        ],
        sortOrder: 0,
      },
      {
        id: 2,
        version: "v2.0.5",
        date: "05 Octobre 2023",
        category: "Corrections",
        changes: [
          "Correction d'un bug avec l'inventaire",
          "Fix des tenues EMS",
          "Résolution du problème de collision au LSPD",
        ],
        sortOrder: 1,
      },
      {
        id: 3,
        version: "v2.0.0",
        date: "01 Octobre 2023",
        category: "Optimisation",
        changes: [
          "Amélioration des FPS en centre-ville",
          "Réduction du poids des textures custom",
          "Optimisation de la base de données",
        ],
        sortOrder: 2,
      },
    ],
    galleryItems: [
      {
        id: 1,
        imageUrl: "/slide1.png",
        description: "Exemple : remplace par ton URL d’image (Imgur, Discord CDN, etc.) et ta légende.",
        sortOrder: 0,
      },
      {
        id: 2,
        imageUrl: "/slide2.png",
        description: "Deuxième visuel d’illustration — tout est éditable depuis l’onglet Galerie du panneau admin.",
        sortOrder: 1,
      },
    ],
  };
}

function readDb(): Db {
  if (typeof localStorage === "undefined") return defaultDb();
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return defaultDb();
    const parsed = JSON.parse(raw) as Partial<Db>;
    const base = defaultDb();
    return {
      jobs: Array.isArray(parsed.jobs) ? parsed.jobs : base.jobs,
      illegal: Array.isArray(parsed.illegal)
        ? parsed.illegal.map((o) => ({
            ...(o as IllegalOrg),
            segment: normalizeIllegalSegment((o as IllegalOrg).segment),
          }))
        : base.illegal,
      lore: Array.isArray(parsed.lore) ? parsed.lore : base.lore,
      staff: Array.isArray(parsed.staff) ? parsed.staff : base.staff,
      patchNotes: Array.isArray(parsed.patchNotes) ? parsed.patchNotes : base.patchNotes,
      galleryItems: Array.isArray(parsed.galleryItems) ? parsed.galleryItems : base.galleryItems,
    };
  } catch {
    return defaultDb();
  }
}

function writeDb(db: Db): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(db));
  } catch {
    /* quota / private mode */
  }
}

function nextId(rows: { id: number }[]): number {
  return rows.reduce((m, r) => Math.max(m, r.id), 0) + 1;
}

function pathnameFromUrl(url: string): string {
  try {
    const p = url.startsWith("http") ? new URL(url).pathname : url.split("?")[0] ?? url;
    return p.replace(/\/+$/, "") || "/";
  } catch {
    return url;
  }
}

function parseJsonBody(body: unknown): unknown {
  if (typeof body !== "string" || body.trim() === "") return undefined;
  try {
    return JSON.parse(body) as unknown;
  } catch {
    return undefined;
  }
}

function isMockAdmin(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  return sessionStorage.getItem(SESSION_KEY) === "1";
}

function setMockAdmin(on: boolean): void {
  if (typeof sessionStorage === "undefined") return;
  if (on) sessionStorage.setItem(SESSION_KEY, "1");
  else sessionStorage.removeItem(SESSION_KEY);
}

export type PalmaMockResult =
  | { ok: true; status: number; data: unknown }
  | { ok: false; status: number; data: unknown };

/** Active le mock : dev par défaut, sauf VITE_PALMA_USE_BACKEND=1 ou VITE_PALMA_MOCK_API=0 */
export function palmaMockApiEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const env = (import.meta as ImportMeta & { env?: Record<string, string | boolean | undefined> })
      .env ?? {};
    if (env.VITE_PALMA_USE_BACKEND === "1") return false;
    if (env.VITE_PALMA_MOCK_API === "0") return false;
    if (env.VITE_PALMA_MOCK_API === "1") return true;
    return Boolean(env.DEV);
  } catch {
    return false;
  }
}

export function dispatchPalmaMock(
  url: string,
  method: string,
  body: unknown,
): PalmaMockResult {
  const path = pathnameFromUrl(url);
  const m = method.toUpperCase();
  const json = parseJsonBody(body);

  const adminOnly = (): PalmaMockResult | null => {
    if (!isMockAdmin()) {
      return { ok: false, status: 401, data: { error: "Unauthorized" } };
    }
    return null;
  };

  if (path === "/api/healthz" && m === "GET") {
    return { ok: true, status: 200, data: { status: "ok" } satisfies HealthStatus };
  }

  if (path === "/api/admin/login" && m === "POST") {
    const obj = json && typeof json === "object" ? (json as Record<string, unknown>) : {};
    const u = typeof obj.username === "string" ? obj.username : "";
    const p = typeof obj.password === "string" ? obj.password.trim() : "";
    if (u === "admin" && p === MOCK_ADMIN_PASSWORD) {
      setMockAdmin(true);
      return { ok: true, status: 200, data: undefined };
    }
    return { ok: false, status: 401, data: { error: "Invalid credentials" } };
  }

  if (path === "/api/admin/logout" && m === "POST") {
    setMockAdmin(false);
    return { ok: true, status: 204, data: undefined };
  }

  if (path === "/api/admin/me" && m === "GET") {
    const me: AdminMe = { loggedIn: isMockAdmin() };
    return { ok: true, status: 200, data: me };
  }

  if (path === "/api/jobs" && m === "GET") {
    return { ok: true, status: 200, data: readDb().jobs };
  }

  if (path === "/api/illegal" && m === "GET") {
    return { ok: true, status: 200, data: readDb().illegal };
  }

  if (path === "/api/lore" && m === "GET") {
    const lore = [...readDb().lore].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
    return { ok: true, status: 200, data: lore };
  }

  if (path === "/api/patch-notes" && m === "GET") {
    const rows = [...readDb().patchNotes].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
    return { ok: true, status: 200, data: rows };
  }

  if (path === "/api/gallery" && m === "GET") {
    const rows = [...readDb().galleryItems].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
    return { ok: true, status: 200, data: rows };
  }

  if (path === "/api/staff" && m === "GET") {
    const staff = [...readDb().staff].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
    return { ok: true, status: 200, data: staff };
  }

  if (path === "/api/admin/staff" && m === "GET") {
    const denied = adminOnly();
    if (denied) return denied;
    const staff = [...readDb().staff].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
    return { ok: true, status: 200, data: staff };
  }

  const jobIdMatch = /^\/api\/admin\/jobs\/(\d+)$/.exec(path);
  if (jobIdMatch && m === "PATCH") {
    const denied = adminOnly();
    if (denied) return denied;
    const id = Number(jobIdMatch[1]);
    const patch = json as JobUpdate | undefined;
    const db = readDb();
    const idx = db.jobs.findIndex((j) => j.id === id);
    if (idx === -1) return { ok: false, status: 404, data: { error: "Not found" } };
    const cur = db.jobs[idx]!;
    const next: Job = {
      ...cur,
      ...(patch?.name !== undefined ? { name: patch.name } : {}),
      ...(patch?.category !== undefined ? { category: patch.category } : {}),
      ...(patch?.available !== undefined ? { available: patch.available } : {}),
      ...(patch?.discordLink !== undefined ? { discordLink: patch.discordLink } : {}),
      ...(patch?.imageUrl !== undefined ? { imageUrl: patch.imageUrl } : {}),
    };
    db.jobs[idx] = next;
    writeDb(db);
    return { ok: true, status: 200, data: next };
  }

  if (jobIdMatch && m === "DELETE") {
    const denied = adminOnly();
    if (denied) return denied;
    const id = Number(jobIdMatch[1]);
    const db = readDb();
    const before = db.jobs.length;
    db.jobs = db.jobs.filter((j) => j.id !== id);
    if (db.jobs.length === before) return { ok: false, status: 404, data: { error: "Not found" } };
    writeDb(db);
    return { ok: true, status: 204, data: undefined };
  }

  if (path === "/api/admin/jobs" && m === "POST") {
    const denied = adminOnly();
    if (denied) return denied;
    const input = json as JobInput | undefined;
    if (!input?.name?.trim() || !input?.category?.trim()) {
      return { ok: false, status: 400, data: { error: "Invalid body" } };
    }
    const db = readDb();
    const job: Job = {
      id: nextId(db.jobs),
      name: input.name.trim(),
      category: input.category.trim(),
      available: input.available ?? true,
      discordLink: input.discordLink ?? null,
      imageUrl: input.imageUrl ?? null,
    };
    db.jobs.push(job);
    writeDb(db);
    return { ok: true, status: 201, data: job };
  }

  const illegalIdMatch = /^\/api\/admin\/illegal\/(\d+)$/.exec(path);
  if (illegalIdMatch && m === "PATCH") {
    const denied = adminOnly();
    if (denied) return denied;
    const id = Number(illegalIdMatch[1]);
    const patch = json as IllegalOrgUpdate | undefined;
    const db = readDb();
    const idx = db.illegal.findIndex((o) => o.id === id);
    if (idx === -1) return { ok: false, status: 404, data: { error: "Not found" } };
    const cur = db.illegal[idx]!;
    const next: IllegalOrg = {
      ...cur,
      ...(patch?.name !== undefined ? { name: patch.name } : {}),
      ...(patch?.status !== undefined ? { status: patch.status } : {}),
      ...(patch?.activities !== undefined ? { activities: patch.activities } : {}),
      ...(patch?.discordLink !== undefined ? { discordLink: patch.discordLink } : {}),
      ...(patch?.imageUrl !== undefined ? { imageUrl: patch.imageUrl } : {}),
      ...(patch?.segment !== undefined ? { segment: normalizeIllegalSegment(patch.segment) } : {}),
    };
    db.illegal[idx] = next;
    writeDb(db);
    return { ok: true, status: 200, data: next };
  }

  if (illegalIdMatch && m === "DELETE") {
    const denied = adminOnly();
    if (denied) return denied;
    const id = Number(illegalIdMatch[1]);
    const db = readDb();
    const before = db.illegal.length;
    db.illegal = db.illegal.filter((o) => o.id !== id);
    if (db.illegal.length === before) return { ok: false, status: 404, data: { error: "Not found" } };
    writeDb(db);
    return { ok: true, status: 204, data: undefined };
  }

  if (path === "/api/admin/illegal" && m === "POST") {
    const denied = adminOnly();
    if (denied) return denied;
    const input = json as IllegalOrgInput | undefined;
    if (!input?.name?.trim() || !Array.isArray(input.activities) || input.activities.length === 0) {
      return { ok: false, status: 400, data: { error: "Invalid body" } };
    }
    const db = readDb();
    const org: IllegalOrg = {
      id: nextId(db.illegal),
      name: input.name.trim(),
      status: input.status,
      activities: input.activities,
      discordLink: input.discordLink ?? null,
      imageUrl: input.imageUrl ?? null,
      segment: normalizeIllegalSegment(input.segment),
    };
    db.illegal.push(org);
    writeDb(db);
    return { ok: true, status: 201, data: org };
  }

  const loreIdMatch = /^\/api\/admin\/lore\/(\d+)$/.exec(path);
  if (loreIdMatch && m === "PATCH") {
    const denied = adminOnly();
    if (denied) return denied;
    const id = Number(loreIdMatch[1]);
    const patch = json as LoreUpdate | undefined;
    const db = readDb();
    const idx = db.lore.findIndex((l) => l.id === id);
    if (idx === -1) return { ok: false, status: 404, data: { error: "Not found" } };
    const cur = db.lore[idx]!;
    const next: LoreEntry = {
      ...cur,
      ...(patch?.title !== undefined ? { title: patch.title } : {}),
      ...(patch?.summary !== undefined ? { summary: patch.summary } : {}),
      ...(patch?.sortOrder !== undefined ? { sortOrder: patch.sortOrder } : {}),
      ...(patch?.imageUrl !== undefined ? { imageUrl: patch.imageUrl } : {}),
    };
    db.lore[idx] = next;
    writeDb(db);
    return { ok: true, status: 200, data: next };
  }

  if (loreIdMatch && m === "DELETE") {
    const denied = adminOnly();
    if (denied) return denied;
    const id = Number(loreIdMatch[1]);
    const db = readDb();
    const before = db.lore.length;
    db.lore = db.lore.filter((l) => l.id !== id);
    if (db.lore.length === before) return { ok: false, status: 404, data: { error: "Not found" } };
    writeDb(db);
    return { ok: true, status: 204, data: undefined };
  }

  if (path === "/api/admin/lore" && m === "POST") {
    const denied = adminOnly();
    if (denied) return denied;
    const input = json as LoreInput | undefined;
    if (!input?.title?.trim() || !input?.summary?.trim()) {
      return { ok: false, status: 400, data: { error: "Invalid body" } };
    }
    const db = readDb();
    const row: LoreEntry = {
      id: nextId(db.lore),
      title: input.title.trim(),
      summary: input.summary.trim(),
      sortOrder: input.sortOrder ?? 0,
      imageUrl: input.imageUrl ?? null,
    };
    db.lore.push(row);
    writeDb(db);
    return { ok: true, status: 201, data: row };
  }

  const patchNoteIdMatch = /^\/api\/admin\/patch-notes\/(\d+)$/.exec(path);
  if (patchNoteIdMatch && m === "PATCH") {
    const denied = adminOnly();
    if (denied) return denied;
    const id = Number(patchNoteIdMatch[1]);
    const patch = json as PatchNoteUpdate | undefined;
    const db = readDb();
    const idx = db.patchNotes.findIndex((p) => p.id === id);
    if (idx === -1) return { ok: false, status: 404, data: { error: "Not found" } };
    const cur = db.patchNotes[idx]!;
    const next: PatchNote = {
      ...cur,
      ...(patch?.version !== undefined ? { version: patch.version } : {}),
      ...(patch?.date !== undefined ? { date: patch.date } : {}),
      ...(patch?.category !== undefined ? { category: patch.category } : {}),
      ...(patch?.changes !== undefined ? { changes: patch.changes } : {}),
      ...(patch?.sortOrder !== undefined ? { sortOrder: patch.sortOrder } : {}),
    };
    db.patchNotes[idx] = next;
    writeDb(db);
    return { ok: true, status: 200, data: next };
  }

  if (patchNoteIdMatch && m === "DELETE") {
    const denied = adminOnly();
    if (denied) return denied;
    const id = Number(patchNoteIdMatch[1]);
    const db = readDb();
    const before = db.patchNotes.length;
    db.patchNotes = db.patchNotes.filter((p) => p.id !== id);
    if (db.patchNotes.length === before) return { ok: false, status: 404, data: { error: "Not found" } };
    writeDb(db);
    return { ok: true, status: 204, data: undefined };
  }

  if (path === "/api/admin/patch-notes" && m === "POST") {
    const denied = adminOnly();
    if (denied) return denied;
    const input = json as PatchNoteInput | undefined;
    if (
      !input?.version?.trim() ||
      !input?.date?.trim() ||
      !input?.category?.trim() ||
      !Array.isArray(input.changes) ||
      input.changes.length === 0
    ) {
      return { ok: false, status: 400, data: { error: "Invalid body" } };
    }
    const db = readDb();
    const row: PatchNote = {
      id: nextId(db.patchNotes),
      version: input.version.trim(),
      date: input.date.trim(),
      category: input.category.trim(),
      changes: input.changes,
      sortOrder: input.sortOrder ?? 0,
    };
    db.patchNotes.push(row);
    writeDb(db);
    return { ok: true, status: 201, data: row };
  }

  const galleryIdMatch = /^\/api\/admin\/gallery\/(\d+)$/.exec(path);
  if (galleryIdMatch && m === "PATCH") {
    const denied = adminOnly();
    if (denied) return denied;
    const id = Number(galleryIdMatch[1]);
    const patch = json as GalleryItemUpdate | undefined;
    const db = readDb();
    const idx = db.galleryItems.findIndex((g) => g.id === id);
    if (idx === -1) return { ok: false, status: 404, data: { error: "Not found" } };
    const cur = db.galleryItems[idx]!;
    const next: GalleryItem = {
      ...cur,
      ...(patch?.imageUrl !== undefined ? { imageUrl: patch.imageUrl.trim() } : {}),
      ...(patch?.description !== undefined ? { description: patch.description.trim() } : {}),
      ...(patch?.sortOrder !== undefined ? { sortOrder: patch.sortOrder } : {}),
    };
    db.galleryItems[idx] = next;
    writeDb(db);
    return { ok: true, status: 200, data: next };
  }

  if (galleryIdMatch && m === "DELETE") {
    const denied = adminOnly();
    if (denied) return denied;
    const id = Number(galleryIdMatch[1]);
    const db = readDb();
    const before = db.galleryItems.length;
    db.galleryItems = db.galleryItems.filter((g) => g.id !== id);
    if (db.galleryItems.length === before) return { ok: false, status: 404, data: { error: "Not found" } };
    writeDb(db);
    return { ok: true, status: 204, data: undefined };
  }

  if (path === "/api/admin/gallery" && m === "POST") {
    const denied = adminOnly();
    if (denied) return denied;
    const input = json as GalleryItemInput | undefined;
    if (!input?.imageUrl?.trim()) {
      return { ok: false, status: 400, data: { error: "Invalid body" } };
    }
    const db = readDb();
    const row: GalleryItem = {
      id: nextId(db.galleryItems),
      imageUrl: input.imageUrl.trim(),
      description: (input.description ?? "").trim(),
      sortOrder: input.sortOrder ?? 0,
    };
    db.galleryItems.push(row);
    writeDb(db);
    return { ok: true, status: 201, data: row };
  }

  const staffIdMatch = /^\/api\/admin\/staff\/(\d+)$/.exec(path);
  if (staffIdMatch && m === "PATCH") {
    const denied = adminOnly();
    if (denied) return denied;
    const id = Number(staffIdMatch[1]);
    const patch = json as StaffUpdate | undefined;
    const db = readDb();
    const idx = db.staff.findIndex((s) => s.id === id);
    if (idx === -1) return { ok: false, status: 404, data: { error: "Not found" } };
    const cur = db.staff[idx]!;
    const next: Staff = {
      ...cur,
      ...(patch?.pseudo !== undefined ? { pseudo: patch.pseudo } : {}),
      ...(patch?.role !== undefined ? { role: patch.role } : {}),
      ...(patch?.description !== undefined ? { description: patch.description } : {}),
      ...(patch?.category !== undefined ? { category: patch.category } : {}),
      ...(patch?.avatarUrl !== undefined ? { avatarUrl: patch.avatarUrl } : {}),
      ...(patch?.sortOrder !== undefined ? { sortOrder: patch.sortOrder } : {}),
    };
    db.staff[idx] = next;
    writeDb(db);
    return { ok: true, status: 200, data: next };
  }

  if (staffIdMatch && m === "DELETE") {
    const denied = adminOnly();
    if (denied) return denied;
    const id = Number(staffIdMatch[1]);
    const db = readDb();
    const before = db.staff.length;
    db.staff = db.staff.filter((s) => s.id !== id);
    if (db.staff.length === before) return { ok: false, status: 404, data: { error: "Not found" } };
    writeDb(db);
    return { ok: true, status: 204, data: undefined };
  }

  if (path === "/api/admin/staff" && m === "POST") {
    const denied = adminOnly();
    if (denied) return denied;
    const input = json as StaffInput | undefined;
    if (!input?.pseudo?.trim() || !input?.role?.trim() || !input?.description?.trim() || !input?.category?.trim()) {
      return { ok: false, status: 400, data: { error: "Invalid body" } };
    }
    const db = readDb();
    const row: Staff = {
      id: nextId(db.staff),
      pseudo: input.pseudo.trim(),
      role: input.role.trim(),
      description: input.description.trim(),
      category: input.category.trim(),
      avatarUrl: input.avatarUrl ?? null,
      sortOrder: input.sortOrder ?? 0,
    };
    db.staff.push(row);
    writeDb(db);
    return { ok: true, status: 201, data: row };
  }

  return { ok: false, status: 404, data: { error: "Mock route not found", path, method: m } };
}
