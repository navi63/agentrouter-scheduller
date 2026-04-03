"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Edit2, CheckCircle, XCircle, Calendar, Shield, Crown } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "SUPER_ADMIN";
  emailVerified: boolean;
  createdAt: string;
  _count: {
    sessions: number;
    accounts: number;
  };
}

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("USER");

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, name, role }: { id: string; name: string; role: string }) => {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update user");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User updated successfully");
      closeDialog();
    },
    onError: (error: Error) => toast.error(error.message || "Failed to update user"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete user");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted successfully");
    },
    onError: (error: Error) => toast.error(error.message || "Failed to delete user"),
  });

  function handleEditUser(user: User) {
    setEditingUser(user);
    setUserName(user.name || "");
    setUserRole(user.role || "USER");
    setIsDialogOpen(true);
  }

  function handleUpdateUser(e: React.FormEvent) {
    e.preventDefault();
    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, name: userName, role: userRole });
    }
  }

  function handleDeleteUser(id: string, email: string) {
    if (confirm(`Are you sure you want to delete user ${email}?`)) {
      deleteMutation.mutate(id);
    }
  }

  function closeDialog() {
    setIsDialogOpen(false);
    setEditingUser(null);
    setUserName("");
    setUserRole("USER");
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground">Manage users registered with Better Auth.</p>
      </div>

      <div className="rounded-md border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-foreground font-semibold">User</TableHead>
              <TableHead className="text-foreground font-semibold">Email</TableHead>
              <TableHead className="text-foreground font-semibold">Role</TableHead>
              <TableHead className="text-foreground font-semibold">Email Verified</TableHead>
              <TableHead className="text-foreground font-semibold">Sessions</TableHead>
              <TableHead className="text-foreground font-semibold">Accounts</TableHead>
              <TableHead className="text-foreground font-semibold">Created</TableHead>
              <TableHead className="text-right text-foreground font-semibold rounded-lg">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow className="border-border">
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow className="border-border hover:bg-muted/50">
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} className="border-border hover:bg-muted/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        {user.role === "SUPER_ADMIN" ? (
                          <Crown className="h-5 w-5 text-amber-500" />
                        ) : (
                          <Shield className="h-5 w-5 text-emerald-500" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{user.name || "Unknown"}</div>
                        <div className="text-xs text-muted-foreground">ID: {user.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">{user.email}</TableCell>
                  <TableCell>
                    {user.role === "SUPER_ADMIN" ? (
                      <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/30">
                        <Crown className="h-3 w-3 mr-1" />
                        Super Admin
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/30">
                        <Shield className="h-3 w-3 mr-1" />
                        User
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.emailVerified ? (
                      <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20">
                        <XCircle className="h-3 w-3 mr-1" />
                        Unverified
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-foreground">{user._count.sessions}</TableCell>
                  <TableCell className="text-foreground">{user._count.accounts}</TableCell>
                  <TableCell className="text-foreground">
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {formatDate(user.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteUser(user.id, user.email)}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-popover border-border text-popover-foreground">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateUser} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Enter user name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="bg-background border-border"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (read-only)</Label>
              <Input
                id="email"
                value={editingUser?.email || ""}
                disabled
                className="bg-muted border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={userRole} onValueChange={(value) => setUserRole(value || "USER")}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-popover-foreground">
                  <SelectItem value="USER">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-500" />
                      User
                    </div>
                  </SelectItem>
                  <SelectItem value="SUPER_ADMIN">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-amber-500" />
                      Super Admin
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={closeDialog} className="border-border hover:bg-secondary">
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Updating..." : "Update User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
