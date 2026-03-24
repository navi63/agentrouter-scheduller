"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit2, CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  const [value, setValue] = useState("");

  const { data: cookies = [], isLoading } = useQuery({
    queryKey: ["cookies"],
    queryFn: async () => {
      const res = await fetch("/api/cookies");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newCookie: { label: string; value: string }) => {
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
    mutationFn: async (data: { id: number; label: string; value: string }) => {
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
      updateMutation.mutate({ id: editingId, label, value });
    } else {
      createMutation.mutate({ label, value });
    }
  }

  function openEditDialog(cookie: any) {
    setEditingId(cookie.id);
    setLabel(cookie.label);
    setValue(cookie.value);
    setIsDialogOpen(true);
  }

  function closeDialog() {
    setIsDialogOpen(false);
    setEditingId(null);
    setLabel("");
    setValue("");
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
          <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-100">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Cookie" : "Add New Cookie"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
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
              <div className="space-y-2">
                <Label htmlFor="value">Cookie String</Label>
                <Textarea
                  id="value"
                  placeholder="Paste the full cookie string here..."
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="h-32 bg-slate-950 border-slate-800 font-mono text-xs"
                  required
                />
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
              <TableHead className="w-[200px] text-slate-300">Label</TableHead>
              <TableHead className="text-slate-300">Cookie String</TableHead>
              <TableHead className="w-[120px] text-slate-300 rounded-lg">Status</TableHead>
              <TableHead className="text-right text-slate-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow className="border-slate-800">
                <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                  Loading...
                </TableCell>
              </TableRow>
            ) : cookies.length === 0 ? (
              <TableRow className="border-slate-800 hover:bg-slate-800/50">
                <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                  No cookies found. Add your first set of credentials.
                </TableCell>
              </TableRow>
            ) : (
              cookies.map((cookie: any) => (
                <TableRow key={cookie.id} className="border-slate-800 hover:bg-slate-800/50 transition-colors">
                  <TableCell className="font-medium text-slate-200">{cookie.label}</TableCell>
                  <TableCell className="font-mono text-xs text-slate-400 truncate max-w-xs">
                    {cookie.value.substring(0, 40)}...
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
