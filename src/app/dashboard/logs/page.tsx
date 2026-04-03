"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Search, Eye, X } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LogDetailView } from "@/components/log-detail-view";

interface Log {
  id: number;
  executedAt: string;
  status: "SUCCESS" | "FAILED" | "RUNNING";
  actionType: "LOGIN" | "LOGOUT";
  response: string;
  schedule?: {
    id: number;
    name: string;
  };
  cookie?: {
    id: number;
    label: string;
  };
}

interface LogsResponse {
  logs: Log[];
  totalPages: number;
  total: number;
}

export default function LogsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedLogId, setSelectedLogId] = useState<number | null>(null);
  const pageSize = 15;

  const { data, isLoading } = useQuery<LogsResponse>({
    queryKey: ["logs", page, statusFilter],
    queryFn: async () => {
      const res = await fetch(`/api/logs?page=${page}&pageSize=${pageSize}&status=${statusFilter}`);
      return res.json();
    },
    refetchInterval: 15000,
  });

  const { data: detailData, isLoading: isLoadingDetail } = useQuery<Log>({
    queryKey: ["log-detail", selectedLogId],
    queryFn: async () => {
      if (!selectedLogId) return null;
      const res = await fetch(`/api/logs/${selectedLogId}`);
      return res.json();
    },
    enabled: !!selectedLogId,
  });

  const logs = data?.logs || [];
  const totalPages = data?.totalPages || 1;

  function handleFilterChange(val: string) {
    setStatusFilter(val);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Execution Logs</h1>
          <p className="text-muted-foreground">View history of automated actions and API responses.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={(val) => handleFilterChange(val || "ALL")}>
              <SelectTrigger className="w-[180px] pl-9 bg-background border-border text-foreground">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-popover-foreground">
                <SelectItem value="ALL">All Executions</SelectItem>
                <SelectItem value="SUCCESS" className="text-emerald-500">Success Only</SelectItem>
                <SelectItem value="FAILED" className="text-destructive">Failures Only</SelectItem>
                <SelectItem value="RUNNING" className="text-blue-500">Running Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-border bg-card overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-[180px] text-foreground font-semibold">Timestamp</TableHead>
                <TableHead className="w-[140px] text-foreground font-semibold">Status</TableHead>
                <TableHead className="w-[200px] text-foreground font-semibold">Schedule Name</TableHead>
                <TableHead className="w-[160px] text-foreground font-semibold">Cookie / Target</TableHead>
                <TableHead className="w-[120px] text-foreground font-semibold">Action</TableHead>
                <TableHead className="text-foreground font-semibold">Response / Error</TableHead>
                <TableHead className="w-[100px] text-foreground font-semibold rounded-lg">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow className="border-border">
                  <TableCell colSpan={7} className="h-[400px] text-center text-muted-foreground">
                    Loading execution logs...
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow className="border-border hover:bg-muted/50">
                  <TableCell colSpan={7} className="h-[400px] text-center text-muted-foreground">
                    No execution records found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} className="border-border hover:bg-muted/50 transition-colors">
                    <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                      {new Date(log.executedAt).toLocaleString(undefined, {
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit', second: '2-digit'
                      })}
                    </TableCell>
                    <TableCell>
                      {log.status === "SUCCESS" ? (
                        <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 shadow-none border-0">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Success
                        </Badge>
                      ) : log.status === "RUNNING" ? (
                        <Badge className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 shadow-none border-0">
                          <CheckCircle2 className="w-3 h-3 mr-1 animate-pulse" /> Running
                        </Badge>
                      ) : (
                        <Badge className="bg-red-500/10 text-red-400 hover:bg-red-500/20 shadow-none border-0">
                          <XCircle className="w-3 h-3 mr-1" /> Failed
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-foreground truncate max-w-[200px]" title={log.schedule?.name || "Manual Action"}>
                      {log.schedule?.name || <span className="text-muted-foreground italic">Manual or Deleted</span>}
                    </TableCell>
                    <TableCell className="truncate max-w-[160px]" title={log.cookie?.label || "Unknown"}>
                      <span className="text-muted-foreground bg-muted px-2 py-1 rounded text-xs border border-border">
                        {log.cookie?.label || "Unknown"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs font-mono font-bold tracking-wider rounded px-2 py-1 ${log.actionType === 'LOGIN' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'
                        }`}>
                        {log.actionType}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm max-w-[300px] truncate" title={log.response || ""}>
                      {log.response || "-"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-secondary"
                        onClick={() => setSelectedLogId(log.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="border-t border-border bg-muted/20 p-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{logs.length}</span> records
            {data?.total ? ` of ${data.total} total` : ""}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-background border-border hover:bg-secondary text-foreground h-8"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Prev
            </Button>
            <span className="text-sm text-muted-foreground px-4">
              Page {page} of {Math.max(1, totalPages)}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="bg-background border-border hover:bg-secondary text-foreground h-8"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isLoading}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Log Detail Dialog */}
      <Dialog open={!!selectedLogId} onOpenChange={() => setSelectedLogId(null)}>
        <DialogContent className="!max-w-[90vw] !w-[90vw] max-h-[95vh] overflow-y-auto bg-popover border-border text-popover-foreground shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Log Details</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => setSelectedLogId(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          {isLoadingDetail ? (
            <div className="py-12 text-center text-muted-foreground">Loading detailed logs...</div>
          ) : detailData ? (
            <LogDetailView log={detailData} />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
