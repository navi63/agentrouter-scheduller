"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit2, CheckCircle2, XCircle, HelpCircle, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

function StatusBadge({ status }: { status: string }) {
  if (status === "ACTIVE") {
    return <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"><CheckCircle2 className="w-3 h-3 mr-1" /> Active</Badge>;
  }
  if (status === "EXPIRED") {
    return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20"><XCircle className="w-3 h-3 mr-1" /> Expired</Badge>;
  }
  return <Badge className="bg-slate-500/10 text-slate-400 hover:bg-slate-500/20"><HelpCircle className="w-3 h-3 mr-1" /> Unknown</Badge>;
}

export default function CookiesPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [label, setLabel] = useState("");
  const [agentRouterEntries, setAgentRouterEntries] = useState<{ name: string; value: string }[]>([
    { name: "", value: "" }
  ]);
  const [githubEntries, setGithubEntries] = useState<{ name: string; value: string }[]>([
    { name: "", value: "" }
  ]);

  const { data: cookies = [], isLoading } = useQuery({
    queryKey: ["cookies"],
    queryFn: async () => {
      const res = await fetch("/api/cookies");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newCookie: { label: string; agentRouterEntries: { name: string; value: string }[]; githubEntries: { name: string; value: string }[] }) => {
      const res = await fetch("/api/cookies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCookie),
      });
      if (!res.ok) throw new Error("Failed to create cookie");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cookies"] });
      toast.success("Cookie saved successfully");
      closeDialog();
    },
    onError: () => toast.error("Failed to save cookie"),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: number; label: string; agentRouterEntries: { name: string; value: string }[]; githubEntries: { name: string; value: string }[] }) => {
      const res = await fetch(`/api/cookies/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update cookie");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cookies"] });
      toast.success("Cookie updated successfully");
      closeDialog();
    },
    onError: () => toast.error("Failed to update cookie"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/cookies/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete cookie");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cookies"] });
      toast.success("Cookie deleted");
    },
    onError: () => toast.error("Failed to delete cookie"),
  });

  const validateMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/cookies/${id}/validate`, { method: "POST" });
      if (!res.ok) throw new Error("Validation failed");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["cookies"] });
      if (data.status === "ACTIVE") {
        toast.success(`Cookie is Active! User: ${data.username}`);
      } else {
        toast.error("Cookie is EXPIRED or invalid.");
      }
    },
    onError: () => toast.error("Validation request failed"),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, label, agentRouterEntries, githubEntries });
    } else {
      createMutation.mutate({ label, agentRouterEntries, githubEntries });
    }
  }

  function parseCookieString(cookieString: string) {
    if (!cookieString) return [{ name: "", value: "" }];
    const entries = cookieString.split(';').map((c: string) => {
      const [name, ...valueParts] = c.split('=');
      return { name: name.trim(), value: valueParts.join('=').trim() };
    }).filter((c: { name: string; value: string }) => c.name);
    return entries.length > 0 ? entries : [{ name: "", value: "" }];
  }

  function openEditDialog(cookie: any) {
    setEditingId(cookie.id);
    setLabel(cookie.label);
    setAgentRouterEntries(parseCookieString(cookie.agentRouterCookie || ""));
    setGithubEntries(parseCookieString(cookie.githubCookie || ""));
    setIsDialogOpen(true);
  }

  function closeDialog() {
    setIsDialogOpen(false);
    setEditingId(null);
    setLabel("");
    setAgentRouterEntries([{ name: "", value: "" }]);
    setGithubEntries([{ name: "", value: "" }]);
  }

  function addAgentRouterEntry() {
    setAgentRouterEntries([...agentRouterEntries, { name: "", value: "" }]);
  }

  function removeAgentRouterEntry(index: number) {
    setAgentRouterEntries(agentRouterEntries.filter((_, i) => i !== index));
  }

  function updateAgentRouterEntry(index: number, field: "name" | "value", value: string) {
    const updated = agentRouterEntries.map((entry, i) =>
      i === index ? { ...entry, [field]: value } : entry
    );
    setAgentRouterEntries(updated);
  }

  function addGithubEntry() {
    setGithubEntries([...githubEntries, { name: "", value: "" }]);
  }

  function removeGithubEntry(index: number) {
    setGithubEntries(githubEntries.filter((_, i) => i !== index));
  }

  function updateGithubEntry(index: number, field: "name" | "value", value: string) {
    const updated = githubEntries.map((entry, i) =>
      i === index ? { ...entry, [field]: value } : entry
    );
    setGithubEntries(updated);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cookies Management</h1>
          <p className="text-slate-400">Add and manage session cookies for automated actions.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button className="bg-emerald-600 hover:bg-emerald-700 text-white" />}>
            <Plus className="w-4 h-4 mr-2" /> Add Cookie
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-slate-900 border-slate-800 text-slate-100">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Cookie" : "Add New Cookie"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="label">Label Name</Label>
                <Input
                  id="label"
                  placeholder="e.g., Account_01"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="bg-slate-950 border-slate-800"
                  required
                />
              </div>

              {/* AgentRouter Cookies Section */}
              <div className="space-y-3 p-4 border border-slate-700 rounded-lg bg-slate-950/50">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">AgentRouter Cookies</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addAgentRouterEntry}
                    className="border-slate-700 hover:bg-slate-800 text-slate-300"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Cookie
                  </Button>
                </div>
                <div className="space-y-2">
                  {agentRouterEntries.map((entry, index) => (
                    <div key={`ar-${index}`} className="flex gap-2">
                      <Input
                        placeholder="Cookie name"
                        value={entry.name}
                        onChange={(e) => updateAgentRouterEntry(index, "name", e.target.value)}
                        className="bg-slate-950 border-slate-800 flex-1"
                        required={agentRouterEntries.length === 1}
                      />
                      <Input
                        placeholder="Cookie value"
                        value={entry.value}
                        onChange={(e) => updateAgentRouterEntry(index, "value", e.target.value)}
                        className="bg-slate-950 border-slate-800 flex-[2]"
                        required={agentRouterEntries.length === 1}
                      />
                      {agentRouterEntries.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAgentRouterEntry(index)}
                          className="text-slate-400 hover:text-red-400 hover:bg-red-400/10 h-10 w-10"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* GitHub Cookies Section */}
              <div className="space-y-3 p-4 border border-slate-700 rounded-lg bg-slate-950/50">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">GitHub Cookies</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addGithubEntry}
                    className="border-slate-700 hover:bg-slate-800 text-slate-300"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Cookie
                  </Button>
                </div>
                <div className="space-y-2">
                  {githubEntries.map((entry, index) => (
                    <div key={`gh-${index}`} className="flex gap-2">
                      <Input
                        placeholder="Cookie name"
                        value={entry.name}
                        onChange={(e) => updateGithubEntry(index, "name", e.target.value)}
                        className="bg-slate-950 border-slate-800 flex-1"
                        required={githubEntries.length === 1}
                      />
                      <Input
                        placeholder="Cookie value"
                        value={entry.value}
                        onChange={(e) => updateGithubEntry(index, "value", e.target.value)}
                        className="bg-slate-950 border-slate-800 flex-[2]"
                        required={githubEntries.length === 1}
                      />
                      {githubEntries.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeGithubEntry(index)}
                          className="text-slate-400 hover:text-red-400 hover:bg-red-400/10 h-10 w-10"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog} className="border-slate-700 hover:bg-slate-800">
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingId ? "Update" : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border border-slate-800 bg-slate-900 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-950/50">
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="w-[150px] text-slate-300">Label</TableHead>
              <TableHead className="text-slate-300">AgentRouter Cookies</TableHead>
              <TableHead className="text-slate-300">GitHub Cookies</TableHead>
              <TableHead className="w-[120px] text-slate-300 rounded-lg">Status</TableHead>
              <TableHead className="text-right text-slate-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow className="border-slate-800">
                <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                  Loading...
                </TableCell>
              </TableRow>
            ) : cookies.length === 0 ? (
              <TableRow className="border-slate-800 hover:bg-slate-800/50">
                <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                  No cookies found. Add your first set of credentials.
                </TableCell>
              </TableRow>
            ) : (
              cookies.map((cookie: any) => (
                <TableRow key={cookie.id} className="border-slate-800 hover:bg-slate-800/50 transition-colors">
                  <TableCell className="font-medium text-slate-200">{cookie.label}</TableCell>
                  <TableCell className="font-mono text-xs text-slate-400 truncate max-w-xs">
                    {cookie.agentRouterCookie ? cookie.agentRouterCookie.substring(0, 50) + "..." : "-"}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-400 truncate max-w-xs">
                    {cookie.githubCookie ? cookie.githubCookie.substring(0, 50) + "..." : "-"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={cookie.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 border-slate-700 bg-slate-800 hover:bg-slate-700"
                        onClick={() => validateMutation.mutate(cookie.id)}
                        disabled={validateMutation.isPending && validateMutation.variables === cookie.id}
                      >
                        {validateMutation.isPending && validateMutation.variables === cookie.id ? "Checking..." : "Verify"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10"
                        onClick={() => openEditDialog(cookie)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-400/10"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this cookie?")) {
                            deleteMutation.mutate(cookie.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
