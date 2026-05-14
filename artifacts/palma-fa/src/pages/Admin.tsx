import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  useAdminMe, 
  useAdminLogin, 
  useAdminLogout, 
  useAdminListStaff, 
  useListJobs, 
  useListIllegalOrgs,
  useUpdateJob,
  useUpdateIllegalOrg,
  useCreateStaff,
  useUpdateStaff,
  useDeleteStaff
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getAdminMeQueryKey, getListJobsQueryKey, getListIllegalOrgsQueryKey, getAdminListStaffQueryKey, getListStaffQueryKey } from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Admin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: me, isLoading: meLoading } = useAdminMe();
  const loginMutation = useAdminLogin();
  const logoutMutation = useAdminLogout();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ data: { username, password } }, {
      onSuccess: () => {
        toast({ title: "Connecté avec succès" });
        queryClient.invalidateQueries({ queryKey: getAdminMeQueryKey() });
      },
      onError: () => {
        toast({ title: "Identifiants invalides", variant: "destructive" });
      }
    });
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
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Administration Palma FA</CardTitle>
            <CardDescription>Veuillez vous connecter</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label>Nom d'utilisateur</Label>
                <Input value={username} onChange={e => setUsername(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Mot de passe</Label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                Se connecter
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dashboard Admin</h1>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setLocation("/")}>Retour au site</Button>
            <Button variant="destructive" onClick={handleLogout}>Déconnexion</Button>
          </div>
        </div>

        <Tabs defaultValue="jobs" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="jobs">Métiers</TabsTrigger>
            <TabsTrigger value="illegal">Illégal</TabsTrigger>
            <TabsTrigger value="staff">Équipe</TabsTrigger>
          </TabsList>
          
          <TabsContent value="jobs">
            <JobsAdmin />
          </TabsContent>
          <TabsContent value="illegal">
            <IllegalAdmin />
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
  const updateJob = useUpdateJob();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [edits, setEdits] = useState<Record<number, { available: boolean; discordLink: string }>>({});

  useEffect(() => {
    if (jobs) {
      const initial: typeof edits = {};
      jobs.forEach(j => {
        initial[j.id] = { available: j.available, discordLink: j.discordLink || "" };
      });
      setEdits(initial);
    }
  }, [jobs]);

  const handleSave = (id: number) => {
    const edit = edits[id];
    updateJob.mutate({ id, data: { available: edit.available, discordLink: edit.discordLink || null } }, {
      onSuccess: () => {
        toast({ title: "Métier mis à jour" });
        queryClient.invalidateQueries({ queryKey: getListJobsQueryKey() });
      }
    });
  };

  if (!jobs) return <div>Chargement...</div>;

  return (
    <Card>
      <CardHeader><CardTitle>Gestion des Métiers</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Disponible</TableHead>
              <TableHead>Lien Discord</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map(job => {
              const edit = edits[job.id] || { available: false, discordLink: "" };
              return (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.name}</TableCell>
                  <TableCell>{job.category}</TableCell>
                  <TableCell>
                    <Switch 
                      checked={edit.available} 
                      onCheckedChange={c => setEdits(prev => ({...prev, [job.id]: { ...prev[job.id], available: c }}))} 
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      value={edit.discordLink} 
                      onChange={e => setEdits(prev => ({...prev, [job.id]: { ...prev[job.id], discordLink: e.target.value }}))}
                      placeholder="https://discord.gg/..."
                    />
                  </TableCell>
                  <TableCell>
                    <Button onClick={() => handleSave(job.id)} disabled={updateJob.isPending}>Enregistrer</Button>
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
  const updateOrg = useUpdateIllegalOrg();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [edits, setEdits] = useState<Record<number, { status: string; discordLink: string }>>({});

  useEffect(() => {
    if (orgs) {
      const initial: typeof edits = {};
      orgs.forEach(o => {
        initial[o.id] = { status: o.status, discordLink: o.discordLink || "" };
      });
      setEdits(initial);
    }
  }, [orgs]);

  const handleSave = (id: number) => {
    const edit = edits[id];
    updateOrg.mutate({ id, data: { status: edit.status, discordLink: edit.discordLink || null } }, {
      onSuccess: () => {
        toast({ title: "Organisation mise à jour" });
        queryClient.invalidateQueries({ queryKey: getListIllegalOrgsQueryKey() });
      }
    });
  };

  if (!orgs) return <div>Chargement...</div>;

  return (
    <Card>
      <CardHeader><CardTitle>Gestion de l'Illégal</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Lien Discord</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orgs.map(org => {
              const edit = edits[org.id] || { status: "Recrute", discordLink: "" };
              return (
                <TableRow key={org.id}>
                  <TableCell className="font-medium">{org.name}</TableCell>
                  <TableCell>
                    <Select value={edit.status} onValueChange={v => setEdits(prev => ({...prev, [org.id]: { ...prev[org.id], status: v }}))}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Recrute">Recrute</SelectItem>
                        <SelectItem value="Complet">Complet</SelectItem>
                        <SelectItem value="Fermé">Fermé</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input 
                      value={edit.discordLink} 
                      onChange={e => setEdits(prev => ({...prev, [org.id]: { ...prev[org.id], discordLink: e.target.value }}))}
                      placeholder="https://discord.gg/..."
                    />
                  </TableCell>
                  <TableCell>
                    <Button onClick={() => handleSave(org.id)} disabled={updateOrg.isPending}>Enregistrer</Button>
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
              <Label>Avatar URL (optionnel)</Label>
              <Input value={newStaff.avatarUrl} onChange={e => setNewStaff({...newStaff, avatarUrl: e.target.value})} />
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
                <Input value={editStaff.avatarUrl} onChange={e => setEditStaff({...editStaff, avatarUrl: e.target.value})} placeholder="Avatar URL" />
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
