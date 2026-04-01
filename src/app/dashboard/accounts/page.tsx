"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export default function AccountsPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [cookieId, setCookieId] = useState("");

  const { data: accounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const res = await fetch("/api/accounts");
      return res.json();
    },
  });

  const { data: cookies = [], isLoading: cookiesLoading } = useQuery({
    queryKey: ["cookies"],
    queryFn: async () => {
      const res = await fetch("/api/cookies");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newAccount: any) => {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAccount),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create account");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Account created successfully");
      closeDialog();
    },
    onError: (error) => toast.error(error.message || "Failed to create account"),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/accounts/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update account");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Account updated successfully");
      closeDialog();
    },
    onError: (error) => toast.error(error.message || "Failed to update account"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/accounts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete account");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Account deleted");
    },
    onError: () => toast.error("Failed to delete account"),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, username, name, cookieId: parseInt(cookieId) });
    } else {
      createMutation.mutate({ username, name, cookieId: parseInt(cookieId) });
    }
  }

  function openEditDialog(account: any) {
    setEditingId(account.id);
    setUsername(account.username);
    setName(account.name);
    setCookieId(account.cookieId.toString());
    setIsDialogOpen(true);
  }

  function closeDialog() {
    setIsDialogOpen(false);
    setEditingId(null);
    setUsername("");
    setName("");
    setCookieId("");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Accounts</h1>
          <p className="text-muted-foreground">Manage account information linked to cookies.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button className="bg-indigo-600 hover:bg-indigo-700 text-white" />}>
            <Plus className="w-4 h-4 mr-2" /> Create Account
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-popover border-border text-popover-foreground">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Account" : "Create New Account"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-background border-border"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background border-border"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cookie">Associated Cookie</Label>
                <Select value={cookieId} onValueChange={(val) => setCookieId(val || "")} required disabled={cookiesLoading}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Select a stored cookie" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    {cookies.map((c: any) => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={closeDialog} className="border-border hover:bg-secondary">
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingId ? "Update Account" : "Save Account"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-[150px] text-foreground font-semibold">Username</TableHead>
              <TableHead className="text-foreground font-semibold">Name</TableHead>
              <TableHead className="text-foreground font-semibold">Cookie</TableHead>
              <TableHead className="text-foreground font-semibold">Status</TableHead>
              <TableHead className="text-right text-foreground font-semibold rounded-lg">Controls</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accountsLoading ? (
              <TableRow className="border-border">
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Loading accounts...
                </TableCell>
              </TableRow>
            ) : accounts.length === 0 ? (
              <TableRow className="border-border hover:bg-muted/50">
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No accounts created yet.
                </TableCell>
              </TableRow>
            ) : (
              accounts.map((account: any) => (
                <TableRow key={account.id} className="border-border hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium text-foreground">{account.username}</TableCell>
                  <TableCell className="text-foreground">{account.name}</TableCell>
                  <TableCell>
                    {account.cookie ? (
                      <Badge variant="outline" className="border-border bg-muted text-muted-foreground">
                        {account.cookie.label}
                      </Badge>
                    ) : (
                      <span className="text-destructive text-xs italic">Missing/Deleted Cookie</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {account.cookie ? (
                      account.cookie.status === "ACTIVE" ? (
                        <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">Active</Badge>
                      ) : account.cookie.status === "EXPIRED" ? (
                        <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20">Expired</Badge>
                      ) : (
                        <Badge className="bg-muted text-muted-foreground hover:bg-muted/80">Unknown</Badge>
                      )
                    ) : (
                      <Badge className="bg-muted text-muted-foreground hover:bg-muted/80">Unknown</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary"
                        onClick={() => openEditDialog(account)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this account?")) {
                            deleteMutation.mutate(account.id);
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
