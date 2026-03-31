"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit2, Play } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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

export default function SchedulerPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Form State
  const [name, setName] = useState("");
  const [cookieId, setCookieId] = useState("");
  const [time, setTime] = useState("");
  const [cronExpression, setCronExpression] = useState("");
  const [timeMode, setTimeMode] = useState<"time" | "cron">("time");
  const [type, setType] = useState("");

  const { data: schedules = [], isLoading: schedLoading } = useQuery({
    queryKey: ["schedules"],
    queryFn: async () => {
      const res = await fetch("/api/schedules");
      return res.json();
    },
  });

  const { data: cookies = [], isLoading: cookieLoading } = useQuery({
    queryKey: ["cookies"],
    queryFn: async () => {
      const res = await fetch("/api/cookies");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newSched: any) => {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSched),
      });
      if (!res.ok) throw new Error("Failed to create schedule");
      // Restart scheduler engine on background
      fetch("/api/scheduler/status", { method: "POST" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      toast.success("Schedule created successfully");
      closeDialog();
    },
    onError: () => toast.error("Failed to create schedule"),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/schedules/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update schedule");
      // Restart scheduler engine on background
      fetch("/api/scheduler/status", { method: "POST" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      toast.success("Schedule updated successfully");
      closeDialog();
    },
    onError: () => toast.error("Failed to update schedule"),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await fetch(`/api/schedules/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) throw new Error("Failed to update schedule state");
      // Restart scheduler engine on background
      fetch("/api/scheduler/status", { method: "POST" });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["schedules"] }),
    onError: () => toast.error("Failed to update schedule state"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/schedules/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete schedule");
      fetch("/api/scheduler/status", { method: "POST" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      toast.success("Schedule deleted");
    },
    onError: () => toast.error("Failed to delete schedule"),
  });

  const triggerMutation = useMutation({
    mutationFn: async (scheduleId: number) => {
      const res = await fetch("/api/scheduler/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduleId }),
      });
      if (!res.ok) throw new Error("Failed to trigger execution");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["cookies"] }); // Refresh statuses
      
      const allSuccess = data.results.every((r: any) => r.status === "SUCCESS");
      if (allSuccess) {
        toast.success("Manual execution successful!");
      } else {
        toast.error("Execution completed with some failures.");
      }
    },
    onError: () => toast.error("Failed to trigger schedule execution"),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const scheduleData = editingId
      ? { id: editingId, name, cookieId, type, time: timeMode === "time" ? time : cronExpression }
      : { name, cookieId, type, time: timeMode === "time" ? time : cronExpression };

    if (editingId) {
      updateMutation.mutate(scheduleData);
    } else {
      createMutation.mutate(scheduleData);
    }
  }

  function openEditDialog(sched: any) {
    setEditingId(sched.id);
    setName(sched.name);
    setCookieId(sched.cookieId.toString());
    setType(sched.type);

    // Detect if time is in cron format or HH:mm format
    const cronPattern = /^[0-9\-\*\/,]+\s+[0-9\-\*\/,]+\s+[0-9\-\*\/,]+\s+[0-9\-\*\/,]+\s+[0-9\-\*\/,]+$/;
    if (cronPattern.test(sched.time)) {
      setTimeMode("cron");
      setCronExpression(sched.time);
      setTime("");
    } else {
      setTimeMode("time");
      setTime(sched.time);
      setCronExpression("");
    }

    setIsDialogOpen(true);
  }

  function closeDialog() {
    setIsDialogOpen(false);
    setEditingId(null);
    setName("");
    setCookieId("");
    setTime("");
    setCronExpression("");
    setTimeMode("time");
    setType("");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Automation Schedules</h1>
          <p className="text-slate-400">Configure time-based triggers for login/logout actions.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button className="bg-indigo-600 hover:bg-indigo-700 text-white" />}>
            <Plus className="w-4 h-4 mr-2" /> Create Schedule
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-100">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Schedule" : "Create New Schedule"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Task Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Daily Morning Login"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-950 border-slate-800"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cookie">Associated Cookie / Credential</Label>
                <Select value={cookieId} onValueChange={(val) => setCookieId(val || "")} required disabled={cookieLoading}>
                  <SelectTrigger className="bg-slate-950 border-slate-800">
                    <SelectValue placeholder="Select a stored cookie" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                    {cookies.map((c: any) => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeMode">Time Format</Label>
                <Select value={timeMode} onValueChange={(val) => val && setTimeMode(val as "time" | "cron")}>
                  <SelectTrigger className="bg-slate-950 border-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                    <SelectItem value="time">Simple Time (HH:mm)</SelectItem>
                    <SelectItem value="cron">Cron Expression</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {timeMode === "time" ? (
                <div className="space-y-2">
                  <Label htmlFor="time">Time (HH:mm)</Label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="bg-slate-950 border-slate-800"
                    required
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="cronExpression">Cron Expression</Label>
                  <Input
                    id="cronExpression"
                    type="text"
                    placeholder="e.g., */5 * * * * (every 5 minutes)"
                    value={cronExpression}
                    onChange={(e) => setCronExpression(e.target.value)}
                    className="bg-slate-950 border-slate-800 font-mono text-sm"
                    required
                  />
                  <p className="text-xs text-slate-500">
                    Format: minute hour day month weekday (e.g., 0 9 * * * for 9:00 AM daily)
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Action Type</Label>
                  <Select value={type} onValueChange={(val) => setType(val || "")} required>
                    <SelectTrigger className="bg-slate-950 border-slate-800">
                      <SelectValue placeholder="Action" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                      <SelectItem value="LOGIN">Login Only</SelectItem>
                      <SelectItem value="LOGOUT">Logout Only</SelectItem>
                      <SelectItem value="LOGIN_THEN_LOGOUT">Login then Logout</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={closeDialog} className="border-slate-700 hover:bg-slate-800">
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingId ? "Update Schedule" : "Save Schedule"}
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
              <TableHead className="w-[80px] text-slate-300 text-center">Active</TableHead>
              <TableHead className="w-[200px] text-slate-300">Schedule Name</TableHead>
              <TableHead className="text-slate-300">Cookie/Target</TableHead>
              <TableHead className="w-[100px] text-slate-300">Time</TableHead>
              <TableHead className="w-[160px] text-slate-300">Action Type</TableHead>
              <TableHead className="text-right text-slate-300">Controls</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedLoading ? (
              <TableRow className="border-slate-800">
                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                  Loading schedules...
                </TableCell>
              </TableRow>
            ) : schedules.length === 0 ? (
              <TableRow className="border-slate-800 hover:bg-slate-800/50">
                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                  No schedules created yet.
                </TableCell>
              </TableRow>
            ) : (
              schedules.map((schedule: any) => (
                <TableRow key={schedule.id} className={`border-slate-800 hover:bg-slate-800/50 transition-colors ${!schedule.isActive ? 'opacity-50' : ''}`}>
                  <TableCell className="text-center">
                    <Switch
                      checked={schedule.isActive}
                      onCheckedChange={(checked) => toggleActiveMutation.mutate({ id: schedule.id, isActive: checked })}
                      className="data-[state=checked]:bg-emerald-500"
                    />
                  </TableCell>
                  <TableCell className="font-medium text-slate-200">{schedule.name}</TableCell>
                  <TableCell>
                    {schedule.cookie ? (
                      <Badge variant="outline" className="border-slate-700 bg-slate-800 text-slate-300">
                        {schedule.cookie.label}
                      </Badge>
                    ) : (
                      <span className="text-red-400 text-xs italic">Missing/Deleted Cookie</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-indigo-300 bg-indigo-950/30 rounded px-2">{schedule.time}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] bg-slate-950 border-slate-700 text-slate-400">
                      {schedule.type.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        title="Run Now"
                        variant="outline"
                        size="sm"
                        className="h-8 border-indigo-500/30 text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 hover:text-indigo-300"
                        onClick={() => triggerMutation.mutate(schedule.id)}
                        disabled={triggerMutation.isPending && triggerMutation.variables === schedule.id}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Run
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10"
                        onClick={() => openEditDialog(schedule)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-400/10"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this schedule?")) {
                            deleteMutation.mutate(schedule.id);
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
