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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp } from "lucide-react";

interface RedemptionLog {
  id: number;
  nominal: string;
  previousBalance: string;
  newBalance: string;
  auditableData: string;
  createdAt: string;
  cookie?: {
    id: number;
    label: string;
  };
}

export default function RedemptionLogsPage() {
  const { data: logs = [], isLoading } = useQuery<RedemptionLog[]>({
    queryKey: ["redemption-logs"],
    queryFn: async () => {
      const res = await fetch("/api/redemption-logs");
      return res.json();
    },
  });

  const totalRedeemed = (logs || []).reduce((sum: number, log: RedemptionLog) => {
    const nominal = parseFloat(log.nominal?.replace(/[$,]/g, '') || '0');
    return sum + nominal;
  }, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Redemption Logs</h1>
        <p className="text-muted-foreground">Track balance increases and redemption history.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Redeemed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ArrowUp className="h-5 w-5 text-emerald-500" />
              <span className="text-2xl font-bold text-foreground">${totalRedeemed.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-foreground">{logs.length}</span>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Latest Redemption</CardTitle>
          </CardHeader>
          <CardContent>
            {logs.length > 0 ? (
              <div className="text-2xl font-bold text-emerald-500">
                {logs[0].nominal}
              </div>
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-foreground font-semibold">Date</TableHead>
              <TableHead className="text-foreground font-semibold">Account</TableHead>
              <TableHead className="text-foreground font-semibold">Nominal</TableHead>
              <TableHead className="text-foreground font-semibold">Previous Balance</TableHead>
              <TableHead className="text-foreground font-semibold">New Balance</TableHead>
              <TableHead className="text-foreground font-semibold rounded-lg">Auditable Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow className="border-border">
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow className="border-border hover:bg-muted/50">
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No redemption logs found yet.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log: RedemptionLog) => (
                <TableRow key={log.id} className="border-border hover:bg-muted/50 transition-colors">
                  <TableCell className="text-muted-foreground">
                    {format(new Date(log.createdAt), "MMM dd, yyyy HH:mm")}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{log.cookie?.label || '-'}</TableCell>
                  <TableCell>
                    <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">
                      {log.nominal}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{log.previousBalance}</TableCell>
                  <TableCell className="text-muted-foreground">{log.newBalance}</TableCell>
                  <TableCell>
                    <button
                      className="text-xs text-blue-500 hover:text-blue-600 hover:underline"
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
