import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  useAdminMe, 
  useAdminLogin, 
  useAdminLogout, 
  useAdminListStaff, 
  useListJobs, 
  useListIllegalOrgs,
  useListLore,
  useListPatchNotes,
  useUpdateJob,
  useCreateJob,
  useDeleteJob,
  useUpdateIllegalOrg,
  useCreateIllegalOrg,
  useDeleteIllegalOrg,
  useCreateStaff,
  useUpdateStaff,
  useDeleteStaff,
  useCreateLore,
  useUpdateLore,
  useDeleteLore,
  useCreatePatchNote,
  useUpdatePatchNote,
  useDeletePatchNote,
  useListGallery,
  useCreateGalleryItem,
  useUpdateGalleryItem,
  useDeleteGalleryItem,
  useHealthCheck,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  getAdminMeQueryKey, 
  getListJobsQueryKey, 
  getListIllegalOrgsQueryKey, 
  getListLoreQueryKey,
  getListPatchNotesQueryKey,
  getListGalleryQueryKey,
  getAdminListStaffQueryKey, 
  getListStaffQueryKey,
  getHealthCheckQueryKey,
  palmaMockApiEnabled,
} from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AdminImageFromDevice } from "@/components/admin/AdminImageFromDevice";

export default function Admin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: me, isLoading: meLoading } = useAdminMe();
  const loginMutation = useAdminLogin();
  const logoutMutation = useAdminLogout();

  const [password, setPassword] = useState("");

  const health = useHealthCheck({
    query: {
      queryKey: getHealthCheckQueryKey(),
      refetchInterval: 12_000,
      retry: 1,
      enabled: !palmaMockApiEnabled(),
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(
      { data: { username: "admin", password } },
      {
        onSuccess: () => {
          toast({ title: "Connecté avec succès" });
          queryClient.invalidateQueries({ queryKey: getAdminMeQueryKey() });
        },
        onError: (err: unknown) => {
          let description: string | undefined;
          if (
            typeof err === "object" &&
            err !== null &&
            "status" in err &&
            "message" in err
          ) {
            const apiErr = err as { status: number; message: string };
            description =
              apiErr.status === 401
                ? "Identifiants incorrects. Vérifie le mot de passe ou la configuration de l’API (ADMIN_PASSWORD, etc.)."
                : apiErr.message;
          } else if (err instanceof TypeError) {
            description = `${err.message} — l’API est-elle démarrée ? (proxy Vite → port 3001, ou pnpm run dev:stack dans palma-fa)`;
          } else if (err instanceof Error) {
            description = err.message;
          }
          toast({
            title: "Connexion impossible",
            description,
            variant: "destructive",
          });
        },
      },
    );
  };

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminMeQueryKey() });
        setLocation("/");
      }
    });
  };

  if (meLoading) return <div className="p-8 text-center">Chargement...</div>;

  if (!me?.loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-lg border-primary/20">
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-2xl">Panneau contenu</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                {palmaMockApiEnabled() ? (
                  <Badge className="border-transparent bg-emerald-800 text-white hover:bg-emerald-800">
                    Mode local — prêt
                  </Badge>
                ) : health.isLoading ? (
                  <Badge variant="secondary">API…</Badge>
                ) : health.isError || !health.data ? (
                  <Badge variant="destructive">API injoignable</Badge>
                ) : (
                  <Badge className="border-transparent bg-emerald-700 text-white hover:bg-emerald-700">
                    API OK
                  </Badge>
                )}
              </div>
            </div>
            <CardDescription className="text-sm leading-relaxed">
              {palmaMockApiEnabled() ? (
                <>
                  <strong>Données d&apos;exemple</strong> stockées dans ton navigateur (localStorage). Tu peux tout modifier ici ; la page d&apos;accueil lit les mêmes données (métiers, lore, nouveautés, galerie, etc.). Utilise le <strong>mot de passe admin</strong> fourni par l&apos;équipe (il n&apos;est pas affiché ici). Pour parler à un vrai serveur PostgreSQL/Express en dev, définis{" "}
                  <code className="rounded bg-muted px-1 py-0.5 text-xs">VITE_PALMA_USE_BACKEND=1</code> et lance l&apos;API.
                </>
              ) : (
                <>
                  Gère les <strong>métiers</strong>, les <strong>nouveautés</strong>, la <strong>galerie</strong>, le <strong>lore</strong>, l&apos;<strong>illégal</strong> et l&apos;<strong>équipe</strong> une fois connecté. Commande tout-en-un :{" "}
                  <code className="rounded bg-muted px-1 py-0.5 text-xs">pnpm run dev:stack</code> dans{" "}
                  <code className="rounded bg-muted px-1 py-0.5 text-xs">artifacts/palma-fa</code> (API sur le port{" "}
                  <code className="text-xs">3001</code>, proxy Vite par défaut). Sinon, lance l&apos;API toi-même et vérifie{" "}
                  <code className="text-xs">VITE_API_PROXY_TARGET</code>. Configure l&apos;API avec la variable d&apos;environnement{" "}
                  <code className="text-xs">ADMIN_PASSWORD</code> : ce secret ne doit jamais apparaître dans l&apos;interface du site. Secours :{" "}
                  <code className="text-xs">ALLOW_OPEN_ADMIN=true</code> pour accepter tout mot de passe.
                </>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label>Mot de passe</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="Mot de passe"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                Accéder
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Panneau Palma FA</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Métiers, nouveautés, galerie photos, illégal, lore et équipe — tout part d&apos;ici vers le site public.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setLocation("/")}>Retour au site</Button>
            <Button variant="destructive" onClick={handleLogout}>Déconnexion</Button>
          </div>
        </div>

        <Tabs defaultValue="jobs" className="w-full">
          <TabsList className="flex h-auto w-full flex-wrap gap-1 bg-muted/40 p-1">
            <TabsTrigger value="jobs" className="flex-1 min-w-[5.5rem]">Métiers</TabsTrigger>
            <TabsTrigger value="illegal" className="flex-1 min-w-[5.5rem]">Illégal</TabsTrigger>
            <TabsTrigger value="lore" className="flex-1 min-w-[5.5rem]">Lore</TabsTrigger>
            <TabsTrigger value="nouveautes" className="flex-1 min-w-[5.5rem]">Nouveautés</TabsTrigger>
            <TabsTrigger value="galerie" className="flex-1 min-w-[5.5rem]">Galerie</TabsTrigger>
            <TabsTrigger value="staff" className="flex-1 min-w-[5.5rem]">Équipe</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs">
            <JobsAdmin />
          </TabsContent>
          <TabsContent value="illegal">
            <IllegalAdmin />
          </TabsContent>
          <TabsContent value="lore">
            <LoreAdmin />
          </TabsContent>
          <TabsContent value="nouveautes">
            <PatchNotesAdmin />
          </TabsContent>
          <TabsContent value="galerie">
            <GalleryAdmin />
          </TabsContent>
          <TabsContent value="staff">
            <StaffAdmin />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function JobsAdmin() {
  const { data: jobs } = useListJobs();
  const jobsList = Array.isArray(jobs) ? jobs : [];
  const updateJob = useUpdateJob();
  const createJob = useCreateJob();
  const deleteJob = useDeleteJob();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  type JobEdit = { name: string; category: string; available: boolean; discordLink: string; imageUrl: string };
  const [edits, setEdits] = useState<Record<number, JobEdit>>({});
  const [newJob, setNewJob] = useState({
    name: "",
    category: "Service Public",
    available: true,
    discordLink: "",
    imageUrl: "",
  });

  useEffect(() => {
    const list = Array.isArray(jobs) ? jobs : [];
    const initial: Record<number, JobEdit> = {};
    list.forEach((j) => {
      initial[j.id] = {
        name: j.name,
        category: j.category,
        available: j.available,
        discordLink: j.discordLink || "",
        imageUrl: j.imageUrl || "",
      };
    });
    setEdits(initial);
  }, [jobs]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createJob.mutate(
      {
        data: {
          name: newJob.name.trim(),
          category: newJob.category.trim(),
          available: newJob.available,
          discordLink: newJob.discordLink.trim() || null,
          imageUrl: newJob.imageUrl.trim() || null,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Métier créé" });
          setNewJob({ name: "", category: "Service Public", available: true, discordLink: "", imageUrl: "" });
          queryClient.invalidateQueries({ queryKey: getListJobsQueryKey() });
        },
      },
    );
  };

  const handleSave = (id: number) => {
    const edit = edits[id];
    if (!edit) return;
    updateJob.mutate(
      {
        id,
        data: {
          name: edit.name,
          category: edit.category,
          available: edit.available,
          discordLink: edit.discordLink.trim() || null,
          imageUrl: edit.imageUrl.trim() || null,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Métier mis à jour" });
          queryClient.invalidateQueries({ queryKey: getListJobsQueryKey() });
        },
      },
    );
  };

  const handleDelete = (id: number) => {
    if (!confirm("Supprimer ce métier ?")) return;
    deleteJob.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Métier supprimé" });
          queryClient.invalidateQueries({ queryKey: getListJobsQueryKey() });
        },
      },
    );
  };

  if (jobs === undefined) return <div>Chargement...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des métiers</CardTitle>
        <CardDescription>Ajoutez ou modifiez les métiers affichés sur la page d&apos;accueil.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <form onSubmit={handleCreate} className="grid gap-4 p-4 rounded-lg border border-border bg-card/50 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label>Nouveau métier — nom</Label>
            <Input value={newJob.name} onChange={(e) => setNewJob({ ...newJob, name: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label>Catégorie</Label>
            <Input value={newJob.category} onChange={(e) => setNewJob({ ...newJob, category: e.target.value })} required />
          </div>
          <div className="space-y-2 flex items-end gap-3">
            <div className="flex items-center gap-2">
              <Switch checked={newJob.available} onCheckedChange={(c) => setNewJob({ ...newJob, available: c })} id="nj-av" />
              <Label htmlFor="nj-av">Disponible</Label>
            </div>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Lien Discord (optionnel)</Label>
            <Input value={newJob.discordLink} onChange={(e) => setNewJob({ ...newJob, discordLink: e.target.value })} placeholder="https://discord.gg/..." />
          </div>
          <div className="space-y-2 md:col-span-2">
            <AdminImageFromDevice
              label="Image du métier (optionnel)"
              value={newJob.imageUrl}
              onChange={(v) => setNewJob({ ...newJob, imageUrl: v })}
            />
          </div>
          <Button type="submit" className="md:col-span-2" disabled={createJob.isPending}>
            Ajouter le métier
          </Button>
        </form>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Disponible</TableHead>
              <TableHead>Discord</TableHead>
              <TableHead className="min-w-[160px]">Image</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobsList.map((job) => {
              const edit = edits[job.id] ?? {
                name: job.name,
                category: job.category,
                available: job.available,
                discordLink: job.discordLink || "",
                imageUrl: job.imageUrl || "",
              };
              return (
                <TableRow key={job.id}>
                  <TableCell>
                    <Input
                      value={edit.name}
                      onChange={(e) =>
                        setEdits((prev) => ({
                          ...prev,
                          [job.id]: { ...edit, name: e.target.value },
                        }))
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={edit.category}
                      onChange={(e) =>
                        setEdits((prev) => ({
                          ...prev,
                          [job.id]: { ...edit, category: e.target.value },
                        }))
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={edit.available}
                      onCheckedChange={(c) =>
                        setEdits((prev) => ({
                          ...prev,
                          [job.id]: { ...edit, available: c },
                        }))
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={edit.discordLink}
                      onChange={(e) =>
                        setEdits((prev) => ({
                          ...prev,
                          [job.id]: { ...edit, discordLink: e.target.value },
                        }))
                      }
                      placeholder="https://..."
                    />
                  </TableCell>
                  <TableCell>
                    <AdminImageFromDevice
                      compact
                      value={edit.imageUrl}
                      onChange={(v) =>
                        setEdits((prev) => ({
                          ...prev,
                          [job.id]: { ...edit, imageUrl: v },
                        }))
                      }
                    />
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" onClick={() => handleSave(job.id)} disabled={updateJob.isPending}>
                      Enregistrer
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(job.id)} disabled={deleteJob.isPending}>
                      Supprimer
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function IllegalAdmin() {
  const { data: orgs } = useListIllegalOrgs();
  const orgsList = Array.isArray(orgs) ? orgs : [];
  const updateOrg = useUpdateIllegalOrg();
  const createIllegalOrg = useCreateIllegalOrg();
  const deleteIllegalOrg = useDeleteIllegalOrg();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  type OrgEdit = { name: string; status: string; segment: string; activitiesText: string; discordLink: string; imageUrl: string };
  const [edits, setEdits] = useState<Record<number, OrgEdit>>({});
  const [newOrg, setNewOrg] = useState({
    name: "",
    status: "Recrute",
    segment: "Organisation",
    activitiesText: "",
    discordLink: "",
    imageUrl: "",
  });

  useEffect(() => {
    const list = Array.isArray(orgs) ? orgs : [];
    const initial: Record<number, OrgEdit> = {};
    list.forEach((o) => {
      initial[o.id] = {
        name: o.name,
        status: o.status,
        segment: o.segment ?? "Organisation",
        activitiesText: o.activities.join("\n"),
        discordLink: o.discordLink || "",
        imageUrl: o.imageUrl || "",
      };
    });
    setEdits(initial);
  }, [orgs]);

  const handleCreateOrg = (e: React.FormEvent) => {
    e.preventDefault();
    const activities = newOrg.activitiesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (activities.length === 0) {
      toast({ title: "Ajoutez au moins une activité (une par ligne)", variant: "destructive" });
      return;
    }
    createIllegalOrg.mutate(
      {
        data: {
          name: newOrg.name.trim(),
          status: newOrg.status,
          segment: newOrg.segment,
          activities,
          discordLink: newOrg.discordLink.trim() || null,
          imageUrl: newOrg.imageUrl.trim() || null,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Organisation créée" });
          setNewOrg({ name: "", status: "Recrute", segment: "Organisation", activitiesText: "", discordLink: "", imageUrl: "" });
          queryClient.invalidateQueries({ queryKey: getListIllegalOrgsQueryKey() });
        },
      },
    );
  };

  const handleSave = (id: number) => {
    const edit = edits[id];
    if (!edit) return;
    const activities = edit.activitiesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (activities.length === 0) {
      toast({ title: "Au moins une activité (une ligne non vide)", variant: "destructive" });
      return;
    }
    updateOrg.mutate(
      {
        id,
        data: {
          name: edit.name.trim(),
          status: edit.status,
          segment: edit.segment,
          activities,
          discordLink: edit.discordLink.trim() || null,
          imageUrl: edit.imageUrl.trim() || null,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Organisation mise à jour" });
          queryClient.invalidateQueries({ queryKey: getListIllegalOrgsQueryKey() });
        },
      },
    );
  };

  const handleDeleteOrg = (id: number) => {
    if (!confirm("Supprimer cette organisation ?")) return;
    deleteIllegalOrg.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Supprimé" });
          queryClient.invalidateQueries({ queryKey: getListIllegalOrgsQueryKey() });
        },
      },
    );
  };

  if (orgs === undefined) return <div>Chargement...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion de l&apos;illégal</CardTitle>
        <CardDescription>
          Fiches « L&apos;Ombre de Palma » regroupées sur le site en <strong>Gangs</strong>, <strong>Organisations</strong> et{" "}
          <strong>Indépendants</strong> — choisissez le type pour chaque fiche.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <form onSubmit={handleCreateOrg} className="grid gap-4 p-4 rounded-lg border border-border bg-card/50">
          <div className="space-y-2">
            <Label>Nom</Label>
            <Input value={newOrg.name} onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label>Type (affichage site)</Label>
            <Select value={newOrg.segment} onValueChange={(v) => setNewOrg({ ...newOrg, segment: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Gang">Gang</SelectItem>
                <SelectItem value="Organisation">Organisation</SelectItem>
                <SelectItem value="Indépendant">Indépendant</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Statut</Label>
            <Select value={newOrg.status} onValueChange={(v) => setNewOrg({ ...newOrg, status: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Recrute">Recrute</SelectItem>
                <SelectItem value="Complet">Complet</SelectItem>
                <SelectItem value="Fermé">Fermé</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Activités (une par ligne)</Label>
            <Textarea value={newOrg.activitiesText} onChange={(e) => setNewOrg({ ...newOrg, activitiesText: e.target.value })} rows={4} />
          </div>
          <div className="space-y-2">
            <Label>Discord (optionnel)</Label>
            <Input value={newOrg.discordLink} onChange={(e) => setNewOrg({ ...newOrg, discordLink: e.target.value })} />
          </div>
          <div className="space-y-2">
            <AdminImageFromDevice
              label="Image de la fiche (optionnel)"
              value={newOrg.imageUrl}
              onChange={(v) => setNewOrg({ ...newOrg, imageUrl: v })}
            />
          </div>
          <Button type="submit" disabled={createIllegalOrg.isPending}>
            Ajouter l&apos;organisation
          </Button>
        </form>

        <div className="overflow-x-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[140px]">Nom</TableHead>
                <TableHead className="min-w-[120px]">Type</TableHead>
                <TableHead className="min-w-[120px]">Statut</TableHead>
                <TableHead className="min-w-[220px]">Activités (une par ligne)</TableHead>
                <TableHead className="min-w-[160px]">Discord</TableHead>
                <TableHead className="min-w-[200px]">Image</TableHead>
                <TableHead className="min-w-[140px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orgsList.map((org) => {
                const edit = edits[org.id] ?? {
                  name: org.name,
                  status: org.status,
                  segment: org.segment ?? "Organisation",
                  activitiesText: org.activities.join("\n"),
                  discordLink: org.discordLink || "",
                  imageUrl: org.imageUrl || "",
                };
                return (
                  <TableRow key={org.id}>
                    <TableCell className="align-top">
                      <Input
                        value={edit.name}
                        onChange={(e) =>
                          setEdits((prev) => ({
                            ...prev,
                            [org.id]: { ...edit, name: e.target.value },
                          }))
                        }
                      />
                    </TableCell>
                    <TableCell className="align-top">
                      <Select
                        value={edit.segment}
                        onValueChange={(v) =>
                          setEdits((prev) => ({
                            ...prev,
                            [org.id]: { ...edit, segment: v },
                          }))
                        }
                      >
                        <SelectTrigger className="w-[160px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Gang">Gang</SelectItem>
                          <SelectItem value="Organisation">Organisation</SelectItem>
                          <SelectItem value="Indépendant">Indépendant</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="align-top">
                      <Select
                        value={edit.status}
                        onValueChange={(v) =>
                          setEdits((prev) => ({
                            ...prev,
                            [org.id]: { ...edit, status: v },
                          }))
                        }
                      >
                        <SelectTrigger className="w-[160px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Recrute">Recrute</SelectItem>
                          <SelectItem value="Complet">Complet</SelectItem>
                          <SelectItem value="Fermé">Fermé</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="align-top">
                      <Textarea
                        value={edit.activitiesText}
                        onChange={(e) =>
                          setEdits((prev) => ({
                            ...prev,
                            [org.id]: { ...edit, activitiesText: e.target.value },
                          }))
                        }
                        rows={4}
                        className="min-w-[200px]"
                      />
                    </TableCell>
                    <TableCell className="align-top">
                      <Input
                        value={edit.discordLink}
                        onChange={(e) =>
                          setEdits((prev) => ({
                            ...prev,
                            [org.id]: { ...edit, discordLink: e.target.value },
                          }))
                        }
                        placeholder="https://discord.gg/..."
                      />
                    </TableCell>
                    <TableCell className="align-top">
                      <AdminImageFromDevice
                        compact
                        value={edit.imageUrl}
                        onChange={(v) =>
                          setEdits((prev) => ({
                            ...prev,
                            [org.id]: { ...edit, imageUrl: v },
                          }))
                        }
                      />
                    </TableCell>
                    <TableCell className="align-top text-right space-x-2 whitespace-nowrap">
                      <Button size="sm" onClick={() => handleSave(org.id)} disabled={updateOrg.isPending}>
                        Enregistrer
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteOrg(org.id)} disabled={deleteIllegalOrg.isPending}>
                        Supprimer
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function GalleryAdmin() {
  const { data: rows } = useListGallery();
  const list = Array.isArray(rows)
    ? [...rows].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)
    : [];
  const createG = useCreateGalleryItem();
  const updateG = useUpdateGalleryItem();
  const deleteG = useDeleteGalleryItem();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [newItem, setNewItem] = useState({ imageUrl: "", description: "", sortOrder: 0 });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editItem, setEditItem] = useState({ imageUrl: "", description: "", sortOrder: 0 });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.imageUrl.trim()) {
      toast({ title: "Ajoutez une image avec « Choisir une photo »", variant: "destructive" });
      return;
    }
    createG.mutate(
      {
        data: {
          imageUrl: newItem.imageUrl.trim(),
          description: newItem.description.trim(),
          sortOrder: newItem.sortOrder,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Image ajoutée à la galerie" });
          setNewItem({ imageUrl: "", description: "", sortOrder: 0 });
          queryClient.invalidateQueries({ queryKey: getListGalleryQueryKey() });
        },
      },
    );
  };

  const handleUpdate = (id: number) => {
    if (!editItem.imageUrl.trim()) {
      toast({ title: "Une image est requise — utilisez « Choisir une photo »", variant: "destructive" });
      return;
    }
    updateG.mutate(
      {
        id,
        data: {
          imageUrl: editItem.imageUrl.trim(),
          description: editItem.description.trim(),
          sortOrder: editItem.sortOrder,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Galerie mise à jour" });
          setEditingId(null);
          queryClient.invalidateQueries({ queryKey: getListGalleryQueryKey() });
        },
      },
    );
  };

  const handleDelete = (id: number) => {
    if (!confirm("Retirer cette image de la galerie ?")) return;
    deleteG.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Supprimé" });
          queryClient.invalidateQueries({ queryKey: getListGalleryQueryKey() });
        },
      },
    );
  };

  if (rows === undefined) return <div>Chargement...</div>;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Galerie (images + descriptions)</CardTitle>
          <CardDescription>
            Choisissez une photo sur votre appareil : elle est compressée puis enregistrée pour la page d&apos;accueil. Ajoutez la description affichée sous l&apos;image.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid gap-4 max-w-3xl md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <AdminImageFromDevice
                label="Photo"
                value={newItem.imageUrl}
                onChange={(v) => setNewItem({ ...newItem, imageUrl: v })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Description</Label>
              <Textarea
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                rows={3}
                placeholder="Texte affiché sous la photo sur le site"
              />
            </div>
            <div className="space-y-2">
              <Label>Ordre d&apos;affichage</Label>
              <Input
                type="number"
                value={newItem.sortOrder}
                onChange={(e) => setNewItem({ ...newItem, sortOrder: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-end md:col-span-2">
              <Button type="submit" disabled={createG.isPending}>
                Ajouter à la galerie
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardContent className="p-0">
              {editingId === item.id ? (
                <div className="space-y-3 p-4">
                  <AdminImageFromDevice
                    label="Photo"
                    value={editItem.imageUrl}
                    onChange={(v) => setEditItem({ ...editItem, imageUrl: v })}
                  />
                  <Textarea value={editItem.description} onChange={(e) => setEditItem({ ...editItem, description: e.target.value })} rows={3} />
                  <Input
                    type="number"
                    value={editItem.sortOrder}
                    onChange={(e) => setEditItem({ ...editItem, sortOrder: Number(e.target.value) || 0 })}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleUpdate(item.id)} disabled={updateG.isPending}>
                      Sauvegarder
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                      Annuler
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="relative aspect-video w-full bg-muted">
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.opacity = "0.35";
                      }}
                    />
                  </div>
                  <div className="space-y-3 p-4">
                    <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">{item.description || "—"}</p>
                    <p className="text-xs text-muted-foreground">Ordre : {item.sortOrder}</p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(item.id);
                          setEditItem({
                            imageUrl: item.imageUrl,
                            description: item.description,
                            sortOrder: item.sortOrder,
                          });
                        }}
                      >
                        Modifier
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)} disabled={deleteG.isPending}>
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function PatchNotesAdmin() {
  const { data: rows } = useListPatchNotes();
  const list = Array.isArray(rows)
    ? [...rows].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)
    : [];
  const createP = useCreatePatchNote();
  const updateP = useUpdatePatchNote();
  const deleteP = useDeletePatchNote();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [newRow, setNewRow] = useState({
    version: "",
    date: "",
    category: "Ajouts",
    changesText: "",
    sortOrder: 0,
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRow, setEditRow] = useState({
    version: "",
    date: "",
    category: "",
    changesText: "",
    sortOrder: 0,
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const changes = newRow.changesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (changes.length === 0) {
      toast({ title: "Ajoutez au moins une ligne de changement", variant: "destructive" });
      return;
    }
    createP.mutate(
      {
        data: {
          version: newRow.version.trim(),
          date: newRow.date.trim(),
          category: newRow.category.trim(),
          changes,
          sortOrder: newRow.sortOrder,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Patch ajouté" });
          setNewRow({ version: "", date: "", category: "Ajouts", changesText: "", sortOrder: 0 });
          queryClient.invalidateQueries({ queryKey: getListPatchNotesQueryKey() });
        },
      },
    );
  };

  const handleUpdate = (id: number) => {
    const changes = editRow.changesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (changes.length === 0) {
      toast({ title: "Au moins une ligne de changement", variant: "destructive" });
      return;
    }
    updateP.mutate(
      {
        id,
        data: {
          version: editRow.version.trim(),
          date: editRow.date.trim(),
          category: editRow.category.trim(),
          changes,
          sortOrder: editRow.sortOrder,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Patch mis à jour" });
          setEditingId(null);
          queryClient.invalidateQueries({ queryKey: getListPatchNotesQueryKey() });
        },
      },
    );
  };

  const handleDelete = (id: number) => {
    if (!confirm("Supprimer ce patch ?")) return;
    deleteP.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Supprimé" });
          queryClient.invalidateQueries({ queryKey: getListPatchNotesQueryKey() });
        },
      },
    );
  };

  if (rows === undefined) return <div>Chargement...</div>;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Nouveautés &amp; patch notes</CardTitle>
          <CardDescription>
            Version, date affichée sur le site, catégorie (filtre) et changements — une ligne = un point dans la liste.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid gap-4 max-w-3xl md:grid-cols-2">
            <div className="space-y-2">
              <Label>Version</Label>
              <Input
                value={newRow.version}
                onChange={(e) => setNewRow({ ...newRow, version: e.target.value })}
                required
                placeholder="v2.2.0"
              />
            </div>
            <div className="space-y-2">
              <Label>Date (texte)</Label>
              <Input
                value={newRow.date}
                onChange={(e) => setNewRow({ ...newRow, date: e.target.value })}
                required
                placeholder="14 mai 2026"
              />
            </div>
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Input value={newRow.category} onChange={(e) => setNewRow({ ...newRow, category: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Ordre (tri)</Label>
              <Input
                type="number"
                value={newRow.sortOrder}
                onChange={(e) => setNewRow({ ...newRow, sortOrder: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Changements (un par ligne)</Label>
              <Textarea value={newRow.changesText} onChange={(e) => setNewRow({ ...newRow, changesText: e.target.value })} rows={5} />
            </div>
            <Button type="submit" className="md:col-span-2" disabled={createP.isPending}>
              Ajouter le patch
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        {list.map((entry) => (
          <Card key={entry.id}>
            <CardContent className="pt-6 space-y-4">
              {editingId === entry.id ? (
                <>
                  <Input value={editRow.version} onChange={(e) => setEditRow({ ...editRow, version: e.target.value })} />
                  <Input value={editRow.date} onChange={(e) => setEditRow({ ...editRow, date: e.target.value })} />
                  <Input value={editRow.category} onChange={(e) => setEditRow({ ...editRow, category: e.target.value })} />
                  <Input
                    type="number"
                    value={editRow.sortOrder}
                    onChange={(e) => setEditRow({ ...editRow, sortOrder: Number(e.target.value) || 0 })}
                  />
                  <Textarea value={editRow.changesText} onChange={(e) => setEditRow({ ...editRow, changesText: e.target.value })} rows={5} />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleUpdate(entry.id)} disabled={updateP.isPending}>
                      Sauvegarder
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                      Annuler
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-bold text-lg">{entry.version}</h3>
                    <span className="text-xs text-muted-foreground">{entry.category}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{entry.date}</p>
                  <ul className="list-disc space-y-1 pl-5 text-sm">
                    {entry.changes.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground">Ordre d&apos;affichage : {entry.sortOrder}</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingId(entry.id);
                        setEditRow({
                          version: entry.version,
                          date: entry.date,
                          category: entry.category,
                          changesText: entry.changes.join("\n"),
                          sortOrder: entry.sortOrder,
                        });
                      }}
                    >
                      Modifier
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(entry.id)} disabled={deleteP.isPending}>
                      Supprimer
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function LoreAdmin() {
  const { data: lore } = useListLore();
  const loreList = Array.isArray(lore)
    ? [...lore].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)
    : [];
  const createLore = useCreateLore();
  const updateLore = useUpdateLore();
  const deleteLore = useDeleteLore();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [newEntry, setNewEntry] = useState({ title: "", summary: "", sortOrder: 0, imageUrl: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editEntry, setEditEntry] = useState({ title: "", summary: "", sortOrder: 0, imageUrl: "" });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createLore.mutate(
      {
        data: {
          title: newEntry.title.trim(),
          summary: newEntry.summary.trim(),
          sortOrder: newEntry.sortOrder,
          imageUrl: newEntry.imageUrl.trim() || null,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Entrée lore créée" });
          setNewEntry({ title: "", summary: "", sortOrder: 0, imageUrl: "" });
          queryClient.invalidateQueries({ queryKey: getListLoreQueryKey() });
        },
      },
    );
  };

  const handleUpdate = (id: number) => {
    updateLore.mutate(
      {
        id,
        data: {
          title: editEntry.title.trim(),
          summary: editEntry.summary.trim(),
          sortOrder: editEntry.sortOrder,
          imageUrl: editEntry.imageUrl.trim() || null,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Lore mis à jour" });
          setEditingId(null);
          queryClient.invalidateQueries({ queryKey: getListLoreQueryKey() });
        },
      },
    );
  };

  const handleDelete = (id: number) => {
    if (!confirm("Supprimer cette entrée ?")) return;
    deleteLore.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Supprimé" });
          queryClient.invalidateQueries({ queryKey: getListLoreQueryKey() });
        },
      },
    );
  };

  if (lore === undefined) return <div>Chargement...</div>;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Ajouter une entrée lore</CardTitle>
          <CardDescription>Texte affiché dans la section « Le Lore » — image optionnelle depuis votre galerie.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid gap-4 max-w-2xl">
            <div className="space-y-2">
              <Label>Titre</Label>
              <Input value={newEntry.title} onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Résumé</Label>
              <Textarea value={newEntry.summary} onChange={(e) => setNewEntry({ ...newEntry, summary: e.target.value })} required rows={4} />
            </div>
            <div className="space-y-2">
              <Label>Ordre d&apos;affichage</Label>
              <Input
                type="number"
                value={newEntry.sortOrder}
                onChange={(e) => setNewEntry({ ...newEntry, sortOrder: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <AdminImageFromDevice
                label="Image (optionnel)"
                value={newEntry.imageUrl}
                onChange={(v) => setNewEntry({ ...newEntry, imageUrl: v })}
              />
            </div>
            <Button type="submit" disabled={createLore.isPending}>
              Ajouter
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {loreList.map((entry) => (
          <Card key={entry.id}>
            <CardContent className="pt-6 space-y-4">
              {editingId === entry.id ? (
                <>
                  <Input value={editEntry.title} onChange={(e) => setEditEntry({ ...editEntry, title: e.target.value })} />
                  <Textarea value={editEntry.summary} onChange={(e) => setEditEntry({ ...editEntry, summary: e.target.value })} rows={4} />
                  <Input
                    type="number"
                    value={editEntry.sortOrder}
                    onChange={(e) => setEditEntry({ ...editEntry, sortOrder: Number(e.target.value) || 0 })}
                  />
                  <AdminImageFromDevice
                    label="Image (optionnel)"
                    value={editEntry.imageUrl}
                    onChange={(v) => setEditEntry({ ...editEntry, imageUrl: v })}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleUpdate(entry.id)} disabled={updateLore.isPending}>
                      Sauvegarder
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                      Annuler
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {entry.imageUrl?.trim() ? (
                    <img src={entry.imageUrl.trim()} alt="" className="max-h-40 w-full rounded-lg object-cover border border-border" />
                  ) : null}
                  <h3 className="font-bold text-lg">{entry.title}</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{entry.summary}</p>
                  <p className="text-xs text-muted-foreground">Ordre : {entry.sortOrder}</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingId(entry.id);
                        setEditEntry({ title: entry.title, summary: entry.summary, sortOrder: entry.sortOrder, imageUrl: entry.imageUrl || "" });
                      }}
                    >
                      Modifier
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(entry.id)} disabled={deleteLore.isPending}>
                      Supprimer
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function StaffAdmin() {
  const { data: staff } = useAdminListStaff();
  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();
  const deleteStaff = useDeleteStaff();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [newStaff, setNewStaff] = useState({ pseudo: "", role: "", description: "", category: "Support", avatarUrl: "", sortOrder: 0 });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStaff, setEditStaff] = useState({ pseudo: "", role: "", description: "", category: "", avatarUrl: "", sortOrder: 0 });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createStaff.mutate({ data: { ...newStaff, avatarUrl: newStaff.avatarUrl || null } }, {
      onSuccess: () => {
        toast({ title: "Membre ajouté" });
        setNewStaff({ pseudo: "", role: "", description: "", category: "Support", avatarUrl: "", sortOrder: 0 });
        queryClient.invalidateQueries({ queryKey: getAdminListStaffQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListStaffQueryKey() });
      }
    });
  };

  const handleUpdate = (id: number) => {
    updateStaff.mutate({ id, data: { ...editStaff, avatarUrl: editStaff.avatarUrl || null } }, {
      onSuccess: () => {
        toast({ title: "Membre mis à jour" });
        setEditingId(null);
        queryClient.invalidateQueries({ queryKey: getAdminListStaffQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListStaffQueryKey() });
      }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Supprimer ce membre ?")) {
      deleteStaff.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Membre supprimé" });
          queryClient.invalidateQueries({ queryKey: getAdminListStaffQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListStaffQueryKey() });
        }
      });
    }
  };

  if (!staff) return <div>Chargement...</div>;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader><CardTitle>Ajouter un membre</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Pseudo</Label>
              <Input value={newStaff.pseudo} onChange={e => setNewStaff({...newStaff, pseudo: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label>Rôle</Label>
              <Input value={newStaff.role} onChange={e => setNewStaff({...newStaff, role: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select value={newStaff.category} onValueChange={v => setNewStaff({...newStaff, category: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fondateur">Fondateur</SelectItem>
                  <SelectItem value="Co-Fondateur">Co-Fondateur</SelectItem>
                  <SelectItem value="Administration">Administration</SelectItem>
                  <SelectItem value="Modération">Modération</SelectItem>
                  <SelectItem value="Développeurs">Développeurs</SelectItem>
                  <SelectItem value="Support">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <AdminImageFromDevice
                label="Photo d’avatar (optionnel)"
                value={newStaff.avatarUrl}
                onChange={(v) => setNewStaff({ ...newStaff, avatarUrl: v })}
                maxEdge={512}
                quality={0.86}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Description</Label>
              <Textarea value={newStaff.description} onChange={e => setNewStaff({...newStaff, description: e.target.value})} required />
            </div>
            <Button type="submit" className="col-span-2">Ajouter</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {staff.map(s => (
          <Card key={s.id}>
            {editingId === s.id ? (
              <CardContent className="pt-6 space-y-4">
                <Input value={editStaff.pseudo} onChange={e => setEditStaff({...editStaff, pseudo: e.target.value})} />
                <Input value={editStaff.role} onChange={e => setEditStaff({...editStaff, role: e.target.value})} />
                <Select value={editStaff.category} onValueChange={v => setEditStaff({...editStaff, category: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fondateur">Fondateur</SelectItem>
                    <SelectItem value="Co-Fondateur">Co-Fondateur</SelectItem>
                    <SelectItem value="Administration">Administration</SelectItem>
                    <SelectItem value="Modération">Modération</SelectItem>
                    <SelectItem value="Développeurs">Développeurs</SelectItem>
                    <SelectItem value="Support">Support</SelectItem>
                  </SelectContent>
                </Select>
                <AdminImageFromDevice
                  label="Photo d’avatar (optionnel)"
                  value={editStaff.avatarUrl}
                  onChange={(v) => setEditStaff({ ...editStaff, avatarUrl: v })}
                  maxEdge={512}
                  quality={0.86}
                />
                <Textarea value={editStaff.description} onChange={e => setEditStaff({...editStaff, description: e.target.value})} />
                <div className="flex gap-2">
                  <Button onClick={() => handleUpdate(s.id)}>Sauver</Button>
                  <Button variant="outline" onClick={() => setEditingId(null)}>Annuler</Button>
                </div>
              </CardContent>
            ) : (
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{s.pseudo}</h3>
                    <p className="text-primary text-sm font-medium">{s.role} ({s.category})</p>
                  </div>
                  {s.avatarUrl && <img src={s.avatarUrl} alt={s.pseudo} className="w-12 h-12 rounded-full object-cover" />}
                </div>
                <p className="mt-4 text-muted-foreground text-sm">{s.description}</p>
                <div className="mt-6 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    setEditingId(s.id);
                    setEditStaff({ pseudo: s.pseudo, role: s.role, description: s.description, category: s.category, avatarUrl: s.avatarUrl || "", sortOrder: s.sortOrder });
                  }}>Modifier</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(s.id)}>Supprimer</Button>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
