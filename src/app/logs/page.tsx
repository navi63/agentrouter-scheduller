"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Search } from "lucide-react";

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

export default function LogsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const pageSize = 15;

  const { data, isLoading } = useQuery({
    queryKey: ["logs", page, statusFilter],
    queryFn: async () => {
      const res = await fetch(`/api/logs?page=${page}&pageSize=${pageSize}&status=${statusFilter}`);
      return res.json();
    },
    refetchInterval: 15000, // Refresh every 15s to see new logs
  });

  const logs = data?.logs || [];
  const totalPages = data?.totalPages || 1;

  function handleFilterChange(val: string) {
    setStatusFilter(val);
    setPage(1); // Reset to first page on filter change
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Execution Logs</h1>
          <p className="text-slate-400">View history of automated actions and API responses.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Select value={statusFilter} onValueChange={(val) => handleFilterChange(val || "ALL")}>
              <SelectTrigger className="w-[180px] pl-9 bg-slate-900 border-slate-800 text-slate-200">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                <SelectItem value="ALL">All Executions</SelectItem>
                <SelectItem value="SUCCESS" className="text-emerald-400">Success Only</SelectItem>
                <SelectItem value="FAILED" className="text-red-400">Failures Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-slate-800 bg-slate-900 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-950/50">
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="w-[180px] text-slate-300">Timestamp</TableHead>
                <TableHead className="w-[140px] text-slate-300">Status</TableHead>
                <TableHead className="w-[200px] text-slate-300">Schedule Name</TableHead>
                <TableHead className="w-[160px] text-slate-300">Cookie / Target</TableHead>
                <TableHead className="w-[120px] text-slate-300">Action</TableHead>
                <TableHead className="text-slate-300">Response / Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow className="border-slate-800">
                  <TableCell colSpan={6} className="h-[400px] text-center text-slate-500">
                    Loading execution logs...
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell colSpan={6} className="h-[400px] text-center text-slate-500">
                    No execution records found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log: any) => (
                  <TableRow key={log.id} className="border-slate-800 hover:bg-slate-800/50 transition-colors">
                    <TableCell className="text-slate-400 text-sm whitespace-nowrap">
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
                      ) : (
                        <Badge className="bg-red-500/10 text-red-400 hover:bg-red-500/20 shadow-none border-0">
                          <XCircle className="w-3 h-3 mr-1" /> Failed
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-slate-200 truncate max-w-[200px]" title={log.schedule?.name || "Manual Action"}>
                      {log.schedule?.name || <span className="text-slate-500 italic">Manual or Deleted</span>}
                    </TableCell>
                    <TableCell className="truncate max-w-[160px]" title={log.cookie?.label || "Unknown"}>
                      <span className="text-slate-300 bg-slate-800 px-2 py-1 rounded text-xs border border-slate-700">
                        {log.cookie?.label || "Unknown"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs font-mono font-bold tracking-wider rounded px-2 py-1 ${
                        log.actionType === 'LOGIN' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'
                      }`}>
                        {log.actionType}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-400 text-sm max-w-[300px] truncate" title={log.response || ""}>
                      {log.response || "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        <div className="border-t border-slate-800 bg-slate-950/30 p-4 flex items-center justify-between">
          <div className="text-sm text-slate-400">
            Showing <span className="font-medium text-slate-200">{logs.length}</span> records
            {data?.total ? ` of ${data.total} total` : ""}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-300 h-8"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Prev
            </Button>
            <span className="text-sm text-slate-400 px-4">
              Page {page} of {Math.max(1, totalPages)}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-300 h-8"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isLoading}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
