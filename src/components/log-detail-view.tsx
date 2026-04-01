import { CheckCircle2, XCircle, Clock, ChevronRight, ChevronDown, Info, AlertTriangle, AlertCircle, Bug } from "lucide-react";
import { useState } from "react";

interface LogEntry {
  id: number;
  step: string;
  level: string;
  message: string;
  metadata?: string;
  timestamp: string;
}

interface LogDetail {
  id: number;
  actionType: string;
  status: string;
  executedAt: string;
  schedule?: { name: string };
  cookie?: { label: string };
  response?: string;
  entries: LogEntry[];
}

interface LogDetailViewProps {
  log: LogDetail;
}

export function LogDetailView({ log }: LogDetailViewProps) {
  const [expandedEntries, setExpandedEntries] = useState<Set<number>>(new Set());

  const toggleEntry = (id: number) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedEntries(newExpanded);
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "INFO":
        return <Info className="h-4 w-4 text-blue-400" />;
      case "WARN":
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case "ERROR":
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      case "DEBUG":
        return <Bug className="h-4 w-4 text-purple-400" />;
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "INFO":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "WARN":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "ERROR":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "DEBUG":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="space-y-6">
      {/* Log Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          {log.status === "SUCCESS" ? (
            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
          ) : log.status === "RUNNING" ? (
            <Clock className="h-6 w-6 text-blue-400 animate-pulse" />
          ) : (
            <XCircle className="h-6 w-6 text-red-400" />
          )}
          <div>
            <h3 className="text-xl font-bold text-foreground">
              {log.schedule?.name || "Manual Action"} - {log.actionType}
            </h3>
            <p className="text-sm text-muted-foreground">
              {new Date(log.executedAt).toLocaleString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/30 rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground mb-1">Cookie / Target</p>
            <p className="text-sm font-medium text-foreground">{log.cookie?.label || "Unknown"}</p>
          </div>
          <div className="bg-muted/30 rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground mb-1">Action Type</p>
            <p className="text-sm font-medium text-foreground">{log.actionType}</p>
          </div>
        </div>

        {log.response && (
          <div className="bg-muted/30 rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground mb-2">Final Response</p>
            <pre className="text-sm text-muted-foreground whitespace-pre-wrap break-all">{log.response}</pre>
          </div>
        )}
      </div>

      {/* Execution Log - GitLab Style */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="bg-muted/50 px-4 py-3 border-b border-border">
          <h4 className="text-sm font-semibold text-foreground">Execution Log</h4>
        </div>

        <div className="divide-y divide-border">
          {log.entries.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">
              No detailed log entries available for this execution.
            </div>
          ) : (
            log.entries.map((entry) => (
              <div key={entry.id} className="hover:bg-slate-900/50 transition-colors">
                <div
                  className="px-4 py-3 cursor-pointer flex items-start gap-3"
                  onClick={() => entry.metadata && toggleEntry(entry.id)}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {getLevelIcon(entry.level)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${getLevelBadge(entry.level)}`}>
                        {entry.level}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {new Date(entry.timestamp).toISOString()}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{entry.message}</p>
                    {entry.step && (
                      <p className="text-xs text-muted-foreground mt-1">{entry.step}</p>
                    )}
                  </div>
                  {entry.metadata && (
                    <div className="flex-shrink-0 mt-1">
                      {expandedEntries.has(entry.id) ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  )}
                </div>

                {/* Expandable Metadata */}
                {entry.metadata && expandedEntries.has(entry.id) && (
                  <div className="px-4 pb-3 ml-10 border-l-2 border-border">
                    <div className="bg-muted/50 rounded-lg p-3 border border-border">
                      <p className="text-xs text-muted-foreground mb-2">Details</p>
                      <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap break-all">
                        {entry.metadata}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
