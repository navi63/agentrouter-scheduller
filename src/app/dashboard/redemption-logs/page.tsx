"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp } from "lucide-react";

export default function RedemptionLogsPage() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["redemption-logs"],
    queryFn: async () => {
      const res = await fetch("/api/redemption-logs");
      return res.json();
    },
  });

  const totalRedeemed = (logs || []).reduce((sum: number, log: any) => {
    const nominal = parseFloat(log.nominal?.replace(/[$,]/g, '') || '0');
    return sum + nominal;
  }, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Redemption Logs</h1>
        <p className="text-slate-400">Track balance increases and redemption history.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">Total Redeemed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ArrowUp className="h-5 w-5 text-emerald-500" />
              <span className="text-2xl font-bold">${totalRedeemed.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{logs.length}</span>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">Latest Redemption</CardTitle>
          </CardHeader>
          <CardContent>
            {logs.length > 0 ? (
              <div className="text-2xl font-bold text-emerald-500">
                {logs[0].nominal}
              </div>
            ) : (
              <span className="text-slate-500">-</span>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border border-slate-800 bg-slate-900 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-950/50">
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="text-slate-300">Date</TableHead>
              <TableHead className="text-slate-300">Account</TableHead>
              <TableHead className="text-slate-300">Nominal</TableHead>
              <TableHead className="text-slate-300">Previous Balance</TableHead>
              <TableHead className="text-slate-300">New Balance</TableHead>
              <TableHead className="text-slate-300 rounded-lg">Auditable Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow className="border-slate-800">
                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                  Loading...
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow className="border-slate-800 hover:bg-slate-800/50">
                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                  No redemption logs found yet.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log: any) => (
                <TableRow key={log.id} className="border-slate-800 hover:bg-slate-800/50 transition-colors">
                  <TableCell className="text-slate-300">
                    {format(new Date(log.createdAt), "MMM dd, yyyy HH:mm")}
                  </TableCell>
                  <TableCell className="font-medium text-slate-200">{log.cookie?.label || '-'}</TableCell>
                  <TableCell>
                    <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">
                      {log.nominal}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-300">{log.previousBalance}</TableCell>
                  <TableCell className="text-slate-300">{log.newBalance}</TableCell>
                  <TableCell>
                    <button
                      className="text-xs text-blue-400 hover:text-blue-300 hover:underline"
                      onClick={() => alert(log.auditableData)}
                    >
                      View Details
                    </button>
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
