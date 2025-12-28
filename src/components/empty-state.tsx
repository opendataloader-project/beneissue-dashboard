import { Database } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({
  title = "데이터가 없습니다",
  description = "아직 수집된 데이터가 없습니다. 이슈 처리가 시작되면 여기에 표시됩니다.",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6">
      <div className="p-4 rounded-full bg-muted/50 border border-border/50 mb-6">
        <Database className="w-12 h-12 text-muted-foreground" />
      </div>
      <h2
        className="text-xl font-semibold text-foreground mb-2"
        style={{ fontFamily: "'Instrument Sans', sans-serif" }}
      >
        {title}
      </h2>
      <p className="text-muted-foreground text-center max-w-md">
        {description}
      </p>
    </div>
  );
}
